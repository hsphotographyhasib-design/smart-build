'use client'

import React, { useState } from 'react'
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  ArrowLeft, Pencil, Send, CheckCircle, XCircle, RotateCcw, ArrowUpCircle,
  UserCheck, DollarSign, Shield, Clock, FileText, Plus, Trash2, Upload,
  MessageSquare, GitBranch, CreditCard, Banknote, ChevronRight,
} from 'lucide-react'

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

const actionIcons: Record<string, React.ElementType> = {
  submitted: Send, approved: CheckCircle, rejected: XCircle, returned: RotateCcw, escalated: ArrowUpCircle,
}

// ─── উপাদান ───
export function InvoiceDetailPage({ invoiceId }: { invoiceId: string }) {
  const { navigate, user } = useAppStore()
  const { formatCurrency, formatDate, formatDateTime } = useFormat()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState('details')
  const [rejectDialog, setRejectDialog] = useState(false)
  const [returnDialog, setReturnDialog] = useState(false)
  const [delegateDialog, setDelegateDialog] = useState(false)
  const [paymentDialog, setPaymentDialog] = useState(false)
  const [retentionDialog, setRetentionDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)

  const [rejectReason, setRejectReason] = useState('')
  const [returnReason, setReturnReason] = useState('')
  const [delegateUserId, setDelegateUserId] = useState('')
  const [comment, setComment] = useState('')

  // অর্থ প্রদান ফর্ম
  const [payForm, setPayForm] = useState({ amount: 0, method: 'bank_transfer', reference: '', bankReference: '', chequeNumber: '' })
  // ধারণ সংরক্ষণ ফর্ম
  const [retForm, setRetForm] = useState({ amount: 0, reference: '' })
  // নথি ফর্ম
  const [docForm, setDocForm] = useState({ fileName: '', fileType: '', fileSize: '', category: 'invoice', fileUrl: '' })

  // ─── কুয়েরিসমূহ ───
  const { data: invData, isLoading } = useQuery({
    queryKey: queryKeys.invoiceDetail(invoiceId),
    queryFn: () => api.get<any>(`/api/invoicing/${invoiceId}`),
  })

  const inv = invData?.data

  const { data: paymentsData } = useQuery({
    queryKey: ['invoice-payments', invoiceId],
    queryFn: () => api.get('/api/invoicing/payments'),
  })

  const { data: commentsData, refetch: refetchComments } = useQuery({
    queryKey: ['invoice-comments', invoiceId],
    queryFn: () => api.get(`/api/invoicing/${invoiceId}/comments`),
    enabled: activeTab === 'comments',
  })

  const { data: docsData, refetch: refetchDocs } = useQuery({
    queryKey: ['invoice-docs', invoiceId],
    queryFn: () => api.get(`/api/invoicing/${invoiceId}/documents`),
    enabled: activeTab === 'documents',
  })

  const payments = paymentsData?.data || []
  const comments = commentsData?.data || []
  const documents = docsData?.data || []

  // ─── মিউটেশনসমূহ ───
  const submitMutation = useMutation({
    mutationFn: () => api.post(`/api/invoicing/${invoiceId}/submit`),
    onSuccess: () => { toast.success('Invoice submitted for approval'); queryClient.invalidateQueries({ queryKey: queryKeys.invoiceDetail(invoiceId) }); },
    onError: (e: any) => toast.error(e?.error || 'Submit failed'),
  })
  const approveMutation = useMutation({
    mutationFn: () => api.post(`/api/invoicing/${invoiceId}/approve`),
    onSuccess: () => { toast.success('Invoice approved'); queryClient.invalidateQueries({ queryKey: queryKeys.invoiceDetail(invoiceId) }); },
    onError: (e: any) => toast.error(e?.error || 'Approve failed'),
  })
  const rejectMutation = useMutation({
    mutationFn: () => api.post(`/api/invoicing/${invoiceId}/reject`, { reason: rejectReason }),
    onSuccess: () => { toast.success('Invoice rejected'); setRejectDialog(false); setRejectReason(''); queryClient.invalidateQueries({ queryKey: queryKeys.invoiceDetail(invoiceId) }); },
    onError: (e: any) => toast.error(e?.error || 'Reject failed'),
  })
  const returnMutation = useMutation({
    mutationFn: () => api.post(`/api/invoicing/${invoiceId}/return`, { reason: returnReason }),
    onSuccess: () => { toast.success('Invoice returned for revision'); setReturnDialog(false); setReturnReason(''); queryClient.invalidateQueries({ queryKey: queryKeys.invoiceDetail(invoiceId) }); },
    onError: (e: any) => toast.error(e?.error || 'Return failed'),
  })
  const escalateMutation = useMutation({
    mutationFn: () => api.post(`/api/invoicing/${invoiceId}/escalate`),
    onSuccess: () => { toast.success('Invoice escalated'); queryClient.invalidateQueries({ queryKey: queryKeys.invoiceDetail(invoiceId) }); },
    onError: (e: any) => toast.error(e?.error || 'Escalate failed'),
  })
  const delegateMutation = useMutation({
    mutationFn: () => api.post(`/api/invoicing/${invoiceId}/delegate`, { targetUserId: delegateUserId }),
    onSuccess: () => { toast.success('Invoice delegated'); setDelegateDialog(false); queryClient.invalidateQueries({ queryKey: queryKeys.invoiceDetail(invoiceId) }); },
    onError: (e: any) => toast.error(e?.error || 'Delegate failed'),
  })
  const deleteMutation = useMutation({
    mutationFn: () => api.del(`/api/invoicing/${invoiceId}`),
    onSuccess: () => { toast.success('Invoice deleted'); navigate('invoice-management'); },
    onError: (e: any) => toast.error(e?.error || 'Delete failed'),
  })
  const recordPayMutation = useMutation({
    mutationFn: (body: any) => api.post(`/api/invoicing/payments/${invoiceId}/record`, body),
    onSuccess: () => { toast.success('Payment recorded'); setPaymentDialog(false); queryClient.invalidateQueries({ queryKey: queryKeys.invoiceDetail(invoiceId) }); },
    onError: (e: any) => toast.error(e?.error || 'Payment failed'),
  })
  const releaseRetMutation = useMutation({
    mutationFn: (body: any) => api.post(`/api/invoicing/retention/${invoiceId}/release`, body),
    onSuccess: () => { toast.success('Retention released'); setRetentionDialog(false); queryClient.invalidateQueries({ queryKey: queryKeys.invoiceDetail(invoiceId) }); },
    onError: (e: any) => toast.error(e?.error || 'Release failed'),
  })
  const addCommentMutation = useMutation({
    mutationFn: (body: any) => api.post(`/api/invoicing/${invoiceId}/comments`, body),
    onSuccess: () => { toast.success('Comment added'); setComment(''); refetchComments(); },
    onError: (e: any) => toast.error(e?.error || 'Failed to add comment'),
  })
  const uploadDocMutation = useMutation({
    mutationFn: (body: any) => api.post(`/api/invoicing/${invoiceId}/documents`, body),
    onSuccess: () => { toast.success('Document added'); setDocForm({ fileName: '', fileType: '', fileSize: '', category: 'invoice', fileUrl: '' }); refetchDocs(); },
    onError: (e: any) => toast.error(e?.error || 'Failed to add document'),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    )
  }

  if (!inv) {
    return (
      <div className="text-center py-16">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-lg font-semibold">Invoice not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate('invoice-management')}>Back to Invoices</Button>
      </div>
    )
  }

  const sc = statusConfig[inv.status] || statusConfig.draft
  const tc = typeConfig[inv.type] || { label: inv.type, className: 'bg-gray-50 text-gray-600' }
  const isDraft = inv.status === 'draft'
  const isPending = ['pending_review', 'under_review', 'pending_approval'].includes(inv.status)
  const isApproved = inv.status === 'approved' || inv.status === 'payment_pending'
  const isRejected = ['rejected', 'returned', 'revision_requested'].includes(inv.status)
  const lineItems = inv.lineItems || inv.items || []
  const approvalHistory = inv.approvalHistory || []
  const subtotal = lineItems.reduce((s: number, i: any) => s + (i.qty * i.unitPrice), 0)
  const outstanding = (inv.total || 0) - (inv.paidAmount || 0)
  const retPct = inv.retentionRate || 0
  const retAmt = (inv.total || 0) * (retPct / 100)

  return (
    <div className="space-y-6">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" className="mt-0.5" onClick={() => navigate('invoice-management')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-mono">{inv.invoiceNo}</h1>
              <Badge variant="outline" className={cn(tc.className)}>{tc.label}</Badge>
              <Badge variant="outline" className={cn(sc.className)}>{sc.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{inv.project?.name || 'No project'} {inv.vendorName ? `• ${inv.vendorName}` : ''}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {isDraft && (
            <>
              <Button variant="outline" size="sm" className="gap-1" onClick={() => toast.info('Edit mode coming soon')}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
              <Button size="sm" className="gap-1" onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending}><Send className="h-3.5 w-3.5" /> Submit</Button>
              <Button variant="outline" size="sm" className="gap-1 text-red-500" onClick={() => setDeleteDialog(true)}><Trash2 className="h-3.5 w-3.5" /> Delete</Button>
            </>
          )}
          {isPending && (
            <>
              <Button size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending}><CheckCircle className="h-3.5 w-3.5" /> Approve</Button>
              <Button variant="outline" size="sm" className="gap-1 text-red-500" onClick={() => setRejectDialog(true)}><XCircle className="h-3.5 w-3.5" /> Reject</Button>
              <Button variant="outline" size="sm" className="gap-1 text-amber-600" onClick={() => setReturnDialog(true)}><RotateCcw className="h-3.5 w-3.5" /> Return</Button>
              <Button variant="outline" size="sm" className="gap-1" onClick={() => escalateMutation.mutate()}><ArrowUpCircle className="h-3.5 w-3.5" /> Escalate</Button>
              <Button variant="outline" size="sm" className="gap-1" onClick={() => setDelegateDialog(true)}><UserCheck className="h-3.5 w-3.5" /> Delegate</Button>
            </>
          )}
          {isApproved && (
            <>
              <Button size="sm" className="gap-1" onClick={() => { setPaymentDialog(true); setPayForm(f => ({ ...f, amount: outstanding })) }}><DollarSign className="h-3.5 w-3.5" /> Record Payment</Button>
              {retAmt > 0 && (
                <Button variant="outline" size="sm" className="gap-1" onClick={() => { setRetentionDialog(true); setRetForm(f => ({ ...f, amount: retAmt })) }}><Shield className="h-3.5 w-3.5" /> Release Retention</Button>
              )}
            </>
          )}
          {isRejected && (
            <Button variant="outline" size="sm" className="gap-1" onClick={() => toast.info('Edit & resubmit coming soon')}><Pencil className="h-3.5 w-3.5" /> Edit & Resubmit</Button>
          )}
        </div>
      </div>

      {/* ট্যাবসমূহ */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="approval">Approval History</TabsTrigger>
          <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
        </TabsList>

        {/* ─── বিস্তারিত ট্যাব ─── */}
        <TabsContent value="details" className="space-y-6 mt-4">
          {/* ইনভয়েস তথ্য */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Invoice Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 text-sm">
                <div><span className="text-muted-foreground">Project</span><p className="font-medium mt-0.5">{inv.project?.name || '—'}</p></div>
                <div><span className="text-muted-foreground">Vendor</span><p className="font-medium mt-0.5">{inv.vendorName || inv.vendor?.name || '—'}</p></div>
                <div><span className="text-muted-foreground">Type</span><p className="mt-0.5"><Badge variant="outline" className={cn(tc.className)}>{tc.label}</Badge></p></div>
                <div><span className="text-muted-foreground">Contract No</span><p className="font-medium mt-0.5">{inv.contractNo || '—'}</p></div>
                <div><span className="text-muted-foreground">Reference No</span><p className="font-medium mt-0.5">{inv.referenceNo || '—'}</p></div>
                <div><span className="text-muted-foreground">Issue Date</span><p className="font-medium mt-0.5">{formatDate(inv.issueDate)}</p></div>
                <div><span className="text-muted-foreground">Due Date</span><p className="font-medium mt-0.5">{formatDate(inv.dueDate)}</p></div>
                <div><span className="text-muted-foreground">Currency</span><p className="font-medium mt-0.5">{inv.currency || 'SGD'}</p></div>
                <div><span className="text-muted-foreground">PO Number</span><p className="font-medium mt-0.5">{inv.purchaseOrder?.poNo || inv.purchaseOrderId || '—'}</p></div>
                <div><span className="text-muted-foreground">Work Order</span><p className="font-medium mt-0.5">{inv.workOrder?.woNumber || inv.workOrderId || '—'}</p></div>
                <div><span className="text-muted-foreground">Cost Code</span><p className="font-medium mt-0.5">{inv.costCode?.code || inv.costCodeId || '—'}</p></div>
                <div><span className="text-muted-foreground">Notes</span><p className="font-medium mt-0.5 max-w-xs whitespace-pre-wrap">{inv.notes || '—'}</p></div>
              </div>
            </CardContent>
          </Card>

          {/* আর্থিক সারসংক্ষেপ */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="space-y-1"><span className="text-xs text-muted-foreground">Subtotal</span><p className="text-lg font-semibold">{formatCurrency(subtotal)}</p></div>
                <div className="space-y-1"><span className="text-xs text-muted-foreground">Tax ({inv.taxRate || 0}%)</span><p className="text-lg font-semibold">{formatCurrency(inv.taxAmount || 0)}</p></div>
                <div className="space-y-1"><span className="text-xs text-muted-foreground">Total</span><p className="text-lg font-bold">{formatCurrency(inv.total || 0)}</p></div>
                <div className="space-y-1"><span className="text-xs text-muted-foreground">Paid</span><p className="text-lg font-semibold text-emerald-600">{formatCurrency(inv.paidAmount || 0)}</p></div>
                <div className="space-y-1"><span className="text-xs text-muted-foreground">Outstanding</span><p className="text-lg font-semibold text-orange-600">{formatCurrency(outstanding)}</p></div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Retention ({retPct}%)</span>
                  <p className="text-lg font-semibold text-purple-600">{formatCurrency(retAmt)}</p>
                </div>
              </div>

              {/* অগ্রগতি বিলিং টেবিল */}
              {inv.type === 'progress_claim' && inv.progressBilling && (
                <div className="mt-6 rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs">Original Contract Value</TableHead>
                        <TableHead className="text-xs">Previous Claims</TableHead>
                        <TableHead className="text-xs">This Period (%)</TableHead>
                        <TableHead className="text-xs">This Period ($)</TableHead>
                        <TableHead className="text-xs">Total Completed (%)</TableHead>
                        <TableHead className="text-xs">Retention</TableHead>
                        <TableHead className="text-xs">Certified Amount</TableHead>
                        <TableHead className="text-xs">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="text-sm font-medium">{formatCurrency(inv.progressBilling.originalContractValue || 0)}</TableCell>
                        <TableCell className="text-sm">{formatCurrency(inv.progressBilling.previousClaimsTotal || 0)}</TableCell>
                        <TableCell className="text-sm">{inv.progressBilling.workCompletedPct || 0}%</TableCell>
                        <TableCell className="text-sm font-medium">{formatCurrency(inv.progressBilling.workCompletedAmt || 0)}</TableCell>
                        <TableCell className="text-sm">{inv.progressBilling.totalCompletedPct || 0}%</TableCell>
                        <TableCell className="text-sm text-purple-600">{formatCurrency(inv.progressBilling.retentionAmount || 0)}</TableCell>
                        <TableCell className="text-sm font-semibold text-emerald-600">{formatCurrency(inv.progressBilling.certifiedAmount || 0)}</TableCell>
                        <TableCell className="text-sm">{formatCurrency(inv.progressBilling.balanceRemaining || 0)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* লাইন আইটেমসমূহ */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Line Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[calc(100vh-320px)] overflow-y-auto overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">#</TableHead>
                      <TableHead className="text-xs">Description</TableHead>
                      <TableHead className="text-xs text-right">Qty</TableHead>
                      <TableHead className="text-xs">Unit</TableHead>
                      <TableHead className="text-xs text-right">Unit Price</TableHead>
                      <TableHead className="text-xs text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item: any, idx: number) => (
                      <TableRow key={item.id || idx}>
                        <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell className="text-sm">{item.description}</TableCell>
                        <TableCell className="text-sm text-right">{item.qty}</TableCell>
                        <TableCell className="text-sm">{item.unit}</TableCell>
                        <TableCell className="text-sm text-right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-sm text-right font-medium">{formatCurrency(item.qty * item.unitPrice)}</TableCell>
                      </TableRow>
                    ))}
                    {lineItems.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">No line items</TableCell></TableRow>
                    )}
                  </TableBody>
                  {lineItems.length > 0 && (
                    <tfoot>
                      <TableRow className="bg-muted/30 font-semibold">
                        <TableCell colSpan={5} className="text-sm text-right">Subtotal</TableCell>
                        <TableCell className="text-sm text-right">{formatCurrency(subtotal)}</TableCell>
                      </TableRow>
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={5} className="text-sm text-right">Tax</TableCell>
                        <TableCell className="text-sm text-right">{formatCurrency(inv.taxAmount || 0)}</TableCell>
                      </TableRow>
                      <TableRow className="bg-muted/50 font-bold text-base">
                        <TableCell colSpan={5} className="text-right">Total</TableCell>
                        <TableCell className="text-right">{formatCurrency(inv.total || 0)}</TableCell>
                      </TableRow>
                    </tfoot>
                  )}
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── অর্থ প্রদান ট্যাব ─── */}
        <TabsContent value="payments" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Payment History</CardTitle>
              {(isApproved) && (
                <Button size="sm" className="gap-1" onClick={() => { setPaymentDialog(true); setPayForm(f => ({ ...f, amount: outstanding })) }}><Plus className="h-3.5 w-3.5" /> Record Payment</Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Amount</TableHead>
                    <TableHead className="text-xs">Method</TableHead>
                    <TableHead className="text-xs">Reference</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(inv.payments || []).map((p: any, i: number) => (
                    <TableRow key={p.id || i}>
                      <TableCell className="text-sm">{formatDate(p.paymentDate)}</TableCell>
                      <TableCell className="text-sm font-medium">{formatCurrency(p.amount)}</TableCell>
                      <TableCell className="text-sm capitalize">{p.method?.replace('_', ' ') || '—'}</TableCell>
                      <TableCell className="text-sm">{p.reference || '—'}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-[10px]">{p.status || 'completed'}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {(inv.payments || []).length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">No payments recorded</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── ধারণ সংরক্ষণ ট্যাব ─── */}
        <TabsContent value="retention" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Shield className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Retention Held</p>
                <p className="text-xl font-bold text-purple-600">{formatCurrency(inv.retentionHeld || retAmt)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Banknote className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Released</p>
                <p className="text-xl font-bold text-teal-600">{formatCurrency(inv.retentionReleased || 0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <CreditCard className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Outstanding</p>
                <p className="text-xl font-bold text-orange-600">{formatCurrency((inv.retentionHeld || retAmt) - (inv.retentionReleased || 0))}</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Retention Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div><span className="text-muted-foreground">Retention Rate</span><p className="font-medium mt-0.5">{retPct}%</p></div>
                <div><span className="text-muted-foreground">Retention Amount</span><p className="font-medium mt-0.5">{formatCurrency(retAmt)}</p></div>
                <div><span className="text-muted-foreground">Released</span><p className="font-medium mt-0.5 text-teal-600">{formatCurrency(inv.retentionReleased || 0)}</p></div>
                <div><span className="text-muted-foreground">Due Date</span><p className="font-medium mt-0.5">{formatDate(inv.retentionDueDate)}</p></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── অনুমোদন ইতিহাস ট্যাব ─── */}
        <TabsContent value="approval" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Approval Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {approvalHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No approval history yet</p>
              ) : (
                <div className="relative space-y-0">
                  {approvalHistory.map((step: any, idx: number) => {
                    const isLast = idx === approvalHistory.length - 1
                    const IconComp = actionIcons[step.action] || Clock
                    return (
                      <div key={step.id || idx} className="flex gap-4 pb-6">
                        {/* রেখা + আইকন */}
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            'p-2 rounded-full z-10',
                            step.action === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                            step.action === 'rejected' ? 'bg-red-100 text-red-600' :
                            step.action === 'returned' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-blue-100 text-blue-600'
                          )}>
                            <IconComp className="h-4 w-4" />
                          </div>
                          {!isLast && <div className="w-px flex-1 bg-border mt-1" />}
                        </div>
                        {/* বিষয়বস্তু */}
                        <div className="flex-1 pt-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">{step.action?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                            <Badge variant="outline" className="text-[10px]">{step.stepLabel || step.stepName || ''}</Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Avatar className="h-5 w-5"><AvatarFallback className="text-[10px]">{(step.userName || 'U').charAt(0)}</AvatarFallback></Avatar>
                              <span>{step.userName || 'System'}</span>
                            </div>
                            <span>{step.userRole || ''}</span>
                            <span>•</span>
                            <span>{formatDateTime(step.createdAt || step.date)}</span>
                            {step.ipAddress && <span>• {step.ipAddress}</span>}
                          </div>
                          {(step.comments || step.reason) && (
                            <p className="text-sm mt-2 bg-muted/50 rounded-md p-2 max-w-lg">{step.comments || step.reason}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── মন্তব্য ট্যাব ─── */}
        <TabsContent value="comments" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Comments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="max-h-96">
                {comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No comments yet</p>
                ) : (
                  <div className="space-y-4">
                    {comments.map((c: any, idx: number) => (
                      <div key={c.id || idx} className="flex gap-3 pb-4 border-b last:border-0">
                        <Avatar className="h-8 w-8 mt-0.5">
                          <AvatarFallback className="text-xs">{(c.userName || 'U').charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{c.userName || 'User'}</span>
                            <span className="text-xs text-muted-foreground">{formatDateTime(c.createdAt)}</span>
                          </div>
                          <p className="text-sm mt-1">{c.content || c.text || c.body || ''}</p>
                          {/* উত্তরসমূহ */}
                          {c.replies && c.replies.length > 0 && (
                            <div className="ml-4 mt-3 space-y-3 border-l-2 border-muted pl-3">
                              {c.replies.map((r: any, ri: number) => (
                                <div key={r.id || ri} className="flex gap-2">
                                  <Avatar className="h-6 w-6"><AvatarFallback className="text-[10px]">{(r.userName || 'U').charAt(0)}</AvatarFallback></Avatar>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-semibold">{r.userName || 'User'}</span>
                                      <span className="text-[10px] text-muted-foreground">{formatDateTime(r.createdAt)}</span>
                                    </div>
                                    <p className="text-xs mt-0.5">{r.content || r.text || ''}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              {/* মন্তব্য যোগ */}
              <div className="flex gap-2 pt-2">
                <Input value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..." className="flex-1" onKeyDown={e => e.key === 'Enter' && comment.trim() && addCommentMutation.mutate({ content: comment })} />
                <Button onClick={() => comment.trim() && addCommentMutation.mutate({ content: comment })} disabled={addCommentMutation.isPending || !comment.trim()}>Send</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── নথিপত্র ট্যাব ─── */}
        <TabsContent value="documents" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Documents</CardTitle>
              <Button size="sm" variant="outline" className="gap-1" onClick={() => {}}><Upload className="h-3.5 w-3.5" /> Upload</Button>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No documents uploaded</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">File Name</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Size</TableHead>
                      <TableHead className="text-xs">Category</TableHead>
                      <TableHead className="text-xs">Upload Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((d: any, idx: number) => (
                      <TableRow key={d.id || idx}>
                        <TableCell className="text-sm font-medium">{d.fileName || d.name || '—'}</TableCell>
                        <TableCell className="text-sm">{d.fileType || d.type || '—'}</TableCell>
                        <TableCell className="text-sm">{d.fileSize || '—'}</TableCell>
                        <TableCell><Badge variant="secondary" className="text-[10px]">{d.category || 'general'}</Badge></TableCell>
                        <TableCell className="text-sm">{formatDate(d.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* দ্রুত নথি যোগ (শুধুমাত্র মেটাডেটা) */}
              <Separator className="my-4" />
              <h4 className="text-sm font-semibold mb-3">Add Document Reference</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <Input value={docForm.fileName} onChange={e => setDocForm(f => ({ ...f, fileName: e.target.value }))} placeholder="File name" />
                <Select value={docForm.category} onValueChange={v => setDocForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="invoice">Invoice</SelectItem>
                    <SelectItem value="supporting">Supporting</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="po">Purchase Order</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Input value={docForm.fileType} onChange={e => setDocForm(f => ({ ...f, fileType: e.target.value }))} placeholder="PDF, DOCX..." />
                <Input value={docForm.fileUrl} onChange={e => setDocForm(f => ({ ...f, fileUrl: e.target.value }))} placeholder="File URL" />
                <Button onClick={() => uploadDocMutation.mutate(docForm)} disabled={uploadDocMutation.isPending || !docForm.fileName}>Add</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── প্রত্যাখ্যান ডায়ালগ ─── */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Invoice</DialogTitle><DialogDescription>Provide a reason for rejection.</DialogDescription></DialogHeader>
          <Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason for rejection..." rows={3} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(false)}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={() => rejectMutation.mutate()} disabled={rejectMutation.isPending || !rejectReason.trim()}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── ফেরত ডায়ালগ ─── */}
      <Dialog open={returnDialog} onOpenChange={setReturnDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Return for Revision</DialogTitle><DialogDescription>Provide instructions for revision.</DialogDescription></DialogHeader>
          <Textarea value={returnReason} onChange={e => setReturnReason(e.target.value)} placeholder="Revision instructions..." rows={3} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnDialog(false)}>Cancel</Button>
            <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => returnMutation.mutate()} disabled={returnMutation.isPending || !returnReason.trim()}>Return</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── প্রতিনিধি ডায়ালগ ─── */}
      <Dialog open={delegateDialog} onOpenChange={setDelegateDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delegate Invoice</DialogTitle><DialogDescription>Assign this invoice to another user for review.</DialogDescription></DialogHeader>
          <div className="space-y-2">
            <Label>User ID</Label>
            <Input value={delegateUserId} onChange={e => setDelegateUserId(e.target.value)} placeholder="Enter target user ID" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDelegateDialog(false)}>Cancel</Button>
            <Button onClick={() => delegateMutation.mutate()} disabled={delegateMutation.isPending || !delegateUserId.trim()}>Delegate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── অর্থ প্রদান রেকর্ড ডায়ালগ ─── */}
      <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Payment</DialogTitle><DialogDescription>Record a payment for this invoice.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input type="number" min={0} step={0.01} value={payForm.amount} onChange={e => setPayForm(f => ({ ...f, amount: Number(e.target.value) }))} />
                <p className="text-xs text-muted-foreground">Outstanding: {formatCurrency(outstanding)}</p>
              </div>
              <div className="space-y-2">
                <Label>Method</Label>
                <Select value={payForm.method} onValueChange={v => setPayForm(f => ({ ...f, method: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reference Number</Label>
              <Input value={payForm.reference} onChange={e => setPayForm(f => ({ ...f, reference: e.target.value }))} placeholder="Payment reference" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Bank Reference</Label>
                <Input value={payForm.bankReference} onChange={e => setPayForm(f => ({ ...f, bankReference: e.target.value }))} placeholder="Bank ref" />
              </div>
              <div className="space-y-2">
                <Label>Cheque Number</Label>
                <Input value={payForm.chequeNumber} onChange={e => setPayForm(f => ({ ...f, chequeNumber: e.target.value }))} placeholder="Cheque #" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialog(false)}>Cancel</Button>
            <Button onClick={() => recordPayMutation.mutate(payForm)} disabled={recordPayMutation.isPending || payForm.amount <= 0}>Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── ধারণ সংরক্ষণ মুক্তি ডায়ালগ ─── */}
      <Dialog open={retentionDialog} onOpenChange={setRetentionDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Release Retention</DialogTitle><DialogDescription>Release retention amount for this invoice.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Amount to Release</Label>
              <Input type="number" min={0} step={0.01} value={retForm.amount} onChange={e => setRetForm(f => ({ ...f, amount: Number(e.target.value) }))} />
              <p className="text-xs text-muted-foreground">Max: {formatCurrency(retAmt)}</p>
            </div>
            <div className="space-y-2">
              <Label>Reference</Label>
              <Input value={retForm.reference} onChange={e => setRetForm(f => ({ ...f, reference: e.target.value }))} placeholder="Release reference" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRetentionDialog(false)}>Cancel</Button>
            <Button onClick={() => releaseRetMutation.mutate(retForm)} disabled={releaseRetMutation.isPending || retForm.amount <= 0}>Release</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── মুছে ফেলার ডায়ালগ ─── */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}