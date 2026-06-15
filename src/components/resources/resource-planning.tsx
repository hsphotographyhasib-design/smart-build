'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { api, useAppStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
  Pencil,
  Trash2,
  Filter,
  Calendar,
  List,
  Clock,
  LayoutGrid,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'

// ──────────────────────────────────────────
// ধরন
// ──────────────────────────────────────────

interface ResourceAssignment {
  id: string
  resourceId: string
  resourceName: string
  resourceType: string
  projectId: string
  projectName: string
  role: string
  shift: string
  location: string
  startDate: string
  endDate: string | null
  dailyCost: number
  hourlyCost: number
  notes: string
  status: string
}

interface Project {
  id: string
  name: string
  code: string
  status: string
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

const typeBadgeColors: Record<string, string> = {
  labour: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  employee: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  equipment: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  vehicle: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  tool: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  subcontractor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
}

const shiftColors: Record<string, string> = {
  day: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  night: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  split: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}

const emptyForm = {
  projectId: '',
  resourceType: '',
  resourceId: '',
  role: '',
  shift: '',
  location: '',
  startDate: '',
  endDate: '',
  dailyCost: '',
  hourlyCost: '',
  notes: '',
}

// ──────────────────────────────────────────
// স্কেলিটন
// ──────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-16 rounded-full ml-auto" />
        </div>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────
// বরাদ্দ ফর্ম ডায়ালগ
// ──────────────────────────────────────────

function AssignmentFormDialog({
  open,
  onClose,
  editData,
  projects,
  onSubmit,
  isPending,
}: {
  open: boolean
  onClose: () => void
  editData: ResourceAssignment | null
  projects: Project[]
  onSubmit: (data: Record<string, unknown>) => void
  isPending: boolean
}) {
  const [form, setForm] = useState(emptyForm)
  const [resources, setResources] = useState<Array<{ id: string; name: string }>>([])
  const [prevOpen, setPrevOpen] = useState(false)
  
  // ফর্ম রিসেট করতে ডায়ালগ খোলার ট্রানজিশন সনাক্ত করা হচ্ছে
  if (open && !prevOpen) {
    setPrevOpen(true)
    setForm(editData ? {
      projectId: editData.projectId || '',
      resourceType: editData.resourceType || '',
      resourceId: editData.resourceId || '',
      role: editData.role || '',
      shift: editData.shift || '',
      location: editData.location || '',
      startDate: editData.startDate ? format(parseISO(editData.startDate), 'yyyy-MM-dd') : '',
      endDate: editData.endDate ? format(parseISO(editData.endDate), 'yyyy-MM-dd') : '',
      dailyCost: editData.dailyCost?.toString() || '',
      hourlyCost: editData.hourlyCost?.toString() || '',
      notes: editData.notes || '',
    } : emptyForm)
  }
  if (!open && prevOpen) {
    setPrevOpen(false)
  }

  const handleResourceTypeChange = (type: string) => {
    setForm(prev => ({ ...prev, resourceType: type, resourceId: '' }))
    if (!type) { setResources([]); return }
    let url = ''
    if (type === 'labour' || type === 'employee') {
      url = '/api/labour-groups'
    } else {
      url = `/api/assets?type=${type === 'subcontractor' ? 'equipment' : type}`
    }
    api.get(url).then((res) => {
      if (res.success && res.data) {
        if (type === 'labour' || type === 'employee') {
          const groups = res.data as Array<{ id: string; name: string; labours?: Array<{ id: string; name: string }> }>
          const items = groups.flatMap((g: any) =>
            (g.labours || []).map((l: any) => ({ id: l.id, name: `${l.name} (${g.name})` }))
          )
          setResources(items)
        } else {
          const items = (res.data as Array<{ id: string; name: string }>).map((a) => ({ id: a.id, name: a.name }))
          setResources(items)
        }
      }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.projectId || !form.resourceType || !form.role) {
      toast.error('Project, Resource Type, and Role are required')
      return
    }
    onSubmit({
      projectId: form.projectId,
      resourceType: form.resourceType,
      resourceId: form.resourceId,
      role: form.role,
      shift: form.shift,
      location: form.location,
      startDate: form.startDate,
      endDate: form.endDate || null,
      dailyCost: parseFloat(form.dailyCost) || 0,
      hourlyCost: parseFloat(form.hourlyCost) || 0,
      notes: form.notes,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle>{editData ? 'Edit Assignment' : 'New Resource Assignment'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project *</Label>
              <Select value={form.projectId} onValueChange={(v) => setForm({ ...form, projectId: v })}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Resource Type *</Label>
              <Select value={form.resourceType} onValueChange={handleResourceTypeChange}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="labour">Labour</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="vehicle">Vehicle</SelectItem>
                  <SelectItem value="tool">Tool</SelectItem>
                  <SelectItem value="subcontractor">Subcontractor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {form.resourceType && (
            <div className="space-y-2">
              <Label>Resource</Label>
              <Select value={form.resourceId} onValueChange={(v) => setForm({ ...form, resourceId: v })}>
                <SelectTrigger><SelectValue placeholder={`Select ${form.resourceType}`} /></SelectTrigger>
                <SelectContent>
                  {resources.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Role *</Label>
              <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. Site Supervisor" required />
            </div>
            <div className="space-y-2">
              <Label>Shift</Label>
              <Select value={form.shift} onValueChange={(v) => setForm({ ...form, shift: v })}>
                <SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
                  <SelectItem value="split">Split</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Site location" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Daily Cost (₹)</Label>
              <Input type="number" value={form.dailyCost} onChange={(e) => setForm({ ...form, dailyCost: e.target.value })} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>Hourly Cost (₹)</Label>
              <Input type="number" value={form.hourlyCost} onChange={(e) => setForm({ ...form, hourlyCost: e.target.value })} placeholder="0" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." rows={3} />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={isPending}>
              {isPending ? (editData ? 'Updating...' : 'Creating...') : (editData ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ──────────────────────────────────────────
// প্রধান কম্পোনেন্ট
// ──────────────────────────────────────────

export function ResourcePlanning() {
  const [assignments, setAssignments] = useState<ResourceAssignment[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [viewTab, setViewTab] = useState('list')
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<ResourceAssignment | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      api.get<ResourceAssignment[]>('/api/resources/assignments'),
      api.get<Project[]>('/api/projects'),
    ])
      .then(([assignRes, projRes]) => {
        if (assignRes.success && assignRes.data) setAssignments(assignRes.data)
        else if (assignRes.error) setError(assignRes.error)
        if (projRes.success && projRes.data) setProjects(projRes.data)
      })
      .catch((err) => setError(err.message || 'Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    let cancelled = false
    const load = () => {
      setLoading(true)
      Promise.all([
        api.get('/api/resources/assignments'),
        api.get('/api/projects'),
      ])
        .then(([assignRes, projRes]) => {
          if (cancelled) return
          if (assignRes.success && assignRes.data) setAssignments(assignRes.data)
          else if (assignRes.error) setError(assignRes.error)
          if (projRes.success && projRes.data) setProjects(projRes.data)
        })
        .catch((err) => { if (!cancelled) setError(err.message || 'Failed to load') })
        .finally(() => { if (!cancelled) setLoading(false) })
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filteredAssignments = useMemo(() => {
    let items = assignments
    if (typeFilter !== 'all') items = items.filter((a) => a.resourceType === typeFilter)
    if (statusFilter !== 'all') items = items.filter((a) => a.status === statusFilter)
    if (projectFilter !== 'all') items = items.filter((a) => a.projectId === projectFilter)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      items = items.filter((a) =>
        a.resourceName?.toLowerCase().includes(q) ||
        a.projectName?.toLowerCase().includes(q) ||
        a.role?.toLowerCase().includes(q)
      )
    }
    return items
  }, [assignments, typeFilter, statusFilter, projectFilter, searchQuery])

  const handleSubmit = (data: Record<string, unknown>) => {
    setSubmitting(true)
    const url = editItem ? `/api/resources/assignments/${editItem.id}` : '/api/resources/assignments'
    const method = editItem ? api.put : api.post
    method(url, data)
      .then((res) => {
        if (res.success) {
          toast.success(editItem ? 'Assignment updated!' : 'Assignment created!')
          setCreateOpen(false)
          setEditItem(null)
          fetchData()
        } else {
          toast.error(res.error || 'Failed')
        }
      })
      .catch((err) => toast.error(err.message || 'Failed'))
      .finally(() => setSubmitting(false))
  }

  const handleDelete = () => {
    if (!deleteId) return
    setSubmitting(true)
    api.del(`/api/resources/assignments/${deleteId}`)
      .then((res) => {
        if (res.success) {
          toast.success('Assignment deleted')
          setDeleteId(null)
          fetchData()
        } else {
          toast.error(res.error || 'Failed to delete')
        }
      })
      .catch((err) => toast.error(err.message || 'Failed'))
      .finally(() => setSubmitting(false))
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resource Planning</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? 'Loading...' : `${assignments.length} assignment(s)`}
          </p>
        </div>
        <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />New Assignment
        </Button>
      </div>

      {/* View Tabs */}
      <Tabs value={viewTab} onValueChange={setViewTab}>
        <TabsList>
          <TabsTrigger value="calendar" className="gap-1.5"><Calendar className="h-3.5 w-3.5" />Calendar</TabsTrigger>
          <TabsTrigger value="timeline" className="gap-1.5"><Clock className="h-3.5 w-3.5" />Timeline</TabsTrigger>
          <TabsTrigger value="list" className="gap-1.5"><List className="h-3.5 w-3.5" />List</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <h3 className="font-semibold text-lg">Calendar View</h3>
              <p className="text-sm mt-1">Calendar visualization coming soon. Use the List view for now.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <LayoutGrid className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <h3 className="font-semibold text-lg">Timeline View</h3>
              <p className="text-sm mt-1">Gantt timeline visualization coming soon. Use the List view for now.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="mt-4 space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search assignments..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Resource Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="labour">Labour</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="vehicle">Vehicle</SelectItem>
                <SelectItem value="tool">Tool</SelectItem>
                <SelectItem value="subcontractor">Subcontractor</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="transferred">Transferred</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Project" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.filter((p) => p.status === 'active').map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {loading ? (
            <Card><CardContent className="p-0"><TableSkeleton /></CardContent></Card>
          ) : error ? (
            <Card className="border-red-200"><CardContent className="p-8 text-center"><p className="text-red-600 text-sm">{error}</p></CardContent></Card>
          ) : filteredAssignments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Search className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <h3 className="font-semibold">No Assignments Found</h3>
                <p className="text-sm mt-1">{searchQuery ? 'Try a different search.' : 'Create your first assignment.'}</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold text-xs">Resource Name</TableHead>
                      <TableHead className="font-semibold text-xs">Type</TableHead>
                      <TableHead className="font-semibold text-xs hidden md:table-cell">Project</TableHead>
                      <TableHead className="font-semibold text-xs hidden lg:table-cell">Role</TableHead>
                      <TableHead className="font-semibold text-xs hidden xl:table-cell">Shift</TableHead>
                      <TableHead className="font-semibold text-xs hidden lg:table-cell">Start Date</TableHead>
                      <TableHead className="font-semibold text-xs hidden xl:table-cell">End Date</TableHead>
                      <TableHead className="font-semibold text-xs hidden lg:table-cell text-right">Daily Cost</TableHead>
                      <TableHead className="font-semibold text-xs">Status</TableHead>
                      <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssignments.map((a) => (
                      <TableRow key={a.id} className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors">
                        <TableCell className="text-sm font-medium">{a.resourceName}</TableCell>
                        <TableCell>
                          <Badge className={cn('text-xs capitalize', typeBadgeColors[a.resourceType] || 'bg-secondary text-secondary-foreground')}>
                            {a.resourceType}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground truncate max-w-[180px]">{a.projectName || '—'}</TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{a.role || '—'}</TableCell>
                        <TableCell className="hidden xl:table-cell">
                          {a.shift ? (
                            <Badge className={cn('text-xs capitalize', shiftColors[a.shift] || 'bg-secondary')}>{a.shift}</Badge>
                          ) : '—'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {a.startDate ? format(parseISO(a.startDate), 'dd MMM yyyy') : '—'}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                          {a.endDate ? format(parseISO(a.endDate), 'dd MMM yyyy') : '—'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-right font-medium">
                          {a.dailyCost ? formatCurrency(a.dailyCost) : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn('text-xs capitalize', statusColors[a.status] || 'bg-secondary text-secondary-foreground')}>
                            {a.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditItem(a)}><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteId(a.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <AssignmentFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        editData={null}
        projects={projects}
        onSubmit={handleSubmit}
        isPending={submitting}
      />

      {/* Edit Dialog */}
      <AssignmentFormDialog
        open={!!editItem}
        onClose={() => setEditItem(null)}
        editData={editItem}
        projects={projects}
        onSubmit={handleSubmit}
        isPending={submitting}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assignment?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove this resource assignment. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete} disabled={submitting}>
              {submitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}