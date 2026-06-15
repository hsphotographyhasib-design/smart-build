'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppStore, api, queryKeys } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  FolderKanban,
  Calendar,
  DollarSign,
  Users,
  LayoutGrid,
  List,
  ChevronRight,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

// ──────────────────────────────────────────
// প্রকারভেদ
// ──────────────────────────────────────────

interface Project {
  id: string
  name: string
  code: string
  status: string
  progress: number
  budget: number
  startDate: string | null
  endDate: string | null
  address: string | null
  description: string | null
  createdAt: string
  updatedAt: string
  memberCount: number
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  documentCount: number
  dailyNoteCount: number
}

// ──────────────────────────────────────────
// সহায়ক ফাংশনসমূহ
// ──────────────────────────────────────────

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
  planning: { label: 'Planning', variant: 'outline', className: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800' },
  active: { label: 'Active', variant: 'default', className: 'bg-emerald-600 text-white hover:bg-emerald-700 border-0' },
  on_hold: { label: 'On Hold', variant: 'secondary', className: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800' },
  completed: { label: 'Completed', variant: 'default', className: 'bg-teal-600 text-white hover:bg-teal-700 border-0' },
  cancelled: { label: 'Cancelled', variant: 'destructive', className: '' },
}

function getStatusBadge(status: string) {
  const config = statusConfig[status] || statusConfig.planning
  return (
    <Badge variant={config.variant} className={cn('font-medium text-xs', config.className)}>
      {config.label}
    </Badge>
  )
}

function getProgressColor(progress: number) {
  if (progress >= 80) return 'bg-emerald-600'
  if (progress >= 50) return 'bg-amber-500'
  if (progress >= 25) return 'bg-orange-500'
  return 'bg-red-500'
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return format(parseISO(dateStr), 'dd MMM yyyy')
}

// ──────────────────────────────────────────
// স্কেলেটন লোডারসমূহ
// ──────────────────────────────────────────

function CardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-3 w-24 mb-4" />
        <div className="space-y-2 mb-4">
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-2 w-3/4" />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
      </CardContent>
    </Card>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-2 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────
// নতুন প্রকল্প ডায়ালগ
// ──────────────────────────────────────────

function NewProjectDialog() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    status: 'planning',
    budget: '',
    startDate: '',
    endDate: '',
    address: '',
  })
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/api/projects', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects })
      toast.success('Project created successfully!')
      setOpen(false)
      setForm({ name: '', code: '', description: '', status: 'planning', budget: '', startDate: '', endDate: '', address: '' })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create project')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.code.trim()) {
      toast.error('Project name and code are required')
      return
    }
    createMutation.mutate({
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || null,
      status: form.status,
      budget: parseFloat(form.budget) || 0,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      address: form.address.trim() || null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-amber-600 hover:bg-amber-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Sunshine Tower"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Project Code *</Label>
              <Input
                id="code"
                placeholder="e.g. PRJ-001"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="uppercase"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Project description..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Budget (₹)</Label>
              <Input
                id="budget"
                type="number"
                placeholder="0"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Site Address</Label>
            <Input
              id="address"
              placeholder="Construction site address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-amber-600 hover:bg-amber-700 text-white"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ──────────────────────────────────────────
// প্রকল্প কার্ড
// ──────────────────────────────────────────

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const daysLeft = project.endDate
    ? Math.ceil((parseISO(project.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-md hover:border-amber-200 transition-all duration-200 group"
      onClick={onClick}
    >
      <CardContent className="p-5">
        {/* হেডার */}
        <div className="flex items-start justify-between mb-1">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm truncate group-hover:text-amber-700 transition-colors">
              {project.name}
            </h3>
            <p className="text-xs text-muted-foreground font-mono">{project.code}</p>
          </div>
          <div className="ml-2 flex-shrink-0">{getStatusBadge(project.status)}</div>
        </div>

        {/* অগ্রগতি */}
        <div className="mt-3 mb-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold text-foreground">{Math.round(project.progress)}%</span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn('h-full rounded-full transition-all duration-500', getProgressColor(project.progress))}
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* মেটাডেটা */}
        <Separator className="my-3" />
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5" />
            <span className="truncate">{formatCurrency(project.budget)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>{project.memberCount} member{project.memberCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FolderKanban className="h-3.5 w-3.5" />
            <span>{project.completedTasks}/{project.totalTasks} tasks</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {daysLeft !== null
                ? daysLeft > 0
                  ? `${daysLeft}d left`
                  : daysLeft === 0
                    ? 'Due today'
                    : `${Math.abs(daysLeft)}d overdue`
                : 'No deadline'}
            </span>
          </div>
        </div>

        {/* শেভরন */}
        <div className="mt-3 flex justify-end">
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
        </div>
      </CardContent>
    </Card>
  )
}

// ──────────────────────────────────────────
// প্রধান উপাদান
// ──────────────────────────────────────────

export function ProjectsPage() {
  const { navigate } = useAppStore()
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const { data: projects, isLoading, error } = useQuery({
    queryKey: [...queryKeys.projects, { search: searchQuery, status: statusFilter }],
    queryFn: () => {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      const qs = params.toString()
      return api.get(`/api/projects${qs ? `?${qs}` : ''}`).then((r) => r.data as Project[])
    },
  })

  // ফিল্টার ব্যাজের জন্য স্ট্যাটাস অনুযায়ী গণনা
  const statusCounts = useMemo(() => {
    if (!projects) return {}
    const counts: Record<string, number> = {}
    for (const p of projects) {
      counts[p.status] = (counts[p.status] || 0) + 1
    }
    return counts
  }, [projects])

  const handleProjectClick = (projectId: string) => {
    navigate('project-detail', { id: projectId })
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading
              ? 'Loading projects...'
              : projects
                ? `${projects.length} project${projects.length !== 1 ? 's' : ''} found`
                : 'No projects'}
          </p>
        </div>
        <NewProjectDialog />
      </div>

      {/* টুলবার */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* অনুসন্ধান */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects by name, code, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* স্ট্যাটাস ফিল্টার */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
            className={cn('text-xs', statusFilter === 'all' && 'bg-amber-600 hover:bg-amber-700 text-white')}
          >
            All
          </Button>
          {Object.entries(statusConfig).map(([key, config]) => (
            <Button
              key={key}
              variant={statusFilter === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(key)}
              className={cn(
                'text-xs',
                statusFilter === key && config.className
              )}
            >
              {config.label}
              {statusCounts[key] ? (
                <span className="ml-1.5 text-[10px] opacity-70">({statusCounts[key]})</span>
              ) : null}
            </Button>
          ))}
        </div>

        {/* দৃশ্য টগল */}
        <div className="flex items-center gap-1 border rounded-md p-0.5 ml-auto">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="h-7 w-7 p-0"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="h-7 w-7 p-0"
          >
            <List className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* বিষয়বস্তু */}
      {isLoading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <TableSkeleton />
            </CardContent>
          </Card>
        )
      ) : error ? (
        <Card className="border-red-200">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 text-sm">Failed to load projects. Please try again.</p>
          </CardContent>
        </Card>
      ) : projects && projects.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg text-muted-foreground">No Projects Found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first project.'}
            </p>
          </CardContent>
        </Card>
      ) : projects ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => handleProjectClick(project.id)}
              />
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Project</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Progress</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">Budget</TableHead>
                  <TableHead className="font-semibold hidden sm:table-cell">Tasks</TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell">Start Date</TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell">End Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow
                    key={project.id}
                    className="cursor-pointer hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors"
                    onClick={() => handleProjectClick(project.id)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{project.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{project.code}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(project.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <div className="relative h-2 w-16 overflow-hidden rounded-full bg-secondary">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              getProgressColor(project.progress)
                            )}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{Math.round(project.progress)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {formatCurrency(project.budget)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {project.completedTasks}/{project.totalTasks}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {formatDate(project.startDate)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {formatDate(project.endDate)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )
      ) : null}
    </div>
  )
}