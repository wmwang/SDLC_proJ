import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AlarmList } from '../components/AlarmList'

const mockAlarms = [
  { id: '1', time: '07:00', label: '早晨', enabled: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: '2', time: '14:00', label: '下午', enabled: false, createdAt: '2026-01-01T00:00:00Z' },
]

describe('AlarmList', () => {
  it('列表為空時顯示提示訊息', () => {
    render(<AlarmList alarms={[]} onToggle={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('尚無鬧鐘設定')).toBeInTheDocument()
  })

  it('顯示所有鬧鐘的時間和標籤', () => {
    render(<AlarmList alarms={mockAlarms} onToggle={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('07:00')).toBeInTheDocument()
    expect(screen.getByText('早晨')).toBeInTheDocument()
    expect(screen.getByText('14:00')).toBeInTheDocument()
    expect(screen.getByText('下午')).toBeInTheDocument()
  })

  it('點擊切換按鈕呼叫 onToggle', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<AlarmList alarms={mockAlarms} onToggle={onToggle} onDelete={vi.fn()} />)

    const toggleButtons = screen.getAllByRole('button', { name: /啟用|停用/ })
    await user.click(toggleButtons[0])

    expect(onToggle).toHaveBeenCalledWith('1')
  })

  it('點擊刪除按鈕呼叫 onDelete', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(<AlarmList alarms={mockAlarms} onToggle={vi.fn()} onDelete={onDelete} />)

    const deleteButtons = screen.getAllByRole('button', { name: '刪除' })
    await user.click(deleteButtons[0])

    expect(onDelete).toHaveBeenCalledWith('1')
  })

  it('停用的鬧鐘顯示「已停用」樣式', () => {
    render(<AlarmList alarms={mockAlarms} onToggle={vi.fn()} onDelete={vi.fn()} />)
    const disabledItem = screen.getByText('下午').closest('.alarm-item')
    expect(disabledItem).toHaveClass('alarm-item--disabled')
  })
})
