import { createServer, IncomingMessage, ServerResponse } from 'http'
import { Server } from 'socket.io'

const PORT = 3006
const BRIDGE_PORT = 3096
const SERVICE_NAME = 'whatsapp-realtime'

// --- HTTP Bridge Server (separate port to avoid Socket.IO path conflicts) ---
const bridgeServer = createServer((req: IncomingMessage, res: ServerResponse) => {
  if (req.method === 'POST' && req.url === '/api/events') {
    let body = ''

    req.on('data', (chunk: Buffer) => {
      body += chunk.toString()
    })

    req.on('end', () => {
      try {
        const parsed = JSON.parse(body)

        const { room, event, data } = parsed

        // Validate required fields
        if (!room || typeof room !== 'string') {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Missing or invalid "room" field' }))
          return
        }

        if (!event || typeof event !== 'string') {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Missing or invalid "event" field' }))
          return
        }

        // Validate room name — only allow alphanumeric, hyphens, and colons
        if (!/^[a-zA-Z0-9\-:]+$/.test(room)) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Invalid room name format' }))
          return
        }

        // Emit the event to the specified room
        if (data !== undefined) {
          io.to(room).emit(event, data)
        } else {
          io.to(room).emit(event)
        }

        console.log(`[${SERVICE_NAME}] HTTP Bridge: emitted "${event}" to room "${room}"`)

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ success: true, room, event }))
      } catch (err: any) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Invalid JSON body', detail: err.message }))
      }
    })

    req.on('error', (err) => {
      console.error(`[${SERVICE_NAME}] HTTP Bridge request error:`, err.message)
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Request error' }))
      }
    })

    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not found', service: SERVICE_NAME }))
})

bridgeServer.listen(BRIDGE_PORT, () => {
  console.log(`[${SERVICE_NAME}] HTTP Bridge server running on port ${BRIDGE_PORT}`)
})

// --- Socket.IO Server (main port for WebSocket connections) ---
const httpServer = createServer()

const io = new Server(httpServer, {
  // DO NOT change the path, it is used by Caddy to forward the request to the correct port
  path: '/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingInterval: 25000,
  pingTimeout: 5000,
})

// --- Room constants ---
// - whatsapp (global — all connected WhatsApp agents)
// - conversation-{id} (per-conversation updates)
// - agent-{userId} (per-agent notifications)
// - contact-{contactId} (per-contact updates)

io.on('connection', (socket) => {
  console.log(`[${SERVICE_NAME}] Client connected: ${socket.id}`)

  // Track which rooms this socket has joined for cleanup
  const joinedRooms = new Set<string>()

  // --- join-room: join a specific room ---
  socket.on('join-room', (room: string) => {
    if (!room || typeof room !== 'string') {
      console.warn(`[${SERVICE_NAME}] join-room: invalid room from socket ${socket.id}`)
      return
    }

    socket.join(room)
    joinedRooms.add(room)
    console.log(`[${SERVICE_NAME}] Socket ${socket.id} joined room: ${room}`)
  })

  // --- leave-room: leave a specific room ---
  socket.on('leave-room', (room: string) => {
    if (!room || typeof room !== 'string') {
      console.warn(`[${SERVICE_NAME}] leave-room: invalid room from socket ${socket.id}`)
      return
    }

    socket.leave(room)
    joinedRooms.delete(room)
    console.log(`[${SERVICE_NAME}] Socket ${socket.id} left room: ${room}`)
  })

  // --- subscribe-agent: join agent room + global whatsapp room ---
  socket.on('subscribe-agent', (userId: string) => {
    if (!userId || typeof userId !== 'string') {
      console.warn(`[${SERVICE_NAME}] subscribe-agent: invalid userId from socket ${socket.id}`)
      return
    }

    const agentRoom = `agent-${userId}`
    socket.join(agentRoom)
    socket.join('whatsapp')
    joinedRooms.add(agentRoom)
    joinedRooms.add('whatsapp')
    console.log(`[${SERVICE_NAME}] Socket ${socket.id} subscribed as agent ${userId} (rooms: ${agentRoom}, whatsapp)`)
  })

  // --- unsubscribe-agent: leave agent room + global whatsapp room ---
  socket.on('unsubscribe-agent', (userId: string) => {
    if (!userId || typeof userId !== 'string') {
      console.warn(`[${SERVICE_NAME}] unsubscribe-agent: invalid userId from socket ${socket.id}`)
      return
    }

    const agentRoom = `agent-${userId}`
    socket.leave(agentRoom)
    socket.leave('whatsapp')
    joinedRooms.delete(agentRoom)
    joinedRooms.delete('whatsapp')
    console.log(`[${SERVICE_NAME}] Socket ${socket.id} unsubscribed agent ${userId} (left rooms: ${agentRoom}, whatsapp)`)
  })

  // --- typing: relay typing indicator to conversation room ---
  socket.on('typing', (payload: { conversationId?: string; userId?: string }) => {
    if (!payload || !payload.conversationId || !payload.userId) {
      console.warn(`[${SERVICE_NAME}] typing: invalid payload from socket ${socket.id}`, payload)
      return
    }

    const { conversationId, userId } = payload
    const room = `conversation-${conversationId}`

    socket.to(room).emit('typing', { conversationId, userId })
    console.log(`[${SERVICE_NAME}] Typing indicator from ${userId} in conversation ${conversationId}`)
  })

  socket.on('disconnect', (reason) => {
    console.log(`[${SERVICE_NAME}] Client disconnected: ${socket.id}, reason: ${reason}`)
  })
})

// --- Broadcast heartbeat every 60 seconds ---
setInterval(() => {
  const now = new Date().toISOString()
  io.to('whatsapp').emit('service:heartbeat', {
    service: SERVICE_NAME,
    timestamp: now,
    uptime: process.uptime(),
  })
  console.log(`[${SERVICE_NAME}] Heartbeat sent at ${now}`)
}, 60_000)

httpServer.listen(PORT, () => {
  console.log(`[${SERVICE_NAME}] Socket.IO server running on port ${PORT}`)
})

// --- Graceful shutdown ---
function gracefulShutdown() {
  console.log(`[${SERVICE_NAME}] Shutting down...`)
  httpServer.close(() => {
    bridgeServer.close(() => {
      console.log(`[${SERVICE_NAME}] All servers closed`)
      process.exit(0)
    })
  })
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)