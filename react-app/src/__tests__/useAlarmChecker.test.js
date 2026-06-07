import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAlarmChecker } from '../hooks/useAlarmChecker'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useAlarmChecker', () => {
  it('當有啟用的鬧鐘時間到達時，觸發 callback', () => {
    const now = new Date('2026-06-07T08:30:00')
    vi.setSystemTime(now)

    const alarms = [
      { id: '1', time: '08:30', label: '早起', enabled: true, createdAt: now.toISOString() },
    ]
    const onTrigger = vi.fn()

    renderHook(() => useAlarmChecker(alarms, onTrigger))

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(onTrigger).toHaveBeenCalledWith(alarms[0])
  })

  it('停用的鬧鐘不觸發', () => {
    const now = new Date('2026-06-07T08:30:00')
    vi.setSystemTime(now)

    const alarms = [
      { id: '1', time: '08:30', label: '早起', enabled: false, createdAt: now.toISOString() },
    ]
    const onTrigger = vi.fn()

    renderHook(() => useAlarmChecker(alarms, onTrigger))

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(onTrigger).not.toHaveBeenCalled()
  })

  it('時間未到不觸發', () => {
    const now = new Date('2026-06-07T08:29:00')
    vi.setSystemTime(now)

    const alarms = [
      { id: '1', time: '08:30', label: '早起', enabled: true, createdAt: now.toISOString() },
    ]
    const onTrigger = vi.fn()

    renderHook(() => useAlarmChecker(alarms, onTrigger))

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(onTrigger).not.toHaveBeenCalled()
  })

  it('同一鬧鐘在同一分鐘內只觸發一次', () => {
    const now = new Date('2026-06-07T08:30:00')
    vi.setSystemTime(now)

    const alarms = [
      { id: '1', time: '08:30', label: '早起', enabled: true, createdAt: now.toISOString() },
    ]
    const onTrigger = vi.fn()

    renderHook(() => useAlarmChecker(alarms, onTrigger))

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(onTrigger).toHaveBeenCalledTimes(1)
  })
})
