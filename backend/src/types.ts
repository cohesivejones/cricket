/**
 * Backend type definitions
 */

export interface Session {
  sessionId: string
  players: string[]
  scores: Record<string, number>
  metadata: Record<string, unknown>
  cricketGame?: CricketGameState  // Add game state to session
  createdAt: string
  lastUpdated: string
}

export interface Env {
  SESSIONS: KVNamespace
}

export interface SessionUpdateRequest {
  players?: string[]
  scores?: Record<string, number>
  metadata?: Record<string, unknown>
}

// Cricket Game Types
export type CricketNumber = 15 | 16 | 17 | 18 | 19 | 20 | 25 // 25 = Bulls

export interface CricketNumberState {
  hits: number          // 0-3 (hit count before/after opening)
  score: number         // accumulated points after opening
  isOpen: boolean       // true when hits >= 3
  isLocked: boolean     // true when opponent closed it
}

export interface CricketPlayerState {
  name: string
  numbers: Record<CricketNumber, CricketNumberState>
  totalScore: number
}

export type HitType = 'single' | 'double' | 'triple' | 'outer-bull' | 'inner-bull' | 'miss'

export interface DartThrow {
  number?: CricketNumber  // undefined for miss
  hitType: HitType
  hitsValue: number       // 0 for miss, 1 for single/outer, 2 for double/inner, 3 for triple
}

export interface CricketGameState {
  sessionId: string
  players: CricketPlayerState[]
  currentPlayerIndex: number
  dartsRemaining: number  // 0-3
  gameStarted: boolean
  gameEnded: boolean
  winner?: string
  createdAt: string
  lastUpdated: string
}
