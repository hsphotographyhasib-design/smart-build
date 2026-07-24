'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/store'

export interface NotificationItem {
  id: string
  type: string
  title: string
  message: string
  link?: string | null
  category?: string | null
  priority?: string
  module?: string | null
  isRead: boolean
  readAt?: string | null
  clickedAt?: string | null
  createdAt: string
}

export interface UseNotificationsOptions {
  limit?: number
  unreadOnly?: boolean
  module?: string
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const queryClient = useQueryClient()
  const sseRef = useRef<EventSource | null>(null)

  const limit = options.limit || 20
  const unreadOnly = options.unreadOnly || false
  const moduleFilter = options.module || ''

  // 1. Fetch notifications from DB API
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [...queryKeys.notifications, { limit, unreadOnly, module: moduleFilter }],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('limit', limit.toString())
      if (unreadOnly) params.set('unread', 'true')
      if (moduleFilter) params.set('module', moduleFilter)

      const res = await fetch(`/api/v1/notifications?${params.toString()}`)
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to fetch notifications')
      }
      return json.data as {
        notifications: NotificationItem[]
        pagination: { total: number; page: number; limit: number; totalPages: number }
        unreadCount: number
      }
    },
    staleTime: 5000,
    refetchOnWindowFocus: true,
  })

  // 2. Real-time SSE listener setup
  useEffect(() => {
    let es: EventSource | null = null

    const connect = () => {
      try {
        es = new EventSource('/api/sse')
        sseRef.current = es

        es.onmessage = (e) => {
          try {
            const event = JSON.parse(e.data)
            const eventType = event.type

            if (
              eventType === 'notification' ||
              eventType === 'notification_read' ||
              eventType === 'notification_unread' ||
              eventType === 'notification_read_all' ||
              eventType === 'notification_deleted'
            ) {
              // Immediately invalidate React Query cache to re-sync with DB
              queryClient.invalidateQueries({ queryKey: queryKeys.notifications })
            }
          } catch {
            /* ignore malformed payload */
          }
        }

        es.onerror = () => {
          es?.close()
          setTimeout(connect, 10000)
        }
      } catch (err) {
        console.error('[useNotifications] SSE Connection error:', err)
      }
    }

    connect()

    return () => {
      es?.close()
    }
  }, [queryClient])

  // 3. Mark Single as Read Mutation
  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to mark notification as read')
      }
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications })
    },
  })

  // 4. Mark Single as Unread Mutation
  const markUnreadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/notifications/${id}/unread`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to mark notification as unread')
      }
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications })
    },
  })

  // 5. Mark All as Read Mutation
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/v1/notifications/read-all', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to mark all as read')
      }
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications })
    },
  })

  // 6. Delete Notification Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/notifications/${id}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete notification')
      }
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications })
    },
  })

  const markRead = useCallback((id: string) => markReadMutation.mutateAsync(id), [markReadMutation])
  const markUnread = useCallback((id: string) => markUnreadMutation.mutateAsync(id), [markUnreadMutation])
  const markAllRead = useCallback(() => markAllReadMutation.mutateAsync(), [markAllReadMutation])
  const deleteNotif = useCallback((id: string) => deleteMutation.mutateAsync(id), [deleteMutation])

  return {
    notifications: data?.notifications || [],
    unreadCount: data?.unreadCount || 0,
    pagination: data?.pagination,
    isLoading,
    isError,
    refetch,
    markRead,
    markUnread,
    markAllRead,
    deleteNotif,
    isSSEConnected: sseRef.current?.readyState === 1,
  }
}
