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
import { Progress } from '@/components/ui/progress'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  CalendarClock,
  AlertTriangle,
  Eye,
  Pencil,
  Trash2,
  Send,
  Archive,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  FolderKanban,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'

// ─── Types ───
interface Schedule {
  id: string
  scheduleNo: string
  name: string
  projectId: string
  projectName: string
  projectCode: string
  scheduleType: string
  status: string
  startDate: string | null
  endDate: string | null
  totalDuration: number
  totalActivities: number
  completionPct: number
  healthScore: number
  version: number
  revision: number
  description: string | null
  createdAt: string
}

interface ProjectOption {
  id: string
  name: string
  code: string
}

interface ScheduleListResponse {
  schedules: Schedule[]
  total: number
  page: number
  pageSize: number
}

// ─── Constants ───
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  published: { label: 'Published', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  active: { label: 'Active', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  archived: { label: 'Archived', className: 'bg-gray-100 text-gray-500 border-gray-200' },
}

const TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  master: { label: 'Master', className: 'bg-amber-50 text-amber-700' },
  lookahead: { label: 'Lookahead', className: 'bg-teal-50 text-teal-700' },
  baseline: { label: 'Baseline', className: 'bg-gray-100 text-gray-700' },
  revision: { label: 'Revision', className: 'bg-orange-50 text-orange-700' },
}

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
]

const PAGE_SIZE = 12

// ─── Helpers ───
function getHealthColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 60) return 'bg-amber-500'
  if (score >= 40) return 'bg-orange-500'
  return 'bg-red-500'
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return format(parseISO(dateStr), 'dd MMM yyyy')
}

// ─── Create Schedule Dialog ───
function CreateScheduleDialog({ projects }: { projects: ProjectOption[] }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    projectId: '',
    scheduleType: 'master',
    description: '',
    startDate: '',
    endDate: '',
  })
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/api/schedules', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduleList })
      toast.success('Schedule created successfully!')
      setOpen(false)
      setForm({ name: '', projectId: '', scheduleType: 'master', description: '', startDate: '', endDate: '' })
    },
    onError: () => toast.error('Failed to create schedule'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.projectId) {
      toast.error('Name and project are required')
      return
    }
    createMutation.mutate({
      name: form.name.trim(),
      projectId: form.projectId,
      scheduleType: form.scheduleType,
      description: form.description.trim() || null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button className="bg-amber-600 hover:bg-amber-700 text-white" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />Create Schedule
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Schedule</DialogTitle>
          <DialogDescription>Set up a new construction schedule for your project.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sch-name">Schedule Name *</Label>
            <Input
              id="sch-name"
              placeholder="e.g. Tower A Construction Schedule"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sch-project">Project *</Label>
            <Select value={form.projectId} onValueChange={(v) => setForm({ ...form, projectId: v })}>
              <SelectTrigger><SelectValue placeholder="Select project..." /></SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name} ({p.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sch-type">Schedule Type</Label>
              <Select value={form.scheduleType} onValueChange={(v) => setForm({ ...form, scheduleType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="master">Master</SelectItem>
                  <SelectItem value="lookahead">Lookahead</SelectItem>
                  <SelectItem value="baseline">Baseline</SelectItem>
                  <SelectItem value="revision">Revision</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sch-desc">Description</Label>
            <Textarea
              id="sch-desc"
              placeholder="Optional description..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sch-start">Start Date</Label>
              <Input id="sch-start" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sch-end">End Date</Label>
              <Input id="sch-end" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Schedule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Schedule Card View ───
function ScheduleCard({ schedule, onView, onEdit, onDelete, onPublish, onArchive }: {
  schedule: Schedule
  onView: () => void
  onEdit: () => void
  onDelete: () => void
  onPublish: () => void
  onArchive: () => void
}) {
  const stConfig = STATUS_CONFIG[schedule.status] || STATUS_CONFIG.draft
  const tpConfig = TYPE_CONFIG[schedule.scheduleType] || TYPE_CONFIG.master

  return (
    <Card className="rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer border">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="rounded-lg bg-amber-100 p-1.5 flex-shrink-0">
            <FolderKanban className="h-4 w-4 text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{schedule.name}</p>
            <p className="text-[10px] text-muted-foreground font-mono">{schedule.scheduleNo}</p>
          </div>
        </div>
        <Badge variant="outline" className={cn('text-[10px] font-medium flex-shrink-0', stConfig.className)}>
          {stConfig.label}
        </Badge>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Project</span>
          <span className="font-medium truncate max-w-[140px]">{schedule.projectName}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Type</span>
          <Badge variant="outline" className={cn('text-[10px]', tpConfig.className)}>{tpConfig.label}</Badge>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Activities</span>
          <span className="font-medium">{schedule.totalActivities}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Duration</span>
          <span className="font-medium">{schedule.totalDuration} days</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Date Range</span>
          <span className="font-medium text-[10px]">{formatDate(schedule.startDate)} — {formatDate(schedule.endDate)}</span>
        </div>
      </div>

      {/* Health Score */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">Health Score</span>
          <span className="font-medium">{Math.round(schedule.healthScore)}%</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div className={cn('h-full rounded-full transition-all', getHealthColor(schedule.healthScore))} style={{ width: `${schedule.healthScore}%` }} />
        </div>
      </div>

      {/* Completion */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">Completion</span>
          <span className="font-medium">{Math.round(schedule.completionPct)}%</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              schedule.completionPct >= 80 ? 'bg-emerald-500' : schedule.completionPct >= 50 ? 'bg-amber-500' : 'bg-red-500'
            )}
            style={{ width: `${schedule.completionPct}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 pt-2 border-t">
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onView}>
          <Eye className="h-3.5 w-3.5 mr-1" />View
        </Button>
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5 mr-1" />Edit
        </Button>
        {(schedule.status === 'draft' || schedule.status === 'published') && (
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onPublish}>
            <Send className="h-3.5 w-3.5 mr-1" />Publish
          </Button>
        )}
        {(schedule.status === 'active' || schedule.status === 'published') && (
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onArchive}>
            <Archive className="h-3.5 w-3.5 mr-1" />
          </Button>
        )}
        <Button variant="ghost" size="sm" className="h-7 text-xs text-red-500 hover:text-red-700 ml-auto" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  )
}

// ─── Main Component ───
export function ScheduleListPage() {
  const { navigate } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const queryClient = useQueryClient()

  // Fetch schedules
  const { data, isLoading } = useQuery({
    queryKey: [...queryKeys.scheduleList, { search: searchQuery, status: statusFilter, type: typeFilter, project: projectFilter, page }],
    queryFn: () => {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (typeFilter !== 'all') params.set('type', typeFilter)
      if (projectFilter !== 'all') params.set('project', projectFilter)
      params.set('page', String(page))
      params.set('pageSize', String(PAGE_SIZE))
      return api.get<ScheduleListResponse>(`/api/schedules?${params.toString()}`).then((r) => r.data!)
    },
  })

  // Fetch projects for dropdowns
  const { data: projectsData } = useQuery({
    queryKey: ['projects-list-for-schedules'],
    queryFn: () => api.get<ProjectOption[]>('/api/projects?select=id,name,code').then((r) => r.data || []),
  })

  const schedules = data?.schedules || []
  const totalSchedules = data?.total || 0
  const totalPages = Math.ceil(totalSchedules / PAGE_SIZE)
  const projects = projectsData || []

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/api/schedules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduleList })
      toast.success('Schedule deleted')
      setDeleteId(null)
    },
    onError: () => toast.error('Failed to delete schedule'),
  })

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: (id: string) => api.put(`/api/schedules/${id}`, { status: 'published' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduleList })
      toast.success('Schedule published')
    },
    onError: () => toast.error('Failed to publish schedule'),
  })

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: (id: string) => api.put(`/api/schedules/${id}`, { status: 'archived' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduleList })
      toast.success('Schedule archived')
    },
    onError: () => toast.error('Failed to archive schedule'),
  })

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Schedules</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? 'Loading...' : `${totalSchedules} schedule${totalSchedules !== 1 ? 's' : ''}`}
          </p>
        </div>
        <CreateScheduleDialog projects={projects} />
      </div>

      {/* ─── Toolbar ─── */}
      <div className="space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1 overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setStatusFilter(tab.value); setPage(1) }}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap',
                statusFilter === tab.value ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or schedule no..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
              className="pl-9"
            />
          </div>
          <Select value={projectFilter} onValueChange={(v) => { setProjectFilter(v); setPage(1) }}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name} ({p.code})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1) }}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="master">Master</SelectItem>
              <SelectItem value="lookahead">Lookahead</SelectItem>
              <SelectItem value="baseline">Baseline</SelectItem>
              <SelectItem value="revision">Revision</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode('card')}
              className={cn('p-1.5 rounded-md transition-colors', viewMode === 'card' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground')}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn('p-1.5 rounded-md transition-colors', viewMode === 'table' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground')}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Content ─── */}
      {isLoading ? (
        <div className={cn('grid gap-4', viewMode === 'card' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : '')}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : schedules.length === 0 ? (
        <Card className="rounded-xl">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CalendarClock className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg text-muted-foreground">No Schedules Found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters.'
                : 'Create your first construction schedule.'}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'card' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {schedules.map((schedule) => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                onView={() => navigate('schedule-detail', { id: schedule.id })}
                onEdit={() => navigate('schedule-detail', { id: schedule.id })}
                onDelete={() => setDeleteId(schedule.id)}
                onPublish={() => publishMutation.mutate(schedule.id)}
                onArchive={() => archiveMutation.mutate(schedule.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing {((page - 1) * PAGE_SIZE) + 1} to {Math.min(page * PAGE_SIZE, totalSchedules)} of {totalSchedules}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = page <= 3 ? i + 1 : page + i - 2
                  if (pageNum > totalPages || pageNum < 1) return null
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'default' : 'outline'}
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <Card className="rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs font-semibold">Schedule</TableHead>
                  <TableHead className="text-xs font-semibold hidden md:table-cell">Project</TableHead>
                  <TableHead className="text-xs font-semibold hidden sm:table-cell">Type</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-xs font-semibold hidden lg:table-cell">Health</TableHead>
                  <TableHead className="text-xs font-semibold">Completion</TableHead>
                  <TableHead className="text-xs font-semibold hidden lg:table-cell">Activities</TableHead>
                  <TableHead className="text-xs font-semibold hidden xl:table-cell">Date Range</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => {
                  const stConfig = STATUS_CONFIG[schedule.status] || STATUS_CONFIG.draft
                  const tpConfig = TYPE_CONFIG[schedule.scheduleType] || TYPE_CONFIG.master
                  return (
                    <TableRow key={schedule.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{schedule.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{schedule.scheduleNo}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {schedule.projectName}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className={cn('text-[10px]', tpConfig.className)}>{tpConfig.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('text-[10px] font-medium', stConfig.className)}>{stConfig.label}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 bg-secondary rounded-full overflow-hidden">
                            <div className={cn('h-full rounded-full', getHealthColor(schedule.healthScore))} style={{ width: `${schedule.healthScore}%` }} />
                          </div>
                          <span className="text-xs font-medium">{Math.round(schedule.healthScore)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 bg-secondary rounded-full overflow-hidden">
                            <div className={cn('h-full rounded-full', schedule.completionPct >= 80 ? 'bg-emerald-500' : schedule.completionPct >= 50 ? 'bg-amber-500' : 'bg-red-500')} style={{ width: `${schedule.completionPct}%` }} />
                          </div>
                          <span className="text-xs font-medium">{Math.round(schedule.completionPct)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">{schedule.totalActivities}</TableCell>
                      <TableCell className="hidden xl:table-cell text-xs text-muted-foreground">
                        {formatDate(schedule.startDate)} — {formatDate(schedule.endDate)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => navigate('schedule-detail', { id: schedule.id })}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => navigate('schedule-detail', { id: schedule.id })}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-700" onClick={() => setDeleteId(schedule.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing {((page - 1) * PAGE_SIZE) + 1} to {Math.min(page * PAGE_SIZE, totalSchedules)} of {totalSchedules}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = page <= 3 ? i + 1 : page + i - 2
                  if (pageNum > totalPages || pageNum < 1) return null
                  return (
                    <Button key={pageNum} variant={page === pageNum ? 'default' : 'outline'} size="sm" className="w-8 h-8 p-0" onClick={() => setPage(pageNum)}>
                      {pageNum}
                    </Button>
                  )
                })}
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this schedule? This action cannot be undone. All associated activities, milestones, and dependencies will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
