import { describe, it, expect, beforeEach } from 'vitest'
import { createSession, getSession, updateSession } from '../sessionManager'

describe('Session Manager', () => {
  let mockKV: KVNamespace

  beforeEach(() => {
    // Mock KV namespace
    const store = new Map<string, string>()
    mockKV = {
      get: async (key: string) => store.get(key) || null,
      put: async (key: string, value: string) => { store.set(key, value) }
    } as KVNamespace
  })

  describe('createSession', () => {
    it('should create a session with empty players', async () => {
      const session = await createSession(mockKV, 'test-123')

      expect(session.sessionId).toBe('test-123')
      expect(session.players).toEqual([])
      expect(session.scores).toEqual({})
      expect(session.createdAt).toBeDefined()
    })

    it('should create a session with initial players', async () => {
      const session = await createSession(mockKV, 'test-456', ['Alice', 'Bob'])

      expect(session.sessionId).toBe('test-456')
      expect(session.players).toEqual(['Alice', 'Bob'])
      expect(session.scores).toEqual({ Alice: 0, Bob: 0 })
    })

    it('should store session in KV', async () => {
      await createSession(mockKV, 'test-789')
      const retrieved = await getSession(mockKV, 'test-789')

      expect(retrieved).not.toBeNull()
      expect(retrieved?.sessionId).toBe('test-789')
    })
  })

  describe('getSession', () => {
    it('should return null if session does not exist', async () => {
      const session = await getSession(mockKV, 'nonexistent')
      expect(session).toBeNull()
    })

    it('should return session if it exists', async () => {
      await createSession(mockKV, 'existing-session')
      const session = await getSession(mockKV, 'existing-session')

      expect(session).not.toBeNull()
      expect(session?.sessionId).toBe('existing-session')
    })
  })

  describe('updateSession', () => {
    it('should update session data', async () => {
      await createSession(mockKV, 'update-test')
      
      const updated = await updateSession(mockKV, 'update-test', {
        players: ['Charlie'],
        scores: { Charlie: 5 }
      })

      expect(updated?.players).toEqual(['Charlie'])
      expect(updated?.scores).toEqual({ Charlie: 5 })
    })

    it('should return null if session does not exist', async () => {
      const result = await updateSession(mockKV, 'nonexistent', {
        players: ['Alice']
      })

      expect(result).toBeNull()
    })

    it('should update lastUpdated timestamp', async () => {
      const original = await createSession(mockKV, 'timestamp-test')
      
      // Wait a tiny bit to ensure timestamp changes
      await new Promise(resolve => setTimeout(resolve, 10))
      
      const updated = await updateSession(mockKV, 'timestamp-test', {
        scores: { test: 1 }
      })

      expect(updated?.lastUpdated).not.toBe(original.lastUpdated)
    })
  })
})
