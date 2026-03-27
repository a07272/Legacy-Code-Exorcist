
「進來這裡的代碼，只有兩種結局：被我醫好，或是被我剖開。」

本專案是一個專為「AI 開發重度依賴者」與「老舊系統受害者」設計的 Roo-code 增強套件。我們拆解了頂級 AI 探測工具的引擎，將其重構成一套通用的、具備人格魅力的數位法醫系統。

🩺 診斷清單 (Features)
[見龍在田] 全域語義導航：不再迷失在資料夾迷宮。一鍵生成 Mermaid.js 圖譜，讓代碼邏輯「現形」。

[亢龍有悔] 逆向驗屍報告：根據截圖或 Log，執行歸謬法推演。我們不猜 Bug 在哪，我們證明它為什麼在那。

[超跑底盤] 模型無差別相容：不論你用的是貴公子 Claude 還是親民派 Gemini/DeepSeek，這套秘笈都能運轉。

🗂️ 診間配置 (Project Structure)
Skills/: [手術刀] 存放各式各樣的 .skill.md 指令集。

Skins/: [護理師外殼] * Default-Forensic.md: 專業冷靜的法醫（標準版）。

Tsundere-Maid.md: 傲嬌女僕（專治懶散工程師）。

Overbearing-CEO.md: 霸道總裁（強制重構你的屎山）。

Chassis/: [通用底盤] 適用於各家 IDE (Roo-code/Cursor/IDX) 的配置文件。

🛠️ 加載指南 (Quick Start)
認領診間：git clone 本倉庫。

植入晶片：將 .roomodes 內容複製到你的專案根目錄。

選擇人格：在 Roo-code 設定中掛載你喜歡的 Skins。

開始手術：在對話框輸入 /map 或 /autopsy。

🛠️ 診所專用工具：scripts/exorcist-scanner.js
📖 如何使用這把「手術刀」？
安裝依賴：這不需要任何外部庫，純 Node.js 環境即可。

執行掃描：

Bash
node scripts/exorcist-scanner.js
群毆對話：
掃描完後，直接對著 Roo-code 或我說：

「法醫，這是 skeleton-report.json。根據這份骨架，幫我找出這個專案最脆弱的耦合點，並畫出 Mermaid 圖！」

「診斷流程圖」

graph TD
    A[收到屍體/Bug] --> B{執行 /map}
    B --> C[產出全域圖譜]
    C --> D[執行 /autopsy 逆向驗屍]
    D --> E[產出診斷報告與 BGM]
    E --> F[執行 /refactor_check 影響評估]
    F --> G[執行 /refactor 零傷重構]


⚠️ 術後警語 (Disclaimer)
本工具產出之診斷報告可能包含：

對前輩代碼的毒辣吐槽。

讓工程師對 AI 產生不可自拔的共伴依戀。

突然響起的背景音樂 (BGM) 幻覺。

「貢獻指南」，鼓勵同好們貢獻更多的 Skins（例如：霸道總裁、冷面教官）。
