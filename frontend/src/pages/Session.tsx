import { useParams } from 'wouter'
import { useSession } from '../hooks/useSession'
import Scoreboard from '../components/Scoreboard'

export default function Session() {
  const { id } = useParams<{ id: string }>()
  const { session, loading, error } = useSession(id || '')

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

  return (
    <div style={{
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1>Cricket Scoreboard</h1>
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
            Copy Link
          </button>
        </div>
      </div>
      
      <Scoreboard session={session} />
    </div>
  )
}
