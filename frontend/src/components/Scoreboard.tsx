import { useState } from 'react'
import { updateSession } from '../utils/api'
import type { Session } from '../types'

interface ScoreboardProps {
  session: Session
}

export default function Scoreboard({ session }: ScoreboardProps) {
  const [updating, setUpdating] = useState(false)

  const handleUpdateScore = async (player: string, delta: number) => {
    setUpdating(true)
    try {
      const newScore = (session.scores[player] || 0) + delta
      const newScores = { ...session.scores, [player]: Math.max(0, newScore) }
      
      await updateSession(session.sessionId, { scores: newScores })
    } catch (error) {
      console.error('Failed to update score:', error)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div>
      <h2>Scoreboard</h2>
      
      {/* Scores Table */}
      {session.players.length === 0 ? (
        <p style={{ color: '#666' }}>No players in this game.</p>
      ) : (
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ 
                padding: '1rem', 
                textAlign: 'left',
                borderBottom: '2px solid #dee2e6'
              }}>
                Player
              </th>
              <th style={{ 
                padding: '1rem', 
                textAlign: 'center',
                borderBottom: '2px solid #dee2e6'
              }}>
                Score
              </th>
              <th style={{ 
                padding: '1rem', 
                textAlign: 'center',
                borderBottom: '2px solid #dee2e6'
              }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {session.players.map((player) => (
              <tr key={player} style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '1rem', fontWeight: '500' }}>{player}</td>
                <td style={{ 
                  padding: '1rem', 
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}>
                  {session.scores[player] || 0}
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <button
                    onClick={() => handleUpdateScore(player, 1)}
                    disabled={updating}
                    style={{
                      padding: '0.5rem 1rem',
                      margin: '0 0.25rem',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: updating ? 'not-allowed' : 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    +1
                  </button>
                  <button
                    onClick={() => handleUpdateScore(player, -1)}
                    disabled={updating}
                    style={{
                      padding: '0.5rem 1rem',
                      margin: '0 0.25rem',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: updating ? 'not-allowed' : 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    -1
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
