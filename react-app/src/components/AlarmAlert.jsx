/**
 * 鬧鐘觸發通知 Modal
 * @param {{
 *   alarm: import('../types/alarm').Alarm | null,
 *   onDismiss: (id: string) => void,
 * }} props
 */
export function AlarmAlert({ alarm, onDismiss }) {
  if (!alarm) return null

  return (
    <div className="alarm-alert__overlay">
      <div className="alarm-alert" role="alertdialog" aria-labelledby="alarm-alert-title">
        <h2 id="alarm-alert-title" className="alarm-alert__title">⏰ 鬧鐘響了！</h2>
        <p className="alarm-alert__time">{alarm.time}</p>
        <p className="alarm-alert__label">{alarm.label}</p>
        <button
          className="alarm-alert__dismiss"
          onClick={() => onDismiss(alarm.id)}
          aria-label="關閉"
        >
          關閉
        </button>
      </div>
    </div>
  )
}
