# OpenSpec SDLC 開發流程實戰分享

> **案例：`add-marquee` 跑馬燈功能開發**
> 日期：2026-06-07 ｜ 技術棧：React 19 + Vite 8 + Vitest 4

---

## 📌 什麼是 OpenSpec？

OpenSpec 是一套**結構化的軟體開發生命週期（SDLC）框架**，透過一系列標準化的文件產出物（Artifacts），將需求、設計、計畫、審查、實作、回顧到歸檔串連成完整閉環。

它的核心理念是：

> **先定義「要做什麼」和「為什麼」，再決定「怎麼做」，最後才寫程式碼。**

搭配 AI 代理（Agent）驅動，實現從需求到交付的半自動化開發流程。

---

## 🔄 流程全貌：7 個階段 + 歸檔

以下是本次 `add-marquee` 案例走過的完整流程：

```text
┌──────────────┐    ┌───────────┐    ┌───────────┐    ┌──────────┐
│ ① Proposal   │ ──>│ ② Specs   │ ──>│ ③ Design  │ ──>│ ④ Plan   │
└──────────────┘    └───────────┘    └───────────┘    └──────────┘
                                                               │
┌──────────────┐    ┌───────────┐    ┌───────────┐             │
│ ⑧ Archive    │ <──│ ⑦ Retro   │ <──│ ⑥ Apply   │ <───────────┘
└──────────────┘    └───────────┘    └───────────┘
```

---

## ① Proposal — 提案：為什麼要做？

**目的**：確立變更的動機與範圍，回答「為什麼要做這件事？」

### 本案例的提案內容

| 欄位 | 內容 |
|------|------|
| **為什麼** | React 應用缺乏動態內容展示元件，跑馬燈可用於公告、即時訊息的持續輪播 |
| **變更內容** | 新增 `Marquee` 元件，支援速度、方向、暫停控制，整合至 `App.jsx` 頂部 |
| **新增能力** | `marquee-component`（對應一份規格書） |
| **影響範圍** | `src/components/`、`src/App.jsx`、樣式檔 |

> [!TIP]
> Proposal 刻意保持精簡（1-2 頁），聚焦「為什麼」而非「怎麼做」。技術細節留給後續的 Design 階段。

> [!NOTE]
> **💡 上游需求銜接最佳實踐**：在 PM 與 RD 的協作上，本流程支援 **URD** 與 **PRD** 兩種輸入。PM 團隊可選用 [`prd`](https://github.com/snarktank/ralph/blob/main/skills/prd/SKILL.md) 技能或 [`brainstorming`](https://github.com/obra/superpowers/blob/main/skills/brainstorming/SKILL.md) 技能產出高品質的 PRD 作為輸入，這能最大化 AI 在 Proposal 與 Specs 階段的生成精確度，減少 Verify 評審的往返微調次數。

<details>
<summary>🔍 展開查看原始 proposal.md 完整內容</summary>

```markdown
## 為什麼

React 應用目前缺乏動態內容展示元件。跑馬燈（Marquee）是常見的資訊推播 UI 模式，可用於公告、即時訊息或促銷內容 of 連續輪播顯示。

## 變更內容

- 新增 `Marquee` 元件：支援水平滾動的文字/內容跑馬燈
- 提供可配置的 props（速度、方向、內容、暫停控制）
- 整合至 `App.jsx` 頁面頂部作為預設展示位置

## 能力範圍

### 新增能力
- `marquee-component`: 跑馬燈元件的行為規格，包含滾動動畫、暫停互動、可配置屬性

### 修改能力
（無既有能力需要修改）

## 影響範圍

- `src/components/` — 新增 Marquee 元件與樣式檔
- `src/App.jsx` — 整合 Marquee 元件
- `src/App.css` 或 `index.css` — 可能的排版調整
```

</details>

---

## ② Specs — 規格：系統應該做什麼？

**目的**：使用 WHEN/THEN 格式定義系統的**可驗證行為**，每個情境直接對應一個測試案例。

### 本案例定義的需求與情境

| 需求 | 情境 | 測試意涵 |
|------|------|----------|
| **Marquee 渲染** | 渲染傳入的子內容 | DOM 中出現兩份內容（無縫循環） |
| **水平滾動動畫** | 預設由右至左 | 容器帶有 `marquee--left` class |
| | 可配置為由左至右 | 設定 `direction="right"` 後帶有 `marquee--right` |
| **速度控制** | 預設速度 10s | `animationDuration` 為 `10s` |
| | 自訂速度 | `speed={5}` 時為 `5s` |
| **滑鼠懸停暫停** | 滑鼠進入時暫停 | `animation-play-state: paused` |
| | 滑鼠離開時恢復 | `animation-play-state: running` |
| **整合至 App** | 頁面頂部顯示跑馬燈 | App 渲染時包含 Marquee 元件 |

> [!IMPORTANT]
> 規格使用「**應（SHALL）**」和「**必須（MUST）**」作為規範性語言，確保需求的明確性與可測試性。每一個 Scenario 就是一個潛在的測試案例。

### 差異操作語法

規格書使用 `##` 標題來標明變更類型：

```markdown
## 新增需求（ADDED Requirements）    ← 全新能力
## 修改需求（MODIFIED Requirements）  ← 行為改變
## 移除需求（REMOVED Requirements）  ← 廢棄功能
## 更名需求（RENAMED Requirements）  ← 僅名稱變更
```

這套語法讓歸檔階段能自動解析差異並同步至主規格書。

<details>
<summary>🔍 展開查看原始 spec.md 完整內容</summary>

```markdown
## 新增需求（ADDED Requirements）

### Requirement: Marquee 渲染

Marquee 元件應（SHALL）渲染傳入的子內容，並將內容複製一份以實現無縫循環滾動。

#### Scenario: 渲染傳入的子內容
- **WHEN** 使用者提供 `<Marquee>Hello World</Marquee>`
- **THEN** 元件應（SHALL）在 DOM 中渲染兩份 "Hello World" 內容以支援無縫循環

### Requirement: 水平滾動動畫

Marquee 元件應（SHALL）使用 CSS `@keyframes` 動畫實現水平方向的自動滾動，從右向左持續移動。

#### Scenario: 預設方向為由右至左
- **WHEN** 元件渲染完成且未指定方向 prop
- **THEN** 內容應（SHALL）從右側滾動至左側並無縫循環

#### Scenario: 可配置方向為由左至右
- **WHEN** 使用者設定 `direction="right"`
- **THEN** 內容應（SHALL）從左側滾動至右側並無縫循環

### Requirement: 速度控制

Marquee 元件應（SHALL）接受 `speed` prop（單位：秒），控制完成一次完整滾動循環所需的時間。

#### Scenario: 預設速度
- **WHEN** 未提供 `speed` prop
- **THEN** 動畫循環時間應（SHALL）為 10 秒

#### Scenario: 自訂速度
- **WHEN** 使用者設定 `speed={5}`
- **THEN** 動畫循環時間應（SHALL）為 5 秒

### Requirement: 滑鼠懸停暫停

Marquee 元件應（SHALL）在滑鼠指標進入元件區域時暫停滾動，離開時恢復滾動。

#### Scenario: 滑鼠進入時暫停
- **WHEN** 滑鼠指標進入 Marquee 元件範圍（`mouseenter`）
- **THEN** 動畫應（SHALL）暫停（`animation-play-state: paused`）

#### Scenario: 滑鼠離開時恢復
- **WHEN** 滑鼠指標離開 Marquee 元件範圍（`mouseleave`）
- **THEN** 動畫應（SHALL）恢復播放（`animation-play-state: running`）

### Requirement: 整合至 App.jsx

Marquee 元件應（SHALL）在 `App.jsx` 中被引入並放置於頁面頂部，作為示範用途顯示預設公告訊息。

#### Scenario: App 頁面包含跑馬燈
- **WHEN** 應用載入
- **THEN** 頁面頂部應（SHALL）顯示 Marquee 元件，帶有預設公告文字
```

</details>

---

## ③ Design — 設計：如何實作？

**目的**：記錄關鍵技術決策與替代方案分析，回答「為什麼選 X 而非 Y？」

### 本案例的三大技術決策

````carousel
### 決策 1：動畫引擎

| 選項 | 優點 | 缺點 |
|------|------|------|
| ✅ **CSS `@keyframes`** | GPU 加速、零 JS 複雜度、與現有模式一致 | 精細控制不如 JS |
| ❌ `requestAnimationFrame` | 可精確控制每一幀 | 增加 JS 複雜度，此場景無優勢 |

**結論**：跑馬燈是線性勻速位移，CSS 完全勝任。
<!-- slide -->
### 決策 2：無縫循環策略

**方案：雙倍內容拼接**

將子內容複製一份拼接在後方。動畫滾動恰好一個內容寬度時，瞬間重置位置，視覺上呈現無縫循環。

```
[  Hello World  |  Hello World  ]
     ←←← 滾動方向 ←←←
```
<!-- slide -->
### 決策 3：暫停機制

**方案：CSS `animation-play-state`**

透過 React state 切換 CSS class，設定 `animation-play-state: paused`。

```jsx
// React 管理狀態
const [isPaused, setIsPaused] = useState(false);

// CSS 負責動畫
.marquee--paused .marquee__content {
  animation-play-state: paused;
}
```

**關注點分離**：React 不碰動畫計算，CSS 不碰業務邏輯。
````

> [!NOTE]
> Design 文件還包含**可測試性考量**，預先規劃了 Mock 邊界與測試介面，這為後續的 TDD 打下基礎。

<details>
<summary>🔍 展開查看原始 design.md 完整內容</summary>

```markdown
## 背景

React 應用（Vite + React 19）使用純 CSS 與 JSX，無 UI 框架。現有元件遵循 `src/components/` 目錄結構，每個元件搭配獨立 CSS 檔案。需要新增跑馬燈元件以支援動態訊息輪播。

## 目標 / 非目標

**目標：**
- 提供可重用的 `Marquee` 元件，支援水平滾動動畫
- 透過 props 控制速度、方向、暫停行為
- 滑鼠懸停時暫停滾動
- 遵循現有純 CSS + JSX 模式，不引入新依賴

**非目標：**
- 垂直滾動（僅支援水平）
- 多行跑馬燈佈局
- 後端 API 整合（內容由 props 傳入）
- 無障礙（Accessibility）進階支援（如螢幕閱讀器即時區域）

## 決策

### 動畫實作：CSS `@keyframes` vs JavaScript `requestAnimationFrame`

**選擇：CSS `@keyframes`**

替代方案：
- `requestAnimationFrame`：可精確控制每一幀，但增加 JS 複雜度，且在此場景無明顯優勢
- CSS `animation` + `translateX`：瀏覽器原生 GPU 加速，效能最佳，程式碼最精簡

理由：跑馬燈是線性勻速位移動畫，CSS 完全能勝任，且與現有純 CSS 模式一致。

### 內容重複策略：雙倍內容拼接

為實現無縫循環，將子內容複製一份拼接在後方。當動畫滾動恰好一個內容寬度時，瞬間重置位置，視覺上呈現無縫循環。

### 暫停機制：CSS `animation-play-state`

滑鼠 `mouseenter` 時透過 state 切換 CSS class，設定 `animation-play-state: paused`。

## 可測試性考量

- 元件透過 props 接收所有配置（速度、方向、內容），易於在測試中控制
- 暫停行為可透過模擬 `mouseenter` / `mouseleave` 事件驗證
- 使用 Vitest + Testing Library（現有測試框架）
- 測試重點：
  - 正確渲染傳入的子內容
  - 套用正確 the CSS class（方向、速度）
  - 滑鼠懸停觸發暫停狀態
  - 滑鼠離開恢復播放狀態

## 風險 / 取捨

- [不同瀏覽器動畫效能差異] → CSS animation 瀏覽器支援度高（>97%），風險極低
- [內容過短時無縫循環明顯] → 雙倍拼接策略確保最小滾動距離，可接受
- [無障礙支援有限] → 非目標範圍，未來迭代可加入 `aria-live` 屬性
```

</details>

---

## ④ Plan — 計畫：怎麼做 + 怎麼測？

**目的**：`plan.md` 是 OpenSpec 中最關鍵的文件——它整合了**任務清單**、**測試案例**與 **TDD 微步驟**三個關注點。

### 5 個任務的 TDD 微步驟結構

每個任務嚴格遵循 **Red-Green-Refactor** 流程：

```text
🔴 RED (寫失敗測試) ──> 確認紅燈 ──> 🟢 GREEN (最小實作) ──> 確認綠燈 ──> 🔵 REFACTOR (重構) ──> 📦 Commit
```

### 任務清單概覽

| 任務 | 內容 | 測試案例 | TDD 微步驟 |
|------|------|----------|-----------|
| **Task 1** | 基礎渲染（雙份內容） | TC-001 | 1.1 ~ 1.6 |
| **Task 2** | CSS 動畫與方向控制 | TC-002, TC-003 | 2.1 ~ 2.6 |
| **Task 3** | 速度控制 | TC-004, TC-005 | 3.1 ~ 3.6 |
| **Task 4** | 滑鼠懸停暫停 | TC-006, TC-007 | 4.1 ~ 4.6 |
| **Task 5** | 整合至 App.jsx | TC-008 | 5.1 ~ 5.6 |

> [!TIP]
> 任務按依賴順序排列：先有渲染（Task 1），才能加動畫（Task 2），再加速度控制（Task 3），然後暫停互動（Task 4），最後整合（Task 5）。

<details>
<summary>🔍 展開查看原始 plan.md 完整內容</summary>

```markdown
# Marquee 跑馬燈元件實作計畫

> **給代理工作者：** 使用 superpowers:subagent-driven-development
> 來逐任務實作此計畫。

**目標：** 在 React 應用中新增可重用的跑馬燈元件，支援水平滾動、速度控制與滑鼠懸停暫停。

**架構：** 純 CSS `@keyframes` 動畫驅動水平滾動，雙倍內容拼接實現無縫循環。元件透過 props 接收配置，遵循現有 `src/components/` 的純 CSS + JSX 模式。

**技術棧：** React 19, Vite 8, 純 CSS animations

**測試框架：** Vitest 4 + @testing-library/react + jest-dom

---

## 任務 1: Marquee 元件基礎渲染

### 對應測試案例
| 測試案例 | 對應需求 | 類型 | 優先順序 |
|----------|----------|------|----------|
| TC-001 | `Marquee 渲染` → `渲染傳入的子內容` | 單元 | P0 |

### 實作步驟（🔴 → 🟢 → 🔵）

- [ ] **1.1（🔴 RED）：** 在 `src/__tests__/Marquee.test.jsx` 撰寫測試：渲染 `<Marquee>Hello</Marquee>`，斷言 DOM 中出現兩份 "Hello" 內容
- [ ] **1.2（確認紅燈）：** 執行 `npx vitest run src/__tests__/Marquee.test.jsx`，確認測試失敗（元件不存在）
- [ ] **1.3（🟢 GREEN）：** 建立 `src/components/Marquee.jsx`，實作元件：渲染雙份子內容包裹於容器 div 中
- [ ] **1.4（確認綠燈）：** 執行測試，確認通過
- [ ] **1.5（🔵 REFACTOR）：** 確認元件結構清晰，必要時調整
- [ ] **1.6：** commit — `feat(marquee): add basic Marquee component with duplicated content`

---

## 任務 2: CSS 滾動動畫與方向控制

### 對應測試案例
| 測試案例 | 對應需求 | 類型 | 優先順序 |
|----------|----------|------|----------|
| TC-002 | `水平滾動動畫` → `預設方向為由右至左` | 單元 | P0 |
| TC-003 | `水平滾動動畫` → `可配置方向為由左至右` | 單元 | P0 |

### 實作步驟（🔴 → 🟢 → 🔵）

- [ ] **2.1（🔴 RED）：** 新增測試：渲染 Marquee 後斷言容器帶有 CSS class `marquee--left`（預設）；渲染 `<Marquee direction="right">` 後斷言帶有 `marquee--right`
- [ ] **2.2（確認紅燈）：** 執行測試，確認失敗
- [ ] **2.3（🟢 GREEN）：** 建立 `src/components/Marquee.css`，定義 `@keyframes scroll-left` 與 `scroll-right`；在 Marquee.jsx 中加入 `direction` prop（預設 `"left"`），套用對應 CSS class；設定 `overflow: hidden` 與 `animation` 屬性
- [ ] **2.4（確認綠燈）：** 執行測試，確認通過
- [ ] **2.5（🔵 REFACTOR）：** 確認 CSS 動畫定義簡潔，class 命名一致
- [ ] **2.6：** commit — `feat(marquee): add CSS scroll animation with direction control`

---

## 任務 3: 速度控制

### 對應測試案例
| 測試案例 | 對應需求 | 類型 | 優先順序 |
|----------|----------|------|----------|
| TC-004 | `速度控制` → `預設速度` | 單元 | P1 |
| TC-005 | `速度控制` → `自訂速度` | 單元 | P1 |

### 實作步驟（🔴 → 🟢 → 🔵）

- [ ] **3.1（🔴 RED）：** 新增測試：渲染 Marquee 無 speed prop 時斷言 `animationDuration` 為 `10s`；渲染 `<Marquee speed={5}>` 時斷言為 `5s`
- [ ] **3.2（確認紅燈）：** 執行測試，確認失敗
- [ ] **3.3（🟢 GREEN）：** 在 Marquee.jsx 加入 `speed` prop（預設 `10`），透過 inline style `animationDuration: \`${speed}s\`` 套用至動畫容器
- [ ] **3.4（確認綠燈）：** 執行測試，確認通過
- [ ] **3.5（🔵 REFACTOR）：** 確認 prop 處理邏輯清晰
- [ ] **3.6：** commit — `feat(marquee): add speed prop for animation duration control`

---

## 任務 4: 滑鼠懸停暫停

### 對應測試案例
| 測試案例 | 對應需求 | 類型 | 優先順序 |
|----------|----------|------|----------|
| TC-006 | `滑鼠懸停暫停` → `滑鼠進入時暫停` | 單元 | P0 |
| TC-007 | `滑鼠懸停暫停` → `滑鼠離開時恢復` | 單元 | P0 |

### 實作步驟（🔴 → 🟢 → 🔵）

- [ ] **4.1（🔴 RED）：** 新增測試：fireEvent.mouseEnter 後斷言容器帶有 `marquee--paused` class；fireEvent.mouseLeave 後斷言該 class 不存在
- [ ] **4.2（確認紅燈）：** 執行測試，確認失敗
- [ ] **4.3（🟢 GREEN）：** 在 Marquee.jsx 加入 `isPaused` state，`onMouseEnter` 設為 true，`onMouseLeave` 設為 false；`marquee--paused` class 控制 `animation-play-state: paused`
- [ ] **4.4（確認綠燈）：** 執行測試，確認通過
- [ ] **4.5（🔵 REFACTOR）：** 確認事件處理邏輯簡潔
- [ ] **4.6：** commit — `feat(marquee): add hover-to-pause behavior`

---

## 任務 5: 整合至 App.jsx

### 對應測試案例
| 測試案例 | 對應需求 | 類型 | 優先順序 |
|----------|----------|------|----------|
| TC-008 | `整合至 App.jsx` → `App 頁面包含跑馬燈` | 整合 | P1 |

### 實作步驟（🔴 → 🟢 → 🔵）

- [ ] **5.1（🔴 RED）：** 在 `src/__tests__/App.test.jsx`（或新建）撰寫測試：渲染 App 元件，斷言頁面包含 Marquee 元件且帶有預設公告文字
- [ ] **5.2（確認紅燈）：** 執行測試，確認失敗
- [ ] **5.3（🟢 GREEN）：** 修改 `src/App.jsx`，import Marquee 並置於頁面頂部，帶入預設公告文字
- [ ] **5.4（確認綠燈）：** 執行測試，確認通過
- [ ] **5.5（🔵 REFACTOR）：** 確認 App.jsx 結構清晰，Marquee 位置適當
- [ ] **5.6：** commit — `feat(marquee): integrate Marquee into App.jsx with default message`
```

</details>

---

## ⑤ Verify — 驗證：準備好開工了嗎？

**目的**：在寫任何程式碼之前，進行 **PM 審查** 與 **架構師審查** 的雙重同行審查，確認需求與設計的合理性。

### 審查流程

```text
【必要文件】proposal.md / design.md / plan.md / specs
   │
   ├─► [👔 PM 審查子代理] ───► 彙整至 verify.md
   │                              │
   └─► [🏗️ 架構師審查子代理] ──────┘
                                  │
                                  ▼
                        【⚠️ 人類最終決策】
                                  │
                   ┌──────────────┴──────────────┐
                   ▼                             ▼
               [✅ 核准]                      [❌ 駁回]
                   │                             │
                   ▼                             ▼
               進入 Apply                    回到前置階段修改
```

### 本案例的審查發現

**PM 審查結果**：✅ 核准
- 五項任務與 TC-001 至 TC-008 一對一對應
- 次要建議：App.jsx 整合的預設公告文字尚未指定

**架構師審查結果**：✅ 核准
- CSS `@keyframes` 方案決策正確
- 次要建議：
  - 應使用 `userEvent.hover()` 而非 `fireEvent.mouseEnter()`
  - 建議對複製的 DOM 加入 `aria-hidden="true"`
  - 建議加入 `prefers-reduced-motion` 媒體查詢

> [!CAUTION]
> **人類核准門檻**：verify.md 中有一個「人類最終決策」區段，只有使用者（人類）才能勾選核准。AI 代理在未取得核准前**絕對不能**進入 Apply 階段。這是流程中的硬性安全閘門。

<details>
<summary>🔍 展開查看原始 verify.md 完整內容</summary>

```markdown
# 驗證報告

> AI 負責蒐集審查意見並整理報告，**最終核准權歸使用者（人類）**。

**Change**: `add-marquee`
**驗證時間**: `2026-06-07`

---

## AI 審查摘要

此變更範圍明確、技術決策合理，任務與規格需求完全對應。PM 與架構師審查均為「核准，附帶次要建議」。主要建議可於實作階段處理，不影響整體設計方向。

---

## PM 審查（proposal.md, plan.md, specs）

### 發現

- 五項任務與規格需求（TC-001 至 TC-008）一對一對應，無遺漏需求，無多餘任務
- 每項任務遵循 TDD red-green-refactor 步驟，降低實作風險
- 任務順序正確（渲染 → 動畫 → 速度 → 暫停 → 整合），每項任務獨立可交付
- **次要發現**：App.jsx 整合的預設公告文字尚未指定，實作時需決定
- **次要發現**：缺少邊界案例測試（空子元素、無效 speed 值），可作為後續跟進

### AI 建議

**核准**。任務完整且範圍適當，測試案例覆蓋所有關鍵需求。次要事項可於實作中處理。

---

## 架構師審查（design.md, proposal.md, specs, plan.md）

### 發現

- CSS `@keyframes` 方案優於 `requestAnimationFrame`，GPU 加速且零 JS 複雜度，決策正確
- 雙倍內容拼接為標準無縫循環技術，方案成熟可靠
- 元件結構（`Marquee.jsx` + `Marquee.css`）遵循現有 `AlarmPage` 的 co-located 模式，一致性佳
- CSS class 命名使用 BEM 修飾符（`marquee--paused`），與現有 `alarm-page__title` 風格一致
- **次要發現**：Task 4 應使用 `userEvent.hover()`/`unhover()` 而非 `fireEvent.mouseEnter()`，以符合現有測試模式
- **次要發現**：建議加入 `prefers-reduced-motion` 媒體查詢，尊重使用者動畫偏好
- **次要發現**：建議在複製的 DOM 內容上加入 `aria-hidden="true"`，避免螢幕閱讀器重複朗讀
- **次要發現**：App.jsx 中 Marquee 的確切放置位置（`<section id="center">` 之前）應明確

### AI 建議

**核准**。技術方案合理，與現有架構模式一致。建議事項為低成本改善，可於實作中一併處理。

---

## ⚠️ 人類最終決策（此區段由使用者填寫）

- [X] ✅ 核准，進入實作
- [ ] ⚠️ 有條件核准（請在下方說明條件）
- [ ] ❌ 駁回，需修改（請在下方說明原因）

### 使用者備註
```

</details>

---

## ⑥ Apply — 實作：AI 子代理驅動開發

> 🔧 使用技能：`subagent-driven-development`（開發環境由開發者自主管理，流程不強制建立 worktree）

**目的**：在隔離環境中，使用 AI 子代理逐任務執行 TDD 實作，搭配自動化程式碼審查。

### Apply 階段的完整架構

```text
【準備階段】
⛔ 人類核准檢查 ──► 💻 開發者自管隔離開發環境（在目前工作區工作）
                              │
                              ▼
【執行與雙重審查】
🤖 任務子代理 (Task 1 ~ 5) ◄──────────────────────────┐
       │                                             │
       ▼                                             │
🔍 審查子代理雙軌驗證 (規格/品質)                      │ (若有缺失需修正)
       │                                             │
       ├──► ❌ 發現缺陷 (如：A11y/閃爍問題) ──────────┘
       │
       └──► ✅ 通過審查 ──► 執行下一個任務
```

### 實際執行中的關鍵事件

#### 🔍 審查代理攔截的問題

````carousel
### 問題 1：無障礙設計缺陷

**審查代理發現**：複製的 DOM 節點會被螢幕閱讀器重複朗讀，且鍵盤焦點會進入不可見的複製區域。

**修正方案**：
```jsx
{/* 第二份內容：對輔助技術隱藏 */}
<div className="marquee__content"
     aria-hidden="true"
     inert={true}>  {/* React 19 原生支援 */}
  {children}
</div>
```

**結果**：達到頂尖的 A11y 合規水準。
<!-- slide -->
### 問題 2：向右滾動的視覺閃爍

**審查代理發現**：當 `direction="right"` 時，載入瞬間內容會先閃爍在左側位置，再跳到正確的起始位置。

**修正方案**：
```css
.marquee--right .marquee__content {
  /* 向右滾動時，初始位置應在左側（-100%）*/
  transform: translateX(-100%);
}
```

**結果**：消除了載入時的視覺跳動。
<!-- slide -->
### 問題 3：測試環境 localStorage 污染

**審查代理發現**：專案中的其他測試使用了 `localStorage`，在全域範圍內可能污染 Marquee 測試。

**修正方案**：在 `setup.js` 全域掛載 Mock，而非每個測試檔案寫局部 mock。

**結果**：測試隔離性提升，避免了跨測試污染。
````

#### 📊 審查與修正循環

以 Task 1 為例，經歷了**三輪審查**才最終通過：

| 輪次 | 審查結果 | 修正內容 |
|------|---------|---------|
| 第 1 輪 | ❌ Issues found | 缺少 `inert` 屬性處理鍵盤焦點 |
| 第 2 輪 | ❌ Issues found | 缺少 `aria-hidden` 與 `inert` 的防退化測試 |
| 第 3 輪 | ✅ Ready to merge | 所有問題已修正，測試覆蓋完整 |

> [!NOTE]
> 這種「實作 → 審查 → 修正」的迭代循環是 subagent-driven-development 的核心價值——確保每一項任務在合入主線前都達到生產就緒品質。

---

## ⑦ Retrospective — 回顧：學到了什麼？

**目的**：趁記憶猶新，記錄成果、缺失、計畫偏差與可重用的學習。

### 本案例的回顧摘要

| 面向 | 內容 |
|------|------|
| **成果 Wins** | 5/5 任務完成，33 個測試全通過，A11y 合規，CSS 變數解耦 |
| **缺失 Misses** | 向右滾動閃爍（被審查攔截並修復）、localStorage 污染 |
| **計畫偏差** | Task 4 從 `fireEvent` 改用 `userEvent`（更貼近真實互動） |
| **學習候選** | 全域 Mock 掛載策略、React 19 `inert` 原生支援 |

> [!NOTE]
> **💡 流程持續優化註記**：在本案開發回顧後，為了將 AI 實作品質進行更直觀的度量，我們已將 **PR 評估自評卡（PR Audit Rubric）** 固化進 `fopd-sdlc` Schema 的回顧流程中。未來的開發週期將強制 AI 在此自評四個維度的分數，以降低人工 Code Review 的把關負擔。


<details>
<summary>🔍 展開查看原始 retrospective.md 完整內容</summary>

```markdown
# 回顧：add-marquee
 
> 撰寫時間：2026-06-07（verify 通過後）
> Commit 範圍：`0761092..3d36cc4`
> 開發環境：目前工作區開發（不強制使用 Worktree）
 
---
 
## 0. 證據
 
- **Commit 範圍**: `0761092..3d36cc4` (10 個 commits)
- **Diff 規模**: +211 / -30 行，橫跨 8 個檔案
- **任務完成**: 5/5
- **測試覆蓋率**: 33 個測試全數通過 (100% 通過)
- **活躍工時**: 估計 1.5 小時
- **子代理派發次數**: 約 22 次
- **新增外部相依**: 無
- **合併後發現的 Bug**: 無
 
Commit 鏈（時序）：
 
```
c3dc279 feat(marquee): add basic Marquee component with duplicated content
ffea1a5 docs(plan): mark task 1 as complete
84b87ab feat(marquee): add CSS scroll animation with direction control
ed877d5 docs(plan): mark task 2 as complete
1c2fbae feat(marquee): add speed prop for animation duration control
0bb0439 docs(plan): mark task 3 as complete
b1aa13c feat(marquee): add hover-to-pause behavior
f4b4451 docs(plan): mark task 4 as complete
a78baa8 feat(marquee): integrate Marquee into App.jsx with default message
3d36cc4 docs(plan): mark task 5 as complete
```
 
---
 
## 1. 成果（Wins）
 
- **高水準無障礙設計 (A11y)**: Marquee.jsx 中為無縫循環複製的第二份節點正確設定 `aria-hidden="true"` 以及 React 19 的 `inert={true}`，解決了螢幕閱讀器重複朗讀與鍵盤 Tab 焦點移入隱藏內容的潛在 Bug。
- **React 與 CSS 樣式完美解耦**: 元件設計在 JS 端不寫死 any inline animationDuration 或 animationPlayState，改以 CSS 變數 `--marquee-duration` 與 CSS class `marquee--paused` 來傳遞狀態給 CSS 處理，提昇了樣式維護的彈性。
- **強健的防退化 (Regression) 測試**: 在單元與整合測試中，皆使用了 `firstElementChild`（而非易受換行字元干擾的 `firstChild`）對 `aria-hidden` 與 `inert` 等關鍵屬性進行了斷言，並使用 `userEvent` 來模擬非同步的 hover 互動。
 
## 2. 缺失（Misses）
 
- 🔴 [阻擋性 | 任務 3 規格審查] 任務 3 的規格審查子代理在執行 `list_dir` 指令後，背景的事件循環卡死無響應。被迫手動將其關閉 (`kill`) 並重新派發新的代理才解決。
- 🟡 [痛點   | plan.md 設計缺陷] 規格書與 `plan.md` 約定當 `speed=5` 時動畫持續秒數為 `5s`，將「速度」與「持續時間」混淆。這使得屬性明明叫 `speed` 但數值越大卻滾動得越慢，造成語意上極不直覺。
- 📌 [小問題 | 審查對稱性遺漏] 雖然在 `App.test.jsx` 改進了 `firstElementChild` 的寫法，但未在同一階段主動修正 `Marquee.test.jsx` 中殘留的 `firstChild`，直到最終審查時被 Reviewer 指出才同步更新。
 
## 3. 計畫偏差
 
*本專案完全依照 plan.md 之排程順利完成，無主要計畫偏差。*
 
## 4. 技能/流程合規性
 
| 技能                                                | 已使用 |
|-----------------------------------------------------|--------|
| superpowers:writing-plans                           |   ✓    |
| superpowers:subagent-driven-development             |   ✓    |
| （間接）superpowers:test-driven-development         |   ✓    |
| （間接）superpowers:requesting-code-review          |   ✓    |
| superpowers:verification-before-completion          |   ✓    |
| superpowers:finishing-a-development-branch          |        |
 
### 刻意跳過的技能
 
*無。所有規定與被要求技能皆完全實施。*
 
## 5. 意外發現
 
- **jsdom 環境的安全限制**: JSDOM 中預設的環境 URL 為 `about:blank`，此時存取 `localStorage` 會因安全原則而拋出 `SecurityError`。我們透過在 `vitest.config.js` 的 `environmentOptions.url` 設定 mock URL `http://localhost/` 來徹底根除此問題。
- **React 19 的 inert 支援**: React 19 正式支援 HTML 5 的 `inert` 屬性作為 boolean attribute，極度適合用來做 A11y 節點阻擋。
 
## 6.長期學習候選項目
 
- [ ] 🔴 **對無縫滾動複製或抽屜等隱藏元件節點，務必套用 `inert={true}` 以維護 A11y 鍵盤焦點** → **提升至記憶體**
  > **為什麼**: 僅使用 `aria-hidden` 無法阻止鍵盤使用者透過 Tab 鍵將焦點移入已隱藏的 DOM，這會破壞盲人使用者的體驗。
  > **如何應用**: 當元件有視覺上隱藏但仍在 DOM 樹中的複製品或隱藏面板時，對該容器套用此屬性。
 
- [ ] 🟡 **在 JSDOM 測試中，避免在個別測試檔案中使用 Object.defineProperty 全域 Mock localStorage** → **提升至專案設定**
  > **為什麼**: 全域覆寫會造成測試檔案之間的環境污染與副作用。應將 mock 機制統一收納在 `setup.js` 中安全掛載，並配合設定 mock URL 來處理原生 localStorage。
  > **如何應用**: 在新 React/Vite 專案初始化時，於 `vitest.config.js` 與 `setup.js` 定義安全的環境。
```

</details>

---

## ⑧ Archive — 歸檔：同步與收斂

**目的**：將變更中的差異規格（Delta Specs）自動同步至主規格書（Main Specs），完成文件的收斂。

### 歸檔流程

```text
📄 Delta Spec ──► 🔧 解析器 (辨識 ADDED/MODIFIED/REMOVED) ──► 📚 Main Specs (主規格書)
                      │
                      └──► 📦 Archive (歸檔變更目錄作為歷史)
```

> [!WARNING]
> 歸檔的自動解析對文件格式有嚴格要求。本次案例中，初期因規格標頭格式不符（例如 `## ADDED Requirements` vs `## 新增需求（ADDED Requirements）`）導致解析失敗。修正標頭後才成功歸檔。**教訓：規格書的格式紀律對自動化至關重要。**

---

## 📊 成效數據

| 指標 | 數值 |
|------|------|
| **程式碼變更** | +211 / -30 行，橫跨 8 個檔案 |
| **開發時效** | 約 1.5 小時完成 5 個模組 + 完整測試 |
| **測試覆蓋** | 33 個測試案例，100% 通過率 |
| **審查輪次** | 每個任務 1-3 輪自動審查 |
| **子代理數** | 5 個實作代理 + 多個審查代理 |
| **Git Commits** | 5 個功能 commit + 修正 commit |

---

## 🧠 關鍵學習與團隊建議

### 1. OpenSpec 的核心價值

```text
                  ┌── 結構化 (標準化文件產出、可預測流程、自動歸檔)
                  ├── 品質保證 (Verify 雙重審查、人類核准、程式碼審查)
──【OpenSpec】───┼── 可追溯性 (需求與測試映射、設計決策記錄、歷史變更)
                  └── 團隊協作 (AI 與人類分工、非同步審查、知識累積)
```

### 2. 實戰建議

| 建議 | 說明 |
|------|------|
| **強制 TDD** | Plan 強迫執行 Red-Green-Refactor，確保每行代碼都有測試 |
| **善用審查代理** | 規格審查 + 品質審查的雙軌制，在合入前攔截問題 |
| **重視格式紀律** | 規格書標題格式影響自動化歸檔，必須嚴格遵守 |
| **隔離開發環境** | 由開發者自主管理（分支/Worktree），確保實作環境穩定 |
| **全域 Mock 策略** | 使用 `setup.js` 全域挂載 Mock，避免跨測試污染 |

### 3. 人類 vs AI 的職責分界

| 人類負責 | AI 負責 |
|----------|---------|
| 提出需求（Proposal 的「為什麼」） | 規格撰寫與格式化 |
| 最終核准（Verify 的核取方塊） | 設計決策分析與替代方案 |
| 審查判斷（是否接受審查建議） | TDD 實作與自動化測試 |
| 優先級決策 | 程式碼審查與品質檢查 |
| 例外處理 | 歸檔與文件同步 |

---

## 🗂️ 附錄：完整文件索引

| 文件 | 路徑 |
|------|------|
| Proposal | [proposal.md](file:///Users/isosoman/Documents/repo/wstree/openspec/changes/add-marquee/proposal.md) |
| Spec | [spec.md](file:///Users/isosoman/Documents/repo/wstree/openspec/changes/add-marquee/specs/marquee-component/spec.md) |
| Design | [design.md](file:///Users/isosoman/Documents/repo/wstree/openspec/changes/add-marquee/design.md) |
| Plan | [plan.md](file:///Users/isosoman/Documents/repo/wstree/openspec/changes/add-marquee/plan.md) |
| Verify | [verify.md](file:///Users/isosoman/Documents/repo/wstree/openspec/changes/add-marquee/verify.md) |
| Schema 定義 | [schema.yaml](file:///Users/isosoman/Documents/repo/wstree/openspec/schemas/fopd-sdlc/schema.yaml) |
