/**
 * 鬧鐘列表元件
 * @param {{
 *   alarms: import('../types/alarm').Alarm[],
 *   onToggle: (id: string) => void,
 *   onDelete: (id: string) => void,
 * }} props
 */
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
