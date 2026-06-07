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
  - 套用正確的 CSS class（方向、速度）
  - 滑鼠懸停觸發暫停狀態
  - 滑鼠離開恢復播放狀態

## 風險 / 取捨

- [不同瀏覽器動畫效能差異] → CSS animation 瀏覽器支援度高（>97%），風險極低
- [內容過短時無縫循環不明顯] → 雙倍拼接策略確保最小滾動距離，可接受
- [無障礙支援有限] → 非目標範圍，未來迭代可加入 `aria-live` 屬性
