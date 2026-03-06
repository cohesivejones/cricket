import { describe, it, expect, beforeEach } from 'vitest'
import { createSession, getSession, updateSession } from '../sessionManager.js'

describe('SessionManager', () => {
  let mockKV

  beforeEach(() => {
    // Mock KV store
    const store = new Map()
    mockKV = {
      get: async (key) => store.get(key) || null,
      put: async (key, value) => store.set(key, value)
    }
  })

  describe('createSession', () => {
    it('should create a new session with given ID', async () => {
      const sessionId = 'test-session-123'
      const session = await createSession(mockKV, sessionId)

      expect(session).toEqual({
        sessionId: 'test-session-123',
        players: [],
        scores: {},
        metadata: {},
        createdAt: expect.any(String),
        lastUpdated: expect.any(String)
      })
    })

    it('should store session in KV', async () => {
      const sessionId = 'test-session-456'
      await createSession(mockKV, sessionId)

      const stored = await mockKV.get(`session:${sessionId}`)
      expect(stored).toBeDefined()
      
      const parsed = JSON.parse(stored)
      expect(parsed.sessionId).toBe(sessionId)
    })
  })

  describe('getSession', () => {
    it('should return null if session does not exist', async () => {
      const session = await getSession(mockKV, 'nonexistent')
      expect(session).toBeNull()
    })

    it('should retrieve existing session', async () => {
      const sessionId = 'test-session-789'
      await createSession(mockKV, sessionId)

      const session = await getSession(mockKV, sessionId)
      expect(session).toBeDefined()
      expect(session.sessionId).toBe(sessionId)
    })
  })

  describe('updateSession', () => {
    it('should update session data', async () => {
      const sessionId = 'test-update-123'
      await createSession(mockKV, sessionId)

      const updates = {
        players: ['Alice', 'Bob'],
        scores: { Alice: 10, Bob: 5 }
      }

      const updated = await updateSession(mockKV, sessionId, updates)
      
      expect(updated.players).toEqual(['Alice', 'Bob'])
      expect(updated.scores).toEqual({ Alice: 10, Bob: 5 })
      expect(updated.lastUpdated).toBeDefined()
    })

    it('should return null if session does not exist', async () => {
      const result = await updateSession(mockKV, 'nonexistent', {})
      expect(result).toBeNull()
    })

    it('should preserve existing data when updating', async () => {
      const sessionId = 'test-preserve-123'
      await createSession(mockKV, sessionId)
      
      await updateSession(mockKV, sessionId, { players: ['Alice'] })
      const updated = await updateSession(mockKV, sessionId, { scores: { Alice: 10 } })

      expect(updated.players).toEqual(['Alice'])
      expect(updated.scores).toEqual({ Alice: 10 })
    })
  })
})
