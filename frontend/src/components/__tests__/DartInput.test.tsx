import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DartInput from '../DartInput'
import type { DartThrow } from '../../types'

describe('DartInput', () => {
  it('should render all number buttons (15-20)', () => {
    const onThrow = vi.fn()
    render(<DartInput onDartThrow={onThrow} disabled={false} />)
    
    expect(screen.getByRole('button', { name: '15' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '16' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '17' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '18' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '19' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '20' })).toBeInTheDocument()
  })

  it('should render bull buttons', () => {
    const onThrow = vi.fn()
    render(<DartInput onDartThrow={onThrow} disabled={false} />)
    
    expect(screen.getByRole('button', { name: /outer bull/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /inner bull/i })).toBeInTheDocument()
  })

  it('should render hit type buttons', () => {
    const onThrow = vi.fn()
    render(<DartInput onDartThrow={onThrow} disabled={false} />)
    
    expect(screen.getByRole('button', { name: 'Single' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Double' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Triple' })).toBeInTheDocument()
  })

  it('should render miss button', () => {
    const onThrow = vi.fn()
    render(<DartInput onDartThrow={onThrow} disabled={false} />)
    
    expect(screen.getByRole('button', { name: 'Miss' })).toBeInTheDocument()
  })

  it('should call onDartThrow with miss when Miss button is clicked', () => {
    const onThrow = vi.fn()
    render(<DartInput onDartThrow={onThrow} disabled={false} />)
    
    const missButton = screen.getByRole('button', { name: 'Miss' })
    fireEvent.click(missButton)
    
    expect(onThrow).toHaveBeenCalledWith({
      hitType: 'miss',
      hitsValue: 0
    })
  })

  it('should call onDartThrow with single 20', () => {
    const onThrow = vi.fn()
    render(<DartInput onDartThrow={onThrow} disabled={false} />)
    
    // Click Single then 20
    fireEvent.click(screen.getByRole('button', { name: 'Single' }))
    fireEvent.click(screen.getByRole('button', { name: '20' }))
    
    expect(onThrow).toHaveBeenCalledWith({
      number: 20,
      hitType: 'single',
      hitsValue: 1
    })
  })

  it('should call onDartThrow with double 19', () => {
    const onThrow = vi.fn()
    render(<DartInput onDartThrow={onThrow} disabled={false} />)
    
    // Click Double then 19
    fireEvent.click(screen.getByRole('button', { name: 'Double' }))
    fireEvent.click(screen.getByRole('button', { name: '19' }))
    
    expect(onThrow).toHaveBeenCalledWith({
      number: 19,
      hitType: 'double',
      hitsValue: 2
    })
  })

  it('should call onDartThrow with triple 20', () => {
    const onThrow = vi.fn()
    render(<DartInput onDartThrow={onThrow} disabled={false} />)
    
    // Click Triple then 20
    fireEvent.click(screen.getByRole('button', { name: 'Triple' }))
    fireEvent.click(screen.getByRole('button', { name: '20' }))
    
    expect(onThrow).toHaveBeenCalledWith({
      number: 20,
      hitType: 'triple',
      hitsValue: 3
    })
  })

  it('should call onDartThrow with outer bull', () => {
    const onThrow = vi.fn()
    render(<DartInput onDartThrow={onThrow} disabled={false} />)
    
    const outerBullButton = screen.getByRole('button', { name: /outer bull/i })
    fireEvent.click(outerBullButton)
    
    expect(onThrow).toHaveBeenCalledWith({
      number: 25,
      hitType: 'outer-bull',
      hitsValue: 1
    })
  })

  it('should call onDartThrow with inner bull', () => {
    const onThrow = vi.fn()
    render(<DartInput onDartThrow={onThrow} disabled={false} />)
    
    const innerBullButton = screen.getByRole('button', { name: /inner bull/i })
    fireEvent.click(innerBullButton)
    
    expect(onThrow).toHaveBeenCalledWith({
      number: 25,
      hitType: 'inner-bull',
      hitsValue: 2
    })
  })

  it('should default to single if no multiplier selected', () => {
    const onThrow = vi.fn()
    render(<DartInput onDartThrow={onThrow} disabled={false} />)
    
    // Click 20 without selecting multiplier
    fireEvent.click(screen.getByRole('button', { name: '20' }))
    
    expect(onThrow).toHaveBeenCalledWith({
      number: 20,
      hitType: 'single',
      hitsValue: 1
    })
  })

  it('should disable all buttons when disabled prop is true', () => {
    const onThrow = vi.fn()
    render(<DartInput onDartThrow={onThrow} disabled={true} />)
    
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toBeDisabled()
    })
  })

  it('should highlight selected multiplier', () => {
    const onThrow = vi.fn()
    const { container } = render(<DartInput onDartThrow={onThrow} disabled={false} />)
    
    const doubleButton = screen.getByRole('button', { name: 'Double' })
    fireEvent.click(doubleButton)
    
    // Double button should have highlighted style
    expect(doubleButton).toHaveStyle({ backgroundColor: expect.stringContaining('#') })
  })
})
