## 背景

React App 目前僅包含鬧鐘功能（AlarmPage），為單頁應用，無路由機制。所有資料皆為本地狀態（localStorage + React hooks），無外部 API 呼叫。技術棧：React 19、Vite 8、Vitest 4、@testing-library/react，純 JavaScript（非 TypeScript）。

現在需要新增全球天氣資訊功能，這將是應用首次引入：
- 外部 API 整合（Open-Meteo 免費天氣 API）
- 多頁面導航需求（天氣頁 + 鬧鐘頁）
- 遠端資料的載入與錯誤狀態處理

## 目標 / 非目標

**目標：**
- 整合 Open-Meteo API 取得世界主要城市的即時天氣資料
- 以卡片式 UI 展示各城市天氣資訊
- 提供城市搜尋與區域篩選功能
- 支援攝氏/華氏溫度單位切換
- 遵循現有專案慣例：自訂 hooks、元件拆分、JSDoc 型別、Vitest 測試

**非目標：**
- 不實作天氣預報（僅當前天氣）
- 不實作使用者自訂城市（使用預設城市列表）
- 不實作地理位置定位
- 不引入新的狀態管理或 HTTP 套件
- 不引入 TypeScript

## 決策

### 1. 天氣 API 選擇：Open-Meteo

**選擇**：Open-Meteo Free API
**替代方案**：OpenWeatherMap（需 API Key）、WeatherAPI（需註冊）
**理由**：Open-Meteo 完全免費、無需 API Key、無需註冊，且提供穩定的即時天氣端點。使用瀏覽器原生 `fetch` 呼叫，不增加依賴。

### 2. 頁面導航：Hash-based Tab 切換

**選擇**：以 state-based tab 切換（無路由函式庫）
**替代方案**：React Router、TanStack Router
**理由**：目前僅有兩個頁面（鬧鐘 + 天氣），不需引入路由函式庫。使用簡單的 `activeTab` state 在 App.jsx 中切換頁面元件，保持最小依賴。

### 3. 城市資料結構

**選擇**：內建靜態城市列表（約 30-40 個主要城市），含經緯度座標
**替代方案**：使用 Geocoding API 動態搜尋、讓使用者自行新增城市
**理由**：MVP 階段使用靜態列表確保穩定性與效能。城市資料包含名稱、國家、區域（亞洲/歐洲/美洲/非洲/大洋洲）、經緯度。

### 4. 資料抓取架構

**選擇**：自訂 Hook `useWeatherData`，管理 API 呼叫、載入狀態、錯誤處理與快取
**替代方案**：React Query / SWR
**理由**：遵循現有 hooks 慣例（useAlarms、useAlarmChecker）。使用 `useState` + `useEffect` + `useCallback`，資料快取於 hook 內的 `useRef`（避免重複請求相同城市）。

### 5. 元件架構

```
App.jsx (tab 切換)
├── AlarmPage.jsx (既有)
└── WeatherPage.jsx (新增 — orchestrator)
    ├── CitySearchBar.jsx (搜尋 + 區域篩選 + 單位切換)
    ├── WeatherCardGrid.jsx (卡片排列)
    └── WeatherCard.jsx (單一城市天氣卡片)
```

## 可測試性考量

- **API mock 邊界**：`useWeatherData` hook 中的 `fetch` 呼叫可透過 `vi.fn()` 或 `vi.spyOn(global, 'fetch')` 模擬
- **靜態城市資料**：城市列表從獨立模組匯出（`data/cities.js`），測試可直接引用
- **純函式拆分**：溫度轉換函式（`convertTemperature`）、天氣代碼對應（`getWeatherDescription`）為純函式，獨立可測試
- **元件測試**：使用 @testing-library/react 的 `render` + `screen` + `userEvent`，與現有測試慣例一致
- **測試檔案結構**：`src/__tests__/WeatherPage.test.jsx`、`WeatherCard.test.jsx` 等，遵循現有命名慣例

## 風險 / 取捨

- **[Open-Meteo API 可用性]** → 實作錯誤狀態 UI 與重試機制，fallback 顯示「無法取得天氣資料」
- **[API 呼叫頻率限制]** → 使用 `useRef` 快取已取得的天氣資料，避免重複請求；提供手動重新整理按鈕
- **[大量城市同時請求]** → 使用 `Promise.allSettled` 批次請求，不因單一城市失敗而影響整體
- **[無 TypeScript]** → 使用 JSDoc 型別定義（`types/weather.js`），與現有 `types/alarm.js` 慣例一致
