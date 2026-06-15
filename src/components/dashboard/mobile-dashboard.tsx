'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useAppStore, api } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  FolderKanban,
  AlertTriangle,
  ClipboardCheck,
  Users,
  TrendingUp,
  Plus,
  FileText,
  ClipboardList,
  Wallet,
  ShoppingCart,
  BarChart3,
  Clock,
  MessageSquarePlus,
  HardHat,
  MapPin,
  Activity,
  Briefcase,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Minus,
  Wrench,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFormat } from '@/hooks/use-format'

// ──────────────────────────────────────────
// ধরন
// ──────────────────────────────────────────

interface StatsData {
  activeProjects: number
  pendingApprovals: number
  labourOnSiteToday: number
  pendingPurchaseRequests: number
  revenueThisMonth: number
  expensesThisMonth: number
  outstandingInvoices: number
  recentActivities: Array<{
    id: string
    action: string
    entity: string
    createdAt: string
    userName: string
  }>
  upcomingTasks: Array<{
    id: string
    title: string
    status: string
    priority: string
    endDate: string
    progress: number
    project: { name: string; code: string } | null
  }>
  tenderPipeline: Array<{
    id: string
    packageNo: string
    name: string
    status: string
    _count: { bids: number; invitations: number }
  }>
  workCategories: Array<{
    id: string
    name: string
    _count: { bidPackages: number }
  }>
}

// ──────────────────────────────────────────
// সহায়ক ফাংশনসমূহ
// ──────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHrs = Math.floor(diffMins / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`
  const diffDays = Math.floor(diffHrs / 24)
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return `${Math.floor(diffDays / 7)}w ago`
}

function formatLabel(str: string): string {
  return str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const priorityColor: Record<string, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}

const taskStatusColor: Record<string, string> = {
  todo: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}

const activityColorMap: Record<string, string> = {
  CREATE: '#1D9E75',
  UPDATE: '#378ADD',
  DELETE: '#E24B4A',
  LOGIN: '#888',
  STATUS_CHANGE: '#BA7517',
}

function getActivityColor(action: string): string {
  const upper = action.toUpperCase()
  for (const [key, color] of Object.entries(activityColorMap)) {
    if (upper.includes(key)) return color
  }
  return '#888'
}

const progressColors = ['#378ADD', '#1D9E75', '#BA7517', '#993556', '#5B8DEF', '#D96B2C']

const tenderStatusPill: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  published: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  under_evaluation: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  awarded: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  closed: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
}

// ──────────────────────────────────────────
// KPI কার্ড (কম্প্যাক্ট মোবাইল স্টাইল)
// ──────────────────────────────────────────

function KpiCard({
  icon: Icon,
  value,
  label,
  iconBg,
  trend,
  suffix,
}: {
  icon: React.ElementType
  value: number | string
  label: string
  iconBg: string
  trend?: { type: 'up' | 'down' | 'neutral'; text: string }
  suffix?: string
}) {
  return (
    <div className="min-w-[130px] bg-card rounded-xl p-3.5 border snap-start shrink-0">
      <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center mb-2', iconBg)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-lg font-semibold tracking-tight text-foreground leading-none">
        {typeof value === 'number' ? value.toLocaleString() : value}
        {suffix && <span className="text-xs font-normal text-muted-foreground ml-0.5">{suffix}</span>}
      </div>
      <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
      {trend && (
        <div className={cn(
          'flex items-center gap-1 text-[10px] mt-1',
          trend.type === 'up' && 'text-emerald-600',
          trend.type === 'down' && 'text-red-500',
          trend.type === 'neutral' && 'text-muted-foreground',
        )}>
          {trend.type === 'up' && <ArrowUp className="h-2.5 w-2.5" />}
          {trend.type === 'down' && <ArrowDown className="h-2.5 w-2.5" />}
          {trend.type === 'neutral' && <Minus className="h-2.5 w-2.5" />}
          {trend.text}
        </div>
      )}
    </div>
  )
}

function KpiCardSkeleton() {
  return (
    <div className="min-w-[130px] bg-card rounded-xl p-3.5 border snap-start shrink-0">
      <Skeleton className="h-8 w-8 rounded-lg mb-2" />
      <Skeleton className="h-5 w-12 mb-1" />
      <Skeleton className="h-3 w-16" />
    </div>
  )
}

// ──────────────────────────────────────────
// কম্পোনেন্ট
// ──────────────────────────────────────────

export default function MobileDashboard() {
  const { navigate, user } = useAppStore()
  const { formatCurrency } = useFormat()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get<StatsData>('/api/dashboard/stats')
      if (res.success && res.data) {
        setStats(res.data)
      }
    } catch {
      // নীরবে পরিচালনা করা হচ্ছে
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const budgetUtilization = stats
    ? stats.revenueThisMonth > 0
      ? Math.round((stats.expensesThisMonth / stats.revenueThisMonth) * 100)
      : 0
    : 0

  const kpiTrends = useMemo(() => {
    if (!stats) return {}
    return {
      revenue: {
        type: (stats.revenueThisMonth > 0 ? 'up' : 'neutral') as 'up' | 'neutral',
        text: stats.revenueThisMonth > 0 ? `${formatCurrency(stats.revenueThisMonth)}` : 'Pending',
      },
      outstanding: {
        type: (stats.outstandingInvoices === 0 ? 'up' : 'neutral') as 'up' | 'neutral',
        text: stats.outstandingInvoices === 0 ? 'Settled' : `${formatCurrency(stats.outstandingInvoices)}`,
      },
      labour: {
        type: 'neutral' as const,
        text: stats.labourOnSiteToday > 0 ? `${stats.labourOnSiteToday} on site` : 'No deployment',
      },
      tasks: {
        type: (stats.pendingPurchaseRequests === 0 ? 'up' : 'neutral') as 'up' | 'neutral',
        text: stats.pendingPurchaseRequests === 0 ? 'On track' : `${stats.pendingPurchaseRequests} pending`,
      },
      approvals: {
        type: (stats.pendingApprovals === 0 ? 'up' : 'neutral') as 'up' | 'neutral',
        text: stats.pendingApprovals === 0 ? 'All clear' : `${stats.pendingApprovals} waiting`,
      },
    }
  }, [stats, formatCurrency])

  const workCatData = useMemo(() => {
    if (!stats?.workCategories || stats.workCategories.length === 0) return []
    const total = stats.workCategories.reduce((s, c) => s + c._count.bidPackages, 0)
    if (total === 0) return []
    return stats.workCategories.map((c, idx) => ({
      name: c.name,
      count: c._count.bidPackages,
      pct: Math.round((c._count.bidPackages / total) * 100),
      color: progressColors[idx % progressColors.length],
    }))
  }, [stats?.workCategories])

  // দ্রুত কার্যসমূহ
  const quickActions = [
    { label: 'New Complaint', icon: MessageSquarePlus, page: 'maintenance-service-requests' as const },
    { label: 'New Project', icon: FolderKanban, page: 'projects' as const },
    { label: 'Log Attendance', icon: Users, page: 'attendance' as const },
    { label: 'Submit Expense', icon: Wallet, page: 'payments' as const },
    { label: 'Purchase Request', icon: ShoppingCart, page: 'purchase-requests' as const },
    { label: 'View Reports', icon: BarChart3, page: 'reports' as const },
  ]

  return (
    <div className="md:hidden space-y-4 p-4 pb-24">
      {/* ── Greeting ── */}
      <div>
        <h1 className="text-xl font-bold text-foreground">
          Good {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}
        </h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Overview of construction operations
        </p>
      </div>

      {/* ── KPI Cards Row ── */}
      {loading ? (
        <div className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory pb-1 scrollbar-none">
          <KpiCardSkeleton />
          <KpiCardSkeleton />
          <KpiCardSkeleton />
          <KpiCardSkeleton />
          <KpiCardSkeleton />
          <KpiCardSkeleton />
        </div>
      ) : (
        <div className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory pb-1 scrollbar-none">
          <KpiCard
            icon={Briefcase}
            value={stats?.activeProjects ?? 0}
            label="Active Projects"
            iconBg="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            trend={kpiTrends.revenue ? undefined : { type: 'neutral' as const, text: `${stats?.activeProjects ?? 0} running` }}
          />
          <KpiCard
            icon={DollarSign}
            value={formatCurrency(stats?.revenueThisMonth ?? 0)}
            label="Total Revenue"
            iconBg="bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
            trend={kpiTrends.revenue}
          />
          <KpiCard
            icon={FileText}
            value={formatCurrency(stats?.outstandingInvoices ?? 0)}
            label="Outstanding"
            iconBg="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            trend={kpiTrends.outstanding}
          />
          <KpiCard
            icon={Users}
            value={stats?.labourOnSiteToday ?? 0}
            label="Labour Today"
            iconBg="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            trend={kpiTrends.labour}
          />
          <KpiCard
            icon={Clock}
            value={stats?.pendingPurchaseRequests ?? 0}
            label="Pending Tasks"
            iconBg="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            trend={kpiTrends.tasks}
          />
          <KpiCard
            icon={ClipboardCheck}
            value={stats?.pendingApprovals ?? 0}
            label="Pending Approvals"
            iconBg="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
            trend={kpiTrends.approvals}
          />
        </div>
      )}

      {/* ── Quick Actions ── */}
      <Card className="py-4">
        <CardHeader className="px-4 pb-2 pt-0">
          <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-2.5">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto py-4 rounded-xl flex-col gap-2 min-h-[72px]"
                onClick={() => navigate(action.page)}
              >
                <action.icon className="h-5 w-5 text-amber-600" />
                <span className="text-xs font-medium">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Tender Pipeline ── */}
      <Card className="py-4">
        <CardHeader className="px-4 pb-2 pt-0">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
            Tender Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-9 w-full rounded" />
              ))}
            </div>
          ) : stats?.tenderPipeline && stats.tenderPipeline.length > 0 ? (
            <div className="space-y-1">
              {stats.tenderPipeline.slice(0, 5).map((pkg) => (
                <div
                  key={pkg.id}
                  className="flex items-center justify-between py-2 cursor-pointer rounded-md px-2 -mx-2 active:bg-accent/50 transition-colors"
                  onClick={() => navigate('tender-detail', { id: pkg.id })}
                >
                  <span className="text-[13px] font-medium text-foreground truncate max-w-[65%]">
                    {pkg.packageNo}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[11px] px-2 py-0.5 rounded-full shrink-0',
                      tenderStatusPill[pkg.status]
                    )}
                  >
                    {formatLabel(pkg.status)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No tenders in pipeline
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Work Categories ── */}
      <Card className="py-4">
        <CardHeader className="px-4 pb-2 pt-0">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Wrench className="h-4 w-4 text-muted-foreground" />
            Work Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {workCatData.length > 0 ? (
            <div className="space-y-3">
              {workCatData.map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-muted-foreground">{cat.name}</span>
                    <span className="text-[13px] font-medium text-foreground tabular-nums">{cat.pct}%</span>
                  </div>
                  <div className="h-[5px] rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.pct}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No work categories
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── My Tasks ── */}
      <Card className="py-4">
        <CardHeader className="px-4 pb-2 pt-0">
          <CardTitle className="text-sm font-semibold">My Tasks</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-2.5">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg border p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-14 rounded-full" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                </div>
              ))}
            </>
          ) : stats?.upcomingTasks && stats.upcomingTasks.length > 0 ? (
            stats.upcomingTasks.slice(0, 4).map((task) => (
              <div
                key={task.id}
                className="rounded-lg border p-3 space-y-1.5 active:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => {
                  if (task.project) {
                    navigate('project-tasks', { id: task.project.code })
                  }
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-tight line-clamp-1">{task.title}</p>
                  <Badge
                    variant="outline"
                    className={cn('text-[10px] px-1.5 py-0 shrink-0', priorityColor[task.priority])}
                  >
                    {formatLabel(task.priority)}
                  </Badge>
                </div>
                {task.project && (
                  <p className="text-xs text-muted-foreground">{task.project.name}</p>
                )}
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={cn('text-[10px] px-1.5 py-0', taskStatusColor[task.status])}
                  >
                    {formatLabel(task.status)}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {task.endDate ? new Date(task.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No upcoming tasks
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Recent Activities ── */}
      <Card className="py-4">
        <CardHeader className="px-4 pb-2 pt-0">
          <CardTitle className="text-sm font-semibold">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <Skeleton className="h-7 w-7 rounded-full shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : stats?.recentActivities && stats.recentActivities.length > 0 ? (
            <div className="space-y-0 max-h-72 overflow-y-auto">
              {stats.recentActivities.slice(0, 8).map((activity) => (
                <div key={activity.id} className="flex items-start gap-2.5 py-2.5 border-b border-border/50 last:border-b-0">
                  <div
                    className="w-2 h-2 rounded-full mt-[5px] shrink-0"
                    style={{ backgroundColor: getActivityColor(activity.action) }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground leading-relaxed">
                      <span className="font-medium">{activity.userName}</span>{' '}
                      {formatLabel(activity.action).toLowerCase()}{' '}
                      <span className="font-medium text-muted-foreground">{activity.entity}</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {relativeTime(activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No recent activities
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Floating Action Button ── */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="fixed bottom-[84px] right-4 h-14 w-14 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg hover:from-amber-600 hover:to-amber-700 flex items-center justify-center z-40 transition-all active:scale-95 md:hidden"
            aria-label="Quick actions"
          >
            <Plus className="h-6 w-6" />
          </button>
        </PopoverTrigger>
        <PopoverContent side="top" align="end" className="w-52 p-2 mb-2">
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-muted-foreground px-2 py-1.5">Quick Create</p>
            <button
              className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm hover:bg-accent transition-colors text-left min-h-[44px]"
              onClick={() => navigate('maintenance-service-requests')}
            >
              <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                <MessageSquarePlus className="h-4 w-4 text-orange-600" />
              </div>
              <span>New Complaint</span>
            </button>
            <button
              className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm hover:bg-accent transition-colors text-left min-h-[44px]"
              onClick={() => navigate('maintenance-service-requests')}
            >
              <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <HardHat className="h-4 w-4 text-amber-600" />
              </div>
              <span>New Work Request</span>
            </button>
            <button
              className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm hover:bg-accent transition-colors text-left min-h-[44px]"
              onClick={() => navigate('projects')}
            >
              <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                <FolderKanban className="h-4 w-4 text-emerald-600" />
              </div>
              <span>New Project</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

// ──────────────────────────────────────────
// ইউটিলিটি
// ──────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}
