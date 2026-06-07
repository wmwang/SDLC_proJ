/**
 * @typedef {Object} City
 * @property {string} name - 城市名稱
 * @property {string} country - 國家名稱
 * @property {string} region - 區域 (如 亞洲, 歐洲, 美洲)
 * @property {number} latitude - 緯度
 * @property {number} longitude - 經度
 */

/**
 * @typedef {Object} WeatherInfo
 * @property {number} temp - 攝氏溫度
 * @property {number} humidity - 相對濕度 (%)
 * @property {number} windSpeed - 風速 (km/h)
 * @property {number} weatherCode - WMO 天氣代碼
 */

/**
 * @typedef {Object} WeatherState
 * @property {WeatherInfo|null} data - 天氣資料
 * @property {boolean} loading - 是否載入中
 * @property {string|null} error - 錯誤訊息
 */
export {}
