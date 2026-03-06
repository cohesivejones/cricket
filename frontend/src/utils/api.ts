/**
 * API utilities for communicating with backend
 */

import type { Session, SessionUpdateRequest } from '../types'

const API_BASE = '/api'

export async function createSession(sessionId: string, players?: string[]): Promise<Session> {
  const response = await fetch(`${API_BASE}/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, players })
  })

  if (!response.ok) {
    throw new Error('Failed to create session')
  }

  return response.json()
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const response = await fetch(`${API_BASE}/session/${sessionId}`)

  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    throw new Error('Failed to get session')
  }

  return response.json()
}

export async function updateSession(sessionId: string, data: SessionUpdateRequest): Promise<Session> {
  const response = await fetch(`${API_BASE}/session/${sessionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    throw new Error('Failed to update session')
  }

  return response.json()
}

export function generateSessionId(): string {
  return crypto.randomUUID()
}
