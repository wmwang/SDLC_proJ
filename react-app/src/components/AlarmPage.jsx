import { useState, useCallback } from 'react'
import { useAlarms } from '../hooks/useAlarms'
import { useAlarmChecker } from '../hooks/useAlarmChecker'
import { AlarmForm } from './AlarmForm'
import { AlarmList } from './AlarmList'
import { AlarmAlert } from './AlarmAlert'
import './AlarmPage.css'

export function AlarmPage() {
  const { alarms, addAlarm, toggleAlarm, deleteAlarm, disableAlarm } = useAlarms()
  const [triggeredAlarm, setTriggeredAlarm] = useState(null)

  const handleTrigger = useCallback((alarm) => {
    setTriggeredAlarm(alarm)
  }, [])

  const handleDismiss = useCallback((id) => {
    disableAlarm(id)
    setTriggeredAlarm(null)
  }, [disableAlarm])

  useAlarmChecker(alarms, handleTrigger)

  return (
    <section className="alarm-page">
      <h2 className="alarm-page__title">鬧鐘</h2>
      <AlarmForm onAdd={addAlarm} />
      <AlarmList alarms={alarms} onToggle={toggleAlarm} onDelete={deleteAlarm} />
      <AlarmAlert alarm={triggeredAlarm} onDismiss={handleDismiss} />
    </section>
  )
}
