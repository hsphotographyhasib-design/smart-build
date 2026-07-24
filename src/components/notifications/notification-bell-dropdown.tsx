'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Bell,
  BellRing,
  CheckCheck,
  Trash2,
  ExternalLink,
  AlertCircle,
  Info,
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldAlert,
  FileText,
  Wrench,
  CreditCard,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { useNotifications, NotificationItem } from '@/hooks/use-notifications'

const TYPE_ICON: Record<string, React.ReactNode> = {
  complaint_created: <ShieldAlert className="w-4 h-4 text-red-400" />,
  new_complaint: <ShieldAlert className="w-4 h-4 text-red-500" />,
  sla_breach: <AlertCircle className="w-4 h-4 text-red-500" />,
  invoice: <FileText className="w-4 h-4 text-blue-400" />,
  payment: <CreditCard className="w-4 h-4 text-emerald-400" />,
  work_order: <Wrench className="w-4 h-4 text-amber-400" />,
  approval: <CheckCircle2 className="w-4 h-4 text-green-400" />,
  rejection: <XCircle className="w-4 h-4 text-red-400" />,
  system: <Info className="w-4 h-4 text-slate-400" />,
  default: <Bell className="w-4 h-4 text-slate-400" />,
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export function NotificationBellDropdown() {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useAppStore((s) => s.navigate)

  const {
    notifications,
    unreadCount,
    isLoading,
    markRead,
    markAllRead,
    deleteNotif,
    isSSEConnected,
  } = useNotifications({ limit: 15 })

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleNotificationClick = async (n: NotificationItem) => {
    if (!n.isRead) {
      await markRead(n.id)
    }
    if (n.link) {
      const page = n.link.replace(/^\//, '').split('/')[0]
      navigate(page as any)
      setOpen(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await deleteNotif(id)
  }

  const priorityDot = (priority?: string) => {
    if (priority === 'urgent') return 'bg-red-500'
    if (priority === 'high') return 'bg-orange-500'
    return null
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 relative"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <BellRing className="h-4 w-4 text-primary animate-pulse" />
        ) : (
          <Bell className="h-4 w-4" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-card border rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-foreground" />
              <span className="font-semibold text-sm text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead()}
                  className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-500 transition-colors font-medium"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  All read
                </button>
              )}
              <button
                onClick={() => {
                  navigate('notifications')
                  setOpen(false)
                }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                View all
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-30" />
                <p className="text-sm text-muted-foreground">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {notifications.map((n) => {
                  const icon = TYPE_ICON[n.type] || TYPE_ICON.default
                  const dot = priorityDot(n.priority)
                  return (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-accent group ${
                        !n.isRead ? 'bg-primary/5' : ''
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          !n.isRead ? 'bg-primary/10' : 'bg-muted'
                        }`}
                      >
                        {icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm leading-tight ${
                              !n.isRead ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'
                            }`}
                          >
                            {n.title}
                          </p>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />}
                            {!n.isRead && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">{timeAgo(n.createdAt)}</p>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => handleDelete(n.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 transition-all flex-shrink-0"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t bg-muted/30 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {isSSEConnected ? (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Live Sync
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  Realtime Active
                </span>
              )}
            </span>
            <button
              onClick={() => {
                navigate('notifications')
                setOpen(false)
              }}
              className="text-xs text-primary hover:underline font-medium"
            >
              Manage notifications →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
