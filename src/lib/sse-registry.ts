/**
 * SSE Connection Registry — singleton Map of userId → Set of active stream controllers.
 * Broadcast to all open tabs of a given user, or to all connected users.
 *
 * Note: Per-process singleton. On a single-server Hostinger deployment this covers all connections.
 * For multi-process, supplement with DB polling (30s fallback built into the bell component).
 */

type SSEController = ReadableStreamDefaultController<Uint8Array>

const registry = new Map<string, Set<SSEController>>()
const encoder  = new TextEncoder()

export const sseRegistry = {
  add(userId: string, ctrl: SSEController) {
    if (!registry.has(userId)) registry.set(userId, new Set())
    registry.get(userId)!.add(ctrl)
  },

  remove(userId: string, ctrl: SSEController) {
    const set = registry.get(userId)
    if (!set) return
    set.delete(ctrl)
    if (set.size === 0) registry.delete(userId)
  },

  /** Push event to every tab of one user */
  sendToUser(userId: string, event: Record<string, unknown>) {
    const payload = encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
    registry.get(userId)?.forEach(ctrl => {
      try { ctrl.enqueue(payload) } catch { /* connection closed — ignored */ }
    })
  },

  /** Push event to every connected user */
  broadcast(event: Record<string, unknown>) {
    const payload = encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
    registry.forEach(controllers =>
      controllers.forEach(ctrl => {
        try { ctrl.enqueue(payload) } catch {}
      })
    )
  },

  /** Send a named SSE event (not just data) */
  sendEvent(userId: string, eventName: string, data: Record<string, unknown>) {
    const payload = encoder.encode(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`)
    registry.get(userId)?.forEach(ctrl => {
      try { ctrl.enqueue(payload) } catch {}
    })
  },

  /** Send heartbeat comment to a specific controller (keeps connection alive through proxies) */
  heartbeat(ctrl: SSEController) {
    try { ctrl.enqueue(encoder.encode(': heartbeat\n\n')) } catch {}
  },

  connectedUsers(): number  { return registry.size },
  totalConnections(): number {
    let n = 0; registry.forEach(s => (n += s.size)); return n
  },
}
