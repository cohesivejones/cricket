import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CricketScoreboard from '../CricketScoreboard'
import { initializeCricketGame, processDartThrow } from '../../utils/cricketGame'

describe('CricketScoreboard', () => {
  it('should render all cricket numbers (15-20 + Bulls)', () => {
    const game = initializeCricketGame('test', ['Alice', 'Bob'])
    
    render(<CricketScoreboard game={game} />)
    
    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('16')).toBeInTheDocument()
    expect(screen.getByText('17')).toBeInTheDocument()
    expect(screen.getByText('18')).toBeInTheDocument()
    expect(screen.getByText('19')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('Bull')).toBeInTheDocument()
  })

  it('should render all player names', () => {
    const game = initializeCricketGame('test', ['Alice', 'Bob', 'Charlie'])
    
    render(<CricketScoreboard game={game} />)
    
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Charlie')).toBeInTheDocument()
  })

  it('should display "-" for untouched numbers', () => {
    const game = initializeCricketGame('test', ['Alice'])
    
    const { container } = render(<CricketScoreboard game={game} />)
    
    // Should have multiple "-" symbols in table cells (7 numbers)
    const tableCells = container.querySelectorAll('tbody td')
    const dashCells = Array.from(tableCells).filter(cell => cell.textContent === '-')
    expect(dashCells.length).toBeGreaterThanOrEqual(6) // At least 6 untouched numbers
  })

  it('should display "/" for 1 hit', () => {
    let game = initializeCricketGame('test', ['Alice'])
    game = processDartThrow(game, { number: 20, hitType: 'single', hitsValue: 1 })
    
    const { container } = render(<CricketScoreboard game={game} />)
    
    // Check in table cells, not legend
    const tableCells = container.querySelectorAll('tbody td')
    const slashCell = Array.from(tableCells).find(cell => cell.textContent === '/')
    expect(slashCell).toBeTruthy()
  })

  it('should display "X" for 2 hits', () => {
    let game = initializeCricketGame('test', ['Alice'])
    game = processDartThrow(game, { number: 20, hitType: 'double', hitsValue: 2 })
    
    const { container } = render(<CricketScoreboard game={game} />)
    
    // Check in table cells, not legend
    const tableCells = container.querySelectorAll('tbody td:not(:first-child)')
    const xCell = Array.from(tableCells).find(cell => cell.textContent === 'X')
    expect(xCell).toBeTruthy()
  })

  it('should display "O" for open number', () => {
    let game = initializeCricketGame('test', ['Alice'])
    game = processDartThrow(game, { number: 20, hitType: 'triple', hitsValue: 3 })
    
    const { container } = render(<CricketScoreboard game={game} />)
    
    // Check in table cells, not legend
    const tableCells = container.querySelectorAll('tbody td:not(:first-child)')
    const oCell = Array.from(tableCells).find(cell => cell.textContent === 'O')
    expect(oCell).toBeTruthy()
  })

  it('should display accumulated score', () => {
    let game = initializeCricketGame('test', ['Alice'])
    // Open 20
    game = processDartThrow(game, { number: 20, hitType: 'triple', hitsValue: 3 })
    // Score 20 points
    game = processDartThrow(game, { number: 20, hitType: 'single', hitsValue: 1 })
    
    const { container } = render(<CricketScoreboard game={game} />)
    
    // Find the cell with score 20 (not the "20" number label)
    const tableCells = container.querySelectorAll('tbody td:not(:first-child)')
    const scoreCell = Array.from(tableCells).find(cell => cell.textContent === '20')
    expect(scoreCell).toBeTruthy()
  })

  it('should display total scores', () => {
    let game = initializeCricketGame('test', ['Alice', 'Bob'])
    // Alice opens and scores on 20
    game = processDartThrow(game, { number: 20, hitType: 'triple', hitsValue: 3 })
    game = processDartThrow(game, { number: 20, hitType: 'double', hitsValue: 2 })
    
    render(<CricketScoreboard game={game} />)
    
    // Alice should have 40 points total
    expect(screen.getByText('Score: 40')).toBeInTheDocument()
    expect(screen.getByText('Score: 0')).toBeInTheDocument()
  })

  it('should highlight current player', () => {
    const game = initializeCricketGame('test', ['Alice', 'Bob'])
    
    const { container } = render(<CricketScoreboard game={game} />)
    
    // First player (Alice) should be highlighted
    const headers = container.querySelectorAll('th')
    const aliceHeader = Array.from(headers).find(h => h.textContent?.includes('Alice'))
    
    expect(aliceHeader).toHaveStyle({ backgroundColor: expect.stringContaining('#') })
  })

  it('should show winner when game ends', () => {
    let game = initializeCricketGame('test', ['Alice'])
    
    // Close all numbers
    const numbers = [15, 16, 17, 18, 19, 20, 25]
    numbers.forEach(num => {
      game = processDartThrow(game, { 
        number: num as any, 
        hitType: 'triple', 
        hitsValue: 3 
      })
    })
    
    render(<CricketScoreboard game={game} />)
    
    expect(screen.getByText(/Winner: Alice/i)).toBeInTheDocument()
  })

  it('should show lock icon 🔒 for locked numbers without score', () => {
    let game = initializeCricketGame('test', ['Alice', 'Bob'])
    
    // Alice opens 20
    game = processDartThrow(game, { number: 20, hitType: 'triple', hitsValue: 3 })
    game = processDartThrow(game, { hitType: 'miss', hitsValue: 0 })
    game = processDartThrow(game, { hitType: 'miss', hitsValue: 0 })
    
    // Bob opens 20 (defensive close - both locked, neither scored)
    game = processDartThrow(game, { number: 20, hitType: 'triple', hitsValue: 3 })
    
    const { container } = render(<CricketScoreboard game={game} />)
    
    // Both players should see lock icon (no score on locked number)
    const cells = container.querySelectorAll('tbody td')
    const lockCells = Array.from(cells).filter(cell => cell.textContent === '🔒')
    expect(lockCells.length).toBe(2) // Both Alice and Bob show lock for 20
  })

  it('should show strikethrough score for locked numbers with score', () => {
    let game = initializeCricketGame('test', ['Alice', 'Bob'])
    
    // Alice opens 20 and scores
    game = processDartThrow(game, { number: 20, hitType: 'triple', hitsValue: 3 })
    game = processDartThrow(game, { number: 20, hitType: 'single', hitsValue: 1 }) // Score 20
    game = processDartThrow(game, { hitType: 'miss', hitsValue: 0 })
    
    // Bob opens 20 (defensive close - Alice has 20 points, now locked)
    game = processDartThrow(game, { number: 20, hitType: 'triple', hitsValue: 3 })
    
    const { container } = render(<CricketScoreboard game={game} />)
    
    // Alice should show strikethrough 20
    const cells = container.querySelectorAll('tbody td')
    const aliceScoreCell = Array.from(cells).find(cell => {
      const span = cell.querySelector('span')
      return span && span.style.textDecoration === 'line-through'
    })
    expect(aliceScoreCell).toBeTruthy()
    expect(aliceScoreCell?.textContent).toBe('20')
  })
})
