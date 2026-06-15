'use client'

import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppStore, api, queryKeys } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { ScheduleGanttChart, GanttActivity, GanttDependency } from './schedule-gantt-chart'
import {
  CalendarClock,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Save,
  Download,
  Camera,
  Link2,
  Users,
  TimerReset,
  CalendarDays,
  History,
  MessageSquare,
  BarChart3,
  Diamond,
  ArrowLeft,
  HeartPulse,
  Target,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'

// ─── Types ───
interface ScheduleDetail {
  id: string
  scheduleNo: string
  name: string
  projectId: string
  projectName: string
  projectCode: string
  scheduleType: string
  parentScheduleId: string | null
  baselineScheduleId: string | null
  version: number
  revision: number
  status: string
  startDate: string | null
  endDate: string | null
  totalDuration: number
  totalActivities: number
  completionPct: number
  healthScore: number
  description: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

interface ScheduleDetailResponse {
  schedule: ScheduleDetail
  activities: ActivityRow[]
  milestones: MilestoneRow[]
  dependencies: DependencyRow[]
  delays: DelayRow[]
  calendars: CalendarRow[]
  snapshots: SnapshotRow[]
  comments: CommentRow[]
}

interface ActivityRow {
  id: string
  activityId: string
  name: string
  taskType: string
  parentId: string | null
  startDate: string | null
  finishDate: string | null
  duration: number
  progress: number
  status: string
  priority: string
  isCritical: boolean
  isOnCriticalPath: boolean
  children?: ActivityRow[]
  resourceNames?: string
  order: number
  wbsCode: string | null
  costCode: string | null
}

interface MilestoneRow {
  id: string
  name: string
  description: string | null
  date: string | null
  type: string
  status: string
  weight: number
}

interface DependencyRow {
  id: string
  predecessorId: string
  successorId: string
  predecessorName: string
  successorName: string
  depType: string
  lagDays: number
}

interface DelayRow {
  id: string
  title: string
  delayType: string
  impactDays: number
  impactType: string
  startDate: string | null
  endDate: string | null
  status: string
  eotRequested: boolean
  eotDays: number
  costImpact: number
  reportedByName: string
  createdAt: string
  activityName: string | null
}

interface CalendarRow {
  id: string
  name: string
  calendarType: string
  startDate: string | null
  endDate: string | null
  workingDays: string
  hoursPerDay: number
  isDefault: boolean
}

interface SnapshotRow {
  id: string
  name: string
  snapshotType: string
  takenAt: string
  takenByName: string
}

interface CommentRow {
  id: string
  content: string
  activityName: string | null
  createdByName: string
  createdAt: string
}

// ─── Constants ───
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
  published: { label: 'Published', className: 'bg-amber-50 text-amber-700' },
  active: { label: 'Active', className: 'bg-emerald-50 text-emerald-700' },
  archived: { label: 'Archived', className: 'bg-gray-100 text-gray-500' },
}

const ACTIVITY_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  not_started: { label: 'Not Started', className: 'bg-gray-100 text-gray-700' },
  in_progress: { label: 'In Progress', className: 'bg-amber-50 text-amber-700' },
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700' },
  delayed: { label: 'Delayed', className: 'bg-red-50 text-red-700' },
  on_hold: { label: 'On Hold', className: 'bg-gray-100 text-gray-700' },
}

const MILESTONE_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700' },
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700' },
  delayed: { label: 'Delayed', className: 'bg-red-50 text-red-700' },
  missed: { label: 'Missed', className: 'bg-red-50 text-red-700' },
}

const PRIORITY_CONFIG: Record<string, { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-gray-100 text-gray-700' },
  medium: { label: 'Medium', className: 'bg-amber-50 text-amber-700' },
  high: { label: 'High', className: 'bg-orange-50 text-orange-700' },
  critical: { label: 'Critical', className: 'bg-red-50 text-red-700' },
}

const DEP_TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  FS: { label: 'FS', className: 'bg-amber-50 text-amber-700' },
  SS: { label: 'SS', className: 'bg-teal-50 text-teal-700' },
  FF: { label: 'FF', className: 'bg-emerald-50 text-emerald-700' },
  SF: { label: 'SF', className: 'bg-rose-50 text-rose-700' },
}

const DELAY_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-red-50 text-red-700' },
  acknowledged: { label: 'Acknowledged', className: 'bg-amber-50 text-amber-700' },
  resolved: { label: 'Resolved', className: 'bg-emerald-50 text-emerald-700' },
  disputed: { label: 'Disputed', className: 'bg-orange-50 text-orange-700' },
}

const TASK_TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  task: { label: 'Task', className: 'bg-amber-50 text-amber-700' },
  milestone: { label: 'Milestone', className: 'bg-gray-100 text-gray-700' },
  summary: { label: 'Summary', className: 'bg-gray-100 text-gray-700' },
  inspection: { label: 'Inspection', className: 'bg-teal-50 text-teal-700' },
  procurement: { label: 'Procurement', className: 'bg-orange-50 text-orange-700' },
  work_order: { label: 'Work Order', className: 'bg-emerald-50 text-emerald-700' },
  maintenance: { label: 'Maintenance', className: 'bg-violet-50 text-violet-700' },
  approval: { label: 'Approval', className: 'bg-rose-50 text-rose-700' },
}

// ─── Helpers ───
function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return format(parseISO(dateStr), 'dd MMM yyyy')
}

function getHealthColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 bg-emerald-100'
  if (score >= 60) return 'text-amber-600 bg-amber-100'
  if (score >= 40) return 'text-orange-600 bg-orange-100'
  return 'text-red-600 bg-red-100'
}

function buildGanttActivities(activities: ActivityRow[]): GanttActivity[] {
  return activities.map((a) => ({
    id: a.id,
    activityId: a.activityId,
    name: a.name,
    taskType: a.taskType as GanttActivity['taskType'],
    parentId: a.parentId,
    startDate: a.startDate,
    finishDate: a.finishDate,
    duration: a.duration,
    progress: a.progress,
    status: a.status,
    priority: a.priority,
    isCritical: a.isCritical,
    isOnCriticalPath: a.isOnCriticalPath,
    children: a.children ? buildGanttActivities(a.children) : undefined,
    resourceNames: a.resourceNames,
  }))
}

function buildGanttDependencies(deps: DependencyRow[]): GanttDependency[] {
  return deps.map((d) => ({
    id: d.id,
    predecessorId: d.predecessorId,
    successorId: d.successorId,
    depType: d.depType as GanttDependency['depType'],
    lagDays: d.lagDays,
  }))
}

// ─── Main Component ───
interface ScheduleDetailPageProps {
  scheduleId: string
}

export function ScheduleDetailPage({ scheduleId }: ScheduleDetailPageProps) {
  const { navigate } = useAppStore()
  const [activeTab, setActiveTab] = useState('overview')
  const queryClient = useQueryClient()

  // Fetch schedule detail
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.scheduleDetail(scheduleId),
    queryFn: () => api.get<ScheduleDetailResponse>(`/api/schedules/${scheduleId}`).then((r) => r.data!),
    enabled: !!scheduleId,
  })

  const schedule = data?.schedule
  const activities = data?.activities || []
  const milestones = data?.milestones || []
  const dependencies = data?.dependencies || []
  const delays = data?.delays || []
  const calendars = data?.calendars || []
  const snapshots = data?.snapshots || []
  const comments = data?.comments || []

  // Gantt data
  const ganttActivities = useMemo(() => buildGanttActivities(activities), [activities])
  const ganttDependencies = useMemo(() => buildGanttDependencies(dependencies), [dependencies])

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  if (error || !schedule) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('schedule-list')}>
            <ArrowLeft className="h-4 w-4 mr-1" />Back
          </Button>
        </div>
        <Card className="rounded-xl border-red-200">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-10 w-10 mx-auto text-red-400 mb-3" />
            <p className="text-red-600 text-sm">Failed to load schedule details.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stConfig = STATUS_CONFIG[schedule.status] || STATUS_CONFIG.draft

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => navigate('schedule-list')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-bold tracking-tight">{schedule.name}</h1>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground ml-9">
              <span className="font-mono">{schedule.scheduleNo}</span>
              <span>·</span>
              <span>{schedule.projectName} ({schedule.projectCode})</span>
              <span>·</span>
              <Badge variant="outline" className={cn('text-[10px] font-medium', stConfig.className)}>{stConfig.label}</Badge>
              <span>·</span>
              <span>V{schedule.version}.{schedule.revision}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info('Snapshot saved!')}>
            <Camera className="h-4 w-4 mr-1" />Snapshot
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.info('Export started...')}>
            <Download className="h-4 w-4 mr-1" />Export
          </Button>
          <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setActiveTab('gantt')}>
            <Pencil className="h-4 w-4 mr-1" />Edit Schedule
          </Button>
        </div>
      </div>

      {/* ─── KPI Summary Row ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-xl p-3.5 border">
          <CardContent className="p-0">
            <div className="flex items-start justify-between">
              <div className="rounded-lg bg-emerald-100 p-2"><Target className="h-4 w-4 text-emerald-600" /></div>
            </div>
            <div className="mt-2">
              <p className="text-xl font-semibold">{Math.round(schedule.completionPct)}%</p>
              <p className="text-xs text-muted-foreground">Overall Completion</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl p-3.5 border">
          <CardContent className="p-0">
            <div className="flex items-start justify-between">
              <div className="rounded-lg bg-amber-100 p-2"><HeartPulse className="h-4 w-4 text-amber-600" /></div>
            </div>
            <div className="mt-2">
              <p className="text-xl font-semibold">{Math.round(schedule.healthScore)}</p>
              <p className="text-xs text-muted-foreground">Health Score</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl p-3.5 border">
          <CardContent className="p-0">
            <div className="flex items-start justify-between">
              <div className="rounded-lg bg-teal-100 p-2"><Activity className="h-4 w-4 text-teal-600" /></div>
            </div>
            <div className="mt-2">
              <p className="text-xl font-semibold">{schedule.totalActivities}</p>
              <p className="text-xs text-muted-foreground">Total Activities</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl p-3.5 border">
          <CardContent className="p-0">
            <div className="flex items-start justify-between">
              <div className="rounded-lg bg-orange-100 p-2"><TimerReset className="h-4 w-4 text-orange-600" /></div>
            </div>
            <div className="mt-2">
              <p className="text-xl font-semibold">{schedule.totalDuration}d</p>
              <p className="text-xs text-muted-foreground">Total Duration</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Tabs ─── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto bg-muted/50 p-1 h-auto flex-wrap gap-1 rounded-lg">
          <TabsTrigger value="overview" className="text-xs px-3">Overview</TabsTrigger>
          <TabsTrigger value="gantt" className="text-xs px-3">
            <CalendarClock className="h-3.5 w-3.5 mr-1" />Gantt View
          </TabsTrigger>
          <TabsTrigger value="activities" className="text-xs px-3">Activities</TabsTrigger>
          <TabsTrigger value="milestones" className="text-xs px-3">Milestones</TabsTrigger>
          <TabsTrigger value="dependencies" className="text-xs px-3">Dependencies</TabsTrigger>
          <TabsTrigger value="resources" className="text-xs px-3">Resources</TabsTrigger>
          <TabsTrigger value="delays" className="text-xs px-3">Delays</TabsTrigger>
          <TabsTrigger value="calendars" className="text-xs px-3">Calendars</TabsTrigger>
          <TabsTrigger value="snapshots" className="text-xs px-3">Snapshots</TabsTrigger>
          <TabsTrigger value="comments" className="text-xs px-3">Comments</TabsTrigger>
          <TabsTrigger value="reports" className="text-xs px-3">Reports</TabsTrigger>
        </TabsList>

        {/* ─── Overview Tab ─── */}
        <TabsContent value="overview" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Schedule Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <InfoItem label="Schedule No." value={schedule.scheduleNo} />
                  <InfoItem label="Type" value={schedule.scheduleType.charAt(0).toUpperCase() + schedule.scheduleType.slice(1)} />
                  <InfoItem label="Status" value={stConfig.label} />
                  <InfoItem label="Version" value={`V${schedule.version}.${schedule.revision}`} />
                  <InfoItem label="Start Date" value={formatDate(schedule.startDate)} />
                  <InfoItem label="End Date" value={formatDate(schedule.endDate)} />
                  <InfoItem label="Duration" value={`${schedule.totalDuration} days`} />
                  <InfoItem label="Activities" value={String(schedule.totalActivities)} />
                </div>
                {schedule.description && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{schedule.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Health Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className={cn('rounded-full p-4', getHealthColor(schedule.healthScore).split(' ')[1])}>
                    <span className={cn('text-3xl font-bold', getHealthColor(schedule.healthScore).split(' ')[0])}>
                      {Math.round(schedule.healthScore)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Completion</span>
                    <span className="font-medium">{Math.round(schedule.completionPct)}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        schedule.completionPct >= 80 ? 'bg-emerald-500' : schedule.completionPct >= 50 ? 'bg-amber-500' : 'bg-red-500'
                      )}
                      style={{ width: `${schedule.completionPct}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-2 border-t">
                  <MiniStat label="On Track" value={activities.filter(a => a.status === 'in_progress' && !a.isOnCriticalPath).length} color="text-emerald-600" />
                  <MiniStat label="Delayed" value={activities.filter(a => a.status === 'delayed').length} color="text-red-600" />
                  <MiniStat label="Critical" value={activities.filter(a => a.isOnCriticalPath).length} color="text-amber-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Gantt View Tab ─── */}
        <TabsContent value="gantt" className="mt-4">
          <ScheduleGanttChart
            activities={ganttActivities}
            dependencies={ganttDependencies}
            scheduleStartDate={schedule.startDate}
            scheduleEndDate={schedule.endDate}
            onActivityClick={(act) => toast.info(`Selected: ${act.name}`)}
          />
        </TabsContent>

        {/* ─── Activities Tab ─── */}
        <TabsContent value="activities" className="mt-4">
          <Card className="rounded-xl overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Activity List</CardTitle>
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                  <Plus className="h-4 w-4 mr-1" />Add Activity
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {activities.length === 0 ? (
                <EmptyState icon={CalendarClock} message="No activities defined yet" />
              ) : (
                <ScrollArea className="max-h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs font-semibold">ID</TableHead>
                        <TableHead className="text-xs font-semibold">Activity</TableHead>
                        <TableHead className="text-xs font-semibold hidden md:table-cell">Type</TableHead>
                        <TableHead className="text-xs font-semibold hidden sm:table-cell">Status</TableHead>
                        <TableHead className="text-xs font-semibold hidden lg:table-cell">Priority</TableHead>
                        <TableHead className="text-xs font-semibold hidden lg:table-cell">Start</TableHead>
                        <TableHead className="text-xs font-semibold hidden lg:table-cell">Finish</TableHead>
                        <TableHead className="text-xs font-semibold">Progress</TableHead>
                        <TableHead className="text-xs font-semibold hidden md:table-cell">Critical</TableHead>
                        <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activities.map((act) => {
                        const asConfig = ACTIVITY_STATUS_CONFIG[act.status] || ACTIVITY_STATUS_CONFIG.not_started
                        const prConfig = PRIORITY_CONFIG[act.priority] || PRIORITY_CONFIG.medium
                        const ttConfig = TASK_TYPE_CONFIG[act.taskType] || TASK_TYPE_CONFIG.task
                        return (
                          <TableRow key={act.id} className="hover:bg-muted/50">
                            <TableCell className="text-[10px] font-mono text-muted-foreground">{act.activityId}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {act.parentId && <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
                                <span className="text-sm font-medium">{act.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge variant="outline" className={cn('text-[10px]', ttConfig.className)}>{ttConfig.label}</Badge>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge variant="outline" className={cn('text-[10px]', asConfig.className)}>{asConfig.label}</Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <Badge variant="outline" className={cn('text-[10px]', prConfig.className)}>{prConfig.label}</Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{formatDate(act.startDate)}</TableCell>
                            <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{formatDate(act.finishDate)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 min-w-[70px]">
                                <div className="h-1.5 flex-1 bg-secondary rounded-full overflow-hidden">
                                  <div
                                    className={cn(
                                      'h-full rounded-full',
                                      act.progress >= 80 ? 'bg-emerald-500' : act.progress >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                    )}
                                    style={{ width: `${act.progress}%` }}
                                  />
                                </div>
                                <span className="text-[10px] font-medium w-8 text-right">{Math.round(act.progress)}%</span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {act.isOnCriticalPath && (
                                <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700">CP</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Pencil className="h-3 w-3" /></Button>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500"><Trash2 className="h-3 w-3" /></Button>
                              </div>
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
        </TabsContent>

        {/* ─── Milestones Tab ─── */}
        <TabsContent value="milestones" className="mt-4">
          <Card className="rounded-xl overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Milestones</CardTitle>
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                  <Plus className="h-4 w-4 mr-1" />Add Milestone
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {milestones.length === 0 ? (
                <EmptyState icon={Diamond} message="No milestones defined yet" />
              ) : (
                <ScrollArea className="max-h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs font-semibold">Milestone</TableHead>
                        <TableHead className="text-xs font-semibold hidden md:table-cell">Type</TableHead>
                        <TableHead className="text-xs font-semibold">Date</TableHead>
                        <TableHead className="text-xs font-semibold">Status</TableHead>
                        <TableHead className="text-xs font-semibold hidden lg:table-cell">Weight</TableHead>
                        <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {milestones.map((ms) => {
                        const msConfig = MILESTONE_STATUS_CONFIG[ms.status] || MILESTONE_STATUS_CONFIG.pending
                        return (
                          <TableRow key={ms.id} className="hover:bg-muted/50">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Diamond className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                                <span className="text-sm font-medium">{ms.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge variant="outline" className="text-[10px] bg-gray-100 text-gray-700">{ms.type.replace(/_/g, ' ')}</Badge>
                            </TableCell>
                            <TableCell className="text-xs">{formatDate(ms.date)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cn('text-[10px]', msConfig.className)}>{msConfig.label}</Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-xs">{ms.weight}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Pencil className="h-3 w-3" /></Button>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500"><Trash2 className="h-3 w-3" /></Button>
                              </div>
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
        </TabsContent>

        {/* ─── Dependencies Tab ─── */}
        <TabsContent value="dependencies" className="mt-4">
          <Card className="rounded-xl overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Dependencies</CardTitle>
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                  <Plus className="h-4 w-4 mr-1" />Add Dependency
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {dependencies.length === 0 ? (
                <EmptyState icon={Link2} message="No dependencies defined yet" />
              ) : (
                <ScrollArea className="max-h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs font-semibold">Predecessor</TableHead>
                        <TableHead className="text-xs font-semibold">Type</TableHead>
                        <TableHead className="text-xs font-semibold">Successor</TableHead>
                        <TableHead className="text-xs font-semibold hidden md:table-cell">Lag (days)</TableHead>
                        <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dependencies.map((dep) => {
                        const dtConfig = DEP_TYPE_CONFIG[dep.depType] || DEP_TYPE_CONFIG.FS
                        return (
                          <TableRow key={dep.id} className="hover:bg-muted/50">
                            <TableCell className="text-sm">{dep.predecessorName}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cn('text-[10px] font-bold', dtConfig.className)}>{dtConfig.label}</Badge>
                            </TableCell>
                            <TableCell className="text-sm">{dep.successorName}</TableCell>
                            <TableCell className="hidden md:table-cell text-xs">{dep.lagDays}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500">
                                <Trash2 className="h-3 w-3" />
                              </Button>
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
        </TabsContent>

        {/* ─── Resources Tab ─── */}
        <TabsContent value="resources" className="mt-4">
          <Card className="rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Resource Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState icon={Users} message="Resource assignments will appear here as activities are assigned resources" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Delays Tab ─── */}
        <TabsContent value="delays" className="mt-4">
          <Card className="rounded-xl overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Delay Tracking</CardTitle>
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                  <Plus className="h-4 w-4 mr-1" />Report Delay
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {delays.length === 0 ? (
                <EmptyState icon={CheckCircle2} message="No delays reported — schedule is on track!" />
              ) : (
                <ScrollArea className="max-h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs font-semibold">Delay</TableHead>
                        <TableHead className="text-xs font-semibold hidden md:table-cell">Activity</TableHead>
                        <TableHead className="text-xs font-semibold">Type</TableHead>
                        <TableHead className="text-xs font-semibold">Impact</TableHead>
                        <TableHead className="text-xs font-semibold">Status</TableHead>
                        <TableHead className="text-xs font-semibold hidden lg:table-cell">EOT</TableHead>
                        <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {delays.map((dl) => {
                        const dlConfig = DELAY_STATUS_CONFIG[dl.status] || DELAY_STATUS_CONFIG.open
                        return (
                          <TableRow key={dl.id} className="hover:bg-muted/50">
                            <TableCell>
                              <p className="text-sm font-medium">{dl.title}</p>
                              <p className="text-[10px] text-muted-foreground">{dl.reportedByName} · {formatDate(dl.createdAt)}</p>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{dl.activityName || '—'}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[10px] bg-gray-100 text-gray-700">
                                {dl.delayType.replace(/_/g, ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className={cn('text-sm font-medium', dl.impactDays > 7 ? 'text-red-600' : dl.impactDays > 3 ? 'text-amber-600' : 'text-foreground')}>
                                {dl.impactDays}d
                              </span>
                              <span className="text-[10px] text-muted-foreground ml-1">({dl.impactType})</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cn('text-[10px]', dlConfig.className)}>{dlConfig.label}</Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-xs">
                              {dl.eotRequested ? `${dl.eotDays}d EOT` : '—'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Pencil className="h-3 w-3" /></Button>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-emerald-500"><CheckCircle2 className="h-3 w-3" /></Button>
                              </div>
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
        </TabsContent>

        {/* ─── Calendars Tab ─── */}
        <TabsContent value="calendars" className="mt-4">
          <Card className="rounded-xl overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Working Calendars</CardTitle>
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                  <Plus className="h-4 w-4 mr-1" />Add Calendar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {calendars.length === 0 ? (
                <EmptyState icon={CalendarDays} message="No calendars configured — using default 5-day work week" />
              ) : (
                <ScrollArea className="max-h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs font-semibold">Calendar</TableHead>
                        <TableHead className="text-xs font-semibold">Type</TableHead>
                        <TableHead className="text-xs font-semibold hidden md:table-cell">Working Days</TableHead>
                        <TableHead className="text-xs font-semibold hidden md:table-cell">Hours/Day</TableHead>
                        <TableHead className="text-xs font-semibold">Default</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {calendars.map((cal) => (
                        <TableRow key={cal.id} className="hover:bg-muted/50">
                          <TableCell className="text-sm font-medium">{cal.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px] bg-gray-100 text-gray-700">{cal.calendarType}</Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{cal.workingDays}</TableCell>
                          <TableCell className="hidden md:table-cell text-xs">{cal.hoursPerDay}h</TableCell>
                          <TableCell>
                            {cal.isDefault && <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700">Default</Badge>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Snapshots Tab ─── */}
        <TabsContent value="snapshots" className="mt-4">
          <Card className="rounded-xl overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Revision History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {snapshots.length === 0 ? (
                <EmptyState icon={History} message="No snapshots taken yet" />
              ) : (
                <ScrollArea className="max-h-[400px]">
                  <div className="divide-y">
                    {snapshots.map((snap) => (
                      <div key={snap.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-gray-100 p-2">
                            <History className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{snap.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {format(parseISO(snap.takenAt), 'dd MMM yyyy HH:mm')} · by {snap.takenByName}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] bg-gray-100 text-gray-700">{snap.snapshotType}</Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Comments Tab ─── */}
        <TabsContent value="comments" className="mt-4">
          <Card className="rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Activity Comments</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">No comments yet</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[500px]">
                  <div className="divide-y">
                    {comments.map((cmt) => (
                      <div key={cmt.id} className="px-4 py-3 hover:bg-muted/50">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">{cmt.createdByName}</span>
                              {cmt.activityName && (
                                <span> on <span className="font-medium">{cmt.activityName}</span></span>
                              )}
                              <span className="ml-2">{format(parseISO(cmt.createdAt), 'dd MMM yyyy HH:mm')}</span>
                            </p>
                            <p className="text-sm mt-1">{cmt.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Reports Tab ─── */}
        <TabsContent value="reports" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ReportCard
              icon={FileText}
              title="Schedule Summary"
              description="Comprehensive overview with activities, milestones, and critical path analysis"
              onClick={() => toast.info('Generating Schedule Summary report...')}
            />
            <ReportCard
              icon={BarChart3}
              title="Progress Report"
              description="Detailed progress tracking with planned vs actual comparison"
              onClick={() => toast.info('Generating Progress report...')}
            />
            <ReportCard
              icon={Clock}
              title="Delay Analysis"
              description="Impact analysis of all delays with EOT implications"
              onClick={() => toast.info('Generating Delay Analysis report...')}
            />
            <ReportCard
              icon={Link2}
              title="Dependency Report"
              description="Full dependency network with critical path highlighting"
              onClick={() => toast.info('Generating Dependency report...')}
            />
            <ReportCard
              icon={Target}
              title="Milestone Report"
              description="Milestone tracking with planned vs actual dates"
              onClick={() => toast.info('Generating Milestone report...')}
            />
            <ReportCard
              icon={Download}
              title="Export to PDF"
              description="Export the full schedule to PDF format"
              onClick={() => toast.info('Exporting to PDF...')}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─── Sub-components ───
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || '—'}</p>
    </div>
  )
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <p className={cn('text-lg font-semibold', color)}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  )
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Icon className="h-10 w-10 text-muted-foreground/40 mb-3" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

function ReportCard({ icon: Icon, title, description, onClick }: {
  icon: React.ElementType
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <Card className="rounded-xl p-4 border hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-0">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-amber-100 p-2 flex-shrink-0">
            <Icon className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold">{title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
