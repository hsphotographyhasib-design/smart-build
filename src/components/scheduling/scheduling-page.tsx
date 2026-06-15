'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppStore, api, queryKeys } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  CalendarClock,
  AlertTriangle,
  FolderKanban,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────

interface SchedulingTask {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  progress: number
  startDate: string | null
  endDate: string | null
  project: { id: string; name: string; code: string } | null
  assignee: { id: string; name: string } | null
}

interface ProjectOption {
  id: string
  name: string
  code: string
}

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

const taskStatusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800' },
  in_progress: { label: 'In Progress', className: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800' },
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' },
  cancelled: { label: 'Cancelled', className: 'bg-muted text-muted-foreground' },
}

const priorityConfig: Record<string, { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-muted text-muted-foreground' },
  medium: { label: 'Medium', className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800' },
  high: { label: 'High', className: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800' },
  critical: { label: 'Critical', className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800' },
}

function getTaskStatusBadge(status: string) {
  const config = taskStatusConfig[status] || taskStatusConfig.pending
  return <Badge variant="outline" className={cn('font-medium text-xs', config.className)}>{config.label}</Badge>
}

function getPriorityBadge(priority: string) {
  const config = priorityConfig[priority] || priorityConfig.medium
  return <Badge variant="outline" className={cn('font-medium text-xs', config.className)}>{config.label}</Badge>
}

function getProgressColor(progress: number) {
  if (progress >= 80) return 'bg-emerald-600'
  if (progress >= 50) return 'bg-amber-500'
  if (progress >= 25) return 'bg-orange-500'
  return 'bg-red-500'
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return format(parseISO(dateStr), 'dd MMM yyyy')
}

// ──────────────────────────────────────────
// Skeleton Loader
// ──────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-2 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────
// Add Task Dialog
// ──────────────────────────────────────────

function AddTaskDialog({ projects }: { projects: ProjectOption[] }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    startDate: '',
    endDate: '',
    projectId: '',
  })
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/api/scheduling', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduling'] })
      toast.success('Task added to schedule!')
      setOpen(false)
      setForm({ title: '', description: '', status: 'pending', priority: 'medium', startDate: '', endDate: '', projectId: '' })
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to add task'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.projectId) {
      toast.error('Task title and project are required')
      return
    }
    createMutation.mutate({
      title: form.title.trim(),
      description: form.description.trim() || null,
      status: form.status,
      priority: form.priority,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      projectId: form.projectId,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />Add Task
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Add Task to Schedule</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sched-title">Title *</Label>
            <Input id="sched-title" placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sched-project">Project *</Label>
            <Select value={form.projectId} onValueChange={(v) => setForm({ ...form, projectId: v })}>
              <SelectTrigger><SelectValue placeholder="Select project..." /></SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name} ({p.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sched-desc">Description</Label>
            <Textarea id="sched-desc" placeholder="Task description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sched-status">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sched-priority">Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sched-start">Start Date</Label>
              <Input id="sched-start" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sched-end">End Date</Label>
              <Input id="sched-end" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Adding...' : 'Add Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ──────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────

export function SchedulingPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['scheduling', { search: searchQuery, status: statusFilter, priority: priorityFilter }],
    queryFn: () => {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      if (priorityFilter && priorityFilter !== 'all') params.set('priority', priorityFilter)
      const qs = params.toString()
      return api.get(`/api/scheduling${qs ? `?${qs}` : ''}`).then((r) => r.data as SchedulingTask[])
    },
  })

  // Derive unique projects from tasks
  const projectOptions = useMemo(() => {
    if (!tasks) return []
    const map = new Map<string, ProjectOption>()
    for (const t of tasks) {
      if (t.project) {
        map.set(t.project.id, { id: t.project.id, name: t.project.name, code: t.project.code })
      }
    }
    return Array.from(map.values())
  }, [tasks])

  // Group tasks by project
  const groupedTasks = useMemo(() => {
    if (!tasks) return {}
    const filtered = projectFilter === 'all' ? tasks : tasks.filter((t) => t.project?.id === projectFilter)
    const groups: Record<string, { project: ProjectOption; tasks: SchedulingTask[] }> = {}
    for (const t of filtered) {
      const key = t.project?.id || '__unassigned__'
      if (!groups[key]) {
        groups[key] = {
          project: t.project ? { id: t.project.id, name: t.project.name, code: t.project.code } : { id: '__unassigned__', name: 'Unassigned', code: '—' },
          tasks: [],
        }
      }
      groups[key].tasks.push(t)
    }
    return groups
  }, [tasks, projectFilter])

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Scheduling</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? 'Loading...' : tasks ? `${tasks.length} task${tasks.length !== 1 ? 's' : ''}` : 'No tasks'}
          </p>
        </div>
        <AddTaskDialog projects={projectOptions} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projectOptions.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name} ({p.code})</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="All Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <Card>
          <CardContent className="p-0">
            <TableSkeleton />
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-red-200">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-10 w-10 mx-auto text-red-400 mb-3" />
            <p className="text-red-600 text-sm">Failed to load scheduling data.</p>
          </CardContent>
        </Card>
      ) : tasks && tasks.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CalendarClock className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg text-muted-foreground">No Tasks Scheduled</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your filters.'
                : 'Add your first task to the schedule.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTasks).map(([key, group]) => (
            <Card key={key} className="overflow-hidden">
              <CardHeader className="pb-2 pt-4 px-5">
                <div className="flex items-center gap-2">
                  <FolderKanban className="h-4 w-4 text-amber-600" />
                  <CardTitle className="text-sm font-semibold">{group.project.name}</CardTitle>
                  <span className="text-xs text-muted-foreground font-mono">{group.project.code}</span>
                  <Badge variant="outline" className="text-xs ml-auto">{group.tasks.length} task{group.tasks.length !== 1 ? 's' : ''}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="max-h-96">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Task</TableHead>
                        <TableHead className="font-semibold hidden sm:table-cell">Status</TableHead>
                        <TableHead className="font-semibold hidden md:table-cell">Priority</TableHead>
                        <TableHead className="font-semibold hidden lg:table-cell">Start</TableHead>
                        <TableHead className="font-semibold hidden lg:table-cell">End</TableHead>
                        <TableHead className="font-semibold">Progress</TableHead>
                        <TableHead className="font-semibold hidden md:table-cell">Assignee</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.tasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{task.title}</p>
                              {task.description && <p className="text-xs text-muted-foreground truncate max-w-[250px]">{task.description}</p>}
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">{getTaskStatusBadge(task.status)}</TableCell>
                          <TableCell className="hidden md:table-cell">{getPriorityBadge(task.priority)}</TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{formatDate(task.startDate)}</TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{formatDate(task.endDate)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 min-w-[80px]">
                              <div className="relative h-2 w-16 overflow-hidden rounded-full bg-secondary">
                                <div
                                  className={cn('h-full rounded-full transition-all', getProgressColor(task.progress))}
                                  style={{ width: `${task.progress}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium">{Math.round(task.progress)}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{task.assignee?.name || '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}