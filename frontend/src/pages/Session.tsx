import { useState, useEffect } from 'react'
import { useParams } from 'wouter'
import { useSession } from '../hooks/useSession'
import CricketScoreboard from '../components/CricketScoreboard'
import DartInput from '../components/DartInput'
import { initializeCricketGame, processDartThrow } from '../utils/cricketGame'
import { updateGameState } from '../utils/api'
import type { CricketGameState, DartThrow } from '../types'

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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div>Loading session...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <h2 style={{ color: '#dc3545' }}>Error</h2>
        <p>{error}</p>
        <a href="/" style={{ marginTop: '1rem', color: '#007bff' }}>Go back to home</a>
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
    <div style={{
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1>🎯 Cricket Darts</h1>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          marginTop: '1rem'
        }}>
          <span style={{ color: '#666' }}>Session ID:</span>
          <code style={{ 
            padding: '0.5rem', 
            backgroundColor: '#f5f5f5', 
            borderRadius: '4px',
            fontSize: '0.9rem'
          }}>
            {session.sessionId}
          </code>
          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            📋 Copy Link
          </button>
        </div>
      </div>

      {/* Game Board */}
      {cricketGame && (
        <div>
          {/* New Game Button */}
          <div style={{ marginBottom: '1rem', textAlign: 'right' }}>
            <button
              onClick={handleNewGame}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              🔄 New Game
            </button>
          </div>

          {/* Game Board */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '2rem'
          }}>
            {/* Scoreboard */}
            <div>
              <CricketScoreboard game={cricketGame} />
            </div>

            {/* Dart Input */}
            <div>
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
