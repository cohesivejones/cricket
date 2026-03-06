import { useState, useEffect, useRef } from 'react'
import { getSession } from '../utils/api'
import type { Session } from '../types'

const POLL_INTERVAL = 3000 // 3 seconds

interface UseSessionReturn {
  session: Session | null
  loading: boolean
  error: string | null
}

export function useSession(sessionId: string): UseSessionReturn {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!sessionId) return

    const fetchSession = async () => {
      try {
        const data = await getSession(sessionId)
        if (data) {
          setSession(data)
          setError(null)
        } else {
          setError('Session not found')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchSession()

    // Set up polling
    intervalRef.current = setInterval(fetchSession, POLL_INTERVAL)

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [sessionId])

  return { session, loading, error }
}
