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
