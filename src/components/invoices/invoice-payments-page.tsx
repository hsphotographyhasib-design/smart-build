'use client'

import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppStore, api, queryKeys } from '@/lib/store'
import { useFormat } from '@/hooks/use-format'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  DollarSign, CreditCard, Clock, AlertTriangle, Eye, Plus,
  Banknote,
} from 'lucide-react'

// ─── কনফিগারেশন ───
const payStatusConfig: Record<string, { label: string; className: string }> = {
  unpaid: { label: 'Unpaid', className: 'bg-gray-100 text-gray-600' },
  partial: { label: 'Partial', className: 'bg-amber-100 text-amber-700' },
  paid: { label: 'Paid', className: 'bg-emerald-100 text-emerald-700' },
  overdue: { label: 'Overdue', className: 'bg-red-100 text-red-700' },
}

// ─── উপাদান ───
export function InvoicePaymentsPage() {
  const { navigate } = useAppStore()
  const { formatCurrency, formatDate } = useFormat()
  const queryClient = useQueryClient()

  const [recordDialog, setRecordDialog] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)

  // ফিল্টারসমূহ
  const [statusFilter, setStatusFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 20

  // অর্থ প্রদান ফর্ম
  const [payForm, setPayForm] = useState({
    amount: 0, method: 'bank_transfer', reference: '', bankReference: '', chequeNumber: '',
  })

  // ─── কুয়েরিসমূহ ───
  const params = useMemo(() => {
    const p = new URLSearchParams()
    if (statusFilter !== 'all') p.set('paymentStatus', statusFilter)
    if (projectFilter !== 'all') p.set('projectId', projectFilter)
    if (dateFrom) p.set('dateFrom', dateFrom)
    if (dateTo) p.set('dateTo', dateTo)
    p.set('page', String(page))
    p.set('limit', String(pageSize))
    return p.toString()
  }, [statusFilter, projectFilter, dateFrom, dateTo, page])

  const { data: payData, isLoading } = useQuery({
    queryKey: [...queryKeys.invoicePayments, params],
    queryFn: () => api.get<any>(`/api/invoicing/payments?${params}`),
  })

  const { data: projectsData } = useQuery({
    queryKey: ['projects-payments'],
    queryFn: () => api.get('/api/projects'),
  })

  const payments = payData?.data?.payments || payData?.data || []
  const summary = payData?.data?.summary
  const projects = projectsData?.data || []
  const totalItems = payData?.data?.total || payments.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  // ─── মিউটেশনসমূহ ───
  const recordMutation = useMutation({
    mutationFn: ({ invoiceId, body }: { invoiceId: string; body: any }) =>
      api.post(`/api/invoicing/payments/${invoiceId}/record`, body),
    onSuccess: () => {
      toast.success('Payment recorded')
      setRecordDialog(false)
      setSelectedInvoice(null)
      queryClient.invalidateQueries({ queryKey: queryKeys.invoicePayments })
    },
    onError: (e: any) => toast.error(e?.error || 'Failed to record payment'),
  })

  const openRecordDialog = (inv: any) => {
    setSelectedInvoice(inv)
    const outstanding = (inv.total || 0) - (inv.paidAmount || 0)
    setPayForm({
      amount: Math.max(0, outstanding),
      method: 'bank_transfer', reference: '', bankReference: '', chequeNumber: '',
    })
    setRecordDialog(true)
  }

  return (
    <div className="space-y-6">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoice Payments</h1>
          <p className="text-sm text-muted-foreground">Track and record invoice payments</p>
        </div>
      </div>

      {/* সারসংক্ষেপ কার্ড */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Paid This Month</span>
              <div className="p-2 rounded-lg bg-emerald-50">
                <Banknote className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-xl font-bold mt-2 text-emerald-600">{formatCurrency(summary?.paidThisMonth ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Outstanding</span>
              <div className="p-2 rounded-lg bg-orange-50">
                <CreditCard className="h-4 w-4 text-orange-600" />
              </div>
            </div>
            <p className="text-xl font-bold mt-2 text-orange-600">{formatCurrency(summary?.totalOutstanding ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Payments Pending</span>
              <div className="p-2 rounded-lg bg-amber-50">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <p className="text-xl font-bold mt-2">{summary?.pendingCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Overdue Payments</span>
              <div className="p-2 rounded-lg bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
            </div>
            <p className="text-xl font-bold mt-2 text-red-600">{summary?.overdueCount ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* ফিল্টারসমূহ */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger><SelectValue placeholder="Payment Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(payStatusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={projectFilter} onValueChange={v => { setProjectFilter(v); setPage(1) }}>
              <SelectTrigger><SelectValue placeholder="Project" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name || p.code}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }} placeholder="From" />
            <Input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1) }} placeholder="To" />
            <Button
              variant="outline"
              onClick={() => {
                setStatusFilter('all'); setProjectFilter('all'); setDateFrom(''); setDateTo(''); setPage(1)
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* টেবিল */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Invoice No</TableHead>
                  <TableHead className="text-xs">Project</TableHead>
                  <TableHead className="text-xs">Vendor</TableHead>
                  <TableHead className="text-xs text-right">Invoice Amount</TableHead>
                  <TableHead className="text-xs text-right">Paid Amount</TableHead>
                  <TableHead className="text-xs text-right">Outstanding</TableHead>
                  <TableHead className="text-xs">Payment Status</TableHead>
                  <TableHead className="text-xs">Last Payment</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 9 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-16" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-12">
                      No payment records found
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((inv: any, idx: number) => {
                    const outstanding = (inv.total || 0) - (inv.paidAmount || 0)
                    const ps = payStatusConfig[inv.paymentStatus] || payStatusConfig.unpaid
                    return (
                      <TableRow key={inv.id || idx} className="cursor-pointer hover:bg-muted/50" onClick={() => inv.id && navigate('invoice-detail', { id: inv.id })}>
                        <TableCell className="text-xs font-mono font-medium">{inv.invoiceNo || '—'}</TableCell>
                        <TableCell className="text-xs max-w-[140px] truncate">{inv.project?.name || '—'}</TableCell>
                        <TableCell className="text-xs max-w-[120px] truncate">{inv.vendorName || inv.vendor?.name || '—'}</TableCell>
                        <TableCell className="text-xs text-right font-medium">{formatCurrency(inv.total || 0)}</TableCell>
                        <TableCell className="text-xs text-right text-emerald-600">{formatCurrency(inv.paidAmount || 0)}</TableCell>
                        <TableCell className="text-xs text-right font-medium text-orange-600">{formatCurrency(outstanding)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={cn('text-[10px] px-1.5 py-0', ps.className)}>{ps.label}</Badge>
                        </TableCell>
                        <TableCell className="text-xs">{inv.lastPaymentDate ? formatDate(inv.lastPaymentDate) : '—'}</TableCell>
                        <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                          {outstanding > 0 && (
                            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => openRecordDialog(inv)}>
                              <DollarSign className="h-3 w-3" /> Record
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* পেজিনেশন */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-xs text-muted-foreground">
                Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, totalItems)} of {totalItems}
              </p>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  ‹
                </Button>
                <span className="flex items-center px-3 text-xs">{page} / {totalPages}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  ›
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── অর্থ প্রদান রেকর্ড ডায়ালগ ─── */}
      <Dialog open={recordDialog} onOpenChange={open => { setRecordDialog(open); if (!open) setSelectedInvoice(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              {selectedInvoice && (
                <>Invoice: <span className="font-mono font-medium">{selectedInvoice.invoiceNo}</span> — Outstanding: <span className="font-semibold">{formatCurrency((selectedInvoice.total || 0) - (selectedInvoice.paidAmount || 0))}</span></>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Amount *</Label>
                <Input
                  type="number" min={0} step={0.01}
                  value={payForm.amount}
                  onChange={e => setPayForm(f => ({ ...f, amount: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Method *</Label>
                <Select value={payForm.method} onValueChange={v => setPayForm(f => ({ ...f, method: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="online">Online Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reference Number</Label>
              <Input value={payForm.reference} onChange={e => setPayForm(f => ({ ...f, reference: e.target.value }))} placeholder="Payment reference" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Bank Reference</Label>
                <Input value={payForm.bankReference} onChange={e => setPayForm(f => ({ ...f, bankReference: e.target.value }))} placeholder="Bank transaction ref" />
              </div>
              <div className="space-y-2">
                <Label>Cheque Number</Label>
                <Input value={payForm.chequeNumber} onChange={e => setPayForm(f => ({ ...f, chequeNumber: e.target.value }))} placeholder="Cheque #" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRecordDialog(false); setSelectedInvoice(null) }}>Cancel</Button>
            <Button
              onClick={() => selectedInvoice && recordMutation.mutate({ invoiceId: selectedInvoice.id, body: payForm })}
              disabled={recordMutation.isPending || payForm.amount <= 0}
              className="gap-1"
            >
              {recordMutation.isPending && <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}