import { useState, useEffect, useRef, useCallback } from 'react'

const CACHE_TTL = 5 * 60 * 1000

/**
 * 抓取並管理全球天氣資料的 Hook
 * @param {import('../types/weather').City[]} citiesList
 * @returns {{
 *   weatherData: Object.<string, import('../types/weather').WeatherState>,
 *   loading: boolean,
 *   error: string|null,
 *   fetchSingleCity: (city: import('../types/weather').City) => Promise<void>,
 *   refreshAll: () => Promise<void>
 * }}
 */
export function useWeatherData(citiesList) {
  const [weatherData, setWeatherData] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const cacheRef = useRef({})

  const isCacheValid = useCallback((cityName) => {
    const cached = cacheRef.current[cityName]
    if (!cached) return false
    return (Date.now() - cached.timestamp) < CACHE_TTL
  }, [])

  const fetchSingleCity = useCallback(async (city) => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current_weather=true&current=relative_humidity_2m,wind_speed_10m`
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error('API 回傳錯誤')
      const json = await response.json()
      const data = {
        temp: json.current_weather.temperature,
        weatherCode: json.current_weather.weathercode,
        humidity: json.current?.relative_humidity_2m || 0,
        windSpeed: json.current?.wind_speed_10m || 0,
        error: null
      }
      cacheRef.current[city.name] = { data, timestamp: Date.now() }
      setWeatherData(prev => ({ ...prev, [city.name]: data }))
    } catch (err) {
      setWeatherData(prev => ({
        ...prev,
        [city.name]: { temp: 0, weatherCode: -1, humidity: 0, windSpeed: 0, error: '無法取得天氣資料' }
      }))
    }
  }, [])

  const refreshAll = useCallback(async () => {
    if (citiesList.length === 0) return
    setLoading(true)
    setError(null)

    const lats = citiesList.map(c => c.latitude).join(',')
    const lons = citiesList.map(c => c.longitude).join(',')
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current_weather=true&current=relative_humidity_2m,wind_speed_10m`

    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error('批次 API 回傳錯誤')
      const json = await response.json()
      const results = Array.isArray(json) ? json : [json]

      const nextData = {}
      results.forEach((item, index) => {
        const city = citiesList[index]
        if (city) {
          const data = {
            temp: item.current_weather.temperature,
            weatherCode: item.current_weather.weathercode,
            humidity: item.current?.relative_humidity_2m || 0,
            windSpeed: item.current?.wind_speed_10m || 0,
            error: null
          }
          cacheRef.current[city.name] = { data, timestamp: Date.now() }
          nextData[city.name] = data
        }
      })
      setWeatherData(nextData)
    } catch (err) {
      const fallbackData = {}
      citiesList.forEach(city => {
        fallbackData[city.name] = {
          temp: 0,
          weatherCode: -1,
          humidity: 0,
          windSpeed: 0,
          error: '無法取得天氣資料'
        }
      })
      setWeatherData(fallbackData)
    } finally {
      setLoading(false)
    }
  }, [citiesList])

  useEffect(() => {
    let isMounted = true
    const initLoad = async () => {
      const uncachedCities = citiesList.filter(c => !isCacheValid(c.name))

      if (uncachedCities.length === 0) {
        const cachedData = {}
        citiesList.forEach(c => {
          cachedData[c.name] = cacheRef.current[c.name].data
        })
        if (isMounted) setWeatherData(cachedData)
        return
      }

      setLoading(true)
      const lats = uncachedCities.map(c => c.latitude).join(',')
      const lons = uncachedCities.map(c => c.longitude).join(',')
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current_weather=true&current=relative_humidity_2m,wind_speed_10m`

      try {
        const response = await fetch(url)
        if (!response.ok) throw new Error('API 失敗')
        const json = await response.json()
        const results = Array.isArray(json) ? json : [json]

        if (isMounted) {
          setWeatherData(prev => {
            const updated = { ...prev }
            citiesList.forEach(c => {
              if (isCacheValid(c.name)) {
                updated[c.name] = cacheRef.current[c.name].data
              }
            })
            results.forEach((item, index) => {
              const city = uncachedCities[index]
              if (city) {
                const data = {
                  temp: item.current_weather.temperature,
                  weatherCode: item.current_weather.weathercode,
                  humidity: item.current?.relative_humidity_2m || 0,
                  windSpeed: item.current?.wind_speed_10m || 0,
                  error: null
                }
                cacheRef.current[city.name] = { data, timestamp: Date.now() }
                updated[city.name] = data
              }
            })
            return updated
          })
        }
      } catch (err) {
        if (isMounted) {
          setWeatherData(prev => {
            const updated = { ...prev }
            citiesList.forEach(city => {
              if (!isCacheValid(city.name)) {
                updated[city.name] = {
                  temp: 0,
                  weatherCode: -1,
                  humidity: 0,
                  windSpeed: 0,
                  error: '無法取得天氣資料'
                }
              } else {
                updated[city.name] = cacheRef.current[city.name].data
              }
            })
            return updated
          })
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    initLoad()
    return () => {
      isMounted = false
    }
  }, [citiesList, isCacheValid])

  return {
    weatherData,
    loading,
    error,
    fetchSingleCity,
    refreshAll
  }
}
