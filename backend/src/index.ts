/**
 * Cloudflare Worker - API endpoints for scoreboard sessions
 */

import { createSession, getSession, updateSession } from './sessionManager'
import type { Env } from './types'

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      })
    }

    const url = new URL(request.url)
    const path = url.pathname

    try {
      // POST /api/session - Create new session
      if (path === '/api/session' && request.method === 'POST') {
        const body = await request.json() as { sessionId?: string; players?: string[] }
        
        if (!body.sessionId) {
          return jsonResponse({ error: 'sessionId is required' }, 400, corsHeaders)
        }

        const session = await createSession(env.SESSIONS, body.sessionId, body.players)
        return jsonResponse(session, 201, corsHeaders)
      }

      // GET /api/session/:id - Get session
      if (path.startsWith('/api/session/') && request.method === 'GET') {
        const sessionId = path.split('/')[3]
        const session = await getSession(env.SESSIONS, sessionId)

        if (!session) {
          return jsonResponse({ error: 'Session not found' }, 404, corsHeaders)
        }

        return jsonResponse(session, 200, corsHeaders)
      }

      // POST /api/session/:id - Update session
      if (path.startsWith('/api/session/') && !path.includes('/game') && request.method === 'POST') {
        const sessionId = path.split('/')[3]
        const body = await request.json()

        const session = await updateSession(env.SESSIONS, sessionId, body)

        if (!session) {
          return jsonResponse({ error: 'Session not found' }, 404, corsHeaders)
        }

        return jsonResponse(session, 200, corsHeaders)
      }

      // PUT /api/session/:id/game - Update game state
      if (path.match(/^\/api\/session\/[^/]+\/game$/) && request.method === 'PUT') {
        const sessionId = path.split('/')[3]
        const gameState = await request.json()

        // Get existing session
        const existingSession = await getSession(env.SESSIONS, sessionId)
        if (!existingSession) {
          return jsonResponse({ error: 'Session not found' }, 404, corsHeaders)
        }

        // Update session with game state
        const updatedSession = {
          ...existingSession,
          cricketGame: gameState,
          lastUpdated: new Date().toISOString()
        }

        // Save to KV with correct key prefix
        await env.SESSIONS.put(`session:${sessionId}`, JSON.stringify(updatedSession))

        return jsonResponse(updatedSession, 200, corsHeaders)
      }

      // 404 for unknown routes
      return jsonResponse({ error: 'Not found' }, 404, corsHeaders)

    } catch (error) {
      console.error('Error:', error)
      return jsonResponse({ error: 'Internal server error' }, 500, corsHeaders)
    }
  }
}

function jsonResponse(data: unknown, status = 200, additionalHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...additionalHeaders
    }
  })
}
