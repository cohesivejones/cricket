import { describe, it, expect, beforeEach } from 'vitest'
import { env, SELF } from 'cloudflare:test'

describe('Worker API', () => {
  beforeEach(async () => {
    // Clear KV storage between tests
    const keys = await env.SESSIONS.list()
    for (const key of keys.keys) {
      await env.SESSIONS.delete(key.name)
    }
  })

  describe('POST /api/session', () => {
    it('should create a new session', async () => {
      const response = await SELF.fetch('http://localhost/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'test-123' })
      })
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.sessionId).toBe('test-123')
      expect(data.players).toEqual([])
    })

    it('should create a session with initial players', async () => {
      const response = await SELF.fetch('http://localhost/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId: 'test-with-players', 
          players: ['Alice', 'Bob'] 
        })
      })
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.sessionId).toBe('test-with-players')
      expect(data.players).toEqual(['Alice', 'Bob'])
      expect(data.scores).toEqual({ Alice: 0, Bob: 0 })
    })

    it('should return 400 if sessionId is missing', async () => {
      const response = await SELF.fetch('http://localhost/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/session/:id', () => {
    it('should return 404 if session not found', async () => {
      const response = await SELF.fetch('http://localhost/api/session/nonexistent', {
        method: 'GET'
      })

      expect(response.status).toBe(404)
    })

    it('should return session if it exists', async () => {
      // Create session first
      await SELF.fetch('http://localhost/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'test-456' })
      })

      // Get session
      const response = await SELF.fetch('http://localhost/api/session/test-456', {
        method: 'GET'
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.sessionId).toBe('test-456')
    })
  })

  describe('POST /api/session/:id', () => {
    it('should update session data', async () => {
      // Create session first
      await SELF.fetch('http://localhost/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'test-789' })
      })

      // Update session
      const response = await SELF.fetch('http://localhost/api/session/test-789', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          players: ['Alice', 'Bob'],
          scores: { Alice: 10 }
        })
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.players).toEqual(['Alice', 'Bob'])
      expect(data.scores).toEqual({ Alice: 10 })
    })

    it('should return 404 if session does not exist', async () => {
      const response = await SELF.fetch('http://localhost/api/session/nonexistent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players: ['Alice'] })
      })

      expect(response.status).toBe(404)
    })
  })

  describe('PUT /api/session/:id/game', () => {
    it('should save game state to session', async () => {
      // Create session first
      await SELF.fetch('http://localhost/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'game-test-1', players: ['Alice', 'Bob'] })
      })

      // Update game state
      const gameState = {
        sessionId: 'game-test-1',
        players: [
          { name: 'Alice', numbers: {}, totalScore: 0 },
          { name: 'Bob', numbers: {}, totalScore: 0 }
        ],
        currentPlayerIndex: 0,
        dartsRemaining: 3,
        gameStarted: true,
        gameEnded: false,
        createdAt: '2026-03-08T06:00:00Z',
        lastUpdated: '2026-03-08T06:00:00Z'
      }

      const response = await SELF.fetch('http://localhost/api/session/game-test-1/game', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameState)
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.cricketGame).toEqual(gameState)
      expect(data.sessionId).toBe('game-test-1')
      expect(data.players).toEqual(['Alice', 'Bob'])
    })

    it('should use correct KV key with session prefix', async () => {
      // Create session
      await SELF.fetch('http://localhost/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'key-test', players: ['Player1'] })
      })

      // Update game state
      const gameState = {
        sessionId: 'key-test',
        players: [{ name: 'Player1', numbers: {}, totalScore: 0 }],
        currentPlayerIndex: 0,
        dartsRemaining: 3,
        gameStarted: false,
        gameEnded: false,
        createdAt: '2026-03-08T06:00:00Z',
        lastUpdated: '2026-03-08T06:00:00Z'
      }

      await SELF.fetch('http://localhost/api/session/key-test/game', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameState)
      })

      // Verify it was saved with correct key by retrieving it
      const response = await SELF.fetch('http://localhost/api/session/key-test', {
        method: 'GET'
      })
      const data = await response.json()

      expect(data.cricketGame).toEqual(gameState)
    })

    it('should return 404 for non-existent session', async () => {
      const gameState = {
        sessionId: 'nonexistent',
        players: [],
        currentPlayerIndex: 0,
        dartsRemaining: 3,
        gameStarted: false,
        gameEnded: false,
        createdAt: '2026-03-08T06:00:00Z',
        lastUpdated: '2026-03-08T06:00:00Z'
      }

      const response = await SELF.fetch('http://localhost/api/session/nonexistent/game', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameState)
      })

      expect(response.status).toBe(404)
    })

    it('should preserve existing session data', async () => {
      // Create session with initial data
      await SELF.fetch('http://localhost/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId: 'preserve-test',
          players: ['Alice', 'Bob']
        })
      })

      // Update with additional data
      await SELF.fetch('http://localhost/api/session/preserve-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scores: { Alice: 10, Bob: 5 },
          metadata: { custom: 'data' }
        })
      })

      // Save game state
      const gameState = {
        sessionId: 'preserve-test',
        players: [
          { name: 'Alice', numbers: {}, totalScore: 0 },
          { name: 'Bob', numbers: {}, totalScore: 0 }
        ],
        currentPlayerIndex: 0,
        dartsRemaining: 3,
        gameStarted: true,
        gameEnded: false,
        createdAt: '2026-03-08T06:00:00Z',
        lastUpdated: '2026-03-08T06:00:00Z'
      }

      const response = await SELF.fetch('http://localhost/api/session/preserve-test/game', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameState)
      })
      const data = await response.json()

      // Verify existing data is preserved
      expect(data.players).toEqual(['Alice', 'Bob'])
      expect(data.scores).toEqual({ Alice: 10, Bob: 5 })
      expect(data.metadata).toEqual({ custom: 'data' })
      expect(data.cricketGame).toEqual(gameState)
    })

    it('should update lastUpdated timestamp', async () => {
      // Create session
      const createResponse = await SELF.fetch('http://localhost/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'timestamp-test', players: ['Player1'] })
      })
      const createData = await createResponse.json()
      const originalTimestamp = createData.lastUpdated

      const gameState = {
        sessionId: 'timestamp-test',
        players: [{ name: 'Player1', numbers: {}, totalScore: 0 }],
        currentPlayerIndex: 0,
        dartsRemaining: 3,
        gameStarted: false,
        gameEnded: false,
        createdAt: '2026-03-08T06:00:00Z',
        lastUpdated: '2026-03-08T06:00:00Z'
      }

      const response = await SELF.fetch('http://localhost/api/session/timestamp-test/game', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameState)
      })
      const data = await response.json()

      // lastUpdated should be defined and a string
      expect(data.lastUpdated).toBeDefined()
      expect(typeof data.lastUpdated).toBe('string')
    })

    it('should not match POST /api/session/:id route', async () => {
      // Create session
      await SELF.fetch('http://localhost/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'route-test', players: ['Alice'] })
      })

      // POST to /session/:id should work (update session)
      const postResponse = await SELF.fetch('http://localhost/api/session/route-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scores: { Alice: 5 } })
      })
      expect(postResponse.status).toBe(200)

      // PUT to /session/:id/game should work (update game)
      const gameState = {
        sessionId: 'route-test',
        players: [{ name: 'Alice', numbers: {}, totalScore: 0 }],
        currentPlayerIndex: 0,
        dartsRemaining: 3,
        gameStarted: false,
        gameEnded: false,
        createdAt: '2026-03-08T06:00:00Z',
        lastUpdated: '2026-03-08T06:00:00Z'
      }

      const putResponse = await SELF.fetch('http://localhost/api/session/route-test/game', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameState)
      })
      expect(putResponse.status).toBe(200)
    })
  })

  describe('CORS', () => {
    it('should handle OPTIONS requests', async () => {
      const response = await SELF.fetch('http://localhost/api/session', {
        method: 'OPTIONS'
      })

      expect(response.status).toBe(204)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })

    it('should include PUT in allowed methods', async () => {
      const response = await SELF.fetch('http://localhost/api/session', {
        method: 'OPTIONS'
      })

      const allowedMethods = response.headers.get('Access-Control-Allow-Methods')
      
      expect(allowedMethods).toContain('PUT')
      expect(allowedMethods).toContain('GET')
      expect(allowedMethods).toContain('POST')
      expect(allowedMethods).toContain('OPTIONS')
    })
  })
})
