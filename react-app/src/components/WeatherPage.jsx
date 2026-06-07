import React, { useState } from 'react'
import { cities } from '../data/cities'
import { useWeatherData } from '../hooks/useWeatherData'
import { CitySearchBar } from './CitySearchBar'
import { WeatherCardGrid } from './WeatherCardGrid'
import './WeatherPage.css'

export function WeatherPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('全部')
  const [tempUnit, setTempUnit] = useState(() => {
    return localStorage.getItem('tempUnit') || 'C'
  })

  const { weatherData, loading, refreshAll, fetchSingleCity } = useWeatherData(cities)

  const handleUnitChange = (unit) => {
    setTempUnit(unit)
    localStorage.setItem('tempUnit', unit)
  }

  const filteredCities = cities.filter(city => {
    const matchesSearch = city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          city.country.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRegion = selectedRegion === '全部' || city.region === selectedRegion
    return matchesSearch && matchesRegion
  })

  return (
    <div className="weather-container">
      <div className="weather-header">
        <h1>全球城市天氣</h1>
        <button type="button" className="refresh-btn" onClick={refreshAll} disabled={loading}>
          {loading ? '更新中...' : '重新整理全部'}
        </button>
      </div>

      <CitySearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
        tempUnit={tempUnit}
        onUnitChange={handleUnitChange}
      />

      <WeatherCardGrid
        filteredCities={filteredCities}
        weatherData={weatherData}
        tempUnit={tempUnit}
        onRetryCity={fetchSingleCity}
      />
    </div>
  )
}