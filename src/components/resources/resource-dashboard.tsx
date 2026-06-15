'use client'

import { useState, useEffect } from 'react'
import { api, useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  Users,
  UserCheck,
  UserMinus,
  Activity,
  Wrench,
  Cog,
  AlertTriangle,
  Truck,
  DollarSign,
  ClipboardList,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'

// ──────────────────────────────────────────
// ধরন
// ──────────────────────────────────────────

interface DashboardKpis {
  totalLabour: number
  labourAssigned: number
  labourUnassigned: number
  resourceUtilization: number
  activeEquipment: number
  equipmentInUse: number
  idleEquipment: number
  activeVehicles: number
  resourceCostThisMonth: number
  pendingRequests: number
  idleResources: number
  activeCrews: number
}

interface RecentAssignment {
  id: string
  resourceName: string
  resourceType: string
  project: string
  role: string
  shift: string
  startDate: string
  status: string
}

interface ChartData {
  utilizationByType: Array<{ name: string; assigned: number; total: number }>
  monthlyCosts: Array<{ month: string; cost: number }>
  typeBreakdown: Array<{ name: string; value: number; color: string }>
  upcomingShortages: Array<{ id: string; resource: string; type: string; priority: string; project: string; requiredBy: string }>
}

interface DashboardData {
  kpis: DashboardKpis
  recentAssignments: RecentAssignment[]
  charts: ChartData
}

// ──────────────────────────────────────────
// সহায়ক ফাংশনসমূহ
// ──────────────────────────────────────────

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-600 text-white border-0',
  completed: 'bg-blue-600 text-white border-0',
  transferred: 'bg-yellow-500 text-white border-0',
  cancelled: 'bg-red-600 text-white border-0',
}

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

// ──────────────────────────────────────────
// KPI কার্ড কম্পোনেন্ট
// ──────────────────────────────────────────

function KpiCard({ title, value, icon: Icon, color, subtitle, badge }: {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  color?: string
  subtitle?: string
  badge?: number
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">{title}</p>
            <p className={cn('text-2xl font-bold truncate', color || 'text-foreground')}>{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {badge !== undefined && badge > 0 && (
              <Badge className="bg-amber-600 text-white border-0 text-xs">{badge}</Badge>
            )}
            <div className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
              'bg-amber-100 dark:bg-amber-950/50'
            )}>
              <Icon className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ──────────────────────────────────────────
// স্কেলিটন
// ──────────────────────────────────────────

function KpiSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 md:p-6 space-y-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-8 w-16" />
      </CardContent>
    </Card>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-16 rounded-full ml-auto" />
        </div>
      ))}
    </div>
  )
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  )
}

// ──────────────────────────────────────────
// প্রধান কম্পোনেন্ট
// ──────────────────────────────────────────

export function ResourceDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<DashboardData>('/api/resources/dashboard')
      .then((res) => {
        if (res.success && res.data) {
          setData(res.data)
        } else {
          setError(res.error || 'Failed to load dashboard data')
        }
      })
      .catch((err) => setError(err.message || 'Network error'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80 mt-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <KpiSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <ChartSkeleton key={i} />)}
        </div>
        <Card><CardContent className="p-0"><TableSkeleton /></CardContent></Card>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-4 md:p-6">
        <Card className="border-red-200">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-10 w-10 mx-auto text-red-500 mb-3" />
            <p className="text-red-600 text-sm font-medium">Failed to load resource dashboard</p>
            <p className="text-muted-foreground text-xs mt-1">{error || 'No data available'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { kpis, recentAssignments, charts } = data

  const utilizationColor = kpis.resourceUtilization > 70
    ? 'text-emerald-600'
    : kpis.resourceUtilization > 40
      ? 'text-amber-600'
      : 'text-red-600'

  const shortages = charts.upcomingShortages || []

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Resource Management Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Executive overview of all resources across projects
        </p>
      </div>

      {/* KPI Row 1 - Labour */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Available Labour" value={kpis.totalLabour} icon={Users} />
        <KpiCard title="Labour Currently Assigned" value={kpis.labourAssigned} icon={UserCheck} />
        <KpiCard title="Labour Unassigned" value={kpis.labourUnassigned} icon={UserMinus} />
        <KpiCard
          title="Resource Utilization"
          value={`${kpis.resourceUtilization}%`}
          icon={Activity}
          color={utilizationColor}
          subtitle={kpis.resourceUtilization > 70 ? 'Optimal' : kpis.resourceUtilization > 40 ? 'Moderate' : 'Low'}
        />
      </div>

      {/* KPI Row 2 - Equipment & Vehicles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Active Equipment" value={kpis.activeEquipment} icon={Wrench} />
        <KpiCard title="Equipment In Use" value={kpis.equipmentInUse} icon={Cog} />
        <KpiCard title="Idle Equipment" value={kpis.idleEquipment} icon={AlertTriangle} />
        <KpiCard title="Active Vehicles" value={kpis.activeVehicles} icon={Truck} />
      </div>

      {/* KPI Row 3 - Financial & Operations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Resource Cost This Month" value={formatCurrency(kpis.resourceCostThisMonth)} icon={DollarSign} />
        <KpiCard title="Pending Requests" value={kpis.pendingRequests} icon={ClipboardList} badge={kpis.pendingRequests} />
        <KpiCard title="Idle Resources" value={kpis.idleResources} icon={AlertCircle} />
        <KpiCard title="Active Crews" value={kpis.activeCrews} icon={Users} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ধরন অনুযায়ী সম্পদ ব্যবহার */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Resource Utilization by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.utilizationByType || []} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="assigned" name="Assigned" fill="#d97706" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="total" name="Total" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Resource Costs */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Monthly Resource Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.monthlyCosts || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Line
                    type="monotone"
                    dataKey="cost"
                    name="Cost"
                    stroke="#d97706"
                    strokeWidth={2}
                    dot={{ fill: '#d97706', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Resource Type Breakdown (Pie/Donut) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Resource Type Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.typeBreakdown || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {(charts.typeBreakdown || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Shortages */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Upcoming Shortages</CardTitle>
          </CardHeader>
          <CardContent>
            {shortages.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                  No upcoming shortages
                </div>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-2">
                {shortages.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-background"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{s.resource}</p>
                      <p className="text-xs text-muted-foreground">{s.project} &middot; By {s.requiredBy}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      <Badge className="text-xs capitalize" variant="outline">{s.type}</Badge>
                      <Badge className={cn('text-xs capitalize', priorityColors[s.priority] || 'bg-secondary')}>{s.priority}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Assignments Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Recent Assignments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentAssignments.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No recent assignments found.
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold text-xs">Resource Name</TableHead>
                    <TableHead className="font-semibold text-xs">Type</TableHead>
                    <TableHead className="font-semibold text-xs hidden md:table-cell">Project</TableHead>
                    <TableHead className="font-semibold text-xs hidden lg:table-cell">Role</TableHead>
                    <TableHead className="font-semibold text-xs hidden lg:table-cell">Shift</TableHead>
                    <TableHead className="font-semibold text-xs hidden sm:table-cell">Start Date</TableHead>
                    <TableHead className="font-semibold text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAssignments.map((a) => (
                    <TableRow key={a.id} className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors">
                      <TableCell className="text-sm font-medium">{a.resourceName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs capitalize">{a.resourceType}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground truncate max-w-[200px]">{a.project}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{a.role || '—'}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {a.shift ? (
                          <Badge className={cn(
                            'text-xs border-0',
                            a.shift === 'day' ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' :
                            a.shift === 'night' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                            'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                          )}>
                            {a.shift}
                          </Badge>
                        ) : '—'}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {a.startDate ? format(parseISO(a.startDate), 'dd MMM yyyy') : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('text-xs capitalize', statusColors[a.status] || 'bg-secondary text-secondary-foreground')}>
                          {a.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// খালি অবস্থার জন্য CheckCircle প্রয়োজন
function CheckCircle({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}