import { useState } from 'react'

/**
 * 新增鬧鐘表單
 * @param {{ onAdd: (time: string, label: string) => void }} props
 */
export function AlarmForm({ onAdd }) {
  const [time, setTime] = useState('')
  const [label, setLabel] = useState('')

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
      <button type="submit" className="alarm-form__submit">
        新增鬧鐘
      </button>
    </form>
  )
}
