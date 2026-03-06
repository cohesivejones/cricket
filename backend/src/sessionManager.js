/**
 * Session Manager - handles CRUD operations for game sessions
 */

export async function createSession(kv, sessionId) {
  const now = new Date().toISOString()
  
  const session = {
    sessionId,
    players: [],
    scores: {},
    metadata: {},
    createdAt: now,
    lastUpdated: now
  }

  await kv.put(`session:${sessionId}`, JSON.stringify(session))
  return session
}

export async function getSession(kv, sessionId) {
  const data = await kv.get(`session:${sessionId}`)
  
  if (!data) {
    return null
  }

  return JSON.parse(data)
}

export async function updateSession(kv, sessionId, updates) {
  const existing = await getSession(kv, sessionId)
  
  if (!existing) {
    return null
  }

  const updated = {
    ...existing,
    ...updates,
    lastUpdated: new Date().toISOString()
  }

  await kv.put(`session:${sessionId}`, JSON.stringify(updated))
  return updated
}
