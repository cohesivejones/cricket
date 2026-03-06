import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from '../../test-utils/MemoryRouter'
import Landing from '../Landing'

const mockNavigate = vi.fn()

vi.mock('wouter', async () => {
  const actual = await vi.importActual('wouter')
  return {
    ...actual,
    useLocation: () => ['/', mockNavigate]
  }
})

vi.mock('../../utils/api', () => ({
  generateSessionId: () => 'mock-uuid-123',
  createSession: vi.fn(() => Promise.resolve({ 
    sessionId: 'mock-uuid-123',
    players: [],
    scores: {},
    metadata: {},
    createdAt: '',
    lastUpdated: ''
  }))
}))

describe('Landing Page', () => {
  it('should render the landing page', () => {
    render(
      <MemoryRouter initialPath="/">
        <Landing />
      </MemoryRouter>
    )

    expect(screen.getByText(/scoreboard/i)).toBeInTheDocument()
  })

  it('should have a "New Game" button', () => {
    render(
      <MemoryRouter initialPath="/">
        <Landing />
      </MemoryRouter>
    )

    const button = screen.getByRole('button', { name: /new game/i })
    expect(button).toBeInTheDocument()
  })

  it('should navigate to session page when New Game is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <MemoryRouter initialPath="/">
        <Landing />
      </MemoryRouter>
    )

    const button = screen.getByRole('button', { name: /new game/i })
    await user.click(button)

    expect(mockNavigate).toHaveBeenCalledWith('/session/mock-uuid-123')
  })
})
