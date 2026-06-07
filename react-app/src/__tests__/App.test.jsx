import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '../App'

const mockStorage = {}
vi.stubGlobal('localStorage', {
  getItem: (key) => mockStorage[key] ?? null,
  setItem: (key, value) => { mockStorage[key] = value },
  removeItem: (key) => { delete mockStorage[key] },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]) }
})

describe('App Navigation Tabs (Hash-based)', () => {
  beforeEach(() => {
    window.location.hash = ''
    Object.keys(mockStorage).forEach(k => delete mockStorage[k])
  })

  it('應能點擊切換 Tab，同步變更 window.location.hash，顯示對應頁面', () => {
    render(<App />)

    expect(screen.getByText('鬧鐘')).toBeInTheDocument()
    expect(screen.queryByText('全球城市天氣')).not.toBeInTheDocument()

    const weatherTab = screen.getByRole('button', { name: '天氣資訊' })
    fireEvent.click(weatherTab)

    expect(window.location.hash).toBe('#weather')
    expect(screen.getByText('全球城市天氣')).toBeInTheDocument()
    expect(screen.queryByText('鬧鐘')).not.toBeInTheDocument()

    const alarmTab = screen.getByRole('button', { name: '鬧鐘設定' })
    fireEvent.click(alarmTab)

    expect(window.location.hash).toBe('#alarm')
    expect(screen.getByText('鬧鐘')).toBeInTheDocument()
  })
})
