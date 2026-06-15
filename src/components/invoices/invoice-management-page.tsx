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
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  FileText, Plus, Search, ArrowLeft, TrendingUp, TrendingDown, Clock, DollarSign,
  CheckCircle, XCircle, AlertTriangle, BarChart3, Eye, Pencil, Trash2, ChevronLeft, ChevronRight,
  FileSpreadsheet, Receipt, Shield, Timer, Activity, CreditCard, CircleDollarSign, Banknote, PiggyBank,
} from 'lucide-react'

// ─── প্রকারভেদ ───
interface LineItem {
  description: string
  qty: number
  unit: string
  unitPrice: number
}

interface Invoice {
  id: string
  invoiceNo: string
  type: string
  status: string
  paymentStatus?: string
  issueDate: string
  dueDate: string
  total: number
  paidAmount?: number
  currency?: string
  vendorName?: string
  project?: { id: string; name: string; code: string } | null
  vendor?: { id: string; name: string } | null
}

interface DashboardStats {
  pendingInvoices: number
  approvedInvoices: number
  rejectedInvoices: number
  draftInvoices: number
  paidInvoices: number
  overdueInvoices: number
  totalValue: number
  outstanding: number
  retentionHeld: number
  retentionReleased: number
  avgApprovalTime: number
  invoiceVolume: number
  aging: { range: string; count: number; amount: number }[]
  recentInvoices: Invoice[]
}

// ─── কনফিগারেশন ম্যাপ ───
const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  pending_review: { label: 'Pending Review', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  under_review: { label: 'Under Review', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  pending_approval: { label: 'Pending Approval', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  approved: { label: 'Approved', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Rejected', className: 'bg-red-50 text-red-700 border-red-200' },
  returned: { label: 'Returned', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  revision_requested: { label: 'Revision Requested', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  payment_pending: { label: 'Payment Pending', className: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  partial_paid: { label: 'Partial Paid', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  paid: { label: 'Paid', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  overdue: { label: 'Overdue', className: 'bg-red-50 text-red-700 border-red-200' },
  cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-500 border-gray-200' },
}

const typeConfig: Record<string, { label: string; className: string }> = {
  progress_claim: { label: 'Progress Claim', className: 'bg-violet-50 text-violet-700 border-violet-200' },
  interim_payment: { label: 'Interim Payment', className: 'bg-sky-50 text-sky-700 border-sky-200' },
  final_payment: { label: 'Final Payment', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  variation_claim: { label: 'Variation Claim', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  retention_release: { label: 'Retention Release', className: 'bg-teal-50 text-teal-700 border-teal-200' },
  back_charge: { label: 'Back Charge', className: 'bg-red-50 text-red-700 border-red-200' },
  credit_note: { label: 'Credit Note', className: 'bg-green-50 text-green-700 border-green-200' },
  debit_note: { label: 'Debit Note', className: 'bg-rose-50 text-rose-700 border-rose-200' },
  po_invoice: { label: 'PO Invoice', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  subcontract_invoice: { label: 'Subcontract Invoice', className: 'bg-purple-50 text-purple-700 border-purple-200' },
}

const paymentStatusConfig: Record<string, { label: string; className: string }> = {
  unpaid: { label: 'Unpaid', className: 'bg-gray-100 text-gray-600' },
  partial: { label: 'Partial', className: 'bg-amber-100 text-amber-700' },
  paid: { label: 'Paid', className: 'bg-emerald-100 text-emerald-700' },
  overdue: { label: 'Overdue', className: 'bg-red-100 text-red-700' },
}

const invoiceTypes = Object.entries(typeConfig).map(([k, v]) => ({ value: k, label: v.label }))
const allStatuses = Object.entries(statusConfig).map(([k, v]) => ({ value: k, label: v.label }))

const emptyLineItem = (): LineItem => ({ description: '', qty: 1, unit: 'ea', unitPrice: 0 })

// ─── উপাদান ───
export function InvoiceManagementPage() {
  const { navigate } = useAppStore()
  const { formatCurrency, formatCurrencyCompact, formatDate } = useFormat()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState('dashboard')
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null)

  // ফিল্টারসমূহ
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [page, setPage] = useState(1)
  const pageSize = 20

  // ─── কুয়েরিসমূহ ───
  const { data: dashData, isLoading: dashLoading } = useQuery({
    queryKey: [...queryKeys.invoiceManagement, 'dashboard'],
    queryFn: () => api.get<DashboardStats>('/api/invoicing/dashboard'),
  })

  const listParams = useMemo(() => {
    const p = new URLSearchParams()
    if (search) p.set('search', search)
    if (statusFilter !== 'all') p.set('status', statusFilter)
    if (typeFilter !== 'all') p.set('type', typeFilter)
    if (projectFilter !== 'all') p.set('projectId', projectFilter)
    if (dateFrom) p.set('dateFrom', dateFrom)
    if (dateTo) p.set('dateTo', dateTo)
    if (paymentFilter !== 'all') p.set('paymentStatus', paymentFilter)
    p.set('page', String(page))
    p.set('limit', String(pageSize))
    return p.toString()
  }, [search, statusFilter, typeFilter, projectFilter, dateFrom, dateTo, paymentFilter, page])

  const { data: listData, isLoading: listLoading } = useQuery({
    queryKey: [...queryKeys.invoiceManagement, listParams],
    queryFn: () => api.get<any>(`/api/invoicing?${listParams}`),
    enabled: activeTab === 'list',
  })

  const { data: projectsData } = useQuery({
    queryKey: ['projects-invoicing'],
    queryFn: () => api.get('/api/projects'),
  })

  const { data: costCodesData } = useQuery({
    queryKey: ['cost-codes-invoicing'],
    queryFn: () => api.get('/api/cost-control/cost-codes'),
  })

  const projects = projectsData?.data || []
  const costCodes = costCodesData?.data || []
  const invoices = listData?.data?.invoices || listData?.data || []
  const totalItems = listData?.data?.total || invoices.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  // ─── মিউটেশনসমূহ ───
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/api/invoicing/${id}`),
    onSuccess: () => {
      toast.success('Invoice deleted')
      setDeleteDialog(null)
      queryClient.invalidateQueries({ queryKey: queryKeys.invoiceManagement })
    },
    onError: (err: any) => toast.error(err?.error || 'Failed to delete'),
  })

  // ─── তৈরির ফর্ম অবস্থা ───
  const [form, setForm] = useState({
    projectId: '', type: 'progress_claim', vendorName: '', vendorType: '',
    purchaseOrderId: '', workOrderId: '', costCodeId: '', contractNo: '', referenceNo: '',
    issueDate: new Date().toISOString().slice(0, 10), dueDate: '',
    currency: 'SGD', taxRate: 0, retentionRate: 10, notes: '',
    originalContractValue: 0, workCompletedPct: 0,
  })
  const [lineItems, setLineItems] = useState<LineItem[]>([emptyLineItem()])

  const subtotal = useMemo(() => lineItems.reduce((s, i) => s + (i.qty * i.unitPrice), 0), [lineItems])
  const taxAmt = subtotal * (form.taxRate / 100)
  const total = subtotal + taxAmt

  const createMutation = useMutation({
    mutationFn: (body: any) => api.post('/api/invoicing', body),
    onSuccess: (res) => {
      toast.success('Invoice created as draft')
      setCreateOpen(false)
      resetForm()
      queryClient.invalidateQueries({ queryKey: queryKeys.invoiceManagement })
      if (res?.data?.id) {
        navigate('invoice-detail', { id: res.data.id })
      }
    },
    onError: (err: any) => toast.error(err?.error || 'Failed to create invoice'),
  })

  const resetForm = () => {
    setForm({
      projectId: '', type: 'progress_claim', vendorName: '', vendorType: '',
      purchaseOrderId: '', workOrderId: '', costCodeId: '', contractNo: '', referenceNo: '',
      issueDate: new Date().toISOString().slice(0, 10), dueDate: '',
      currency: 'SGD', taxRate: 0, retentionRate: 10, notes: '',
      originalContractValue: 0, workCompletedPct: 0,
    })
    setLineItems([emptyLineItem()])
  }

  const handleCreate = () => {
    const body: any = {
      ...form,
      lineItems,
      subtotal,
      taxAmount: taxAmt,
      total,
    }
    if (form.type === 'progress_claim') {
      const workCompletedAmt = form.originalContractValue * (form.workCompletedPct / 100)
      body.progressBilling = {
        originalContractValue: form.originalContractValue,
        workCompletedPct: form.workCompletedPct,
        workCompletedAmt,
        retentionAmount: workCompletedAmt * (form.retentionRate / 100),
      }
    }
    createMutation.mutate(body)
  }

  const showVendorFields = ['po_invoice', 'subcontract_invoice', 'back_charge'].includes(form.type)
  const isProgressClaim = form.type === 'progress_claim'

  const dash = dashData?.data
  const maxAging = Math.max(1, ...(dash?.aging?.map((a: any) => a.amount) || [1]))

  // ─── রেন্ডার ───
  return (
    <div className="space-y-6">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoice Management</h1>
          <p className="text-sm text-muted-foreground">Manage invoices, approvals, and payments</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Create Invoice
        </Button>
      </div>

      {/* ট্যাবসমূহ */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="list">All Invoices</TabsTrigger>
        </TabsList>

        {/* ─── ড্যাশবোর্ড ট্যাব ─── */}
        <TabsContent value="dashboard" className="space-y-6 mt-4">
          {dashLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
            </div>
          ) : (
            <>
              {/* ১২ পরিসংখ্যান কার্ড */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Pending Invoices', value: dash?.pendingInvoices ?? 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', trend: '+3 this week' },
                  { label: 'Approved', value: dash?.approvedInvoices ?? 0, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+5 this week' },
                  { label: 'Rejected', value: dash?.rejectedInvoices ?? 0, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', trend: '-2 vs last week' },
                  { label: 'Draft', value: dash?.draftInvoices ?? 0, icon: FileText, color: 'text-gray-600', bg: 'bg-gray-50', trend: `${dash?.draftInvoices ?? 0} pending` },
                  { label: 'Paid', value: dash?.paidInvoices ?? 0, icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: `${formatCurrency(dash?.totalValue ?? 0)}` },
                  { label: 'Overdue', value: dash?.overdueInvoices ?? 0, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', trend: 'Action required' },
                  { label: 'Total Value', value: formatCurrencyCompact(dash?.totalValue ?? 0), icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'All invoices' },
                  { label: 'Outstanding', value: formatCurrencyCompact(dash?.outstanding ?? 0), icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-50', trend: 'Unpaid balance' },
                  { label: 'Retention Held', value: formatCurrencyCompact(dash?.retentionHeld ?? 0), icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50', trend: '10% average' },
                  { label: 'Retention Released', value: formatCurrencyCompact(dash?.retentionReleased ?? 0), icon: PiggyBank, color: 'text-teal-600', bg: 'bg-teal-50', trend: 'Released to date' },
                  { label: 'Avg Approval Time', value: `${dash?.avgApprovalTime ?? 0}d`, icon: Timer, color: 'text-cyan-600', bg: 'bg-cyan-50', trend: 'Days to approve' },
                  { label: 'Invoice Volume', value: dash?.invoiceVolume ?? 0, icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: 'This month' },
                ].map((s) => (
                  <Card key={s.label} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                        <div className={cn('p-2 rounded-lg', s.bg)}>
                          <s.icon className={cn('h-4 w-4', s.color)} />
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xl font-bold">{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.trend}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* পুরনো + সাম্প্রতিক */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* পুরনোত্ব চার্ট */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Invoice Aging</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(dash?.aging || []).map((a: any) => (
                      <div key={a.range} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{a.range} days</span>
                          <span className="font-medium">{a.count} invoices</span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              a.range === '0-30' ? 'bg-emerald-500' :
                              a.range === '31-60' ? 'bg-amber-500' :
                              a.range === '61-90' ? 'bg-orange-500' : 'bg-red-500'
                            )}
                            style={{ width: `${Math.max(2, (a.amount / maxAging) * 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground text-right">{formatCurrency(a.amount)}</p>
                      </div>
                    ))}
                    {(!dash?.aging || dash.aging.length === 0) && (
                      <p className="text-sm text-muted-foreground text-center py-6">No aging data</p>
                    )}
                  </CardContent>
                </Card>

                {/* সাম্প্রতিক ইনভয়েস */}
                <Card>
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-semibold">Recent Invoices</CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => setActiveTab('list')}>
                      View All
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="max-h-80">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Invoice</TableHead>
                            <TableHead className="text-xs">Project</TableHead>
                            <TableHead className="text-xs">Type</TableHead>
                            <TableHead className="text-xs text-right">Amount</TableHead>
                            <TableHead className="text-xs">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(dash?.recentInvoices || []).slice(0, 5).map((inv: Invoice) => {
                            const sc = statusConfig[inv.status] || statusConfig.draft
                            const tc = typeConfig[inv.type] || { label: inv.type, className: 'bg-gray-50 text-gray-600' }
                            return (
                              <TableRow
                                key={inv.id}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => navigate('invoice-detail', { id: inv.id })}
                              >
                                <TableCell className="text-xs font-mono font-medium">{inv.invoiceNo}</TableCell>
                                <TableCell className="text-xs max-w-[120px] truncate">{inv.project?.name || '—'}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', tc.className)}>{tc.label}</Badge>
                                </TableCell>
                                <TableCell className="text-xs text-right font-medium">{formatCurrency(inv.total)}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', sc.className)}>{sc.label}</Badge>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                          {(!dash?.recentInvoices || dash.recentInvoices.length === 0) && (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">No recent invoices</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* দ্রুত কার্যকলাপ */}
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => setCreateOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" /> Create Invoice
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('list')} className="gap-2">
                  <FileText className="h-4 w-4" /> View All Invoices
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        {/* ─── তালিকা ট্যাব ─── */}
        <TabsContent value="list" className="space-y-4 mt-4">
          {/* ফিল্টারসমূহ */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                <div className="relative sm:col-span-2 lg:col-span-1 xl:col-span-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search invoices..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="pl-9" />
                </div>
                <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1) }}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {allStatuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); setPage(1) }}>
                  <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {invoiceTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={projectFilter} onValueChange={v => { setProjectFilter(v); setPage(1) }}>
                  <SelectTrigger><SelectValue placeholder="Project" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name || p.code}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={paymentFilter} onValueChange={v => { setPaymentFilter(v); setPage(1) }}>
                  <SelectTrigger><SelectValue placeholder="Payment" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payment Status</SelectItem>
                    {Object.entries(paymentStatusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }} className="text-xs" placeholder="From" />
                  <Input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1) }} className="text-xs" placeholder="To" />
                </div>
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
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Vendor</TableHead>
                      <TableHead className="text-xs">Issue Date</TableHead>
                      <TableHead className="text-xs">Due Date</TableHead>
                      <TableHead className="text-xs text-right">Amount</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Payment</TableHead>
                      <TableHead className="text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 10 }).map((_, j) => (
                            <TableCell key={j}><Skeleton className="h-4 w-16" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : invoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center text-sm text-muted-foreground py-12">
                          No invoices found. Create your first invoice.
                        </TableCell>
                      </TableRow>
                    ) : (
                      invoices.map((inv: Invoice) => {
                        const sc = statusConfig[inv.status] || statusConfig.draft
                        const tc = typeConfig[inv.type] || { label: inv.type, className: 'bg-gray-50 text-gray-600' }
                        const pc = paymentStatusConfig[inv.paymentStatus || 'unpaid'] || paymentStatusConfig.unpaid
                        return (
                          <TableRow
                            key={inv.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => navigate('invoice-detail', { id: inv.id })}
                          >
                            <TableCell className="text-xs font-mono font-medium">{inv.invoiceNo}</TableCell>
                            <TableCell className="text-xs max-w-[120px] truncate">{inv.project?.name || '—'}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', tc.className)}>{tc.label}</Badge>
                            </TableCell>
                            <TableCell className="text-xs max-w-[120px] truncate">{inv.vendorName || inv.vendor?.name || '—'}</TableCell>
                            <TableCell className="text-xs">{inv.issueDate ? formatDate(inv.issueDate) : '—'}</TableCell>
                            <TableCell className="text-xs">{inv.dueDate ? formatDate(inv.dueDate) : '—'}</TableCell>
                            <TableCell className="text-xs text-right font-medium">{formatCurrency(inv.total)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', sc.className)}>{sc.label}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={cn('text-[10px] px-1.5 py-0', pc.className)}>{pc.label}</Badge>
                            </TableCell>
                            <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate('invoice-detail', { id: inv.id })}>
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate('invoice-detail', { id: inv.id })}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setDeleteDialog(inv.id)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
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
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="flex items-center px-3 text-xs">{page} / {totalPages}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── ইনভয়েস তৈরির ডায়ালগ ─── */}
      <Dialog open={createOpen} onOpenChange={open => { setCreateOpen(open); if (!open) resetForm() }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
            <DialogDescription>Fill in the invoice details. It will be saved as a draft.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project *</Label>
                <Select value={form.projectId} onValueChange={v => setForm(f => ({ ...f, projectId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>
                    {projects.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name || p.code}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Invoice Type *</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {invoiceTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {showVendorFields && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Vendor Name *</Label>
                  <Input value={form.vendorName} onChange={e => setForm(f => ({ ...f, vendorName: e.target.value }))} placeholder="Enter vendor name" />
                </div>
                <div className="space-y-2">
                  <Label>Vendor Type</Label>
                  <Select value={form.vendorType} onValueChange={v => setForm(f => ({ ...f, vendorType: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="subcontractor">Subcontractor</SelectItem>
                      <SelectItem value="supplier">Supplier</SelectItem>
                      <SelectItem value="consultant">Consultant</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Contract No</Label>
                <Input value={form.contractNo} onChange={e => setForm(f => ({ ...f, contractNo: e.target.value }))} placeholder="CON-001" />
              </div>
              <div className="space-y-2">
                <Label>Reference No</Label>
                <Input value={form.referenceNo} onChange={e => setForm(f => ({ ...f, referenceNo: e.target.value }))} placeholder="REF-001" />
              </div>
              <div className="space-y-2">
                <Label>Issue Date *</Label>
                <Input type="date" value={form.issueDate} onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Cost Code</Label>
                <Select value={form.costCodeId} onValueChange={v => setForm(f => ({ ...f, costCodeId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select cost code" /></SelectTrigger>
                  <SelectContent>
                    {costCodes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.code} — {c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={form.currency} onValueChange={v => setForm(f => ({ ...f, currency: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['SGD', 'USD', 'EUR', 'GBP', 'MYR', 'BND', 'AUD', 'IDR'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <Input type="number" min={0} max={100} step={0.5} value={form.taxRate} onChange={e => setForm(f => ({ ...f, taxRate: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Retention (%)</Label>
                <Input type="number" min={0} max={30} step={0.5} value={form.retentionRate} onChange={e => setForm(f => ({ ...f, retentionRate: Number(e.target.value) }))} />
              </div>
            </div>

            {/* অগ্রগতি বিলিং */}
            {isProgressClaim && (
              <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
                <h4 className="font-semibold text-sm">Progress Billing</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Original Contract Value</Label>
                    <Input type="number" value={form.originalContractValue} onChange={e => setForm(f => ({ ...f, originalContractValue: Number(e.target.value) }))} placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Work Completed This Period (%)</Label>
                    <Input type="number" min={0} max={100} step={0.1} value={form.workCompletedPct} onChange={e => setForm(f => ({ ...f, workCompletedPct: Number(e.target.value) }))} placeholder="0" />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div className="rounded-md bg-background p-2"><span className="text-muted-foreground text-xs">Work This Period</span><p className="font-semibold">{formatCurrency(form.originalContractValue * (form.workCompletedPct / 100))}</p></div>
                  <div className="rounded-md bg-background p-2"><span className="text-muted-foreground text-xs">Retention</span><p className="font-semibold">{formatCurrency(form.originalContractValue * (form.workCompletedPct / 100) * (form.retentionRate / 100))}</p></div>
                  <div className="rounded-md bg-background p-2"><span className="text-muted-foreground text-xs">Certified Amount</span><p className="font-semibold">{formatCurrency(form.originalContractValue * (form.workCompletedPct / 100) * (1 - form.retentionRate / 100))}</p></div>
                  <div className="rounded-md bg-background p-2"><span className="text-muted-foreground text-xs">Balance Remaining</span><p className="font-semibold">{formatCurrency(form.originalContractValue * (1 - form.workCompletedPct / 100))}</p></div>
                </div>
              </div>
            )}

            {/* লাইন আইটেমসমূহ */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">Line Items</h4>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setLineItems(items => [...items, emptyLineItem()])}>
                  <Plus className="h-3 w-3" /> Add Item
                </Button>
              </div>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Description</TableHead>
                      <TableHead className="text-xs w-20 text-right">Qty</TableHead>
                      <TableHead className="text-xs w-20">Unit</TableHead>
                      <TableHead className="text-xs w-28 text-right">Unit Price</TableHead>
                      <TableHead className="text-xs w-28 text-right">Amount</TableHead>
                      <TableHead className="text-xs w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell><Input className="h-8 text-xs" value={item.description} onChange={e => { const n = [...lineItems]; n[idx] = { ...n[idx], description: e.target.value }; setLineItems(n) }} placeholder="Description" /></TableCell>
                        <TableCell><Input type="number" className="h-8 text-xs text-right" value={item.qty} min={0} onChange={e => { const n = [...lineItems]; n[idx] = { ...n[idx], qty: Number(e.target.value) }; setLineItems(n) }} /></TableCell>
                        <TableCell><Input className="h-8 text-xs" value={item.unit} onChange={e => { const n = [...lineItems]; n[idx] = { ...n[idx], unit: e.target.value }; setLineItems(n) }} /></TableCell>
                        <TableCell><Input type="number" className="h-8 text-xs text-right" value={item.unitPrice} min={0} step={0.01} onChange={e => { const n = [...lineItems]; n[idx] = { ...n[idx], unitPrice: Number(e.target.value) }; setLineItems(n) }} /></TableCell>
                        <TableCell className="text-right text-xs font-medium">{formatCurrency(item.qty * item.unitPrice)}</TableCell>
                        <TableCell>
                          {lineItems.length > 1 && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setLineItems(items => items.filter((_, i) => i !== idx))}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end">
                <div className="text-sm space-y-1 text-right">
                  <div className="flex gap-8"><span className="text-muted-foreground">Subtotal:</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
                  <div className="flex gap-8"><span className="text-muted-foreground">Tax ({form.taxRate}%):</span><span className="font-medium">{formatCurrency(taxAmt)}</span></div>
                  <Separator />
                  <div className="flex gap-8 text-base"><span className="font-semibold">Total:</span><span className="font-bold">{formatCurrency(total)}</span></div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional notes..." rows={2} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateOpen(false); resetForm() }}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending || !form.projectId} className="gap-2">
              {createMutation.isPending && <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Create Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── মুছে ফেলার ডায়ালগ ─── */}
      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this invoice? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteDialog && deleteMutation.mutate(deleteDialog)} disabled={deleteMutation.isPending}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}