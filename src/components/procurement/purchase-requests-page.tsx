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
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
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
  FileText,
  CheckCircle,
  XCircle,
  Trash2,
  ShoppingCart,
  Eye,
  CalendarDays,
  Package,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

// ──────────────────────────────────────────
// প্রকারভেদ
// ──────────────────────────────────────────

interface PRItem {
  id?: string
  materialId?: string
  description: string
  quantity: number
  unit: string
  estimatedPrice?: number
}

interface PurchaseRequest {
  id: string
  requestNo: string
  projectId: string
  projectName: string
  projectCode: string
  status: string
  requiredBy: string | null
  notes: string | null
  createdById: string
  createdByName: string
  approvedById: string | null
  approvedByName: string | null
  items: PRItem[]
  purchaseOrder: { id: string; orderNo: string; status: string } | null
  createdAt: string
  updatedAt: string
}

interface Project {
  id: string
  name: string
  code: string
}

// ──────────────────────────────────────────
// সহায়ক ফাংশনসমূহ
// ──────────────────────────────────────────

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-secondary text-secondary-foreground hover:bg-secondary/80' },
  submitted: { label: 'Submitted', className: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800' },
  review: { label: 'Under Review', className: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800' },
  approved: { label: 'Approved', className: 'bg-emerald-600 text-white hover:bg-emerald-700 border-0' },
  rejected: { label: 'Rejected', className: 'bg-red-600 text-white hover:bg-red-700 border-0' },
  ordered: { label: 'Ordered', className: 'bg-teal-600 text-white hover:bg-teal-700 border-0' },
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return format(parseISO(dateStr), 'dd MMM yyyy')
}

// ──────────────────────────────────────────
// স্কেলেটন
// ──────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-16 ml-auto" />
        </div>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────
// ক্রয় অনুরোধ তৈরি ডায়ালগ
// ──────────────────────────────────────────

function CreatePRDialog() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    projectId: '',
    requiredBy: '',
    notes: '',
    status: 'draft',
  })
  const [items, setItems] = useState<PRItem[]>([
    { description: '', quantity: 1, unit: 'nos', estimatedPrice: 0 },
  ])
  const queryClient = useQueryClient()
  const user = useAppStore((s) => s.user)

  const { data: projects } = useQuery({
    queryKey: [...queryKeys.projects],
    queryFn: () => api.get('/api/projects').then((r) => r.data as Project[]),
  })

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/api/purchase-requests', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseRequests })
      toast.success('Purchase request created!')
      setOpen(false)
      resetForm()
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create'),
  })

  const resetForm = () => {
    setForm({ projectId: '', requiredBy: '', notes: '', status: 'draft' })
    setItems([{ description: '', quantity: 1, unit: 'nos', estimatedPrice: 0 }])
  }

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit: 'nos', estimatedPrice: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length <= 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof PRItem, value: string | number) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.projectId) { toast.error('Please select a project'); return }
    if (items.some((it) => !it.description.trim())) { toast.error('All items need a description'); return }

    createMutation.mutate({
      projectId: form.projectId,
      requiredBy: form.requiredBy || null,
      notes: form.notes || null,
      status: form.status,
      items: items.map((it) => ({
        description: it.description,
        quantity: it.quantity,
        unit: it.unit,
        estimatedPrice: it.estimatedPrice || null,
      })),
    })
  }

  const totalEstimate = items.reduce((sum, it) => sum + (it.estimatedPrice || 0) * it.quantity, 0)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        className="bg-amber-600 hover:bg-amber-700 text-white"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        New PR
      </Button>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Purchase Request</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project *</Label>
              <Select value={form.projectId} onValueChange={(v) => setForm({ ...form, projectId: v })}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {projects?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Required By</Label>
              <Input
                type="date"
                value={form.requiredBy}
                onChange={(e) => setForm({ ...form, requiredBy: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submit for Approval</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              placeholder="Any additional notes..."
            />
          </div>

          <Separator />

          {/* আইটেমসমূহ */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Item
              </Button>
            </div>

            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-end bg-muted/30 p-3 rounded-lg">
                <div className="col-span-12 sm:col-span-4 space-y-1">
                  {idx === 0 && <Label className="text-xs text-muted-foreground">Description *</Label>}
                  <Input
                    placeholder="Material description"
                    value={item.description}
                    onChange={(e) => updateItem(idx, 'description', e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-4 sm:col-span-2 space-y-1">
                  {idx === 0 && <Label className="text-xs text-muted-foreground">Qty</Label>}
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-4 sm:col-span-2 space-y-1">
                  {idx === 0 && <Label className="text-xs text-muted-foreground">Unit</Label>}
                  <Input
                    value={item.unit}
                    onChange={(e) => updateItem(idx, 'unit', e.target.value)}
                  />
                </div>
                <div className="col-span-3 sm:col-span-2 space-y-1">
                  {idx === 0 && <Label className="text-xs text-muted-foreground">Est. Price (₹)</Label>}
                  <Input
                    type="number"
                    min="0"
                    value={item.estimatedPrice || ''}
                    onChange={(e) => updateItem(idx, 'estimatedPrice', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => removeItem(idx)}
                    disabled={items.length <= 1}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex justify-end text-sm font-semibold">
              Total Estimate: {formatCurrency(totalEstimate)}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm() }}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-amber-600 hover:bg-amber-700 text-white"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create PR'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ──────────────────────────────────────────
// ক্রয় অনুরোধ দেখার ডায়ালগ
// ──────────────────────────────────────────

function ViewPRDialog({ pr, open, onClose }: { pr: PurchaseRequest | null; open: boolean; onClose: () => void }) {
  if (!pr) return null
  const totalEstimate = pr.items.reduce((sum, it) => sum + (it.estimatedPrice || 0) * it.quantity, 0)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-600" />
            {pr.requestNo}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Project</span>
              <p className="font-medium">{pr.projectName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Required By</span>
              <p className="font-medium">{formatDate(pr.requiredBy)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Created By</span>
              <p className="font-medium">{pr.createdByName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Status</span>
              <div className="mt-1">
                <Badge className={cn('text-xs', statusConfig[pr.status]?.className || '')}>
                  {statusConfig[pr.status]?.label || pr.status}
                </Badge>
              </div>
            </div>
          </div>

          {pr.notes && (
            <div className="text-sm">
              <span className="text-muted-foreground">Notes</span>
              <p className="mt-1 bg-muted/30 p-3 rounded-lg">{pr.notes}</p>
            </div>
          )}

          <Separator />
          <div className="text-sm font-semibold">Items ({pr.items.length})</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">#</TableHead>
                <TableHead className="text-xs">Description</TableHead>
                <TableHead className="text-xs text-right">Qty</TableHead>
                <TableHead className="text-xs">Unit</TableHead>
                <TableHead className="text-xs text-right">Est. Price</TableHead>
                <TableHead className="text-xs text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pr.items.map((item, idx) => (
                <TableRow key={item.id || idx}>
                  <TableCell className="text-xs">{idx + 1}</TableCell>
                  <TableCell className="text-sm">{item.description}</TableCell>
                  <TableCell className="text-sm text-right">{item.quantity}</TableCell>
                  <TableCell className="text-sm">{item.unit}</TableCell>
                  <TableCell className="text-sm text-right">{formatCurrency(item.estimatedPrice || 0)}</TableCell>
                  <TableCell className="text-sm text-right font-medium">{formatCurrency((item.estimatedPrice || 0) * item.quantity)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end font-semibold">
            Total: {formatCurrency(totalEstimate)}
          </div>

          {pr.purchaseOrder && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg text-sm">
              <span className="text-emerald-700 dark:text-emerald-300">
                Converted to PO: {pr.purchaseOrder.orderNo}
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ──────────────────────────────────────────
// প্রধান উপাদান
// ──────────────────────────────────────────

export function PurchaseRequestsPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [viewPR, setViewPR] = useState<PurchaseRequest | null>(null)
  const user = useAppStore((s) => s.user)
  const queryClient = useQueryClient()

  const { data: purchaseRequests, isLoading, error } = useQuery({
    queryKey: [...queryKeys.purchaseRequests, { status: statusFilter, projectId: projectFilter }],
    queryFn: () => {
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      if (projectFilter && projectFilter !== 'all') params.set('projectId', projectFilter)
      const qs = params.toString()
      return api.get(`/api/purchase-requests${qs ? `?${qs}` : ''}`).then((r) => r.data as PurchaseRequest[])
    },
  })

  const { data: projects } = useQuery({
    queryKey: [...queryKeys.projects],
    queryFn: () => api.get('/api/projects').then((r) => r.data as Project[]),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/api/purchase-requests/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseRequests })
      toast.success('Purchase request deleted')
      setDeleteId(null)
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete'),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.post(`/api/purchase-requests/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseRequests })
      toast.success('Purchase request approved')
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to approve'),
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.post(`/api/purchase-requests/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseRequests })
      toast.success('Purchase request rejected')
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to reject'),
  })

  const isAdmin = user?.role === 'admin' || user?.role === 'supervisor' || user?.role === 'store_manager'

  const statusCounts = useMemo(() => {
    if (!purchaseRequests) return {}
    const counts: Record<string, number> = {}
    for (const pr of purchaseRequests) counts[pr.status] = (counts[pr.status] || 0) + 1
    return counts
  }, [purchaseRequests])

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Purchase Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? 'Loading...' : purchaseRequests ? `${purchaseRequests.length} request(s)` : 'No requests'}
          </p>
        </div>
        <CreatePRDialog />
      </div>

      {/* ফিল্টারসমূহ */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {['all', 'draft', 'submitted', 'review', 'approved', 'rejected', 'ordered'].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className={cn(
                'text-xs capitalize',
                statusFilter === s && s === 'all' && 'bg-amber-600 hover:bg-amber-700 text-white',
                statusFilter === s && s !== 'all' && statusConfig[s]?.className,
              )}
            >
              {s === 'all' ? 'All' : statusConfig[s]?.label || s}
              {statusCounts[s] ? <span className="ml-1.5 text-[10px] opacity-70">({statusCounts[s]})</span> : null}
            </Button>
          ))}
        </div>

        <div className="sm:ml-auto w-full sm:w-52">
          <Select value={projectFilter} onValueChange={(v) => setProjectFilter(v)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects?.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* বিষয়বস্তু */}
      {isLoading ? (
        <Card><CardContent className="p-0"><TableSkeleton /></CardContent></Card>
      ) : error ? (
        <Card className="border-red-200">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 text-sm">Failed to load purchase requests. Please try again.</p>
          </CardContent>
        </Card>
      ) : purchaseRequests && purchaseRequests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg text-muted-foreground">No Purchase Requests</h3>
            <p className="text-sm text-muted-foreground mt-1">Create a new purchase request to get started.</p>
          </CardContent>
        </Card>
      ) : purchaseRequests ? (
        <Card className="overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-xs">Request No</TableHead>
                  <TableHead className="font-semibold text-xs">Project</TableHead>
                  <TableHead className="font-semibold text-xs hidden md:table-cell">Required By</TableHead>
                  <TableHead className="font-semibold text-xs text-center">Items</TableHead>
                  <TableHead className="font-semibold text-xs">Status</TableHead>
                  <TableHead className="font-semibold text-xs hidden sm:table-cell">Created</TableHead>
                  <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseRequests.map((pr) => (
                  <TableRow key={pr.id} className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors">
                    <TableCell>
                      <button onClick={() => setViewPR(pr)} className="text-sm font-mono font-medium text-amber-700 hover:underline">
                        {pr.requestNo}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{pr.projectName}</p>
                        <p className="text-xs text-muted-foreground">{pr.projectCode}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {formatDate(pr.requiredBy)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="text-xs">{pr.items.length}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs font-medium', statusConfig[pr.status]?.className || '')}>
                        {statusConfig[pr.status]?.label || pr.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {formatDate(pr.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setViewPR(pr)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {isAdmin && (pr.status === 'draft' || pr.status === 'submitted' || pr.status === 'review') && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              onClick={() => approveMutation.mutate(pr.id)}
                              disabled={approveMutation.isPending}
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => rejectMutation.mutate(pr.id)}
                              disabled={rejectMutation.isPending}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                        {(pr.status === 'draft') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setDeleteId(pr.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : null}

      {/* দেখার ডায়ালগ */}
      <ViewPRDialog pr={viewPR} open={!!viewPR} onClose={() => setViewPR(null)} />

      {/* মুছে ফেলার নিশ্চিতকরণ */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Purchase Request?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The purchase request and all its items will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
