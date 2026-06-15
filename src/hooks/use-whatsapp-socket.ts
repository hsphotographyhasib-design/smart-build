'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAppStore } from '@/lib/store'

const SOCKET_URL = '/?XTransformPort=3006'

interface UseWhatsAppSocketOptions {
  onNewMessage?: (data: any) => void
  onConversationUpdated?: (data: any) => void
  onTyping?: (data: any) => void
  onNotification?: (data: any) => void
  onDashboardUpdated?: (data: any) => void
  enabled?: boolean
}

export function useWhatsAppSocket(options: UseWhatsAppSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { isAuthenticated, user } = useAppStore()

  useEffect(() => {
    if (options.enabled === false || !isAuthenticated) return

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setIsConnected(true)
      if (user?.id) {
        socket.emit('agent:subscribe', user.id)
      }
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('message:new', (data: any) => {
      options.onNewMessage?.(data)
    })

    socket.on('conversation:updated', (data: any) => {
      options.onConversationUpdated?.(data)
    })

    socket.on('typing', (data: any) => {
      options.onTyping?.(data)
    })

    socket.on('notification', (data: any) => {
      options.onNotification?.(data)
    })

    socket.on('dashboard:updated', (data: any) => {
      options.onDashboardUpdated?.(data)
    })

    return () => {
      if (user?.id && socketRef.current) {
        socketRef.current.emit('agent:unsubscribe', user.id)
      }
      socket.disconnect()
    }
  }, [isAuthenticated, options.enabled])

  const subscribeAgent = useCallback((userId: string) => {
    socketRef.current?.emit('agent:subscribe', userId)
  }, [])

  const unsubscribeAgent = useCallback((userId: string) => {
    socketRef.current?.emit('agent:unsubscribe', userId)
  }, [])

  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('conversation:join', conversationId)
  }, [])

  const leaveConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('conversation:leave', conversationId)
  }, [])

  const emitTyping = useCallback((conversationId: string) => {
    socketRef.current?.emit('typing', { conversationId })
  }, [])

  return {
    isConnected,
    socket: socketRef,
    subscribeAgent,
    unsubscribeAgent,
    joinConversation,
    leaveConversation,
    emitTyping,
  }
}