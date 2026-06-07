import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AlarmForm } from '../components/AlarmForm'

describe('AlarmForm', () => {
  it('渲染時間輸入欄位和標籤輸入欄位', () => {
    render(<AlarmForm onAdd={vi.fn()} />)
    expect(screen.getByLabelText('時間')).toBeInTheDocument()
    expect(screen.getByLabelText('標籤')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '新增鬧鐘' })).toBeInTheDocument()
  })

  it('填入時間和標籤後點擊新增，呼叫 onAdd', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<AlarmForm onAdd={onAdd} />)

    const timeInput = screen.getByLabelText('時間')
    const labelInput = screen.getByLabelText('標籤')

    await user.clear(timeInput)
    await user.type(timeInput, '08:30')
    await user.type(labelInput, '早起')
    await user.click(screen.getByRole('button', { name: '新增鬧鐘' }))

    expect(onAdd).toHaveBeenCalledWith('08:30', '早起')
  })

  it('新增後表單清空', async () => {
    const user = userEvent.setup()
    render(<AlarmForm onAdd={vi.fn()} />)

    const timeInput = screen.getByLabelText('時間')
    const labelInput = screen.getByLabelText('標籤')

    await user.clear(timeInput)
    await user.type(timeInput, '09:00')
    await user.type(labelInput, '早起')
    await user.click(screen.getByRole('button', { name: '新增鬧鐘' }))

    expect(labelInput).toHaveValue('')
  })
})
