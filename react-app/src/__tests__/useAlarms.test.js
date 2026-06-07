import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAlarms } from '../hooks/useAlarms'

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

describe('useAlarms', () => {
  it('初始狀態為空陣列', () => {
    const { result } = renderHook(() => useAlarms())
    expect(result.current.alarms).toEqual([])
  })

  it('新增鬧鐘後，鬧鐘出現在列表中', () => {
    const { result } = renderHook(() => useAlarms())
    act(() => {
      result.current.addAlarm('08:30', '早起')
    })
    expect(result.current.alarms).toHaveLength(1)
    expect(result.current.alarms[0].time).toBe('08:30')
    expect(result.current.alarms[0].label).toBe('早起')
    expect(result.current.alarms[0].enabled).toBe(true)
  })

  it('新增鬧鐘後資料同步至 localStorage', () => {
    const { result } = renderHook(() => useAlarms())
    act(() => {
      result.current.addAlarm('08:30', '早起')
    })
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'alarms',
      expect.any(String)
    )
  })

  it('鬧鐘列表按時間由近到遠排序', () => {
    const { result } = renderHook(() => useAlarms())
    act(() => {
      result.current.addAlarm('14:00', '下午')
      result.current.addAlarm('07:00', '早晨')
      result.current.addAlarm('22:00', '晚上')
    })
    expect(result.current.alarms[0].time).toBe('07:00')
    expect(result.current.alarms[1].time).toBe('14:00')
    expect(result.current.alarms[2].time).toBe('22:00')
  })

  it('切換鬧鐘停用', () => {
    const { result } = renderHook(() => useAlarms())
    act(() => {
      result.current.addAlarm('08:30', '早起')
    })
    const id = result.current.alarms[0].id
    act(() => {
      result.current.toggleAlarm(id)
    })
    expect(result.current.alarms[0].enabled).toBe(false)
  })

  it('切換已停用鬧鐘為啟用', () => {
    const { result } = renderHook(() => useAlarms())
    act(() => {
      result.current.addAlarm('08:30', '早起')
    })
    const id = result.current.alarms[0].id
    act(() => {
      result.current.toggleAlarm(id)
    })
    act(() => {
      result.current.toggleAlarm(id)
    })
    expect(result.current.alarms[0].enabled).toBe(true)
  })

  it('刪除鬧鐘後從列表中移除', () => {
    const { result } = renderHook(() => useAlarms())
    act(() => {
      result.current.addAlarm('08:30', '早起')
      result.current.addAlarm('09:00', '上班')
    })
    const id = result.current.alarms[0].id
    act(() => {
      result.current.deleteAlarm(id)
    })
    expect(result.current.alarms).toHaveLength(1)
    expect(result.current.alarms[0].label).toBe('上班')
  })

  it('刪除鬧鐘後 localStorage 同步更新', () => {
    const { result } = renderHook(() => useAlarms())
    act(() => {
      result.current.addAlarm('08:30', '早起')
    })
    vi.clearAllMocks()
    const id = result.current.alarms[0].id
    act(() => {
      result.current.deleteAlarm(id)
    })
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'alarms',
      expect.any(String)
    )
  })

  it('從 localStorage 載入既有鬧鐘', () => {
    const existingAlarms = [
      { id: '1', time: '08:30', label: '早起', enabled: true, createdAt: new Date().toISOString() },
    ]
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(existingAlarms))
    const { result } = renderHook(() => useAlarms())
    expect(result.current.alarms).toHaveLength(1)
    expect(result.current.alarms[0].label).toBe('早起')
  })
})
