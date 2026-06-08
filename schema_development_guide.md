# OpenSpec 自定義 Schema 開發指南 (Schema Development Guide)

本指南旨在協助公司內不同部門或團隊，根據自身的開發儀式、品質把關程度與工具鏈，設計並客製化專屬的 OpenSpec 開發 Schema。

本指南將透過兩個實例的對照分析，提示（Hint）您可以調整的「模組」與「流程」，協助您快速上手。

---

## 1. 核心 Schema 的兩種流派對照

在開始設計前，我們先看看兩種具代表性的 OpenSpec Schema 設計，以了解從「輕量」到「部門客製化」的演進：

| 評估維度 | ❶ 官方純淨版 (`spec-driven`) | ❷ 部門客製化版 (`fopd-sdlc`) |
| :--- | :--- | :--- |
| **設計哲學** | 輕量、工具無關、依賴少。 | **兼顧彈性與品質自省**：排除不穩定工具，強化交付品質自檢。 |
| **工作區管理** | 在當前工作區直接進行。 | **開發者自管**：移除強制 Worktree 建立，交由開發者手動或以分支隔離。 |
| **實作執行器** | 由 AI 直接執行 `tasks.md` 中的粗粒度任務。 | 使用 `subagent-driven-development` 在目前工作區自動落實 TDD。 |
| **產出文件** | 4 個：`proposal`, `specs`, `tasks`, `verify` | 7 個：在 `retrospective` 中新增 **PR 自評卡**。 |
| **適用場景** | 新專案 Scaffolding、無安裝額外 AI 技能的環境。 | **企業級中大型專案**：需要 TDD 開發品質，但不希望工具鏈強制干涉 Git 結構的團隊。 |

---

## 2. OpenSpec Schema 的核心結構解構

OpenSpec Schema 的定義完全存放在一個目錄下的 `schema.yaml` 中，它主要由兩個模組構成：

```text
schema.yaml
 ├── ① Artifacts (規劃階段文件與依賴圖)
 └── ② Apply & Post-Apply (實作階段的執行器與流程控制)
```

### ① Artifacts (開發文件與依賴 DAG)
此部分定義了專案需要產出哪些 Markdown 文件，以及這些文件的依賴關係（透過 `requires` 定義）。

* **客製化 Hint**：您可以增刪不同的開發文件。例如：
  - 如果部門不需要技術設計文件，可以將 `design` 階段移除。
  - 如果部門需要資訊安全審查，可以新增一個 `security-review.md` 階段，並讓 `plan.md` 必須依賴（`requires`）它。

### ② Apply & Post-Apply (實作與收尾)
此部分定義了當執行 `/opsx:apply` 時，AI 代理人應該遵循的步驟與執行的指令（Prose 指引）。

---

## 3. 實用進階教學：如何擴充你的 Schema

為了讓各部門能快速客製流程，以下以具體的代碼與 YAML 片段展示如何進行擴充：

### 實例 A：如何插入自訂技能 (Skill Binding)
當部門有開發特定的 AI 技能（例如安全掃描、程式碼效能分析工具等），可以在 `schema.yaml` 的階段指令（`instruction`）中直接指定 AI 載入並呼叫該技能。

* **情境**：在 `apply` 階段實作完成後，強制 AI 呼叫自訂的 `security-scan` 技能進行靜態安全分析。
* **YAML 配置範本 (`schema.yaml`)**：
```yaml
apply:
  requires: [plan, verify]
  tracks: plan.md
  instruction: |
    在開始實作前，確認開發環境並設定執行器：
    1. 工作區：在目前的工作區工作。
    2. 執行器：呼叫 subagent-driven-development 執行任務。
    
    # ─── 插入自訂技能開始 ───
    3. 安全性審查（強制）：
       在實作代碼編寫完成、且單元測試通過後，必須使用 Skill 工具呼叫 **security-scan** 技能。
       - 掃描新撰寫的代碼與配置檔。
       - 檢查是否有硬編碼的 API 密鑰、SQL 注入漏洞或不安全的第三方相依。
       - 如果掃描報告中有發現任何 High/Critical 的漏洞，AI 應立即停止實作並向開發者回報，不允許進入 verify 階段。
    # ─── 插入自訂技能結束 ───
```

---

### 實例 B：如何增加品質閘門 (Quality Gate)
品質閘門用於防止「未達標的代碼」合入主分支。我們可以在實作完成後的驗證階段（`verify`）或實作結尾（`apply`）中加入自動化指標檢驗。

* **情境**：強制要求「Linter 必須無警告」且「單元測試覆蓋率必須大於 80%」，否則無法完成該變更的歸檔。
* **YAML 配置範本 (`schema.yaml`)**：
```yaml
apply:
  requires: [plan, verify]
  tracks: plan.md
  instruction: |
    # ... 前置實作與安全審查步驟 ...
    
    # ─── 插入品質閘門開始 ───
    4. 品質閘門檢驗 (Quality Gate)：
       在宣稱實作完成前，AI 必須在主機環境執行以下實體指令並確認輸出結果：
       - 執行 `npm run lint`：必須無任何 Error（Lint 錯誤）。
       - 執行 `npm run test:coverage`：讀取終端機輸出，確認全專案的測試覆蓋率（Statements/Lines）皆大於 80%。
       
       【阻擋機制】：
       - 若 Linter 失敗，或覆蓋率未達 80%，AI 必須判定此 Apply 階段失敗，自動修復代碼並重跑檢驗。
       - 嚴禁跳過此步驟。AI 必須將 Lint 的結果與覆蓋率百分比，詳細填寫在產出的 verify.md 文件中作為佐證。
    # ─── 插入品質閘門結束 ───
```

---

### 實例 C：如何新增生命週期步驟 (Custom Lifecycle Stage)
有些部門在實作前，可能需要經過特定的評估。例如，如果變更涉及資料庫，必須經過 DB 管理員或 AI 進行 Database Schema 審查。這需要我們在 OpenSpec 的 **Artifact DAG（有向無環圖）** 中加入一個新節點。

* **情境**：在技術設計（`design`）之後、計畫（`plan`）之前，插入一個「資料庫審查（`db-review`）」階段，要求產出 `db-schema.md` 檔案。
* **YAML 配置範本 (`schema.yaml`)**：

1. **第一步：在 `stages` 陣列中插入新 id：**
```yaml
stages:
  - id: proposal
    generates: proposal.md
    # ... proposal 設定 ...
    
  - id: design
    generates: design.md
    # ... design 設定 ...

  # ─── 新增資料庫審查步驟開始 ───
  - id: db-review
    generates: db-schema.md
    description: 資料庫變更審查與 SQL 遷移腳本評估
    template: db-schema.md
    instruction: |
      如果本次變更有修改資料庫結構（Schema/Index/Table），必須撰寫此文件：
      - 列出預計執行的 DDL 與 DML 語句。
      - 評估大表（Big Table）變更對服務可用性的影響與 Migration 策略。
      - 提供對應的 Rollback (回滾) SQL 腳本。
      若無變更，文件內容填寫「無資料庫異動」並直接跳過。
    requires:
      - design  # 必須先完成設計，才能分析 DB 異動
  # ─── 新增資料庫審查步驟結束 ───
```

2. **第二步：調整後續階段的 `requires`，將其串接起來：**
我們必須將原本依賴 `design` 的 `plan` 階段，改為依賴 `db-review`，如此就強制了時序性：
```yaml
  - id: plan
    generates: plan.md
    description: 實作計畫
    template: plan.md
    instruction: |
      使用 writing-plans 產生 plan.md。
      此計畫必須參考 specs 中的需求，以及 design.md 和 db-schema.md 的架構決策。
    requires:
      - specs
      - db-review  # 💡 核心修改：將原本依賴 design 改為依賴 db-review
```

---

## 4. 關鍵模組客製化指南 (Customization Hints)

除了擴充實例之外，以下是我們在客製化 `fopd-sdlc` 時總結出最常見的四個調整模組方向：

### 模組 A：工作區隔離管理 (Workspace Management)
* **硬性隔離 (Worktree) 模式**：在 `apply.instruction` 中加入 `using-git-worktrees` 技能。
* **開發者自管 (Soft Workspace) 模式 (FOPD 實踐)**：在 `schema.yaml` 中，將工作區定義修改為：`在目前的工作區工作（團隊視需要自選隔離機制，流程本身不再強加 worktree 建立）`。將環境隔離的控制權還給人類開發者。

### 模組 B：實作執行器與技能傳遞 (Executor & Skill Bindings)
在 `/opsx:apply` 階段，您可以指引 AI 啟用不同的技能來完成代碼。如果您的團隊強制要求測試驅動開發，可以在 `apply.instruction` 中指定 `subagent-driven-development` 並明確註記其必須開啟 TDD。

### 模組 C：合規審查門檻 (Verification Gates)
在實作完成後進入 `/opsx:verify`，您可以自訂 `verify.md` 範本中的檢檢表。除了檢查 specs 檔案外，還可以強迫 AI 檢查代碼是否具備單一職責、是否有殘留的 `TODO` 等。

### 模組 D：持續改進閉環 (PR Audit Rubric / Retrospective)
這是在 `fopd-sdlc` 中的重大創新。我們在 `templates/retrospective.md` 中，內建了 **PR 自評卡**，讓 AI 在提交 PR 之前，在四個維度（設計先行、測試覆蓋、程式品質、流程可追溯）上客觀自評 1-3 分。這能強制 AI 在發 PR 前進行自省，降低 Code Reviewer 的心智負擔。

---

## 5. 建立部門專屬 Schema 的實戰步驟

如果您要為您的部門建立一個全新的 Schema（例如命名為 `qa-heavy-sdlc`），請遵循以下步驟：

```mermaid
flowchart LR
    A[1. 複製基底] --> B[2. 修改 schema.yaml]
    B --> C[3. 自訂 templates]
    C --> D[4. 本地驗證]
    D --> E[5. 推廣套用]
```

### 步驟 1：複製現有基底
在 `openspec/schemas/` 目錄下建立新資料夾：
```bash
cp -R openspec/schemas/spec-driven openspec/schemas/qa-heavy-sdlc
```

### 步驟 2：調整依賴圖與指令
修改 `qa-heavy-sdlc/schema.yaml`，依據上述教學，適當新增自訂生命週期或品質檢驗。

### 步驟 3：調整範本格式
在 `qa-heavy-sdlc/templates/` 中，調整各階段生成文件的 Markdown 格式。

### 步驟 4：執行 CLI 驗證
使用 OpenSpec CLI 檢查您的自定義 Schema 是否合乎規範：
```bash
openspec schema validate qa-heavy-sdlc
```

### 步驟 5：於新 Change 中指定使用
在建立新功能變更時，指定您部門的 Schema：
```bash
/opsx:new <feature-name> --schema qa-heavy-sdlc
```

---

> [!IMPORTANT]
> **Schema 設計的黃金法則：流程儀式與風險成正比**
> 在客製化您的 Schema 時，切忌設計過於繁雜的審查流程。輕微的 typo 修正或 Bug 應直接發 PR；只有涉及架構、DB Schema、或對外 API 合約變更時，才需要完整啟動 OpenSpec 的生命週期。
