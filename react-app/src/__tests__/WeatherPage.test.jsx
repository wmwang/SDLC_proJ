import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { WeatherPage } from '../components/WeatherPage'

const mockStorage = {}
vi.stubGlobal('localStorage', {
  getItem: (key) => mockStorage[key] ?? null,
  setItem: (key, value) => { mockStorage[key] = value },
  removeItem: (key) => { delete mockStorage[key] },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]) }
})

describe('WeatherPage Integration Tests', () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach(k => delete mockStorage[k])
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

    expect(screen.getByText('77°F')).toBeInTheDocument()

    const celsiusBtn = screen.getByRole('button', { name: '°C' })
    fireEvent.click(celsiusBtn)

    expect(localStorage.getItem('tempUnit')).toBe('C')
    expect(screen.getByText('25°C')).toBeInTheDocument()
  })

  it('當單一城市天氣取得失敗時，應能在點擊「重新嘗試」後單獨重新載入該城市', async () => {
    fetch.mockRejectedValueOnce(new Error('網路錯誤'))

    render(<WeatherPage />)

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50))
    })

    expect(screen.getAllByText('無法取得天氣資料')[0]).toBeInTheDocument()

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

    expect(screen.getByText('20°C')).toBeInTheDocument()
  })

  it('應能在搜尋框輸入關鍵字後過濾顯示對應城市', async () => {
    const mockBatchResponse = Array(30).fill(null).map(() => ({
      current_weather: { temperature: 20.0, weathercode: 0 },
      current: { relative_humidity_2m: 60, wind_speed_10m: 10.0 }
    }))
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBatchResponse
    })

    render(<WeatherPage />)

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50))
    })

    const input = screen.getByPlaceholderText('搜尋城市名稱...')
    fireEvent.change(input, { target: { value: '東京' } })

    expect(screen.getByText('東京')).toBeInTheDocument()
    expect(screen.queryByText('台北')).not.toBeInTheDocument()
  })
})