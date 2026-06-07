/**
 * @typedef {Object} Alarm
 * @property {string} id - 唯一識別碼 (crypto.randomUUID())
 * @property {string} time - 鬧鐘時間，格式 "HH:MM" (24小時制)
 * @property {string} label - 鬧鐘標籤
 * @property {boolean} enabled - 是否啟用
 * @property {string} createdAt - ISO 格式建立時間
 */

/**
 * 建立新的 Alarm 物件
 * @param {string} time - "HH:MM" 格式
 * @param {string} label - 鬧鐘標籤
 * @returns {Alarm}
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

/**
 * 判斷設定的時間是否已過（當天已過），
 * 若是，回傳 true（應自動設為隔天）
 * @param {string} time - "HH:MM" 格式
 * @returns {boolean}
 */
export function isTimePassed(time) {
  const now = new Date()
  const [hours, minutes] = time.split(':').map(Number)
  const alarmToday = new Date()
  alarmToday.setHours(hours, minutes, 0, 0)
  return alarmToday <= now
}

/**
 * 依時間排序鬧鐘（由近到遠）
 * @param {Alarm[]} alarms
 * @returns {Alarm[]}
 */
export function sortAlarmsByTime(alarms) {
  return [...alarms].sort((a, b) => a.time.localeCompare(b.time))
}
