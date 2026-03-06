import { useState, FormEvent, ChangeEvent } from 'react'
import { useLocation } from 'wouter'
import { generateSessionId, createSession } from '../utils/api'

export default function Landing() {
  const [, setLocation] = useLocation()
  const [playerName, setPlayerName] = useState('')
  const [players, setPlayers] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)

  const handleAddPlayer = (e: FormEvent) => {
    e.preventDefault()
    const trimmedName = playerName.trim()
    
    if (!trimmedName) return
    
    // Don't add duplicate players
    if (players.includes(trimmedName)) {
      setPlayerName('')
      return
    }
    
    setPlayers([...players, trimmedName])
    setPlayerName('')
  }

  const handleRemovePlayer = (nameToRemove: string) => {
    setPlayers(players.filter(name => name !== nameToRemove))
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPlayerName(e.target.value)
  }

  const handleCreateGame = async () => {
    if (players.length < 2) return
    
    setIsCreating(true)
    try {
      const sessionId = generateSessionId()
      await createSession(sessionId, players)
      setLocation(`/session/${sessionId}`)
    } catch (error) {
      console.error('Failed to create game:', error)
      setIsCreating(false)
    }
  }

  const playerCountText = players.length === 1 ? '1 player' : `${players.length} players`

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem'
    }}>
      <h1>Cricket Scoreboard</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Add at least 2 players to start a new game
      </p>

      {/* Add Player Form */}
      <form onSubmit={handleAddPlayer} style={{ marginBottom: '2rem', width: '100%', maxWidth: '400px' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={playerName}
            onChange={handleInputChange}
            placeholder="Enter player name"
            disabled={isCreating}
            style={{
              flex: 1,
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
          <button
            type="submit"
            disabled={isCreating || !playerName.trim()}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isCreating || !playerName.trim() ? 'not-allowed' : 'pointer',
              opacity: isCreating || !playerName.trim() ? 0.6 : 1,
              fontWeight: 'bold'
            }}
          >
            Add Player
          </button>
        </div>
      </form>

      {/* Players List */}
      {players.length > 0 && (
        <div style={{ width: '100%', maxWidth: '400px', marginBottom: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h3 style={{ margin: 0 }}>Players ({playerCountText})</h3>
          </div>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            margin: 0,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            {players.map((player, index) => (
              <li 
                key={player}
                style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  borderBottom: index < players.length - 1 ? '1px solid #eee' : 'none'
                }}
              >
                <span style={{ fontWeight: '500' }}>{player}</span>
                <button
                  onClick={() => handleRemovePlayer(player)}
                  disabled={isCreating}
                  aria-label={`Remove ${player}`}
                  style={{
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.875rem',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isCreating ? 'not-allowed' : 'pointer',
                    opacity: isCreating ? 0.6 : 1
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {players.length === 0 && (
        <p style={{ color: '#999', marginBottom: '2rem' }}>{playerCountText}</p>
      )}

      {/* Create Game Button */}
      <button
        onClick={handleCreateGame}
        disabled={players.length < 2 || isCreating}
        style={{
          padding: '1rem 2rem',
          fontSize: '1.2rem',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: players.length < 2 || isCreating ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          opacity: players.length < 2 || isCreating ? 0.6 : 1
        }}
      >
        {isCreating ? 'Creating Game...' : 'Create Game'}
      </button>

      {players.length === 1 && (
        <p style={{ color: '#dc3545', marginTop: '1rem', fontSize: '0.9rem' }}>
          Add at least one more player to start
        </p>
      )}
    </div>
  )
}
