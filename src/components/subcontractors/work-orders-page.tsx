'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
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
import { Plus, Search, ClipboardList, Trash2, Eye, Pencil, Filter } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

interface WorkOrder {
  id: string
  orderNo: string
  description: string
  totalAmount: number
  retentionPercent: number
  status: string
  startDate: string | null
  endDate: string | null
  subContractor: { id: string; name: string; code: string }
  project: { id: string; name: string; code: string }
  createdAt: string
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

const statusColors: Record<string, string> = {
  draft: 'bg-secondary text-secondary-foreground',
  active: 'bg-emerald-600 text-white border-0',
  partial: 'bg-amber-600 text-white border-0',
  complete: 'bg-teal-600 text-white border-0',
  closed: 'bg-slate-500 text-white border-0',
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-5 w-16 rounded-full ml-auto" />
        </div>
      ))}
    </div>
  )
}

export function WorkOrdersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [scFilter, setScFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [viewItem, setViewItem] = useState<WorkOrder | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({
    subContractorId: '',
    projectId: '',
    description: '',
    totalAmount: '',
    retentionPercent: '10',
    startDate: '',
    endDate: '',
  })
  const queryClient = useQueryClient()

  const params = useMemo(() => {
    const p = new URLSearchParams()
    if (statusFilter !== 'all') p.set('status', statusFilter)
    if (scFilter !== 'all') p.set('subContractorId', scFilter)
    if (projectFilter !== 'all') p.set('projectId', projectFilter)
    return p
  }, [statusFilter, scFilter, projectFilter])

  const { data: items, isLoading, error } = useQuery({
    queryKey: ['work-orders', Object.fromEntries(params)],
    queryFn: () => api.get(`/api/work-orders?${params.toString()}`).then((r) => r.data as WorkOrder[]),
  })

  const { data: subContractors } = useQuery({
    queryKey: ['subcontractors'],
    queryFn: () => api.get('/api/subcontractors').then((r) => r.data as { id: string; name: string; code: string }[]),
  })

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/api/projects').then((r) => r.data as { id: string; name: string; code: string }[]),
  })

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/api/work-orders', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] })
      toast.success('Work order created!')
      setCreateOpen(false)
      setForm({ subContractorId: '', projectId: '', description: '', totalAmount: '', retentionPercent: '10', startDate: '', endDate: '' })
    },
    onError: (err: Error) => toast.error(err.message || 'Failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/api/work-orders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] })
      toast.success('Work order deleted')
      setDeleteId(null)
    },
    onError: (err: Error) => toast.error(err.message || 'Failed'),
  })

  const filteredItems = useMemo(() => {
    if (!items) return []
    if (!searchQuery) return items
    const q = searchQuery.toLowerCase()
    return items.filter((wo) =>
      wo.orderNo.toLowerCase().includes(q) ||
      wo.subContractor.name.toLowerCase().includes(q) ||
      wo.project.name.toLowerCase().includes(q) ||
      wo.description.toLowerCase().includes(q)
    )
  }, [items, searchQuery])

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.subContractorId || !form.projectId || !form.totalAmount) {
      toast.error('Sub-contractor, project, and amount are required')
      return
    }
    createMutation.mutate({
      ...form,
      totalAmount: parseFloat(form.totalAmount),
      retentionPercent: parseFloat(form.retentionPercent) || 10,
    })
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Work Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? 'Loading...' : items ? `${items.length} work order(s)` : 'No work orders'}
          </p>
        </div>
        <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />Add Work Order
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search orders..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="complete">Complete</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        {subContractors && (
          <Select value={scFilter} onValueChange={setScFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sub-Contractor" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sub-Contractors</SelectItem>
              {subContractors.map((sc) => (
                <SelectItem key={sc.id} value={sc.id}>{sc.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {projects && (
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Project" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {isLoading ? (
        <Card><CardContent className="p-0"><TableSkeleton /></CardContent></Card>
      ) : error ? (
        <Card className="border-red-200"><CardContent className="p-8 text-center"><p className="text-red-600 text-sm">Failed to load work orders.</p></CardContent></Card>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg text-muted-foreground">No Work Orders Found</h3>
            <p className="text-sm text-muted-foreground mt-1">{searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'Create your first work order.'}</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-xs">Order No</TableHead>
                  <TableHead className="font-semibold text-xs">Sub-Contractor</TableHead>
                  <TableHead className="font-semibold text-xs hidden md:table-cell">Project</TableHead>
                  <TableHead className="font-semibold text-xs text-right">Total</TableHead>
                  <TableHead className="font-semibold text-xs text-right">Retention%</TableHead>
                  <TableHead className="font-semibold text-xs">Status</TableHead>
                  <TableHead className="font-semibold text-xs hidden lg:table-cell">Start</TableHead>
                  <TableHead className="font-semibold text-xs hidden lg:table-cell">End</TableHead>
                  <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((wo) => (
                  <TableRow key={wo.id} className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors">
                    <TableCell className="text-sm font-mono font-medium text-amber-700">{wo.orderNo}</TableCell>
                    <TableCell className="text-sm">{wo.subContractor.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{wo.project.name}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{formatCurrency(wo.totalAmount)}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">{wo.retentionPercent}%</TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs capitalize', statusColors[wo.status] || statusColors.draft)}>{wo.status}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{wo.startDate ? format(parseISO(wo.startDate), 'dd MMM yyyy') : '—'}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{wo.endDate ? format(parseISO(wo.endDate), 'dd MMM yyyy') : '—'}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setViewItem(wo)}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteId(wo.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Work Order</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sub-Contractor *</Label>
                <Select value={form.subContractorId} onValueChange={(v) => setForm({ ...form, subContractorId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {subContractors?.map((sc) => (
                      <SelectItem key={sc.id} value={sc.id}>{sc.name} ({sc.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Project *</Label>
                <Select value={form.projectId} onValueChange={(v) => setForm({ ...form, projectId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {projects?.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name} ({p.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Work description" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Amount *</Label>
                <Input type="number" value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: e.target.value })} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Retention %</Label>
                <Input type="number" value={form.retentionPercent} onChange={(e) => setForm({ ...form, retentionPercent: e.target.value })} placeholder="10" />
              </div>
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
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-amber-600" />
              {viewItem?.orderNo}
            </DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={cn('text-xs capitalize', statusColors[viewItem.status] || statusColors.draft)}>{viewItem.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Sub-Contractor</span><p className="font-medium">{viewItem.subContractor.name}</p></div>
                <div><span className="text-muted-foreground">Project</span><p className="font-medium">{viewItem.project.name}</p></div>
                <div><span className="text-muted-foreground">Total Amount</span><p className="font-bold text-lg">{formatCurrency(viewItem.totalAmount)}</p></div>
                <div><span className="text-muted-foreground">Retention</span><p className="font-medium">{viewItem.retentionPercent}%</p></div>
                <div><span className="text-muted-foreground">Start Date</span><p className="font-medium">{viewItem.startDate ? format(parseISO(viewItem.startDate), 'dd MMM yyyy') : '—'}</p></div>
                <div><span className="text-muted-foreground">End Date</span><p className="font-medium">{viewItem.endDate ? format(parseISO(viewItem.endDate), 'dd MMM yyyy') : '—'}</p></div>
              </div>
              {viewItem.description && (
                <div><span className="text-sm text-muted-foreground">Description</span><p className="text-sm mt-1">{viewItem.description}</p></div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Work Order?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the work order.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={() => deleteId && deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}