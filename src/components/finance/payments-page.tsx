'use client'

import { useState, useMemo, useEffect } from 'react'
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
  CreditCard,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────

interface Payment {
  id: string
  paymentNo: string
  project: { id: string; name: string; code: string } | null
  invoice: { id: string; invoiceNo: string } | null
  amount: number
  method: string
  reference: string | null
  date: string
  status: string
  notes: string | null
}

interface ProjectOption {
  id: string
  name: string
  code: string
}

interface InvoiceOption {
  id: string
  invoiceNo: string
  total: number
  outstanding: number
}

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-secondary text-secondary-foreground' },
  submitted: { label: 'Submitted', className: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800' },
  review: { label: 'Review', className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800' },
  approved: { label: 'Approved', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' },
  paid: { label: 'Paid', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' },
  rejected: { label: 'Rejected', className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800' },
  cancelled: { label: 'Cancelled', className: 'bg-muted text-muted-foreground' },
}

const methodConfig: Record<string, string> = {
  bank_transfer: 'Bank Transfer',
  cheque: 'Cheque',
  cash: 'Cash',
  upi: 'UPI',
  neft: 'NEFT',
  rtgs: 'RTGS',
  imps: 'IMPS',
  other: 'Other',
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
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────
// Create Payment Dialog
// ──────────────────────────────────────────

function AddPaymentDialog({ projects }: { projects: ProjectOption[] }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    projectId: '',
    invoiceId: '',
    amount: '',
    method: 'bank_transfer',
    reference: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
  })
  const queryClient = useQueryClient()

  // Fetch invoices for selected project
  const { data: invoices = [] } = useQuery({
    queryKey: ['project-invoices', form.projectId],
    queryFn: () => api.get(`/api/invoices?projectId=${form.projectId}&status=approved,submitted,overdue`).then((r) => r.data as InvoiceOption[]),
    enabled: !!form.projectId,
  })

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/api/payments', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments })
      toast.success('Payment recorded successfully!')
      setOpen(false)
      setForm({ projectId: '', invoiceId: '', amount: '', method: 'bank_transfer', reference: '', date: format(new Date(), 'yyyy-MM-dd'), notes: '' })
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to record payment'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.projectId || !form.amount || parseFloat(form.amount) <= 0) {
      toast.error('Project and valid amount are required')
      return
    }
    createMutation.mutate({
      projectId: form.projectId,
      invoiceId: form.invoiceId || null,
      amount: parseFloat(form.amount),
      method: form.method,
      reference: form.reference.trim() || null,
      date: form.date,
      notes: form.notes.trim() || null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />Record Payment
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pay-project">Project *</Label>
              <Select value={form.projectId} onValueChange={(v) => setForm({ ...form, projectId: v, invoiceId: '' })}>
                <SelectTrigger><SelectValue placeholder="Select project..." /></SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pay-invoice">Invoice (Optional)</Label>
              <Select value={form.invoiceId} onValueChange={(v) => setForm({ ...form, invoiceId: v })}>
                <SelectTrigger><SelectValue placeholder="Select invoice..." /></SelectTrigger>
                <SelectContent>
                  {invoices.map((inv) => (
                    <SelectItem key={inv.id} value={inv.id}>
                      {inv.invoiceNo} — Outstanding: {formatCurrency(inv.outstanding)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pay-amount">Amount (₹) *</Label>
              <Input
                id="pay-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pay-method">Payment Method</Label>
              <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(methodConfig).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pay-ref">Reference / Cheque No</Label>
              <Input
                id="pay-ref"
                placeholder="Transaction reference"
                value={form.reference}
                onChange={(e) => setForm({ ...form, reference: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pay-date">Date *</Label>
              <Input
                id="pay-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pay-notes">Notes</Label>
            <Textarea id="pay-notes" placeholder="Payment notes..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving...' : 'Record Payment'}
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

function DeletePaymentDialog({ paymentId, paymentNo }: { paymentId: string; paymentNo: string }) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => api.del(`/api/payments/${paymentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments })
      toast.success('Payment deleted!')
      setOpen(false)
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete payment'),
  })

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4" />
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Payment</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete payment <span className="font-mono font-semibold">{paymentNo}</span>? This action cannot be undone.
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

export function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')

  const { data: payments, isLoading, error } = useQuery({
    queryKey: [...queryKeys.payments, { search: searchQuery, status: statusFilter, method: methodFilter }],
    queryFn: () => {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      if (methodFilter && methodFilter !== 'all') params.set('method', methodFilter)
      const qs = params.toString()
      return api.get(`/api/payments${qs ? `?${qs}` : ''}`).then((r) => r.data as Payment[])
    },
  })

  const projectOptions = useMemo(() => {
    if (!payments) return []
    const map = new Map<string, ProjectOption>()
    for (const p of payments) {
      if (p.project) {
        map.set(p.project.id, { id: p.project.id, name: p.project.name, code: p.project.code })
      }
    }
    return Array.from(map.values())
  }, [payments])

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? 'Loading...' : payments ? `${payments.length} payment${payments.length !== 1 ? 's' : ''}` : 'No payments'}
          </p>
        </div>
        <AddPaymentDialog projects={projectOptions} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(statusConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={methodFilter} onValueChange={setMethodFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="All Methods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            {Object.entries(methodConfig).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
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
            <p className="text-red-600 text-sm">Failed to load payments.</p>
          </CardContent>
        </Card>
      ) : payments && payments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg text-muted-foreground">No Payments Found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || statusFilter !== 'all' || methodFilter !== 'all'
                ? 'Try adjusting your filters.'
                : 'Record your first payment to get started.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <ScrollArea className="max-h-[calc(100vh-280px)]">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Payment No</TableHead>
                  <TableHead className="font-semibold hidden sm:table-cell">Project</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">Invoice</TableHead>
                  <TableHead className="font-semibold text-right">Amount</TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell">Method</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">Date</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments?.map((pay) => (
                  <TableRow key={pay.id}>
                    <TableCell className="font-mono text-sm font-medium">{pay.paymentNo}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">
                      {pay.project ? <span>{pay.project.name}</span> : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm font-mono text-muted-foreground">
                      {pay.invoice?.invoiceNo || '—'}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium text-emerald-600">{formatCurrency(pay.amount)}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground capitalize">
                      {methodConfig[pay.method] || pay.method}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{formatDate(pay.date)}</TableCell>
                    <TableCell>{getStatusBadge(pay.status)}</TableCell>
                    <TableCell className="text-right">
                      <DeletePaymentDialog paymentId={pay.id} paymentNo={pay.paymentNo} />
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