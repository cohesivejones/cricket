import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from '../../test-utils/MemoryRouter'
import Landing from '../Landing'
import * as api from '../../utils/api'

const mockNavigate = vi.fn()

vi.mock('wouter', async () => {
  const actual = await vi.importActual('wouter')
  return {
    ...actual,
    useLocation: () => ['/', mockNavigate]
  }
})

vi.mock('../../utils/api', () => ({
  generateSessionId: vi.fn(() => 'mock-uuid-123'),
  createSession: vi.fn(() => Promise.resolve())
}))

describe('Landing Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the landing page with player input', () => {
    render(
      <MemoryRouter initialPath="/">
        <Landing />
      </MemoryRouter>
    )

    expect(screen.getByText(/cricket scoreboard/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter player name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add player/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create game/i })).toBeInTheDocument()
  })

  it('should add players to the list', () => {
    render(
      <MemoryRouter initialPath="/">
        <Landing />
      </MemoryRouter>
    )

    const input = screen.getByPlaceholderText(/enter player name/i)
    const form = input.closest('form')!

    // Add first player
    fireEvent.change(input, { target: { value: 'Alice' } })
    fireEvent.submit(form)

    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText(/Players \(1 player\)/)).toBeInTheDocument()

    // Add second player
    fireEvent.change(input, { target: { value: 'Bob' } })
    fireEvent.submit(form)

    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText(/Players \(2 players\)/)).toBeInTheDocument()
  })

  it('should remove players from the list', () => {
    render(
      <MemoryRouter initialPath="/">
        <Landing />
      </MemoryRouter>
    )

    const input = screen.getByPlaceholderText(/enter player name/i)
    const form = input.closest('form')!

    // Add player
    fireEvent.change(input, { target: { value: 'Alice' } })
    fireEvent.submit(form)

    // Remove player
    const removeButton = screen.getByRole('button', { name: /remove alice/i })
    fireEvent.click(removeButton)

    expect(screen.queryByText('Alice')).not.toBeInTheDocument()
    expect(screen.getByText('0 players')).toBeInTheDocument()
  })

  it('should disable "Create Game" button with less than 2 players', () => {
    render(
      <MemoryRouter initialPath="/">
        <Landing />
      </MemoryRouter>
    )

    const createButton = screen.getByRole('button', { name: /create game/i })
    expect(createButton).toBeDisabled()

    // Add one player
    const input = screen.getByPlaceholderText(/enter player name/i)
    const form = input.closest('form')!
    
    fireEvent.change(input, { target: { value: 'Alice' } })
    fireEvent.submit(form)

    expect(createButton).toBeDisabled()
  })

  it('should enable "Create Game" button with 2 or more players', () => {
    render(
      <MemoryRouter initialPath="/">
        <Landing />
      </MemoryRouter>
    )

    const input = screen.getByPlaceholderText(/enter player name/i)
    const form = input.closest('form')!
    const createButton = screen.getByRole('button', { name: /create game/i })

    // Add two players
    fireEvent.change(input, { target: { value: 'Alice' } })
    fireEvent.submit(form)
    
    fireEvent.change(input, { target: { value: 'Bob' } })
    fireEvent.submit(form)

    expect(createButton).not.toBeDisabled()
  })

  it('should create session with players and redirect', async () => {
    render(
      <MemoryRouter initialPath="/">
        <Landing />
      </MemoryRouter>
    )

    const input = screen.getByPlaceholderText(/enter player name/i)
    const form = input.closest('form')!
    
    // Add players
    fireEvent.change(input, { target: { value: 'Alice' } })
    fireEvent.submit(form)
    fireEvent.change(input, { target: { value: 'Bob' } })
    fireEvent.submit(form)

    const createButton = screen.getByRole('button', { name: /create game/i })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(api.generateSessionId).toHaveBeenCalled()
      expect(api.createSession).toHaveBeenCalledWith('mock-uuid-123', ['Alice', 'Bob'])
      expect(mockNavigate).toHaveBeenCalledWith('/session/mock-uuid-123')
    })
  })

  it('should not add duplicate players', () => {
    render(
      <MemoryRouter initialPath="/">
        <Landing />
      </MemoryRouter>
    )

    const input = screen.getByPlaceholderText(/enter player name/i)
    const form = input.closest('form')!

    // Add same player twice
    fireEvent.change(input, { target: { value: 'Alice' } })
    fireEvent.submit(form)
    
    fireEvent.change(input, { target: { value: 'Alice' } })
    fireEvent.submit(form)

    const aliceElements = screen.getAllByText('Alice')
    expect(aliceElements).toHaveLength(1) // Should only appear once in list
    expect(screen.getByText(/Players \(1 player\)/)).toBeInTheDocument()
  })
})
