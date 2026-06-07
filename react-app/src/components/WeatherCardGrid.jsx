import React from 'react'
import { WeatherCard } from './WeatherCard'

/**
 * @param {Object} props
 * @param {{ name: string, country: string, region: string, latitude: number, longitude: number }[]} props.filteredCities
 * @param {Object.<string, { loading: boolean, data: { temp: number, weatherCode: number, humidity: number, windSpeed: number }|null, error: string|null }>} props.weatherData
 * @param {'C'|'F'} props.tempUnit
 * @param {function(Object): void} props.onRetryCity
 */
export function WeatherCardGrid({ filteredCities, weatherData, tempUnit, onRetryCity }) {
  if (filteredCities.length === 0) {
    return <div className="no-results">找不到符合的城市</div>
  }

  return (
    <div className="weather-grid">
      {filteredCities.map(city => (
        <WeatherCard
          key={city.name}
          city={city}
          weather={weatherData[city.name]}
          tempUnit={tempUnit}
          onRetry={() => onRetryCity(city)}
        />
      ))}
    </div>
  )
}