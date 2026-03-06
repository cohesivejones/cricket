import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useSession } from '../useSession'
import * as api from '../../utils/api'
import type { Session } from '../../types'

vi.mock('../../utils/api')

describe('useSession hook', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should fetch session on mount', async () => {
    const mockSession: Session = { 
      sessionId: 'test-123', 
      players: [], 
      scores: {},
      metadata: {},
      createdAt: '',
      lastUpdated: ''
    }
    vi.spyOn(api, 'getSession').mockResolvedValue(mockSession)

    const { result } = renderHook(() => useSession('test-123'))

    expect(result.current.loading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.session).toEqual(mockSession)
    expect(result.current.error).toBeNull()
  })

  it('should handle session not found', async () => {
    vi.spyOn(api, 'getSession').mockResolvedValue(null)

    const { result } = renderHook(() => useSession('nonexistent'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.session).toBeNull()
    expect(result.current.error).toBe('Session not found')
  })

  it('should handle errors', async () => {
    vi.spyOn(api, 'getSession').mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useSession('test-123'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Network error')
  })

  it('should poll for updates every 3 seconds', async () => {
    vi.useFakeTimers()
    
    const mockSession: Session = { 
      sessionId: 'test-123', 
      players: [], 
      scores: {},
      metadata: {},
      createdAt: '',
      lastUpdated: ''
    }
    const getSpy = vi.spyOn(api, 'getSession').mockResolvedValue(mockSession)

    renderHook(() => useSession('test-123'))

    await vi.waitFor(() => {
      expect(getSpy).toHaveBeenCalledTimes(1)
    })

    // Advance time by 3 seconds
    await vi.advanceTimersByTimeAsync(3000)

    await vi.waitFor(() => {
      expect(getSpy).toHaveBeenCalledTimes(2)
    })

    // Advance time by another 3 seconds
    await vi.advanceTimersByTimeAsync(3000)

    await vi.waitFor(() => {
      expect(getSpy).toHaveBeenCalledTimes(3)
    })
    
    vi.useRealTimers()
  })

  it('should cleanup interval on unmount', async () => {
    const mockSession: Session = { 
      sessionId: 'test-123', 
      players: [], 
      scores: {},
      metadata: {},
      createdAt: '',
      lastUpdated: ''
    }
    vi.spyOn(api, 'getSession').mockResolvedValue(mockSession)

    const { unmount } = renderHook(() => useSession('test-123'))

    await waitFor(() => {
      expect(api.getSession).toHaveBeenCalled()
    })

    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
    unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()
  })
})
