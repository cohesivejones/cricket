/**
 * Cricket Game Logic
 * Handles all game rules, scoring, and state management
 */

import type { 
  CricketNumber, 
  CricketNumberState, 
  CricketPlayerState, 
  CricketGameState,
  DartThrow 
} from '../types'

const CRICKET_NUMBERS: CricketNumber[] = [15, 16, 17, 18, 19, 20, 25]

function createNumberState(): CricketNumberState {
  return {
    hits: 0,
    score: 0,
    isOpen: false,
    isLocked: false
  }
}

export function createPlayerState(name: string): CricketPlayerState {
  const numbers: Record<CricketNumber, CricketNumberState> = {} as any
  
  CRICKET_NUMBERS.forEach(num => {
    numbers[num] = createNumberState()
  })
  
  return {
    name,
    numbers,
    totalScore: 0
  }
}

export function initializeCricketGame(
  sessionId: string, 
  playerNames: string[]
): CricketGameState {
  return {
    sessionId,
    players: playerNames.map(createPlayerState),
    currentPlayerIndex: 0,
    dartsRemaining: 3,
    gameStarted: true,
    gameEnded: false,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  }
}

function getPointValue(number: CricketNumber, hitType: DartThrow['hitType']): number {
  if (hitType === 'miss') return 0
  
  // Bulls special scoring
  if (number === 25) {
    if (hitType === 'outer-bull') return 25
    if (hitType === 'inner-bull') return 50
    return 0
  }
  
  // Regular numbers
  const multiplier = hitType === 'triple' ? 3 : hitType === 'double' ? 2 : 1
  return number * multiplier
}

export function processDartThrow(
  gameState: CricketGameState,
  dartThrow: DartThrow
): CricketGameState {
  if (gameState.gameEnded) return gameState
  
  const newState = JSON.parse(JSON.stringify(gameState)) as CricketGameState
  
  // Handle miss
  if (dartThrow.hitType === 'miss' || !dartThrow.number) {
    newState.dartsRemaining--
    if (newState.dartsRemaining === 0) {
      advanceTurn(newState)
    }
    newState.lastUpdated = new Date().toISOString()
    return newState
  }
  
  const number = dartThrow.number
  const hitsToAdd = dartThrow.hitsValue
  
  // Process hit for current player
  processHit(newState, newState.currentPlayerIndex, number, hitsToAdd, dartThrow.hitType)
  
  // Decrease darts remaining
  newState.dartsRemaining--
  
  // Advance turn if out of darts
  if (newState.dartsRemaining === 0) {
    advanceTurn(newState)
  }
  
  // Check for winner
  checkWinCondition(newState)
  
  newState.lastUpdated = new Date().toISOString()
  return newState
}

function processHit(
  gameState: CricketGameState,
  playerIndex: number,
  number: CricketNumber,
  hitsToAdd: number,
  hitType: DartThrow['hitType']
): void {
  const player = gameState.players[playerIndex]
  const numberState = player.numbers[number]
  
  // If locked, nothing happens
  if (numberState.isLocked) return
  
  // If already open, add to score
  if (numberState.isOpen) {
    const points = getPointValue(number, hitType)
    numberState.score += points
    player.totalScore += points
    
    // Check if any opponents can still score on this number
    checkIfShouldLock(gameState, number, playerIndex)
    return
  }
  
  // Add hits
  numberState.hits += hitsToAdd
  
  // Check if now open
  if (numberState.hits >= 3) {
    const excessHits = numberState.hits - 3
    numberState.hits = 3
    numberState.isOpen = true
    
    // Score any excess hits
    if (excessHits > 0) {
      const points = getPointValue(number,
        excessHits === 2 ? 'double' : 'single')
      numberState.score += points
      player.totalScore += points
    }
  }
}

function checkIfShouldLock(
  gameState: CricketGameState,
  number: CricketNumber,
  playerIndex: number
): void {
  // Single player: never lock (can score indefinitely)
  if (gameState.players.length < 2) {
    return
  }
  
  // Multi-player: lock only if ALL players have it open
  const allPlayersHaveOpen = gameState.players.every(p => p.numbers[number].isOpen)
  
  if (allPlayersHaveOpen) {
    gameState.players.forEach(p => {
      p.numbers[number].isLocked = true
    })
  }
}

function advanceTurn(gameState: CricketGameState): void {
  gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length
  gameState.dartsRemaining = 3
}

function checkWinCondition(gameState: CricketGameState): void {
  const playersWithAllClosed = gameState.players.filter(player => {
    return CRICKET_NUMBERS.every(num => player.numbers[num].isOpen || player.numbers[num].isLocked)
  })
  
  if (playersWithAllClosed.length > 0) {
    // Find player with highest score among those who closed all numbers
    const winner = playersWithAllClosed.reduce((best, current) => 
      current.totalScore > best.totalScore ? current : best
    )
    
    gameState.gameEnded = true
    gameState.winner = winner.name
  }
}

export function getDisplaySymbol(numberState: CricketNumberState): string {
  if (numberState.isLocked) return 'X'
  if (numberState.score > 0) return numberState.score.toString()
  if (numberState.isOpen) return 'O'
  
  switch (numberState.hits) {
    case 1: return '/'
    case 2: return 'X'
    case 3: return 'O'
    default: return '-'
  }
}
