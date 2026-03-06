export interface Session {
  sessionId: string
  players: string[]
  scores: Record<string, number>
  metadata: Record<string, unknown>
  createdAt: string
  lastUpdated: string
}

export interface SessionCreateRequest {
  sessionId: string
}

export interface SessionUpdateRequest {
  players?: string[]
  scores?: Record<string, number>
  metadata?: Record<string, unknown>
}
