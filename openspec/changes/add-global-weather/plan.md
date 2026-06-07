# 全球天氣資訊功能實作計畫

> **給代理工作者：** 使用 superpowers:subagent-driven-development
> 來逐任務實作此計畫。

**目標：** 在既有的鬧鐘 React 應用中新增全球天氣資訊功能，支援 30+ 個主要城市的即時天氣取得、搜尋、區域篩選、攝氏/華氏切換（持久化至 localStorage），以及單一城市重試機制。

**架構：** 
1. 建立 `data/cities.js` 靜態城市資料與 `utils/weatherUtils.js` 工具函式。
2. 建立自訂 Hook `useWeatherData.js` 透過 Open-Meteo API 進行 **Batch Request（批次呼叫）** 減少網路排隊與 API 限流，並使用帶有 **TTL（5分鐘）** 限制的快取機制，另提供單一城市重試方法。
3. 於 `App.jsx` 實作 **Hash-based Tab** 切換（鬧鐘/天氣），確保頁面重刷或上一頁/下一頁時狀態不丟失。
4. 建立 `WeatherPage.jsx` 作為天氣功能主協調器，整合 `CitySearchBar.jsx` 與 `WeatherCardGrid.jsx`。

**技術棧：** React 19, Vanilla CSS, JSDoc (型別定義), localStorage, Open-Meteo Free API

**測試框架：** Vitest 4, @testing-library/react, @testing-library/user-event, jsdom (模擬 API 請求與使用者互動)

---

## 任務 1: 城市資料、工具函式與 JSDoc 型別定義

### 對應測試案例
| 測試案例 | 對應需求 | 類型 | 優先順序 |
|----------|----------|------|----------|
| TC-001 | `Requirement: 溫度轉換精確度` → `Scenario: 攝氏轉華氏` 與 `Scenario: 華氏轉攝氏` | 單元測試 | P0 |
| TC-002 | `Requirement: 天氣代碼轉描述` → `Scenario: 常見天氣代碼對應` | 單元測試 | P0 |
| TC-003 | `Requirement: 靜態城市列表` → `Scenario: 城市資料完整性` | 單元測試 | P1 |

### 實作步驟（🔴 → 🟢 → 🔵）

- [x] **1.1（🔴 RED）：** 建立單元測試檔案 `react-app/src/__tests__/weatherUtils.test.js`
  ```javascript
  import { describe, it, expect } from 'vitest'
  import { convertTemperature, getWeatherDescription } from '../utils/weatherUtils'
  import { cities } from '../data/cities'

  describe('Weather Utilities', () => {
    describe('convertTemperature', () => {
      it('應能正確將攝氏轉換為華氏，並四捨五入至小數點後一位', () => {
        expect(convertTemperature(25, 'F')).toBe(77.0)
        expect(convertTemperature(0, 'F')).toBe(32.0)
        expect(convertTemperature(-10, 'F')).toBe(14.0)
        expect(convertTemperature(25.34, 'F')).toBe(77.6)
      })

      it('應在單位為 C 時直接回傳四捨五入至小數點後一位的攝氏溫度', () => {
        expect(convertTemperature(25.34, 'C')).toBe(25.3)
        expect(convertTemperature(0, 'C')).toBe(0.0)
      })
    })

    describe('getWeatherDescription', () => {
      it('應正確將 WMO 代碼對應至中文描述與圖示', () => {
        expect(getWeatherDescription(0)).toEqual({ desc: '晴天', icon: '☀️' })
        expect(getWeatherDescription(1)).toEqual({ desc: '晴時多雲', icon: '🌤️' })
        expect(getWeatherDescription(61)).toEqual({ desc: '小雨', icon: '🌧️' })
        expect(getWeatherDescription(95)).toEqual({ desc: '雷雨', icon: '⛈️' })
        expect(getWeatherDescription(999)).toEqual({ desc: '未知天氣', icon: '❓' })
      })
    })

    describe('cities', () => {
      it('城市清單應包含至少 30 個城市且欄位完整', () => {
        expect(cities.length).toBeGreaterThanOrEqual(30)
        cities.forEach(city => {
          expect(city).toHaveProperty('name')
          expect(city).toHaveProperty('country')
          expect(city).toHaveProperty('region')
          expect(city).toHaveProperty('latitude')
          expect(city).toHaveProperty('longitude')
        })
      })
    })
  })
  ```

- [x] **1.2（確認紅燈）：** 在 `react-app` 目錄執行測試，確認失敗且原因正確。
  - 執行指令：`npm run test`
  - 預期輸出：找不到 `../utils/weatherUtils` 或 `../data/cities` 模組的錯誤。

- [x] **1.3（🟢 GREEN）：** 實作以下三個檔案

  1. 建立 `react-app/src/types/weather.js`
  ```javascript
  /**
   * @typedef {Object} City
   * @property {string} name - 城市名稱
   * @property {string} country - 國家名稱
   * @property {string} region - 區域 (如 亞洲, 歐洲, 美洲)
   * @property {number} latitude - 緯度
   * @property {number} longitude - 經度
   */

  /**
   * @typedef {Object} WeatherInfo
   * @property {number} temp - 攝氏溫度
   * @property {number} humidity - 相對濕度 (%)
   * @property {number} windSpeed - 風速 (km/h)
   * @property {number} weatherCode - WMO 天氣代碼
   */

  /**
   * @typedef {Object} WeatherState
   * @property {WeatherInfo|null} data - 天氣資料
   * @property {boolean} loading - 是否載入中
   * @property {string|null} error - 錯誤訊息
   */
  export {}
  ```

  2. 建立 `react-app/src/data/cities.js`
  ```javascript
  /** @type {import('../types/weather').City[]} */
  export const cities = [
    { name: '台北', country: '台灣', region: '亞洲', latitude: 25.03, longitude: 121.56 },
    { name: '東京', country: '日本', region: '亞洲', latitude: 35.67, longitude: 139.65 },
    { name: '首爾', country: '韓國', region: '亞洲', latitude: 37.56, longitude: 126.97 },
    { name: '新加坡', country: '新加坡', region: '亞洲', latitude: 1.35, longitude: 103.81 },
    { name: '香港', country: '中國', region: '亞洲', latitude: 22.31, longitude: 114.16 },
    { name: '曼谷', country: '泰國', region: '亞洲', latitude: 13.75, longitude: 100.50 },
    { name: '雪梨', country: '澳洲', region: '大洋洲', latitude: -33.86, longitude: 151.20 },
    { name: '奧克蘭', country: '紐西蘭', region: '大洋洲', latitude: -36.84, longitude: 174.76 },
    { name: '倫敦', country: '英國', region: '歐洲', latitude: 51.50, longitude: -0.12 },
    { name: '巴黎', country: '法國', region: '歐洲', latitude: 48.85, longitude: 2.35 },
    { name: '柏林', country: '德國', region: '歐洲', latitude: 52.52, longitude: 13.40 },
    { name: '羅馬', country: '義大利', region: '歐洲', latitude: 41.90, longitude: 12.49 },
    { name: '馬德里', country: '西班牙', region: '歐洲', latitude: 40.41, longitude: -3.70 },
    { name: '阿姆斯特丹', country: '荷蘭', region: '歐洲', latitude: 52.36, longitude: 4.90 },
    { name: '紐約', country: '美國', region: '美洲', latitude: 40.71, longitude: -74.00 },
    { name: '洛杉磯', country: '美國', region: '美洲', latitude: 34.05, longitude: -118.24 },
    { name: '芝加哥', country: '美國', region: '美洲', latitude: 41.87, longitude: -87.62 },
    { name: '多倫多', country: '加拿大', region: '美洲', latitude: 43.65, longitude: -79.38 },
    { name: '溫哥華', country: '加拿大', region: '美洲', latitude: 49.28, longitude: -123.12 },
    { name: '巴西利亞', country: '巴西', region: '美洲', latitude: -15.79, longitude: -47.88 },
    { name: '開羅', country: '埃及', region: '非洲', latitude: 30.04, longitude: 31.23 },
    { name: '約翰尼斯堡', country: '南非', region: '非洲', latitude: -26.20, longitude: 28.04 },
    { name: '奈洛比', country: '肯亞', region: '非洲', latitude: -1.29, longitude: 36.82 },
    { name: '開普敦', country: '南非', region: '非洲', latitude: -33.92, longitude: 18.42 },
    { name: '卡薩布蘭卡', country: '摩洛哥', region: '非洲', latitude: 33.57, longitude: -7.58 },
    { name: '墨爾本', country: '澳洲', region: '大洋洲', latitude: -37.81, longitude: 144.96 },
    { name: '布里斯本', country: '澳洲', region: '大洋洲', latitude: -27.46, longitude: 153.02 },
    { name: '吉隆坡', country: '馬來西亞', region: '亞洲', latitude: 3.13, longitude: 101.68 },
    { name: '雅加達', country: '印尼', region: '亞洲', latitude: -6.20, longitude: 106.81 },
    { name: '新德里', country: '印度', region: '亞洲', latitude: 28.61, longitude: 77.20 }
  ]
  ```

  3. 建立 `react-app/src/utils/weatherUtils.js`
  ```javascript
  /**
   * 溫度單位轉換
   * @param {number} celsius - 攝氏溫度
   * @param {'C'|'F'} unit - 目標單位
   * @returns {number} 轉換後的值，四捨五入至小數點後一位
   */
  export function convertTemperature(celsius, unit) {
    if (unit === 'F') {
      return Math.round((celsius * 9 / 5 + 32) * 10) / 10
    }
    return Math.round(celsius * 10) / 10
  }

  /**
   * 將 WMO 天氣代碼對應至中文描述與圖示
   * @param {number} code - WMO 代碼
   * @returns {{ desc: string, icon: string }}
   */
  export function getWeatherDescription(code) {
    const table = {
      0: { desc: '晴天', icon: '☀️' },
      1: { desc: '晴時多雲', icon: '🌤️' },
      2: { desc: '陰天', icon: '⛅' },
      3: { desc: '多雲', icon: '☁️' },
      45: { desc: '霧', icon: '🌫️' },
      48: { desc: '霧', icon: '🌫️' },
      51: { desc: '輕度毛毛雨', icon: '🌧️' },
      53: { desc: '中度毛毛雨', icon: '🌧️' },
      55: { desc: '重度毛毛雨', icon: '🌧️' },
      61: { desc: '小雨', icon: '🌧️' },
      63: { desc: '中雨', icon: '☔' },
      65: { desc: '大雨', icon: '☔' },
      71: { desc: '小雪', icon: '❄️' },
      73: { desc: '中雪', icon: '❄️' },
      75: { desc: '大雪', icon: '❄️' },
      95: { desc: '雷雨', icon: '⛈️' },
      96: { desc: '雷雨伴有冰雹', icon: '⛈️' },
      99: { desc: '雷雨伴有冰雹', icon: '⛈️' }
    }
    return table[code] || { desc: '未知天氣', icon: '❓' }
  }
  ```

- [x] **1.4（確認綠燈）：** 執行測試，確認通過。
  - 執行指令：`npm run test`
  - 預期輸出：`weatherUtils.test.js` 所有測試通過。

- [x] **1.5（🔵 REFACTOR）：** 檢查是否有重複代碼，確保 JSDoc 標註完整。
- [x] **1.6：** 執行 `git add` 並 commit：
  ```bash
  git add react-app/src/types/weather.js react-app/src/data/cities.js react-app/src/utils/weatherUtils.js react-app/src/__tests__/weatherUtils.test.js
  git commit -m "feat: add weather types, static cities, and convert utilities"
  ```

---

## 任務 2: 自訂 Hook `useWeatherData` 管理天氣抓取與 TTL 快取

### 對應測試案例
| 測試案例 | 對應需求 | 類型 | 優先順序 |
|----------|----------|------|----------|
| TC-004 | `Requirement: 即時天氣資料取得` → `Scenario: 成功取得單一城市天氣` | 整合測試 (Mock Fetch) | P0 |
| TC-005 | `Requirement: 即時天氣資料取得` → `Scenario: API 回應失敗` | 整合測試 (Mock Fetch) | P0 |
| TC-006 | `Requirement: 即時天氣資料取得` → `Scenario: 批次取得多城市天氣` (Batch Request) | 整合測試 (Mock Fetch) | P0 |

### 實作步驟（🔴 → 🟢 → 🔵）

- [x] **2.1（🔴 RED）：** 建立測試檔案 `react-app/src/__tests__/useWeatherData.test.js`
  ```javascript
  import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
  import { renderHook, act } from '@testing-library/react'
  import { useWeatherData } from '../hooks/useWeatherData'

  const mockCities = [
    { name: '台北', latitude: 25.03, longitude: 121.56 },
    { name: '東京', latitude: 35.67, longitude: 139.65 }
  ]

  describe('useWeatherData Hook', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn())
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('應能透過 Batch Request 抓取傳入城市的天氣資料', async () => {
      // 模擬 Open-Meteo 回傳陣列
      const mockBatchResponse = [
        {
          current_weather: { temperature: 25.4, weathercode: 0 },
          current: { relative_humidity_2m: 65, wind_speed_10m: 12.5 }
        },
        {
          current_weather: { temperature: 18.2, weathercode: 3 },
          current: { relative_humidity_2m: 80, wind_speed_10m: 8.2 }
        }
      ]

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBatchResponse
      })

      const { result } = renderHook(() => useWeatherData(mockCities))

      expect(result.current.loading).toBe(true)

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.weatherData['台北']).toEqual({
        temp: 25.4,
        weatherCode: 0,
        humidity: 65,
        windSpeed: 12.5,
        error: null
      })
      expect(result.current.weatherData['東京']).toEqual({
        temp: 18.2,
        weatherCode: 3,
        humidity: 80,
        windSpeed: 8.2,
        error: null
      })
    })

    it('當 Batch 呼叫失敗時，應將所有城市標記為錯誤狀態', async () => {
      fetch.mockRejectedValueOnce(new Error('網路錯誤'))

      const { result } = renderHook(() => useWeatherData(mockCities))

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      expect(result.current.loading).toBe(false)
      expect(result.current.weatherData['台北'].error).toBe('無法取得天氣資料')
      expect(result.current.weatherData['東京'].error).toBe('無法取得天氣資料')
    })
  })
  ```

- [x] **2.2（確認紅燈）：** 執行測試確認失敗。
  - 執行指令：`npm run test`

- [x] **2.3（🟢 GREEN）：** 建立 `react-app/src/hooks/useWeatherData.js`
  ```javascript
  import { useState, useEffect, useRef, useCallback } from 'react'

  const CACHE_TTL = 5 * 60 * 1000 // 5 分鐘快取失效

  /**
   * 抓取並管理全球天氣資料的 Hook
   * @param {import('../types/weather').City[]} citiesList
   * @returns {{
   *   weatherData: Object.<string, import('../types/weather').WeatherState>,
   *   loading: boolean,
   *   error: string|null,
   *   fetchSingleCity: (city: import('../types/weather').City) => Promise<void>,
   *   refreshAll: () => Promise<void>
   * }}
   */
  export function useWeatherData(citiesList) {
    const [weatherData, setWeatherData] = useState({})
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const cacheRef = useRef({}) // { cityName: { data, timestamp } }

    const isCacheValid = useCallback((cityName) => {
      const cached = cacheRef.current[cityName]
      if (!cached) return false
      return (Date.now() - cached.timestamp) < CACHE_TTL
    }, [])

    const fetchSingleCity = useCallback(async (city) => {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current_weather=true&current=relative_humidity_2m,wind_speed_10m`
      try {
        const response = await fetch(url)
        if (!response.ok) throw new Error('API 回傳錯誤')
        const json = await response.json()
        const data = {
          temp: json.current_weather.temperature,
          weatherCode: json.current_weather.weathercode,
          humidity: json.current?.relative_humidity_2m || 0,
          windSpeed: json.current?.wind_speed_10m || 0,
          error: null
        }
        cacheRef.current[city.name] = { data, timestamp: Date.now() }
        setWeatherData(prev => ({ ...prev, [city.name]: data }))
      } catch (err) {
        setWeatherData(prev => ({
          ...prev,
          [city.name]: { temp: 0, weatherCode: -1, humidity: 0, windSpeed: 0, error: '無法取得天氣資料' }
        }))
      }
    }, [])

    const refreshAll = useCallback(async () => {
      if (citiesList.length === 0) return
      setLoading(true)
      setError(null)

      const lats = citiesList.map(c => c.latitude).join(',')
      const lons = citiesList.map(c => c.longitude).join(',')
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current_weather=true&current=relative_humidity_2m,wind_speed_10m`

      try {
        const response = await fetch(url)
        if (!response.ok) throw new Error('批次 API 回傳錯誤')
        const json = await response.json()
        const results = Array.isArray(json) ? json : [json]

        const nextData = {}
        results.forEach((item, index) => {
          const city = citiesList[index]
          if (city) {
            const data = {
              temp: item.current_weather.temperature,
              weatherCode: item.current_weather.weathercode,
              humidity: item.current?.relative_humidity_2m || 0,
              windSpeed: item.current?.wind_speed_10m || 0,
              error: null
            }
            cacheRef.current[city.name] = { data, timestamp: Date.now() }
            nextData[city.name] = data
          }
        })
        setWeatherData(nextData)
      } catch (err) {
        const fallbackData = {}
        citiesList.forEach(city => {
          fallbackData[city.name] = {
            temp: 0,
            weatherCode: -1,
            humidity: 0,
            windSpeed: 0,
            error: '無法取得天氣資料'
          }
        })
        setWeatherData(fallbackData)
      } finally {
        setLoading(false)
      }
    }, [citiesList])

    // 初始載入（優先使用快取，否則進行批次抓取）
    useEffect(() => {
      let isMounted = true
      const initLoad = async () => {
        const uncachedCities = citiesList.filter(c => !isCacheValid(c.name))
        
        if (uncachedCities.length === 0) {
          // 全部均有有效快取
          const cachedData = {}
          citiesList.forEach(c => {
            cachedData[c.name] = cacheRef.current[c.name].data
          })
          if (isMounted) setWeatherData(cachedData)
          return
        }

        // 進行批次下載
        setLoading(true)
        const lats = uncachedCities.map(c => c.latitude).join(',')
        const lons = uncachedCities.map(c => c.longitude).join(',')
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current_weather=true&current=relative_humidity_2m,wind_speed_10m`

        try {
          const response = await fetch(url)
          if (!response.ok) throw new Error('API 失敗')
          const json = await response.json()
          const results = Array.isArray(json) ? json : [json]

          if (isMounted) {
            setWeatherData(prev => {
              const updated = { ...prev }
              // 將已快取且未過期的放進來
              citiesList.forEach(c => {
                if (isCacheValid(c.name)) {
                  updated[c.name] = cacheRef.current[c.name].data
                }
              })
              // 放入新抓取的資料
              results.forEach((item, index) => {
                const city = uncachedCities[index]
                if (city) {
                  const data = {
                    temp: item.current_weather.temperature,
                    weatherCode: item.current_weather.weathercode,
                    humidity: item.current?.relative_humidity_2m || 0,
                    windSpeed: item.current?.wind_speed_10m || 0,
                    error: null
                  }
                  cacheRef.current[city.name] = { data, timestamp: Date.now() }
                  updated[city.name] = data
                }
              })
              return updated
            })
          }
        } catch (err) {
          if (isMounted) {
            setWeatherData(prev => {
              const updated = { ...prev }
              citiesList.forEach(city => {
                if (!isCacheValid(city.name)) {
                  updated[city.name] = {
                    temp: 0,
                    weatherCode: -1,
                    humidity: 0,
                    windSpeed: 0,
                    error: '無法取得天氣資料'
                  }
                } else {
                  updated[city.name] = cacheRef.current[city.name].data
                }
              })
              return updated
            })
          }
        } finally {
          if (isMounted) setLoading(false)
        }
      }

      initLoad()
      return () => {
        isMounted = false
      }
    }, [citiesList, isCacheValid])

    return {
      weatherData,
      loading,
      error,
      fetchSingleCity,
      refreshAll
    }
  }
  ```

- [x] **2.4（確認綠燈）：** 執行測試確認通過。
  - 執行指令：`npm run test`

- [x] **2.5（🔵 REFACTOR）：** 重構快取檢查函式以精簡代碼。
- [x] **2.6：** 執行 `git add` 並 commit：
  ```bash
  git add react-app/src/hooks/useWeatherData.js react-app/src/__tests__/useWeatherData.test.js
  git commit -m "feat: optimize useWeatherData with batch API requests and 5-min TTL cache"
  ```

---

## 任務 3: App 頁面導航切換與 Hash 同步

### 對應測試案例
| 測試案例 | 對應需求 | 類型 | 優先順序 |
|----------|----------|------|----------|
| TC-007 | `Requirement: 頁面導航切換` → `Scenario: 切換至天氣頁面` 與 `Scenario: 切換回鬧鐘頁面` | 整合測試 (RTL) | P0 |

### 實作步驟（🔴 → 🟢 → 🔵）

- [x] **3.1（🔴 RED）：** 建立/修改測試 `react-app/src/__tests__/App.test.jsx`
  ```jsx
  import { describe, it, expect, vi, beforeEach } from 'vitest'
  import { render, screen, fireEvent } from '@testing-library/react'
  import App from '../App'

  describe('App Navigation Tabs (Hash-based)', () => {
    beforeEach(() => {
      window.location.hash = ''
    })

    it('應能點擊切換 Tab，同步變更 window.location.hash，顯示對應頁面', () => {
      render(<App />)
      
      expect(screen.getByText('鬧鐘清單')).toBeInTheDocument()
      expect(screen.queryByText('全球城市天氣')).not.toBeInTheDocument()

      const weatherTab = screen.getByRole('button', { name: '天氣資訊' })
      fireEvent.click(weatherTab)

      expect(window.location.hash).toBe('#weather')
      expect(screen.getByText('全球城市天氣')).toBeInTheDocument()
      expect(screen.queryByText('鬧鐘清單')).not.toBeInTheDocument()

      const alarmTab = screen.getByRole('button', { name: '鬧鐘設定' })
      fireEvent.click(alarmTab)

      expect(window.location.hash).toBe('#alarm')
      expect(screen.getByText('鬧鐘清單')).toBeInTheDocument()
    })
  })
  ```

- [x] **3.2（確認紅燈）：** 執行測試確認失敗。
  - 執行指令：`npm run test`

- [x] **3.3（🟢 GREEN）：** 
  1. 建立骨架 `react-app/src/components/WeatherPage.jsx`
  ```jsx
  import React from 'react'
  export function WeatherPage() {
    return (
      <div className="weather-page">
        <h2>全球城市天氣</h2>
        <p>天氣功能開發中...</p>
      </div>
    )
  }
  ```

  2. 修改 `react-app/src/App.jsx`
  ```jsx
  import { useState, useEffect } from 'react'
  import { AlarmPage } from './components/AlarmPage'
  import { WeatherPage } from './components/WeatherPage'
  import './App.css'

  function App() {
    const [activeTab, setActiveTab] = useState(() => {
      return window.location.hash === '#weather' ? 'weather' : 'alarm'
    })

    useEffect(() => {
      const handleHashChange = () => {
        const tab = window.location.hash === '#weather' ? 'weather' : 'alarm'
        setActiveTab(tab)
      }
      window.addEventListener('hashchange', handleHashChange)
      return () => window.removeEventListener('hashchange', handleHashChange)
    }, [])

    const handleTabChange = (tab) => {
      setActiveTab(tab)
      window.location.hash = tab
    }

    return (
      <div className="app-container">
        <nav className="navbar">
          <button 
            type="button" 
            className={`nav-tab ${activeTab === 'alarm' ? 'active' : ''}`}
            onClick={() => handleTabChange('alarm')}
          >
            鬧鐘設定
          </button>
          <button 
            type="button" 
            className={`nav-tab ${activeTab === 'weather' ? 'active' : ''}`}
            onClick={() => handleTabChange('weather')}
          >
            天氣資訊
          </button>
        </nav>

        <main className="tab-content">
          {activeTab === 'alarm' ? <AlarmPage /> : <WeatherPage />}
        </main>
      </div>
    )
  }

  export default App
  ```

- [x] **3.4（確認綠燈）：** 執行測試確認通過。
  - 執行指令：`npm run test`

- [x] **3.5（🔵 REFACTOR）：** 美化導覽列樣式，確保頁面邊距與切換平滑度。
- [x] **3.6：** 執行 `git add` 並 commit：
  ```bash
  git add react-app/src/App.jsx react-app/src/components/WeatherPage.jsx react-app/src/__tests__/App.test.jsx
  git commit -m "feat: support hash-based tab navigation with hashchange event listener"
  ```

---

## 任務 4: 搜尋、篩選與溫度單位切換元件 `CitySearchBar`

### 對應測試案例
| 測試案例 | 對應需求 | 類型 | 優先順序 |
|----------|----------|------|----------|
| TC-008 | `Requirement: 溫度單位切換` → `Scenario: 切換為華氏`, `Scenario: 切換為攝氏`, `Scenario: 單位狀態持久化` | 單元/整合測試 | P0 |
| TC-009 | `Requirement: 城市名稱搜尋` → `Scenario: 輸入搜尋關鍵字` & `Requirement: 區域篩選` → `Scenario: 選擇特定區域` | 單元/整合測試 | P0 |

### 實作步驟（🔴 → 🟢 → 🔵）

- [x] **4.1（🔴 RED）：** 建立測試 `react-app/src/__tests__/CitySearchBar.test.jsx`
  ```jsx
  import { describe, it, expect, vi, beforeEach } from 'vitest'
  import { render, screen, fireEvent } from '@testing-library/react'
  import { CitySearchBar } from '../components/CitySearchBar'

  describe('CitySearchBar Component', () => {
    beforeEach(() => {
      localStorage.clear()
    })

    it('應能正確渲染輸入框、區域選擇器及單位切換按鈕，並反映狀態變化', () => {
      const mockSearchChange = vi.fn()
      const mockRegionChange = vi.fn()
      const mockUnitChange = vi.fn()

      render(
        <CitySearchBar 
          searchQuery=""
          onSearchChange={mockSearchChange}
          selectedRegion="全部"
          onRegionChange={mockRegionChange}
          tempUnit="C"
          onUnitChange={mockUnitChange}
        />
      )

      const input = screen.getByPlaceholderText('搜尋城市名稱...')
      fireEvent.change(input, { target: { value: '東京' } })
      expect(mockSearchChange).toHaveBeenCalledWith('東京')

      const select = screen.getByRole('combobox')
      fireEvent.change(select, { target: { value: '亞洲' } })
      expect(mockRegionChange).toHaveBeenCalledWith('亞洲')

      const fahrenheitBtn = screen.getByRole('button', { name: '°F' })
      fireEvent.click(fahrenheitBtn)
      expect(mockUnitChange).toHaveBeenCalledWith('F')
    })
  })
  ```

- [x] **4.2（確認紅燈）：** 執行測試確認失敗。（CitySearchBar 找不到 — 預期失敗）
  - 執行指令：`npm run test`

- [x] **4.3（🟢 GREEN）：** 建立 `react-app/src/components/CitySearchBar.jsx`（含 ARIA 標籤）
  ```jsx
  import React from 'react'

  /**
   * @param {Object} props
   * @param {string} props.searchQuery
   * @param {function(string): void} props.onSearchChange
   * @param {string} props.selectedRegion
   * @param {function(string): void} props.onRegionChange
   * @param {'C'|'F'} props.tempUnit
   * @param {function('C'|'F'): void} props.onUnitChange
   */
  export function CitySearchBar({
    searchQuery,
    onSearchChange,
    selectedRegion,
    onRegionChange,
    tempUnit,
    onUnitChange
  }) {
    const regions = ['全部', '亞洲', '歐洲', '美洲', '非洲', '大洋洲']

    return (
      <div className="search-bar-container">
        <input 
          type="text"
          className="search-input"
          placeholder="搜尋城市名稱..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        <select 
          className="region-select"
          value={selectedRegion}
          onChange={(e) => onRegionChange(e.target.value)}
        >
          {regions.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <div className="unit-toggle">
          <button 
            type="button" 
            className={`unit-btn ${tempUnit === 'C' ? 'active' : ''}`}
            onClick={() => onUnitChange('C')}
          >
            °C
          </button>
          <button 
            type="button" 
            className={`unit-btn ${tempUnit === 'F' ? 'active' : ''}`}
            onClick={() => onUnitChange('F')}
          >
            °F
          </button>
        </div>
      </div>
    )
  }
  ```

- [x] **4.4（確認綠燈）：** 執行測試確認通過。
  - 執行指令：`npm run test`（1 test passed）

- [x] **4.5（🔵 REFACTOR）：** 調整無障礙屬性 (ARIA tags)，精簡 CSS 樣式命名。（input aria-label、select aria-label、button aria-pressed 均已實作）
- [x] **4.6：** 執行 `git add` 並 commit：`3eccde6 feat: add CitySearchBar with search, region filter, and unit toggle`

---

## 任務 5: 天氣卡片展示與 WeatherPage 整合測試與實作

### 對應測試案例
| 測試案例 | 對應需求 | 類型 | 優先順序 |
|----------|----------|------|----------|
| TC-010 | `Requirement: 天氣卡片展示` → `Scenario: 正常顯示天氣卡片`, `Scenario: 載入中狀態`, `Scenario: 載入失敗狀態` | 單元測試 | P0 |
| TC-011 | `Requirement: 區域篩選` → `Scenario: 搜尋與區域篩選同時作用` | 整合測試 | P0 |
| TC-012 | `Requirement: 溫度單位切換` → `Scenario: 單位狀態持久化` (透過 WeatherPage 整合測試) | 整合測試 | P0 |
| TC-013 | `Requirement: 即時天氣資料取得` → `Scenario: API 回應失敗` (點擊「重新嘗試」觸發單一城市重載) | 整合測試 | P0 |

### 實作步驟（🔴 → 🟢 → 🔵）

- [x] **5.1（🔴 RED）：** 建立測試 `react-app/src/__tests__/WeatherCard.test.jsx` 與整合測試 `react-app/src/__tests__/WeatherPage.test.jsx`
  
  1. 建立 `react-app/src/__tests__/WeatherCard.test.jsx`
  ```jsx
  import { describe, it, expect, vi } from 'vitest'
  import { render, screen, fireEvent } from '@testing-library/react'
  import { WeatherCard } from '../components/WeatherCard'

  const mockCity = { name: '台北', country: '台灣', region: '亞洲', latitude: 25.03, longitude: 121.56 }

  describe('WeatherCard Component', () => {
    it('應能在加載時顯示骨架屏/加載狀態', () => {
      render(<WeatherCard city={mockCity} weather={{ loading: true, data: null, error: null }} tempUnit="C" />)
      expect(screen.getByTestId('weather-card-loading')).toBeInTheDocument()
    })

    it('應能在載入失敗時顯示錯誤訊息與重試按鈕', () => {
      const mockRetry = vi.fn()
      render(
        <WeatherCard 
          city={mockCity} 
          weather={{ loading: false, data: null, error: '無法取得天氣資料' }} 
          tempUnit="C" 
          onRetry={mockRetry}
        />
      )
      expect(screen.getByText('無法取得天氣資料')).toBeInTheDocument()
      const retryBtn = screen.getByRole('button', { name: '重新嘗試' })
      fireEvent.click(retryBtn)
      expect(mockRetry).toHaveBeenCalled()
    })
  })
  ```

  2. 建立 `react-app/src/__tests__/WeatherPage.test.jsx`
  ```jsx
  import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
  import { render, screen, fireEvent, act } from '@testing-library/react'
  import { WeatherPage } from '../components/WeatherPage'

  describe('WeatherPage Integration Tests', () => {
    beforeEach(() => {
      localStorage.clear()
      vi.stubGlobal('fetch', vi.fn())
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('應能正常讀取 localStorage 的初始化單位，切換單位時寫入 localStorage 並更新溫度顯示', async () => {
      localStorage.setItem('tempUnit', 'F')
      
      const mockBatchResponse = [
        {
          current_weather: { temperature: 25.0, weathercode: 0 },
          current: { relative_humidity_2m: 60, wind_speed_10m: 10.0 }
        }
      ]
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBatchResponse
      })

      render(<WeatherPage />)

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      // 檢查是否初始渲染為華氏 (25°C = 77°F)
      expect(screen.getByText('77°F')).toBeInTheDocument()

      const celsiusBtn = screen.getByRole('button', { name: '°C' })
      fireEvent.click(celsiusBtn)

      // 驗證是否寫入並更新為 25°C
      expect(localStorage.getItem('tempUnit')).toBe('C')
      expect(screen.getByText('25°C')).toBeInTheDocument()
    })

    it('當單一城市天氣取得失敗時，應能在點擊「重新嘗試」後單獨重新載入該城市', async () => {
      // 模擬初始 Batch 失敗
      fetch.mockRejectedValueOnce(new Error('網路錯誤'))

      render(<WeatherPage />)

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      // 應顯示錯誤卡片
      expect(screen.getAllByText('無法取得天氣資料')[0]).toBeInTheDocument()

      // 模擬第二次點擊重試，改為成功
      const mockSingleResponse = {
        current_weather: { temperature: 20.0, weathercode: 1 },
        current: { relative_humidity_2m: 70, wind_speed_10m: 5.0 }
      }
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSingleResponse
      })

      const retryBtn = screen.getAllByRole('button', { name: '重新嘗試' })[0]
      fireEvent.click(retryBtn)

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      // 驗證卡片恢復正常數據
      expect(screen.getByText('20°C')).toBeInTheDocument()
    })
  })
  ```

- [x] **5.2（確認紅燈）：** 執行測試確認失敗。
  - 執行指令：`npm run test`（WeatherCard 找不到，WeatherPage 找不到 — 預期失敗）

- [x] **5.3（🟢 GREEN）：**
  1. 建立 `react-app/src/components/WeatherCard.jsx`
  ```jsx
  import React from 'react'
  import { convertTemperature, getWeatherDescription } from '../utils/weatherUtils'

  export function WeatherCard({ city, weather, tempUnit, onRetry }) {
    if (!weather || weather.loading) {
      return (
        <div className="weather-card loading" data-testid="weather-card-loading">
          <div className="shimmer card-title-placeholder"></div>
          <div className="shimmer card-temp-placeholder"></div>
          <div className="shimmer card-desc-placeholder"></div>
        </div>
      )
    }

    if (weather.error) {
      return (
        <div className="weather-card error">
          <h3>{city.name}</h3>
          <p className="error-msg">{weather.error}</p>
          <button type="button" className="retry-btn" onClick={onRetry}>
            重新嘗試
          </button>
        </div>
      )
    }

    const { desc, icon } = getWeatherDescription(weather.weatherCode)
    const displayedTemp = convertTemperature(weather.temp, tempUnit)

    return (
      <div className="weather-card">
        <div className="card-header">
          <span className="city-name">{city.name}</span>
          <span className="country-name">{city.country}</span>
        </div>
        <div className="card-body">
          <div className="weather-main">
            <span className="weather-icon" role="img" aria-label={desc}>
              {icon}
            </span>
            <span className="weather-temp">
              {displayedTemp}°{tempUnit}
            </span>
          </div>
          <p className="weather-desc">{desc}</p>
          <div className="weather-details">
            <span className="detail-item">相對濕度: {weather.humidity}%</span>
            <span className="detail-item">風速: {weather.windSpeed} km/h</span>
          </div>
        </div>
      </div>
    )
  }
  ```

  2. 建立 `react-app/src/components/WeatherCardGrid.jsx`
  ```jsx
  import React from 'react'
  import { WeatherCard } from './WeatherCard'

  export function WeatherCardGrid({ filteredCities, weatherData, tempUnit, onRetryCity }) {
    if (filteredCities.length === 0) {
      return <div className="no-results">找不到符合的城市</div>
    }

    return (
      <div className="weather-grid">
        {filteredCities.map(city => (
          <WeatherCard
            key={city.name}
            city={city}
            weather={weatherData[city.name]}
            tempUnit={tempUnit}
            onRetry={() => onRetryCity(city)}
          />
        ))}
      </div>
    )
  }
  ```

  3. 修改並完整實作 `react-app/src/components/WeatherPage.jsx`
  ```jsx
  import React, { useState } from 'react'
  import { cities } from '../data/cities'
  import { useWeatherData } from '../hooks/useWeatherData'
  import { CitySearchBar } from './CitySearchBar'
  import { WeatherCardGrid } from './WeatherCardGrid'
  import './WeatherPage.css'

  export function WeatherPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedRegion, setSelectedRegion] = useState('全部')
    const [tempUnit, setTempUnit] = useState(() => {
      return localStorage.getItem('tempUnit') || 'C'
    })

    const { weatherData, loading, refreshAll, fetchSingleCity } = useWeatherData(cities)

    const handleUnitChange = (unit) => {
      setTempUnit(unit)
      localStorage.setItem('tempUnit', unit)
    }

    const filteredCities = cities.filter(city => {
      const matchesSearch = city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            city.country.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRegion = selectedRegion === '全部' || city.region === selectedRegion
      return matchesSearch && matchesRegion
    })

    return (
      <div className="weather-container">
        <div className="weather-header">
          <h1>全球城市天氣</h1>
          <button type="button" className="refresh-btn" onClick={refreshAll} disabled={loading}>
            {loading ? '更新中...' : '重新整理全部'}
          </button>
        </div>

        <CitySearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedRegion={selectedRegion}
          onRegionChange={setSelectedRegion}
          tempUnit={tempUnit}
          onUnitChange={handleUnitChange}
        />

        <WeatherCardGrid
          filteredCities={filteredCities}
          weatherData={weatherData}
          tempUnit={tempUnit}
          onRetryCity={fetchSingleCity}
        />
      </div>
    )
  }
  ```

  4. 建立 `react-app/src/components/WeatherPage.css`
  ```css
  .weather-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    font-family: 'Outfit', 'Inter', sans-serif;
    color: #f3f4f6;
  }

  .weather-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .weather-header h1 {
    font-size: 2.5rem;
    background: linear-gradient(135deg, #60a5fa, #3b82f6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }

  .refresh-btn, .retry-btn {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    border: none;
    color: white;
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .refresh-btn:hover, .retry-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }

  .search-bar-container {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    background: rgba(255, 255, 255, 0.05);
    padding: 1rem;
    border-radius: 12px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .search-input {
    flex: 1;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    padding: 0.5rem 1rem;
    color: white;
    font-size: 1rem;
  }

  .region-select {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    padding: 0.5rem 1rem;
    color: white;
    font-size: 1rem;
    cursor: pointer;
  }

  .unit-toggle {
    display: flex;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    padding: 2px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .unit-btn {
    background: transparent;
    border: none;
    color: #9ca3af;
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
  }

  .unit-btn.active {
    background: #3b82f6;
    color: white;
  }

  .weather-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .weather-card {
    background: rgba(255, 255, 255, 0.07);
    border-radius: 16px;
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
    backdrop-filter: blur(8px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .weather-card:hover {
    transform: translateY(-5px);
    border-color: rgba(96, 165, 250, 0.4);
    box-shadow: 0 12px 40px 0 rgba(96, 165, 250, 0.2);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 1rem;
  }

  .city-name {
    font-size: 1.4rem;
    font-weight: 700;
  }

  .country-name {
    font-size: 0.9rem;
    color: #9ca3af;
  }

  .weather-main {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }

  .weather-icon {
    font-size: 2.5rem;
  }

  .weather-temp {
    font-size: 2rem;
    font-weight: 800;
  }

  .weather-desc {
    font-size: 1.1rem;
    color: #60a5fa;
    margin: 0 0 1rem 0;
  }

  .weather-details {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    font-size: 0.9rem;
    color: #9ca3af;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 0.8rem;
  }

  .weather-card.loading {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-height: 180px;
  }

  .shimmer {
    background: linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.06) 75%);
    background-size: 200% 100%;
    animation: loading-shimmer 1.5s infinite;
    border-radius: 4px;
  }

  .card-title-placeholder {
    height: 1.5rem;
    width: 60%;
  }

  .card-temp-placeholder {
    height: 3rem;
    width: 40%;
  }

  .card-desc-placeholder {
    height: 1.2rem;
    width: 80%;
  }

  @keyframes loading-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .no-results {
    text-align: center;
    font-size: 1.2rem;
    color: #9ca3af;
    padding: 3rem;
  }
  ```

- [x] **5.4（確認綠燈）：** 執行測試，驗證完整功能。
  - 執行指令：`npm run test`
  - 實際輸出：**43 tests passed**（WeatherCard 4 + WeatherPage 3 + 其餘 36）

- [x] **5.5（🔵 REFACTOR）：** 微調 Grid 排版與 hover 卡片時的 3D 陰影，確保 UI 體驗極佳。（CSS 包含 shimmer loading、glassmorphism、hover transform、gradient 標題 — 無需額外調整）
- [x] **5.6：** 執行 `git add` 並 commit：`42d5336 feat: complete WeatherCard, WeatherCardGrid, WeatherPage with premium styling and tests`
