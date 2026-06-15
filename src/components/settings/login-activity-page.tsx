'use client'

import { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Shield,
  Clock,
  Users,
  LogIn,
  ShieldAlert,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  ChevronLeft,
  RefreshCw,
  Search,
  AlertTriangle,
  Laptop,
  X,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────

interface SessionUser {
  id: string
  name: string
  email: string
  avatar?: string | null
  role?: string
}

interface Session {
  id: string
  userId: string
  user: SessionUser
  loginTime: string
  logoutTime: string | null
  duration: number | null
  status: string
  deviceType: string
  deviceName: string | null
  browser: string | null
  browserVersion: string | null
  os: string | null
  ipAddress: string | null
  country: string | null
  city: string | null
  lastActivity: string | null
  failedAttempt?: boolean
}

interface SessionStats {
  activeSessions: number
  idleSessions: number
  totalLoginsToday: number
  failedAttemptsToday: number
}

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
}

function getDeviceIcon(type: string): string {
  if (type === 'mobile') return 'Smartphone'
  if (type === 'tablet') return 'Tablet'
  return 'Monitor'
}

function DeviceIconDisplay({ type, className }: { type: string; className?: string }) {
  const iconName = getDeviceIcon(type)
  const IconComp = iconName === 'Smartphone' ? Smartphone : iconName === 'Tablet' ? Tablet : Monitor
  return <IconComp className={className} />
}

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
  idle: { label: 'Idle', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  expired: { label: 'Expired', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
  timeout: { label: 'Timeout', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  forced_logout: { label: 'Forced Out', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
}

const DATE_RANGES = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'All Time', value: 'all' },
]

const STATUS_OPTIONS = [
  { label: 'All Status', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Idle', value: 'idle' },
  { label: 'Completed', value: 'completed' },
  { label: 'Timeout', value: 'timeout' },
  { label: 'Forced Logout', value: 'forced_logout' },
]

// ──────────────────────────────────────────
// Skeleton Components
// ──────────────────────────────────────────

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-16 rounded-full ml-auto" />
        </div>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────
// User Avatar
// ──────────────────────────────────────────

function UserAvatar({ user }: { user: SessionUser }) {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex items-center gap-3 min-w-[160px]">
      <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-xs font-semibold text-amber-700 dark:text-amber-300 shrink-0">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{user.name}</p>
        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────
// Session Detail Dialog
// ──────────────────────────────────────────

function SessionDetailDialog({
  session,
  open,
  onClose,
}: {
  session: Session | null
  open: boolean
  onClose: () => void
}) {
  const queryClient = useQueryClient()

  const forceLogoutMutation = useMutation({
    mutationFn: (sessionId: string) =>
      api.post(`/api/sessions/${sessionId}/force-logout`),
    onSuccess: () => {
      toast.success('Session terminated successfully')
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['session-stats'] })
      onClose()
    },
    onError: (err: any) => {
      toast.error(err?.error || err?.message || 'Failed to terminate session')
    },
  })

  if (!session) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-600" />
            Session Details
          </DialogTitle>
          <DialogDescription>
            Detailed information about this user session
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 pb-4">
            {/* User Information */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                User Information
              </h4>
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <UserAvatar user={session.user} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground">{session.user.email}</p>
                  {session.user.role && (
                    <Badge variant="outline" className="text-xs mt-1">
                      {session.user.role}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Session Timeline */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Session Timeline
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0 mt-0.5">
                    <LogIn className="h-3 w-3 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Login</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(session.loginTime)}
                    </p>
                  </div>
                </div>

                {session.lastActivity && session.status === 'active' && (
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="h-3 w-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Last Activity</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(session.lastActivity)}
                      </p>
                    </div>
                  </div>
                )}

                {session.logoutTime && (
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 mt-0.5">
                      <X className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Logout</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(session.logoutTime)}
                      </p>
                    </div>
                  </div>
                )}

                {session.duration != null && (
                  <div className="ml-9 p-2 rounded bg-muted/50 inline-block">
                    <p className="text-xs text-muted-foreground">
                      Duration:{' '}
                      <span className="font-medium text-foreground">
                        {formatDuration(session.duration)}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Device & Browser */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Device &amp; Browser
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <DeviceIconDisplay type={session.deviceType || ''} className="h-3.5 w-3.5" />
                    Device
                  </div>
                  <p className="text-sm font-medium capitalize">
                    {session.deviceType || 'Unknown'}
                  </p>
                  {session.deviceName && (
                    <p className="text-xs text-muted-foreground">{session.deviceName}</p>
                  )}
                </div>
                <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Globe className="h-3.5 w-3.5" />
                    Browser
                  </div>
                  <p className="text-sm font-medium">
                    {session.browser || 'Unknown'}
                    {session.browserVersion ? ` ${session.browserVersion}` : ''}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Laptop className="h-3.5 w-3.5" />
                    OS
                  </div>
                  <p className="text-sm font-medium">{session.os || 'Unknown'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Status
                  </div>
                  <Badge
                    className={cn(
                      'text-xs',
                      statusConfig[session.status]?.color || 'bg-secondary text-secondary-foreground'
                    )}
                  >
                    {statusConfig[session.status]?.label || session.status}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Location Info */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Location &amp; Network
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                  <p className="text-xs text-muted-foreground">IP Address</p>
                  <p className="text-sm font-mono font-medium">
                    {session.ipAddress || '—'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                  <p className="text-xs text-muted-foreground">Country</p>
                  <p className="text-sm font-medium">{session.country || '—'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                  <p className="text-xs text-muted-foreground">City</p>
                  <p className="text-sm font-medium">{session.city || '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="pt-4 border-t">
          {session.status === 'active' && (
            <Button
              variant="destructive"
              className="gap-2"
              disabled={forceLogoutMutation.isPending}
              onClick={() => forceLogoutMutation.mutate(session.id)}
            >
              <AlertTriangle className="h-4 w-4" />
              {forceLogoutMutation.isPending ? 'Terminating...' : 'Force Logout'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ──────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────

export function LoginActivityPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const limit = 20

  const refreshKey = useState(0)[0]

  // Build query params
  const queryParams = useMemo(() => {
    const p = new URLSearchParams()
    p.set('role', 'admin')
    p.set('page', String(page))
    p.set('limit', String(limit))
    if (statusFilter !== 'all') p.set('status', statusFilter)
    if (searchQuery.trim()) p.set('search', searchQuery.trim())
    if (dateRange !== 'all') p.set('dateRange', dateRange)
    return p.toString()
  }, [statusFilter, searchQuery, dateRange, page])

  // Fetch sessions
  const {
    data: sessionsData,
    isLoading: sessionsLoading,
    error: sessionsError,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: ['sessions', queryParams, refreshKey],
    queryFn: () =>
      api.get(`/api/sessions?${queryParams}`).then((r) => r.data as any),
  })

  // Fetch session stats
  const {
    data: statsData,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['session-stats', refreshKey],
    queryFn: () =>
      api.get('/api/sessions/active').then((r) => r.data as any),
  })

  // Transform API response to match Session interface
  const sessions: Session[] = useMemo(() => {
    const rawSessions = sessionsData?.sessions || sessionsData?.data || []
    return rawSessions.map((s: any) => ({
      id: s.id,
      userId: s.userId,
      user: s.user,
      loginTime: s.loginTime || s.createdAt,
      logoutTime: s.logoutTime || s.revokedAt || null,
      duration: s.duration ?? s.sessionDuration ?? null,
      status: s.status,
      deviceType: s.deviceType || s.device || 'Unknown',
      deviceName: s.deviceName || null,
      browser: s.browser || null,
      browserVersion: s.browserVersion || null,
      os: s.os || s.operatingSystem || null,
      ipAddress: s.ipAddress || null,
      country: s.country || null,
      city: s.city || null,
      lastActivity: s.lastActivity || s.lastActivityAt || null,
      failedAttempt: s.failedAttempt || false,
    }))
  }, [sessionsData])
  const total: number = sessionsData?.total || 0
  const stats: SessionStats | null = useMemo(() => {
    if (!statsData) return null
    return {
      activeSessions: statsData.activeCount ?? statsData.activeSessions ?? 0,
      idleSessions: statsData.idleCount ?? statsData.idleSessions ?? 0,
      totalLoginsToday: statsData.totalLoginsToday ?? statsData.totalOnline ?? (statsData.activeCount ?? 0) + (statsData.idleCount ?? 0),
      failedAttemptsToday: statsData.failedAttemptsToday ?? statsData.failedAttempts ?? 0,
    }
  }, [statsData])

  const handleRefresh = useCallback(() => {
    refetchSessions()
    refetchStats()
  }, [refetchSessions, refetchStats])

  const resetFilters = useCallback(() => {
    setSearchQuery('')
    setStatusFilter('all')
    setDateRange('all')
    setPage(1)
  }, [])

  const hasActiveFilters =
    searchQuery || statusFilter !== 'all' || dateRange !== 'all'

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Login Activity</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor user sessions, login history, and security events
        </p>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <StatsSkeleton />
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                  <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Active Sessions</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {stats.activeSessions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Idle Sessions</p>
                  <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                    {stats.idleSessions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <LogIn className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Logins Today</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.totalLoginsToday}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                  <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Failed Attempts</p>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">
                    {stats.failedAttemptsToday}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Filters Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
                className="pl-9"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={dateRange}
              onValueChange={(v) => {
                setDateRange(v)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGES.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="h-3.5 w-3.5 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      {sessionsLoading ? (
        <Card>
          <CardContent className="p-0">
            <TableSkeleton />
          </CardContent>
        </Card>
      ) : sessionsError ? (
        <Card className="border-red-200 dark:border-red-900">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-red-400 mb-4" />
            <h3 className="font-semibold text-lg text-red-600 dark:text-red-400">
              Failed to Load Sessions
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Unable to retrieve login activity data. Please try again.
            </p>
            <Button variant="outline" className="mt-4" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg text-muted-foreground">
              No Sessions Found
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {hasActiveFilters
                ? 'Try adjusting your search or filters.'
                : 'No login activity recorded yet.'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" className="mt-4" onClick={resetFilters}>
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <CardHeader className="pb-2 px-4 pt-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {total} session{total !== 1 ? 's' : ''} found
                </CardTitle>
              </div>
            </CardHeader>
            <div className="overflow-x-auto max-h-[calc(100vh-350px)] overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold text-xs">User</TableHead>
                    <TableHead className="font-semibold text-xs">Login Time</TableHead>
                    <TableHead className="font-semibold text-xs hidden md:table-cell">
                      Logout Time
                    </TableHead>
                    <TableHead className="font-semibold text-xs hidden lg:table-cell">
                      Duration
                    </TableHead>
                    <TableHead className="font-semibold text-xs hidden lg:table-cell">
                      Device
                    </TableHead>
                    <TableHead className="font-semibold text-xs hidden xl:table-cell">
                      Browser
                    </TableHead>
                    <TableHead className="font-semibold text-xs hidden xl:table-cell">
                      OS
                    </TableHead>
                    <TableHead className="font-semibold text-xs hidden lg:table-cell">
                      IP Address
                    </TableHead>
                    <TableHead className="font-semibold text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => {
                    const sConfig = statusConfig[session.status]
                    return (
                      <TableRow
                        key={session.id}
                        className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors cursor-pointer"
                        onClick={() => setSelectedSession(session)}
                      >
                        <TableCell>
                          <UserAvatar user={session.user} />
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {formatDateTime(session.loginTime)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground whitespace-nowrap">
                          {session.logoutTime
                            ? formatDateTime(session.logoutTime)
                            : '—'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground whitespace-nowrap">
                          {session.duration != null
                            ? formatDuration(session.duration)
                            : '—'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <DeviceIconDisplay type={session.deviceType || ''} className="h-3.5 w-3.5 shrink-0" />
                            <span className="capitalize">
                              {session.deviceType || 'Unknown'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-sm text-muted-foreground whitespace-nowrap">
                          {session.browser || '—'}
                          {session.browserVersion
                            ? ` ${session.browserVersion}`
                            : ''}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-sm text-muted-foreground whitespace-nowrap">
                          {session.os || '—'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm font-mono text-muted-foreground">
                          {session.ipAddress || '—'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              'text-xs border-0',
                              sConfig?.color ||
                                'bg-secondary text-secondary-foreground'
                            )}
                          >
                            {sConfig?.label || session.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {total > limit && (
              <div className="flex items-center justify-between p-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * limit + 1}–
                  {Math.min(page * limit, total)} of {total}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page * limit >= total}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </>
      )}

      {/* Session Detail Dialog */}
      <SessionDetailDialog
        session={selectedSession}
        open={!!selectedSession}
        onClose={() => setSelectedSession(null)}
      />
    </div>
  )
}