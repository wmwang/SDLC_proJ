import React from 'react'

/**
 * @param {Object} props
 * @param {string} props.searchQuery
 * @param {function(string): void} props.onSearchChange
 * @param {string} props.selectedRegion
 * @param {function(string): void} props.onRegionChange
 * @param {'C'|'F'} props.tempUnit
 * @param {function('C'|'F'): void} props.onUnitChange
 */
export function CitySearchBar({
  searchQuery,
  onSearchChange,
  selectedRegion,
  onRegionChange,
  tempUnit,
  onUnitChange
}) {
  const regions = ['全部', '亞洲', '歐洲', '美洲', '非洲', '大洋洲']

  return (
    <div className="search-bar-container">
      <input
        type="text"
        className="search-input"
        placeholder="搜尋城市名稱..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label="搜尋城市名稱"
      />

      <select
        className="region-select"
        value={selectedRegion}
        onChange={(e) => onRegionChange(e.target.value)}
        aria-label="選擇區域"
      >
        {regions.map(r => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      <div className="unit-toggle" role="group" aria-label="溫度單位">
        <button
          type="button"
          className={`unit-btn ${tempUnit === 'C' ? 'active' : ''}`}
          onClick={() => onUnitChange('C')}
          aria-pressed={tempUnit === 'C'}
        >
          °C
        </button>
        <button
          type="button"
          className={`unit-btn ${tempUnit === 'F' ? 'active' : ''}`}
          onClick={() => onUnitChange('F')}
          aria-pressed={tempUnit === 'F'}
        >
          °F
        </button>
      </div>
    </div>
  )
}
