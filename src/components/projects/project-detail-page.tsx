'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppStore, api, queryKeys } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import {
  Plus, Search, ArrowLeft, CheckCircle, XCircle, Clock, AlertTriangle, Users,
  DollarSign, FileText, ChevronRight, TrendingUp, ListTodo, Eye, MessageSquare,
  FolderKanban, CircleDot, Flag, ShoppingCart, Receipt, ClipboardCheck, Sun, CloudRain,
  Cloud, CloudSnow, Wind, BarChart3, Send, Reply, Ban, FolderOpen,
  Building2, Phone, Mail, Calendar, Target, Layers, Activity,
  Circle, CircleCheckBig, Timer, ShieldAlert, FileSpreadsheet, Edit3,
  X as XIcon, ArrowUpRight, ArrowDownRight, Minus,
} from 'lucide-react'
import { format, parseISO, differenceInDays } from 'date-fns'
import { cn } from '@/lib/utils'

// ══════════════════════════════════════════════════════════════════
// PROPS & TYPES
// ══════════════════════════════════════════════════════════════════

interface ProjectDetailPageProps {
  projectId?: string
  activeTab?: string
}

const fmt = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

// ─── Status color helpers ──────────────────────────────────────

const openItemStatusColors: Record<string, string> = {
  open: 'bg-amber-100 text-amber-800',
  pending: 'bg-amber-50 text-amber-700',
  in_review: 'bg-orange-50 text-orange-700',
  resolved: 'bg-emerald-100 text-emerald-800',
  closed: 'bg-slate-100 text-slate-700',
}

const rfiStatusColors: Record<string, string> = {
  draft: 'bg-secondary text-secondary-foreground',
  submitted: 'bg-sky-50 text-sky-700',
  under_review: 'bg-orange-50 text-orange-700',
  answered: 'bg-teal-50 text-teal-700',
  closed: 'bg-emerald-50 text-emerald-700',
}

const impactTypeColors: Record<string, string> = {
  cost: 'bg-red-50 text-red-700',
  schedule: 'bg-amber-50 text-amber-700',
  scope: 'bg-emerald-50 text-emerald-700',
  quality: 'bg-violet-50 text-violet-700',
}

const priorityColors: Record<string, string> = {
  critical: 'text-red-700 font-bold',
  high: 'text-red-600',
  medium: 'text-amber-600',
  low: 'text-slate-500',
}

const taskStatusColors: Record<string, string> = {
  todo: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-amber-100 text-amber-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-slate-100 text-slate-500',
}

const milestoneStatusColors: Record<string, string> = {
  pending: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-800',
  overdue: 'bg-red-100 text-red-700',
}

const CHART_COLORS = ['#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#f97316', '#06b6d4']

// ─── Shared skeleton components ────────────────────────────────

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}><CardContent className="p-4"><Skeleton className="h-4 w-20 mb-2" /><Skeleton className="h-8 w-16" /></CardContent></Card>
      ))}
    </div>
  )
}

function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  )
}

function ErrorCard({ message }: { message?: string }) {
  return (
    <Card className="border-red-200">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="h-10 w-10 text-red-500 mb-3" />
        <p className="text-sm text-muted-foreground">{message || 'Failed to load data. Please try again.'}</p>
      </CardContent>
    </Card>
  )
}

function EmptyCard({ icon: Icon, title, description, action }: { icon: React.ElementType; title: string; description: string; action?: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <Icon className="h-12 w-12 text-muted-foreground/40 mb-3" />
        <h3 className="text-sm font-medium mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        {action}
      </CardContent>
    </Card>
  )
}

// ══════════════════════════════════════════════════════════════════
// TAB 1 — OVERVIEW
// ══════════════════════════════════════════════════════════════════

function OverviewTab({ projectId }: { projectId: string }) {
  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.get(`/api/projects/${projectId}`).then(r => r.data),
    enabled: !!projectId,
  })

  const { data: insights } = useQuery({
    queryKey: ['project-insights', projectId],
    queryFn: () => api.get(`/api/projects/${projectId}/insights`).then(r => r.data),
    enabled: !!projectId,
  })

  const { data: comments } = useQuery({
    queryKey: ['project-comments', projectId],
    queryFn: () => api.get(`/api/projects/${projectId}/comments`).then(r => r.data),
    enabled: !!projectId,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <KpiSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card><CardContent className="p-4"><Skeleton className="h-48 w-full" /></CardContent></Card>
          <Card><CardContent className="p-4"><Skeleton className="h-48 w-full" /></CardContent></Card>
        </div>
      </div>
    )
  }

  if (error) return <ErrorCard />

  const p = project
  const kpis = p?.kpis || {}
  const budgetUsed = insights?.budgetUsed ?? kpis.totalExpenses ?? 0
  const budgetTotal = p?.budget ?? 0
  const budgetPct = budgetTotal > 0 ? Math.round((budgetUsed / budgetTotal) * 100) : 0
  const commitmentsTotal = insights?.totalCommitments ?? 0
  const openItemsCount = insights?.openItemsCount ?? 0
  const pendingRfisCount = insights?.pendingRfisCount ?? 0
  const teamSize = insights?.teamSize ?? p?.members?.length ?? 0
  const daysLeft = p?.endDate ? differenceInDays(parseISO(p.endDate), new Date()) : null

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><DollarSign className="h-3.5 w-3.5" /> Budget</div>
            <p className="text-lg font-semibold">{fmt(budgetTotal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Target className="h-3.5 w-3.5" /> Progress</div>
            <p className="text-lg font-semibold">{p?.progress ?? 0}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Users className="h-3.5 w-3.5" /> Team</div>
            <p className="text-lg font-semibold">{teamSize}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><CircleDot className="h-3.5 w-3.5" /> Open Items</div>
            <p className={cn('text-lg font-semibold', openItemsCount > 0 ? 'text-amber-600' : '')}>{openItemsCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><MessageSquare className="h-3.5 w-3.5" /> Pending RFIs</div>
            <p className={cn('text-lg font-semibold', pendingRfisCount > 0 ? 'text-orange-600' : '')}>{pendingRfisCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><ShoppingCart className="h-3.5 w-3.5" /> Commitments</div>
            <p className="text-lg font-semibold">{fmt(commitmentsTotal)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Budget Health */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Budget Health</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Spent: {fmt(budgetUsed)}</span>
                <span className="text-muted-foreground">{budgetPct}%</span>
              </div>
              <Progress value={Math.min(budgetPct, 100)} className={cn('h-3', budgetPct > 90 ? '[&>div]:bg-red-500' : budgetPct > 70 ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500')} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Committed: {fmt(commitmentsTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Remaining: {fmt(Math.max(0, budgetTotal - budgetUsed - commitmentsTotal))}</span>
              </div>
            </div>
            {daysLeft !== null && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                <Clock className="h-4 w-4" />
                <span>{daysLeft > 0 ? `${daysLeft} days remaining` : `${Math.abs(daysLeft)} days overdue`}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Recent Activity</CardTitle></CardHeader>
          <CardContent>
            {comments && comments.length > 0 ? (
              <ScrollArea className="max-h-64">
                <div className="space-y-3">
                  {comments.slice(0, 10).map((c: any) => (
                    <div key={c.id} className="flex items-start gap-3">
                      <div className="h-7 w-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-medium text-amber-700 shrink-0">
                        {c.userName?.[0] || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm"><span className="font-medium">{c.userName || 'User'}</span> <span className="text-muted-foreground">on {c.entityType}</span></p>
                        <p className="text-xs text-muted-foreground truncate">{c.content}</p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{c.createdAt ? format(parseISO(c.createdAt), 'dd MMM') : ''}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// TAB 2 — TASKS
// ══════════════════════════════════════════════════════════════════

function TasksTab({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', status: 'todo', startDate: '', endDate: '' })
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => api.get(`/api/projects/${projectId}/tasks`).then(r => r.data),
    enabled: !!projectId,
  })

  const mutation = useMutation({
    mutationFn: (body: any) => api.post(`/api/projects/${projectId}/tasks`, body),
    onSuccess: () => { toast.success('Task created'); queryClient.invalidateQueries({ queryKey: ['tasks', projectId] }); setOpen(false); setForm({ title: '', description: '', priority: 'medium', status: 'todo', startDate: '', endDate: '' }) },
    onError: (e: any) => toast.error(e.error || 'Failed to create task'),
  })

  const tasks = Array.isArray(data) ? data : data?.tasks ?? []

  if (isLoading) return <TableSkeleton />
  if (error) return <ErrorCard />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tasks..." className="h-9 w-64" />
        </div>
        <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Task
        </Button>
      </div>

      {tasks.length === 0 ? (
        <EmptyCard icon={ListTodo} title="No tasks yet" description="Create your first task for this project."
          action={<Button size="sm" variant="outline" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add Task</Button>} />
      ) : (
        <Card>
          <ScrollArea className="max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-24">Priority</TableHead>
                  <TableHead className="hidden md:table-cell w-32">Assignee</TableHead>
                  <TableHead className="hidden lg:table-cell w-28">Start</TableHead>
                  <TableHead className="hidden lg:table-cell w-28">Due</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((t: any) => (
                  <TableRow key={t.id} className="hover:bg-amber-50/50 transition-colors">
                    <TableCell className="font-medium">{t.title}</TableCell>
                    <TableCell><Badge className={cn('text-xs', taskStatusColors[t.status] || 'bg-secondary')}>{t.status?.replace('_', ' ')}</Badge></TableCell>
                    <TableCell><span className={cn('text-xs font-medium', priorityColors[t.priority])}>{t.priority}</span></TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{t.assignee?.name || '—'}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{t.startDate ? format(parseISO(t.startDate), 'dd MMM yy') : '—'}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{t.endDate ? format(parseISO(t.endDate), 'dd MMM yy') : '—'}</TableCell>
                    <TableCell><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Priority</Label><Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent></Select></div>
              <div><Label>Status</Label><Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todo">To Do</SelectItem><SelectItem value="in_progress">In Progress</SelectItem><SelectItem value="completed">Completed</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></div>
              <div><Label>Due Date</Label><Input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => mutation.mutate(form)} disabled={mutation.isPending || !form.title}>
              {mutation.isPending ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// TAB 3 — TIMELINE
// ══════════════════════════════════════════════════════════════════

function TimelineTab({ projectId }: { projectId: string }) {
  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.get(`/api/projects/${projectId}`).then(r => r.data),
    enabled: !!projectId,
  })

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-4 w-48" /><div className="flex gap-6 overflow-x-auto pb-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 w-48 shrink-0 rounded-lg" />)}</div></div>
  if (error) return <ErrorCard />

  const milestones = project?.milestones ?? []

  if (milestones.length === 0) {
    return <EmptyCard icon={Flag} title="No milestones" description="Milestones will appear here once they are added to the project." />
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        {/* Horizontal timeline line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-amber-200 hidden md:block" />

        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4">
            {milestones.map((m: any) => {
              const isCompleted = m.status === 'completed'
              const isOverdue = m.status === 'overdue'
              return (
                <Card key={m.id} className="shrink-0 w-48">
                  <CardContent className="p-4 pt-6">
                    {/* Dot on timeline */}
                    <div className={cn(
                      'h-3 w-3 rounded-full border-2 border-white shadow -mt-9 mb-3 mx-auto',
                      isCompleted ? 'bg-emerald-500' : isOverdue ? 'bg-red-500' : 'bg-amber-500'
                    )} />
                    <p className="text-sm font-medium mb-1 truncate">{m.name}</p>
                    <p className="text-xs text-muted-foreground mb-2">{m.dueDate ? format(parseISO(m.dueDate), 'dd MMM yyyy') : 'No date'}</p>
                    <Badge className={cn('text-xs', milestoneStatusColors[m.status] || 'bg-secondary')}>{m.status?.replace('_', ' ')}</Badge>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// TAB 4 — OPEN ITEMS
// ══════════════════════════════════════════════════════════════════

const OPEN_ITEM_CATEGORIES = ['rfi', 'site_issue', 'safety_issue', 'material_request', 'client_request', 'approval_required', 'change_request']

function OpenItemsTab({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [form, setForm] = useState({ title: '', description: '', category: 'site_issue', priority: 'medium', dueDate: '' })
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['open-items', projectId, statusFilter, categoryFilter],
    queryFn: () => {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (categoryFilter !== 'all') params.set('category', categoryFilter)
      return api.get(`/api/projects/${projectId}/open-items?${params.toString()}`).then(r => r.data)
    },
    enabled: !!projectId,
  })

  const items = Array.isArray(data) ? data : data?.items ?? []

  const createMutation = useMutation({
    mutationFn: (body: any) => api.post(`/api/projects/${projectId}/open-items`, body),
    onSuccess: () => { toast.success('Open item created'); queryClient.invalidateQueries({ queryKey: ['open-items', projectId] }); setOpen(false); setForm({ title: '', description: '', category: 'site_issue', priority: 'medium', dueDate: '' }) },
    onError: (e: any) => toast.error(e.error || 'Failed'),
  })

  const resolveMutation = useMutation({
    mutationFn: (id: string) => api.put(`/api/projects/${projectId}/open-items/${id}`, { status: 'resolved' }),
    onSuccess: () => { toast.success('Item resolved'); queryClient.invalidateQueries({ queryKey: ['open-items', projectId] }) },
    onError: (e: any) => toast.error(e.error || 'Failed'),
  })

  const closeMutation = useMutation({
    mutationFn: (id: string) => api.put(`/api/projects/${projectId}/open-items/${id}`, { status: 'closed' }),
    onSuccess: () => { toast.success('Item closed'); queryClient.invalidateQueries({ queryKey: ['open-items', projectId] }) },
    onError: (e: any) => toast.error(e.error || 'Failed'),
  })

  if (isLoading) return <TableSkeleton />
  if (error) return <ErrorCard />

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="h-9 w-48" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-9 w-40"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {OPEN_ITEM_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace(/_/g, ' ')}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="ml-auto">
          <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Open Item
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyCard icon={CircleDot} title="No open items" description="Track issues and action items here."
          action={<Button size="sm" variant="outline" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add Item</Button>} />
      ) : (
        <Card>
          <ScrollArea className="max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">No</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell w-36">Category</TableHead>
                  <TableHead className="w-24">Priority</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="hidden lg:table-cell w-28">Due Date</TableHead>
                  <TableHead className="w-36">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item: any) => (
                  <TableRow key={item.id} className="hover:bg-amber-50/50 transition-colors">
                    <TableCell className="font-mono text-xs">{item.itemNo}</TableCell>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{item.category?.replace(/_/g, ' ')}</TableCell>
                    <TableCell><span className={cn('text-xs font-medium', priorityColors[item.priority])}>{item.priority}</span></TableCell>
                    <TableCell><Badge className={cn('text-xs', openItemStatusColors[item.status] || 'bg-secondary')}>{item.status?.replace('_', ' ')}</Badge></TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{item.dueDate ? format(parseISO(item.dueDate), 'dd MMM yy') : '—'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {item.status !== 'resolved' && item.status !== 'closed' && (
                          <Button size="sm" variant="ghost" className="text-emerald-600 h-7" onClick={() => resolveMutation.mutate(item.id)}><CheckCircle className="h-3.5 w-3.5 mr-1" /> Resolve</Button>
                        )}
                        {item.status === 'resolved' && (
                          <Button size="sm" variant="ghost" className="text-slate-600 h-7" onClick={() => closeMutation.mutate(item.id)}><XCircle className="h-3.5 w-3.5 mr-1" /> Close</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Open Item</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Category</Label><Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{OPEN_ITEM_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace(/_/g, ' ')}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Priority</Label><Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent></Select></div>
            </div>
            <div><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending || !form.title}>
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// TAB 5 — RFIs (Request for Information)
// ══════════════════════════════════════════════════════════════════

const RFI_CATEGORIES = ['general', 'technical', 'commercial', 'design']

function RfisTab({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedRfi, setSelectedRfi] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [form, setForm] = useState({ title: '', description: '', category: 'general', priority: 'medium', dueDate: '', question: '' })
  const [newComment, setNewComment] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['rfis', projectId, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      return api.get(`/api/projects/${projectId}/rfis?${params.toString()}`).then(r => r.data)
    },
    enabled: !!projectId,
  })

  const rfis = Array.isArray(data) ? data : []

  const createMutation = useMutation({
    mutationFn: (body: any) => api.post(`/api/projects/${projectId}/rfis`, body),
    onSuccess: () => { toast.success('RFI created'); queryClient.invalidateQueries({ queryKey: ['rfis', projectId] }); setOpen(false); setForm({ title: '', description: '', category: 'general', priority: 'medium', dueDate: '', question: '' }) },
    onError: (e: any) => toast.error(e.error || 'Failed'),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.put(`/api/projects/${projectId}/rfis/${id}`, { status }),
    onSuccess: (_, vars) => { toast.success(`RFI ${vars.status}`); queryClient.invalidateQueries({ queryKey: ['rfis', projectId] }); setDetailOpen(false) },
    onError: (e: any) => toast.error(e.error || 'Failed'),
  })

  const commentMutation = useMutation({
    mutationFn: ({ rfiId, content }: { rfiId: string; content: string }) => api.post(`/api/projects/${projectId}/rfis/${rfiId}/comments`, { content }),
    onSuccess: () => { toast.success('Comment added'); queryClient.invalidateQueries({ queryKey: ['rfis', projectId] }); setNewComment('') },
    onError: (e: any) => toast.error(e.error || 'Failed'),
  })

  if (isLoading) return <TableSkeleton />
  if (error) return <ErrorCard />

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search RFIs..." className="h-9 w-48" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="answered">Answered</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto">
          <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> New RFI
          </Button>
        </div>
      </div>

      {rfis.length === 0 ? (
        <EmptyCard icon={MessageSquare} title="No RFIs" description="Submit a Request for Information."
          action={<Button size="sm" variant="outline" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> New RFI</Button>} />
      ) : (
        <Card>
          <ScrollArea className="max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">RFI No</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell w-32">Category</TableHead>
                  <TableHead className="w-24">Priority</TableHead>
                  <TableHead className="w-28">Status</TableHead>
                  <TableHead className="hidden lg:table-cell w-32">Submitted By</TableHead>
                  <TableHead className="hidden lg:table-cell w-28">Due</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rfis.map((rfi: any) => (
                  <TableRow key={rfi.id} className="hover:bg-amber-50/50 transition-colors">
                    <TableCell className="font-mono text-xs">{rfi.rfiNo}</TableCell>
                    <TableCell className="font-medium">{rfi.title}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{rfi.category}</TableCell>
                    <TableCell><span className={cn('text-xs font-medium', priorityColors[rfi.priority])}>{rfi.priority}</span></TableCell>
                    <TableCell><Badge className={cn('text-xs', rfiStatusColors[rfi.status] || 'bg-secondary')}>{rfi.status?.replace('_', ' ')}</Badge></TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{rfi.submittedByName || '—'}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{rfi.dueDate ? format(parseISO(rfi.dueDate), 'dd MMM yy') : '—'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-7" onClick={() => { setSelectedRfi(rfi); setDetailOpen(true) }}><Eye className="h-3.5 w-3.5" /></Button>
                        {rfi.status === 'draft' && <Button size="sm" variant="ghost" className="text-sky-600 h-7" onClick={() => statusMutation.mutate({ id: rfi.id, status: 'submitted' })}><Send className="h-3.5 w-3.5 mr-1" />Submit</Button>}
                        {rfi.status === 'submitted' && <Button size="sm" variant="ghost" className="text-orange-600 h-7" onClick={() => statusMutation.mutate({ id: rfi.id, status: 'under_review' })}><Reply className="h-3.5 w-3.5 mr-1" />Review</Button>}
                        {rfi.status === 'under_review' && <Button size="sm" variant="ghost" className="text-teal-600 h-7" onClick={() => statusMutation.mutate({ id: rfi.id, status: 'answered' })}><Reply className="h-3.5 w-3.5 mr-1" />Answer</Button>}
                        {rfi.status === 'answered' && <Button size="sm" variant="ghost" className="text-emerald-600 h-7" onClick={() => statusMutation.mutate({ id: rfi.id, status: 'closed' })}><CheckCircle className="h-3.5 w-3.5 mr-1" />Close</Button>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New RFI</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Question / Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Category</Label><Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{RFI_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Priority</Label><Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent></Select></div>
            </div>
            <div><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending || !form.title}>
              {createMutation.isPending ? 'Creating...' : 'Create RFI'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedRfi?.rfiNo} — {selectedRfi?.title}</DialogTitle>
          </DialogHeader>
          {selectedRfi && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge className={cn('text-xs', rfiStatusColors[selectedRfi.status])}>{selectedRfi.status?.replace('_', ' ')}</Badge>
                <Badge variant="outline" className="text-xs">{selectedRfi.category}</Badge>
                <span className={cn('text-xs font-medium', priorityColors[selectedRfi.priority])}>{selectedRfi.priority}</span>
              </div>
              <p className="text-sm text-muted-foreground">{selectedRfi.description}</p>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-2">Comments</h4>
                <ScrollArea className="max-h-48">
                  <div className="space-y-2">
                    {(selectedRfi.comments || []).length === 0 ? (
                      <p className="text-xs text-muted-foreground">No comments yet.</p>
                    ) : (selectedRfi.comments || []).map((c: any) => (
                      <div key={c.id} className="bg-muted/50 rounded-lg p-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">{c.userName || 'User'}</span>
                          <span className="text-xs text-muted-foreground">{c.createdAt ? format(parseISO(c.createdAt), 'dd MMM yyyy') : ''}</span>
                        </div>
                        <p className="text-sm">{c.content}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex gap-2 mt-2">
                  <Input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add comment..." className="h-9" />
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => { if (selectedRfi?.id && newComment.trim()) commentMutation.mutate({ rfiId: selectedRfi.id, content: newComment }) }}>
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// TAB 6 — CHANGE EVENTS
// ══════════════════════════════════════════════════════════════════

const CE_CATEGORIES = ['scope', 'design', 'schedule', 'commercial', 'quality']

function ChangeEventsTab({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category: 'scope', impactType: 'cost', potentialCostImpact: '', potentialScheduleImpact: '' })
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['change-events', projectId],
    queryFn: () => api.get(`/api/projects/${projectId}/change-events`).then(r => r.data),
    enabled: !!projectId,
  })

  const events = Array.isArray(data) ? data : []

  const createMutation = useMutation({
    mutationFn: (body: any) => api.post(`/api/projects/${projectId}/change-events`, body),
    onSuccess: () => { toast.success('Change event created'); queryClient.invalidateQueries({ queryKey: ['change-events', projectId] }); setOpen(false); setForm({ title: '', description: '', category: 'scope', impactType: 'cost', potentialCostImpact: '', potentialScheduleImpact: '' }) },
    onError: (e: any) => toast.error(e.error || 'Failed'),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.put(`/api/projects/${projectId}/change-events/${id}`, { status }),
    onSuccess: (_, vars) => { toast.success(`Change event ${vars.status}`); queryClient.invalidateQueries({ queryKey: ['change-events', projectId] }) },
    onError: (e: any) => toast.error(e.error || 'Failed'),
  })

  if (isLoading) return <TableSkeleton />
  if (error) return <ErrorCard />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><Search className="h-4 w-4 text-muted-foreground" /><Input placeholder="Search..." className="h-9 w-48" /></div>
        <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> New Change Event</Button>
      </div>

      {events.length === 0 ? (
        <EmptyCard icon={AlertTriangle} title="No change events" description="Log potential changes and their impacts."
          action={<Button size="sm" variant="outline" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> New Event</Button>} />
      ) : (
        <Card>
          <ScrollArea className="max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">No</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell w-28">Impact</TableHead>
                  <TableHead className="hidden md:table-cell w-28">Potential Cost</TableHead>
                  <TableHead className="hidden lg:table-cell w-28">Schedule</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-36">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((ev: any) => (
                  <TableRow key={ev.id} className="hover:bg-amber-50/50 transition-colors">
                    <TableCell className="font-mono text-xs">{ev.eventNo}</TableCell>
                    <TableCell className="font-medium">{ev.title}</TableCell>
                    <TableCell className="hidden md:table-cell"><Badge className={cn('text-xs', impactTypeColors[ev.impactType] || 'bg-secondary')}>{ev.impactType}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{ev.potentialCostImpact ? fmt(ev.potentialCostImpact) : '—'}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{ev.potentialScheduleImpact || '—'}</TableCell>
                    <TableCell><Badge className={cn('text-xs', openItemStatusColors[ev.status] || 'bg-secondary')}>{ev.status?.replace('_', ' ')}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {ev.status === 'open' && (
                          <>
                            <Button size="sm" variant="ghost" className="text-emerald-600 h-7" onClick={() => statusMutation.mutate({ id: ev.id, status: 'review' })}><CheckCircle className="h-3.5 w-3.5 mr-1" />Review</Button>
                            <Button size="sm" variant="ghost" className="text-red-600 h-7" onClick={() => statusMutation.mutate({ id: ev.id, status: 'rejected' })}><XCircle className="h-3.5 w-3.5 mr-1" />Reject</Button>
                          </>
                        )}
                        {ev.status === 'review' && (
                          <Button size="sm" variant="ghost" className="text-emerald-600 h-7" onClick={() => statusMutation.mutate({ id: ev.id, status: 'approved' })}><CheckCircle className="h-3.5 w-3.5 mr-1" />Approve</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Change Event</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Category</Label><Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Impact Type</Label><Select value={form.impactType} onValueChange={v => setForm({ ...form, impactType: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="cost">Cost</SelectItem><SelectItem value="schedule">Schedule</SelectItem><SelectItem value="scope">Scope</SelectItem><SelectItem value="quality">Quality</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Potential Cost (₹)</Label><Input type="number" value={form.potentialCostImpact} onChange={e => setForm({ ...form, potentialCostImpact: e.target.value })} /></div>
              <div><Label>Schedule Impact</Label><Input placeholder="e.g. 14 days" value={form.potentialScheduleImpact} onChange={e => setForm({ ...form, potentialScheduleImpact: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => createMutation.mutate({ ...form, potentialCostImpact: Number(form.potentialCostImpact) || 0 })} disabled={createMutation.isPending || !form.title}>
              {createMutation.isPending ? 'Creating...' : 'Create Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// TAB 7 — CHANGE ORDERS
// ══════════════════════════════════════════════════════════════════

function ChangeOrdersTab({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', costAdjustment: '', originalBudget: '', adjustedBudget: '' })
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['change-orders', projectId],
    queryFn: () => api.get(`/api/projects/${projectId}/change-orders`).then(r => r.data),
    enabled: !!projectId,
  })

  const orders = Array.isArray(data) ? data : []

  const createMutation = useMutation({
    mutationFn: (body: any) => api.post(`/api/projects/${projectId}/change-orders`, body),
    onSuccess: () => { toast.success('Change order created'); queryClient.invalidateQueries({ queryKey: ['change-orders', projectId] }); setOpen(false); setForm({ title: '', description: '', costAdjustment: '', originalBudget: '', adjustedBudget: '' }) },
    onError: (e: any) => toast.error(e.error || 'Failed'),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.put(`/api/projects/${projectId}/change-orders/${id}`, { status: 'approved' }),
    onSuccess: () => { toast.success('Change order approved'); queryClient.invalidateQueries({ queryKey: ['change-orders', projectId] }) },
    onError: (e: any) => toast.error(e.error || 'Failed'),
  })

  if (isLoading) return <TableSkeleton />
  if (error) return <ErrorCard />

  const coStatusColors: Record<string, string> = {
    draft: 'bg-secondary text-secondary-foreground',
    submitted: 'bg-sky-50 text-sky-700',
    approved: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800',
    executed: 'bg-teal-50 text-teal-700',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><Search className="h-4 w-4 text-muted-foreground" /><Input placeholder="Search..." className="h-9 w-48" /></div>
        <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> New Change Order</Button>
      </div>

      {orders.length === 0 ? (
        <EmptyCard icon={FileText} title="No change orders" description="Formalize approved change events into change orders."
          action={<Button size="sm" variant="outline" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> New CO</Button>} />
      ) : (
        <Card>
          <ScrollArea className="max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">CO No</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-32">Cost Adj</TableHead>
                  <TableHead className="hidden md:table-cell w-32">Adjusted Budget</TableHead>
                  <TableHead className="w-28">Status</TableHead>
                  <TableHead className="w-28">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((co: any) => (
                  <TableRow key={co.id} className="hover:bg-amber-50/50 transition-colors">
                    <TableCell className="font-mono text-xs">{co.coNo}</TableCell>
                    <TableCell className="font-medium">{co.title}</TableCell>
                    <TableCell>
                      <span className={cn('text-sm font-medium', co.costAdjustment > 0 ? 'text-red-600' : co.costAdjustment < 0 ? 'text-emerald-600' : '')}>
                        {co.costAdjustment > 0 ? '+' : ''}{fmt(co.costAdjustment || 0)}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{fmt(co.adjustedBudget || 0)}</TableCell>
                    <TableCell><Badge className={cn('text-xs', coStatusColors[co.status] || 'bg-secondary')}>{co.status?.replace('_', ' ')}</Badge></TableCell>
                    <TableCell>
                      {co.status === 'submitted' && (
                        <Button size="sm" variant="ghost" className="text-emerald-600 h-7" onClick={() => approveMutation.mutate(co.id)}>
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />Approve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Change Order</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Cost Adjustment (₹)</Label><Input type="number" value={form.costAdjustment} onChange={e => setForm({ ...form, costAdjustment: e.target.value })} /></div>
              <div><Label>Adjusted Budget (₹)</Label><Input type="number" value={form.adjustedBudget} onChange={e => setForm({ ...form, adjustedBudget: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => createMutation.mutate({ ...form, costAdjustment: Number(form.costAdjustment) || 0, adjustedBudget: Number(form.adjustedBudget) || 0 })} disabled={createMutation.isPending || !form.title}>
              {createMutation.isPending ? 'Creating...' : 'Create CO'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// TAB 8 — TEAM
// ══════════════════════════════════════════════════════════════════

const TEAM_ROLES = ['project_manager', 'site_engineer', 'supervisor', 'consultant', 'architect', 'qs', 'contractor', 'subcontractor', 'client_rep']

function TeamTab({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', role: 'supervisor', company: '', phone: '', email: '' })
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['project-team', projectId],
    queryFn: () => api.get(`/api/projects/${projectId}/team`).then(r => r.data),
    enabled: !!projectId,
  })

  const members = Array.isArray(data) ? data : []

  const createMutation = useMutation({
    mutationFn: (body: any) => api.post(`/api/projects/${projectId}/team`, body),
    onSuccess: () => { toast.success('Member added'); queryClient.invalidateQueries({ queryKey: ['project-team', projectId] }); setOpen(false); setForm({ name: '', role: 'supervisor', company: '', phone: '', email: '' }) },
    onError: (e: any) => toast.error(e.error || 'Failed'),
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <Card key={i}><CardContent className="p-4"><Skeleton className="h-5 w-32 mb-2" /><Skeleton className="h-4 w-24 mb-1" /><Skeleton className="h-4 w-36" /></CardContent></Card>)}
      </div>
    )
  }
  if (error) return <ErrorCard />

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Member
        </Button>
      </div>

      {members.length === 0 ? (
        <EmptyCard icon={Users} title="No team members" description="Add members to your project team."
          action={<Button size="sm" variant="outline" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add Member</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m: any) => (
            <Card key={m.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-sm font-medium text-amber-700 shrink-0">
                    {m.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{m.name}</p>
                    <Badge variant="outline" className="text-xs mt-1">{m.role?.replace(/_/g, ' ')}</Badge>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  {m.company && <div className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5" /><span className="truncate">{m.company}</span></div>}
                  {m.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /><span>{m.phone}</span></div>}
                  {m.email && <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /><span className="truncate">{m.email}</span></div>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Team Member</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Role</Label><Select value={form.role} onValueChange={v => setForm({ ...form, role: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TEAM_ROLES.map(r => <SelectItem key={r} value={r}>{r.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Company</Label><Input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending || !form.name}>
              {createMutation.isPending ? 'Adding...' : 'Add Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// TAB 9 — COMMITMENTS
// ══════════════════════════════════════════════════════════════════

const COMMITMENT_TYPES = ['purchase_order', 'subcontract', 'material_order', 'labour_contract']

function CommitmentsTab({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ type: 'purchase_order', vendor: '', description: '', contractValue: '', committedCost: '' })
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['commitments', projectId],
    queryFn: () => api.get(`/api/projects/${projectId}/commitments`).then(r => r.data),
    enabled: !!projectId,
  })

  const commitments = Array.isArray(data) ? data : []

  const createMutation = useMutation({
    mutationFn: (body: any) => api.post(`/api/projects/${projectId}/commitments`, body),
    onSuccess: () => { toast.success('Commitment added'); queryClient.invalidateQueries({ queryKey: ['commitments', projectId] }); setOpen(false); setForm({ type: 'purchase_order', vendor: '', description: '', contractValue: '', committedCost: '' }) },
    onError: (e: any) => toast.error(e.error || 'Failed'),
  })

  const totalValue = commitments.reduce((s: number, c: any) => s + (c.contractValue || 0), 0)
  const totalCommitted = commitments.reduce((s: number, c: any) => s + (c.committedCost || 0), 0)
  const totalRemaining = commitments.reduce((s: number, c: any) => s + (c.remainingCost || 0), 0)

  if (isLoading) {
    return <div className="space-y-4"><div className="grid grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Card key={i}><CardContent className="p-4"><Skeleton className="h-4 w-16 mb-2" /><Skeleton className="h-8 w-24" /></CardContent></Card>)}</div><TableSkeleton /></div>
  }
  if (error) return <ErrorCard />

  const coStatusColors: Record<string, string> = { draft: 'bg-secondary text-secondary-foreground', active: 'bg-emerald-100 text-emerald-800', completed: 'bg-slate-100 text-slate-700', cancelled: 'bg-red-100 text-red-800' }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground mb-1">Total Value</div><p className="text-lg font-semibold">{fmt(totalValue)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground mb-1">Committed</div><p className="text-lg font-semibold text-amber-600">{fmt(totalCommitted)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground mb-1">Remaining</div><p className="text-lg font-semibold text-emerald-600">{fmt(totalRemaining)}</p></CardContent></Card>
      </div>

      <div className="flex justify-end">
        <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add Commitment</Button>
      </div>

      {commitments.length === 0 ? (
        <EmptyCard icon={ShoppingCart} title="No commitments" description="Track purchase orders, subcontracts, and material orders."
          action={<Button size="sm" variant="outline" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add</Button>} />
      ) : (
        <Card>
          <ScrollArea className="max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-36">Type</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="w-32">Value</TableHead>
                  <TableHead className="hidden md:table-cell w-32">Committed</TableHead>
                  <TableHead className="hidden md:table-cell w-32">Remaining</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commitments.map((c: any) => (
                  <TableRow key={c.id} className="hover:bg-amber-50/50 transition-colors">
                    <TableCell className="text-sm">{c.type?.replace(/_/g, ' ')}</TableCell>
                    <TableCell className="font-medium">{c.vendor}</TableCell>
                    <TableCell className="text-sm">{fmt(c.contractValue || 0)}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-amber-600">{fmt(c.committedCost || 0)}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-emerald-600">{fmt(c.remainingCost || 0)}</TableCell>
                    <TableCell><Badge className={cn('text-xs', coStatusColors[c.status] || 'bg-secondary')}>{c.status}</Badge></TableCell>
                    <TableCell><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Commitment</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Type</Label><Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{COMMITMENT_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Vendor</Label><Input value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })} /></div>
            </div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Contract Value (₹)</Label><Input type="number" value={form.contractValue} onChange={e => setForm({ ...form, contractValue: e.target.value })} /></div>
              <div><Label>Committed Cost (₹)</Label><Input type="number" value={form.committedCost} onChange={e => setForm({ ...form, committedCost: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => createMutation.mutate({ ...form, contractValue: Number(form.contractValue) || 0, committedCost: Number(form.committedCost) || 0 })} disabled={createMutation.isPending || !form.vendor}>
              {createMutation.isPending ? 'Adding...' : 'Add Commitment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// TAB 10 — DIRECT COSTS
// ══════════════════════════════════════════════════════════════════

const COST_CATEGORIES = ['labour', 'materials', 'equipment', 'fuel', 'transportation', 'accommodation', 'rental', 'subcontractor', 'miscellaneous']

function DirectCostsTab({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ category: 'labour', description: '', amount: '', date: '' })
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['direct-costs', projectId],
    queryFn: () => api.get(`/api/projects/${projectId}/direct-costs`).then(r => r.data),
    enabled: !!projectId,
  })

  const costs = Array.isArray(data) ? data : []

  const createMutation = useMutation({
    mutationFn: (body: any) => api.post(`/api/projects/${projectId}/direct-costs`, body),
    onSuccess: () => { toast.success('Direct cost added'); queryClient.invalidateQueries({ queryKey: ['direct-costs', projectId] }); setOpen(false); setForm({ category: 'labour', description: '', amount: '', date: '' }) },
    onError: (e: any) => toast.error(e.error || 'Failed'),
  })

  // Summary by category
  const categorySummary = costs.reduce((acc: Record<string, number>, c: any) => {
    acc[c.category] = (acc[c.category] || 0) + (c.amount || 0)
    return acc
  }, {})

  if (isLoading) return <div className="space-y-4"><div className="grid grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Card key={i}><CardContent className="p-4"><Skeleton className="h-4 w-16 mb-2" /><Skeleton className="h-8 w-24" /></CardContent></Card>)}</div><TableSkeleton /></div>
  if (error) return <ErrorCard />

  const costStatusColors: Record<string, string> = { pending: 'bg-amber-100 text-amber-800', approved: 'bg-emerald-100 text-emerald-800', rejected: 'bg-red-100 text-red-800' }

  return (
    <div className="space-y-4">
      {/* Summary by category */}
      {Object.keys(categorySummary).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(categorySummary).map(([cat, total]) => (
            <Card key={cat}>
              <CardContent className="p-3">
                <div className="text-xs text-muted-foreground mb-1">{cat.charAt(0).toUpperCase() + cat.slice(1)}</div>
                <p className="text-sm font-semibold">{fmt(total)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><Search className="h-4 w-4 text-muted-foreground" /><Input placeholder="Search..." className="h-9 w-48" /></div>
        <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add Cost</Button>
      </div>

      {costs.length === 0 ? (
        <EmptyCard icon={Receipt} title="No direct costs" description="Track project expenses by category."
          action={<Button size="sm" variant="outline" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add Cost</Button>} />
      ) : (
        <Card>
          <ScrollArea className="max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-28">Amount</TableHead>
                  <TableHead className="hidden md:table-cell w-28">Date</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costs.map((c: any) => (
                  <TableRow key={c.id} className="hover:bg-amber-50/50 transition-colors">
                    <TableCell className="text-sm">{c.category?.charAt(0).toUpperCase() + c.category?.slice(1)}</TableCell>
                    <TableCell className="font-medium">{c.description}</TableCell>
                    <TableCell className="text-sm">{fmt(c.amount || 0)}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{c.date ? format(parseISO(c.date), 'dd MMM yy') : '—'}</TableCell>
                    <TableCell><Badge className={cn('text-xs', costStatusColors[c.status] || 'bg-secondary')}>{c.status}</Badge></TableCell>
                    <TableCell><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Direct Cost</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Category</Label><Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{COST_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Amount (₹)</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
              <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => createMutation.mutate({ ...form, amount: Number(form.amount) || 0 })} disabled={createMutation.isPending || !form.description}>
              {createMutation.isPending ? 'Adding...' : 'Add Cost'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// TAB 11 — DOCUMENTS
// ══════════════════════════════════════════════════════════════════

const DOC_TYPES = ['drawing', 'contract', 'photo', 'report', 'other']

function DocumentsTab({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'drawing' })
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['project-documents', projectId],
    queryFn: () => api.get(`/api/projects/${projectId}/documents`).then(r => r.data),
    enabled: !!projectId,
  })

  const docs = Array.isArray(data) ? data : data?.documents ?? []

  const createMutation = useMutation({
    mutationFn: (body: any) => api.post(`/api/projects/${projectId}/documents`, body),
    onSuccess: () => { toast.success('Document added'); queryClient.invalidateQueries({ queryKey: ['project-documents', projectId] }); setOpen(false); setForm({ name: '', type: 'drawing' }) },
    onError: (e: any) => toast.error(e.error || 'Failed'),
  })

  const docTypeColors: Record<string, string> = {
    drawing: 'bg-amber-100 text-amber-800',
    contract: 'bg-emerald-100 text-emerald-800',
    photo: 'bg-sky-100 text-sky-800',
    report: 'bg-violet-100 text-violet-800',
    other: 'bg-slate-100 text-slate-700',
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  if (isLoading) return <TableSkeleton />
  if (error) return <ErrorCard />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><Search className="h-4 w-4 text-muted-foreground" /><Input placeholder="Search documents..." className="h-9 w-48" /></div>
        <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Upload Document</Button>
      </div>

      {docs.length === 0 ? (
        <EmptyCard icon={FolderOpen} title="No documents" description="Upload drawings, contracts, photos, and reports."
          action={<Button size="sm" variant="outline" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Upload</Button>} />
      ) : (
        <Card>
          <ScrollArea className="max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-28">Type</TableHead>
                  <TableHead className="hidden md:table-cell w-28">Uploaded</TableHead>
                  <TableHead className="hidden lg:table-cell w-24">Size</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {docs.map((d: any) => (
                  <TableRow key={d.id} className="hover:bg-amber-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{d.name}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge className={cn('text-xs', docTypeColors[d.type] || 'bg-secondary')}>{d.type}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{d.createdAt ? format(parseISO(d.createdAt), 'dd MMM yy') : '—'}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{d.fileSize ? formatFileSize(d.fileSize) : '—'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Document Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Type</Label><Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DOC_TYPES.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending || !form.name}>
              {createMutation.isPending ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// TAB 12 — DAILY NOTES
// ══════════════════════════════════════════════════════════════════

const WEATHER_OPTIONS = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy']

function WeatherIcon({ weather }: { weather: string }) {
  switch (weather) {
    case 'sunny': return <Sun className="h-4 w-4 text-amber-500" />
    case 'cloudy': return <Cloud className="h-4 w-4 text-slate-400" />
    case 'rainy': return <CloudRain className="h-4 w-4 text-sky-500" />
    case 'snowy': return <CloudSnow className="h-4 w-4 text-sky-300" />
    case 'windy': return <Wind className="h-4 w-4 text-slate-500" />
    default: return <Sun className="h-4 w-4 text-amber-500" />
  }
}

function DailyNotesTab({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ date: format(new Date(), 'yyyy-MM-dd'), weather: 'sunny', workDone: '', issues: '', labourCount: '' })
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['daily-notes', projectId],
    queryFn: () => api.get(`/api/projects/${projectId}/daily-notes`).then(r => r.data),
    enabled: !!projectId,
  })

  const notes = Array.isArray(data) ? data : []

  const createMutation = useMutation({
    mutationFn: (body: any) => api.post(`/api/projects/${projectId}/daily-notes`, body),
    onSuccess: () => { toast.success('Daily note added'); queryClient.invalidateQueries({ queryKey: ['daily-notes', projectId] }); setOpen(false); setForm({ date: format(new Date(), 'yyyy-MM-dd'), weather: 'sunny', workDone: '', issues: '', labourCount: '' }) },
    onError: (e: any) => toast.error(e.error || 'Failed'),
  })

  if (isLoading) return <TableSkeleton />
  if (error) return <ErrorCard />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><Search className="h-4 w-4 text-muted-foreground" /><Input placeholder="Search notes..." className="h-9 w-48" /></div>
        <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add Daily Note</Button>
      </div>

      {notes.length === 0 ? (
        <EmptyCard icon={ClipboardCheck} title="No daily notes" description="Record site observations and work progress."
          action={<Button size="sm" variant="outline" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add Note</Button>} />
      ) : (
        <Card>
          <ScrollArea className="max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Date</TableHead>
                  <TableHead className="w-20">Weather</TableHead>
                  <TableHead>Work Done</TableHead>
                  <TableHead className="hidden md:table-cell">Issues</TableHead>
                  <TableHead className="w-24">Labour</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notes.map((n: any) => (
                  <TableRow key={n.id} className="hover:bg-amber-50/50 transition-colors">
                    <TableCell className="text-sm">{n.date ? format(parseISO(n.date), 'dd MMM yy') : '—'}</TableCell>
                    <TableCell><div className="flex items-center gap-1.5"><WeatherIcon weather={n.weather} /><span className="text-xs text-muted-foreground capitalize">{n.weather}</span></div></TableCell>
                    <TableCell className="text-sm max-w-48 truncate">{n.workDone || '—'}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-48 truncate">{n.issues || '—'}</TableCell>
                    <TableCell className="text-sm">{n.labourCount || 0}</TableCell>
                    <TableCell><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Daily Note</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div><Label>Weather</Label><Select value={form.weather} onValueChange={v => setForm({ ...form, weather: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{WEATHER_OPTIONS.map(w => <SelectItem key={w} value={w}>{w.charAt(0).toUpperCase() + w.slice(1)}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div><Label>Work Done</Label><Textarea value={form.workDone} onChange={e => setForm({ ...form, workDone: e.target.value })} rows={3} /></div>
            <div><Label>Issues / Observations</Label><Textarea value={form.issues} onChange={e => setForm({ ...form, issues: e.target.value })} rows={2} /></div>
            <div><Label>Labour Count</Label><Input type="number" value={form.labourCount} onChange={e => setForm({ ...form, labourCount: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => createMutation.mutate({ ...form, date: form.date, labourCount: Number(form.labourCount) || 0 })} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving...' : 'Save Note'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// TAB 13 — INSIGHTS (Analytics)
// ══════════════════════════════════════════════════════════════════

function InsightsTab({ projectId }: { projectId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['project-insights', projectId],
    queryFn: () => api.get(`/api/projects/${projectId}/insights`).then(r => r.data),
    enabled: !!projectId,
  })

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.get(`/api/projects/${projectId}`).then(r => r.data),
    enabled: !!projectId,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card><CardContent className="p-4"><Skeleton className="h-48 w-full" /></CardContent></Card>
          <Card><CardContent className="p-4"><Skeleton className="h-48 w-full" /></CardContent></Card>
        </div>
        <Card><CardContent className="p-4"><Skeleton className="h-64 w-full" /></CardContent></Card>
      </div>
    )
  }
  if (error) return <ErrorCard />

  const insights = data || {}
  const budgetUsed = insights.budgetUsed ?? 0
  const budgetTotal = project?.budget ?? 0
  const budgetPct = budgetTotal > 0 ? Math.round((budgetUsed / budgetTotal) * 100) : 0
  const commitmentsTotal = insights.totalCommitments ?? 0

  // Open items summary
  const openItemsSummary = insights.openItemsSummary ?? {}
  const oiData = [
    { name: 'Open', value: openItemsSummary.open ?? 0, fill: '#f59e0b' },
    { name: 'Pending', value: openItemsSummary.pending ?? 0, fill: '#fb923c' },
    { name: 'In Review', value: openItemsSummary.in_review ?? 0, fill: '#f97316' },
    { name: 'Resolved', value: openItemsSummary.resolved ?? 0, fill: '#10b981' },
    { name: 'Closed', value: openItemsSummary.closed ?? 0, fill: '#94a3b8' },
  ].filter(d => d.value > 0)

  // RFI status breakdown
  const rfiBreakdown = insights.rfiBreakdown ?? {}
  const rfiData = [
    { name: 'Draft', value: rfiBreakdown.draft ?? 0, fill: '#94a3b8' },
    { name: 'Submitted', value: rfiBreakdown.submitted ?? 0, fill: '#38bdf8' },
    { name: 'Under Review', value: rfiBreakdown.under_review ?? 0, fill: '#f97316' },
    { name: 'Answered', value: rfiBreakdown.answered ?? 0, fill: '#14b8a6' },
    { name: 'Closed', value: rfiBreakdown.closed ?? 0, fill: '#10b981' },
  ].filter(d => d.value > 0)

  // Direct costs by category
  const costsByCategory = insights.costsByCategory ?? []
  const hasChartData = costsByCategory.length > 0

  // Change events summary
  const ceSummary = insights.changeEventsSummary ?? {}

  return (
    <div className="space-y-6">
      {/* Budget Health */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Budget Health</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm mb-1">
              <span>Budget Utilization</span>
              <span className={cn('font-medium', budgetPct > 90 ? 'text-red-600' : budgetPct > 70 ? 'text-amber-600' : 'text-emerald-600')}>{budgetPct}%</span>
            </div>
            <Progress value={Math.min(budgetPct, 100)} className={cn('h-4', budgetPct > 90 ? '[&>div]:bg-red-500' : budgetPct > 70 ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500')} />
            <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
              <div className="text-center">
                <p className="text-muted-foreground">Spent</p>
                <p className="font-semibold">{fmt(budgetUsed)}</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Committed</p>
                <p className="font-semibold text-amber-600">{fmt(commitmentsTotal)}</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Remaining</p>
                <p className="font-semibold text-emerald-600">{fmt(Math.max(0, budgetTotal - budgetUsed - commitmentsTotal))}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Items Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Open Items Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {oiData.length > 0 ? (
              <div className="flex items-center gap-4">
                <div className="w-36 h-36 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={oiData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" stroke="none">
                        {oiData.map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {oiData.map(d => (
                    <div key={d.name} className="flex items-center gap-2 text-sm">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: d.fill }} />
                      <span className="text-muted-foreground">{d.name}:</span>
                      <span className="font-medium">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <p className="text-sm">No open items data</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* RFI Status Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">RFI Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {rfiData.length > 0 ? (
              <div className="flex items-center gap-4">
                <div className="w-36 h-36 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={rfiData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" stroke="none">
                        {rfiData.map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {rfiData.map(d => (
                    <div key={d.name} className="flex items-center gap-2 text-sm">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: d.fill }} />
                      <span className="text-muted-foreground">{d.name}:</span>
                      <span className="font-medium">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <p className="text-sm">No RFI data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Direct Costs by Category - Bar Chart */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Direct Costs by Category</CardTitle></CardHeader>
        <CardContent>
          {hasChartData ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costsByCategory} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => v >= 100000 ? `${(v / 100000).toFixed(0)}L` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                  <Tooltip formatter={(value: number) => [fmt(value), 'Amount']} />
                  <Bar dataKey="amount" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No cost data available</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Events Summary */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Change Events Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{ceSummary.total ?? 0}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <p className="text-2xl font-bold text-amber-700">{ceSummary.open ?? 0}</p>
              <p className="text-xs text-muted-foreground">Open</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-700">{ceSummary.review ?? 0}</p>
              <p className="text-xs text-muted-foreground">In Review</p>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-lg">
              <p className="text-2xl font-bold text-emerald-700">{ceSummary.approved ?? 0}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-700">{ceSummary.rejected ?? 0}</p>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// MAIN COMPONENT — PROJECT DETAIL PAGE
// ══════════════════════════════════════════════════════════════════

export function ProjectDetailPage({ projectId, activeTab }: ProjectDetailPageProps) {
  const { navigate, pageParams } = useAppStore()
  const [tab, setTab] = useState(activeTab || 'overview')

  // Use projectId from props or from store pageParams
  const effectiveProjectId = projectId || pageParams?.id

  // Fetch project for breadcrumb
  const { data: project } = useQuery({
    queryKey: ['project', effectiveProjectId],
    queryFn: () => api.get(`/api/projects/${effectiveProjectId}`).then(r => r.data),
    enabled: !!effectiveProjectId,
  })

  // Set breadcrumbs
  useEffect(() => {
    if (project?.name) {
      useAppStore.getState().setBreadcrumbs([
        { label: 'Projects', page: 'projects' },
        { label: project.name },
      ])
    }
  }, [project?.name])

  // Sync tab from prop changes
  const [prevActiveTab, setPrevActiveTab] = useState(activeTab)
  if (activeTab && activeTab !== prevActiveTab) {
    setTab(activeTab)
    setPrevActiveTab(activeTab)
  }

  // No project ID — show empty state
  if (!effectiveProjectId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <FolderKanban className="h-16 w-16 text-muted-foreground/30" />
        <div className="text-center">
          <h2 className="text-lg font-medium mb-1">Select a Project</h2>
          <p className="text-sm text-muted-foreground">Choose a project from the list to view its workspace.</p>
        </div>
        <Button variant="outline" onClick={() => navigate('projects')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Go to Projects
        </Button>
      </div>
    )
  }

  // Project loading state
  if (project === undefined) {
    return (
      <div className="space-y-6 p-1">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-10 w-full" />
        <KpiSkeleton />
      </div>
    )
  }

  // Project error state
  if (project === null || (project as any)?.error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle className="h-12 w-12 text-red-400" />
        <p className="text-sm text-muted-foreground">Project not found or an error occurred.</p>
        <Button variant="outline" onClick={() => navigate('projects')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Projects
        </Button>
      </div>
    )
  }

  const projectData = project as any

  const projectStatusColors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-800',
    on_hold: 'bg-amber-100 text-amber-800',
    planning: 'bg-sky-100 text-sky-800',
    completed: 'bg-teal-100 text-teal-800',
    cancelled: 'bg-slate-100 text-slate-600',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('projects')} className="text-muted-foreground -ml-2">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">{projectData.name}</h1>
              <Badge className={cn('text-xs', projectStatusColors[projectData.status] || 'bg-secondary')}>
                {projectData.status?.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{projectData.code} {projectData.address ? `• ${projectData.address}` : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Layers className="h-4 w-4" />
          <span>Progress: <span className="font-medium text-foreground">{projectData.progress ?? 0}%</span></span>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <ScrollArea className="w-full">
          <TabsList className="w-full justify-start h-auto flex-wrap gap-1 bg-muted/50 p-1">
            <TabsTrigger value="overview" className="text-xs px-3 h-8 data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <TrendingUp className="h-3.5 w-3.5 mr-1" /> Overview
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs px-3 h-8 data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <ListTodo className="h-3.5 w-3.5 mr-1" /> Tasks
            </TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs px-3 h-8 data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <Flag className="h-3.5 w-3.5 mr-1" /> Timeline
            </TabsTrigger>
            <TabsTrigger value="open-items" className="text-xs px-3 h-8 data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <CircleDot className="h-3.5 w-3.5 mr-1" /> Open Items
            </TabsTrigger>
            <TabsTrigger value="rfis" className="text-xs px-3 h-8 data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <MessageSquare className="h-3.5 w-3.5 mr-1" /> RFIs
            </TabsTrigger>
            <TabsTrigger value="change-events" className="text-xs px-3 h-8 data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Change Events
            </TabsTrigger>
            <TabsTrigger value="change-orders" className="text-xs px-3 h-8 data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <FileText className="h-3.5 w-3.5 mr-1" /> Change Orders
            </TabsTrigger>
            <TabsTrigger value="team" className="text-xs px-3 h-8 data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <Users className="h-3.5 w-3.5 mr-1" /> Team
            </TabsTrigger>
            <TabsTrigger value="commitments" className="text-xs px-3 h-8 data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Commitments
            </TabsTrigger>
            <TabsTrigger value="direct-costs" className="text-xs px-3 h-8 data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <Receipt className="h-3.5 w-3.5 mr-1" /> Direct Costs
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-xs px-3 h-8 data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <FolderOpen className="h-3.5 w-3.5 mr-1" /> Documents
            </TabsTrigger>
            <TabsTrigger value="daily-notes" className="text-xs px-3 h-8 data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <ClipboardCheck className="h-3.5 w-3.5 mr-1" /> Daily Notes
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-xs px-3 h-8 data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <BarChart3 className="h-3.5 w-3.5 mr-1" /> Insights
            </TabsTrigger>
          </TabsList>
        </ScrollArea>

        {/* Tab Contents */}
        <TabsContent value="overview"><OverviewTab projectId={effectiveProjectId} /></TabsContent>
        <TabsContent value="tasks"><TasksTab projectId={effectiveProjectId} /></TabsContent>
        <TabsContent value="timeline"><TimelineTab projectId={effectiveProjectId} /></TabsContent>
        <TabsContent value="open-items"><OpenItemsTab projectId={effectiveProjectId} /></TabsContent>
        <TabsContent value="rfis"><RfisTab projectId={effectiveProjectId} /></TabsContent>
        <TabsContent value="change-events"><ChangeEventsTab projectId={effectiveProjectId} /></TabsContent>
        <TabsContent value="change-orders"><ChangeOrdersTab projectId={effectiveProjectId} /></TabsContent>
        <TabsContent value="team"><TeamTab projectId={effectiveProjectId} /></TabsContent>
        <TabsContent value="commitments"><CommitmentsTab projectId={effectiveProjectId} /></TabsContent>
        <TabsContent value="direct-costs"><DirectCostsTab projectId={effectiveProjectId} /></TabsContent>
        <TabsContent value="documents"><DocumentsTab projectId={effectiveProjectId} /></TabsContent>
        <TabsContent value="daily-notes"><DailyNotesTab projectId={effectiveProjectId} /></TabsContent>
        <TabsContent value="insights"><InsightsTab projectId={effectiveProjectId} /></TabsContent>
      </Tabs>
    </div>
  )
}