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
import { ScrollArea } from '@/components/ui/scroll-area'
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
  Trash2,
  Pencil,
  AlertTriangle,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────

interface InvoiceItem {
  id?: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
}

interface Invoice {
  id: string
  invoiceNo: string
  project: { id: string; name: string; code: string } | null
  clientId: string | null
  issueDate: string
  dueDate: string
  items: InvoiceItem[]
  taxPercent: number
  discountPercent: number
  subtotal: number
  taxAmount: number
  discountAmount: number
  total: number
  paid: number
  status: string
  notes: string | null
}

interface ProjectOption {
  id: string
  name: string
  code: string
}

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-secondary text-secondary-foreground' },
  submitted: { label: 'Submitted', className: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800' },
  approved: { label: 'Approved', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' },
  paid: { label: 'Paid', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' },
  overdue: { label: 'Overdue', className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800' },
  cancelled: { label: 'Cancelled', className: 'bg-muted text-muted-foreground' },
}

function getStatusBadge(status: string) {
  const config = statusConfig[status] || statusConfig.draft
  return <Badge variant="outline" className={cn('font-medium text-xs', config.className)}>{config.label}</Badge>
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return format(parseISO(dateStr), 'dd MMM yyyy')
}

function computeTotals(items: Array<{ quantity: number; unitPrice: number }>, taxPercent: number, discountPercent: number) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const taxAmount = subtotal * (taxPercent / 100)
  const discountAmount = subtotal * (discountPercent / 100)
  const total = subtotal + taxAmount - discountAmount
  return { subtotal, taxAmount, discountAmount, total }
}

// ──────────────────────────────────────────
// Skeleton Loader
// ──────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────
// Create / Edit Invoice Dialog
// ──────────────────────────────────────────

function InvoiceDialog({ invoice, projects }: { invoice?: Invoice; projects: ProjectOption[] }) {
  const isEdit = !!invoice
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    projectId: '',
    clientId: '',
    issueDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: '',
    taxPercent: '18',
    discountPercent: '0',
    notes: '',
    items: [{ description: '', quantity: '1', unit: 'nos', unitPrice: '0' }],
  })
  const queryClient = useQueryClient()

  const computed = useMemo(() => {
    const items = form.items.map((it) => ({
      quantity: parseFloat(it.quantity) || 0,
      unitPrice: parseFloat(it.unitPrice) || 0,
    }))
    return computeTotals(items, parseFloat(form.taxPercent) || 0, parseFloat(form.discountPercent) || 0)
  }, [form.items, form.taxPercent, form.discountPercent])

  const addItemRow = () => {
    setForm({ ...form, items: [...form.items, { description: '', quantity: '1', unit: 'nos', unitPrice: '0' }] })
  }

  const removeItemRow = (idx: number) => {
    if (form.items.length <= 1) return
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) })
  }

  const updateItem = (idx: number, field: string, value: string) => {
    const items = [...form.items]
    items[idx] = { ...items[idx], [field]: value }
    setForm({ ...form, items })
  }

  const mutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      isEdit
        ? api.put(`/api/invoices/${invoice!.id}`, body)
        : api.post('/api/invoices', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices })
      toast.success(isEdit ? 'Invoice updated!' : 'Invoice created!')
      setOpen(false)
    },
    onError: (err: Error) => toast.error(err.message || `Failed to ${isEdit ? 'update' : 'create'} invoice`),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.projectId || !form.issueDate) {
      toast.error('Project and issue date are required')
      return
    }
    const items = form.items
      .filter((it) => it.description.trim())
      .map((it) => ({
        description: it.description.trim(),
        quantity: parseFloat(it.quantity) || 0,
        unit: it.unit || 'nos',
        unitPrice: parseFloat(it.unitPrice) || 0,
      }))
    if (items.length === 0) {
      toast.error('Add at least one item with a description')
      return
    }
    mutation.mutate({
      projectId: form.projectId,
      clientId: form.clientId.trim() || null,
      issueDate: form.issueDate,
      dueDate: form.dueDate || null,
      taxPercent: parseFloat(form.taxPercent) || 0,
      discountPercent: parseFloat(form.discountPercent) || 0,
      notes: form.notes.trim() || null,
      items,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        className={cn(isEdit ? 'h-8 w-8 p-0' : 'bg-amber-600 hover:bg-amber-700 text-white')}
        variant={isEdit ? 'ghost' : 'default'}
        onClick={() => {
          if (isEdit && invoice) {
            setForm({
              projectId: invoice.project?.id || '',
              clientId: invoice.clientId || '',
              issueDate: invoice.issueDate,
              dueDate: invoice.dueDate || '',
              taxPercent: String(invoice.taxPercent),
              discountPercent: String(invoice.discountPercent),
              notes: invoice.notes || '',
              items: invoice.items.length > 0
                ? invoice.items.map((it) => ({ description: it.description, quantity: String(it.quantity), unit: it.unit, unitPrice: String(it.unitPrice) }))
                : [{ description: '', quantity: '1', unit: 'nos', unitPrice: '0' }],
            })
          } else {
            setForm({
              projectId: '', clientId: '', issueDate: format(new Date(), 'yyyy-MM-dd'), dueDate: '', taxPercent: '18', discountPercent: '0', notes: '',
              items: [{ description: '', quantity: '1', unit: 'nos', unitPrice: '0' }],
            })
          }
          setOpen(true)
        }}
      >
        {isEdit ? <Pencil className="h-4 w-4" /> : <><Plus className="h-4 w-4 mr-2" />New Invoice</>}
      </Button>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEdit ? 'Edit Invoice' : 'Create Invoice'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inv-project">Project *</Label>
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
              <Label htmlFor="inv-client">Client ID / Reference</Label>
              <Input id="inv-client" placeholder="Client reference" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inv-date">Issue Date *</Label>
              <Input id="inv-date" type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-due">Due Date</Label>
              <Input id="inv-due" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Line Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItemRow}>
                <Plus className="h-3 w-3 mr-1" />Add Item
              </Button>
            </div>
            <div className="space-y-2">
              {form.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-12 sm:col-span-4 space-y-1">
                    {idx === 0 && <span className="text-xs text-muted-foreground">Description</span>}
                    <Input
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) => updateItem(idx, 'description', e.target.value)}
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-2 space-y-1">
                    {idx === 0 && <span className="text-xs text-muted-foreground">Qty</span>}
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-2 space-y-1">
                    {idx === 0 && <span className="text-xs text-muted-foreground">Unit</span>}
                    <Select value={item.unit} onValueChange={(v) => updateItem(idx, 'unit', v)}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nos">Nos</SelectItem>
                        <SelectItem value="sqft">Sq.Ft</SelectItem>
                        <SelectItem value="sqm">Sq.M</SelectItem>
                        <SelectItem value="cum">Cu.M</SelectItem>
                        <SelectItem value="kg">Kg</SelectItem>
                        <SelectItem value="mt">MT</SelectItem>
                        <SelectItem value="m">M</SelectItem>
                        <SelectItem value="lot">Lot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-4 sm:col-span-3 space-y-1">
                    {idx === 0 && <span className="text-xs text-muted-foreground">Unit Price (₹)</span>}
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-center">
                    {form.items.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" className="h-9 w-9 p-0 text-red-500 hover:text-red-700" onClick={() => removeItemRow(idx)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Summary */}
          <div className="rounded-lg border p-3 space-y-1.5 text-sm bg-muted/30">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(computed.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax ({form.taxPercent}%)</span><span>{formatCurrency(computed.taxAmount)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Discount ({form.discountPercent}%)</span><span className="text-red-600">-{formatCurrency(computed.discountAmount)}</span></div>
            <Separator />
            <div className="flex justify-between font-bold text-base"><span>Total</span><span>{formatCurrency(computed.total)}</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inv-tax">Tax %</Label>
              <Input id="inv-tax" type="number" min="0" step="0.5" value={form.taxPercent} onChange={(e) => setForm({ ...form, taxPercent: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-disc">Discount %</Label>
              <Input id="inv-disc" type="number" min="0" step="0.5" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="inv-notes">Notes</Label>
            <Textarea id="inv-notes" placeholder="Invoice notes..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : isEdit ? 'Update Invoice' : 'Create Invoice'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ──────────────────────────────────────────
// Delete Confirmation
// ──────────────────────────────────────────

function DeleteInvoiceDialog({ invoiceId, invoiceNo }: { invoiceId: string; invoiceNo: string }) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => api.del(`/api/invoices/${invoiceId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices })
      toast.success('Invoice deleted!')
      setOpen(false)
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete invoice'),
  })

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4" />
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete invoice <span className="font-mono font-semibold">{invoiceNo}</span>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ──────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────

export function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const { data: invoices, isLoading, error } = useQuery({
    queryKey: [...queryKeys.invoices, { search: searchQuery, status: statusFilter }],
    queryFn: () => {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      const qs = params.toString()
      return api.get(`/api/invoices${qs ? `?${qs}` : ''}`).then((r) => r.data as Invoice[])
    },
  })

  // Derive project options from invoices
  const projectOptions = useMemo(() => {
    if (!invoices) return []
    const map = new Map<string, ProjectOption>()
    for (const inv of invoices) {
      if (inv.project) {
        map.set(inv.project.id, { id: inv.project.id, name: inv.project.name, code: inv.project.code })
      }
    }
    return Array.from(map.values())
  }, [invoices])

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? 'Loading...' : invoices ? `${invoices.length} invoice${invoices.length !== 1 ? 's' : ''}` : 'No invoices'}
          </p>
        </div>
        <InvoiceDialog projects={projectOptions} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(statusConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <Card><CardContent className="p-0"><TableSkeleton /></CardContent></Card>
      ) : error ? (
        <Card className="border-red-200">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-10 w-10 mx-auto text-red-400 mb-3" />
            <p className="text-red-600 text-sm">Failed to load invoices.</p>
          </CardContent>
        </Card>
      ) : invoices && invoices.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg text-muted-foreground">No Invoices Found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'Create your first invoice to get started.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <ScrollArea className="max-h-[calc(100vh-280px)]">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Invoice No</TableHead>
                  <TableHead className="font-semibold hidden sm:table-cell">Project</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">Issue Date</TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell">Due Date</TableHead>
                  <TableHead className="font-semibold text-right">Total</TableHead>
                  <TableHead className="font-semibold text-right hidden sm:table-cell">Paid</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices?.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-sm font-medium">{inv.invoiceNo}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">
                      {inv.project ? <span>{inv.project.name}</span> : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{formatDate(inv.issueDate)}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{formatDate(inv.dueDate)}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{formatCurrency(inv.total)}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground hidden sm:table-cell">{formatCurrency(inv.paid)}</TableCell>
                    <TableCell>{getStatusBadge(inv.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <InvoiceDialog invoice={inv} projects={projectOptions} />
                        <DeleteInvoiceDialog invoiceId={inv.id} invoiceNo={inv.invoiceNo} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      )}
    </div>
  )
}

