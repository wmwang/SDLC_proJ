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
