/**
 * 溫度單位轉換
 * @param {number} celsius - 攝氏溫度
 * @param {'C'|'F'} unit - 目標單位
 * @returns {number} 轉換後的值，四捨五入至小數點後一位
 */
export function convertTemperature(celsius, unit) {
  if (unit === 'F') {
    return Math.round((celsius * 9 / 5 + 32) * 10) / 10
  }
  return Math.round(celsius * 10) / 10
}

/**
 * 將 WMO 天氣代碼對應至中文描述與圖示
 * @param {number} code - WMO 代碼
 * @returns {{ desc: string, icon: string }}
 */
export function getWeatherDescription(code) {
  const table = {
    0: { desc: '晴天', icon: '☀️' },
    1: { desc: '晴時多雲', icon: '🌤️' },
    2: { desc: '陰天', icon: '⛅' },
    3: { desc: '多雲', icon: '☁️' },
    45: { desc: '霧', icon: '🌫️' },
    48: { desc: '霧', icon: '🌫️' },
    51: { desc: '輕度毛毛雨', icon: '🌧️' },
    53: { desc: '中度毛毛雨', icon: '🌧️' },
    55: { desc: '重度毛毛雨', icon: '🌧️' },
    61: { desc: '小雨', icon: '🌧️' },
    63: { desc: '中雨', icon: '☔' },
    65: { desc: '大雨', icon: '☔' },
    71: { desc: '小雪', icon: '❄️' },
    73: { desc: '中雪', icon: '❄️' },
    75: { desc: '大雪', icon: '❄️' },
    95: { desc: '雷雨', icon: '⛈️' },
    96: { desc: '雷雨伴有冰雹', icon: '⛈️' },
    99: { desc: '雷雨伴有冰雹', icon: '⛈️' }
  }
  return table[code] || { desc: '未知天氣', icon: '❓' }
}
