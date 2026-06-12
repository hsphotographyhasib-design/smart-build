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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { Plus, Search, FileText, Eye, Trash2, Filter, X } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

interface SalesInvoice {
  id: string
  invoiceNo: string
  customerId: string | null
  customer: { id: string; name: string } | null
  invoiceDate: string
  dueDate: string | null
  subtotal: number
  tax: number
  total: number
  paidAmount: number
  status: string
  notes: string | null
  createdAt: string
}

interface CustomerOption { id: string; name: string }

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

const statusColors: Record<string, string> = {
  draft: 'bg-secondary text-secondary-foreground',
  sent: 'bg-amber-600 text-white border-0',
  partial: 'bg-orange-600 text-white border-0',
  paid: 'bg-emerald-600 text-white border-0',
  overdue: 'bg-red-600 text-white border-0',
  cancelled: 'bg-slate-500 text-white border-0',
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-16 rounded-full ml-auto" />
        </div>
      ))}
    </div>
  )
}

export function SalesInvoicesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewItem, setViewItem] = useState<SalesInvoice | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({
    customerId: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    taxPercent: '18',
    notes: '',
  })
  const [lineItems, setLineItems] = useState([{ description: '', quantity: '1', unitPrice: '' }])
  const queryClient = useQueryClient()

  const params = useMemo(() => {
    const p = new URLSearchParams()
    if (statusFilter !== 'all') p.set('status', statusFilter)
    if (searchQuery) p.set('search', searchQuery)
    return p
  }, [statusFilter, searchQuery])

  const { data: items, isLoading, error } = useQuery({
    queryKey: ['sales-invoices', Object.fromEntries(params)],
    queryFn: () => api.get(`/api/sales-invoices?${params.toString()}`).then((r) => r.data as SalesInvoice[]),
  })

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.get('/api/customers?isActive=true').then((r) => r.data as CustomerOption[]),
  })

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/api/sales-invoices', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-invoices'] })
      toast.success('Sales invoice created!')
      setCreateOpen(false)
      setForm({ customerId: '', invoiceDate: new Date().toISOString().split('T')[0], dueDate: '', taxPercent: '18', notes: '' })
      setLineItems([{ description: '', quantity: '1', unitPrice: '' }])
    },
    onError: (err: Error) => toast.error(err.message || 'Failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/api/sales-invoices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-invoices'] })
      toast.success('Invoice deleted')
      setViewItem(null)
    },
    onError: (err: Error) => toast.error(err.message || 'Failed'),
  })

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: '1', unitPrice: '' }])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) return
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const updateLineItem = (index: number, field: string, value: string) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }
    setLineItems(updated)
  }

  const lineTotal = lineItems.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0
    const price = parseFloat(item.unitPrice) || 0
    return sum + qty * price
  }, 0)

  const taxAmount = lineTotal * (parseFloat(form.taxPercent) || 0) / 100
  const grandTotal = lineTotal + taxAmount

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.invoiceDate) { toast.error('Invoice date is required'); return }
    createMutation.mutate({
      ...form,
      items: lineItems,
      taxPercent: parseFloat(form.taxPercent),
    })
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales Invoices</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? 'Loading...' : items ? `${items.length} invoice(s)` : 'No invoices'}
          </p>
        </div>
        <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />New Invoice
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search invoice no, customer..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Card><CardContent className="p-0"><TableSkeleton /></CardContent></Card>
      ) : error ? (
        <Card className="border-red-200"><CardContent className="p-8 text-center"><p className="text-red-600 text-sm">Failed to load invoices.</p></CardContent></Card>
      ) : items && items.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg text-muted-foreground">No Sales Invoices Found</h3>
            <p className="text-sm text-muted-foreground mt-1">Create your first sales invoice.</p>
          </CardContent>
        </Card>
      ) : items ? (
        <Card className="overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-xs">Invoice No</TableHead>
                  <TableHead className="font-semibold text-xs">Customer</TableHead>
                  <TableHead className="font-semibold text-xs hidden md:table-cell">Date</TableHead>
                  <TableHead className="font-semibold text-xs hidden lg:table-cell">Due Date</TableHead>
                  <TableHead className="font-semibold text-xs text-right">Total</TableHead>
                  <TableHead className="font-semibold text-xs text-right hidden md:table-cell">Paid</TableHead>
                  <TableHead className="font-semibold text-xs">Status</TableHead>
                  <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((si) => (
                  <TableRow key={si.id} className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors">
                    <TableCell className="text-sm font-mono font-medium text-amber-700">{si.invoiceNo}</TableCell>
                    <TableCell className="text-sm">{si.customer?.name || '—'}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{format(parseISO(si.invoiceDate), 'dd MMM yyyy')}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{si.dueDate ? format(parseISO(si.dueDate), 'dd MMM yyyy') : '—'}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{formatCurrency(si.total)}</TableCell>
                    <TableCell className="text-right text-sm hidden md:table-cell text-muted-foreground">{formatCurrency(si.paidAmount)}</TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs capitalize', statusColors[si.status] || statusColors.draft)}>{si.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setViewItem(si)}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => { if (confirm('Delete this invoice?')) deleteMutation.mutate(si.id) }}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : null}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Sales Invoice</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Customer</Label>
                <Select value={form.customerId} onValueChange={(v) => setForm({ ...form, customerId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>
                    {customers?.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Invoice Date *</Label>
                <Input type="date" value={form.invoiceDate} onChange={(e) => setForm({ ...form, invoiceDate: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addLineItem}><Plus className="h-3 w-3 mr-1" />Add Item</Button>
              </div>
              <div className="space-y-2">
                {lineItems.map((item, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      {index === 0 && <Label className="text-xs text-muted-foreground">Description</Label>}
                      <Input value={item.description} onChange={(e) => updateLineItem(index, 'description', e.target.value)} placeholder="Item" />
                    </div>
                    <div className="w-20">
                      {index === 0 && <Label className="text-xs text-muted-foreground">Qty</Label>}
                      <Input type="number" value={item.quantity} onChange={(e) => updateLineItem(index, 'quantity', e.target.value)} />
                    </div>
                    <div className="w-28">
                      {index === 0 && <Label className="text-xs text-muted-foreground">Unit Price</Label>}
                      <Input type="number" value={item.unitPrice} onChange={(e) => updateLineItem(index, 'unitPrice', e.target.value)} />
                    </div>
                    <Button type="button" variant="ghost" size="sm" className="h-9 w-9 p-0 text-red-500" onClick={() => removeLineItem(index)} disabled={lineItems.length <= 1}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tax %</Label>
                <Input type="number" value={form.taxPercent} onChange={(e) => setForm({ ...form, taxPercent: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" />
              </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg space-y-1 text-sm text-right">
              <p>Subtotal: <span className="font-medium ml-2">{formatCurrency(lineTotal)}</span></p>
              <p>Tax: <span className="font-medium ml-2">{formatCurrency(taxAmount)}</span></p>
              <p className="text-lg font-bold pt-2 border-t">Total: <span className="ml-2">{formatCurrency(grandTotal)}</span></p>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Invoice'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-amber-600" />{viewItem?.invoiceNo}</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={cn('text-xs capitalize', statusColors[viewItem.status])}>{viewItem.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Customer</span><p className="font-medium">{viewItem.customer?.name || 'Walk-in'}</p></div>
                <div><span className="text-muted-foreground">Invoice Date</span><p className="font-medium">{format(parseISO(viewItem.invoiceDate), 'dd MMM yyyy')}</p></div>
                <div><span className="text-muted-foreground">Due Date</span><p className="font-medium">{viewItem.dueDate ? format(parseISO(viewItem.dueDate), 'dd MMM yyyy') : '—'}</p></div>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg space-y-1 text-sm text-right">
                <p>Subtotal: <span className="font-medium ml-2">{formatCurrency(viewItem.subtotal)}</span></p>
                <p>Tax: <span className="font-medium ml-2">{formatCurrency(viewItem.tax)}</span></p>
                <p className="text-lg font-bold pt-2 border-t">Total: <span className="ml-2">{formatCurrency(viewItem.total)}</span></p>
                <p>Paid: <span className="font-medium ml-2 text-emerald-600">{formatCurrency(viewItem.paidAmount)}</span></p>
                <p>Balance: <span className="font-bold ml-2">{formatCurrency(viewItem.total - viewItem.paidAmount)}</span></p>
              </div>
              {viewItem.notes && <p className="text-sm text-muted-foreground">Notes: {viewItem.notes}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}