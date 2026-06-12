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
  ShoppingCart,
  Eye,
  Trash2,
  PackageCheck,
  Truck,
  AlertTriangle,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────

interface POItem {
  id?: string
  materialId?: string
  description: string
  quantity: number
  receivedQty: number
  unit: string
  unitPrice: number
  amount: number
}

interface PurchaseOrder {
  id: string
  orderNo: string
  projectId: string
  projectName: string
  projectCode: string
  supplierId: string
  supplierName: string
  supplierCode: string
  purchaseRequestId: string | null
  purchaseRequestNo: string | null
  status: string
  orderDate: string
  expectedDate: string | null
  subtotal: number
  tax: number
  total: number
  notes: string | null
  items: POItem[]
  createdAt: string
  updatedAt: string
}

interface Supplier {
  id: string
  name: string
  code: string
}

interface Project {
  id: string
  name: string
  code: string
}

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

const poStatusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-secondary text-secondary-foreground hover:bg-secondary/80' },
  sent: { label: 'Sent', className: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800' },
  partially_received: { label: 'Partial', className: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800' },
  fully_received: { label: 'Received', className: 'bg-emerald-600 text-white hover:bg-emerald-700 border-0' },
  billed: { label: 'Billed', className: 'bg-teal-600 text-white hover:bg-teal-700 border-0' },
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return format(parseISO(dateStr), 'dd MMM yyyy')
}

// ──────────────────────────────────────────
// Skeleton
// ──────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20 ml-auto" />
        </div>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────
// Create PO Dialog
// ──────────────────────────────────────────

function CreatePODialog() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    projectId: '',
    supplierId: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDate: '',
    notes: '',
    tax: 0,
  })
  const [items, setItems] = useState([
    { description: '', quantity: 1, unit: 'nos', unitPrice: 0 },
  ])
  const queryClient = useQueryClient()

  const { data: projects } = useQuery({
    queryKey: [...queryKeys.projects],
    queryFn: () => api.get('/api/projects').then((r) => r.data as Project[]),
  })

  const { data: suppliers } = useQuery({
    queryKey: [...queryKeys.suppliers],
    queryFn: () => api.get('/api/suppliers').then((r) => r.data as Supplier[]),
  })

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/api/purchase-orders', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders })
      toast.success('Purchase order created!')
      setOpen(false)
      resetForm()
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create'),
  })

  const resetForm = () => {
    setForm({ projectId: '', supplierId: '', orderDate: new Date().toISOString().split('T')[0], expectedDate: '', notes: '', tax: 0 })
    setItems([{ description: '', quantity: 1, unit: 'nos', unitPrice: 0 }])
  }

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit: 'nos', unitPrice: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length <= 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: string, value: string | number) => {
    const updated = [...items]
    ;(updated[index] as Record<string, string | number>)[field] = value
    setItems(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.projectId) { toast.error('Select a project'); return }
    if (!form.supplierId) { toast.error('Select a supplier'); return }
    if (items.some((it) => !it.description.trim())) { toast.error('All items need descriptions'); return }

    createMutation.mutate({
      projectId: form.projectId,
      supplierId: form.supplierId,
      orderDate: form.orderDate,
      expectedDate: form.expectedDate || null,
      notes: form.notes || null,
      tax: form.tax,
      items: items.map((it) => ({
        description: it.description,
        quantity: it.quantity,
        unit: it.unit,
        unitPrice: it.unitPrice,
      })),
    })
  }

  const subtotal = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        New PO
      </Button>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project *</Label>
              <Select value={form.projectId} onValueChange={(v) => setForm({ ...form, projectId: v })}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {projects?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Supplier *</Label>
              <Select value={form.supplierId} onValueChange={(v) => setForm({ ...form, supplierId: v })}>
                <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                <SelectContent>
                  {suppliers?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Order Date</Label>
              <Input
                type="date"
                value={form.orderDate}
                onChange={(e) => setForm({ ...form, orderDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Expected Date</Label>
              <Input
                type="date"
                value={form.expectedDate}
                onChange={(e) => setForm({ ...form, expectedDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tax (₹)</Label>
              <Input
                type="number"
                min="0"
                value={form.tax || ''}
                onChange={(e) => setForm({ ...form, tax: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              placeholder="Delivery instructions..."
            />
          </div>

          <Separator />

          {/* Items */}
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
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) => updateItem(idx, 'description', e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-4 sm:col-span-2 space-y-1">
                  {idx === 0 && <Label className="text-xs text-muted-foreground">Qty</Label>}
                  <Input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="col-span-4 sm:col-span-2 space-y-1">
                  {idx === 0 && <Label className="text-xs text-muted-foreground">Unit</Label>}
                  <Input value={item.unit} onChange={(e) => updateItem(idx, 'unit', e.target.value)} />
                </div>
                <div className="col-span-3 sm:col-span-2 space-y-1">
                  {idx === 0 && <Label className="text-xs text-muted-foreground">Unit Price (₹)</Label>}
                  <Input type="number" min="0" value={item.unitPrice || ''} onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="col-span-1 flex justify-center">
                  <Button type="button" variant="ghost" size="sm" className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeItem(idx)} disabled={items.length <= 1}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="space-y-1 flex justify-end text-sm">
              <span>Subtotal: <span className="font-semibold">{formatCurrency(subtotal)}</span></span>
            </div>
            <div className="flex justify-end text-sm font-semibold">
              Total: {formatCurrency(subtotal + form.tax)}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm() }}>Cancel</Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create PO'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ──────────────────────────────────────────
// View PO Dialog
// ──────────────────────────────────────────

function ViewPODialog({ po, open, onClose }: { po: PurchaseOrder | null; open: boolean; onClose: () => void }) {
  if (!po) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-amber-600" />
            {po.orderNo}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Project</span>
              <p className="font-medium">{po.projectName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Supplier</span>
              <p className="font-medium">{po.supplierName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Order Date</span>
              <p className="font-medium">{formatDate(po.orderDate)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Expected</span>
              <p className="font-medium">{formatDate(po.expectedDate)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge className={cn('text-xs font-medium', poStatusConfig[po.status]?.className || '')}>
              {poStatusConfig[po.status]?.label || po.status}
            </Badge>
            {po.purchaseRequestNo && (
              <span className="text-xs text-muted-foreground">From PR: {po.purchaseRequestNo}</span>
            )}
          </div>

          {po.notes && (
            <div className="text-sm">
              <span className="text-muted-foreground">Notes</span>
              <p className="mt-1 bg-muted/30 p-3 rounded-lg">{po.notes}</p>
            </div>
          )}

          <Separator />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">#</TableHead>
                <TableHead className="text-xs">Description</TableHead>
                <TableHead className="text-xs text-right">Qty</TableHead>
                <TableHead className="text-xs">Unit</TableHead>
                <TableHead className="text-xs text-right">Received</TableHead>
                <TableHead className="text-xs text-right">Unit Price</TableHead>
                <TableHead className="text-xs text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {po.items.map((item, idx) => (
                <TableRow key={item.id || idx}>
                  <TableCell className="text-xs">{idx + 1}</TableCell>
                  <TableCell className="text-sm">{item.description}</TableCell>
                  <TableCell className="text-sm text-right">{item.quantity}</TableCell>
                  <TableCell className="text-sm">{item.unit}</TableCell>
                  <TableCell className="text-sm text-right">
                    <span className={item.receivedQty < item.quantity ? 'text-amber-600' : 'text-emerald-600'}>
                      {item.receivedQty}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-right">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="text-sm text-right font-medium">{formatCurrency(item.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="space-y-1 flex justify-end text-sm">
            <span>Subtotal: {formatCurrency(po.subtotal)}</span>
            {po.tax > 0 && <span>Tax: {formatCurrency(po.tax)}</span>}
          </div>
          <div className="flex justify-end text-base font-bold">
            Total: {formatCurrency(po.total)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ──────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────

export function PurchaseOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [supplierFilter, setSupplierFilter] = useState('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [viewPO, setViewPO] = useState<PurchaseOrder | null>(null)
  const queryClient = useQueryClient()

  const { data: purchaseOrders, isLoading, error } = useQuery({
    queryKey: [...queryKeys.purchaseOrders, { status: statusFilter, supplierId: supplierFilter }],
    queryFn: () => {
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      if (supplierFilter && supplierFilter !== 'all') params.set('supplierId', supplierFilter)
      const qs = params.toString()
      return api.get(`/api/purchase-orders${qs ? `?${qs}` : ''}`).then((r) => r.data as PurchaseOrder[])
    },
  })

  const { data: suppliers } = useQuery({
    queryKey: [...queryKeys.suppliers],
    queryFn: () => api.get('/api/suppliers').then((r) => r.data as Supplier[]),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/api/purchase-orders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders })
      toast.success('Purchase order deleted')
      setDeleteId(null)
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete'),
  })

  const receiveMutation = useMutation({
    mutationFn: ({ id, status, items }: { id: string; status: string; items: POItem[] }) =>
      api.put(`/api/purchase-orders/${id}`, { status, items }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders })
      toast.success('Order status updated')
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update'),
  })

  const markReceived = (po: PurchaseOrder, partial: boolean) => {
    const updatedItems = po.items.map((item) => ({
      ...item,
      receivedQty: partial ? item.quantity : item.quantity,
    }))
    receiveMutation.mutate({
      id: po.id,
      status: partial ? 'partially_received' : 'fully_received',
      items: updatedItems,
    })
  }

  const statusCounts = useMemo(() => {
    if (!purchaseOrders) return {}
    const counts: Record<string, number> = {}
    for (const po of purchaseOrders) counts[po.status] = (counts[po.status] || 0) + 1
    return counts
  }, [purchaseOrders])

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? 'Loading...' : purchaseOrders ? `${purchaseOrders.length} order(s)` : 'No orders'}
          </p>
        </div>
        <CreatePODialog />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {['all', 'draft', 'sent', 'partially_received', 'fully_received', 'billed'].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className={cn(
                'text-xs',
                statusFilter === s && s === 'all' && 'bg-amber-600 hover:bg-amber-700 text-white',
                statusFilter === s && s !== 'all' && poStatusConfig[s]?.className,
              )}
            >
              {s === 'all' ? 'All' : poStatusConfig[s]?.label || s}
              {statusCounts[s] ? <span className="ml-1.5 text-[10px] opacity-70">({statusCounts[s]})</span> : null}
            </Button>
          ))}
        </div>

        <div className="sm:ml-auto w-full sm:w-52">
          <Select value={supplierFilter} onValueChange={(v) => setSupplierFilter(v)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All Suppliers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suppliers</SelectItem>
              {suppliers?.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <Card><CardContent className="p-0"><TableSkeleton /></CardContent></Card>
      ) : error ? (
        <Card className="border-red-200">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 text-sm">Failed to load purchase orders. Please try again.</p>
          </CardContent>
        </Card>
      ) : purchaseOrders && purchaseOrders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg text-muted-foreground">No Purchase Orders</h3>
            <p className="text-sm text-muted-foreground mt-1">Create a new purchase order to get started.</p>
          </CardContent>
        </Card>
      ) : purchaseOrders ? (
        <Card className="overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-xs">Order No</TableHead>
                  <TableHead className="font-semibold text-xs">Supplier</TableHead>
                  <TableHead className="font-semibold text-xs hidden md:table-cell">Project</TableHead>
                  <TableHead className="font-semibold text-xs text-right">Total</TableHead>
                  <TableHead className="font-semibold text-xs">Status</TableHead>
                  <TableHead className="font-semibold text-xs hidden sm:table-cell">Order Date</TableHead>
                  <TableHead className="font-semibold text-xs hidden lg:table-cell">Expected</TableHead>
                  <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrders.map((po) => (
                  <TableRow key={po.id} className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors">
                    <TableCell>
                      <button onClick={() => setViewPO(po)} className="text-sm font-mono font-medium text-amber-700 hover:underline">
                        {po.orderNo}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{po.supplierName}</p>
                        <p className="text-xs text-muted-foreground">{po.supplierCode}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{po.projectName}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{formatCurrency(po.total)}</TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs font-medium', poStatusConfig[po.status]?.className || '')}>
                        {poStatusConfig[po.status]?.label || po.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{formatDate(po.orderDate)}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{formatDate(po.expectedDate)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setViewPO(po)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {po.status === 'sent' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-amber-600 hover:bg-amber-50"
                              onClick={() => markReceived(po, true)}
                              disabled={receiveMutation.isPending}
                              title="Mark partial"
                            >
                              <Truck className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50"
                              onClick={() => markReceived(po, false)}
                              disabled={receiveMutation.isPending}
                              title="Mark fully received"
                            >
                              <PackageCheck className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                        {po.status === 'partially_received' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50"
                            onClick={() => markReceived(po, false)}
                            disabled={receiveMutation.isPending}
                            title="Mark fully received"
                          >
                            <PackageCheck className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {po.status === 'draft' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setDeleteId(po.id)}
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

      {/* View Dialog */}
      <ViewPODialog po={viewPO} open={!!viewPO} onClose={() => setViewPO(null)} />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Purchase Order?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The purchase order and all items will be permanently deleted.
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
