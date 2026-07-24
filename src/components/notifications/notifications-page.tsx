'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Bell, BellOff, Trash2, CheckCheck, AlertCircle, Mail, MailOpen, Filter } from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { useNotifications, NotificationItem } from '@/hooks/use-notifications'
import { useAppStore } from '@/lib/store'

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
  const [filterTab, setFilterTab] = useState<'all' | 'unread'>('all')
  const navigate = useAppStore((s) => s.navigate)

  const {
    notifications,
    unreadCount,
    isLoading,
    isError,
    markRead,
    markUnread,
    markAllRead,
    deleteNotif,
  } = useNotifications({
    limit: 50,
    unreadOnly: filterTab === 'unread',
  })

  const handleNotificationClick = async (n: NotificationItem) => {
    if (!n.isRead) {
      await markRead(n.id)
    }
    if (n.link) {
      const page = n.link.replace(/^\//, '').split('/')[0]
      navigate(page as any)
    }
  }

  const handleToggleReadStatus = async (n: NotificationItem, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      if (n.isRead) {
        await markUnread(n.id)
        toast.success('Marked as unread')
      } else {
        await markRead(n.id)
        toast.success('Marked as read')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update read status')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllRead()
      toast.success('All notifications marked as read')
    } catch (err: any) {
      toast.error(err.message || 'Failed to mark all as read')
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await deleteNotif(id)
      toast.success('Notification deleted')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete notification')
    }
  }

  const typeIcon: Record<string, string> = {
    task: '📋',
    payment: '💰',
    invoice: '🧾',
    approval: '✅',
    reminder: '⏰',
    system: '⚙️',
    complaint_created: '🛡️',
    sla_breach: '⚠️',
    work_order: '🔧',
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Enterprise Notification Center</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification(s) synced with database`
              : 'All notifications are read and synced'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Filter */}
          <div className="bg-muted p-1 rounded-lg flex items-center gap-1 text-xs">
            <button
              onClick={() => setFilterTab('all')}
              className={cn(
                'px-3 py-1.5 rounded-md font-medium transition-colors',
                filterTab === 'all'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilterTab('unread')}
              className={cn(
                'px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5',
                filterTab === 'unread'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Unread
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All as Read
            </Button>
          )}
        </div>
      </div>

      {/* Main List */}
      {isLoading ? (
        <Card className="divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonItem key={i} />
          ))}
        </Card>
      ) : isError ? (
        <Card className="border-red-200">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-red-500 mb-2" />
            <p className="text-red-600 text-sm">Failed to load notifications from database.</p>
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BellOff className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg text-muted-foreground">No Notifications</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {filterTab === 'unread' ? 'You have no unread notifications.' : "You're all caught up!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="divide-y overflow-hidden shadow-sm">
          <div className="max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={cn(
                  'p-4 flex items-start gap-4 cursor-pointer transition-colors hover:bg-muted/50 group',
                  !n.isRead && 'bg-primary/5 dark:bg-primary/10'
                )}
              >
                <div className="flex-shrink-0 mt-0.5 text-xl">
                  {typeIcon[n.type] || '📌'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4
                      className={cn(
                        'text-sm font-medium truncate',
                        !n.isRead && 'font-semibold text-foreground'
                      )}
                    >
                      {n.title}
                    </h4>
                    {!n.isRead && (
                      <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {formatDistanceToNow(parseISO(n.createdAt), { addSuffix: true })}
                    {n.readAt && (
                      <span className="ml-2 text-muted-foreground/50">
                        • Read {formatDistanceToNow(parseISO(n.readAt), { addSuffix: true })}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Read / Unread toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                    title={n.isRead ? 'Mark as unread' : 'Mark as read'}
                    onClick={(e) => handleToggleReadStatus(n, e)}
                  >
                    {n.isRead ? <Mail className="h-3.5 w-3.5" /> : <MailOpen className="h-3.5 w-3.5" />}
                  </Button>

                  {/* Delete button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                    title="Delete notification"
                    onClick={(e) => handleDelete(n.id, e)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}