import React from 'react'
import { convertTemperature, getWeatherDescription } from '../utils/weatherUtils'

/**
 * @param {Object} props
 * @param {{ name: string, country: string, region: string, latitude: number, longitude: number }} props.city
 * @param {{ loading?: boolean, data?: { temp: number, weatherCode: number, humidity: number, windSpeed: number }|null, error?: string|null }|{ temp: number, weatherCode: number, humidity: number, windSpeed: number, error: string|null }|null|undefined} props.weather
 * @param {'C'|'F'} props.tempUnit
 * @param {function(): void} [props.onRetry]
 */
export function WeatherCard({ city, weather, tempUnit, onRetry }) {
  const isLoading = weather?.loading === true
  const isWrapped = weather !== null && weather !== undefined && 'data' in weather
  const error = isWrapped ? weather.error : weather?.error ?? null
  const data = isWrapped ? weather.data : (weather && 'temp' in weather ? weather : null)

  if (!weather || isLoading) {
    return (
      <div className="weather-card loading" data-testid="weather-card-loading">
        <div className="shimmer card-title-placeholder"></div>
        <div className="shimmer card-temp-placeholder"></div>
        <div className="shimmer card-desc-placeholder"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="weather-card error">
        <h3>{city.name}</h3>
        <p className="error-msg">{error}</p>
        {onRetry && (
          <button type="button" className="retry-btn" onClick={onRetry}>
            重新嘗試
          </button>
        )}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="weather-card loading" data-testid="weather-card-loading">
        <div className="shimmer card-title-placeholder"></div>
        <div className="shimmer card-temp-placeholder"></div>
        <div className="shimmer card-desc-placeholder"></div>
      </div>
    )
  }

  const { desc, icon } = getWeatherDescription(data.weatherCode)
  const displayedTemp = convertTemperature(data.temp, tempUnit)

  return (
    <div className="weather-card">
      <div className="card-header">
        <span className="city-name">{city.name}</span>
        <span className="country-name">{city.country}</span>
      </div>
      <div className="card-body">
        <div className="weather-main">
          <span className="weather-icon" role="img" aria-label={desc}>
            {icon}
          </span>
          <span className="weather-temp">
            {displayedTemp}°{tempUnit}
          </span>
        </div>
        <p className="weather-desc">{desc}</p>
        <div className="weather-details">
          <span className="detail-item">相對濕度: {data.humidity}%</span>
          <span className="detail-item">風速: {data.windSpeed} km/h</span>
        </div>
      </div>
    </div>
  )
}