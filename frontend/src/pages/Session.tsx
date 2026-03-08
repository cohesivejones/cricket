import { useState, useEffect } from 'react'
import { useParams } from 'wouter'
import { useSession } from '../hooks/useSession'
import CricketScoreboard from '../components/CricketScoreboard'
import DartInput from '../components/DartInput'
import { initializeCricketGame, processDartThrow } from '../utils/cricketGame'
import { updateGameState } from '../utils/api'
import type { CricketGameState, DartThrow } from '../types'
import styles from './Session.module.css'

export default function Session() {
  const { id } = useParams<{ id: string }>()
  const { session, loading, error } = useSession(id || '')
  const [cricketGame, setCricketGame] = useState<CricketGameState | null>(null)

  // Initialize or sync game when session loads/updates
  useEffect(() => {
    if (!session || session.players.length === 0) return

    // Always use game state from session if it exists (real-time sync)
    if (session.cricketGame) {
      setCricketGame(session.cricketGame)
    } else if (!cricketGame) {
      // Only initialize a new game if we don't have one locally
      const game = initializeCricketGame(session.sessionId, session.players)
      setCricketGame(game)
      // Save to backend
      updateGameState(session.sessionId, game).catch(console.error)
    }
  }, [session, session?.cricketGame])

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div>Loading session...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error</h2>
        <p>{error}</p>
        <a href="/">Go back to home</a>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const handleDartThrow = async (dart: DartThrow) => {
    if (!cricketGame || !session) return
    const newGame = processDartThrow(cricketGame, dart)
    setCricketGame(newGame)
    // Sync to backend
    await updateGameState(session.sessionId, newGame).catch(console.error)
  }

  const handleNewGame = async () => {
    if (!session) return
    const game = initializeCricketGame(session.sessionId, session.players)
    setCricketGame(game)
    // Sync to backend
    await updateGameState(session.sessionId, game).catch(console.error)
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1>🎯 Cricket Darts</h1>
        <div className={styles.sessionInfo}>
          <span className={styles.sessionIdLabel}>Session ID:</span>
          <code className={styles.sessionIdCode}>
            {session.sessionId}
          </code>
          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className={styles.copyLinkBtn}
          >
            📋 Copy Link
          </button>
        </div>
      </div>

      {/* Game Board */}
      {cricketGame && (
        <div>
          {/* New Game Button */}
          <div className={styles.newGameContainer}>
            <button
              onClick={handleNewGame}
              className={styles.newGameBtn}
            >
              🔄 New Game
            </button>
          </div>

          {/* Game Board */}
          <div className={styles.gameLayout}>
            {/* Scoreboard */}
            <div className={styles.scoreboardSection}>
              <CricketScoreboard game={cricketGame} />
            </div>

            {/* Dart Input */}
            <div className={styles.inputSection}>
              <DartInput 
                onDartThrow={handleDartThrow} 
                disabled={cricketGame.gameEnded}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
