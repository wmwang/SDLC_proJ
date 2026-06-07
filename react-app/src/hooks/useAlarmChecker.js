import { useEffect, useRef } from 'react'

/**
 * 每秒檢查是否有鬧鐘到期
 * @param {import('../types/alarm').Alarm[]} alarms
 * @param {(alarm: import('../types/alarm').Alarm) => void} onTrigger
 */
export function useAlarmChecker(alarms, onTrigger) {
  const triggeredRef = useRef(new Set())

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date()
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

      for (const alarm of alarms) {
        if (
          alarm.enabled &&
          alarm.time === currentTime &&
          !triggeredRef.current.has(alarm.id)
        ) {
          triggeredRef.current.add(alarm.id)
          onTrigger(alarm)
        }
      }

      if (now.getSeconds() === 0) {
        triggeredRef.current.clear()
      }
    }, 1000)

    return () => clearInterval(intervalId)
  }, [alarms, onTrigger])
}
