'use client'

import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import {
  Plus, Pencil, Eye, Send, CheckCircle, XCircle, FileText, DollarSign,
  Receipt, TrendingUp, ShieldCheck, CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFormat } from '@/hooks/use-format'

// ─── কনফিগারেশন ───
const invoiceStatusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  sent: { label: 'Sent', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  paid: { label: 'Paid', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString()
}

export function MaintenanceInvoices() {
  const { formatCurrency } = useFormat()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [viewingInvoice, setViewingInvoice] = useState<any>(null)
  const [editingInvoice, setEditingInvoice] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewingInvoice, setReviewingInvoice] = useState<any>(null)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve')
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewAdjustments, setReviewAdjustments] = useState({
    labourCost: 0, materialCost: 0, transportCost: 0, serviceCharges: 0, tax: 0, discount: 0,
  })
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [payingInvoice, setPayingInvoice] = useState<any>(null)
  const [paymentForm, setPaymentForm] = useState({
    amount: 0, method: '', reference: '', date: new Date().toISOString().split('T')[0],
  })

  // ইনভয়েস আনা
  const { data: invData, isLoading } = useQuery({
    queryKey: ['maintenance-invoices', statusFilter],
    queryFn: () => {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      return api.get(`/api/maintenance/invoices${params.toString() ? `?${params.toString()}` : ''}`)
    },
  })
  const invoices = invData?.data || []

  // গ্রাহক আনা
  const { data: customersData } = useQuery({
    queryKey: ['customers-inv'],
    queryFn: () => api.get('/api/customers'),
  })
  const customers = customersData?.data || []

  // সংযোগের জন্য টিকেট আনা
  const { data: ticketsData } = useQuery({
    queryKey: ['maintenance-tickets-inv'],
    queryFn: () => api.get('/api/maintenance/tickets?status=resolved'),
  })
  const tickets = ticketsData?.data || []

  // তৈরি মিউটেশন
  const createMutation = useMutation({
    mutationFn: (body: any) => api.post('/api/maintenance/invoices', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-invoices'] })
      setCreateOpen(false)
      toast({ title: 'Invoice Created', description: 'New maintenance invoice created.' })
    },
    onError: (err: any) => toast({ title: 'Error', description: err.error || 'Failed', variant: 'destructive' }),
  })

  // আপডেট মিউটেশন
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => api.put(`/api/maintenance/invoices/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-invoices'] })
      setEditOpen(false)
      setEditingInvoice(null)
      setViewOpen(false)
      setViewingInvoice(null)
      toast({ title: 'Updated', description: 'Invoice updated.' })
    },
    onError: (err: any) => toast({ title: 'Error', description: err.error || 'Failed', variant: 'destructive' }),
  })

  // পর্যালোচনা মিউটেশন
  const reviewMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => api.post(`/api/maintenance/invoices/${id}/review`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-invoices'] })
      setReviewOpen(false)
      setReviewingInvoice(null)
      setViewOpen(false)
      setViewingInvoice(null)
      toast({ title: 'Review Complete', description: 'Invoice review processed.' })
    },
    onError: (err: any) => toast({ title: 'Review Failed', description: err.error || 'Failed', variant: 'destructive' }),
  })

  // অর্থ প্রদান রেকর্ড মিউটেশন
  const paymentMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => api.post(`/api/maintenance/invoices/${id}/record-payment`, body),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-invoices'] })
      setPaymentOpen(false)
      setPayingInvoice(null)
      toast({ title: 'Payment Recorded', description: 'Payment has been recorded successfully.' })
    },
    onError: (err: any) => toast({ title: 'Payment Failed', description: err.error || 'Failed', variant: 'destructive' }),
  })

  // স্ট্যাটাস পরিবর্তন মিউটেশন
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.put(`/api/maintenance/invoices/${id}`, { status }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-invoices'] })
      toast({ title: 'Status Updated', description: `Invoice marked as ${vars.status}.` })
    },
    onError: (err: any) => toast({ title: 'Error', description: err.error || 'Failed', variant: 'destructive' }),
  })

  // পরিসংখ্যান গণনা
  const draftCount = invoices.filter((inv: any) => inv.status === 'draft').length
  const sentCount = invoices.filter((inv: any) => inv.status === 'sent').length
  const paidCount = invoices.filter((inv: any) => inv.status === 'paid').length
  const totalRevenue = invoices.filter((inv: any) => inv.status === 'paid').reduce((sum: number, inv: any) => sum + (inv.total || 0), 0)

  // সারসংক্ষেপ মোট
  const summaryTotals = invoices.reduce(
    (acc, inv: any) => ({
      labour: acc.labour + (inv.labourCost || 0),
      materials: acc.materials + (inv.materialCost || 0),
      transport: acc.transport + (inv.transportCost || 0),
      service: acc.service + (inv.serviceCharges || 0),
      tax: acc.tax + (inv.tax || 0),
      discount: acc.discount + (inv.discount || 0),
      total: acc.total + (inv.total || 0),
    }),
    { labour: 0, materials: 0, transport: 0, service: 0, tax: 0, discount: 0, total: 0 }
  )

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Maintenance Invoicing</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Generate and manage invoices for maintenance work</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5 bg-rose-600 hover:bg-rose-700">
              <Plus className="h-3.5 w-3.5" /> New Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Invoice</DialogTitle>
              <DialogDescription>Generate a new maintenance invoice</DialogDescription>
            </DialogHeader>
            <CreateInvoiceForm
              customers={customers}
              tickets={tickets}
              onSubmit={(body) => createMutation.mutate(body)}
              loading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* পরিসংখ্যান কার্ড */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <p className="text-2xl font-bold">{invoices.length}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-gray-500" />
              <p className="text-xs text-muted-foreground">Draft</p>
            </div>
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{draftCount}</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Send className="h-4 w-4 text-amber-600" />
              <p className="text-xs text-muted-foreground">Sent</p>
            </div>
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{sentCount}</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <p className="text-xs text-muted-foreground">Paid</p>
            </div>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{paidCount}</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              <p className="text-xs text-muted-foreground">Revenue (Paid)</p>
            </div>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* স্ট্যাটাস ফিল্টার */}
      <div className="flex gap-2">
        {['all', 'draft', 'sent', 'paid', 'cancelled'].map((s) => (
          <Button
            key={s}
            size="sm"
            variant={statusFilter === s ? 'default' : 'outline'}
            className={statusFilter === s ? 'bg-rose-600 hover:bg-rose-700' : ''}
            onClick={() => setStatusFilter(s)}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>

      {/* টেবিল */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <FileText className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No invoices found</p>
              <Button size="sm" variant="outline" className="mt-3 gap-1.5 bg-rose-600 hover:bg-rose-700 text-white" onClick={() => setCreateOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> Create Invoice
              </Button>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="sticky top-0 bg-background z-10">
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden md:table-cell">Ticket</TableHead>
                    <TableHead className="hidden lg:table-cell text-right">Labour</TableHead>
                    <TableHead className="hidden lg:table-cell text-right">Materials</TableHead>
                    <TableHead className="text-right">Tax</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv: any) => {
                    const stat = invoiceStatusConfig[inv.status] || invoiceStatusConfig.draft
                    return (
                      <TableRow key={inv.id}>
                        <TableCell className="text-sm font-mono font-medium">{inv.mivNo}</TableCell>
                        <TableCell className="text-sm">{inv.customerName || inv.customer?.name || '—'}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{inv.ticketNo || '—'}</TableCell>
                        <TableCell className="hidden lg:table-cell text-right text-sm">{formatCurrency(inv.labourCost || 0)}</TableCell>
                        <TableCell className="hidden lg:table-cell text-right text-sm">{formatCurrency(inv.materialCost || 0)}</TableCell>
                        <TableCell className="text-right text-sm">{formatCurrency(inv.tax || 0)}</TableCell>
                        <TableCell className="text-right text-sm font-bold">{formatCurrency(inv.total || 0)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={cn('text-xs', stat.color)}>{stat.label}</Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{formatDate(inv.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setViewingInvoice(inv); setViewOpen(true) }} title="View">
                              <Eye className="h-3 w-3" />
                            </Button>
                            {inv.status === 'draft' && (
                              <>
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingInvoice(inv); setEditOpen(true) }} title="Edit">
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30" onClick={() => {
                                  setReviewingInvoice(inv)
                                  setReviewAction('approve')
                                  setReviewNotes('')
                                  setReviewAdjustments({ labourCost: 0, materialCost: 0, transportCost: 0, serviceCharges: 0, tax: 0, discount: 0 })
                                  setReviewOpen(true)
                                }}>
                                  <ShieldCheck className="h-3 w-3" /> Review
                                </Button>
                              </>
                            )}
                            {inv.status === 'sent' && (
                              <>
                                <Badge variant="secondary" className={cn('text-xs', invoiceStatusConfig.sent?.color)}>
                                  <Send className="h-2.5 w-2.5 mr-0.5" /> Sent
                                </Badge>
                                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30" onClick={() => {
                                  setPayingInvoice(inv)
                                  setPaymentForm({ amount: Math.max(0, (inv.total || 0) - (inv.paidAmount || 0)), method: '', reference: '', date: new Date().toISOString().split('T')[0] })
                                  setPaymentOpen(true)
                                }}>
                                  <CreditCard className="h-3 w-3" /> Pay
                                </Button>
                              </>
                            )}
                            {inv.status === 'paid' && (
                              <Badge variant="secondary" className={cn('text-xs gap-1', invoiceStatusConfig.paid?.color)}>
                                <CheckCircle className="h-2.5 w-2.5" /> Paid
                              </Badge>
                            )}
                            {(inv.status === 'draft' || inv.status === 'sent') && (
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => statusMutation.mutate({ id: inv.id, status: 'cancelled' })} title="Cancel">
                                <XCircle className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* সারসংক্ষেপ */}
      {invoices.length > 0 && (
        <Card className="border-rose-200 dark:border-rose-800">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Total Labour:</span>
                <span className="font-medium ml-1">{formatCurrency(summaryTotals.labour)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Materials:</span>
                <span className="font-medium ml-1">{formatCurrency(summaryTotals.materials)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Transport:</span>
                <span className="font-medium ml-1">{formatCurrency(summaryTotals.transport)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Service:</span>
                <span className="font-medium ml-1">{formatCurrency(summaryTotals.service)}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div>
                <span className="text-muted-foreground">Tax:</span>
                <span className="font-medium ml-1">{formatCurrency(summaryTotals.tax)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Discount:</span>
                <span className="font-medium ml-1 text-green-600">-{formatCurrency(summaryTotals.discount)}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="text-lg font-bold text-rose-600">
                Grand Total: {formatCurrency(summaryTotals.total)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* দেখার ডায়ালগ */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {viewingInvoice && (
            <div className="space-y-4">
              {/* সংযুক্ত টিকেট ও ওয়ার্ক অর্ডার তথ্য */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Invoice #:</span>{' '}
                  <span className="font-mono font-medium">{viewingInvoice.mivNo || viewingInvoice.invoiceNo}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>{' '}
                  <Badge variant="secondary" className={cn('text-xs', invoiceStatusConfig[viewingInvoice.status]?.color)}>
                    {invoiceStatusConfig[viewingInvoice.status]?.label}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Customer:</span>{' '}
                  <span className="font-medium">{viewingInvoice.customerName || viewingInvoice.customer?.name || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>{' '}
                  <span>{formatDate(viewingInvoice.createdAt)}</span>
                </div>
              </div>

              {/* সংযুক্ত টিকেট তথ্য */}
              <Card className="p-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Linked Ticket</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Ticket #:</span>{' '}
                    <span className="font-mono text-xs">{viewingInvoice.ticket?.ticketNo || viewingInvoice.ticketNo || '—'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Subject:</span>{' '}
                    <span className="text-xs">{viewingInvoice.ticket?.subject || '—'}</span>
                  </div>
                </div>
              </Card>

              {/* সংযুক্ত ওয়ার্ক অর্ডার তথ্য */}
              {viewingInvoice.workOrder && (
                <Card className="p-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Linked Work Order</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">WO #:</span>{' '}
                      <span className="font-mono text-xs">{viewingInvoice.workOrder.workOrderNo || '—'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>{' '}
                      <span className="text-xs capitalize">{viewingInvoice.workOrder.status || '—'}</span>
                    </div>
                  </div>
                </Card>
              )}

              {/* খরচ বিশ্লেষণ টেবিল */}
              <Separator />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Cost Breakdown</p>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-sm text-muted-foreground">Labour Cost</TableCell>
                      <TableCell className="text-sm text-right">{formatCurrency(viewingInvoice.labourCost || 0)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm text-muted-foreground">Material Cost</TableCell>
                      <TableCell className="text-sm text-right">{formatCurrency(viewingInvoice.materialCost || 0)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm text-muted-foreground">Transport Cost</TableCell>
                      <TableCell className="text-sm text-right">{formatCurrency(viewingInvoice.transportCost || 0)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm text-muted-foreground">Service Charges</TableCell>
                      <TableCell className="text-sm text-right">{formatCurrency(viewingInvoice.serviceCharges || 0)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm font-medium">Subtotal</TableCell>
                      <TableCell className="text-sm text-right font-medium">{formatCurrency((viewingInvoice.labourCost || 0) + (viewingInvoice.materialCost || 0) + (viewingInvoice.transportCost || 0) + (viewingInvoice.serviceCharges || 0))}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm text-muted-foreground">Tax ({viewingInvoice.taxPercent || 0}%)</TableCell>
                      <TableCell className="text-sm text-right">{formatCurrency(viewingInvoice.tax || 0)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm text-muted-foreground">Discount</TableCell>
                      <TableCell className="text-sm text-right text-emerald-600">-{formatCurrency(viewingInvoice.discount || 0)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm font-bold">Total</TableCell>
                      <TableCell className="text-sm text-right font-bold text-rose-600">{formatCurrency(viewingInvoice.total || 0)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* অর্থ প্রদানের ইতিহাস */}
              {(viewingInvoice.paidAmount || 0) > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Payment History</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount Paid</span>
                        <span className="font-medium text-emerald-600">{formatCurrency(viewingInvoice.paidAmount || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Remaining Balance</span>
                        <span className={cn('font-medium', (viewingInvoice.total || 0) - (viewingInvoice.paidAmount || 0) > 0 ? 'text-amber-600' : 'text-emerald-600')}>
                          {formatCurrency(Math.max(0, (viewingInvoice.total || 0) - (viewingInvoice.paidAmount || 0)))}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {viewingInvoice.notes && (
                <>
                  <Separator />
                  <div className="text-sm">
                    <span className="text-muted-foreground">Notes:</span>
                    <p className="mt-1">{viewingInvoice.notes}</p>
                  </div>
                </>
              )}

              {/* বিস্তারিত দৃশ্যে কার্যকলাপ বাটন */}
              <Separator />
              <div className="flex justify-end gap-2">
                {viewingInvoice.status === 'draft' && (
                  <Button className="gap-1.5" onClick={() => {
                    setReviewingInvoice(viewingInvoice)
                    setReviewAction('approve')
                    setReviewNotes('')
                    setReviewAdjustments({ labourCost: 0, materialCost: 0, transportCost: 0, serviceCharges: 0, tax: 0, discount: 0 })
                    setReviewOpen(true)
                  }}>
                    <ShieldCheck className="h-3.5 w-3.5" /> Submit for Review
                  </Button>
                )}
                {viewingInvoice.status === 'sent' && (
                  <Button className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                    setPayingInvoice(viewingInvoice)
                    setPaymentForm({ amount: Math.max(0, (viewingInvoice.total || 0) - (viewingInvoice.paidAmount || 0)), method: '', reference: '', date: new Date().toISOString().split('T')[0] })
                    setPaymentOpen(true)
                  }}>
                    <CreditCard className="h-3.5 w-3.5" /> Record Payment
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* সম্পাদনা ডায়ালগ */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
            <DialogDescription>Update invoice details</DialogDescription>
          </DialogHeader>
          {editingInvoice && (
            <EditInvoiceForm
              invoice={editingInvoice}
              onSubmit={(body) => updateMutation.mutate({ id: editingInvoice.id, body })}
              loading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* পর্যালোচনা ডায়ালগ */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Finance Review</DialogTitle>
            <DialogDescription>
              Review invoice {reviewingInvoice?.mivNo || reviewingInvoice?.invoiceNo}
            </DialogDescription>
          </DialogHeader>
          {reviewingInvoice && (
            <div className="space-y-4">
              {/* কার্যকলাপ নির্বাচন */}
              <div className="space-y-2">
                <Label>Action</Label>
                <div className="flex gap-2">
                  <Button
                    variant={reviewAction === 'approve' ? 'default' : 'outline'}
                    className={reviewAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                    onClick={() => setReviewAction('approve')}
                  >
                    <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve & Send
                  </Button>
                  <Button
                    variant={reviewAction === 'reject' ? 'default' : 'outline'}
                    className={reviewAction === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}
                    onClick={() => setReviewAction('reject')}
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                  </Button>
                </div>
              </div>

              {/* খরচ সমন্বয় */}
              <div className="space-y-2">
                <Label>Cost Adjustments (leave at 0 to keep original)</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Labour Cost</Label>
                    <Input type="number" min={0} step={0.01} value={reviewAdjustments.labourCost || ''} onChange={(e) => setReviewAdjustments(a => ({ ...a, labourCost: Number(e.target.value) }))} placeholder={String(reviewingInvoice.labourCost || 0)} className="h-8 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Material Cost</Label>
                    <Input type="number" min={0} step={0.01} value={reviewAdjustments.materialCost || ''} onChange={(e) => setReviewAdjustments(a => ({ ...a, materialCost: Number(e.target.value) }))} placeholder={String(reviewingInvoice.materialCost || 0)} className="h-8 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Transport Cost</Label>
                    <Input type="number" min={0} step={0.01} value={reviewAdjustments.transportCost || ''} onChange={(e) => setReviewAdjustments(a => ({ ...a, transportCost: Number(e.target.value) }))} placeholder={String(reviewingInvoice.transportCost || 0)} className="h-8 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Service Charges</Label>
                    <Input type="number" min={0} step={0.01} value={reviewAdjustments.serviceCharges || ''} onChange={(e) => setReviewAdjustments(a => ({ ...a, serviceCharges: Number(e.target.value) }))} placeholder={String(reviewingInvoice.serviceCharges || 0)} className="h-8 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Tax</Label>
                    <Input type="number" min={0} step={0.01} value={reviewAdjustments.tax || ''} onChange={(e) => setReviewAdjustments(a => ({ ...a, tax: Number(e.target.value) }))} placeholder={String(reviewingInvoice.tax || 0)} className="h-8 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Discount</Label>
                    <Input type="number" min={0} step={0.01} value={reviewAdjustments.discount || ''} onChange={(e) => setReviewAdjustments(a => ({ ...a, discount: Number(e.target.value) }))} placeholder={String(reviewingInvoice.discount || 0)} className="h-8 text-xs" />
                  </div>
                </div>
              </div>

              {/* মোট তুলনা */}
              <Card className="p-3 bg-muted/30">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Current Total</span>
                  <span className="font-medium">{formatCurrency(reviewingInvoice.total || 0)}</span>
                </div>
                {(() => {
                  const hasAdj = Object.values(reviewAdjustments).some(v => v > 0)
                  if (!hasAdj) return null
                  const lC = reviewAdjustments.labourCost || reviewingInvoice.labourCost || 0
                  const mC = reviewAdjustments.materialCost || reviewingInvoice.materialCost || 0
                  const tC = reviewAdjustments.transportCost || reviewingInvoice.transportCost || 0
                  const sC = reviewAdjustments.serviceCharges || reviewingInvoice.serviceCharges || 0
                  const tx = reviewAdjustments.tax !== undefined ? reviewAdjustments.tax : (reviewingInvoice.tax || 0)
                  const dc = reviewAdjustments.discount !== undefined ? reviewAdjustments.discount : (reviewingInvoice.discount || 0)
                  const newTotal = lC + mC + tC + sC + tx - dc
                  return (
                    <>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Adjusted Total</span>
                        <span className="font-bold text-rose-600">{formatCurrency(newTotal)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Difference</span>
                        <span className={cn(newTotal > (reviewingInvoice.total || 0) ? 'text-amber-600' : 'text-emerald-600')}>
                          {newTotal > (reviewingInvoice.total || 0) ? '+' : ''}{formatCurrency(newTotal - (reviewingInvoice.total || 0))}
                        </span>
                      </div>
                    </>
                  )
                })()}
              </Card>

              {/* নোটসমূহ */}
              <div className="space-y-2">
                <Label>Review Notes</Label>
                <Textarea placeholder="Add review notes..." value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} rows={2} />
              </div>

              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button
                  className={reviewAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}
                  disabled={reviewMutation.isPending}
                  onClick={() => {
                    if (!reviewingInvoice) return
                    const hasAdj = Object.values(reviewAdjustments).some(v => v > 0)
                    const body: any = { action: reviewAction, notes: reviewNotes }
                    if (hasAdj) body.adjustments = reviewAdjustments
                    reviewMutation.mutate({ id: reviewingInvoice.id, body })
                  }}
                >
                  {reviewMutation.isPending ? 'Processing...' : reviewAction === 'approve' ? 'Approve & Send' : 'Reject'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* অর্থ প্রদান রেকর্ড ডায়ালগ */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> Record Payment</DialogTitle>
            <DialogDescription>
              Record payment for {payingInvoice?.mivNo || payingInvoice?.invoiceNo} — Total: {payingInvoice && formatCurrency(payingInvoice.total || 0)}
            </DialogDescription>
          </DialogHeader>
          {payingInvoice && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Amount *</Label>
                <Input
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={paymentForm.amount || ''}
                  onChange={(e) => setPaymentForm(f => ({ ...f, amount: Number(e.target.value) }))}
                  placeholder="0.00"
                />
                {paymentForm.amount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Remaining after payment: {formatCurrency(Math.max(0, (payingInvoice.total || 0) - (payingInvoice.paidAmount || 0) - paymentForm.amount))}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Payment Method *</Label>
                <Select value={paymentForm.method} onValueChange={(v) => setPaymentForm(f => ({ ...f, method: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select method..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reference (optional)</Label>
                <Input
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm(f => ({ ...f, reference: e.target.value }))}
                  placeholder="Transaction reference..."
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Date</Label>
                <Input
                  type="date"
                  value={paymentForm.date}
                  onChange={(e) => setPaymentForm(f => ({ ...f, date: e.target.value }))}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={!paymentForm.amount || !paymentForm.method || paymentMutation.isPending}
                  onClick={() => {
                    if (!payingInvoice) return
                    paymentMutation.mutate({
                      id: payingInvoice.id,
                      body: {
                        amount: paymentForm.amount,
                        method: paymentForm.method,
                        reference: paymentForm.reference || undefined,
                        date: paymentForm.date || undefined,
                      },
                    })
                  }}
                >
                  {paymentMutation.isPending ? 'Recording...' : 'Record Payment'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── ইনভয়েস তৈরির ফর্ম ───
function CreateInvoiceForm({ customers, tickets, onSubmit, loading }: {
  customers: any[]; tickets: any[]; onSubmit: (data: any) => void; loading: boolean
}) {
  const { formatCurrency } = useFormat()
  const [form, setForm] = useState({
    customerId: '',
    ticketId: '',
    workOrderId: '',
    labourCost: 0,
    materialCost: 0,
    transportCost: 0,
    serviceCharges: 0,
    taxPercent: 0,
    discount: 0,
    notes: '',
  })

  const subtotal = form.labourCost + form.materialCost + form.transportCost + form.serviceCharges
  const tax = subtotal * (form.taxPercent / 100)
  const total = subtotal + tax - form.discount

  const handleTicketSelect = (ticketId: string) => {
    const ticket = tickets.find((t: any) => t.id === ticketId)
    setForm((f) => ({
      ...f,
      ticketId,
      customerId: ticket?.customerId || f.customerId,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.customerId) return
    onSubmit({
      ...form,
      tax,
      total,
    })
    setForm({ customerId: '', ticketId: '', workOrderId: '', labourCost: 0, materialCost: 0, transportCost: 0, serviceCharges: 0, taxPercent: 0, discount: 0, notes: '' })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Customer *</Label>
        <Select value={form.customerId} onValueChange={(v) => setForm((f) => ({ ...f, customerId: v }))}>
          <SelectTrigger><SelectValue placeholder="Select customer..." /></SelectTrigger>
          <SelectContent>
            {customers.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Link to Ticket (optional)</Label>
        <Select value={form.ticketId} onValueChange={handleTicketSelect}>
          <SelectTrigger><SelectValue placeholder="Select ticket..." /></SelectTrigger>
          <SelectContent>
            {tickets.filter((t: any) => !form.customerId || t.customerId === form.customerId).map((t: any) => (
              <SelectItem key={t.id} value={t.id}>{t.ticketNo} — {t.title || t.subject || 'Untitled'}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Labour Cost ($)</Label>
          <Input type="number" min={0} step={0.01} value={form.labourCost} onChange={(e) => setForm((f) => ({ ...f, labourCost: Number(e.target.value) }))} />
        </div>
        <div className="space-y-2">
          <Label>Material Cost ($)</Label>
          <Input type="number" min={0} step={0.01} value={form.materialCost} onChange={(e) => setForm((f) => ({ ...f, materialCost: Number(e.target.value) }))} />
        </div>
        <div className="space-y-2">
          <Label>Transport Cost ($)</Label>
          <Input type="number" min={0} step={0.01} value={form.transportCost} onChange={(e) => setForm((f) => ({ ...f, transportCost: Number(e.target.value) }))} />
        </div>
        <div className="space-y-2">
          <Label>Service Charges ($)</Label>
          <Input type="number" min={0} step={0.01} value={form.serviceCharges} onChange={(e) => setForm((f) => ({ ...f, serviceCharges: Number(e.target.value) }))} />
        </div>
        <div className="space-y-2">
          <Label>Tax (%)</Label>
          <Input type="number" min={0} max={100} value={form.taxPercent} onChange={(e) => setForm((f) => ({ ...f, taxPercent: Number(e.target.value) }))} />
        </div>
        <div className="space-y-2">
          <Label>Discount ($)</Label>
          <Input type="number" min={0} step={0.01} value={form.discount} onChange={(e) => setForm((f) => ({ ...f, discount: Number(e.target.value) }))} />
        </div>
      </div>

      <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-800 space-y-1 text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Tax ({form.taxPercent}%)</span><span>{formatCurrency(tax)}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-green-600">-{formatCurrency(form.discount)}</span></div>
        <Separator />
        <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-rose-600">{formatCurrency(total)}</span></div>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea placeholder="Invoice notes..." rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
      </div>

      <DialogFooter>
        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
        <Button type="submit" disabled={loading || !form.customerId} className="bg-rose-600 hover:bg-rose-700">
          {loading ? 'Creating...' : 'Create Invoice'}
        </Button>
      </DialogFooter>
    </form>
  )
}

// ─── ইনভয়েস সম্পাদনার ফর্ম ───
function EditInvoiceForm({ invoice, onSubmit, loading }: {
  invoice: any; onSubmit: (data: any) => void; loading: boolean
}) {
  const { formatCurrency } = useFormat()
  const [form, setForm] = useState({
    labourCost: invoice.labourCost || 0,
    materialCost: invoice.materialCost || 0,
    transportCost: invoice.transportCost || 0,
    serviceCharges: invoice.serviceCharges || 0,
    taxPercent: invoice.taxPercent || 0,
    discount: invoice.discount || 0,
    notes: invoice.notes || '',
  })

  const subtotal = form.labourCost + form.materialCost + form.transportCost + form.serviceCharges
  const tax = subtotal * (form.taxPercent / 100)
  const total = subtotal + tax - form.discount

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ ...form, tax, total })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Customer</Label><Input value={invoice.customerName || '—'} disabled /></div>
        <div className="space-y-2"><Label>Invoice #</Label><Input value={invoice.mivNo} disabled /></div>
      </div>
      <Separator />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Labour Cost ($)</Label>
          <Input type="number" min={0} step={0.01} value={form.labourCost} onChange={(e) => setForm((f) => ({ ...f, labourCost: Number(e.target.value) }))} />
        </div>
        <div className="space-y-2">
          <Label>Material Cost ($)</Label>
          <Input type="number" min={0} step={0.01} value={form.materialCost} onChange={(e) => setForm((f) => ({ ...f, materialCost: Number(e.target.value) }))} />
        </div>
        <div className="space-y-2">
          <Label>Transport Cost ($)</Label>
          <Input type="number" min={0} step={0.01} value={form.transportCost} onChange={(e) => setForm((f) => ({ ...f, transportCost: Number(e.target.value) }))} />
        </div>
        <div className="space-y-2">
          <Label>Service Charges ($)</Label>
          <Input type="number" min={0} step={0.01} value={form.serviceCharges} onChange={(e) => setForm((f) => ({ ...f, serviceCharges: Number(e.target.value) }))} />
        </div>
        <div className="space-y-2">
          <Label>Tax (%)</Label>
          <Input type="number" min={0} max={100} value={form.taxPercent} onChange={(e) => setForm((f) => ({ ...f, taxPercent: Number(e.target.value) }))} />
        </div>
        <div className="space-y-2">
          <Label>Discount ($)</Label>
          <Input type="number" min={0} step={0.01} value={form.discount} onChange={(e) => setForm((f) => ({ ...f, discount: Number(e.target.value) }))} />
        </div>
      </div>
      <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-800 space-y-1 text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Tax ({form.taxPercent}%)</span><span>{formatCurrency(tax)}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-green-600">-{formatCurrency(form.discount)}</span></div>
        <Separator />
        <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-rose-600">{formatCurrency(total)}</span></div>
      </div>
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
      </div>
      <DialogFooter>
        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
        <Button type="submit" disabled={loading} className="bg-rose-600 hover:bg-rose-700">
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </form>
  )
}