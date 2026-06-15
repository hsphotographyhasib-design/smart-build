'use client'

import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppStore, api } from '@/lib/store'
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
  FileText, Plus, Search, ArrowLeft, Eye, Pencil, Trash2, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, AlertTriangle, Clock, DollarSign, Users, Award, Trophy, Star,
  Building2, Upload, Download, Send, Gavel, Target, ClipboardCheck, MessageCircle,
  HelpCircle, FileUp, BarChart3,
} from 'lucide-react'

// ─── Props ───
interface TenderDetailPageProps {
  packageId: string
}

// ─── Types ───
interface BidItem {
  id: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  total: number
}

interface Invitation {
  id: string
  vendorId: string
  vendorName: string
  status: string
  sentAt: string
  openedAt?: string
  respondedAt?: string
}

interface Submission {
  id: string
  vendorId: string
  vendorName: string
  totalAmount: number
  status: string
  submittedAt: string
  technicalScore?: number
  commercialScore?: number
}

interface Document {
  id: string
  fileName: string
  category: string
  fileSize: number
  uploadedAt: string
  uploadedBy: string
}

interface QA {
  id: string
  question: string
  answer?: string
  askedBy: string
  askedAt: string
  answeredBy?: string
  answeredAt?: string
}

interface Addendum {
  id: string
  title: string
  description: string
  issuedDate: string
  issuedBy: string
}

interface EvaluationCriterion {
  id: string
  name: string
  weight: number
  type: string
}

interface TenderPackage {
  id: string
  packageNo: string
  name: string
  status: string
  projectId: string
  project: { id: string; name: string; code: string } | null
  category: string
  description: string
  scopeOfWork: string
  estimatedBudget: number
  bidDueDate: string
  boqReference: string
  requireTechnicalProposal: boolean
  requireCommercialProposal: boolean
  requireMethodStatement: boolean
  requireQualityPlan: boolean
  requireSafetyPlan: boolean
  createdAt: string
  publishedAt?: string
  awardedVendorId?: string
  awardedVendor?: { id: string; name: string }
  awardedAmount?: number
  bidItems: BidItem[]
  invitations: Invitation[]
  submissions: Submission[]
  documents: Document[]
  qa: QA[]
  addenda: Addendum[]
  evaluationCriteria: EvaluationCriterion[]
  approvalSteps: { step: string; status: string; completedAt?: string; note?: string }[]
}

// ─── Config Maps ───
const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  published: { label: 'Published', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  under_evaluation: { label: 'Under Evaluation', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  awarded: { label: 'Awarded', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Cancelled', className: 'bg-red-50 text-red-700 border-red-200' },
  closed: { label: 'Closed', className: 'bg-gray-100 text-gray-500 border-gray-200' },
}

const invitationStatusConfig: Record<string, { label: string; className: string }> = {
  sent: { label: 'Sent', className: 'bg-amber-50 text-amber-700' },
  opened: { label: 'Opened', className: 'bg-cyan-50 text-cyan-700' },
  accepted: { label: 'Accepted', className: 'bg-emerald-50 text-emerald-700' },
  declined: { label: 'Declined', className: 'bg-red-50 text-red-700' },
  submitted: { label: 'Submitted', className: 'bg-teal-50 text-teal-700' },
}

const submissionStatusConfig: Record<string, { label: string; className: string }> = {
  pending_review: { label: 'Pending Review', className: 'bg-amber-50 text-amber-700' },
  qualified: { label: 'Qualified', className: 'bg-emerald-50 text-emerald-700' },
  disqualified: { label: 'Disqualified', className: 'bg-red-50 text-red-700' },
  recommended: { label: 'Recommended', className: 'bg-teal-50 text-teal-700' },
  withdrawn: { label: 'Withdrawn', className: 'bg-gray-100 text-gray-500' },
}

// ─── Component ───
export function TenderDetailPage({ packageId }: TenderDetailPageProps) {
  const { navigate } = useAppStore()
  const { formatCurrency, formatDate, formatDateTime } = useFormat()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState('overview')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [qaOpen, setQaOpen] = useState(false)
  const [addendaOpen, setAddendaOpen] = useState(false)
  const [awardOpen, setAwardOpen] = useState(false)

  // Form states
  const [inviteVendorId, setInviteVendorId] = useState('')
  const [qaForm, setQaForm] = useState({ question: '' })
  const [addendaForm, setAddendaForm] = useState({ title: '', description: '' })
  const [awardForm, setAwardForm] = useState({ vendorId: '', notes: '', awardAmount: 0 })

  // ─── Queries ───
  const { data, isLoading } = useQuery({
    queryKey: ['tender-package', packageId],
    queryFn: () => api.get<TenderPackage>(`/api/tender/packages/${packageId}`),
    enabled: !!packageId,
  })

  const { data: vendorsData } = useQuery({
    queryKey: ['tender-vendors-select'],
    queryFn: () => api.get('/api/tender/vendors'),
  })

  const pkg = data?.data
  const vendors = vendorsData?.data || []
  const sc = statusConfig[pkg?.status || 'draft'] || statusConfig.draft

  // ─── Mutations ───
  const publishMutation = useMutation({
    mutationFn: () => api.put(`/api/tender/packages/${packageId}/publish`, {}),
    onSuccess: () => { toast.success('Tender published'); queryClient.invalidateQueries({ queryKey: ['tender-package', packageId] }) },
    onError: (err: any) => toast.error(err?.error || 'Failed to publish'),
  })

  const inviteMutation = useMutation({
    mutationFn: (body: any) => api.post(`/api/tender/packages/${packageId}/invitations`, body),
    onSuccess: () => { toast.success('Vendor invited'); setInviteOpen(false); setInviteVendorId(''); queryClient.invalidateQueries({ queryKey: ['tender-package', packageId] }) },
    onError: (err: any) => toast.error(err?.error || 'Failed to invite'),
  })

  const qaMutation = useMutation({
    mutationFn: (body: any) => api.post(`/api/tender/packages/${packageId}/qa`, body),
    onSuccess: () => { toast.success('Question added'); setQaOpen(false); setQaForm({ question: '' }); queryClient.invalidateQueries({ queryKey: ['tender-package', packageId] }) },
    onError: (err: any) => toast.error(err?.error || 'Failed to add question'),
  })

  const addendaMutation = useMutation({
    mutationFn: (body: any) => api.post(`/api/tender/packages/${packageId}/addenda`, body),
    onSuccess: () => { toast.success('Addendum created'); setAddendaOpen(false); setAddendaForm({ title: '', description: '' }); queryClient.invalidateQueries({ queryKey: ['tender-package', packageId] }) },
    onError: (err: any) => toast.error(err?.error || 'Failed to create addendum'),
  })

  const awardMutation = useMutation({
    mutationFn: (body: any) => api.post(`/api/tender/packages/${packageId}/award`, body),
    onSuccess: () => { toast.success('Award recommended'); setAwardOpen(false); queryClient.invalidateQueries({ queryKey: ['tender-package', packageId] }) },
    onError: (err: any) => toast.error(err?.error || 'Failed to recommend award'),
  })

  const statusMutation = useMutation({
    mutationFn: (body: { status: string }) => api.put(`/api/tender/packages/${packageId}`, body),
    onSuccess: () => { toast.success('Status updated'); queryClient.invalidateQueries({ queryKey: ['tender-package', packageId] }) },
    onError: (err: any) => toast.error(err?.error || 'Failed to update'),
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-8 w-96" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!pkg) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <FileText className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Bid package not found</p>
        <Button variant="outline" onClick={() => navigate('tender-packages')}>Back to Packages</Button>
      </div>
    )
  }

  const completedSteps = (pkg.approvalSteps || []).filter(s => s.status === 'completed').length
  const totalSteps = (pkg.approvalSteps || []).length
  const stepProgress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="outline" size="icon" className="mt-0.5" onClick={() => navigate('tender-packages')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-mono text-muted-foreground">{pkg.packageNo}</span>
              <Badge variant="outline" className={cn('text-xs', sc.className)}>{sc.label}</Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mt-1">{pkg.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {pkg.project?.name || 'No Project'} · {pkg.category || 'Uncategorized'} · Budget: {formatCurrency(pkg.estimatedBudget)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {pkg.status === 'draft' && (
            <Button onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending} className="gap-2">
              {publishMutation.isPending ? <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="h-4 w-4" />}
              Publish
            </Button>
          )}
          {pkg.status === 'published' && (
            <Button variant="outline" className="gap-2" onClick={() => statusMutation.mutate({ status: 'under_evaluation' })}>
              <ClipboardCheck className="h-4 w-4" /> Start Evaluation
            </Button>
          )}
          <Button variant="outline" className="gap-2" onClick={() => navigate('tender-comparison', { packageId })}>
            <BarChart3 className="h-4 w-4" /> Compare Bids
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="items" className="text-xs">Bid Items</TabsTrigger>
          <TabsTrigger value="invitations" className="text-xs">Invitations</TabsTrigger>
          <TabsTrigger value="submissions" className="text-xs">Submissions</TabsTrigger>
          <TabsTrigger value="evaluation" className="text-xs">Evaluation</TabsTrigger>
          <TabsTrigger value="documents" className="text-xs">Documents</TabsTrigger>
          <TabsTrigger value="qa" className="text-xs">Q&A</TabsTrigger>
          <TabsTrigger value="addenda" className="text-xs">Addenda</TabsTrigger>
          <TabsTrigger value="award" className="text-xs">Award</TabsTrigger>
        </TabsList>

        {/* ═══ OVERVIEW TAB ═══ */}
        <TabsContent value="overview" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Package Info */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Package Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Project:</span><p className="font-medium">{pkg.project?.name || '—'}</p></div>
                  <div><span className="text-muted-foreground">Category:</span><p className="font-medium">{pkg.category || '—'}</p></div>
                  <div><span className="text-muted-foreground">Estimated Budget:</span><p className="font-medium">{formatCurrency(pkg.estimatedBudget)}</p></div>
                  <div><span className="text-muted-foreground">Bid Due Date:</span><p className="font-medium">{pkg.bidDueDate ? formatDate(pkg.bidDueDate) : '—'}</p></div>
                  <div><span className="text-muted-foreground">BOQ Reference:</span><p className="font-medium">{pkg.boqReference || '—'}</p></div>
                  <div><span className="text-muted-foreground">Created:</span><p className="font-medium">{formatDate(pkg.createdAt)}</p></div>
                </div>
                {pkg.description && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Description:</span>
                    <p className="mt-1 whitespace-pre-wrap">{pkg.description}</p>
                  </div>
                )}
                {pkg.scopeOfWork && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Scope of Work:</span>
                    <p className="mt-1 whitespace-pre-wrap">{pkg.scopeOfWork}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {pkg.requireTechnicalProposal && <Badge variant="outline" className="bg-violet-50 text-violet-700 text-[10px]">Technical Proposal</Badge>}
                  {pkg.requireCommercialProposal && <Badge variant="outline" className="bg-amber-50 text-amber-700 text-[10px]">Commercial Proposal</Badge>}
                  {pkg.requireMethodStatement && <Badge variant="outline" className="bg-cyan-50 text-cyan-700 text-[10px]">Method Statement</Badge>}
                  {pkg.requireQualityPlan && <Badge variant="outline" className="bg-emerald-50 text-emerald-700 text-[10px]">Quality Plan</Badge>}
                  {pkg.requireSafetyPlan && <Badge variant="outline" className="bg-red-50 text-red-700 text-[10px]">Safety Plan</Badge>}
                </div>
              </CardContent>
            </Card>

            {/* Approval Steps */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Approval Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{completedSteps}/{totalSteps} steps</span>
                  <span className="font-semibold">{stepProgress}%</span>
                </div>
                <Progress value={stepProgress} className="h-2" />
                <ScrollArea className="max-h-64">
                  <div className="space-y-3">
                    {(pkg.approvalSteps || []).map((step, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            'h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold',
                            step.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                            step.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-400'
                          )}>
                            {step.status === 'completed' ? <CheckCircle className="h-3.5 w-3.5" /> :
                             step.status === 'in_progress' ? <Clock className="h-3.5 w-3.5" /> :
                             idx + 1}
                          </div>
                          {idx < (totalSteps - 1) && (
                            <div className={cn(
                              'w-0.5 h-6',
                              step.status === 'completed' ? 'bg-emerald-300' : 'bg-gray-200'
                            )} />
                          )}
                        </div>
                        <div className="pt-0.5">
                          <p className={cn('text-sm font-medium', step.status === 'pending' && 'text-muted-foreground')}>{step.step}</p>
                          {step.completedAt && <p className="text-xs text-muted-foreground">{formatDate(step.completedAt)}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Key Dates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-lg border p-3 text-center">
                  <FileText className="h-5 w-5 mx-auto text-gray-400 mb-1" />
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-semibold">{formatDate(pkg.createdAt)}</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <Send className="h-5 w-5 mx-auto text-amber-500 mb-1" />
                  <p className="text-xs text-muted-foreground">Published</p>
                  <p className="text-sm font-semibold">{pkg.publishedAt ? formatDate(pkg.publishedAt) : '—'}</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <Clock className="h-5 w-5 mx-auto text-orange-500 mb-1" />
                  <p className="text-xs text-muted-foreground">Bid Due</p>
                  <p className="text-sm font-semibold">{pkg.bidDueDate ? formatDate(pkg.bidDueDate) : '—'}</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <Trophy className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
                  <p className="text-xs text-muted-foreground">Awarded To</p>
                  <p className="text-sm font-semibold">{pkg.awardedVendor?.name || '—'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ BID ITEMS TAB ═══ */}
        <TabsContent value="items" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Bid Items</CardTitle>
              <Button variant="outline" size="sm" className="text-xs gap-1">
                <FileUp className="h-3.5 w-3.5" /> Import from BOQ
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[calc(100vh-320px)] overflow-y-auto overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">#</TableHead>
                      <TableHead className="text-xs">Description</TableHead>
                      <TableHead className="text-xs text-right">Quantity</TableHead>
                      <TableHead className="text-xs">Unit</TableHead>
                      <TableHead className="text-xs text-right">Unit Price</TableHead>
                      <TableHead className="text-xs text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(pkg.bidItems || []).map((item, idx) => (
                      <TableRow key={item.id || idx}>
                        <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell className="text-xs">{item.description}</TableCell>
                        <TableCell className="text-xs text-right">{item.quantity}</TableCell>
                        <TableCell className="text-xs">{item.unit}</TableCell>
                        <TableCell className="text-xs text-right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-xs text-right font-medium">{formatCurrency(item.total)}</TableCell>
                      </TableRow>
                    ))}
                    {(pkg.bidItems || []).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                          No bid items yet.{' '}
                          <Button variant="link" className="h-auto p-0 text-xs">
                            Import from BOQ
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {(pkg.bidItems || []).length > 0 && (
                <div className="flex justify-end px-4 py-3 border-t">
                  <div className="text-sm font-bold">Total: {formatCurrency((pkg.bidItems || []).reduce((s, i) => s + i.total, 0))}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ INVITATIONS TAB ═══ */}
        <TabsContent value="invitations" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Vendor Invitations</CardTitle>
              <Button size="sm" className="gap-2 text-xs" onClick={() => setInviteOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> Invite Vendor
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[calc(100vh-320px)] overflow-y-auto overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Vendor</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Sent At</TableHead>
                      <TableHead className="text-xs">Opened At</TableHead>
                      <TableHead className="text-xs">Responded At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(pkg.invitations || []).map((inv) => {
                      const ic = invitationStatusConfig[inv.status] || invitationStatusConfig.sent
                      return (
                        <TableRow key={inv.id}>
                          <TableCell className="text-xs font-medium">{inv.vendorName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', ic.className)}>{ic.label}</Badge>
                          </TableCell>
                          <TableCell className="text-xs">{formatDateTime(inv.sentAt)}</TableCell>
                          <TableCell className="text-xs">{inv.openedAt ? formatDateTime(inv.openedAt) : '—'}</TableCell>
                          <TableCell className="text-xs">{inv.respondedAt ? formatDateTime(inv.respondedAt) : '—'}</TableCell>
                        </TableRow>
                      )
                    })}
                    {(pkg.invitations || []).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                          No invitations sent yet.{' '}
                          <Button variant="link" className="h-auto p-0 text-xs" onClick={() => setInviteOpen(true)}>
                            Invite a vendor
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Invite Vendor Dialog */}
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Vendor</DialogTitle>
                <DialogDescription>Select a vendor to invite for this tender.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Vendor</Label>
                  <Select value={inviteVendorId} onValueChange={setInviteVendorId}>
                    <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                    <SelectContent>
                      {vendors.map((v: any) => (
                        <SelectItem key={v.id} value={v.id}>{v.companyName || v.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
                <Button
                  className="gap-2"
                  onClick={() => inviteMutation.mutate({ vendorId: inviteVendorId })}
                  disabled={!inviteVendorId || inviteMutation.isPending}
                >
                  {inviteMutation.isPending && <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  <Send className="h-3.5 w-3.5" /> Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ═══ SUBMISSIONS TAB ═══ */}
        <TabsContent value="submissions" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Received Bids ({pkg.submissions?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[calc(100vh-320px)] overflow-y-auto overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">#</TableHead>
                      <TableHead className="text-xs">Vendor</TableHead>
                      <TableHead className="text-xs text-right">Bid Amount</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Submitted At</TableHead>
                      <TableHead className="text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(pkg.submissions || []).map((sub, idx) => {
                      const ss = submissionStatusConfig[sub.status] || submissionStatusConfig.pending_review
                      return (
                        <TableRow key={sub.id}>
                          <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                          <TableCell className="text-xs font-medium">{sub.vendorName}</TableCell>
                          <TableCell className="text-xs text-right font-semibold">{formatCurrency(sub.totalAmount)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', ss.className)}>{ss.label}</Badge>
                          </TableCell>
                          <TableCell className="text-xs">{formatDateTime(sub.submittedAt)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {(pkg.submissions || []).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                          No bids submitted yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ EVALUATION TAB ═══ */}
        <TabsContent value="evaluation" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Evaluation Criteria */}
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">Evaluation Criteria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(pkg.evaluationCriteria || []).map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.type}</p>
                    </div>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 text-xs">{c.weight}%</Badge>
                  </div>
                ))}
                {(pkg.evaluationCriteria || []).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No criteria configured</p>
                )}
                <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                  <span>Total Weight</span>
                  <span>{(pkg.evaluationCriteria || []).reduce((s, c) => s + c.weight, 0)}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Scoring Summary */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Scoring Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[calc(100vh-320px)] overflow-y-auto overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Rank</TableHead>
                        <TableHead className="text-xs">Vendor</TableHead>
                        <TableHead className="text-xs text-right">Bid Amount</TableHead>
                        <TableHead className="text-xs text-right">Technical</TableHead>
                        <TableHead className="text-xs text-right">Commercial</TableHead>
                        <TableHead className="text-xs text-right">Combined</TableHead>
                        <TableHead className="text-xs text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(pkg.submissions || [])
                        .filter(s => s.status !== 'disqualified' && s.status !== 'withdrawn')
                        .sort((a, b) => ((b.technicalScore || 0) + (b.commercialScore || 0)) - ((a.technicalScore || 0) + (a.commercialScore || 0)))
                        .map((sub, idx) => {
                          const combined = (sub.technicalScore || 0) + (sub.commercialScore || 0)
                          return (
                            <TableRow key={sub.id}>
                              <TableCell className="text-xs">
                                <span className={cn(
                                  'font-bold text-sm',
                                  idx === 0 ? 'text-amber-600' : 'text-muted-foreground'
                                )}>
                                  {idx + 1}
                                </span>
                              </TableCell>
                              <TableCell className="text-xs font-medium">{sub.vendorName}</TableCell>
                              <TableCell className="text-xs text-right">{formatCurrency(sub.totalAmount)}</TableCell>
                              <TableCell className="text-xs text-right">{sub.technicalScore ?? '—'}</TableCell>
                              <TableCell className="text-xs text-right">{sub.commercialScore ?? '—'}</TableCell>
                              <TableCell className="text-xs text-right font-bold">{combined || '—'}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => navigate('tender-comparison', { packageId })}>
                                  <Eye className="h-3 w-3" /> View
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      {(pkg.submissions || []).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                            No submissions to evaluate
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ═══ DOCUMENTS TAB ═══ */}
        <TabsContent value="documents" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Tender Documents</CardTitle>
              <Button size="sm" className="gap-2 text-xs">
                <Upload className="h-3.5 w-3.5" /> Upload Document
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[calc(100vh-320px)] overflow-y-auto overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">File Name</TableHead>
                      <TableHead className="text-xs">Category</TableHead>
                      <TableHead className="text-xs">Size</TableHead>
                      <TableHead className="text-xs">Uploaded By</TableHead>
                      <TableHead className="text-xs">Uploaded At</TableHead>
                      <TableHead className="text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(pkg.documents || []).map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="text-xs font-medium">
                          <span className="inline-flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            {doc.fileName}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0">
                            {doc.category || 'General'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {doc.fileSize > 1024 * 1024
                            ? `${(doc.fileSize / 1024 / 1024).toFixed(1)} MB`
                            : `${(doc.fileSize / 1024).toFixed(0)} KB`}
                        </TableCell>
                        <TableCell className="text-xs">{doc.uploadedBy}</TableCell>
                        <TableCell className="text-xs">{formatDate(doc.uploadedAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(pkg.documents || []).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                          No documents uploaded yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Q&A TAB ═══ */}
        <TabsContent value="qa" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MessageCircle className="h-4 w-4" /> Questions & Answers ({pkg.qa?.length || 0})
              </CardTitle>
              <Button size="sm" className="gap-2 text-xs" onClick={() => setQaOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> Ask Question
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[500px]">
                <div className="space-y-4">
                  {(pkg.qa || []).map((q) => (
                    <div key={q.id} className="rounded-lg border p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <HelpCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm">{q.question}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Asked by {q.askedBy} · {formatDateTime(q.askedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      {q.answer && (
                        <div className="ml-6 flex items-start gap-2 rounded-md bg-muted/50 p-3">
                          <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm">{q.answer}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Answered by {q.answeredBy} · {formatDateTime(q.answeredAt)}
                            </p>
                          </div>
                        </div>
                      )}
                      {!q.answer && (
                        <div className="ml-6">
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 text-[10px]">Pending Answer</Badge>
                        </div>
                      )}
                    </div>
                  ))}
                  {(pkg.qa || []).length === 0 && (
                    <div className="text-center py-8">
                      <HelpCircle className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No questions yet</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Add Question Dialog */}
          <Dialog open={qaOpen} onOpenChange={setQaOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Ask a Question</DialogTitle>
                <DialogDescription>Your question will be visible to all invited vendors.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Question</Label>
                  <Textarea
                    value={qaForm.question}
                    onChange={e => setQaForm({ question: e.target.value })}
                    placeholder="Type your question..."
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setQaOpen(false)}>Cancel</Button>
                <Button
                  className="gap-2"
                  onClick={() => qaMutation.mutate({ question: qaForm.question })}
                  disabled={!qaForm.question || qaMutation.isPending}
                >
                  {qaMutation.isPending && <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  <Send className="h-3.5 w-3.5" /> Submit
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ═══ ADDENDA TAB ═══ */}
        <TabsContent value="addenda" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Addenda ({pkg.addenda?.length || 0})</CardTitle>
              <Button size="sm" className="gap-2 text-xs" onClick={() => setAddendaOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> Create Addendum
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[calc(100vh-320px)] overflow-y-auto overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">#</TableHead>
                      <TableHead className="text-xs">Title</TableHead>
                      <TableHead className="text-xs">Description</TableHead>
                      <TableHead className="text-xs">Issued Date</TableHead>
                      <TableHead className="text-xs">Issued By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(pkg.addenda || []).map((add, idx) => (
                      <TableRow key={add.id}>
                        <TableCell className="text-xs font-mono text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell className="text-xs font-medium">{add.title}</TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate">{add.description}</TableCell>
                        <TableCell className="text-xs">{formatDate(add.issuedDate)}</TableCell>
                        <TableCell className="text-xs">{add.issuedBy}</TableCell>
                      </TableRow>
                    ))}
                    {(pkg.addenda || []).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                          No addenda issued
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Create Addendum Dialog */}
          <Dialog open={addendaOpen} onOpenChange={setAddendaOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Addendum</DialogTitle>
                <DialogDescription>Issue an addendum to update tender specifications.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={addendaForm.title}
                    onChange={e => setAddendaForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Addendum title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={addendaForm.description}
                    onChange={e => setAddendaForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Describe the changes..."
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddendaOpen(false)}>Cancel</Button>
                <Button
                  onClick={() => addendaMutation.mutate(addendaForm)}
                  disabled={!addendaForm.title || addendaMutation.isPending}
                >
                  {addendaMutation.isPending && <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ═══ AWARD TAB ═══ */}
        <TabsContent value="award" className="space-y-4 mt-4">
          {pkg.status === 'awarded' ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" /> Award Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50/50 p-6 text-center">
                  <Trophy className="h-12 w-12 mx-auto text-amber-500 mb-3" />
                  <h3 className="text-lg font-bold">Awarded to {pkg.awardedVendor?.name || '—'}</h3>
                  <p className="text-2xl font-bold text-emerald-700 mt-2">{formatCurrency(pkg.awardedAmount || 0)}</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Package:</span><p className="font-medium">{pkg.packageNo}</p></div>
                  <div><span className="text-muted-foreground">Est. Budget:</span><p className="font-medium">{formatCurrency(pkg.estimatedBudget)}</p></div>
                  <div><span className="text-muted-foreground">Savings:</span><p className="font-medium text-emerald-600">{formatCurrency(pkg.estimatedBudget - (pkg.awardedAmount || 0))}</p></div>
                  <div>
                    <span className="text-muted-foreground">Actions:</span>
                    <div className="mt-1">
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                        <Download className="h-3 w-3" /> Award Letter
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Gavel className="h-4 w-4" /> Award Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Review the evaluation results and recommend the winning vendor for this tender package.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Recommended Vendor</Label>
                    <Select value={awardForm.vendorId} onValueChange={v => setAwardForm(f => ({ ...f, vendorId: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                      <SelectContent>
                        {(pkg.submissions || []).filter(s => s.status !== 'disqualified' && s.status !== 'withdrawn').map((s) => (
                          <SelectItem key={s.vendorId} value={s.vendorId}>
                            {s.vendorName} — {formatCurrency(s.totalAmount)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Award Amount</Label>
                    <Input
                      type="number"
                      min={0}
                      step={1000}
                      value={awardForm.awardAmount || ''}
                      onChange={e => setAwardForm(f => ({ ...f, awardAmount: Number(e.target.value) }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={awardForm.notes}
                    onChange={e => setAwardForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Award recommendation notes..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => awardMutation.mutate(awardForm)}
                    disabled={!awardForm.vendorId || awardMutation.isPending}
                    className="gap-2"
                  >
                    {awardMutation.isPending && <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    <Award className="h-4 w-4" /> Recommend Award
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}