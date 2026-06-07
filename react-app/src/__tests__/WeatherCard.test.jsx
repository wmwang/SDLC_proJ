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

  it('應能在正常數據下正確顯示城市名稱、溫度、天氣描述、濕度與風速', () => {
    const mockRetry = vi.fn()
    render(
      <WeatherCard
        city={mockCity}
        weather={{ loading: false, data: { temp: 25.4, weatherCode: 0, humidity: 65, windSpeed: 12.5 }, error: null }}
        tempUnit="C"
        onRetry={mockRetry}
      />
    )
    expect(screen.getByText('台北')).toBeInTheDocument()
    expect(screen.getByText('台灣')).toBeInTheDocument()
    expect(screen.getByText('25.4°C')).toBeInTheDocument()
    expect(screen.getByText('晴天')).toBeInTheDocument()
    expect(screen.getByText(/相對濕度: 65%/)).toBeInTheDocument()
    expect(screen.getByText(/風速: 12.5 km\/h/)).toBeInTheDocument()
  })

  it('應能在華氏單位下正確顯示轉換後的溫度', () => {
    const mockRetry = vi.fn()
    render(
      <WeatherCard
        city={mockCity}
        weather={{ loading: false, data: { temp: 0, weatherCode: 71, humidity: 50, windSpeed: 20 }, error: null }}
        tempUnit="F"
        onRetry={mockRetry}
      />
    )
    expect(screen.getByText('32°F')).toBeInTheDocument()
  })
})