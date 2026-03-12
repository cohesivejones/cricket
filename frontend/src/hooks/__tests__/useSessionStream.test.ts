/**
 * Tests for useSessionStream hook
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useSessionStream } from '../useSessionStream'
import type { Session } from '../../types'

describe('useSessionStream', () => {
  let mockEventSource: any
  let mockSession: Session

  beforeEach(() => {
    mockSession = {
      sessionId: 'test-123',
      players: ['Player 1', 'Player 2'],
      scores: { 'Player 1': 0, 'Player 2': 0 },
      metadata: {},
      createdAt: '2024-01-01T00:00:00Z',
      lastUpdated: '2024-01-01T00:00:00Z',
    }

    // Mock EventSource
    mockEventSource = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      close: vi.fn(),
      readyState: 0,
      CONNECTING: 0,
      OPEN: 1,
      CLOSED: 2,
    }

    // @ts-ignore
    global.EventSource = vi.fn(() => mockEventSource)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('creates EventSource with correct URL', () => {
    const { result } = renderHook(() => useSessionStream('test-123'))

    expect(global.EventSource).toHaveBeenCalledWith('/api/session/test-123/stream')
  })

  it('sets loading state initially', () => {
    const { result } = renderHook(() => useSessionStream('test-123'))

    expect(result.current.loading).toBe(true)
    expect(result.current.session).toBe(null)
    expect(result.current.error).toBe(null)
  })

  it('updates session state when receiving update event', async () => {
    const { result } = renderHook(() => useSessionStream('test-123'))

    // Simulate EventSource open event
    const openHandler = mockEventSource.addEventListener.mock.calls.find(
      (call: any[]) => call[0] === 'open'
    )?.[1]
    openHandler?.(new Event('open'))

    // Simulate receiving session update
    const updateHandler = mockEventSource.addEventListener.mock.calls.find(
      (call: any[]) => call[0] === 'update'
    )?.[1]

    const messageEvent = new MessageEvent('update', {
      data: JSON.stringify(mockSession),
    })
    updateHandler?.(messageEvent)

    await waitFor(() => {
      expect(result.current.session).toEqual(mockSession)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
    })
  })

  it('sets error state when connection fails', async () => {
    const { result } = renderHook(() => useSessionStream('test-123'))

    // Simulate EventSource error event
    const errorHandler = mockEventSource.addEventListener.mock.calls.find(
      (call: any[]) => call[0] === 'error'
    )?.[1]
    errorHandler?.(new Event('error'))

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
      expect(result.current.loading).toBe(false)
    })
  })

  it('closes EventSource on unmount', () => {
    const { unmount } = renderHook(() => useSessionStream('test-123'))

    unmount()

    expect(mockEventSource.close).toHaveBeenCalled()
  })

  it('does not create EventSource when sessionId is empty', () => {
    renderHook(() => useSessionStream(''))

    expect(global.EventSource).not.toHaveBeenCalled()
  })

  it('recreates EventSource when sessionId changes', () => {
    const { rerender } = renderHook(
      ({ sessionId }) => useSessionStream(sessionId),
      { initialProps: { sessionId: 'test-123' } }
    )

    expect(global.EventSource).toHaveBeenCalledWith('/api/session/test-123/stream')
    expect(global.EventSource).toHaveBeenCalledTimes(1)

    // Change sessionId
    rerender({ sessionId: 'test-456' })

    expect(mockEventSource.close).toHaveBeenCalled()
    expect(global.EventSource).toHaveBeenCalledWith('/api/session/test-456/stream')
    expect(global.EventSource).toHaveBeenCalledTimes(2)
  })

  it('handles invalid JSON in update event', async () => {
    const { result } = renderHook(() => useSessionStream('test-123'))

    const updateHandler = mockEventSource.addEventListener.mock.calls.find(
      (call: any[]) => call[0] === 'update'
    )?.[1]

    const messageEvent = new MessageEvent('update', {
      data: 'invalid json',
    })
    updateHandler?.(messageEvent)

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })
  })
})
