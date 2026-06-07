import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AlarmAlert } from '../components/AlarmAlert'

describe('AlarmAlert', () => {
  const triggeredAlarm = {
    id: '1',
    time: '08:30',
    label: '早起',
    enabled: true,
    createdAt: '2026-01-01T00:00:00Z',
  }

  it('沒有觸發鬧鐘時不渲染', () => {
    const { container } = render(<AlarmAlert alarm={null} onDismiss={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('有觸發鬧鐘時顯示鬧鐘資訊', () => {
    render(<AlarmAlert alarm={triggeredAlarm} onDismiss={vi.fn()} />)
    expect(screen.getByText('⏰ 鬧鐘響了！')).toBeInTheDocument()
    expect(screen.getByText('08:30')).toBeInTheDocument()
    expect(screen.getByText('早起')).toBeInTheDocument()
  })

  it('點擊關閉按鈕呼叫 onDismiss', async () => {
    const user = userEvent.setup()
    const onDismiss = vi.fn()
    render(<AlarmAlert alarm={triggeredAlarm} onDismiss={onDismiss} />)

    await user.click(screen.getByRole('button', { name: '關閉' }))
    expect(onDismiss).toHaveBeenCalledWith('1')
  })
})
