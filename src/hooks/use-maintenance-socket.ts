'use client'

import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

// Connect via gateway using XTransformPort=3005
const SOCKET_URL = '/?XTransformPort=3005'

interface UseMaintenanceSocketOptions {
  onTicketCreated?: (data: any) => void
  onTicketAssigned?: (data: any) => void
  onTicketStatusChanged?: (data: any) => void
  onTicketNoteAdded?: (data: any) => void
  onMaterialRequestCreated?: (data: any) => void
  onMaterialStatusChanged?: (data: any) => void
  onSlaBreachWarning?: (data: any) => void
  onEmergencyAlert?: (data: any) => void
  onWorkOrderCreated?: (data: any) => void
  enabled?: boolean
}

export function useMaintenanceSocket(options: UseMaintenanceSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (options.enabled === false) return

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket

    // Register event handlers
    if (options.onTicketCreated) socket.on('ticket:created', options.onTicketCreated)
    if (options.onTicketAssigned) socket.on('ticket:assigned', options.onTicketAssigned)
    if (options.onTicketStatusChanged) socket.on('ticket:status-changed', options.onTicketStatusChanged)
    if (options.onTicketNoteAdded) socket.on('ticket:note-added', options.onTicketNoteAdded)
    if (options.onMaterialRequestCreated) socket.on('material:request-created', options.onMaterialRequestCreated)
    if (options.onMaterialStatusChanged) socket.on('material:status-changed', options.onMaterialStatusChanged)
    if (options.onSlaBreachWarning) socket.on('sla:breach-warning', options.onSlaBreachWarning)
    if (options.onEmergencyAlert) socket.on('emergency:alert', options.onEmergencyAlert)
    if (options.onWorkOrderCreated) socket.on('work_order:created', options.onWorkOrderCreated)

    return () => {
      socket.disconnect()
    }
  }, [options.enabled])

  const joinRoom = useCallback((room: string) => {
    socketRef.current?.emit('join-room', room)
  }, [])

  const leaveRoom = useCallback((room: string) => {
    socketRef.current?.emit('leave-room', room)
  }, [])

  return { joinRoom, leaveRoom, socket: socketRef }
}