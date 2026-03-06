import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from '../../test-utils/MemoryRouter'
import Session from '../Session'
import type { Session as SessionType } from '../../types'

vi.mock('wouter', async () => {
  const actual = await vi.importActual('wouter')
  return {
    ...actual,
    useParams: () => ({ id: 'test-session-123' })
  }
})

vi.mock('../../hooks/useSession', () => ({
  useSession: vi.fn()
}))

vi.mock('../../components/Scoreboard', () => ({
  default: () => <div>Scoreboard</div>
}))

import { useSession } from '../../hooks/useSession'

describe('Session Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show loading state', () => {
    (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
      session: null,
      loading: true,
      error: null
    })

    render(
      <MemoryRouter initialPath="/session/test-123">
        <Session />
      </MemoryRouter>
    )

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('should show error state', () => {
    (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
      session: null,
      loading: false,
      error: 'Session not found'
    })

    render(
      <MemoryRouter initialPath="/session/test-123">
        <Session />
      </MemoryRouter>
    )

    expect(screen.getByText(/session not found/i)).toBeInTheDocument()
  })

  it('should display session ID', () => {
    const mockSession: SessionType = {
      sessionId: 'test-session-123',
      players: [],
      scores: {},
      metadata: {},
      createdAt: '',
      lastUpdated: ''
    };

    (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
      session: mockSession,
      loading: false,
      error: null
    })

    render(
      <MemoryRouter initialPath="/session/test-123">
        <Session />
      </MemoryRouter>
    )

    expect(screen.getByText(/test-session-123/i)).toBeInTheDocument()
  })

  it('should display scoreboard when session loaded', () => {
    const mockSession: SessionType = {
      sessionId: 'test-session-123',
      players: ['Alice', 'Bob'],
      scores: { Alice: 10, Bob: 5 },
      metadata: {},
      createdAt: '',
      lastUpdated: ''
    };

    (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
      session: mockSession,
      loading: false,
      error: null
    })

    render(
      <MemoryRouter initialPath="/session/test-123">
        <Session />
      </MemoryRouter>
    )

    // Mock component renders just "Scoreboard" text (exact match to avoid h1 "Cricket Scoreboard")
    expect(screen.getByText('Scoreboard')).toBeInTheDocument()
  })
})
