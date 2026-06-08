# Slide Presentation Outline: AI-SDLC Workshop & SDD Implementation

## 1. 簡報基本資訊 (Overview)
* **會議名稱**：FOPD 部門 AI-SDLC 流程工作坊回顧與導入計劃
* **會議時長**：60 分鐘 (45 分鐘簡報與 Demo + 15 分鐘 Q&A/討論)
* **目標聽眾**：部門主管/老闆 (Sponsor)、研發工程師 (RD)、產品經理 (PM)
* **核心目的**：
  * **對主管 (Business Value)**：展示 AI 開發效率的突破，並證明三道品質閘門 (Quality Gates) 能守護 Production 安全，爭取全面導入資源。
  * **對團隊 (Engineering Engagement)**：展示如何用 AI 工具加速日常任務，並強調自建技能 (Custom Skills) 的高擴充性與工具相容性。

---

## 2. 60分鐘議程分配 (Agenda)
* **00-10 min (10m)**: 專案背景、痛點與工作坊目標 (Philosophy & Vision)
* **10-25 min (15m)**: 三天工作坊精華與技術架構 (Workshop Highlights)
* **25-45 min (20m)**: 端到端 Demo、量化指標與自建 Skill 擴充性 (Live Demo & Capability)
* **45-60 min (15m)**: 團隊落地計畫與 Q&A (Rollout Plan & Discussion)

---

## 3. 投影片大綱詳細設計 (Slide-by-Slide Details)

### Slide 1: 封面與議程 (Title & Agenda)
* **標題**：AI 時代的研發效能革命：AI-SDLC 流程實作與 SRE 上線把關
* **副標題**：FOPD 部門三日工作坊成果與導入規劃
* **內容要點**：
  * 介紹本次簡報的 4 大模組：理念哲學 ➔ 工作坊實作回顧 ➔ Live Demo ➔ 落地 Rollout 計畫。

### Slide 2: AI 輔助開發的「隱形危機」 (The Challenge of AI-Driven Development)
* **核心觀點**：放權給 AI 高速編碼的同時，如果缺乏「治理 (Governance)」，會帶來巨大代價。
* **內容要點**：
  * **代碼失控 (Code Rot)**：AI 產出大量黑箱程式碼 (Black-box Code)，難以維護。
  * **測試缺失 (Trivial Mocking)**：AI 傾向寫出無效測試以應付 Coverage 檢查。
  * **運維風險 (Observability Gap)**：高頻發布直接砸向生產環境，缺乏 Canary 與退版防護。
* **解決方案**：定義一套 AI-SDLC 流程規範，在高速執行的同時實施「強稽核」。

### Slide 3: 工作坊核心目標與要求 (Workshop Objectives & Requirements)
* **核心觀點**：工作坊的目標不只是引進工具，而是建立一套高穩定、可擴充的 agentic workflow。
* **內容要點**：
  * **四大工程要求**：
    1. **可彈性調整 (Configurable)**：可隨專案規模客製化調整。
    2. **高度穩定性 (Deterministic)**：AI 的產出與執行路徑受控，避免隨機幻覺。
    3. **高相容度 (Cross-platform/LLM)**：相容不同 AI Agent、大語言模型 (LLM) 與作業系統。
    4. **工具無排他性 (Extensible)**：不強綁特定框架，團隊自建的 Skill（如客製化 PRD 轉換或特定的測試工具）可無縫融入。

### Slide 4: Day 1 - AI-SDLC 流程設計與品質閘門 (Philosophy & Quality Gates)
* **核心觀點**：第一天聚焦於架構思維的重塑，定義了五大哲學與三道 Quality Gates。
* **內容要點**：
  * **5 大核心設計哲學**：Shift-Left (左移設計)、TDD Guardrails (測試先行防黑箱)、HITL Governance (人類把關)、SRE Guardrails (運維安全)、Anti-Hallucination (對抗 AI 幻覺)。
  * **3 道品質閘門 (Quality Gates)**：
    1. **Gate A (Design Gate)**: 實作前人類審核 (Sign-off) 技術設計與計畫。
    2. **Gate B (CI & CR Gate)**: 合併前 CI 自動測試與人類 Peer Review。
    3. **Gate C (PRR Gate)**: 上線前生產準備度審查，補齊 TODO 簽核。

### Slide 5: Day 2 - 技術落地與工具實踐 (Tooling: OpenSpec & Superpowers)
* **核心觀點**：第二天聚焦於實作，使用 OpenSpec + Superpowers 打造團隊專屬的自動化流程。
* **內容要點**：
  * **OpenSpec 的角色**：做為「工程規格的載體與追蹤器」，管理 `proposal.md`, `design.md`, `plan.md` 等工件。
  * **Superpowers 套件的作用**：提供背景運行的執行引擎，如 `writing-plans` (自動產計畫) 與 `subagent-driven-development` (執行微任務)。
  * **解耦與可替換性**：其他團隊不一定要全套使用 OpenSpec，但必須透過其他工具（如 GitHub Actions/自建 Agent 腳本）滿足相同的 Quality Gates。

### Slide 6: Day 3 - Demo 成果展演 (Live Demo: URD/PRD to Code)
* **核心觀點**：第三天實證成果。展示從需求到高品質程式碼交付的極速過程。
* **內容要點**：
  * **銜接模式**：
    * PM 交付高階需求 (URD) ➔ AI 協同收斂細節 ➔ 自動生成測試案例 ➔ AI 小步提交 (Atomic-like Commits)。
    * PM 交付高品質 PRD ➔ 實現 **One-pass Approval (一次性審核通過)**。
  * **量化指標 (Metrics)**：
    * 實作變更所需工時：從原本的 [TODO: 填寫原本天數，例如 2 天] 縮短至 [TODO: 填寫工作坊實際分鐘數，例如 30 分鐘]。
    * 自動化測試覆蓋率：高於 [TODO: 填寫覆蓋率，例如 80%]。

### Slide 7: 核心優勢 - 客製化 Skill 的高擴充性 (Custom Skills Extensibility)
* **核心觀點**：這套系統不排斥任何團隊的自建工具，反而能「吸收並沈澱」團隊的開發智慧。
* **內容要點**：
  * **什麼是 Skill**：封装好的 AI 提示詞、腳本與 SOP（如：團隊的 Code Style 檢查、特定的 DB 遷移檢查）。
  * **如何融入流程**：開發者可隨時新增 Skill 並宣告在流程中。AI Agent 在執行任務時會主動讀取並嚴格遵循，使團隊的 Domain Knowledge 成為 AI 的全域記憶。

### Slide 8: 團隊 Rollout 導入計畫與指標 (Next Steps & Rubric)
* **核心觀點**：如何逐步推廣至其他團隊，並建立通用的發布標準。
* **內容要點**：
  * **導入三部曲**：
    1. 第一階段：[TODO: 寫入試點專案/種子團隊] 率先試行。
    2. 第二階段：開放 Custom Skill 共享庫，建立團隊 AI 開發的 Best Practices。
    3. 第三階段：全面將 PRR 檢核表納入 CI/CD 發布流程。
  * **發布標準 (Rubric)**：採用 5 大評估維度（Design-First, Test Coverage, Code Quality, Traceability, PRR），PR 總分需達到 [TODO: 填寫分數，例如 11 分] 且無任何完全缺失項目。

### Slide 9: 結語與討論 (Q&A)
* 提問與討論 (Open Discussion)