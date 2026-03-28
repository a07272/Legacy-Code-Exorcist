const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { OpenAI } = require('openai');
const chalk = require('chalk');
const player = require('play-sound')();

const rootDir = path.resolve(__dirname, '..');

function getBase64Image(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
    const base64Data = fs.readFileSync(filePath, { encoding: 'base64' });
    return `data:${mimeType};base64,${base64Data}`;
}

async function main() {
    const skinName = process.argv[2];
    const caseName = process.argv[3];
    const playAudio = process.argv.includes('--audio');

    if (!skinName || !caseName) {
        console.error(chalk.red('\n[錯誤] 參數不足！'));
        console.error(chalk.yellow('用法: npm run test:persona <Skin名稱> <案例名稱或資料夾> [--audio]'));
        process.exit(1);
    }

    const skinBasename = skinName.endsWith('.md') ? skinName : `${skinName}.md`;
    const skinPath = fs.existsSync(path.join(rootDir, 'Skins', skinBasename)) 
        ? path.join(rootDir, 'Skins', skinBasename) 
        : path.join(rootDir, 'skins', skinBasename);

    if (!fs.existsSync(skinPath)) {
        console.error(chalk.red(`[錯誤] 找不到 Persona 設定檔: ${skinBasename}`));
        process.exit(1);
    }

    const isEnglish = skinName.includes('.en');
    const coreAgntPath = path.join(rootDir, 'prompts', isEnglish ? 'core-agent.en.md' : 'core-agent.md');
    
    // 初始化 Case Payload
    let userMessageContent = [];

    // 判斷 casePath 是資料夾還是單一檔案
    let casePath = path.join(rootDir, 'cases', caseName);
    if (!fs.existsSync(casePath) && fs.existsSync(casePath + '.js')) {
        casePath += '.js';
    }

    if (!fs.existsSync(casePath)) {
        console.error(chalk.red(`[錯誤] 找不到測試案例: ${caseName}`));
        process.exit(1);
    }

    const stats = fs.statSync(casePath);
    if (stats.isDirectory()) {
        console.log(chalk.cyan(`[📁 屍檢案例] 偵測到通靈除錯模式 (多模態資料夾): ${chalk.bold(caseName)}`));
        // 讀取資料夾內的檔案
        const ticketPath = path.join(casePath, 'ticket.txt');
        const sourceJsPath = path.join(casePath, 'source.js');
        const imgPngPath = path.join(casePath, 'screenshot.png');
        const imgJpgPath = path.join(casePath, 'screenshot.jpg');

        let textPrompt = isEnglish 
            ? `Please perform a reverse autopsy diagnosis (/autopsy). This is a 'Vague Bug Triage' case.\n\n`
            : `請幫我執行逆向驗屍診斷 (/autopsy)。這是一件「通靈式除錯」案件。\n\n`;

        if (fs.existsSync(ticketPath)) {
            textPrompt += isEnglish 
                ? `[Customer Complaint]\n${fs.readFileSync(ticketPath, 'utf8')}\n\n`
                : `【客訴/模糊回報】\n${fs.readFileSync(ticketPath, 'utf8')}\n\n`;
        }
        if (fs.existsSync(sourceJsPath)) {
            textPrompt += isEnglish 
                ? `[Involved Source Code]\n\`\`\`javascript\n${fs.readFileSync(sourceJsPath, 'utf8')}\n\`\`\`\n`
                : `【涉案的原始碼】\n\`\`\`javascript\n${fs.readFileSync(sourceJsPath, 'utf8')}\n\`\`\`\n`;
        }
        
        userMessageContent.push({ type: "text", text: textPrompt });

        let imageFound = false;
        if (fs.existsSync(imgPngPath)) {
             userMessageContent.push({ type: "image_url", image_url: { url: getBase64Image(imgPngPath) } });
             imageFound = true;
        } else if (fs.existsSync(imgJpgPath)) {
             userMessageContent.push({ type: "image_url", image_url: { url: getBase64Image(imgJpgPath) } });
             imageFound = true;
        }

        if (imageFound) {
            console.log(chalk.cyan(`[🖼️ 視覺證據] 成功載入報錯截圖`));
        }

    } else {
        console.log(chalk.cyan(`[📄 屍檢案例] 單一檔案模式: ${chalk.bold(path.basename(casePath))}`));
        const caseContent = fs.readFileSync(casePath, 'utf8');
        userMessageContent.push({ 
            type: "text", 
            text: isEnglish 
                ? `Please perform a reverse autopsy diagnosis (/autopsy). Here is a piece of Legacy Code with an unknown cause of death:\n\n\`\`\`javascript\n${caseContent}\n\`\`\``
                : `請幫我執行逆向驗屍診斷 (/autopsy)。這是一份死因不明的 Legacy Code：\n\n\`\`\`javascript\n${caseContent}\n\`\`\`` 
        });
    }

    // 讀取 Prompt
    const skinContent = fs.readFileSync(skinPath, 'utf8');
    let coreContext = fs.existsSync(coreAgntPath) ? fs.readFileSync(coreAgntPath, 'utf8') : '';

    // 初始化 OpenAI Client
    const apiKey = process.env.OPENAI_API_KEY || 'local-dummy-key';
    if (!process.env.OPENAI_API_KEY && !process.env.OPENAI_BASE_URL) {
        console.error(chalk.red('[錯誤] 找不到 .env 中的 API key 設定！'));
        process.exit(1);
    }

    const openai = new OpenAI({ apiKey: apiKey, baseURL: process.env.OPENAI_BASE_URL || undefined });
    const modelName = process.env.DEFAULT_MODEL || 'gpt-4o-mini';

    console.log(chalk.gray('--------------------------------------------------'));
    console.log(chalk.yellow(`[🧠 思考中] 正在呼叫 LLM (${modelName}) 進行解剖...\n`));

    // Audio Playback Logic
    let audioProcess = null;
    if (playAudio) {
        const bgmDir = path.join(rootDir, 'assets', 'bgm');
        const mp3Path = path.join(bgmDir, `${skinName.replace('.md', '')}.mp3`);
        const wavPath = path.join(bgmDir, `${skinName.replace('.md', '')}.wav`);
        
        let targetAudio = null;
        if (fs.existsSync(mp3Path)) targetAudio = mp3Path;
        else if (fs.existsSync(wavPath)) targetAudio = wavPath;

        if (targetAudio) {
            console.log(chalk.magenta(`[🎵 BGM 播放中] ${path.basename(targetAudio)}`));
            audioProcess = player.play(targetAudio, function(err) {
                if (err && !err.killed) console.error(chalk.red(`[音效播放錯誤] ${err}`));
            });
        } else {
            console.log(chalk.magenta(`[🎵 BGM] 未找到專屬音檔，請將 MP3 放入 assets/bgm/${skinName.replace('.md', '')}.mp3`));
        }
    }

    try {
        const systemPromptStr = isEnglish
            ? `You are the Legacy-Code-Exorcist. Core Directives:\n${coreContext}\n\nYour Persona Configuration:\n${skinContent}\n\nYour task is to diagnose the provided legacy code (and possible screenshots) based STRICTLY on your persona. You MUST reply in English. Exhibit strong personal character traits! Do not provide boring, lengthy explanations. If doing visual debugging, use your forensic OCR vision.`
            : `你是 Legacy-Code-Exorcist。核心指導原則：\n${coreContext}\n\n你的專屬人格設定：\n${skinContent}\n\n你的任務是根據「人格設定」，對使用者提供的過時/糟糕原始碼（與可能的錯誤截圖）進行診斷。請表現出該人格強烈的個人色彩！不要提供冗長而平淡的解釋。如果是通靈除錯，請發揮視覺取證的能力。`;

        const response = await openai.chat.completions.create({
            model: modelName,
            messages: [
                {
                    role: 'system',
                    content: systemPromptStr
                },
                {
                    role: 'user',
                    content: userMessageContent
                }
            ],
            temperature: 0.8,
            max_tokens: 1500, // 增加 token 上限以防被截斷
        });

        const reply = response.choices[0].message.content;
        console.log(chalk.green(reply));

    } catch (err) {
        console.error(chalk.red(`[連線錯誤] 呼叫 API 發生錯誤：${err.message}`));
    } finally {
        // AI 回應完畢，停止音樂
        if (audioProcess) {
            audioProcess.kill();
        }
    }
    
    console.log(chalk.gray('\n--------------------------------------------------'));
    console.log(chalk.cyan('[✅ 驗證結束]'));
}

main();
