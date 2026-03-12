/**
 * Tests for SSE stream manager
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createSSEStream } from '../streamManager'
import type { Session } from '../types'

describe('createSSEStream', () => {
  let mockKV: KVNamespace
  let mockSession: Session

  beforeEach(() => {
    // Mock KV namespace
    mockKV = {
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
      getWithMetadata: vi.fn(),
      // @ts-ignore - minimal mock
    } as KVNamespace

    // Mock session data
    mockSession = {
      sessionId: 'test-123',
      players: ['Player 1', 'Player 2'],
      scores: { 'Player 1': 0, 'Player 2': 0 },
      metadata: {},
      createdAt: '2024-01-01T00:00:00Z',
      lastUpdated: '2024-01-01T00:00:00Z',
    }

    vi.clearAllMocks()
  })

  it('returns Response with correct SSE headers', async () => {
    vi.mocked(mockKV.get).mockResolvedValue(JSON.stringify(mockSession))

    const response = await createSSEStream(mockKV, 'test-123', 1000)

    expect(response).toBeInstanceOf(Response)
    expect(response.headers.get('Content-Type')).toBe('text/event-stream')
    expect(response.headers.get('Cache-Control')).toBe('no-cache')
    expect(response.headers.get('Connection')).toBe('keep-alive')
  })

  it('returns 404 when session not found', async () => {
    vi.mocked(mockKV.get).mockResolvedValue(null)

    const response = await createSSEStream(mockKV, 'non-existent', 1000)

    expect(response.status).toBe(404)
    expect(response.headers.get('Content-Type')).toBe('application/json')
  })

  it('sends initial session state immediately', async () => {
    vi.mocked(mockKV.get).mockResolvedValue(JSON.stringify(mockSession))

    const response = await createSSEStream(mockKV, 'test-123', 1000)
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    // Read first chunk
    const { value } = await reader!.read()
    const text = decoder.decode(value)

    expect(text).toContain('event: update')
    expect(text).toContain(`data: ${JSON.stringify(mockSession)}`)
    expect(text).toContain('\n\n')

    // Cleanup
    await reader!.cancel()
  })

  it('formats SSE messages correctly', async () => {
    vi.mocked(mockKV.get).mockResolvedValue(JSON.stringify(mockSession))

    const response = await createSSEStream(mockKV, 'test-123', 1000)
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    const { value } = await reader!.read()
    const text = decoder.decode(value)

    // SSE format: event: <type>\ndata: <json>\n\n
    const lines = text.split('\n')
    expect(lines[0]).toBe('event: update')
    expect(lines[1]).toMatch(/^data: \{.*\}$/)
    expect(lines[2]).toBe('')

    await reader!.cancel()
  })

  it('sends keepalive comments when no changes', async () => {
    const unchangedSession = { ...mockSession }
    vi.mocked(mockKV.get).mockResolvedValue(JSON.stringify(unchangedSession))

    const response = await createSSEStream(mockKV, 'test-123', 100) // 100ms for fast test
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    // Skip initial message
    await reader!.read()

    // Wait for multiple heartbeat intervals to ensure keepalive is sent
    await new Promise((resolve) => setTimeout(resolve, 16000)) // Wait over KEEPALIVE_INTERVAL

    const { value } = await reader!.read()
    const text = decoder.decode(value)

    expect(text).toContain(': keepalive')

    await reader!.cancel()
  }, 20000) // Increase test timeout

  it('detects and sends updates when KV data changes', async () => {
    const initialSession = { ...mockSession, lastUpdated: '2024-01-01T00:00:00Z' }
    const updatedSession = { ...mockSession, lastUpdated: '2024-01-01T00:01:00Z' }

    // First call returns initial, second returns updated
    vi.mocked(mockKV.get)
      .mockResolvedValueOnce(JSON.stringify(initialSession))
      .mockResolvedValueOnce(JSON.stringify(initialSession))
      .mockResolvedValueOnce(JSON.stringify(updatedSession))

    const response = await createSSEStream(mockKV, 'test-123', 100)
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    // Skip initial message
    await reader!.read()

    // Wait for heartbeat with changed data
    await new Promise((resolve) => setTimeout(resolve, 250))

    const { value } = await reader!.read()
    const text = decoder.decode(value)

    expect(text).toContain('event: update')
    expect(text).toContain(updatedSession.lastUpdated)

    await reader!.cancel()
  })

  it('handles KV read errors gracefully', async () => {
    const updatedSession = { ...mockSession, lastUpdated: '2024-01-01T00:01:00Z' }
    
    vi.mocked(mockKV.get)
      .mockResolvedValueOnce(JSON.stringify(mockSession))
      .mockRejectedValueOnce(new Error('KV error'))
      .mockResolvedValueOnce(JSON.stringify(updatedSession)) // Recovery with changed data

    const response = await createSSEStream(mockKV, 'test-123', 100)
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    // Read initial message
    await reader!.read()
    
    // Wait for error heartbeat and recovery heartbeat
    await new Promise((resolve) => setTimeout(resolve, 350))
    
    // Should receive the updated session after recovery
    const result = await reader!.read()
    const text = decoder.decode(result.value)

    // Stream recovered and sent update
    expect(result.done).toBe(false)
    expect(text).toContain(updatedSession.lastUpdated)

    await reader!.cancel()
  })

  it('closes stream after max duration', async () => {
    vi.mocked(mockKV.get).mockResolvedValue(JSON.stringify(mockSession))

    const response = await createSSEStream(mockKV, 'test-123', 50, 150) // 150ms max
    const reader = response.body?.getReader()

    // Skip initial message
    await reader!.read()

    // Wait for max duration
    await new Promise((resolve) => setTimeout(resolve, 200))

    const result = await reader!.read()
    expect(result.done).toBe(true) // Stream closed
  })
})
