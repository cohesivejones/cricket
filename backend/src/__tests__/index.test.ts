import { describe, it, expect, beforeEach } from 'vitest'
import type { Env } from '../types'

describe('Worker API', () => {
  let mockEnv: Env
  let worker: any

  beforeEach(async () => {
    // Mock environment
    const store = new Map<string, string>()
    mockEnv = {
      SESSIONS: {
        get: async (key: string) => store.get(key) || null,
        put: async (key: string, value: string) => { store.set(key, value) }
      } as KVNamespace
    }

    // Import worker after setting up mock
    worker = await import('../index')
  })

  describe('POST /api/session', () => {
    it('should create a new session', async () => {
      const request = new Request('http://localhost/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'test-123' })
      })

      const response = await worker.default.fetch(request, mockEnv)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.sessionId).toBe('test-123')
      expect(data.players).toEqual([])
    })

    it('should create a session with initial players', async () => {
      const request = new Request('http://localhost/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId: 'test-with-players', 
          players: ['Alice', 'Bob'] 
        })
      })

      const response = await worker.default.fetch(request, mockEnv)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.sessionId).toBe('test-with-players')
      expect(data.players).toEqual(['Alice', 'Bob'])
      expect(data.scores).toEqual({ Alice: 0, Bob: 0 })
    })

    it('should return 400 if sessionId is missing', async () => {
      const request = new Request('http://localhost/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      const response = await worker.default.fetch(request, mockEnv)
      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/session/:id', () => {
    it('should return 404 if session not found', async () => {
      const request = new Request('http://localhost/api/session/nonexistent', {
        method: 'GET'
      })

      const response = await worker.default.fetch(request, mockEnv)
      expect(response.status).toBe(404)
    })

    it('should return session if it exists', async () => {
      // Create session first
      const createRequest = new Request('http://localhost/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'test-456' })
      })
      await worker.default.fetch(createRequest, mockEnv)

      // Get session
      const getRequest = new Request('http://localhost/api/session/test-456', {
        method: 'GET'
      })
      const response = await worker.default.fetch(getRequest, mockEnv)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.sessionId).toBe('test-456')
    })
  })

  describe('POST /api/session/:id', () => {
    it('should update session data', async () => {
      // Create session first
      const createRequest = new Request('http://localhost/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'test-789' })
      })
      await worker.default.fetch(createRequest, mockEnv)

      // Update session
      const updateRequest = new Request('http://localhost/api/session/test-789', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          players: ['Alice', 'Bob'],
          scores: { Alice: 10 }
        })
      })
      const response = await worker.default.fetch(updateRequest, mockEnv)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.players).toEqual(['Alice', 'Bob'])
      expect(data.scores).toEqual({ Alice: 10 })
    })

    it('should return 404 if session does not exist', async () => {
      const request = new Request('http://localhost/api/session/nonexistent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players: ['Alice'] })
      })

      const response = await worker.default.fetch(request, mockEnv)
      expect(response.status).toBe(404)
    })
  })

  describe('CORS', () => {
    it('should handle OPTIONS requests', async () => {
      const request = new Request('http://localhost/api/session', {
        method: 'OPTIONS'
      })

      const response = await worker.default.fetch(request, mockEnv)
      expect(response.status).toBe(204)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })
  })
})
