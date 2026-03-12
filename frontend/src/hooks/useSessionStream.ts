import { useState, useEffect, useRef } from 'react'
import type { Session } from '../types'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

interface UseSessionStreamReturn {
  session: Session | null
  loading: boolean
  error: string | null
}

/**
 * Hook that uses Server-Sent Events (SSE) to receive real-time session updates
 */
export function useSessionStream(sessionId: string): UseSessionStreamReturn {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setLoading(false)
      return
    }

    // Create EventSource connection
    const url = `${API_BASE}/session/${sessionId}/stream`
    const eventSource = new EventSource(url)
    eventSourceRef.current = eventSource

    // Handle connection open
    eventSource.addEventListener('open', () => {
      console.log('SSE connection established')
      setError(null)
    })

    // Handle session updates
    eventSource.addEventListener('update', (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as Session
        setSession(data)
        setLoading(false)
        setError(null)
      } catch (err) {
        console.error('Failed to parse session update:', err)
        setError('Failed to parse session data')
        setLoading(false)
      }
    })

    // Handle errors
    eventSource.addEventListener('error', (event) => {
      console.error('SSE connection error:', event)
      setError('Connection error')
      setLoading(false)
      
      // EventSource will automatically try to reconnect
      // unless we explicitly close it
    })

    // Cleanup on unmount or sessionId change
    return () => {
      console.log('Closing SSE connection')
      eventSource.close()
      eventSourceRef.current = null
    }
  }, [sessionId])

  return { session, loading, error }
}
