/**
 * Session Manager - handles CRUD operations for game sessions
 */

import type { Session } from './types'

export async function createSession(
  kv: KVNamespace,
  sessionId: string,
  players: string[] = []
): Promise<Session> {
  const now = new Date().toISOString()
  
  // Initialize scores for all players to 0
  const scores: Record<string, number> = {}
  players.forEach(player => {
    scores[player] = 0
  })
  
  const session: Session = {
    sessionId,
    players,
    scores,
    metadata: {},
    createdAt: now,
    lastUpdated: now
  }

  await kv.put(`session:${sessionId}`, JSON.stringify(session))
  return session
}

export async function getSession(
  kv: KVNamespace,
  sessionId: string
): Promise<Session | null> {
  const data = await kv.get(`session:${sessionId}`)
  
  if (!data) {
    return null
  }

  return JSON.parse(data)
}

export async function updateSession(
  kv: KVNamespace,
  sessionId: string,
  updates: Partial<Session>
): Promise<Session | null> {
  const existing = await getSession(kv, sessionId)
  
  if (!existing) {
    return null
  }

  const updated: Session = {
    ...existing,
    ...updates,
    lastUpdated: new Date().toISOString()
  }

  await kv.put(`session:${sessionId}`, JSON.stringify(updated))
  return updated
}
