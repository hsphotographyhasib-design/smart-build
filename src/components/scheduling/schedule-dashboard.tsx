'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAppStore, api, queryKeys } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  CalendarClock,
  AlertTriangle,
  Flag,
  Activity,
  TrendingUp,
  HeartPulse,
  Plus,
  List,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, parseISO, differenceInDays } from 'date-fns'

// ─── Types ───
interface DashboardData {
  activeSchedules: number
  delayedTasks: number
  upcomingMilestones: number
  criticalActivities: number
  avgCompletionPct: number
  scheduleHealthScore: number
  activeSchedulesChange: number
  delayedTasksChange: number
  upcomingMilestonesChange: number
  criticalActivitiesChange: number
  avgCompletionChange: number
  healthScoreChange: number
  upcomingMilestoneList: Array<{
    id: string
    name: string
    date: string
    scheduleName: string
    projectName: string
    status: string
    daysRemaining: number
  }>
  criticalActivityList: Array<{
    id: string
    name: string
    activityId: string
    scheduleName: string
    progress: number
    status: string
    endDate: string
  }>
  recentActivities: Array<{
    id: string
    text: string
    time: string
    type: string
  }>
}

// ─── Helpers ───
function TrendIndicator({ change }: { change: number }) {
  if (change === 0) return <span className="text-[10px] text-muted-foreground">—</span>
  const isGood = change > 0
  return (
    <span className={cn('text-[10px] font-medium flex items-center gap-0.5', isGood ? 'text-emerald-600' : 'text-red-600')}>
      {change > 0 ? '+' : ''}{change}%
    </span>
  )
}

function getHealthColor(score: number): string {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-amber-600'
  if (score >= 40) return 'text-orange-600'
  return 'text-red-600'
}

function getHealthBg(score: number): string {
  if (score >= 80) return 'bg-emerald-100'
  if (score >= 60) return 'bg-amber-100'
  if (score >= 40) return 'bg-orange-100'
  return 'bg-red-100'
}

function getHealthBarColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 60) return 'bg-amber-500'
  if (score >= 40) return 'bg-orange-500'
  return 'bg-red-500'
}

const milestoneStatusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700' },
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700' },
  delayed: { label: 'Delayed', className: 'bg-red-50 text-red-700' },
  missed: { label: 'Missed', className: 'bg-red-50 text-red-700' },
}

const activityStatusConfig: Record<string, { label: string; className: string }> = {
  not_started: { label: 'Not Started', className: 'bg-gray-100 text-gray-700' },
  in_progress: { label: 'In Progress', className: 'bg-amber-50 text-amber-700' },
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700' },
  delayed: { label: 'Delayed', className: 'bg-red-50 text-red-700' },
  on_hold: { label: 'On Hold', className: 'bg-gray-100 text-gray-700' },
}

// ─── KPI Cards ───
const kpiCards = [
  {
    key: 'activeSchedules',
    label: 'Active Schedules',
    icon: CalendarClock,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    getValue: (d: DashboardData) => d.activeSchedules,
    getChange: (d: DashboardData) => d.activeSchedulesChange,
  },
  {
    key: 'delayedTasks',
    label: 'Delayed Tasks',
    icon: AlertTriangle,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    getValue: (d: DashboardData) => d.delayedTasks,
    getChange: (d: DashboardData) => d.delayedTasksChange,
  },
  {
    key: 'upcomingMilestones',
    label: 'Upcoming Milestones',
    icon: Flag,
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    getValue: (d: DashboardData) => d.upcomingMilestones,
    getChange: (d: DashboardData) => d.upcomingMilestonesChange,
  },
  {
    key: 'criticalActivities',
    label: 'Critical Activities',
    icon: Activity,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    getValue: (d: DashboardData) => d.criticalActivities,
    getChange: (d: DashboardData) => d.criticalActivitiesChange,
  },
  {
    key: 'avgCompletionPct',
    label: 'Avg Completion %',
    icon: TrendingUp,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    getValue: (d: DashboardData) => d.avgCompletionPct,
    getChange: (d: DashboardData) => d.avgCompletionChange,
    format: (v: number) => `${Math.round(v)}%`,
  },
  {
    key: 'scheduleHealthScore',
    label: 'Schedule Health Score',
    icon: HeartPulse,
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    getValue: (d: DashboardData) => d.scheduleHealthScore,
    getChange: (d: DashboardData) => d.healthScoreChange,
    format: (v: number) => `${Math.round(v)}`,
  },
]

// ─── Main Component ───
export function ScheduleDashboard() {
  const { navigate } = useAppStore()

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.scheduleDashboard,
    queryFn: () => api.get<DashboardData>('/api/schedules/dashboard').then((r) => r.data!),
  })

  const dashboard = data as DashboardData | undefined

  if (isLoading || !dashboard) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <Skeleton className="h-8 w-72 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* ─── হেডার ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Schedule Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of all construction schedules and milestones
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('schedule-list')}
          >
            <List className="h-4 w-4 mr-2" />
            View All Schedules
          </Button>
          <Button
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 text-white"
            onClick={() => navigate('schedule-list')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Schedule
          </Button>
        </div>
      </div>

      {/* ─── KPI কার্ড ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon
          const value = kpi.getValue(dashboard)
          const change = kpi.getChange(dashboard)

          return (
            <Card key={kpi.key} className="rounded-xl p-3.5 border">
              <CardContent className="p-0">
                <div className="flex items-start justify-between">
                  <div className={cn('rounded-lg p-2', kpi.iconBg)}>
                    <Icon className={cn('h-4 w-4', kpi.iconColor)} />
                  </div>
                  {change !== 0 && <TrendIndicator change={change} />}
                </div>
                <div className="mt-3">
                  <p className="text-xl font-semibold">
                    {kpi.format ? kpi.format(value) : value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ─── নিচের বিভাগ ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* আসন্ন মাইলফলক */}
        <Card className="rounded-xl lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Upcoming Milestones (Next 30 Days)</CardTitle>
              <Badge variant="outline" className="text-xs">
                {dashboard.upcomingMilestoneList.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {dashboard.upcomingMilestoneList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Flag className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No upcoming milestones</p>
              </div>
            ) : (
              <ScrollArea className="max-h-96">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs font-semibold">Milestone</TableHead>
                      <TableHead className="text-xs font-semibold hidden md:table-cell">Project</TableHead>
                      <TableHead className="text-xs font-semibold hidden sm:table-cell">Schedule</TableHead>
                      <TableHead className="text-xs font-semibold">Date</TableHead>
                      <TableHead className="text-xs font-semibold">Status</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Days Left</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboard.upcomingMilestoneList.map((ms) => {
                      const msConfig = milestoneStatusConfig[ms.status] || milestoneStatusConfig.pending
                      return (
                        <TableRow
                          key={ms.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate('schedule-detail', { id: ms.id })}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Flag className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                              <span className="text-sm font-medium truncate max-w-[160px]">{ms.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground truncate max-w-[120px]">
                            {ms.projectName}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm text-muted-foreground truncate max-w-[120px]">
                            {ms.scheduleName}
                          </TableCell>
                          <TableCell className="text-sm">
                            {ms.date ? format(parseISO(ms.date), 'dd MMM yyyy') : '—'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn('text-[10px] font-medium', msConfig.className)}>
                              {msConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={cn(
                                'text-xs font-medium',
                                ms.daysRemaining <= 3 ? 'text-red-600' : ms.daysRemaining <= 7 ? 'text-amber-600' : 'text-emerald-600'
                              )}
                            >
                              {ms.daysRemaining}d
                            </span>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* সংকটাপন্ন কার্যকলাপ ও সাম্প্রতিক কার্যকলাপ */}
        <div className="space-y-4">
          {/* সংকটাপন্ন কার্যকলাপ */}
          <Card className="rounded-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Critical Activities</CardTitle>
                <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
                  {dashboard.criticalActivityList.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {dashboard.criticalActivityList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400 mb-2" />
                  <p className="text-sm text-muted-foreground">No critical path issues</p>
                </div>
              ) : (
                <ScrollArea className="max-h-64">
                  <div className="divide-y">
                    {dashboard.criticalActivityList.map((act) => {
                      const stConfig = activityStatusConfig[act.status] || activityStatusConfig.not_started
                      return (
                        <div key={act.id} className="px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{act.name}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{act.activityId} · {act.scheduleName}</p>
                            </div>
                            <Badge variant="outline" className={cn('text-[10px] flex-shrink-0', stConfig.className)}>
                              {stConfig.label}
                            </Badge>
                          </div>
                          <div className="mt-2 flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full',
                                  act.progress >= 80 ? 'bg-emerald-500' : act.progress >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                )}
                                style={{ width: `${act.progress}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-medium text-muted-foreground">{Math.round(act.progress)}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* সাম্প্রতিক কার্যকলাপ */}
          <Card className="rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {dashboard.recentActivities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Clock className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                </div>
              ) : (
                <ScrollArea className="max-h-64">
                  <div className="divide-y">
                    {dashboard.recentActivities.map((item) => (
                      <div key={item.id} className="px-4 py-3">
                        <div className="flex items-start gap-2">
                          <div className={cn(
                            'rounded-full p-1 mt-0.5',
                            item.type === 'created' ? 'bg-emerald-100' :
                            item.type === 'updated' ? 'bg-amber-100' :
                            item.type === 'completed' ? 'bg-teal-100' :
                            item.type === 'delayed' ? 'bg-red-100' :
                            'bg-gray-100'
                          )}>
                            {item.type === 'created' ? (
                              <Plus className="h-2.5 w-2.5 text-emerald-600" />
                            ) : item.type === 'updated' ? (
                              <ArrowRight className="h-2.5 w-2.5 text-amber-600" />
                            ) : item.type === 'completed' ? (
                              <CheckCircle2 className="h-2.5 w-2.5 text-teal-600" />
                            ) : item.type === 'delayed' ? (
                              <XCircle className="h-2.5 w-2.5 text-red-600" />
                            ) : (
                              <Clock className="h-2.5 w-2.5 text-gray-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs leading-relaxed">{item.text}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{item.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
