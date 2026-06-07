import { useState, useCallback, useEffect } from 'react'
import { createAlarm, sortAlarmsByTime } from '../types/alarm'

const STORAGE_KEY = 'alarms'

function loadAlarms() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveAlarms(alarms) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms))
}

export function useAlarms() {
  const [alarms, setAlarms] = useState(() => sortAlarmsByTime(loadAlarms()))

  useEffect(() => {
    saveAlarms(alarms)
  }, [alarms])

  const addAlarm = useCallback((time, label) => {
    const alarm = createAlarm(time, label)
    setAlarms((prev) => sortAlarmsByTime([...prev, alarm]))
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
