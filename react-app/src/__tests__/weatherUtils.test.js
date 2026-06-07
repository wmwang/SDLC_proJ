import { describe, it, expect } from 'vitest'
import { convertTemperature, getWeatherDescription } from '../utils/weatherUtils'
import { cities } from '../data/cities'

describe('Weather Utilities', () => {
  describe('convertTemperature', () => {
    it('應能正確將攝氏轉換為華氏，並四捨五入至小數點後一位', () => {
      expect(convertTemperature(25, 'F')).toBe(77.0)
      expect(convertTemperature(0, 'F')).toBe(32.0)
      expect(convertTemperature(-10, 'F')).toBe(14.0)
      expect(convertTemperature(25.34, 'F')).toBe(77.6)
    })

    it('應在單位為 C 時直接回傳四捨五入至小數點後一位的攝氏溫度', () => {
      expect(convertTemperature(25.34, 'C')).toBe(25.3)
      expect(convertTemperature(0, 'C')).toBe(0.0)
    })
  })

  describe('getWeatherDescription', () => {
    it('應正確將 WMO 代碼對應至中文描述與圖示', () => {
      expect(getWeatherDescription(0)).toEqual({ desc: '晴天', icon: '☀️' })
      expect(getWeatherDescription(1)).toEqual({ desc: '晴時多雲', icon: '🌤️' })
      expect(getWeatherDescription(61)).toEqual({ desc: '小雨', icon: '🌧️' })
      expect(getWeatherDescription(95)).toEqual({ desc: '雷雨', icon: '⛈️' })
      expect(getWeatherDescription(999)).toEqual({ desc: '未知天氣', icon: '❓' })
    })
  })

  describe('cities', () => {
    it('城市清單應包含至少 30 個城市且欄位完整', () => {
      expect(cities.length).toBeGreaterThanOrEqual(30)
      cities.forEach(city => {
        expect(city).toHaveProperty('name')
        expect(city).toHaveProperty('country')
        expect(city).toHaveProperty('region')
        expect(city).toHaveProperty('latitude')
        expect(city).toHaveProperty('longitude')
      })
    })
  })
})
