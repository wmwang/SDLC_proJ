import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CitySearchBar } from '../components/CitySearchBar'

describe('CitySearchBar Component', () => {

  it('應能正確渲染輸入框、區域選擇器及單位切換按鈕，並反映狀態變化', () => {
    const mockSearchChange = vi.fn()
    const mockRegionChange = vi.fn()
    const mockUnitChange = vi.fn()

    render(
      <CitySearchBar
        searchQuery=""
        onSearchChange={mockSearchChange}
        selectedRegion="全部"
        onRegionChange={mockRegionChange}
        tempUnit="C"
        onUnitChange={mockUnitChange}
      />
    )

    const input = screen.getByPlaceholderText('搜尋城市名稱...')
    fireEvent.change(input, { target: { value: '東京' } })
    expect(mockSearchChange).toHaveBeenCalledWith('東京')

    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: '亞洲' } })
    expect(mockRegionChange).toHaveBeenCalledWith('亞洲')

    const fahrenheitBtn = screen.getByRole('button', { name: '°F' })
    fireEvent.click(fahrenheitBtn)
    expect(mockUnitChange).toHaveBeenCalledWith('F')
  })
})
