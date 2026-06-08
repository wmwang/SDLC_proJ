# 技術設計：PRR 流程整合至 fopd-sdlc 開發流程

本設計文件說明如何將「生產環境準備就緒審查（Production Readiness Review, 簡稱 PRR）」文件整合至現有的 `fopd-sdlc` 流程中，使其在開發後期的 `retrospective` 階段自動產生。

---

## 1. 背景 (Background)

為確保開發項目上到生產環境（Production）前的穩定性與安全性，部門要求每個開發項目在發布前都必須備妥一份 PRR 文件（參考 [Production_Readiness_Review_Template.md](file:///Users/isosoman/Documents/repo/wstree/Production_Readiness_Review_Template.md)）。

為了降低開發人員的文書負擔，並確保文件內容能精確反映設計與測試狀態，我們計劃將此文件整合至 OpenSpec 的 [fopd-sdlc schema](file:///Users/isosoman/Documents/repo/wstree/openspec/schemas/fopd-sdlc/schema.yaml) 流程中，在 `retrospective`（回顧）階段由 AI 依據既有的開發工件（Proposal、Design、Plan、測試結果）自動生成。

---

## 2. 目標與非目標 (Goals & Non-Goals)

### 目標
* **自動生成 PRR**：在 `retrospective` 階段，與 `retrospective.md` 同步產生 `production-readiness-review.md`。
* **最大化自動填充**：AI 自動從 `proposal.md`、`design.md`、`plan.md` 提取相關資訊（如變更概覽、架構影響、Canary 部署比例、退版計畫等），並自動根據異動的組件推薦 Golden Signals 監控指標。
* **未知資訊的提醒機制**：對於開發階段無法確定的資訊（如 DBA 審核簽章、PR 審批連結、實際部署觀察日期等），AI 不得捏造，必須留空或以 `[ ] TODO: 待補充` 或 `[ ] 待人工確認` 的核取方塊形式提醒開發者在上線前手動補齊。

### 非目標
* **即時部署狀態同步**：本流程不包含自動向雲端監控系統或 CI/CD 平台抓取實時發布數據。

---

## 3. 方案決策 (Design Decisions)

在方案評估中，我們比較了在 `apply` 階段、`retrospective` 階段或獨立成一個全新 `prr` 階段的優缺點。最終選擇了**在 `retrospective` 階段同步產生**（方案 B），理由如下：
1. **職責高內聚**：`apply` 階段專注於代碼撰寫與測試通過；而實作後的所有總結與評估（對內檢討、對外上線審查）都集中於 `retrospective` 階段，使流程邏輯更為清晰。
2. **資料共享度高**：PRR 所需的測試結果、Git commit 鏈等資訊與 `retrospective` 的數據重疊度高，AI 可一次性收集並生成，避免重複的檔案讀取與工具調用。

---

## 4. 具體實作計畫 (Implementation Details)

### 4.1 建立模板文件 [prr.md](file:///Users/isosoman/Documents/repo/wstree/openspec/schemas/fopd-sdlc/templates/prr.md)
在 `openspec/schemas/fopd-sdlc/templates/` 目錄下建立模板，內容保留原本的表格結構與檢核清單，並使用預留佔位符引導 AI 填充。

### 4.2 修改 [schema.yaml](file:///Users/isosoman/Documents/repo/wstree/openspec/schemas/fopd-sdlc/schema.yaml) 的 `retrospective` 區段
我們將修改 `retrospective` 的定義，以支持雙檔案生成：

```yaml
  - id: retrospective
    generates: "{retrospective.md,production-readiness-review.md}"
    description: >
      實作後的回顧與生產環境準備度評估。
      產生 retrospective.md 記錄成果與缺失，並產生 production-readiness-review.md 做為上線前的維運審核依據。
      PRECHECK：commit count > 0 且 plan.md 中有已勾選的任務（`- [x]`）。
    template: retrospective.md
```

在 `instruction` 內，我們將加入詳細的 AI 指引：

1. **檔案建立**：
   * 讀取 `templates/prr.md`，並在變更目錄中產生 `production-readiness-review.md`。
2. **自動填充規則與來源**：
   * **產品名稱**：從 `proposal.md` 提取或預留空白。
   * **發布版本**：從本地 Git 分支名稱（例如 `release/v2.5.0`）或相關 PR 資訊中嘗試提取，若無則留空並提示。
   * **核心功能**：從 `proposal.md` 的「變更內容」段落自動精煉。
   * **受影響的模組化架構**：從 `proposal.md` 的「影響範圍」與 `design.md` 提取。
   * **外部相關性變更**：從 `design.md` 提取涉及的外接系統或 API 異動。
   * **部署策略與退版計畫**：從 `design.md` 的「遷移計畫與回滾策略」段落提取對應的表格。
   * **系統觀測與異常回應**：若本次變更涉及資料庫、快取（Redis）、外部 API Gateway 等，應自動在 Golden Signals 監控表格中保留並強調對應組件的指標；若無，則保持預設模板配置。
   * **測試覆蓋與品質保證**：從 `plan.md` 中提取測試案例的狀態，並將已成功通過的測試情境對應填入。
3. **未知與動態資訊的處理原則（重要）**：
   * 對於無法從現有 OpenSpec 檔案中自動獲取、或是需要人工審批的項目（例如：`PR Review 審批` 連結、`DB Migration 審核` 截圖/Ticket、`Canary 觀察日期`、`維運手冊連結` 等），AI **絕對不得捏造資料**。
   * 必須將狀態設為 `[ ] TODO: 待手動補充` 或 `[ ] 待人工確認`，並在佐證資料欄位保留引導文字（例如：`[請提供相關 Pull Request 連結]`）。

---

## 5. 測試與驗證計畫 (Test Plan)

在實作修改後，我們將透過以下步驟進行驗證：
1. **Schema 語法驗證**：確保修改後的 `schema.yaml` 符合 YAML 語法。
2. **模擬執行產出**：建立一個測試變更（Test Change），依序執行 `proposal` -> `specs` -> `design` -> `plan` -> `verify` -> `apply` -> `retrospective`。
3. **產出文件校對**：檢查產出的 `production-readiness-review.md` 是否：
   * 成功自動填充了來自 `proposal.md` 和 `design.md` 的部署與回滾計畫。
   * 正確地在未知欄位保留了 `[ ] TODO` 狀態與人工填寫提示，而沒有隨意生成假資料。
