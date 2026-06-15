import { createServer } from 'http'
import { Server } from 'socket.io'

const PORT = 3005

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

// Available rooms
// - maintenance (global maintenance channel)
// - ticket-{ticketId} (per-ticket updates)
// - technician-{techId} (per-technician updates)
// - client-{clientId} (per-client/customer updates)

io.on('connection', (socket) => {
  console.log(`[maintenance-notify] Client connected: ${socket.id}`)

  // Allow clients to join rooms
  socket.on('join-room', (room: string) => {
    socket.join(room)
    console.log(`[maintenance-notify] Socket ${socket.id} joined room: ${room}`)
  })

  // Allow clients to leave rooms
  socket.on('leave-room', (room: string) => {
    socket.leave(room)
    console.log(`[maintenance-notify] Socket ${socket.id} left room: ${room}`)
  })

  socket.on('disconnect', (reason) => {
    console.log(`[maintenance-notify] Client disconnected: ${socket.id}, reason: ${reason}`)
  })
})

// Broadcast heartbeat every 60 seconds to show service is alive
setInterval(() => {
  const now = new Date().toISOString()
  io.to('maintenance').emit('service:heartbeat', {
    service: 'maintenance-notify',
    timestamp: now,
    uptime: process.uptime(),
  })
  console.log(`[maintenance-notify] Heartbeat sent at ${now}`)
}, 60_000)

// --- Emission helpers (exported for potential HTTP bridge usage) ---

function emitTicketCreated(data: any) {
  io.to('maintenance').emit('ticket:created', data)
  if (data.ticketId) io.to(`ticket-${data.ticketId}`).emit('ticket:created', data)
  if (data.clientId) io.to(`client-${data.clientId}`).emit('ticket:created', data)
}

function emitTicketAssigned(data: any) {
  io.to('maintenance').emit('ticket:assigned', data)
  if (data.ticketId) io.to(`ticket-${data.ticketId}`).emit('ticket:assigned', data)
  if (data.technicianId) io.to(`technician-${data.technicianId}`).emit('ticket:assigned', data)
  if (data.clientId) io.to(`client-${data.clientId}`).emit('ticket:assigned', data)
}

function emitTicketStatusChanged(data: any) {
  io.to('maintenance').emit('ticket:status-changed', data)
  if (data.ticketId) io.to(`ticket-${data.ticketId}`).emit('ticket:status-changed', data)
  if (data.technicianId) io.to(`technician-${data.technicianId}`).emit('ticket:status-changed', data)
  if (data.clientId) io.to(`client-${data.clientId}`).emit('ticket:status-changed', data)
}

function emitTicketNoteAdded(data: any) {
  io.to('maintenance').emit('ticket:note-added', data)
  if (data.ticketId) io.to(`ticket-${data.ticketId}`).emit('ticket:note-added', data)
}

function emitMaterialRequestCreated(data: any) {
  io.to('maintenance').emit('material:request-created', data)
  if (data.ticketId) io.to(`ticket-${data.ticketId}`).emit('material:request-created', data)
}

function emitMaterialStatusChanged(data: any) {
  io.to('maintenance').emit('material:status-changed', data)
  if (data.ticketId) io.to(`ticket-${data.ticketId}`).emit('material:status-changed', data)
  if (data.technicianId) io.to(`technician-${data.technicianId}`).emit('material:status-changed', data)
}

function emitSlaBreachWarning(data: any) {
  io.to('maintenance').emit('sla:breach-warning', data)
  if (data.ticketId) io.to(`ticket-${data.ticketId}`).emit('sla:breach-warning', data)
  if (data.technicianId) io.to(`technician-${data.technicianId}`).emit('sla:breach-warning', data)
}

function emitEmergencyAlert(data: any) {
  io.to('maintenance').emit('emergency:alert', data)
  if (data.ticketId) io.to(`ticket-${data.ticketId}`).emit('emergency:alert', data)
  if (data.technicianId) io.to(`technician-${data.technicianId}`).emit('emergency:alert', data)
}

httpServer.listen(PORT, () => {
  console.log(`[maintenance-notify] Socket.IO server running on port ${PORT}`)
})

// ========================
// HTTP Bridge Server (port 3095)
// ========================

const BRIDGE_PORT = 3095

const bridgeServer = createServer((req, res) => {
  // Only handle POST requests
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ success: false, error: 'Method not allowed' }))
    return
  }

  const url = new URL(req.url || '/', `http://localhost:${BRIDGE_PORT}`)
  const pathname = url.pathname

  // Collect request body
  const chunks: Buffer[] = []
  req.on('data', (chunk: Buffer) => chunks.push(chunk))
  req.on('end', () => {
    let body: any
    try {
      body = JSON.parse(Buffer.concat(chunks).toString())
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ success: false, error: 'Invalid JSON body' }))
      return
    }

    // Helper to send JSON response
    const sendJSON = (status: number, data: any) => {
      res.writeHead(status, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(data))
    }

    // Route: POST /api/events
    if (pathname === '/api/events') {
      if (!body.event || typeof body.event !== 'string') {
        sendJSON(400, { success: false, error: 'event is required and must be a string' })
        return
      }

      const rooms: string[] = body.room
        ? Array.isArray(body.room)
          ? body.room
          : [body.room]
        : ['maintenance']

      console.log(`[maintenance-notify:bridge] POST /api/events -> rooms: [${rooms.join(', ')}], event: ${body.event}`)

      for (const room of rooms) {
        io.to(room).emit(body.event, body.data)
      }

      sendJSON(200, { success: true, room: rooms, event: body.event })
      return
    }

    // Route: POST /api/emit/broadcast
    const broadcastMatch = pathname.match(/^\/api\/emit\/broadcast$/)
    if (broadcastMatch) {
      if (!body.event || typeof body.event !== 'string') {
        sendJSON(400, { success: false, error: 'event is required and must be a string' })
        return
      }

      const rooms = ['maintenance']
      console.log(`[maintenance-notify:bridge] POST /api/emit/broadcast -> event: ${body.event}`)

      for (const room of rooms) {
        io.to(room).emit(body.event, body.data)
      }

      sendJSON(200, { success: true, room: rooms, event: body.event })
      return
    }

    // Route: POST /api/emit/ticket/:ticketId
    const ticketMatch = pathname.match(/^\/api\/emit\/ticket\/([^/]+)$/)
    if (ticketMatch) {
      if (!body.event || typeof body.event !== 'string') {
        sendJSON(400, { success: false, error: 'event is required and must be a string' })
        return
      }

      const ticketId = ticketMatch[1]
      const rooms = [`ticket-${ticketId}`, 'maintenance']
      console.log(`[maintenance-notify:bridge] POST /api/emit/ticket/${ticketId} -> rooms: [${rooms.join(', ')}], event: ${body.event}`)

      for (const room of rooms) {
        io.to(room).emit(body.event, body.data)
      }

      sendJSON(200, { success: true, room: rooms, event: body.event })
      return
    }

    // Route: POST /api/emit/technician/:techId
    const techMatch = pathname.match(/^\/api\/emit\/technician\/([^/]+)$/)
    if (techMatch) {
      if (!body.event || typeof body.event !== 'string') {
        sendJSON(400, { success: false, error: 'event is required and must be a string' })
        return
      }

      const techId = techMatch[1]
      const rooms = [`technician-${techId}`, 'maintenance']
      console.log(`[maintenance-notify:bridge] POST /api/emit/technician/${techId} -> rooms: [${rooms.join(', ')}], event: ${body.event}`)

      for (const room of rooms) {
        io.to(room).emit(body.event, body.data)
      }

      sendJSON(200, { success: true, room: rooms, event: body.event })
      return
    }

    // No route matched
    sendJSON(404, { success: false, error: 'Not found' })
  })
})

bridgeServer.listen(BRIDGE_PORT, () => {
  console.log(`[maintenance-notify] HTTP bridge server running on port ${BRIDGE_PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[maintenance-notify] Received SIGTERM, shutting down...')
 bridgeServer.close(() => {
    httpServer.close(() => {
      console.log('[maintenance-notify] Servers closed')
      process.exit(0)
    })
  })
})

process.on('SIGINT', () => {
  console.log('[maintenance-notify] Received SIGINT, shutting down...')
  bridgeServer.close(() => {
    httpServer.close(() => {
      console.log('[maintenance-notify] Servers closed')
      process.exit(0)
    })
  })
})

export {
  io,
  emitTicketCreated,
  emitTicketAssigned,
  emitTicketStatusChanged,
  emitTicketNoteAdded,
  emitMaterialRequestCreated,
  emitMaterialStatusChanged,
  emitSlaBreachWarning,
  emitEmergencyAlert,
}