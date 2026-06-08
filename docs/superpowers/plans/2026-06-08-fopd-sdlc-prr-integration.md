# fopd-sdlc PRR 整合實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 將生產環境準備就緒審查（PRR）文件整合進 `fopd-sdlc` 流程的 `retrospective` 階段，並自動生成 `production-readiness-review.md`。

**Architecture:** 在 `fopd-sdlc` 的 `templates/` 下建立 `prr.md` 模板。修改 `schema.yaml` 中的 `retrospective` artifact，將 generates 改為 `{retrospective.md,production-readiness-review.md}`，並在 instruction 中加入詳細的 AI 生成與欄位填充指引。

**Tech Stack:** YAML, Markdown, OpenSpec CLI

---

### Task 1: 建立 PRR 模板文件

**Files:**
- Create: `openspec/schemas/fopd-sdlc/templates/prr.md`

- [ ] **Step 1: 將 Production_Readiness_Review_Template.md 拷貝至 templates 目錄**

  在專案中建立 `openspec/schemas/fopd-sdlc/templates/prr.md`，並將 `Production_Readiness_Review_Template.md` 的完整內容複製進去。

- [ ] **Step 2: 驗證檔案建立狀態**

  執行指令驗證該模板檔案是否存在：
  Run: `ls -la openspec/schemas/fopd-sdlc/templates/prr.md`
  Expected: 顯示檔案資訊且大小與 `Production_Readiness_Review_Template.md` 相同。

- [ ] **Step 3: Commit**

  ```bash
  git add openspec/schemas/fopd-sdlc/templates/prr.md
  git commit -m "templates: add production readiness review template (prr.md)"
  ```

---

### Task 2: 修改 schema.yaml 的 retrospective 區段

**Files:**
- Modify: `openspec/schemas/fopd-sdlc/schema.yaml:237-280`

- [ ] **Step 1: 修改 schema.yaml 的 retrospective 定義**

  尋找 `schema.yaml` 中 `id: retrospective` 的區段，進行以下替換：

  ```yaml
    - id: retrospective
      generates: "{retrospective.md,production-readiness-review.md}"
      description: >
        實作後的回顧與生產環境準備度評估（PRR）。
        產生 retrospective.md 記錄成果與缺失，並產生 production-readiness-review.md 做為上線前的維運審核依據。
        PRECHECK：commit count > 0 且 plan.md 中有已勾選的任務（`- [x]`）。
      template: retrospective.md
      instruction: |
        PRECHECK — 在撰寫回顧之前，確認以下條件：
        1. `git log` 顯示至少一個新的 commit（apply 階段產生的）
        2. plan.md 中至少有一個 `- [x]` 已勾選的任務
        如果 PRECHECK 未通過，停止並告知使用者必須先完成實作。

        在此階段，你必須同時產生回顧文件 retrospective.md 與生產環境準備度評估 production-readiness-review.md。

        【第一部分：產出 retrospective.md】
        使用 template（`openspec/schemas/fopd-sdlc/templates/retrospective.md`）作為結構框架，填入以下內容：
        1. 證據（§0）：列出 commit 鏈、diff 規模、已勾選任務數與測試覆蓋率。
        2. 成果（§1）：列出本次實作的成功之處與證據引用。
        3. 缺失（§2）：記錄阻擋性、痛點與小問題。
        4. 計畫偏差（§3）：記錄與 plan.md 相比的偏差及原因。
        5. 合規性（§4）：檢查必要技能是否有使用，若跳過需說明。
        6. PR 評估自評（§5）：依據設計先行、測試覆蓋、程式品質與可追溯性自評。
        7. 意外發現（§6）與長期學習候選（§7）。

        【第二部分：產出 production-readiness-review.md】
        讀取範本（`openspec/schemas/fopd-sdlc/templates/prr.md`），填入以下欄位，生成上線前的審核文件：
        1. 發布概覽：
           - 「產品名稱」：由 proposal.md 提取。
           - 「發布版本」：由目前分支名稱（如 release/vX.Y.Z）或 PR 標題提取。若無則留空。
           - 「核心功能」：由 proposal.md 提取並精煉。
           - 「受影響的模組化架構」與「外部相關性變更」：由 design.md 提取。
        2. 部署策略與退版計畫：
           - 讀取 design.md 的「遷移計畫與回滾策略」，將 Canary 部署比例與步驟，以及 Feature Toggle / Rollback 步驟填入對應表格。
        3. 系統觀測與異常回應 (Golden Signals)：
           - 根據本次變更所修改的組件（例如：若修改了資料庫，保留並突顯 Database 慢查詢與 IOPS；若修改快取，突顯 Redis 命中率與記憶體；若修改應用服務，突顯 API Latency 與 Exception Rate）。
        4. 測試覆蓋與品質保證：
           - 從 plan.md 提取測試情境，並將通過的項目對應填入。
        5. ⚠️ 未知與人工審批資訊的處理原則（核心）：
           - 對於「PR Review 審批連結」、「DB Migration 審核簽章與 Ticket」、「Canary 實際觀察日期」、「維運手冊連結」等在開發期未知或需要外部人工介入的項目，AI **絕對不得捏造數據**。
           - 必須將狀態設為 `[ ] TODO: 待手動補充` 或 `[ ] 待人工確認`，並在佐證資料欄位保留引導文字（例如 `[請提供相關 Pull Request 連結]`），提示開發者在上線前手動補齊。
  ```

- [ ] **Step 2: 驗證 YAML 語法**

  使用 Python 的 yaml 模組或 Node.js 驗證修改後的 `schema.yaml` 是否能被正常解析，無語法錯誤：
  Run: `python3 -c "import yaml; yaml.safe_load(open('openspec/schemas/fopd-sdlc/schema.yaml'))"`
  Expected: 指令執行成功，沒有任何錯誤輸出。

- [ ] **Step 3: Commit**

  ```bash
  git add openspec/schemas/fopd-sdlc/schema.yaml
  git commit -m "schema: integrate production readiness review (prr) into retrospective stage"
  ```
