/**
 * SSE Stream Manager - handles Server-Sent Events streaming for real-time updates
 */

import { getSession } from './sessionManager'
import type { Session } from './types'

const DEFAULT_HEARTBEAT_INTERVAL = 1500 // 1.5 seconds
const DEFAULT_MAX_DURATION = 60000 // 60 seconds
const KEEPALIVE_INTERVAL = 15000 // 15 seconds

/**
 * Creates an SSE stream for a session that sends updates when data changes
 */
export async function createSSEStream(
  kv: KVNamespace,
  sessionId: string,
  heartbeatInterval: number = DEFAULT_HEARTBEAT_INTERVAL,
  maxDuration: number = DEFAULT_MAX_DURATION
): Promise<Response> {
  // Check if session exists first
  const initialSession = await getSession(kv, sessionId)
  if (!initialSession) {
    return createNotFoundResponse()
  }

  const encoder = new TextEncoder()
  let intervalTimer: ReturnType<typeof setInterval> | null = null

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      let lastKnownUpdate = initialSession.lastUpdated
      let lastKeepalive = Date.now()
      let isClosed = false
      const startTime = Date.now()

      // Helper to format SSE message
      const sendSSEMessage = (event: string, data: unknown) => {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
        controller.enqueue(encoder.encode(message))
      }

      // Helper to send keepalive comment
      const sendKeepalive = () => {
        const message = ': keepalive\n\n'
        controller.enqueue(encoder.encode(message))
      }

      // Send initial session state
      sendSSEMessage('update', initialSession)

      // Heartbeat loop
      intervalTimer = setInterval(async () => {
        // Check if we've exceeded max duration
        if (Date.now() - startTime > maxDuration) {
          if (intervalTimer) clearInterval(intervalTimer)
          if (!isClosed) {
            controller.close()
            isClosed = true
          }
          return
        }

        try {
          const session = await getSession(kv, sessionId)
          
          if (!session) {
            if (intervalTimer) clearInterval(intervalTimer)
            if (!isClosed) {
              controller.close()
              isClosed = true
            }
            return
          }

          // Check if data has changed
          if (session.lastUpdated !== lastKnownUpdate) {
            lastKnownUpdate = session.lastUpdated
            lastKeepalive = Date.now()
            sendSSEMessage('update', session)
          } else if (Date.now() - lastKeepalive > KEEPALIVE_INTERVAL) {
            // Send keepalive if no updates for a while
            lastKeepalive = Date.now()
            sendKeepalive()
          }
        } catch (error) {
          // Log error but don't close stream - temporary KV issues should not kill connection
          console.error('Error in heartbeat:', error)
        }
      }, heartbeatInterval)
    },
    cancel() {
      // Cleanup on cancel
      if (intervalTimer) {
        clearInterval(intervalTimer)
        intervalTimer = null
      }
    },
  })

  // Return Response with SSE headers
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

/**
 * Creates a 404 response for non-existent sessions
 */
export function createNotFoundResponse(): Response {
  return new Response(JSON.stringify({ error: 'Session not found' }), {
    status: 404,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
