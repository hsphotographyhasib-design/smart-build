'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, queryKeys } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Bell, BellOff, Trash2, CheckCheck, AlertCircle } from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  data: string | null
}

function SkeletonItem() {
  return (
    <div className="p-4 border-b last:border-0 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-20 ml-auto" />
      </div>
      <Skeleton className="h-3 w-80" />
    </div>
  )
}

export function NotificationsPage() {
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () =>
      api.get('/api/dashboard/notifications').then((r) => {
        const d = r.data as { notifications: Notification[]; unreadCount: number }
        return d
      }),
  })

  const markAllMutation = useMutation({
    mutationFn: () => api.post('/api/dashboard/notifications/mark-all-read'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications })
      toast.success('All notifications marked as read')
    },
    onError: (err: Error) => toast.error(err.message || 'Failed'),
  })

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.post('/api/dashboard/notifications', { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/api/dashboard/notifications?id=${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications })
      toast.success('Notification deleted')
    },
    onError: (err: Error) => toast.error(err.message || 'Failed'),
  })

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id)
    }
  }

  const typeIcon: Record<string, string> = {
    task: '📋',
    payment: '💰',
    invoice: '🧾',
    approval: '✅',
    reminder: '⏰',
    system: '⚙️',
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data ? `${data.unreadCount} unread notification(s)` : 'Loading...'}
          </p>
        </div>
        {data && data.unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All as Read
          </Button>
        )}
      </div>

      {isLoading ? (
        <Card className="divide-y">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonItem key={i} />)}
        </Card>
      ) : error ? (
        <Card className="border-red-200">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-red-500 mb-2" />
            <p className="text-red-600 text-sm">Failed to load notifications.</p>
          </CardContent>
        </Card>
      ) : data && data.notifications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BellOff className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg text-muted-foreground">No Notifications</h3>
            <p className="text-sm text-muted-foreground mt-1">You're all caught up!</p>
          </CardContent>
        </Card>
      ) : data ? (
        <Card className="divide-y overflow-hidden">
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
            {data.notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  'p-4 flex items-start gap-4 cursor-pointer transition-colors hover:bg-muted/50 group',
                  !notification.isRead && 'bg-amber-50/50 dark:bg-amber-950/10'
                )}
              >
                <div className="flex-shrink-0 mt-0.5 text-lg">
                  {typeIcon[notification.type] || '📌'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={cn('text-sm font-medium truncate', !notification.isRead && 'font-semibold')}>
                      {notification.title}
                    </h4>
                    {!notification.isRead && (
                      <span className="h-2 w-2 rounded-full bg-amber-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {formatDistanceToNow(parseISO(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteMutation.mutate(notification.id)
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  )
}