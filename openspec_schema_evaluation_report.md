# OpenSpec Schema 機制剖析與客製化 SDLC 演進報告

> **主題：官方 `spec-driven` 與部門客製化 `fopd-sdlc` 流程的設計與改良效益分析**  
> **日期：2026-06-07**  
> **受眾：部門技術會議與開發團隊**

---

## 📌 前言

本報告聚焦於 OpenSpec Schema 的底層設計邏輯，探討為何通用的官方開發流程不足以支撐部門級的大型專案協作，進而詳細說明我們如何客製化出適合部門的 `fopd-sdlc`（Version 3）流程，並分析其改良優勢與具體效益。

為了讓與會人員免於來回查閱 Schema 檔案，本報告已直接內嵌 **`fopd-sdlc` 的 Schema 定義 YAML 程式碼段** 與 **文件 Markdown 範本**。

*註：本報告與實戰案例報告 [openspec_sharing_report.md](file:///Users/isosoman/Documents/repo/wstree/openspec_sharing_report.md) 互相獨立，專注於 Schema 設計規範與流程演進。*

---

## 一、 OpenSpec 的 Schema 是什麼？目的為何？

### 1. 什麼是 Schema？
在 OpenSpec 框架中，**Schema** 是軟體開發生命週期（SDLC）的「編排器」與「契約定義檔」。它使用 YAML 格式定義（例如 [fopd-sdlc/schema.yaml](file:///Users/isosoman/Documents/repo/wstree/openspec/schemas/fopd-sdlc/schema.yaml)），包含了：
* **階段（Artifacts）**：開發流程中必須產生的文件與產出物（如提案、設計書、測試計畫）。
* **相依性（Requires）**：各個開發階段之間的拓撲順序（例如必須先完成 Specs 才能開始 Plan）。
* **產出規則（Generates & Templates）**：定義每個階段產出的檔案路徑與結構範本。
* **執行指令（Instructions）**：提供給 AI 代理（Agent）在該階段的思維導引與工作細節。

### 2. Schema 的目的
* **人機協同的強式約束**：透過定義清晰的產出物範本，消除 AI 代理與人類工程師之間的需求歧義，確保大家在相同的標準下協作。
* **流程自動化與追蹤**：工具鏈能藉由 Schema 解析當前開發分支進度，自動檢驗文件合規性並追蹤任務清單的完成狀態。
* **品質與可測試性把關**：透過 Schema 規範，確保任何功能變更皆由「需求驅動」與「測試覆蓋」，將傳統開發中容易被忽略的文件撰寫與測試規劃固化為開發的必經之路。

---

## 二、 為什麼我們需要為部門新增客製化 Schema (`fopd-sdlc`)？

官方預設的 [spec-driven/schema.yaml](file:///Users/isosoman/Documents/repo/wstree/openspec/schemas/spec-driven/schema.yaml) 設計上非常輕量、通用，適用於快速迭代或小型獨立功能的開發。然而，在部門級的商業軟體開發中，我們面臨以下挑戰，導致官方 Schema 不敷使用：

### 1. 缺乏嚴格的工程紀律約束 (TDD)
官方流程使用簡單的 `tasks.md` 作為任務清單，但並未強迫 AI 代理實施**測試驅動開發（TDD）**。這容易導致 AI 代理在實作時「先寫程式碼、再補測試」甚至「漏寫測試」，無法保證程式碼品質。

### 2. 實作前缺乏「同行審查」與「人類核准門檻」
官方流程在完成技術設計後即可直接進行實作。在部門級的多人協作專案中，若沒有在動工前進行 PM（需求面）與架構師（設計面）的評估，容易在實作到一半時才發現設計缺口；此外，流程中也缺乏人類對計畫的最終核准（Approval Gate），存在失控風險。

### 3. 多人協作與分支管理衝突
若直接在當前工作區進行實作，容易因為環境污染影響主分支。本流程改由開發者自主管理環境隔離（如分支切換或 Worktree），工具鏈不強制涉入，以確保開發環境的穩定性。

### 4. 缺乏流程的「持續改進閉環」
官方流程在實作完成後即進入歸檔，開發過程中所遭遇的阻礙（Misses）、意外發現與學習無法系統化地沈澱下來。部門需要一個「回顧階段」，讓團隊能將每次的實作結晶轉化為未來的流程規則。

---

## 三、 新 Schema `fopd-sdlc` 的改良與具體好處 (附實體定義內嵌)

相較於官方預設的 `spec-driven`，客製化的 `fopd-sdlc` 將生命週期從 4 個階段擴充為 7 個核心階段，並在各個階段進行了革命性的改良：

```
官方 spec-driven 流程：
Proposal (提案) ➔ Specs (規格) ➔ Design (設計) ➔ Tasks (任務) ➔ Apply (實作)

部門 fopd-sdlc 流程：
Proposal ➔ Specs ➔ Design ➔ Plan (計畫) ➔ Verify (審查) ➔ Apply (隔離實作) ➔ Retro (回顧)
```

---

### 🤝 上游需求銜接與 PM 協作機制 (URD / PRD 相容)

在實際業務開發中，PM 交付的需求精確度直接影響到 AI 生成代碼的品質。新流程建立了彈性的上游銜接機制：

1. **基礎輸入 (URD)**：支援 PM 直接提供高階的用戶需求說明書 (URD)，由 AI 代理與 RD 在 `proposal` 和 `specs` 階段進行細節收斂。此模式 PM 負擔輕，但 `verify` 審查需要較多回饋微調。
2. **優選輸入 (PRD)**：PM 可以選用 AI 輔助工具（例如 [`prd`](https://github.com/snarktank/ralph/blob/main/skills/prd/SKILL.md) 技能或 [`brainstorming`](https://github.com/obra/superpowers/blob/main/skills/brainstorming/SKILL.md) 技能）協同產出高品質的產品需求文件 (PRD)。這能極大程度提高 AI 實作代理對業務邊界的理解，達到 One-pass (一次通過) 的極速審查。

這個機制打通了 PM 業務需求到 RD 自動化測試的橋樑，將 URD/PRD 的檢驗固化在 `verify` 的人類核准閘門中。

---

### 🛠️ 核心改良點與具體好處（內含原始 Schema 與範本代碼）

#### 改良 A：以「三合一 `plan.md`」取代「單純任務清單 `tasks.md`」
* **改良點**：將任務清單、測試案例與 **TDD 微步驟（RED-GREEN-REFACTOR 微迭代）** 整合於單一的 `plan.md` 中。
* **具體好處**：
  * **確保 100% 測試覆蓋**：每一個任務都強制綁定測試案例與 TDD 步驟。
  * **降低重構難度**：透過細粒度的 TDD 微步驟（每個步驟 2-5 分鐘），降低 AI 因上下文過長而犯錯的機率。

<details>
<summary>🔍 展開查看：fopd-sdlc Schema 中 id: plan 的定義與範本</summary>

**YAML 定義片段（`schema.yaml`）：**
```yaml
  - id: plan
    generates: plan.md
    description: 整合任務清單、測試案例與 TDD 微步驟的完整實作計畫
    template: plan.md
    instruction: |
      前置檢查——確認必要技能可用：
      在呼叫前，確認 `writing-plans` 出現在你的可用技能清單中。
      如果缺少，停止並通知使用者必須安裝所需的 Superpowers 技能。

      使用 Skill 工具呼叫 writing-plans。

      重要——輸出路徑導向：
      - 不要寫到 `docs/superpowers/plans/`（或任何技能預設路徑）。
        將計畫直接寫到這個 change 的 `plan.md`。

      此 plan.md 是唯一的「做什麼 + 怎麼做 + 怎麼測」文件，
      整合了以下三個關注點：

      A. 任務清單：
      - 使用 ## 編號標題將相關任務分組
      - 每個粗粒度任務用核取方塊：`- [ ] X.Y 任務描述`
      - 按照依賴順序排列

      B. 測試案例：
      - 每個任務群組開頭列出對應的測試案例
      - 測試案例引用 specs 中的需求與情境
      - 標明測試類型（單元/整合/E2E）與優先順序（P0/P1/P2）

      C. TDD 微步驟（每個任務的實作細節）：
      - 將每個任務拆解為 2-5 分鐘的微步驟
      - 每個微步驟遵循 Red-Green-Refactor 格式 (🔴 -> 🟢 -> 🔵)
      - 包含確切的檔案路徑、程式碼片段、測試指令
      - 每個任務完成後加入 commit 檢查點
```

**Plan 範本（`templates/plan.md`）：**
```markdown
# 實作計畫

> **給代理工作者**：使用 `superpowers:subagent-driven-development` 來逐任務實作此計畫。

## 任務 1: <任務組名稱>

### 測試案例
| 測試案例 | 對應需求 | 類型 | 優先順序 |
|----------|----------|------|----------|
| TC-001   | <規格需求與情境> | <單元/整合/E2E> | <P0/P1/P2> |

### 實作步驟
- [ ] **1.1（🔴 RED）：** <撰寫失敗測試描述>
- [ ] **1.2（確認紅燈）：** <執行測試指令並確認失敗原因>
- [ ] **1.3（🟢 GREEN）：** <編寫最小實作代碼>
- [ ] **1.4（確認綠燈）：** <執行測試指令確認通過>
- [ ] **1.5（🔵 REFACTOR）：** <重構程式碼與清理>
- [ ] **1.6：** commit — `<格式符合專案規範>`
```
</details>

---

#### 改良 B：新增 `verify` 同行審查與人類核准門檻 (Gatekeeper)
* **改良點**：在實作前，AI 代理會自動啟動兩個子代理（PM 審查員與架構師審查員），針對設計與計畫進行多維度評估，並將建議彙整至 `verify.md`。此外，`apply` 階段強制檢查 `verify.md` 中的「人類最終決策核取方塊」。
* **具體好處**：
  * **攔截設計缺陷**：在程式碼動工前，就發現並修正無障礙設計（A11y）缺陷、極端案例或效能隱憂。
  * **控制權回歸人類**：未經人類在 `verify.md` 手動確認核准，AI 代理絕對無法進入實作，確保技術方向符合預期。

<details>
<summary>🔍 展開查看：fopd-sdlc Schema 中 id: verify 的定義與文件範本</summary>

**YAML 定義片段（`schema.yaml`）：**
```yaml
  - id: verify
    generates: verify.md
    description: 實作前的 PM 與架構師雙重同行審查（最終核准權由人類決定）
    template: verify.md
    instruction: |
      透過兩個不同角度的同行審查，產生 verify.md。
      AI 負責蒐集審查意見並整理報告，但最終核准權歸使用者（人類）。

      1. 蒐集必要文件：閱讀 proposal.md, design.md, plan.md。
      2. 發派並行審查：建立兩個審查請求，使用子代理（subagent）：
         - PM 審查（plan）：評估任務完整性、里程碑可達性、測試案例覆蓋率。
         - 架構師審查（design + proposal）：評估技術決策、一致性、可測試性與風險。
      3. 編撰 verify.md：整理 AI 審查摘要、PM 發現、架構師發現，並提供「人類最終決策」區段。
      4. 停止並等待人類決策：verify.md 撰寫完成後，停止所有後續動作，等待人類核准。
```

**文件範本（`templates/verify.md`）中的「人類決策關鍵區段」：**
```markdown
# 驗證報告
Change: <change-name>

## AI 審查摘要
<!-- AI 對整體的初步評估與建議 -->

## PM 審查
### 發現
- <PM 關注事項的條列清單>
### AI 建議
<!-- AI 基於 PM 回饋的建議：核准 / 需修改 -->

## 架構師審查
### 發現
- <架構師關注事項的條列清單>
### AI 建議
<!-- AI 基於架構師回饋的建議 -->

---

<!-- HUMAN_APPROVAL_GATE:START — DO NOT REMOVE THIS COMMENT -->
## ⚠️ 人類最終決策（此區段由使用者填寫）

> **以下核取方塊僅限使用者（人類）勾選。**
> AI 不得自行勾選或修改此區段。
> 在使用者做出決策前，此變更不得進入 apply 階段。

- [ ] ✅ 核准，進入實作
- [ ] ⚠️ 有條件核准（請在下方說明條件）
- [ ] ❌ 駁回，需修改（請在下方說明原因）

### 使用者備註
<!-- 使用者可在此留下核准/駁回的理由或額外指示 -->
<!-- HUMAN_APPROVAL_GATE:END — DO NOT REMOVE THIS COMMENT -->
```
</details>

---

#### 改良 C：自動化整合進階開發技能（Subagents 執行器）
* **改良點**：在 `apply` 實作階段，Schema 自動載入並使用 `subagent-driven-development` 執行任務，於目前工作區中完成實作，並於內部自動實施 `test-driven-development` 與 `requesting-code-review`。
* **具體好處**：
  * **開發環境隔離**：由開發者自主管理隔離環境（如分支切換或 Worktree），以避免污染主分支並降低合併衝突。
  * **雙軌品質控管**：AI 自動化落實開發紀律，降低代碼退化風險。

<details>
<summary>🔍 展開查看：fopd-sdlc Schema 中 apply 階段的 YAML 定義</summary>

**YAML 定義片段（`schema.yaml`）：**
```yaml
apply:
  requires: [plan, verify]
  tracks: plan.md
  instruction: |
    ⛔ 人類核准門檻檢查（最高優先級）：
    在做任何事之前，先讀取 verify.md 並檢查「人類最終決策」區段中的核取方塊狀態：
    - 若 ✅ 核准，進入實作 -> 繼續執行
    - 若 ⚠️ 有條件核准 -> 閱讀使用者備註中的條件，先滿足條件後再繼續
    - 若 ❌ 駁回，需修改 -> 停止並通知使用者修改
    - 若所有核取方塊都未勾選 -> 停止，通知使用者 verify.md 尚未取得人類核准

    在開始實作前，確認開發環境並設定執行器：
    1. 工作區：在目前的工作區工作（團隊視需要自選隔離機制，流程本身不再強加 worktree 建立）。
    2. 執行器：使用 Skill 工具呼叫 subagent-driven-development 執行 plan.md。
       - 內部強制執行 test-driven-development（TDD） 與 requesting-code-review。
    3. 完成前驗證：使用 verification-before-completion 技能進行全面指令驗證。
    4. 回顧：在發 PR 之前產生 retrospective.md。
    5. 歸檔：執行 openspec archive -y。
```
</details>

---

#### 改良 D：新增 `retrospective`（回顧）階段與「PR 自評卡」
* **改良點**：引入 `retrospective.md` 檔案，在歸檔前強制進行實作數據分析（Commits、Diff 規模、測試覆蓋）與深度回顧，並提取「長期學習候選項目」。**更重要的是，內建了「PR 評估自評卡（PR Audit Rubric）」，強制 AI 對設計、測試、代碼品質與流程追溯進行 1-3 分的客觀評分與佐證。**
* **具體好處**：
  * **建構持續改進閉環**：讓團隊（與 AI）在每一次開發中學習，將「避免跨測試污染」或「新 React 特性」等經驗轉化為系統規則，實現開發效能的良性循環。
  * **交付品質的自我把關**：透過 12 分制的評分卡（建議 8 分以上且無 1 分項目方可合併），在發 PR 前由實作 AI 進行自檢，大幅降低 Reviewer 的審查負擔。

<details>
<summary>🔍 展開查看：fopd-sdlc Schema 中 id: retrospective 的定義與範本</summary>

**YAML 定義片段（`schema.yaml`）：**
```yaml
  - id: retrospective
    generates: retrospective.md
    description: 實作後的回顧文件，記錄成果、缺失、計畫偏差與長期學習候選
    template: retrospective.md
    instruction: |
      PRECHECK — 在撰寫回顧之前，確認以下條件：
      1. git log 顯示至少一個新的 commit
      2. plan.md 中至少有一個 - [x] 已勾選的任務
      如果 PRECHECK 未通過，停止並告知使用者必須先完成實作。

      使用 template 填入以下內容：
      1. 證據：計算 commit 數、diff 行數與已勾選任務數。
      2. 成果（Wins）：列出成功之處與證據引用。
      3. 缺失（Misses）：分類為阻擋性、痛點與小問題。
      4. 計畫偏差：對比 plan.md 記錄偏差及原因。
      5. 技能合規性：檢查 Superpowers 技能是否都有使用。
      6. PR 評估自評（§5）：依據設計先行、測試覆蓋、程式品質與流程可追溯四個維度客觀自評（1-3 分），並條列具體佐證與分數。
      7. 意外發現（§6）：原本假設錯誤的地方
      8. 長期學習候選（§7）：用 - [ ] 核取方塊列出可提升至記憶體、CLAUDE.md 或 schema 的項目。
```

**Retrospective 範本（`templates/retrospective.md`）中的「PR 評估與知識沉澱關鍵區段」：**
```markdown
# 回顧：<change-name>

## 4. 技能/流程合規性
| 技能 | 已使用 |
|---------------------------------------------|--------|
| superpowers:writing-plans | |
| superpowers:subagent-driven-development | |
| superpowers:verification-before-completion | |

## 5. PR 評估自評卡（PR Audit Rubric）

AI 應針對本次變更的實作品質，在以下四個維度進行客觀自評（評分標準：1 至 3 分）：

| 評估維度 | 自評分數 | 具體佐證說明（引用 Commit、檔案或測試） |
| :--- | :---: | :--- |
| **設計先行 (Design-First)** | ` ` / 3 | |
| **測試覆蓋 (Test Coverage)** | ` ` / 3 | |
| **程式品質 (Code Quality)** | ` ` / 3 | |
| **流程可追溯 (Traceability)** | ` ` / 3 | |

* **自評總分**：` ` / 12 (建議 8 分以上且無 1 分項目方可合併)

## 6. 意外發現
- <原本假設錯誤的地方>

## 7. 長期學習候選項目
每條候選項目用 `- [ ]` 核取方塊：

- [ ] 🔴 **<簡短規則>** → **提升至記憶體**
  > **為什麼**: <過去的事件或強烈偏好>
  > **如何應用**: <在什麼檔案/週期階段/決策時刻生效>

- [ ] 🟡 **<另一個候選>** → **提升至專案設定**
  > **為什麼**: ...
  > **如何應用**: ...
```
</details>

---

## 📊 新舊 Schema 特性對照表

| 評估維度 | 官方 `spec-driven` | 部門客製化 `fopd-sdlc` | 部門獲得的實質效益 |
| :--- | :--- | :--- | :--- |
| **實作計畫完整度** | 低（僅條列工作項目） | **高（任務 + 測試 + TDD 微步驟）** | 確保代碼伴隨測試產出，防退化能力極強 |
| **品質把關機制** | 無（設計完直接動工） | **高（AI 同行審查 + 人類一鍵核准 + PR 自評卡自檢）** | 實作前與交付前雙軌攔截漏洞，節省人工審查成本 |
| **開發環境隔離** | 無限制，自由切換 | **有（開發者自管分支/隔離環境）** | 給予開發者環境控制彈性，避免工具強制切換的潛在問題 |
| **實作紀律約束** | 無限制，自由寫碼 | **強制 TDD 與 AI 代理自動代碼審查** | 代碼品質與架構一致性高，減少人工 Code Review 成本 |
| **持續學習機制** | 無（歸檔即結束） | **有（回顧與長期記憶提取）** | 開發經驗能沉澱，AI 與團隊協作默契越做越好 |

---

## 四、 結論與成效預估

為部門引進 `fopd-sdlc` 客製化 Schema，本質上是將**「軟體工程的最佳實踐（TDD、環境隔離、雙重同行審查、持續回顧）」**，從「規範口號」提升為「工具鏈強制執行的物理約束」。

預期成效：
1. **交付品質大幅提升**：由於強制的 TDD 微步驟與 `verify` 審查，功能上線後的 Regression Bug 率將顯著降低。
2. **開發過程高度透明**：透過 `plan.md` 的精細拆解與 `verify.md`/`retrospective.md` 的客觀記錄，非同步協作的透明度達到最高。
3. **沉澱團隊知識產權**：每一次開發結束後產生的回顧，都將成為部門優化 AI 提示詞、專案規範（如 `CLAUDE.md`）的最直接養分。
