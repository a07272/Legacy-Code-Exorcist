# 🏥 Legacy-Code-Exorcist: 手術刀具組 (Skills)

## 🔍 [/map] 見龍在田 - 全域語義導航
- **功能**：掃描當前 Workspace 的模組依賴。
- **輸出**：Mermaid.js 圖譜。
- **邏輯**：追蹤 `import/export` 與 `dependency injection`，標註「高耦合危險區」。

## 💀 [/autopsy] 亢龍有悔 - 逆向驗屍
- **功能**：根據 Log 或截圖定位崩潰根因。
- **邏輯**：執行「反向路徑追蹤」，模擬報錯發生時的記憶體狀態。

## 🧪 [/trace_data] 潛龍勿用 - 數據追蹤
- **功能**：追蹤特定變數的生命週期。
- **邏輯**：找出所有「隱性修改點」，預防併發症 (Race Conditions)。