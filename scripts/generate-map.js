const fs = require('fs');
const path = require('path');

/**
 * Legacy-Code-Exorcist: 本地骨架掃描器
 * 任務：在 AI 介入前，先產出專案的「神經導航圖」。
 */

const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', '.next'];
const EXTENSIONS = ['.ts', '.js', '.tsx', '.jsx', '.py', '.java'];

function scanDirectory(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        scanDirectory(filePath, fileList);
      }
    } else {
      if (EXTENSIONS.includes(path.extname(file))) {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
}

function extractDependencies(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  // 簡易的正則表達式，抓取 import 語句
  const importRegex = /import\s+.*\s+from\s+['"](.*)['"]/g;
  const requireRegex = /require\(['"](.*)['"]\)/g;
  const deps = [];
  let match;

  while ((match = importRegex.exec(content)) !== null) deps.push(match[1]);
  while ((match = requireRegex.exec(content)) !== null) deps.push(match[1]);

  return {
    path: path.relative(process.cwd(), filePath),
    size: content.length,
    dependencies: deps
  };
}

const targetDir = process.argv[2] || '.';
console.log(`[🩺 診斷中...] 正在掃描目錄: ${targetDir}`);

const allFiles = scanDirectory(targetDir);
const report = allFiles.map(file => extractDependencies(file));

const output = {
  project_name: path.basename(process.cwd()),
  scan_time: new Date().toISOString(),
  files_count: report.length,
  skeleton: report
};

fs.writeFileSync('skeleton-report.json', JSON.stringify(output, null, 2));
console.log(`[✅ 手術預備完成] 已產出 skeleton-report.json。請將此檔案餵給 AI 法醫進行驗屍。`);