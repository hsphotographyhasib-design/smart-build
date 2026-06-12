'use client'

import { useState, useEffect, useMemo } from 'react'
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
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  ArrowLeft,
  FolderKanban,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  FileText,
  AlertTriangle,
  Sun,
  CloudRain,
  Cloud,
  CloudSnow,
  Wind,
  ClipboardList,
  BarChart3,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────

interface ProjectDetail {
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
  clientName: string | null
  clientPhone: string | null
  createdAt: string
  updatedAt: string
  memberCount: number
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  pendingTasks: number
  documentCount: number
  dailyNoteCount: number
}

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  progress: number
  startDate: string | null
  endDate: string | null
  assignee: { id: string; name: string; avatarUrl?: string } | null
}

interface FinanceSummary {
  totalBudget: number
  totalInvoiced: number
  totalPaid: number
  totalExpense: number
  totalOutstanding: number
  invoices: Array<{
    id: string
    invoiceNo: string
    issueDate: string
    dueDate: string
    total: number
    paid: number
    status: string
  }>
  payments: Array<{
    id: string
    paymentNo: string
    amount: number
    method: string
    date: string
    status: string
  }>
  expenses: Array<{
    id: string
    description: string
    category: string
    amount: number
    date: string
  }>
}

interface Document {
  id: string
  name: string
  type: string
  fileSize: string | null
  uploadedBy: { name: string } | null
  createdAt: string
}

interface DailyNote {
  id: string
  date: string
  weather: string | null
  workDone: string | null
  issues: string | null
  labourCount: number | null
  createdAt: string
}

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
  planning: { label: 'Planning', variant: 'outline', className: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800' },
  active: { label: 'Active', variant: 'default', className: 'bg-emerald-600 text-white hover:bg-emerald-700 border-0' },
  on_hold: { label: 'On Hold', variant: 'secondary', className: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800' },
  completed: { label: 'Completed', variant: 'default', className: 'bg-teal-600 text-white hover:bg-teal-700 border-0' },
  cancelled: { label: 'Cancelled', variant: 'destructive', className: '' },
}

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

const financeStatusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-secondary text-secondary-foreground' },
  submitted: { label: 'Submitted', className: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800' },
  paid: { label: 'Paid', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' },
  overdue: { label: 'Overdue', className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800' },
  cancelled: { label: 'Cancelled', className: 'bg-muted text-muted-foreground' },
}

function getStatusBadge(status: string) {
  const config = statusConfig[status] || statusConfig.planning
  return <Badge variant={config.variant} className={cn('font-medium text-xs', config.className)}>{config.label}</Badge>
}

function getTaskStatusBadge(status: string) {
  const config = taskStatusConfig[status] || taskStatusConfig.pending
  return <Badge variant="outline" className={cn('font-medium text-xs', config.className)}>{config.label}</Badge>
}

function getPriorityBadge(priority: string) {
  const config = priorityConfig[priority] || priorityConfig.medium
  return <Badge variant="outline" className={cn('font-medium text-xs', config.className)}>{config.label}</Badge>
}

function getFinanceStatusBadge(status: string) {
  const config = financeStatusConfig[status] || financeStatusConfig.draft
  return <Badge variant="outline" className={cn('font-medium text-xs', config.className)}>{config.label}</Badge>
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

function getWeatherIcon(weather: string | null) {
  if (!weather) return <Cloud className="h-4 w-4 text-muted-foreground" />
  const w = weather.toLowerCase()
  if (w.includes('rain') || w.includes('storm')) return <CloudRain className="h-4 w-4 text-sky-500" />
  if (w.includes('snow')) return <CloudSnow className="h-4 w-4 text-sky-300" />
  if (w.includes('wind')) return <Wind className="h-4 w-4 text-muted-foreground" />
  if (w.includes('sunny') || w.includes('clear') || w.includes('hot')) return <Sun className="h-4 w-4 text-amber-500" />
  return <Cloud className="h-4 w-4 text-muted-foreground" />
}

// ──────────────────────────────────────────
// Skeleton Loaders
// ──────────────────────────────────────────

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-5">
          <Skeleton className="h-4 w-40 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────
// Add Task Dialog
// ──────────────────────────────────────────

function AddTaskDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    startDate: '',
    endDate: '',
  })
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post(`/api/projects/${projectId}/tasks`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) })
      toast.success('Task added successfully!')
      setOpen(false)
      setForm({ title: '', description: '', status: 'pending', priority: 'medium', startDate: '', endDate: '' })
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to add task'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('Task title is required'); return }
    createMutation.mutate({
      title: form.title.trim(),
      description: form.description.trim() || null,
      status: form.status,
      priority: form.priority,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />Add Task
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Add New Task</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Title *</Label>
            <Input id="task-title" placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea id="task-desc" placeholder="Task description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task-status">Status</Label>
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
              <Label htmlFor="task-priority">Priority</Label>
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
              <Label htmlFor="task-start">Start Date</Label>
              <Input id="task-start" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-end">End Date</Label>
              <Input id="task-end" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
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
// Add Document Dialog
// ──────────────────────────────────────────

function AddDocumentDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'drawing' })
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post(`/api/projects/${projectId}/documents`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) })
      toast.success('Document added successfully!')
      setOpen(false)
      setForm({ name: '', type: 'drawing' })
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to add document'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Document name is required'); return }
    createMutation.mutate({ name: form.name.trim(), type: form.type })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />Add Document
      </Button>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Add Document</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doc-name">Document Name *</Label>
            <Input id="doc-name" placeholder="e.g. Foundation Plan v2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="doc-type">Type</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="drawing">Drawing</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="report">Report</SelectItem>
                <SelectItem value="photo">Photo</SelectItem>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Adding...' : 'Add Document'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ──────────────────────────────────────────
// Add Daily Note Dialog
// ──────────────────────────────────────────

function AddDailyNoteDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    weather: '',
    workDone: '',
    issues: '',
    labourCount: '',
  })
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post(`/api/projects/${projectId}/daily-notes`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) })
      toast.success('Daily note added successfully!')
      setOpen(false)
      setForm({ date: format(new Date(), 'yyyy-MM-dd'), weather: '', workDone: '', issues: '', labourCount: '' })
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to add daily note'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.date) { toast.error('Date is required'); return }
    createMutation.mutate({
      date: form.date,
      weather: form.weather.trim() || null,
      workDone: form.workDone.trim() || null,
      issues: form.issues.trim() || null,
      labourCount: parseInt(form.labourCount) || null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />Add Note
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Add Daily Note</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="note-date">Date *</Label>
              <Input id="note-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note-weather">Weather</Label>
              <Select value={form.weather} onValueChange={(v) => setForm({ ...form, weather: v })}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sunny">Sunny</SelectItem>
                  <SelectItem value="cloudy">Cloudy</SelectItem>
                  <SelectItem value="rainy">Rainy</SelectItem>
                  <SelectItem value="windy">Windy</SelectItem>
                  <SelectItem value="stormy">Stormy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="note-work">Work Done</Label>
            <Textarea id="note-work" placeholder="Describe the work completed today..." value={form.workDone} onChange={(e) => setForm({ ...form, workDone: e.target.value })} rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note-issues">Issues / Remarks</Label>
            <Textarea id="note-issues" placeholder="Any issues, delays, or remarks..." value={form.issues} onChange={(e) => setForm({ ...form, issues: e.target.value })} rows={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note-labour">Labour Count</Label>
            <Input id="note-labour" type="number" placeholder="Number of workers on site" value={form.labourCount} onChange={(e) => setForm({ ...form, labourCount: e.target.value })} min="0" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving...' : 'Save Note'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ──────────────────────────────────────────
// Overview Tab
// ──────────────────────────────────────────

function OverviewTab({ project }: { project: ProjectDetail }) {
  const daysLeft = project.endDate
    ? Math.ceil((parseISO(project.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Budget</p>
                <p className="text-lg font-bold">{formatCurrency(project.budget)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tasks Done</p>
                <p className="text-lg font-bold">{project.completedTasks} <span className="text-sm font-normal text-muted-foreground">/ {project.totalTasks}</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-teal-100 dark:bg-teal-950 flex items-center justify-center">
                <Users className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Members</p>
                <p className="text-lg font-bold">{project.memberCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Days Left</p>
                <p className="text-lg font-bold">
                  {daysLeft !== null
                    ? daysLeft > 0 ? `${daysLeft}`
                      : daysLeft === 0 ? 'Today'
                        : `${Math.abs(daysLeft)} overdue`
                    : '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Overall Progress</h3>
            <span className="text-lg font-bold">{Math.round(project.progress)}%</span>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn('h-full rounded-full transition-all duration-500', getProgressColor(project.progress))}
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Completed: {project.completedTasks}</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> In Progress: {project.inProgressTasks}</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-muted-foreground" /> Pending: {project.pendingTasks}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Project Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {project.description && (
            <>
              <p className="text-sm text-muted-foreground">{project.description}</p>
              <Separator />
            </>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Project Code</span>
              <span className="font-mono font-medium">{project.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              {getStatusBadge(project.status)}
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Client</span>
              <span className="font-medium">{project.clientName || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Client Phone</span>
              <span className="font-medium">{project.clientPhone || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Start Date</span>
              <span className="font-medium">{formatDate(project.startDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">End Date</span>
              <span className="font-medium">{formatDate(project.endDate)}</span>
            </div>
          </div>
          {project.address && (
            <>
              <Separator />
              <div className="text-sm">
                <span className="text-muted-foreground">Site Address:</span>
                <p className="font-medium mt-0.5">{project.address}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ──────────────────────────────────────────
// Tasks Tab
// ──────────────────────────────────────────

function TasksTab({ projectId }: { projectId: string }) {
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: [queryKeys.project(projectId), 'tasks'],
    queryFn: () => api.get(`/api/projects/${projectId}/tasks`).then((r) => r.data as Task[]),
  })

  if (isLoading) return <Card><CardContent className="p-0"><TableSkeleton /></CardContent></Card>
  if (error) return <Card className="border-red-200"><CardContent className="p-8 text-center"><p className="text-red-600 text-sm">Failed to load tasks.</p></CardContent></Card>
  if (!tasks || tasks.length === 0) return (
    <Card>
      <CardContent className="p-12 text-center">
        <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
        <h3 className="font-semibold text-lg text-muted-foreground">No Tasks Yet</h3>
        <p className="text-sm text-muted-foreground mt-1">Add your first task to start tracking progress.</p>
      </CardContent>
    </Card>
  )

  return (
    <Card className="overflow-hidden">
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
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{task.title}</p>
                    {task.description && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{task.description}</p>}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{getTaskStatusBadge(task.status)}</TableCell>
                <TableCell className="hidden md:table-cell">{getPriorityBadge(task.priority)}</TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{formatDate(task.startDate)}</TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{formatDate(task.endDate)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 min-w-[80px]">
                    <div className="relative h-2 w-16 overflow-hidden rounded-full bg-secondary">
                      <div className={cn('h-full rounded-full transition-all', getProgressColor(task.progress))} style={{ width: `${task.progress}%` }} />
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
    </Card>
  )
}

// ──────────────────────────────────────────
// Finance Tab
// ──────────────────────────────────────────

function FinanceTab({ projectId }: { projectId: string }) {
  const { data: finance, isLoading, error } = useQuery({
    queryKey: [queryKeys.project(projectId), 'finance'],
    queryFn: () => api.get(`/api/projects/${projectId}/finance`).then((r) => r.data as FinanceSummary),
  })

  if (isLoading) return <OverviewSkeleton />
  if (error) return <Card className="border-red-200"><CardContent className="p-8 text-center"><p className="text-red-600 text-sm">Failed to load finance data.</p></CardContent></Card>
  if (!finance) return (
    <Card>
      <CardContent className="p-12 text-center">
        <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
        <h3 className="font-semibold text-lg text-muted-foreground">No Finance Data</h3>
        <p className="text-sm text-muted-foreground mt-1">Finance details will appear once invoices or expenses are recorded.</p>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Total Budget</p>
            <p className="text-lg font-bold mt-1">{formatCurrency(finance.totalBudget)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Total Invoiced</p>
            <p className="text-lg font-bold mt-1 text-emerald-600">{formatCurrency(finance.totalInvoiced)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Total Paid</p>
            <p className="text-lg font-bold mt-1 text-teal-600">{formatCurrency(finance.totalPaid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Outstanding</p>
            <p className={cn('text-lg font-bold mt-1', finance.totalOutstanding > 0 ? 'text-red-600' : 'text-emerald-600')}>{formatCurrency(finance.totalOutstanding)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Invoices</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {finance.invoices.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No invoices found.</div>
          ) : (
            <ScrollArea className="max-h-64">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Invoice No</TableHead>
                    <TableHead className="font-semibold hidden sm:table-cell">Issue Date</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell">Due Date</TableHead>
                    <TableHead className="font-semibold text-right">Total</TableHead>
                    <TableHead className="font-semibold text-right hidden sm:table-cell">Paid</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {finance.invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono text-sm">{inv.invoiceNo}</TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{formatDate(inv.issueDate)}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{formatDate(inv.dueDate)}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{formatCurrency(inv.total)}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground hidden sm:table-cell">{formatCurrency(inv.paid)}</TableCell>
                      <TableCell>{getFinanceStatusBadge(inv.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Payments */}
      {finance.payments.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-64">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Payment No</TableHead>
                    <TableHead className="font-semibold hidden sm:table-cell">Date</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell">Method</TableHead>
                    <TableHead className="font-semibold text-right">Amount</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {finance.payments.map((pay) => (
                    <TableRow key={pay.id}>
                      <TableCell className="font-mono text-sm">{pay.paymentNo}</TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{formatDate(pay.date)}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground capitalize">{pay.method}</TableCell>
                      <TableCell className="text-right text-sm font-medium text-emerald-600">{formatCurrency(pay.amount)}</TableCell>
                      <TableCell>{getFinanceStatusBadge(pay.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ──────────────────────────────────────────
// Documents Tab
// ──────────────────────────────────────────

function DocumentsTab({ projectId }: { projectId: string }) {
  const { data: documents, isLoading, error } = useQuery({
    queryKey: [queryKeys.project(projectId), 'documents'],
    queryFn: () => api.get(`/api/projects/${projectId}/documents`).then((r) => r.data as Document[]),
  })

  if (isLoading) return <Card><CardContent className="p-0"><TableSkeleton /></CardContent></Card>
  if (error) return <Card className="border-red-200"><CardContent className="p-8 text-center"><p className="text-red-600 text-sm">Failed to load documents.</p></CardContent></Card>
  if (!documents || documents.length === 0) return (
    <Card>
      <CardContent className="p-12 text-center">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
        <h3 className="font-semibold text-lg text-muted-foreground">No Documents</h3>
        <p className="text-sm text-muted-foreground mt-1">Upload your first document to this project.</p>
      </CardContent>
    </Card>
  )

  return (
    <Card className="overflow-hidden">
      <ScrollArea className="max-h-96">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Document</TableHead>
              <TableHead className="font-semibold hidden sm:table-cell">Type</TableHead>
              <TableHead className="font-semibold hidden md:table-cell">Size</TableHead>
              <TableHead className="font-semibold hidden md:table-cell">Uploaded By</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{doc.name}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="outline" className="text-xs capitalize">{doc.type}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{doc.fileSize || '—'}</TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{doc.uploadedBy?.name || '—'}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(doc.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  )
}

// ──────────────────────────────────────────
// Daily Notes Tab
// ──────────────────────────────────────────

function DailyNotesTab({ projectId }: { projectId: string }) {
  const { data: notes, isLoading, error } = useQuery({
    queryKey: [queryKeys.project(projectId), 'daily-notes'],
    queryFn: () => api.get(`/api/projects/${projectId}/daily-notes`).then((r) => r.data as DailyNote[]),
  })

  if (isLoading) return <Card><CardContent className="p-0"><TableSkeleton /></CardContent></Card>
  if (error) return <Card className="border-red-200"><CardContent className="p-8 text-center"><p className="text-red-600 text-sm">Failed to load daily notes.</p></CardContent></Card>
  if (!notes || notes.length === 0) return (
    <Card>
      <CardContent className="p-12 text-center">
        <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
        <h3 className="font-semibold text-lg text-muted-foreground">No Daily Notes</h3>
        <p className="text-sm text-muted-foreground mt-1">Start logging daily site activities.</p>
      </CardContent>
    </Card>
  )

  return (
    <Card className="overflow-hidden">
      <ScrollArea className="max-h-96">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Weather</TableHead>
              <TableHead className="font-semibold hidden md:table-cell">Work Done</TableHead>
              <TableHead className="font-semibold hidden lg:table-cell">Issues</TableHead>
              <TableHead className="font-semibold hidden sm:table-cell">Labour</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notes.map((note) => (
              <TableRow key={note.id}>
                <TableCell className="text-sm font-medium">{formatDate(note.date)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    {getWeatherIcon(note.weather)}
                    <span className="text-sm capitalize">{note.weather || '—'}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[200px] truncate">{note.workDone || '—'}</TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                  {note.issues ? (
                    <span className="flex items-center gap-1 text-red-600">
                      <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{note.issues}</span>
                    </span>
                  ) : '—'}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{note.labourCount ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  )
}

// ──────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────

export function ProjectDetailPage({ projectId, activeTab }: { projectId?: string; activeTab?: string }) {
  const { navigate, setBreadcrumbs } = useAppStore()
  const [tab, setTab] = useState(activeTab || 'overview')

  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
  } = useQuery({
    queryKey: queryKeys.project(projectId || ''),
    queryFn: () => api.get(`/api/projects/${projectId}`).then((r) => r.data as ProjectDetail),
    enabled: !!projectId,
  })

  // Set breadcrumbs
  useEffect(() => {
    if (projectId && project) {
      setBreadcrumbs([
        { label: 'Projects', page: 'projects' },
        { label: project.name, page: 'project-detail', params: { id: projectId } },
      ])
    } else {
      setBreadcrumbs([{ label: 'Project Details' }])
    }
  }, [projectId, project, setBreadcrumbs])

  // No project selected
  if (!projectId) {
    return (
      <div className="p-4 md:p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg text-muted-foreground">No Project Selected</h3>
            <p className="text-sm text-muted-foreground mt-1">Select a project from the Projects page to view its details.</p>
            <Button className="mt-4 bg-amber-600 hover:bg-amber-700 text-white" onClick={() => navigate('projects')}>
              Go to Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Loading
  if (projectLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-10 w-full" />
        <OverviewSkeleton />
      </div>
    )
  }

  // Error
  if (projectError || !project) {
    return (
      <div className="p-4 md:p-6">
        <Card className="border-red-200">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-10 w-10 mx-auto text-red-400 mb-3" />
            <p className="text-red-600 text-sm">Failed to load project details.</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('projects')}>Back to Projects</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Button variant="ghost" size="sm" className="self-start -ml-2" onClick={() => navigate('projects')}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight truncate">{project.name}</h1>
            {getStatusBadge(project.status)}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 font-mono">{project.code}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full sm:w-auto flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="tasks" className="text-xs sm:text-sm">
            Tasks <span className="ml-1 text-[10px] opacity-70">({project.totalTasks})</span>
          </TabsTrigger>
          <TabsTrigger value="finance" className="text-xs sm:text-sm">Finance</TabsTrigger>
          <TabsTrigger value="documents" className="text-xs sm:text-sm">
            Documents <span className="ml-1 text-[10px] opacity-70">({project.documentCount})</span>
          </TabsTrigger>
          <TabsTrigger value="daily-notes" className="text-xs sm:text-sm">
            Daily Notes <span className="ml-1 text-[10px] opacity-70">({project.dailyNoteCount})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab project={project} />
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <div className="flex justify-end mb-4">
            <AddTaskDialog projectId={projectId} />
          </div>
          <TasksTab projectId={projectId} />
        </TabsContent>

        <TabsContent value="finance" className="mt-4">
          <FinanceTab projectId={projectId} />
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <div className="flex justify-end mb-4">
            <AddDocumentDialog projectId={projectId} />
          </div>
          <DocumentsTab projectId={projectId} />
        </TabsContent>

        <TabsContent value="daily-notes" className="mt-4">
          <div className="flex justify-end mb-4">
            <AddDailyNoteDialog projectId={projectId} />
          </div>
          <DailyNotesTab projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}