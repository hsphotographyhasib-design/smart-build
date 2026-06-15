'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { useMaintenanceSocket } from '@/hooks/use-maintenance-socket'
import {
  ArrowLeft, CheckCircle2, Clock, User, MapPin, Phone, Calendar,
  Building2, Wrench, FileText, MessageSquare, Plus, Star,
  Send, Package, ClipboardList, PenLine, ThumbsUp, ChevronRight,
  Eye, PlayCircle, XCircle, Receipt, ShieldCheck, Ban, RotateCcw,
  Image as ImageIcon, DollarSign, CreditCard,
} from 'lucide-react'

// ─── Shared Constants ───
const PRIORITY_CONFIG: Record<string, { label: string; color: string; dotColor: string }> = {
  emergency: { label: 'Emergency', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', dotColor: 'bg-red-500' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300', dotColor: 'bg-orange-500' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300', dotColor: 'bg-yellow-500' },
  low: { label: 'Low', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', dotColor: 'bg-green-500' },
  preventive: { label: 'Preventive', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', dotColor: 'bg-blue-500' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string; step: number; dotColor: string }> = {
  new: { label: 'New', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', step: 0, dotColor: 'bg-slate-500' },
  under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', step: 1, dotColor: 'bg-blue-500' },
  assigned: { label: 'Assigned', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300', step: 2, dotColor: 'bg-indigo-500' },
  accepted: { label: 'Accepted', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300', step: 3, dotColor: 'bg-violet-500' },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300', step: 4, dotColor: 'bg-amber-500' },
  pending_parts: { label: 'Pending Parts', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300', step: 5, dotColor: 'bg-orange-500' },
  pending_customer: { label: 'Pending Customer', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300', step: 6, dotColor: 'bg-cyan-500' },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300', step: 7, dotColor: 'bg-emerald-500' },
  customer_verification: { label: 'Customer Verification', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300', step: 8, dotColor: 'bg-teal-500' },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400', step: 9, dotColor: 'bg-gray-500' },
}

const STATUS_WORKFLOW = [
  'new', 'under_review', 'assigned', 'accepted', 'in_progress',
  'pending_parts', 'pending_customer', 'completed', 'customer_verification', 'closed',
]

const CATEGORY_LABELS: Record<string, string> = {
  air_conditioning: 'Air Conditioning',
  electrical: 'Electrical',
  plumbing: 'Plumbing',
  fire_protection: 'Fire Protection',
  mechanical: 'Mechanical',
  civil: 'Civil',
  cleaning: 'Cleaning',
  security: 'Security',
  it: 'IT',
  general_maintenance: 'General Maintenance',
  other: 'Other',
}

const TYPE_LABELS: Record<string, string> = {
  complaint: 'Complaint',
  work_request: 'Work Request',
  emergency: 'Emergency',
  inspection: 'Inspection',
  quotation: 'Quotation',
  preventive_maintenance: 'Preventive Maintenance',
}

const TYPE_BADGE_COLORS: Record<string, string> = {
  complaint: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300',
  work_request: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  emergency: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  inspection: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  quotation: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  preventive_maintenance: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
}

const TIMELINE_ACTION_COLORS: Record<string, string> = {
  created: 'bg-slate-500',
  status_change: 'bg-blue-500',
  assigned: 'bg-indigo-500',
  note: 'bg-amber-500',
  work_order_created: 'bg-violet-500',
  material_request: 'bg-orange-500',
  customer_approval: 'bg-emerald-500',
  rating: 'bg-yellow-500',
  sla_warning: 'bg-red-500',
  invoice_generated: 'bg-emerald-600',
  invoice_approved: 'bg-teal-500',
  payment_received: 'bg-green-500',
  reviewed: 'bg-sky-500',
  accepted_assignment: 'bg-cyan-500',
  work_started: 'bg-amber-600',
  work_completed: 'bg-lime-500',
  ticket_closed: 'bg-gray-500',
}

const TIMELINE_ACTION_ICONS: Record<string, React.ElementType> = {
  created: FileText,
  status_change: CheckCircle2,
  assigned: User,
  note: MessageSquare,
  work_order_created: ClipboardList,
  material_request: Package,
  customer_approval: ThumbsUp,
  rating: Star,
  sla_warning: Clock,
  invoice_generated: Receipt,
  invoice_approved: ShieldCheck,
  payment_received: DollarSign,
  reviewed: Eye,
  accepted_assignment: CheckCircle2,
  work_started: PlayCircle,
  work_completed: CheckCircle2,
  ticket_closed: XCircle,
}

// ─── SLA Countdown ───
function SLACountdown({ deadline }: { deadline: string }) {
  const [remaining, setRemaining] = useState('')

  useEffect(() => {
    function calc() {
      const diff = new Date(deadline).getTime() - Date.now()
      if (diff <= 0) {
        setRemaining('BREACHED')
        return
      }
      const hours = Math.floor(diff / 3600000)
      const mins = Math.floor((diff % 3600000) / 60000)
      if (hours > 24) {
        const days = Math.floor(hours / 24)
        setRemaining(`${days}d ${hours % 24}h remaining`)
      } else {
        setRemaining(`${hours}h ${mins}m remaining`)
      }
    }
    calc()
    const interval = setInterval(calc, 60000)
    return () => clearInterval(interval)
  }, [deadline])

  const isBreached = remaining === 'BREACHED'

  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
      isBreached
        ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900'
        : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
    )}>
      <Clock className="h-4 w-4" />
      <span className="font-medium">SLA: {isBreached ? '⚠ BREACHED' : remaining}</span>
    </div>
  )
}

// ─── Progress Stepper ───
function ProgressStepper({ status }: { status: string }) {
  const currentStep = STATUS_CONFIG[status]?.step ?? -1

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-0 overflow-x-auto pb-2">
        {STATUS_WORKFLOW.map((step, idx) => {
          const isActive = currentStep >= idx
          const isCurrent = currentStep === idx
          const stepConfig = STATUS_CONFIG[step]
          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center min-w-[56px]">
                <div
                  className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                    isActive
                      ? isCurrent
                        ? 'bg-rose-500 text-white ring-2 ring-rose-200 dark:ring-rose-800 shadow-sm'
                        : 'text-white'
                      : 'bg-muted text-muted-foreground'
                  )}
                  style={isActive && !isCurrent ? { backgroundColor: stepConfig.dotColor } : undefined}
                  title={stepConfig.label}
                >
                  {isActive ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                </div>
                <span className={cn(
                  'text-[10px] mt-1 text-center whitespace-nowrap',
                  isCurrent ? 'font-semibold text-rose-600 dark:text-rose-400' : 'text-muted-foreground'
                )}>
                  {stepConfig.label}
                </span>
              </div>
              {idx < STATUS_WORKFLOW.length - 1 && (
                <div className={cn(
                  'flex-1 h-1 min-w-[12px] mt-[-12px]',
                  currentStep > idx
                    ? 'bg-rose-400'
                    : 'bg-muted'
                )} />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

// ─── Star Rating Component ───
function StarRating({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={cn(
            'h-6 w-6 transition-colors',
            star <= value
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300 dark:text-gray-600',
            !readonly && 'cursor-pointer hover:scale-110'
          )}
          onClick={() => !readonly && onChange?.(star)}
        />
      ))}
    </div>
  )
}

// ─── Main Component ───
export function TicketDetail({ ticketId }: { ticketId: string }) {
  const { navigate } = useAppStore()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Dialogs
  const [assignOpen, setAssignOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [woOpen, setWoOpen] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [approvalOpen, setApprovalOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [completionOpen, setCompletionOpen] = useState(false)

  // Form states
  const [selectedTechId, setSelectedTechId] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [noteText, setNoteText] = useState('')
  const [approvalRating, setApprovalRating] = useState(0)
  const [approvalFeedback, setApprovalFeedback] = useState('')
  const [approvalSignature, setApprovalSignature] = useState('')
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'request_info'>('approve')
  const [reviewNote, setReviewNote] = useState('')
  const [completionNotes, setCompletionNotes] = useState('')
  const [completionLabour, setCompletionLabour] = useState('')
  const [completionPhotos, setCompletionPhotos] = useState('')
  const [completionMaterials, setCompletionMaterials] = useState('')

  // Real-time socket integration
  const { joinRoom, leaveRoom } = useMaintenanceSocket({
    onTicketStatusChanged: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-ticket', ticketId] })
    }, [queryClient, ticketId]),
    onTicketNoteAdded: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-ticket-timeline', ticketId] })
    }, [queryClient, ticketId]),
  })

  useEffect(() => {
    if (ticketId) {
      joinRoom('ticket-' + ticketId)
    }
    return () => {
      if (ticketId) {
        leaveRoom('ticket-' + ticketId)
      }
    }
  }, [ticketId, joinRoom, leaveRoom])

  // Fetch ticket
  const { data, isLoading } = useQuery({
    queryKey: ['maintenance-ticket', ticketId],
    queryFn: () => api.get(`/api/maintenance/tickets/${ticketId}`),
    enabled: !!ticketId,
  })

  // Fetch timeline
  const { data: timelineData } = useQuery({
    queryKey: ['maintenance-ticket-timeline', ticketId],
    queryFn: () => api.get(`/api/maintenance/tickets/${ticketId}/timeline`),
    enabled: !!ticketId,
  })

  // Fetch technicians for assignment
  const { data: techsData } = useQuery({
    queryKey: ['maintenance-technicians'],
    queryFn: () => api.get('/api/maintenance/technicians'),
    enabled: assignOpen,
  })

  const ticket = data?.data as any
  const timeline = (timelineData?.data || []) as any[]
  const technicians = (techsData?.data || []) as any[]

  // Assign mutation
  const assignMutation = useMutation({
    mutationFn: () => api.post(`/api/maintenance/tickets/${ticketId}/assign`, { technicianId: selectedTechId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['maintenance-ticket-timeline', ticketId] })
      setAssignOpen(false)
      setSelectedTechId('')
      toast({ title: 'Technician Assigned', description: 'The technician has been assigned to this ticket.' })
    },
    onError: (err: any) => toast({ title: 'Error', description: err.error || 'Failed to assign', variant: 'destructive' }),
  })

  // Update status mutation
  const statusMutation = useMutation({
    mutationFn: () => api.put(`/api/maintenance/tickets/${ticketId}`, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['maintenance-ticket-timeline', ticketId] })
      setStatusOpen(false)
      setNewStatus('')
      toast({ title: 'Status Updated', description: `Ticket status changed to ${STATUS_CONFIG[newStatus]?.label || newStatus}.` })
    },
    onError: (err: any) => toast({ title: 'Error', description: err.error || 'Failed to update', variant: 'destructive' }),
  })

  // Add timeline note mutation
  const noteMutation = useMutation({
    mutationFn: () => api.post(`/api/maintenance/tickets/${ticketId}/timeline`, {
      action: 'note',
      note: noteText,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-ticket-timeline', ticketId] })
      setNoteOpen(false)
      setNoteText('')
      toast({ title: 'Note Added', description: 'Timeline note has been added.' })
    },
    onError: (err: any) => toast({ title: 'Error', description: err.error || 'Failed to add note', variant: 'destructive' }),
  })

  // Customer approval mutation
  const approvalMutation = useMutation({
    mutationFn: () => api.put(`/api/maintenance/tickets/${ticketId}`, {
      status: 'completed',
      approvalData: { rating: approvalRating, feedback: approvalFeedback, signature: approvalSignature },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['maintenance-ticket-timeline', ticketId] })
      setApprovalOpen(false)
      setApprovalRating(0)
      setApprovalFeedback('')
      setApprovalSignature('')
      toast({ title: 'Approved', description: 'Ticket has been approved and marked as completed.' })
    },
    onError: (err: any) => toast({ title: 'Error', description: err.error || 'Failed to approve', variant: 'destructive' }),
  })

  // Create work order mutation
  const woMutation = useMutation({
    mutationFn: () => api.post('/api/maintenance/work-orders', { ticketId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['maintenance-ticket-timeline', ticketId] })
      setWoOpen(false)
      toast({ title: 'Work Order Created', description: 'A work order has been generated from this ticket.' })
    },
    onError: (err: any) => toast({ title: 'Error', description: err.error || 'Failed to create work order', variant: 'destructive' }),
  })

  // Review ticket mutation
  const reviewMutation = useMutation({
    mutationFn: ({ action, note }: { action: 'approve' | 'reject' | 'request_info'; note?: string }) =>
      api.post(`/api/maintenance/tickets/${ticketId}/review`, { action, note }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['maintenance-ticket-timeline', ticketId] })
      setReviewOpen(false)
      setReviewNote('')
      const labels = { approve: 'Approved', reject: 'Rejected', request_info: 'Info Requested' }
      toast({ title: `Ticket ${labels[vars.action]}`, description: `The ticket has been ${vars.action === 'request_info' ? 'sent back for more information' : vars.action + 'd'}.` })
    },
    onError: (err: any) => toast({ title: 'Error', description: err.error || 'Review failed', variant: 'destructive' }),
  })

  // Accept assignment mutation
  const acceptMutation = useMutation({
    mutationFn: () => api.post(`/api/maintenance/tickets/${ticketId}/accept`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['maintenance-ticket-timeline', ticketId] })
      toast({ title: 'Assignment Accepted', description: 'You have accepted this ticket assignment.' })
    },
    onError: (err: any) => toast({ title: 'Error', description: err.error || 'Failed to accept', variant: 'destructive' }),
  })

  // Reject assignment mutation
  const rejectAssignmentMutation = useMutation({
    mutationFn: () => api.post(`/api/maintenance/tickets/${ticketId}/reject-assignment`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['maintenance-ticket-timeline', ticketId] })
      toast({ title: 'Assignment Rejected', description: 'The assignment has been rejected.' })
    },
    onError: (err: any) => toast({ title: 'Error', description: err.error || 'Failed to reject assignment', variant: 'destructive' }),
  })

  // Start work mutation
  const startWorkMutation = useMutation({
    mutationFn: () => api.post(`/api/maintenance/tickets/${ticketId}/start`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['maintenance-ticket-timeline', ticketId] })
      toast({ title: 'Work Started', description: 'Work has been started on this ticket.' })
    },
    onError: (err: any) => toast({ title: 'Error', description: err.error || 'Failed to start work', variant: 'destructive' }),
  })

  // Complete work mutation
  const completeWorkMutation = useMutation({
    mutationFn: (body: { completionNotes?: string; labourHours?: string; photoUrls?: string; materialsUsed?: string }) =>
      api.post(`/api/maintenance/tickets/${ticketId}/complete`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['maintenance-ticket-timeline', ticketId] })
      setCompletionOpen(false)
      setCompletionNotes('')
      setCompletionLabour('')
      setCompletionPhotos('')
      setCompletionMaterials('')
      toast({ title: 'Work Completed', description: 'Work has been marked as completed. Awaiting customer verification.' })
    },
    onError: (err: any) => toast({ title: 'Error', description: err.error || 'Failed to complete work', variant: 'destructive' }),
  })

  // Customer verification (approve/reject/rework) mutation
  const customerVerifyMutation = useMutation({
    mutationFn: ({ action, rating, feedback }: { action: 'approve' | 'reject' | 'rework'; rating?: number; feedback?: string }) =>
      api.post(`/api/maintenance/tickets/${ticketId}/customer-verify`, { action, rating, feedback }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['maintenance-ticket-timeline', ticketId] })
      setApprovalOpen(false)
      const labels = { approve: 'Approved & Completed', reject: 'Rejected', rework: 'Sent for Rework' }
      toast({ title: `Verification: ${labels[vars.action]}`, description: `The ticket has been ${vars.action === 'rework' ? 'sent back for rework' : labels[vars.action].toLowerCase()}.` })
    },
    onError: (err: any) => toast({ title: 'Error', description: err.error || 'Verification failed', variant: 'destructive' }),
  })

  // Close ticket mutation
  const closeMutation = useMutation({
    mutationFn: () => api.post(`/api/maintenance/tickets/${ticketId}/close`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['maintenance-ticket-timeline', ticketId] })
      toast({ title: 'Ticket Closed', description: 'The ticket has been closed.' })
    },
    onError: (err: any) => toast({ title: 'Error', description: err.error || 'Failed to close ticket', variant: 'destructive' }),
  })

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: () => api.post(`/api/maintenance/invoices`, { ticketId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['maintenance-ticket-timeline', ticketId] })
      toast({ title: 'Invoice Created', description: 'An invoice has been generated for this ticket.' })
    },
    onError: (err: any) => toast({ title: 'Error', description: err.error || 'Failed to create invoice', variant: 'destructive' }),
  })

  if (isLoading || !ticket) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-20 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  const pri = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.medium
  const stat = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.new

  // Material requests
  const materialRequests = ticket.materialRequests || []
  // Work orders
  const workOrders = ticket.workOrders || []

  // Determine available next statuses
  const currentStep = stat.step
  const availableStatuses = STATUS_WORKFLOW.filter((_, idx) => idx > currentStep && idx <= currentStep + 2)

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button size="icon" variant="ghost" onClick={() => navigate('maintenance-service-requests')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight font-mono text-rose-600">{ticket.ticketNo}</h1>
              <Badge variant="secondary" className={cn('text-xs', TYPE_BADGE_COLORS[ticket.type] || '')}>
                {TYPE_LABELS[ticket.type] || ticket.type}
              </Badge>
              <Badge variant="secondary" className={cn('gap-1 text-xs', pri.color)}>
                <span className={cn('h-1.5 w-1.5 rounded-full', pri.dotColor)} />
                {pri.label}
              </Badge>
              <Badge variant="secondary" className={cn('text-xs', stat.color)}>
                {stat.label}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm mt-0.5">{ticket.subject}</p>
          </div>
        </div>
      </div>

      {/* Progress Stepper */}
      <Card className="bg-rose-50/50 dark:bg-rose-950/10">
        <CardContent className="p-4">
          <ProgressStepper status={ticket.status} />
        </CardContent>
      </Card>

      {/* SLA Countdown */}
      {ticket.slaDeadline && <SLACountdown deadline={ticket.slaDeadline} />}

      {/* Two-Column Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Ticket Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-rose-500" /> Ticket Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailRow label="Subject" value={ticket.subject} />
            <DetailRow label="Description" value={ticket.description || 'No description'} />
            <DetailRow label="Category" value={CATEGORY_LABELS[ticket.category] || ticket.category} />
            <DetailRow label="Priority" value={pri.label} />
            <DetailRow label="Status" value={stat.label} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground">Created</span>
                <p className="text-sm font-medium">{new Date(ticket.createdAt).toLocaleString()}</p>
              </div>
              {ticket.completedAt && (
                <div>
                  <span className="text-xs text-muted-foreground">Completed</span>
                  <p className="text-sm font-medium">{new Date(ticket.completedAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right: Customer, Site, Equipment, Contact Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-rose-500" /> Site Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow label="Site" value={ticket.site?.name || '—'} />
              <div className="grid grid-cols-3 gap-3">
                <DetailRow label="Building" value={ticket.building || '—'} />
                <DetailRow label="Floor" value={ticket.floor || '—'} />
                <DetailRow label="Room" value={ticket.room || '—'} />
              </div>
              <DetailRow label="Location" value={ticket.location || '—'} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-rose-500" /> Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow label="Contact Person" value={ticket.contactPerson || '—'} />
              <DetailRow label="Contact Phone" value={ticket.contactPhone || '—'} />
              <DetailRow label="Customer" value={ticket.customer?.name || '—'} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Wrench className="h-4 w-4 text-rose-500" /> Equipment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ticket.asset ? (
                <div className="space-y-2">
                  <DetailRow label="Equipment" value={ticket.asset.name} />
                  <DetailRow label="Code" value={ticket.asset.code || ticket.asset.assetCode || '—'} />
                  <DetailRow label="Serial No." value={ticket.asset.serialNumber || '—'} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No equipment linked</p>
              )}
              <DetailRow label="Technician" value={ticket.technician?.employee?.name || 'Not assigned'} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-rose-500" /> Activity Timeline
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/30"
              onClick={() => setNoteOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" /> Add Note
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {timeline.length > 0 ? (
            <div className="relative space-y-0">
              {timeline.map((entry: any, idx: number) => {
                const actionColor = TIMELINE_ACTION_COLORS[entry.action] || 'bg-gray-500'
                const ActionIcon = TIMELINE_ACTION_ICONS[entry.action] || MessageSquare
                return (
                  <div key={entry.id || idx} className="flex gap-3 pb-6 last:pb-0">
                    {/* Timeline line + dot */}
                    <div className="flex flex-col items-center">
                      <div className={cn('h-5 w-5 rounded-full mt-1 shrink-0 flex items-center justify-center', actionColor)}>
                        <ActionIcon className="h-3 w-3 text-white" />
                      </div>
                      {idx < timeline.length - 1 && (
                        <div className="w-px flex-1 bg-border mt-1" />
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex-1 -mt-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium capitalize">
                          {entry.action?.replace(/_/g, ' ') || 'Activity'}
                        </span>
                        {entry.fromStatus && (
                          <Badge variant="secondary" className="text-[10px]">
                            {STATUS_CONFIG[entry.fromStatus]?.label || entry.fromStatus}
                            <ChevronRight className="h-3 w-3 mx-0.5" />
                            {STATUS_CONFIG[entry.toStatus]?.label || entry.toStatus}
                          </Badge>
                        )}
                        {entry.technician && (
                          <Badge variant="secondary" className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                            {entry.technician.employee?.name || 'Technician'}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {entry.createdBy?.name || 'System'} · {new Date(entry.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {entry.note && (
                        <p className="text-sm text-muted-foreground mt-1 bg-muted/50 rounded-lg p-2">{entry.note}</p>
                      )}
                      {entry.oldValues && (
                        <div className="text-xs text-muted-foreground mt-1 bg-muted/30 rounded-lg p-2 font-mono">
                          {JSON.stringify(entry.oldValues, null, 2)}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <MessageSquare className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No activity recorded yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Work Orders */}
      {workOrders.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-rose-500" /> Work Orders ({workOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {workOrders.map((wo: any) => (
              <div key={wo.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium font-mono">{wo.woNo}</p>
                  <p className="text-xs text-muted-foreground">
                    Created: {new Date(wo.createdAt).toLocaleDateString()}
                    {wo.estimatedCost && ` · Est. Cost: $${wo.estimatedCost.toLocaleString()}`}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">{wo.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Material Requests */}
      {materialRequests.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Package className="h-4 w-4 text-rose-500" /> Material Requests ({materialRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {materialRequests.map((mr: any) => (
              <div key={mr.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium font-mono">{mr.mrNo}</p>
                  <p className="text-xs text-muted-foreground">
                    {mr.description || 'No description'}
                    {mr.quantity && ` · Qty: ${mr.quantity}`}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-xs',
                    mr.status === 'issued' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                      : mr.status === 'approved' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : mr.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      : ''
                  )}
                >
                  {mr.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Customer Approval Section - Enhanced with full verification */}
      {ticket.status === 'pending_customer' && (
        <Card className="border-cyan-200 dark:border-cyan-900 bg-cyan-50/50 dark:bg-cyan-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
              <ThumbsUp className="h-4 w-4" /> Customer Verification Required
            </CardTitle>
            <CardDescription className="text-xs">Please review the completed work and provide your verification.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setApprovalOpen(true)}
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Approve & Complete
              </Button>
              <Button
                variant="outline"
                className="gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50"
                onClick={() => customerVerifyMutation.mutate({ action: 'rework', feedback: 'Sent back for rework by customer' })}
              >
                <RotateCcw className="h-3.5 w-3.5" /> Request Rework
              </Button>
              <Button
                variant="outline"
                className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => customerVerifyMutation.mutate({ action: 'reject', feedback: 'Rejected by customer' })}
              >
                <XCircle className="h-3.5 w-3.5" /> Reject Work
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice Section */}
      {ticket.invoice && (
        <Card className="border-emerald-200 dark:border-emerald-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <Receipt className="h-4 w-4" /> Linked Invoice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">Invoice No.</span>
                  <span className="text-sm font-mono font-semibold">{ticket.invoice.invoiceNo}</span>
                  <Badge
                    variant="secondary"
                    className={cn('text-[10px]',
                      ticket.invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' :
                      ticket.invoice.status === 'approved' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                    )}
                  >
                    {ticket.invoice.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-muted-foreground">Total: <span className="font-semibold text-foreground">${Number(ticket.invoice.total || 0).toLocaleString()}</span></span>
                  {ticket.invoice.paidAmount != null && (
                    <span className="text-muted-foreground">Paid: <span className="font-semibold text-emerald-600">${Number(ticket.invoice.paidAmount).toLocaleString()}</span></span>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
              >
                <Eye className="h-3.5 w-3.5" /> View Invoice
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions Section - Workflow-aware */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <PenLine className="h-4 w-4 text-rose-500" /> Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {/* Status-based workflow actions */}
            {ticket.status === 'new' && (
              <Button
                className="gap-1.5 bg-sky-600 hover:bg-sky-700"
                onClick={() => setReviewOpen(true)}
              >
                <Eye className="h-3.5 w-3.5" /> Review Ticket
              </Button>
            )}

            {ticket.status === 'under_review' && (
              <Button
                variant="outline"
                className="gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/30"
                onClick={() => setAssignOpen(true)}
              >
                <User className="h-3.5 w-3.5" /> Assign Technician
              </Button>
            )}

            {ticket.status === 'assigned' && (
              <>
                <Button
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                  disabled={acceptMutation.isPending}
                  onClick={() => acceptMutation.mutate()}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> {acceptMutation.isPending ? 'Accepting...' : 'Accept Assignment'}
                </Button>
                <Button
                  variant="outline"
                  className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                  disabled={rejectAssignmentMutation.isPending}
                  onClick={() => rejectAssignmentMutation.mutate()}
                >
                  <Ban className="h-3.5 w-3.5" /> {rejectAssignmentMutation.isPending ? 'Rejecting...' : 'Reject Assignment'}
                </Button>
              </>
            )}

            {ticket.status === 'accepted' && (
              <Button
                className="gap-1.5 bg-amber-600 hover:bg-amber-700"
                disabled={startWorkMutation.isPending}
                onClick={() => startWorkMutation.mutate()}
              >
                <PlayCircle className="h-3.5 w-3.5" /> {startWorkMutation.isPending ? 'Starting...' : 'Start Work'}
              </Button>
            )}

            {ticket.status === 'in_progress' && (
              <Button
                className="gap-1.5 bg-lime-600 hover:bg-lime-700"
                onClick={() => setCompletionOpen(true)}
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Complete Work
              </Button>
            )}

            {ticket.status === 'completed' && (
              <Button
                className="gap-1.5 bg-gray-700 hover:bg-gray-800"
                disabled={closeMutation.isPending}
                onClick={() => closeMutation.mutate()}
              >
                <XCircle className="h-3.5 w-3.5" /> {closeMutation.isPending ? 'Closing...' : 'Close Ticket'}
              </Button>
            )}

            {/* Invoice creation if WO exists but no invoice */}
            {workOrders.length > 0 && !ticket.invoice && ticket.status !== 'new' && ticket.status !== 'under_review' && (
              <Button
                variant="outline"
                className="gap-1.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                disabled={createInvoiceMutation.isPending}
                onClick={() => createInvoiceMutation.mutate()}
              >
                <Receipt className="h-3.5 w-3.5" /> {createInvoiceMutation.isPending ? 'Creating...' : 'Create Invoice'}
              </Button>
            )}

            <Separator orientation="vertical" className="h-8 mx-1 hidden sm:block" />

            {/* Universal actions */}
            <Button
              variant="outline"
              className="gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/30"
              onClick={() => setAssignOpen(true)}
              disabled={ticket.status === 'closed' || ticket.status === 'completed'}
            >
              <User className="h-3.5 w-3.5" /> Assign Technician
            </Button>

            <Button
              variant="outline"
              className="gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/30"
              onClick={() => setStatusOpen(true)}
              disabled={ticket.status === 'closed'}
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Update Status
            </Button>

            <Button
              variant="outline"
              className="gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/30"
              onClick={() => setWoOpen(true)}
              disabled={workOrders.length > 0 || ticket.status === 'closed'}
            >
              <ClipboardList className="h-3.5 w-3.5" /> Create Work Order
            </Button>

            <Button
              variant="outline"
              className="gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/30"
              onClick={() => setNoteOpen(true)}
              disabled={ticket.status === 'closed'}
            >
              <MessageSquare className="h-3.5 w-3.5" /> Add Note
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ─── DIALOGS ─── */}

      {/* Assign Technician Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Technician</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Technician</Label>
              <Select value={selectedTechId} onValueChange={setSelectedTechId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a technician..." />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.employee?.name || t.name} — {t.specialization || 'General'}
                      {t.activeJobs > 0 && ` (${t.activeJobs} active)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              className="bg-rose-600 hover:bg-rose-700"
              disabled={!selectedTechId || assignMutation.isPending}
              onClick={() => assignMutation.mutate()}
            >
              {assignMutation.isPending ? 'Assigning...' : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Current Status</Label>
              <Badge variant="secondary" className={cn('text-xs', stat.color)}>{stat.label}</Badge>
            </div>
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status..." />
                </SelectTrigger>
                <SelectContent>
                  {availableStatuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_CONFIG[s]?.label || s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              className="bg-rose-600 hover:bg-rose-700"
              disabled={!newStatus || statusMutation.isPending}
              onClick={() => statusMutation.mutate()}
            >
              {statusMutation.isPending ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Work Order Dialog */}
      <Dialog open={woOpen} onOpenChange={setWoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Work Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will create a new work order from ticket <span className="font-mono font-medium text-rose-600">{ticket.ticketNo}</span>.
              The work order will inherit the ticket&apos;s details.
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              className="bg-rose-600 hover:bg-rose-700"
              disabled={woMutation.isPending}
              onClick={() => woMutation.mutate()}
            >
              {woMutation.isPending ? 'Creating...' : 'Create Work Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Timeline Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Note</Label>
              <Textarea
                placeholder="Enter your note..."
                rows={4}
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              className="bg-rose-600 hover:bg-rose-700"
              disabled={!noteText.trim() || noteMutation.isPending}
              onClick={() => noteMutation.mutate()}
            >
              {noteMutation.isPending ? 'Adding...' : 'Add Note'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Approval Dialog - Enhanced */}
      <Dialog open={approvalOpen} onOpenChange={setApprovalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Customer Verification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please rate the completed work and provide your feedback. This ticket will be marked as completed upon approval.
            </p>
            <div className="space-y-2">
              <Label>Rating</Label>
              <StarRating value={approvalRating} onChange={setApprovalRating} />
              {approvalRating > 0 && (
                <p className="text-xs text-muted-foreground">
                  {approvalRating === 1 && 'Poor'}
                  {approvalRating === 2 && 'Below Average'}
                  {approvalRating === 3 && 'Average'}
                  {approvalRating === 4 && 'Good'}
                  {approvalRating === 5 && 'Excellent'}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Feedback</Label>
              <Textarea
                placeholder="Share your feedback about the service..."
                rows={3}
                value={approvalFeedback}
                onChange={e => setApprovalFeedback(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Signature (Type your full name)</Label>
              <Input
                placeholder="Your full name as signature"
                value={approvalSignature}
                onChange={e => setApprovalSignature(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="outline"
              className="gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50"
              onClick={() => {
                customerVerifyMutation.mutate({ action: 'rework', rating: approvalRating, feedback: approvalFeedback })
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" /> Rework
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={approvalRating === 0 || !approvalSignature.trim() || customerVerifyMutation.isPending}
              onClick={() => {
                customerVerifyMutation.mutate({ action: 'approve', rating: approvalRating, feedback: approvalFeedback })
              }}
            >
              {customerVerifyMutation.isPending ? 'Approving...' : 'Approve & Complete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Ticket Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review Ticket</DialogTitle>
            <DialogDescription className="text-xs">Review ticket {ticket?.ticketNo} and choose an action.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {([
                { action: 'approve' as const, label: 'Approve', icon: CheckCircle2, color: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-950/50' },
                { action: 'reject' as const, label: 'Reject', icon: XCircle, color: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/50' },
                { action: 'request_info' as const, label: 'Request Info', icon: MessageSquare, color: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-300 dark:hover:bg-amber-950/50' },
              ]).map(opt => (
                <button
                  key={opt.action}
                  type="button"
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-colors',
                    reviewAction === opt.action ? opt.color : 'border-transparent bg-muted/50 hover:bg-muted'
                  )}
                  onClick={() => setReviewAction(opt.action)}
                >
                  <opt.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Review Note</Label>
              <Textarea
                placeholder="Add a note about your review decision..."
                rows={3}
                value={reviewNote}
                onChange={e => setReviewNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              className={cn(
                reviewAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' :
                reviewAction === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                'bg-amber-600 hover:bg-amber-700'
              )}
              disabled={reviewMutation.isPending}
              onClick={() => reviewMutation.mutate({ action: reviewAction, note: reviewNote })}
            >
              {reviewMutation.isPending ? 'Reviewing...' : `Confirm ${reviewAction === 'request_info' ? 'Info Request' : reviewAction.charAt(0).toUpperCase() + reviewAction.slice(1)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Work Dialog */}
      <Dialog open={completionOpen} onOpenChange={setCompletionOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Complete Work</DialogTitle>
            <DialogDescription className="text-xs">Provide completion details for ticket {ticket?.ticketNo}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Completion Notes</Label>
              <Textarea
                placeholder="Describe the work performed..."
                rows={3}
                value={completionNotes}
                onChange={e => setCompletionNotes(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Labour Hours</Label>
                <Input
                  placeholder="e.g., 2.5"
                  type="number"
                  step="0.5"
                  value={completionLabour}
                  onChange={e => setCompletionLabour(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Photo URLs (comma separated)</Label>
                <Input
                  placeholder="https://... , https://..."
                  value={completionPhotos}
                  onChange={e => setCompletionPhotos(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Materials Used</Label>
              <Textarea
                placeholder="List materials used and quantities..."
                rows={2}
                value={completionMaterials}
                onChange={e => setCompletionMaterials(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              className="bg-lime-600 hover:bg-lime-700"
              disabled={!completionNotes.trim() || completeWorkMutation.isPending}
              onClick={() => completeWorkMutation.mutate({
                completionNotes,
                labourHours: completionLabour,
                photoUrls: completionPhotos,
                materialsUsed: completionMaterials,
              })}
            >
              {completeWorkMutation.isPending ? 'Completing...' : 'Submit Completion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Detail Row Helper ───
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-muted-foreground">{label}</span>
      <p className="text-sm font-medium">{value}</p>
    </div>
  )
}