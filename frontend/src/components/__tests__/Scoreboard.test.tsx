import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Scoreboard from '../Scoreboard'
import * as api from '../../utils/api'
import type { Session } from '../../types'

vi.mock('../../utils/api')

describe('Scoreboard Component', () => {
  const mockSession: Session = {
    sessionId: 'test-123',
    players: ['Alice', 'Bob'],
    scores: { Alice: 10, Bob: 5 },
    metadata: {},
    createdAt: '',
    lastUpdated: ''
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display all players and scores', () => {
    render(<Scoreboard session={mockSession} />)

    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('should not show "Add Player" form in readonly mode', () => {
    render(<Scoreboard session={mockSession} />)

    expect(screen.queryByPlaceholderText(/enter player name/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /add player/i })).not.toBeInTheDocument()
  })

  it('should increment player score', async () => {
    vi.spyOn(api, 'updateSession').mockResolvedValue({} as any)

    render(<Scoreboard session={mockSession} />)

    const incrementButtons = screen.getAllByRole('button', { name: /\+1/i })
    fireEvent.click(incrementButtons[0]) // Click Alice's +1 button

    await waitFor(() => {
      expect(api.updateSession).toHaveBeenCalledWith('test-123', {
        scores: { Alice: 11, Bob: 5 }
      })
    })
  })

  it('should decrement player score', async () => {
    vi.spyOn(api, 'updateSession').mockResolvedValue({} as any)

    render(<Scoreboard session={mockSession} />)

    const decrementButtons = screen.getAllByRole('button', { name: /-1/i })
    fireEvent.click(decrementButtons[0]) // Click Alice's -1 button

    await waitFor(() => {
      expect(api.updateSession).toHaveBeenCalledWith('test-123', {
        scores: { Alice: 9, Bob: 5 }
      })
    })
  })

  it('should not allow score to go below 0', async () => {
    const sessionWithZeroScore: Session = {
      ...mockSession,
      scores: { Alice: 0, Bob: 5 }
    }

    vi.spyOn(api, 'updateSession').mockResolvedValue({} as any)

    render(<Scoreboard session={sessionWithZeroScore} />)

    const decrementButtons = screen.getAllByRole('button', { name: /-1/i })
    fireEvent.click(decrementButtons[0]) // Click Alice's -1 button

    await waitFor(() => {
      expect(api.updateSession).toHaveBeenCalledWith('test-123', {
        scores: { Alice: 0, Bob: 5 } // Should stay at 0
      })
    })
  })

  it('should disable buttons while updating', async () => {
    vi.spyOn(api, 'updateSession').mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )

    render(<Scoreboard session={mockSession} />)

    const incrementButtons = screen.getAllByRole('button', { name: /\+1/i })
    fireEvent.click(incrementButtons[0])

    // Buttons should be disabled during update
    await waitFor(() => {
      incrementButtons.forEach(btn => {
        expect(btn).toBeDisabled()
      })
    })
  })

  it('should display message when no players exist', () => {
    const emptySession: Session = {
      ...mockSession,
      players: [],
      scores: {}
    }

    render(<Scoreboard session={emptySession} />)

    expect(screen.getByText(/no players/i)).toBeInTheDocument()
  })
})
