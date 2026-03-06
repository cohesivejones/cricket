import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createSession, getSession, updateSession, generateSessionId } from '../api'

describe('API Utils', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  describe('createSession', () => {
    it('should create a session', async () => {
      const mockSession = { sessionId: 'test-123', players: [], scores: {}, metadata: {}, createdAt: '', lastUpdated: '' }
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSession
      })

      const result = await createSession('test-123')
      
      expect(global.fetch).toHaveBeenCalledWith('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'test-123' })
      })
      expect(result).toEqual(mockSession)
    })

    it('should throw error on failure', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false })

      await expect(createSession('test')).rejects.toThrow('Failed to create session')
    })
  })

  describe('getSession', () => {
    it('should get a session', async () => {
      const mockSession = { sessionId: 'test-456', players: ['Alice'], scores: {}, metadata: {}, createdAt: '', lastUpdated: '' }
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSession
      })

      const result = await getSession('test-456')
      
      expect(global.fetch).toHaveBeenCalledWith('/api/session/test-456')
      expect(result).toEqual(mockSession)
    })

    it('should return null for 404', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false, status: 404 })

      const result = await getSession('nonexistent')
      expect(result).toBeNull()
    })

    it('should throw error on other failures', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false, status: 500 })

      await expect(getSession('test')).rejects.toThrow('Failed to get session')
    })
  })

  describe('updateSession', () => {
    it('should update a session', async () => {
      const mockUpdated = { sessionId: 'test-789', players: ['Bob'], scores: {}, metadata: {}, createdAt: '', lastUpdated: '' }
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdated
      })

      const result = await updateSession('test-789', { players: ['Bob'] })
      
      expect(global.fetch).toHaveBeenCalledWith('/api/session/test-789', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players: ['Bob'] })
      })
      expect(result).toEqual(mockUpdated)
    })

    it('should throw error on failure', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false })

      await expect(updateSession('test', {})).rejects.toThrow('Failed to update session')
    })
  })

  describe('generateSessionId', () => {
    it('should generate a valid UUID', () => {
      const id = generateSessionId()
      
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      expect(id).toMatch(uuidRegex)
    })
  })
})
