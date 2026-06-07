# 鬧鐘功能 實作計畫

> **給代理工作者：** 使用 superpowers:subagent-driven-development
> 來逐任務實作此計畫。

**目標：** 為 React App 新增鬧鐘功能，包含設定、列表、啟用/停用、刪除與觸發通知，支援音效播放、桌面 Notification 通知與防背景降頻/休眠的真實 Date 區間補償機制。

**架構：** 
- 使用 React custom hook（`useAlarms`）管理所有鬧鐘狀態與業務邏輯，搭配 localStorage 持久化（上限 100 個）。
- 使用 `useAlarmChecker` hook 來偵測鬧鐘時間，改為**精準 Date 區間比對**以解決背景降頻（Throttling）或休眠重啟的問題，並加上 `visibilitychange` 事件監聽。
- 整合 HTML5 `Audio` API 進行聲音播放，並處理 Autoplay 被拒的提示。
- 整合桌面 `Notification` API 提供系統通知與點擊聚焦，加上「測試音效與授權」按鈕以提升瀏覽器權限授予機率。
- UI 採用 `triggeredAlarms` 佇列（陣列）管理響起狀態，避免多個鬧鐘同時到期時覆蓋。

**技術棧：** React 19 + Vite 8、JavaScript (JSX)、localStorage API、HTML5 Audio API、Notification API

**測試框架：** Vitest + @testing-library/react + jsdom

---

## 檔案結構

| 動作 | 檔案路徑 | 職責 |
|------|----------|------|
| 建立 | `react-app/src/types/alarm.js` | Alarm 型別與輔助邏輯（精準 Date 區間比對、過期判定） |
| 建立 | `react-app/src/hooks/useAlarms.js` | 鬧鐘狀態管理 hook（CRUD + localStorage 限額 100 個） |
| 建立 | `react-app/src/hooks/useAlarmChecker.js` | 鬧鐘觸發檢查 hook（真實 Date 區間比對 + visibilitychange 監聽） |
| 建立 | `react-app/src/components/AlarmForm.jsx` | 新增鬧鐘表單元件（調用 isTimePassed 顯示明天響起提示） |
| 建立 | `react-app/src/components/AlarmList.jsx` | 鬧鐘列表元件 |
| 建立 | `react-app/src/components/AlarmAlert.jsx` | 鬧鐘觸發通知 Modal 元件（內含 HTML5 Audio 播放與 Autoplay 被阻提示） |
| 建立 | `react-app/src/components/AlarmPage.jsx` | 鬧鐘頁面容器元件（管理佇列、音效、Notification 授權與免責提示） |
| 修改 | `react-app/src/App.jsx` | 整合 AlarmPage 元件 |
| 建立 | `react-app/src/components/AlarmPage.css` | 鬧鐘頁面與 Modal 樣式 |
| 建立 | `react-app/src/__tests__/useAlarms.test.js` | useAlarms hook 單元測試 |
| 建立 | `react-app/src/__tests__/useAlarmChecker.test.js` | useAlarmChecker 區間偵測與多日休眠補償測試 |
| 建立 | `react-app/src/__tests__/AlarmForm.test.jsx` | AlarmForm 元件測試 |
| 建立 | `react-app/src/__tests__/AlarmList.test.jsx` | AlarmList 元件測試 |
| 建立 | `react-app/src/__tests__/AlarmAlert.test.jsx` | AlarmAlert 元件及音效播放測試 |
| 建立 | `react-app/src/__tests__/AlarmPage.test.jsx` | AlarmPage 整合測試 |
| 修改 | `react-app/package.json` | 加入 vitest、@testing-library/react 等測試依賴 |
| 建立 | `react-app/vitest.config.js` | Vitest 設定（jsdom 環境） |

---

## 任務 0: 測試基礎設施

### 對應測試案例
| 測試案例 | 對應需求 | 類型 | 優先順序 |
|----------|----------|------|----------|
| TC-000 | 基礎設施 — 測試框架可正常執行 | 基礎設施 | P0 |

### 實作步驟（🔴 → 🟢 → 🔵）

- [ ] **0.1：安裝測試依賴**

```bash
cd react-app
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **0.2：建立 Vitest 設定檔**

建立 `react-app/vitest.config.js`：

```js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/__tests__/setup.js',
  },
})
```

- [ ] **0.3：建立測試 setup 檔案**

建立 `react-app/src/__tests__/setup.js`：

```js
import '@testing-library/jest-dom'
```

- [ ] **0.4：在 package.json 加入測試腳本**

在 `react-app/package.json` 的 `scripts` 中加入：

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **0.5（🔴 RED）：寫一個最小的煙霧測試**

建立 `react-app/src/__tests__/smoke.test.js` :

```js
import { describe, it, expect } from 'vitest'

describe('測試基礎設施', () => {
  it('vitest 可正常執行', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **0.6（確認綠燈）：執行測試確認通過**

```bash
cd react-app
npx vitest run src/__tests__/smoke.test.js
```

預期：PASS

- [ ] **0.7：commit**

```bash
git add -A
git commit -m "chore: 設定 vitest 測試基礎設施"
```

---

## 任務 1: Alarm 核心邏輯與 useAlarms hook

### 對應測試案例
| 測試案例 | 對應需求 | 類型 | 優先順序 |
|----------|----------|------|----------|
| TC-001 | 核心邏輯 — 判斷設定時間是否已過 | 單元 | P0 |
| TC-002 | 核心邏輯 — 基於真實 Date 區間精確比對鬧鐘（含跨日/跨多日） | 單元 | P0 |
| TC-003 | useAlarms — CRUD 鬧鐘與 100 個上限限制 | 單元 | P0 |

### 實作步驟（🔴 → 🟢 → 🔵）

- [ ] **1.1：建立 Alarm 核心型別與演算法**

建立 `react-app/src/types/alarm.js`：

```js
/**
 * @typedef {Object} Alarm
 * @property {string} id - 唯一識別碼 (crypto.randomUUID())
 * @property {string} time - 鬧鐘時間，格式 "HH:MM" (24小時制)
 * @property {string} label - 鬧鐘標籤
 * @property {boolean} enabled - 是否啟用
 * @property {string} createdAt - ISO 格式建立時間
 */

export function createAlarm(time, label) {
  return {
    id: crypto.randomUUID(),
    time,
    label,
    enabled: true,
    createdAt: new Date().toISOString(),
  }
}

export function isTimePassed(time) {
  const now = new Date()
  const [hours, minutes] = time.split(':').map(Number)
  const alarmToday = new Date()
  alarmToday.setHours(hours, minutes, 0, 0)
  return alarmToday <= now
}

export function sortAlarmsByTime(alarms) {
  return [...alarms].sort((a, b) => a.time.localeCompare(b.time))
}

/**
 * 遍歷檢查區間所跨越的所有日期，對每天結合鬧鐘時分產生 Date 物件，確認此物件是否落在區間內
 * @param {string} alarmTime - "HH:MM"
 * @param {Date} startTime - 區間開始
 * @param {Date} endTime - 區間結束
 * @returns {boolean}
 */
export function isAlarmInInterval(alarmTime, startTime, endTime) {
  const [ah, am] = alarmTime.split(':').map(Number)
  const start = new Date(startTime)
  const end = new Date(endTime)
  
  // 遍歷所有跨越的日期
  let current = new Date(start)
  current.setHours(0, 0, 0, 0)
  
  const endDay = new Date(end)
  endDay.setHours(0, 0, 0, 0)
  
  while (current <= endDay) {
    const alarmDate = new Date(current)
    alarmDate.setHours(ah, am, 0, 0)
    
    if (alarmDate > start && alarmDate <= end) {
      return true
    }
    
    // 前進下一天
    current.setDate(current.getDate() + 1)
  }
  
  return false
}
```

- [ ] **1.2（🔴 RED）：寫 useAlarms hook 測試，包含 CRUD 與 localStorage 異常**

建立 `react-app/src/__tests__/useAlarms.test.js`：

```js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAlarms } from '../hooks/useAlarms'

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
  it('初始化、新增與刪除鬧鐘', () => {
    const { result } = renderHook(() => useAlarms())
    expect(result.current.alarms).toEqual([])

    act(() => {
      result.current.addAlarm('08:30', '早起')
    })
    expect(result.current.alarms).toHaveLength(1)
    expect(result.current.alarms[0].time).toBe('08:30')

    const id = result.current.alarms[0].id
    act(() => {
      result.current.deleteAlarm(id)
    })
    expect(result.current.alarms).toHaveLength(0)
  })

  it('限制最多 100 個鬧鐘', () => {
    const { result } = renderHook(() => useAlarms())
    act(() => {
      for (let i = 0; i < 105; i++) {
        result.current.addAlarm('08:00', `鬧鐘${i}`)
      }
    })
    expect(result.current.alarms.length).toBe(100)
  })
})
```

- [ ] **1.3（確認紅燈）：執行測試確認失敗**

```bash
cd react-app
npx vitest run src/__tests__/useAlarms.test.js
```

預期：FAIL — `Cannot find module '../hooks/useAlarms'`

- [ ] **1.4（🟢 GREEN）：實作 useAlarms hook**

建立 `react-app/src/hooks/useAlarms.js`：

```js
import { useState, useCallback, useEffect } from 'react'
import { createAlarm, sortAlarmsByTime } from '../types/alarm'

const STORAGE_KEY = 'alarms'
const MAX_ALARMS = 100

function loadAlarms() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveAlarms(alarms) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms))
  } catch (e) {
    console.error('儲存鬧鐘失敗:', e)
  }
}

export function useAlarms() {
  const [alarms, setAlarms] = useState(() => sortAlarmsByTime(loadAlarms()))

  useEffect(() => {
    saveAlarms(alarms)
  }, [alarms])

  const addAlarm = useCallback((time, label) => {
    setAlarms((prev) => {
      if (prev.length >= MAX_ALARMS) {
        alert('鬧鐘已達最大上限 (100 個)，無法新增！')
        return prev
      }
      const alarm = createAlarm(time, label)
      return sortAlarmsByTime([...prev, alarm])
    })
  }, [])

  const toggleAlarm = useCallback((id) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    )
  }, [])

  const deleteAlarm = useCallback((id) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const disableAlarm = useCallback((id) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: false } : a))
    )
  }, [])

  return { alarms, addAlarm, toggleAlarm, deleteAlarm, disableAlarm }
}
```

- [ ] **1.5（確認綠燈）：執行測試確認通過**

```bash
cd react-app
npx vitest run src/__tests__/useAlarms.test.js
```

預期：全部 PASS

- [ ] **1.6：commit**

```bash
git add -A
git commit -m "feat: 實作 useAlarms 狀態管理與 100 個上限控制"
```

---

## 任務 2: useAlarmChecker hook（精準 Date 區間比對）

### 對應測試案例
| 測試案例 | 對應需求 | 類型 | 優先順序 |
|----------|----------|------|----------|
| TC-004 | 區間比對 — 正常時間流逝觸發 | 單元 | P0 |
| TC-005 | 區間比對 — 跨多日休眠補響觸發 | 單元 | P0 |
| TC-006 | 前景切換補償 — 監聽 visibilitychange 立即檢查 | 單元 | P0 |

### 實作步驟（🔴 → 🟢 → 🔵）

- [ ] **2.1（🔴 RED）：寫 useAlarmChecker 測試，模擬跨多日休眠與前景切換**

建立 `react-app/src/__tests__/useAlarmChecker.test.js`：

```js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAlarmChecker } from '../hooks/useAlarmChecker'

beforeEach(() => {
  vi.useFakeTimers()
  // Mock visibilityState
  Object.defineProperty(document, 'visibilityState', {
    value: 'visible',
    configurable: true
  })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useAlarmChecker', () => {
  it('休眠跨越兩天，正確補觸發鬧鐘', () => {
    // 初始時間：2026-06-07T08:29:00
    const start = new Date('2026-06-07T08:29:00')
    vi.setSystemTime(start)

    const alarms = [{ id: '1', time: '08:30', label: '早起', enabled: true }]
    const onTrigger = vi.fn()

    renderHook(() => useAlarmChecker(alarms, onTrigger))

    // 模擬休眠兩天醒來：2026-06-09T08:35:00
    act(() => {
      vi.setSystemTime(new Date('2026-06-09T08:35:00'))
      vi.advanceTimersByTime(1000)
    })

    expect(onTrigger).toHaveBeenCalled()
  })

  it('前景切換時立即觸發區間比對', () => {
    const start = new Date('2026-06-07T08:25:00')
    vi.setSystemTime(start)

    const alarms = [{ id: '1', time: '08:30', label: '早起', enabled: true }]
    const onTrigger = vi.fn()

    renderHook(() => useAlarmChecker(alarms, onTrigger))

    // 時間前進至 08:35 但定時器未運作，頁面改為 visible
    vi.setSystemTime(new Date('2026-06-07T08:35:00'))
    
    act(() => {
      const event = new Event('visibilitychange')
      document.dispatchEvent(event)
    })

    expect(onTrigger).toHaveBeenCalled()
  })
})
```

- [ ] **2.2（確認紅燈）：執行測試確認失敗**

```bash
cd react-app
npx vitest run src/__tests__/useAlarmChecker.test.js
```

預期：FAIL — `Cannot find module '../hooks/useAlarmChecker'`

- [ ] **2.3（🟢 GREEN）：實作 useAlarmChecker hook**

建立 `react-app/src/hooks/useAlarmChecker.js`：

```js
import { useEffect, useRef } from 'react'
import { isAlarmInInterval } from '../types/alarm'

export function useAlarmChecker(alarms, onTrigger) {
  const lastCheckTimeRef = useRef(new Date())
  const alarmsRef = useRef(alarms)
  const onTriggerRef = useRef(onTrigger)

  useEffect(() => {
    alarmsRef.current = alarms
    onTriggerRef.current = onTrigger
  }, [alarms, onTrigger])

  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date()
      const lastCheck = lastCheckTimeRef.current

      for (const alarm of alarmsRef.current) {
        if (alarm.enabled && isAlarmInInterval(alarm.time, lastCheck, now)) {
          onTriggerRef.current(alarm)
        }
      }

      lastCheckTimeRef.current = now
    }

    const intervalId = setInterval(checkAlarms, 1000)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAlarms()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])
}
```

- [ ] **2.4（確認綠燈）：執行測試確認通過**

```bash
cd react-app
npx vitest run src/__tests__/useAlarmChecker.test.js
```

預期：全部 PASS

- [ ] **2.5：commit**

```bash
git add -A
git commit -m "feat: 實作基於真實 Date 區間比對與前景切換補償的 useAlarmChecker"
```

---

## 任務 3: AlarmForm 元件（明天響起提示與過去時間判定）

### 對應測試案例
| 測試案例 | 對應需求 | 類型 | 優先順序 |
|----------|----------|------|----------|
| TC-007 | 設定過去時間 — 顯示明天響起提示 | 整合 | P0 |

### 實作步驟（🔴 → 🟢 → 🔵）

- [ ] **3.1（🔴 RED）：寫 AlarmForm 測試，包含明天響起提示**

建立 `react-app/src/__tests__/AlarmForm.test.jsx`：

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AlarmForm } from '../components/AlarmForm'

beforeEach(() => {
  // 設定當前時間為 12:00:00
  vi.setSystemTime(new Date('2026-06-07T12:00:00'))
})

describe('AlarmForm', () => {
  it('設定過去的時間時應顯示明日響起提示', async () => {
    const user = userEvent.setup()
    render(<AlarmForm onAdd={vi.fn()} />)

    const timeInput = screen.getByLabelText('時間')
    await user.clear(timeInput)
    await user.type(timeInput, '11:00') // 過去時間

    expect(screen.getByText('⚠️ 此時間今天已過，將於明天此時響起')).toBeInTheDocument()
  })
})
```

- [ ] **3.2（確認紅燈）：執行測試確認失敗**

```bash
cd react-app
npx vitest run src/__tests__/AlarmForm.test.jsx
```

預期：FAIL

- [ ] **3.3（🟢 GREEN）：實作 AlarmForm 元件**

建立 `react-app/src/components/AlarmForm.jsx`：

```jsx
import { useState, useEffect } from 'react'
import { isTimePassed } from '../types/alarm'

export function AlarmForm({ onAdd }) {
  const [time, setTime] = useState('')
  const [label, setLabel] = useState('')
  const [showTomorrowWarning, setShowTomorrowWarning] = useState(false)

  useEffect(() => {
    if (time) {
      setShowTomorrowWarning(isTimePassed(time))
    } else {
      setShowTomorrowWarning(false)
    }
  }, [time])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!time) return
    onAdd(time, label || '鬧鐘')
    setTime('')
    setLabel('')
  }

  return (
    <form className="alarm-form" onSubmit={handleSubmit}>
      <div className="alarm-form__field">
        <label htmlFor="alarm-time">時間</label>
        <input
          id="alarm-time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />
      </div>
      <div className="alarm-form__field">
        <label htmlFor="alarm-label">標籤</label>
        <input
          id="alarm-label"
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="鬧鐘名稱"
        />
      </div>
      {showTomorrowWarning && (
        <p className="alarm-form__warning" style={{ color: '#ffb703', fontSize: '0.85rem', width: '100%' }}>
          ⚠️ 此時間今天已過，將於明天此時響起
        </p>
      )}
      <button type="submit" className="alarm-form__submit">
        新增鬧鐘
      </button>
    </form>
  )
}
```

- [ ] **3.4（確認綠燈）：執行測試確認通過**

```bash
cd react-app
npx vitest run src/__tests__/AlarmForm.test.jsx
```

預期：PASS

- [ ] **3.5：commit**

```bash
git add -A
git commit -m "feat: 實作具有過期提示的 AlarmForm 元件"
```

---

## 任務 4: AlarmList 元件（列表顯示）

### 對應測試案例
| 測試案例 | 對應需求 | 類型 | 優先順序 |
|----------|----------|------|----------|
| TC-008 | 顯示列表與空提示 | 整合 | P0 |

### 實作步驟（🔴 → 🟢 → 🔵）

- [ ] **4.1（🔴 RED）：建立 AlarmList 的測試**

建立 `react-app/src/__tests__/AlarmList.test.jsx`：

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AlarmList } from '../components/AlarmList'

describe('AlarmList', () => {
  it('正確渲染鬧鐘列表與切換停用按鈕', () => {
    const alarms = [{ id: '1', time: '08:30', label: '早起', enabled: true }]
    render(<AlarmList alarms={alarms} onToggle={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('08:30')).toBeInTheDocument()
    expect(screen.getByText('早起')).toBeInTheDocument()
  })
})
```

- [ ] **4.2（確認紅燈）：執行測試確認失敗**

```bash
cd react-app
npx vitest run src/__tests__/AlarmList.test.jsx
```

預期：FAIL

- [ ] **4.3（🟢 GREEN）：實作 AlarmList 元件**

建立 `react-app/src/components/AlarmList.jsx`：

```jsx
export function AlarmList({ alarms, onToggle, onDelete }) {
  if (alarms.length === 0) {
    return <p className="alarm-list__empty">尚無鬧鐘設定</p>
  }

  return (
    <ul className="alarm-list">
      {alarms.map((alarm) => (
        <li
          key={alarm.id}
          className={`alarm-item ${!alarm.enabled ? 'alarm-item--disabled' : ''}`}
        >
          <span className="alarm-item__time">{alarm.time}</span>
          <span className="alarm-item__label">{alarm.label}</span>
          <div className="alarm-item__actions">
            <button
              className="alarm-item__toggle"
              onClick={() => onToggle(alarm.id)}
              aria-label={alarm.enabled ? '停用' : '啟用'}
            >
              {alarm.enabled ? '停用' : '啟用'}
            </button>
            <button
              className="alarm-item__delete"
              onClick={() => onDelete(alarm.id)}
              aria-label="刪除"
            >
              刪除
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **4.4（確認綠燈）：執行測試確認通過**

```bash
cd react-app
npx vitest run src/__tests__/AlarmList.test.jsx
```

預期：PASS

- [ ] **4.5：commit**

```bash
git add -A
git commit -m "feat: 實作 AlarmList 元件"
```

---

## 任務 5: AlarmAlert 元件（佇列管理、Autoplay 警示與音效）

### 對應測試案例
| 測試案例 | 對應需求 | 類型 | 優先順序 |
|----------|----------|------|----------|
| TC-009 | 音效與自動播放失敗警示 | 整合 | P0 |

### 實作步驟（🔴 → 🟢 → 🔵）

- [ ] **5.1（🔴 RED）：寫 AlarmAlert 測試，模擬音效自動播放失敗與提示**

建立 `react-app/src/__tests__/AlarmAlert.test.jsx`：

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AlarmAlert } from '../components/AlarmAlert'

class AudioMock {
  constructor() {
    this.play = vi.fn().mockRejectedValue(new Error('NotAllowedError'))
    this.pause = vi.fn()
  }
}
globalThis.Audio = AudioMock

describe('AlarmAlert', () => {
  const triggeredAlarms = [{ id: '1', time: '08:30', label: '早起', enabled: false }]

  it('音效播放失敗時，畫面上顯示警示文字引導點選解鎖', async () => {
    render(<AlarmAlert alarms={triggeredAlarms} onDismiss={vi.fn()} />)
    expect(await screen.findByText(/⚠️ 偵測到瀏覽器阻擋音效/)).toBeInTheDocument()
  })
})
```

- [ ] **5.2（確認紅燈）：執行測試確認失敗**

```bash
cd react-app
npx vitest run src/__tests__/AlarmAlert.test.jsx
```

預期：FAIL

- [ ] **5.3（🟢 GREEN）：實作 AlarmAlert 元件，支援多鬧鐘佇列顯示與 Autoplay 被阻警告**

建立 `react-app/src/components/AlarmAlert.jsx`：

```jsx
import { useEffect, useRef, useState } from 'react'

const ALARM_SOUND_URL = '/alarm.mp3'

export function AlarmAlert({ alarms, onDismiss }) {
  const audioRef = useRef(null)
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)

  useEffect(() => {
    if (alarms.length > 0) {
      if (!audioRef.current) {
        const audio = new Audio(ALARM_SOUND_URL)
        audio.loop = true
        audioRef.current = audio
        audio.play()
          .then(() => setAutoplayBlocked(false))
          .catch(() => setAutoplayBlocked(true))
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      setAutoplayBlocked(false)
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [alarms])

  if (alarms.length === 0) return null

  const handlePageClickToUnlock = () => {
    if (audioRef.current && autoplayBlocked) {
      audioRef.current.play()
        .then(() => setAutoplayBlocked(false))
        .catch((e) => console.error(e))
    }
  }

  return (
    <div className="alarm-alert__overlay" onClick={handlePageClickToUnlock}>
      <div className="alarm-alert" role="alertdialog" aria-labelledby="alarm-alert-title">
        <h2 id="alarm-alert-title" className="alarm-alert__title">⏰ 鬧鐘響了！</h2>
        
        <div className="alarm-alert__list" style={{ maxHeight: '150px', overflowY: 'auto', margin: '1rem 0' }}>
          {alarms.map((alarm) => (
            <div key={alarm.id} className="alarm-alert__item" style={{ margin: '0.5rem 0' }}>
              <strong style={{ fontSize: '1.8rem' }}>{alarm.time}</strong>
              <div style={{ opacity: 0.8 }}>{alarm.label}</div>
            </div>
          ))}
        </div>

        {autoplayBlocked && (
          <p className="alarm-alert__warning" style={{ color: '#ffb703', fontSize: '0.85rem', marginBottom: '1rem' }}>
            ⚠️ 偵測到瀏覽器阻擋音效，請點擊此處任意位置以開啟聲音。
          </p>
        )}

        <button
          className="alarm-alert__dismiss"
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.pause()
            }
            onDismiss()
          }}
          aria-label="全部關閉"
        >
          關閉
        </button>
      </div>
    </div>
  )
}
```

- [ ] **5.4（確認綠燈）：執行測試確認通過**

```bash
cd react-app
npx vitest run src/__tests__/AlarmAlert.test.jsx
```

預期：PASS

- [ ] **5.5：commit**

```bash
git add -A
git commit -m "feat: 實作支援多鬧鐘佇列顯示與 Autoplay 被阻警醒的 AlarmAlert 元件"
```

---

## 任務 6: AlarmPage 整合元件與免責提示

### 對應測試案例
| 測試案例 | 對應需求 | 類型 | 優先順序 |
|----------|----------|------|----------|
| TC-010 | 整合測試 — 音效與授權測試按鈕運作，發送通知 | 整合 | P0 |

### 實作步驟（🔴 → 🟢 → 🔵）

- [ ] **6.1（🔴 RED）：寫 AlarmPage 整合測試**

建立 `react-app/src/__tests__/AlarmPage.test.jsx`：

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AlarmPage } from '../components/AlarmPage'

// Mock Notification
globalThis.Notification = {
  permission: 'default',
  requestPermission: vi.fn().mockResolvedValue('granted'),
}

describe('AlarmPage', () => {
  it('渲染並在點擊測試按鈕時發送授權與測試音效', async () => {
    const user = userEvent.setup()
    render(<AlarmPage />)

    const testBtn = screen.getByRole('button', { name: '測試音效與授權' })
    await user.click(testBtn)
    expect(globalThis.Notification.requestPermission).toHaveBeenCalled()
  })
})
```

- [ ] **6.2（確認紅燈）：執行測試確認失敗**

```bash
cd react-app
npx vitest run src/__tests__/AlarmPage.test.jsx
```

預期：FAIL

- [ ] **6.3（🟢 GREEN）：實作 AlarmPage 元件，包含佇列與免責聲明**

建立 `react-app/src/components/AlarmPage.jsx`：

```jsx
import { useState, useCallback } from 'react'
import { useAlarms } from '../hooks/useAlarms'
import { useAlarmChecker } from '../hooks/useAlarmChecker'
import { AlarmForm } from './AlarmForm'
import { AlarmList } from './AlarmList'
import { AlarmAlert } from './AlarmAlert'
import './AlarmPage.css'

export function AlarmPage() {
  const { alarms, addAlarm, toggleAlarm, deleteAlarm, disableAlarm } = useAlarms()
  const [triggeredAlarms, setTriggeredAlarms] = useState([])

  const handleTrigger = useCallback((alarm) => {
    // 1. 觸發當下立即在 state 與儲存中停用此單次鬧鐘，防止重整重複響鈴
    disableAlarm(alarm.id)

    // 2. 加入觸發佇列
    setTriggeredAlarms((prev) => {
      if (prev.some((a) => a.id === alarm.id)) return prev
      return [...prev, alarm]
    })

    // 3. 背景通知發送與點擊聚焦
    if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('⏰ 鬧鐘響了！', {
        body: `時間: ${alarm.time} - ${alarm.label}`,
        requireInteraction: true,
      })
      notification.onclick = () => {
        window.focus()
      }
    }
  }, [disableAlarm])

  const handleDismissAll = useCallback(() => {
    setTriggeredAlarms([])
  }, [])

  const handleTestAudioAndPermission = () => {
    // 點選觸發授權與短音效
    if ('Notification' in window) {
      Notification.requestPermission()
    }
    const audio = new Audio('/alarm.mp3')
    audio.play().catch(() => {})
  }

  useAlarmChecker(alarms, handleTrigger)

  return (
    <section className="alarm-page">
      <div className="alarm-page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="alarm-page__title" style={{ margin: 0 }}>鬧鐘</h2>
        <button
          onClick={handleTestAudioAndPermission}
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', cursor: 'pointer' }}
        >
          測試音效與授權
        </button>
      </div>

      {/* 免責聲明 */}
      <div className="alarm-page__disclaimer" style={{ background: 'rgba(255, 80, 80, 0.1)', padding: '0.5rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', color: '#ff5050', marginBottom: '1.5rem' }}>
        ⚠️ 注意：本功能為純網頁鬧鐘，請保持網頁開啟。若關閉瀏覽器或電腦休眠，鬧鐘將無法按時響起。
      </div>

      <AlarmForm onAdd={addAlarm} />
      <AlarmList alarms={alarms} onToggle={toggleAlarm} onDelete={deleteAlarm} />
      <AlarmAlert alarms={triggeredAlarms} onDismiss={handleDismissAll} />
    </section>
  )
}
```

- [ ] **6.4：建立 AlarmPage.css 樣式**

建立 `react-app/src/components/AlarmPage.css`：

```css
.alarm-page {
  max-width: 480px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.alarm-page__title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

/* 表單 */
.alarm-form {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.alarm-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 100px;
}

.alarm-form__field label {
  font-size: 0.85rem;
  opacity: 0.8;
}

.alarm-form__field input {
  padding: 0.5rem 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
  font-size: 1rem;
}

.alarm-form__submit {
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 8px;
  background: #646cff;
  color: white;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.alarm-form__submit:hover {
  background: #535bf2;
}

/* 列表 */
.alarm-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.alarm-list__empty {
  text-align: center;
  opacity: 0.6;
  padding: 2rem;
}

.alarm-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  margin-bottom: 0.5rem;
  background: rgba(255, 255, 255, 0.08);
  transition: opacity 0.2s;
}

.alarm-item--disabled {
  opacity: 0.5;
}

.alarm-item__time {
  font-size: 1.4rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  min-width: 60px;
}

.alarm-item__label {
  flex: 1;
  font-size: 0.95rem;
  opacity: 0.85;
}

.alarm-item__actions {
  display: flex;
  gap: 0.5rem;
}

.alarm-item__toggle,
.alarm-item__delete {
  padding: 0.35rem 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s;
}

.alarm-item__toggle:hover {
  background: rgba(100, 108, 255, 0.3);
}

.alarm-item__delete:hover {
  background: rgba(255, 80, 80, 0.3);
}

/* Alert Modal */
.alarm-alert__overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.alarm-alert {
  background: #1a1a2e;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  min-width: 280px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: scaleIn 0.3s ease;
}

.alarm-alert__title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.alarm-alert__time {
  font-size: 3rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  margin: 0.5rem 0;
}

.alarm-alert__label {
  font-size: 1.1rem;
  opacity: 0.8;
  margin-bottom: 1.5rem;
}

.alarm-alert__dismiss {
  padding: 0.6rem 2rem;
  border: none;
  border-radius: 8px;
  background: #646cff;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.alarm-alert__dismiss:hover {
  background: #535bf2;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

- [ ] **6.5：將 AlarmPage 整合至 App.jsx**

修改 `react-app/src/App.jsx`，引入 `AlarmPage` 元件，並放置於頁面上：

```jsx
// 檔案開頭引入
import { AlarmPage } from './components/AlarmPage'

// 放在 </section> 後、<div className="ticks"></div> 前
<AlarmPage />
```

- [ ] **6.6（確認綠燈）：執行所有測試確認通過**

```bash
cd react-app
npx vitest run
```

預期：全部測試 PASS

- [ ] **6.7：commit**

```bash
git add -A
git commit -m "feat: 整合 AlarmPage 元件至 App 且配置佇列、免責提示與樣式"
```
