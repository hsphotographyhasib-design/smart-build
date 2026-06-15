'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, queryKeys } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  FolderKanban,
  DollarSign,
  FileText,
  Users,
  Clock,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  Activity,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

// ──────────────────────────────────────────
// ধরন
// ──────────────────────────────────────────

interface DashboardData {
  activeProjects: number
  revenueThisMonth: number
  expensesThisMonth: number
  outstandingInvoices: number
  labourOnSiteToday: number
  pendingPurchaseRequests: number
  pendingApprovals: number
  recentPayments: Array<{
    id: string
    paymentNo: string
    amount: number
    method: string
    status: string
    date: string
    receivedBy: string
    project: { name: string; code: string } | null
  }>
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
  stockAlerts: Array<{
    id: string
    name: string
    code: string
    currentStock: number
    minStock: number
    unit: string
  }>
  chartData: {
    months: string[]
    revenue: number[]
    expenses: number[]
  }
  projectProgress: Array<{
    id: string
    name: string
    code: string
    progress: number
    budget: number
    totalTasks: number
    completedTasks: number
    taskCompletion: number
  }>
}

// ──────────────────────────────────────────
// সহায়ক ফাংশনসমূহ
// ──────────────────────────────────────────

function formatCurrency(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN')
}

const paymentStatusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  completed: 'default',
  pending: 'secondary',
  failed: 'destructive',
  refunded: 'outline',
  partial: 'outline',
}

const paymentStatusColor: Record<string, string> = {
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  refunded: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  partial: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
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

function formatLabel(str: string): string {
  return str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

// ──────────────────────────────────────────
// চার্টের জন্য কাস্টম টুলটিপ
// ──────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-md">
      <p className="text-sm font-medium text-foreground mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────
// KPI কার্ড
// ──────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: number | string
  icon: React.ElementType
  iconBg: string
  iconColor: string
  suffix?: string
  subtext?: string
  loading?: boolean
}

function KpiCard({ label, value, icon: Icon, iconBg, iconColor, suffix, subtext, loading }: KpiCardProps) {
  return (
    <Card className="py-4">
      <CardContent className="flex items-center gap-4">
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', iconBg)}>
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground truncate">{label}</p>
          {loading ? (
            <Skeleton className="mt-1 h-7 w-24" />
          ) : (
            <p className="text-2xl font-bold tracking-tight">
              {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
              {suffix && <span className="text-sm font-normal text-muted-foreground ml-1">{suffix}</span>}
            </p>
          )}
          {subtext && !loading && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtext}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ──────────────────────────────────────────
// লোডিং স্কেলিটন
// ──────────────────────────────────────────

function KpiGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="py-4">
          <CardContent className="flex items-center gap-4">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  )
}

function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex gap-4">
            {Array.from({ length: cols }).map((_, i) => (
              <Skeleton key={i} className="h-4 flex-1" />
            ))}
          </div>
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="flex gap-4">
              {Array.from({ length: cols }).map((_, c) => (
                <Skeleton key={c} className="h-4 flex-1" />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ──────────────────────────────────────────
// প্রধান ড্যাশবোর্ড পৃষ্ঠা
// ──────────────────────────────────────────

export function DashboardPage() {
  const { data: response, isLoading, isError } = useQuery<{
    success: boolean
    data: DashboardData
    error?: string
  }>({
    queryKey: queryKeys.dashboard,
    queryFn: () => api.get('/api/dashboard/stats').then((r) => r),
    refetchInterval: 30000,
  })

  const dashboardData = response?.success ? response.data : null

  // Recharts-এর জন্য চার্ট ডেটা রূপান্তর করা হচ্ছে
  const chartFormatted = useMemo(() => {
    if (!dashboardData?.chartData) return []
    const { months, revenue, expenses } = dashboardData.chartData
    return months.map((month, i) => ({
      month,
      revenue: revenue[i] || 0,
      expenses: expenses[i] || 0,
    }))
  }, [dashboardData?.chartData])

  // ─── ত্রুটি অবস্থা ───
  if (isError || (response && !response.success)) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-14 w-14 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
            <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-lg font-semibold">Failed to load dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            {response?.error || 'An unexpected error occurred. Please try again later.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* ─── Page Title ─── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your construction operations
        </p>
      </div>

      {/* ─── KPI Cards ─── */}
      {isLoading ? (
        <KpiGridSkeleton />
      ) : dashboardData ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KpiCard
            label="Active Projects"
            value={dashboardData.activeProjects}
            icon={FolderKanban}
            iconBg="bg-amber-100 dark:bg-amber-900/30"
            iconColor="text-amber-600 dark:text-amber-400"
          />
          <KpiCard
            label="Revenue This Month"
            value={formatCurrency(dashboardData.revenueThisMonth)}
            icon={DollarSign}
            iconBg="bg-emerald-100 dark:bg-emerald-900/30"
            iconColor="text-emerald-600 dark:text-emerald-400"
            subtext={dashboardData.expensesThisMonth > 0 ? `Expenses: ${formatCurrency(dashboardData.expensesThisMonth)}` : undefined}
          />
          <KpiCard
            label="Outstanding Invoices"
            value={formatCurrency(dashboardData.outstandingInvoices)}
            icon={FileText}
            iconBg="bg-red-100 dark:bg-red-900/30"
            iconColor="text-red-600 dark:text-red-400"
          />
          <KpiCard
            label="Labour On Site"
            value={dashboardData.labourOnSiteToday}
            suffix="today"
            icon={Users}
            iconBg="bg-teal-100 dark:bg-teal-900/30"
            iconColor="text-teal-600 dark:text-teal-400"
          />
          <KpiCard
            label="Pending Requests"
            value={dashboardData.pendingPurchaseRequests}
            icon={Clock}
            iconBg="bg-orange-100 dark:bg-orange-900/30"
            iconColor="text-orange-600 dark:text-orange-400"
          />
          <KpiCard
            label="Pending Approvals"
            value={dashboardData.pendingApprovals}
            icon={CheckCircle}
            iconBg="bg-violet-100 dark:bg-violet-900/30"
            iconColor="text-violet-600 dark:text-violet-400"
          />
        </div>
      ) : null}

      {/* ─── Charts Row ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses Chart */}
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-amber-600" />
                Revenue vs Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chartFormatted.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartFormatted} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val: number) =>
                        val >= 100000 ? `₹${(val / 100000).toFixed(1)}L` : val >= 1000 ? `₹${(val / 1000).toFixed(0)}K` : `₹${val}`
                      }
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                    />
                    <Bar
                      dataKey="revenue"
                      name="Revenue"
                      fill="#d97706"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                    <Bar
                      dataKey="expenses"
                      name="Expenses"
                      fill="#ef4444"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
                  No revenue data available
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Project Progress */}
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FolderKanban className="h-4 w-4 text-amber-600" />
                Project Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.projectProgress && dashboardData.projectProgress.length > 0 ? (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-5 pr-4">
                    {dashboardData.projectProgress.map((project) => (
                      <div key={project.id} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{project.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {project.completedTasks}/{project.totalTasks} tasks · {formatCurrency(project.budget)}
                            </p>
                          </div>
                          <span className={cn(
                            'text-sm font-semibold ml-3 tabular-nums',
                            project.progress >= 75 ? 'text-emerald-600 dark:text-emerald-400' :
                            project.progress >= 40 ? 'text-amber-600 dark:text-amber-400' :
                            'text-red-600 dark:text-red-400'
                          )}>
                            {project.progress}%
                          </span>
                        </div>
                        <Progress
                          value={project.progress}
                          className={cn(
                            'h-2.5',
                            project.progress >= 75 && '[&>div]:bg-emerald-500',
                            project.progress >= 40 && project.progress < 75 && '[&>div]:bg-amber-500',
                            project.progress < 40 && '[&>div]:bg-red-500'
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
                  No active projects
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* ─── Tables Row ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        {isLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                Recent Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.recentPayments && dashboardData.recentPayments.length > 0 ? (
                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payment No</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboardData.recentPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium text-xs">{payment.paymentNo}</TableCell>
                          <TableCell className="text-right font-semibold tabular-nums text-xs">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatLabel(payment.method)}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {format(parseISO(payment.date), 'dd MMM yyyy')}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={paymentStatusVariant[payment.status] || 'outline'}
                              className={cn(
                                'text-[10px] px-1.5 py-0',
                                paymentStatusColor[payment.status]
                              )}
                            >
                              {formatLabel(payment.status)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">No recent payments</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Upcoming Tasks */}
        {isLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-orange-600" />
                Upcoming Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.upcomingTasks && dashboardData.upcomingTasks.length > 0 ? (
                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboardData.upcomingTasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium text-xs max-w-[180px] truncate" title={task.title}>
                            {task.title}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {task.project?.name || '—'}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {format(parseISO(task.endDate), 'dd MMM yyyy')}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                'text-[10px] px-1.5 py-0',
                                priorityColor[task.priority]
                              )}
                            >
                              {formatLabel(task.priority)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                'text-[10px] px-1.5 py-0',
                                taskStatusColor[task.status]
                              )}
                            >
                              {formatLabel(task.status)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">No upcoming tasks</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* ─── Bottom Row ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Alerts */}
        {isLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Stock Alerts
                {dashboardData?.stockAlerts && dashboardData.stockAlerts.length > 0 && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0 ml-1">
                    {dashboardData.stockAlerts.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.stockAlerts && dashboardData.stockAlerts.length > 0 ? (
                <ScrollArea className="max-h-72">
                  <div className="space-y-2 pr-4">
                    {dashboardData.stockAlerts.map((item) => {
                      const ratio = item.minStock > 0 ? item.currentStock / item.minStock : 0
                      const severity = ratio === 0 ? 'critical' : ratio < 0.5 ? 'high' : 'low'
                      return (
                        <div
                          key={item.id}
                          className={cn(
                            'flex items-center justify-between rounded-lg border p-3 transition-colors',
                            severity === 'critical' && 'border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20',
                            severity === 'high' && 'border-orange-200 bg-orange-50/50 dark:border-orange-900/50 dark:bg-orange-950/20',
                            severity === 'low' && 'border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20'
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">{item.name}</p>
                              <span className="text-[10px] text-muted-foreground font-mono">{item.code}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Min required: {item.minStock} {item.unit}
                            </p>
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            <p className={cn(
                              'text-sm font-bold tabular-nums',
                              severity === 'critical' && 'text-red-600 dark:text-red-400',
                              severity === 'high' && 'text-orange-600 dark:text-orange-400',
                              severity === 'low' && 'text-amber-600 dark:text-amber-400'
                            )}>
                              {item.currentStock} {item.unit}
                            </p>
                            <p className="text-[10px] text-muted-foreground">current stock</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle className="h-8 w-8 text-emerald-500/40 mb-2" />
                  <p className="text-sm text-muted-foreground">All stock levels are healthy</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent Activities */}
        {isLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-48" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-amber-600" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.recentActivities && dashboardData.recentActivities.length > 0 ? (
                <ScrollArea className="max-h-72">
                  <div className="space-y-1 pr-4">
                    {dashboardData.recentActivities.map((activity, idx) => {
                      const isLast = idx === dashboardData.recentActivities.length - 1
                      return (
                        <div key={activity.id} className="flex gap-3 pb-4 relative">
                          {/* Timeline line */}
                          {!isLast && (
                            <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
                          )}
                          {/* Timeline dot */}
                          <div className="relative z-10 mt-0.5 shrink-0">
                            <div className="h-[30px] w-[30px] rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                                {activity.userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                              </span>
                            </div>
                          </div>
                          {/* Content */}
                          <div className="flex-1 min-w-0 pt-0.5">
                            <p className="text-sm leading-snug">
                              <span className="font-medium">{activity.userName}</span>
                              {' '}
                              <span className="text-muted-foreground">
                                {formatLabel(activity.action)} on {formatLabel(activity.entity)}
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {format(parseISO(activity.createdAt), 'dd MMM yyyy, hh:mm a')}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Activity className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">No recent activities</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}