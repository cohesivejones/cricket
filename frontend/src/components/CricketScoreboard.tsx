import type { CricketGameState, CricketNumber } from '../types'
import { getDisplaySymbol } from '../utils/cricketGame'

interface CricketScoreboardProps {
  game: CricketGameState
}

const CRICKET_NUMBERS: CricketNumber[] = [15, 16, 17, 18, 19, 20, 25]

export default function CricketScoreboard({ game }: CricketScoreboardProps) {
  return (
    <div style={{ width: '100%' }}>
      {/* Winner Banner */}
      {game.gameEnded && game.winner && (
        <div style={{
          backgroundColor: '#28a745',
          color: 'white',
          padding: '1rem',
          marginBottom: '1rem',
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: '1.5rem',
          fontWeight: 'bold'
        }}>
          🎯 Winner: {game.winner}! 🎯
        </div>
      )}

      {/* Scoreboard Table */}
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '2px solid #dee2e6'
      }}>
        <thead>
          <tr>
            <th style={{
              padding: '1rem',
              textAlign: 'center',
              backgroundColor: '#343a40',
              color: 'white',
              fontWeight: 'bold',
              borderRight: '2px solid #495057'
            }}>
              Number
            </th>
            {game.players.map((player, index) => (
              <th key={player.name} style={{
                padding: '1rem',
                textAlign: 'center',
                backgroundColor: index === game.currentPlayerIndex 
                  ? '#ffc107' 
                  : '#6c757d',
                color: index === game.currentPlayerIndex ? '#000' : 'white',
                fontWeight: 'bold',
                borderRight: index < game.players.length - 1 ? '1px solid #dee2e6' : 'none'
              }}>
                {player.name}
                {index === game.currentPlayerIndex && !game.gameEnded && (
                  <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    ({game.dartsRemaining} 🎯)
                  </div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CRICKET_NUMBERS.map(number => (
            <tr key={number} style={{ borderBottom: '1px solid #dee2e6' }}>
              <td style={{
                padding: '0.75rem 1rem',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                backgroundColor: '#f8f9fa',
                borderRight: '2px solid #dee2e6'
              }}>
                {number === 25 ? 'Bull' : number}
              </td>
              {game.players.map((player, index) => (
                <td key={`${number}-${player.name}`} style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'center',
                  fontSize: '1.2rem',
                  fontWeight: '500',
                  fontFamily: 'monospace',
                  backgroundColor: index === game.currentPlayerIndex 
                    ? '#fff3cd' 
                    : 'white',
                  borderRight: index < game.players.length - 1 ? '1px solid #dee2e6' : 'none'
                }}>
                  {getDisplaySymbol(player.numbers[number])}
                </td>
              ))}
            </tr>
          ))}
          {/* Total Score Row */}
          <tr style={{ 
            backgroundColor: '#f8f9fa',
            borderTop: '3px solid #343a40',
            fontWeight: 'bold'
          }}>
            <td style={{
              padding: '1rem',
              textAlign: 'center',
              fontSize: '1.1rem',
              borderRight: '2px solid #dee2e6'
            }}>
              TOTAL
            </td>
            {game.players.map((player, index) => (
              <td key={`score-${player.name}`} style={{
                padding: '1rem',
                textAlign: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#28a745',
                backgroundColor: index === game.currentPlayerIndex 
                  ? '#fff3cd' 
                  : 'white',
                borderRight: index < game.players.length - 1 ? '1px solid #dee2e6' : 'none'
              }}>
                Score: {player.totalScore}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      {/* Legend */}
      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <strong>Legend:</strong>{' '}
        <span style={{ margin: '0 0.5rem' }}>
          <code>-</code> = No hits
        </span>
        <span style={{ margin: '0 0.5rem' }}>
          <code>/</code> = 1 hit
        </span>
        <span style={{ margin: '0 0.5rem' }}>
          <code>X</code> = 2 hits or Locked
        </span>
        <span style={{ margin: '0 0.5rem' }}>
          <code>O</code> = Open (3 hits)
        </span>
        <span style={{ margin: '0 0.5rem' }}>
          <code>Number</code> = Points scored
        </span>
      </div>
    </div>
  )
}
