import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AlarmPage } from '../components/AlarmPage'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

beforeEach(() => {
  localStorageMock.clear()
  vi.clearAllMocks()
})

describe('AlarmPage', () => {
  it('渲染鬧鐘頁面標題', () => {
    render(<AlarmPage />)
    expect(screen.getByText('鬧鐘')).toBeInTheDocument()
  })

  it('初始狀態顯示「尚無鬧鐘設定」', () => {
    render(<AlarmPage />)
    expect(screen.getByText('尚無鬧鐘設定')).toBeInTheDocument()
  })

  it('新增鬧鐘後顯示在列表中', async () => {
    const user = userEvent.setup()
    render(<AlarmPage />)

    const timeInput = screen.getByLabelText('時間')
    const labelInput = screen.getByLabelText('標籤')

    await user.clear(timeInput)
    await user.type(timeInput, '08:30')
    await user.type(labelInput, '早起')
    await user.click(screen.getByRole('button', { name: '新增鬧鐘' }))

    expect(screen.getByText('08:30')).toBeInTheDocument()
    expect(screen.getByText('早起')).toBeInTheDocument()
    expect(screen.queryByText('尚無鬧鐘設定')).not.toBeInTheDocument()
  })
})
