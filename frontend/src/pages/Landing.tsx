import { useLocation } from 'wouter'
import { generateSessionId, createSession } from '../utils/api'

export default function Landing() {
  const [, setLocation] = useLocation()

  const handleNewGame = async () => {
    const sessionId = generateSessionId()
    await createSession(sessionId)
    setLocation(`/session/${sessionId}`)
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1>Cricket Scoreboard</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Create a new game and share the link with friends
      </p>
      <button
        onClick={handleNewGame}
        style={{
          padding: '1rem 2rem',
          fontSize: '1.2rem',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
        onMouseOver={e => e.currentTarget.style.backgroundColor = '#0056b3'}
        onMouseOut={e => e.currentTarget.style.backgroundColor = '#007bff'}
      >
        New Game
      </button>
    </div>
  )
}
