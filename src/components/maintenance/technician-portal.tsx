'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, useAppStore } from '@/lib/store'
import { useMaintenanceSocket } from '@/hooks/use-maintenance-socket'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  CheckCircle2, Clock, Star, AlertTriangle, Play, Pause, Package,
  Plus, ArrowDownUp, ChevronDown, ChevronUp, Wrench, Calendar,
  MapPin, Timer, Award, TrendingUp, BarChart3, Zap, Phone,
  FileText, ShoppingCart, CircleCheck, CircleX, CircleAlert,
  Briefcase, Users, ThumbsUp, ListChecks, ClipboardCheck,
  LogIn, LogOut, Circle, PackageOpen, PackageCheck, Hourglass,
  Truck, ArrowRight, RotateCcw, DollarSign, Ban, ShieldCheck,
} from 'lucide-react'

// ─── প্রকারভেদ ───
interface TechTicket {
  id: string
  ticketNo: string
  subject: string
  priority: string
  status: string
  type: string
  createdAt: string
  slaDeadline: string
  startedAt?: string
  completedAt?: string
  customer: { id: string; name: string } | null
  site: { id: string; name: string; address: string } | null
  workOrder?: { id: string; woNo: string }
  workOrderId?: string
  isOverdue: boolean
  description?: string
  completionNotes?: string
  totalCost?: number
  customerRating?: number
}

interface ScheduleItem {
  ticketNo: string
  subject: string
  customerName: string
  siteName: string
  siteAddress: string
  scheduledTime: string
  status: string
  ticketId: string
  priority: string
}

interface MaterialRequest {
  id: string
  mrNo: string
  ticketNo: string
  status: string
  createdAt: string
  items: Array<{
    id: string
    name: string
    quantity: number
    unit: string
    requestedQty: number
  }>
  ticket?: { ticketNo: string; subject: string }
}

interface PerformanceData {
  totalJobs: number
  completedJobs: number
  completionRate: number
  avgResponseTime: number
  avgResolutionTime: number
  customerRating: number
  totalRatings: number
  monthlyTrend: Array<{
    month: string
    completed: number
    avgRating: number
    avgResponse: number
  }>
  skills: string[]
  certifications: string[]
}

// ─── কনফিগারেশন ───
const priorityConfig: Record<string, { label: string; color: string; dotColor: string }> = {
  emergency: { label: 'Emergency', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', dotColor: 'bg-red-500' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300', dotColor: 'bg-orange-500' },
  medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300', dotColor: 'bg-amber-500' },
  low: { label: 'Low', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', dotColor: 'bg-green-500' },
}

const ticketStatusConfig: Record<string, { label: string; color: string; step: number }> = {
  assigned: { label: 'Assigned', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300', step: 0 },
  accepted: { label: 'Accepted', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300', step: 1 },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300', step: 2 },
  on_hold: { label: 'On Hold', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', step: 2 },
  pending_parts: { label: 'Pending Parts', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300', step: 3 },
  pending_customer: { label: 'Pending Customer', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300', step: 4 },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300', step: 3 },
  verified: { label: 'Verified', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300', step: 4 },
  closed: { label: 'Closed', color: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400', step: 5 },
}

const materialStatusConfig: Record<string, { label: string; color: string; icon: any }> = {
  requested: { label: 'Requested', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300', icon: Hourglass },
  supervisor_approved: { label: 'Supervisor Approved', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300', icon: CircleCheck },
  store_approved: { label: 'Store Approved', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300', icon: PackageCheck },
  issued: { label: 'Issued', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300', icon: Truck },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', icon: CircleX },
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hrs = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${hrs}h ${m}m` : `${hrs}h`
}

// ─── প্রধান উপাদান ───
export function TechnicianPortal() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const user = useAppStore((s) => s.user)
  const [activeTab, setActiveTab] = useState('my-jobs')
  const [expandedJob, setExpandedJob] = useState<string | null>(null)
  const [expandedCompleted, setExpandedCompleted] = useState<string | null>(null)
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false)
  const [selectedJobForMaterial, setSelectedJobForMaterial] = useState<TechTicket | null>(null)

  // নিশ্চিতকরণ ডায়ালগ
  const [confirmAction, setConfirmAction] = useState<{ type: string; ticket: TechTicket } | null>(null)

  // বিরতি ডায়ালগ
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false)
  const [pauseNote, setPauseNote] = useState('')
  const [pauseTicket, setPauseTicket] = useState<TechTicket | null>(null)

  // কাজ সম্পন্ন ডায়ালগ
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)
  const [completeTicket, setCompleteTicket] = useState<TechTicket | null>(null)
  const [completionNotes, setCompletionNotes] = useState('')
  const [labourHours, setLabourHours] = useState<number>(0)
  const [serviceNotes, setServiceNotes] = useState('')
  const [usedMaterials, setUsedMaterials] = useState<Array<{ name: string; quantity: number; unit: string; cost: number }>>([])

  // ওয়ার্ক অর্ডার উপাদান অনুরোধ ডায়ালগ
  const [woMaterialDialogOpen, setWoMaterialDialogOpen] = useState(false)
  const [woMaterialTicket, setWoMaterialTicket] = useState<TechTicket | null>(null)
  const [woMaterialItems, setWoMaterialItems] = useState<Array<{ name: string; quantity: number; unit: string; estimatedCost: number }>>([])
  const [woMaterialNote, setWoMaterialNote] = useState('')

  // আমার টিকেট আনা (বরাদ্দকৃত/চলমান + অপেক্ষমান অবস্থা)
  const { data: myJobsData, isLoading: myJobsLoading } = useQuery({
    queryKey: ['tech-my-jobs'],
    queryFn: () => api.get<TechTicket[]>('/api/maintenance/tickets?status=assigned,accepted,in_progress,on_hold,pending_parts,pending_customer').then(r => r.data || []),
    refetchInterval: 30000,
  })

  // সম্পন্ন টিকেট আনা
  const { data: completedData, isLoading: completedLoading } = useQuery({
    queryKey: ['tech-completed-jobs'],
    queryFn: () => api.get<TechTicket[]>('/api/maintenance/tickets?status=completed,verified,closed').then(r => r.data || []),
  })

  // আজকের সময়সূচি আনা (আজকের বরাদ্দকৃত টিকেট ব্যবহার করা হবে)
  const { data: scheduleData, isLoading: scheduleLoading } = useQuery({
    queryKey: ['tech-schedule-today'],
    queryFn: () => api.get<ScheduleItem[]>('/api/maintenance/tickets?status=assigned,accepted,in_progress&limit=20').then(r => r.data || []),
  })

  // উপাদান অনুরোধ আনা
  const { data: materialsData, isLoading: materialsLoading } = useQuery({
    queryKey: ['tech-materials'],
    queryFn: () => api.get<MaterialRequest[]>('/api/maintenance/materials').then(r => r.data || []),
  })

  // কর্মক্ষমতা তথ্য আনা
  const { data: perfData, isLoading: perfLoading } = useQuery({
    queryKey: ['tech-performance'],
    queryFn: () => api.get<PerformanceData>('/api/maintenance/reports?type=technician_performance').then(r => r.data!),
  })

  const myJobs = myJobsData || []
  const completedJobs = completedData || []
  const scheduleItems = scheduleData || []
  const materialRequests = materialsData || []
  const performance = perfData as PerformanceData | undefined

  // ─── সকেট ইন্টিগ্রেশন ───
  const refetchMyJobs = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['tech-my-jobs'] })
  }, [queryClient])

  const refetchCompleted = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['tech-completed-jobs'] })
  }, [queryClient])

  const refetchMaterials = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['tech-materials'] })
  }, [queryClient])

  const { joinRoom } = useMaintenanceSocket({
    onTicketAssigned: () => { refetchMyJobs(); toast({ title: 'New Job Assigned', description: 'You have been assigned a new job.' }) },
    onTicketStatusChanged: () => { refetchMyJobs(); refetchCompleted() },
    onWorkOrderCreated: () => { refetchMyJobs(); toast({ title: 'Work Order Created', description: 'A new work order has been created for your job.' }) },
    onMaterialRequestCreated: () => { refetchMaterials(); toast({ title: 'Material Request', description: 'A new material request has been submitted.' }) },
    onMaterialStatusChanged: () => { refetchMaterials() },
  })

  useEffect(() => {
    if (user?.technicianProfileId) {
      joinRoom('technician-' + user.technicianProfileId)
    }
  }, [user?.technicianProfileId, joinRoom])

  // ─── মিউটেশনসমূহ ───
  const acceptMutation = useMutation({
    mutationFn: (ticketId: string) => api.post(`/api/maintenance/tickets/${ticketId}/accept`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tech-my-jobs'] })
      toast({ title: 'Job Accepted', description: 'You have accepted the job. Work order created.' })
      setConfirmAction(null)
    },
    onError: (err: any) => toast({ title: 'Accept Failed', description: err.error || 'Failed to accept job', variant: 'destructive' }),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ ticketId, reason }: { ticketId: string; reason: string }) => api.post(`/api/maintenance/tickets/${ticketId}/reject-assignment`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tech-my-jobs'] })
      toast({ title: 'Job Rejected', description: 'You have rejected the assignment.' })
      setConfirmAction(null)
    },
    onError: (err: any) => toast({ title: 'Reject Failed', description: err.error || 'Failed to reject job', variant: 'destructive' }),
  })

  const startWorkMutation = useMutation({
    mutationFn: (woId: string) => api.post(`/api/maintenance/work-orders/${woId}/start`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tech-my-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['tech-schedule-today'] })
      toast({ title: 'Work Started', description: 'Work has been started.' })
    },
    onError: (err: any) => toast({ title: 'Start Failed', description: err.error || 'Failed to start work', variant: 'destructive' }),
  })

  const pauseMutation = useMutation({
    mutationFn: ({ woId, note }: { woId: string; note: string }) => api.post(`/api/maintenance/work-orders/${woId}/pause`, { note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tech-my-jobs'] })
      setPauseDialogOpen(false)
      setPauseNote('')
      setPauseTicket(null)
      toast({ title: 'Work Paused', description: 'Work has been paused.' })
    },
    onError: (err: any) => toast({ title: 'Pause Failed', description: err.error || 'Failed to pause work', variant: 'destructive' }),
  })

  const completeMutation = useMutation({
    mutationFn: ({ woId, body }: { woId: string; body: { completionNotes: string; labourHours: number; usedMaterials?: Array<{ name: string; quantity: number; unit: string; cost: number }>; serviceNotes?: string } }) =>
      api.post(`/api/maintenance/work-orders/${woId}/complete`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tech-my-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['tech-completed-jobs'] })
      setCompleteDialogOpen(false)
      setCompleteTicket(null)
      setCompletionNotes('')
      setLabourHours(0)
      setServiceNotes('')
      setUsedMaterials([])
      toast({ title: 'Work Completed', description: 'Work has been marked as complete. Invoice generated.' })
    },
    onError: (err: any) => toast({ title: 'Complete Failed', description: err.error || 'Failed to complete work', variant: 'destructive' }),
  })

  const requestWOMaterialsMutation = useMutation({
    mutationFn: ({ woId, body }: { woId: string; body: { items: Array<{ name: string; quantity: number; unit: string; estimatedCost?: number }>; note?: string } }) =>
      api.post(`/api/maintenance/work-orders/${woId}/request-materials`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tech-my-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['tech-materials'] })
      setWoMaterialDialogOpen(false)
      setWoMaterialTicket(null)
      setWoMaterialItems([{ name: '', quantity: 1, unit: 'pcs', estimatedCost: 0 }])
      setWoMaterialNote('')
      toast({ title: 'Materials Requested', description: 'Material request submitted for approval.' })
    },
    onError: (err: any) => toast({ title: 'Request Failed', description: err.error || 'Failed to request materials', variant: 'destructive' }),
  })

  // উপাদান অনুরোধ তৈরি মিউটেশন (উত্তরাধিকার)
  const createMaterialMutation = useMutation({
    mutationFn: (body: any) => api.post('/api/maintenance/materials', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tech-materials'] })
      setMaterialDialogOpen(false)
      toast({ title: 'Request Submitted', description: 'Material request has been created.' })
    },
    onError: (err: any) => {
      toast({ title: 'Request Failed', description: err.error || 'Failed to create material request', variant: 'destructive' })
    },
  })

  // ─── হ্যান্ডলারসমূহ ───
  const handleJobAction = (ticket: TechTicket, action: string) => {
    switch (action) {
      case 'accept':
        setConfirmAction({ type: 'accept', ticket })
        break
      case 'reject':
        setConfirmAction({ type: 'reject', ticket })
        break
      case 'start': {
        const woId = ticket.workOrderId || ticket.workOrder?.id
        if (woId) startWorkMutation.mutate(woId)
        break
      }
      case 'pause':
        setPauseTicket(ticket)
        setPauseDialogOpen(true)
        break
      case 'complete':
        setCompleteTicket(ticket)
        setCompleteDialogOpen(true)
        break
      case 'request_materials':
        setWoMaterialTicket(ticket)
        setWoMaterialItems([{ name: '', quantity: 1, unit: 'pcs', estimatedCost: 0 }])
        setWoMaterialNote('')
        setWoMaterialDialogOpen(true)
        break
      default:
        break
    }
  }

  const handleRequestMaterials = (ticket: TechTicket) => {
    setSelectedJobForMaterial(ticket)
    setMaterialDialogOpen(true)
  }

  const isUpdating = acceptMutation.isPending || rejectMutation.isPending || startWorkMutation.isPending || pauseMutation.isPending || completeMutation.isPending || requestWOMaterialsMutation.isPending

  const myJobsGrouped = useMemo(() => {
    const urgent = myJobs.filter(t => t.priority === 'emergency')
    const high = myJobs.filter(t => t.priority === 'high')
    const others = myJobs.filter(t => t.priority !== 'emergency' && t.priority !== 'high')
    return { urgent, high, others }
  }, [myJobs])

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* হেডার */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Wrench className="h-6 w-6 text-rose-600" />
          Technician Portal
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your assignments, schedule, and materials</p>
      </div>

      {/* ট্যাবসমূহ */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5">
          <TabsTrigger value="my-jobs" className="gap-1.5 text-xs sm:text-sm">
            <Briefcase className="h-3.5 w-3.5" /> My Jobs
            {myJobs.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300">
                {myJobs.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="schedule" className="gap-1.5 text-xs sm:text-sm">
            <Calendar className="h-3.5 w-3.5" /> Today
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-1.5 text-xs sm:text-sm">
            <CheckCircle2 className="h-3.5 w-3.5" /> Completed
          </TabsTrigger>
          <TabsTrigger value="materials" className="gap-1.5 text-xs sm:text-sm">
            <Package className="h-3.5 w-3.5" /> Materials
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-1.5 text-xs sm:text-sm">
            <BarChart3 className="h-3.5 w-3.5" /> Performance
          </TabsTrigger>
        </TabsList>

        {/* ট্যাব ১: আমার কাজ */}
        <TabsContent value="my-jobs" className="mt-4 space-y-4">
          {myJobsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
            </div>
          ) : myJobs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <ClipboardCheck className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No active jobs</p>
                <p className="text-xs text-muted-foreground mt-1">You have no assignments at the moment</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* জরুরি কাজ */}
              {myJobsGrouped.urgent.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <h3 className="text-sm font-semibold text-red-600">Emergency Jobs</h3>
                  </div>
                  {myJobsGrouped.urgent.map(ticket => (
                    <JobCard
                      key={ticket.id}
                      ticket={ticket}
                      expanded={expandedJob === ticket.id}
                      onToggle={() => setExpandedJob(prev => prev === ticket.id ? null : ticket.id)}
                      onAction={handleJobAction}
                      onMaterial={handleRequestMaterials}
                      updating={isUpdating}
                    />
                  ))}
                </div>
              )}

              {/* উচ্চ অগ্রাধিকার */}
              {myJobsGrouped.high.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-orange-500" />
                    <h3 className="text-sm font-semibold text-orange-600">High Priority</h3>
                  </div>
                  {myJobsGrouped.high.map(ticket => (
                    <JobCard
                      key={ticket.id}
                      ticket={ticket}
                      expanded={expandedJob === ticket.id}
                      onToggle={() => setExpandedJob(prev => prev === ticket.id ? null : ticket.id)}
                      onAction={handleJobAction}
                      onMaterial={handleRequestMaterials}
                      updating={isUpdating}
                    />
                  ))}
                </div>
              )}

              {/* অন্যান্য কাজ */}
              {myJobsGrouped.others.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-slate-500" />
                    <h3 className="text-sm font-semibold">Other Jobs</h3>
                  </div>
                  {myJobsGrouped.others.map(ticket => (
                    <JobCard
                      key={ticket.id}
                      ticket={ticket}
                      expanded={expandedJob === ticket.id}
                      onToggle={() => setExpandedJob(prev => prev === ticket.id ? null : ticket.id)}
                      onAction={handleJobAction}
                      onMaterial={handleRequestMaterials}
                      updating={isUpdating}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* ট্যাব ২: আজকের সময়সূচি */}
        <TabsContent value="schedule" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-rose-600" />
                Today&apos;s Schedule
              </CardTitle>
              <CardDescription className="text-xs">{new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
            </CardHeader>
            <CardContent>
              {scheduleLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
                </div>
              ) : scheduleItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-10 w-10 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No schedule for today</p>
                  <p className="text-xs text-muted-foreground mt-1">Check your assigned jobs for upcoming work</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {scheduleItems.map((item, idx) => {
                    const pri = priorityConfig[item.priority] || priorityConfig.medium
                    const stat = ticketStatusConfig[item.status] || ticketStatusConfig.assigned
                    return (
                      <div
                        key={idx}
                        className={cn(
                          'flex items-center gap-4 p-3 rounded-lg border transition-colors',
                          item.status === 'in_progress' ? 'border-rose-200 bg-rose-50/50 dark:border-rose-900 dark:bg-rose-950/20' : 'border-border hover:bg-muted/50'
                        )}
                      >
                        <div className="flex flex-col items-center min-w-[60px]">
                          <span className="text-xs font-mono text-muted-foreground">
                            {item.scheduledTime ? new Date(item.scheduledTime).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </span>
                        </div>
                        <Separator orientation="vertical" className="h-10" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono font-medium">{item.ticketNo}</span>
                            <Badge variant="secondary" className={cn('text-[10px] px-1.5 py-0', pri.color)}>
                              {pri.label}
                            </Badge>
                            <Badge variant="secondary" className={cn('text-[10px] px-1.5 py-0', stat.color)}>
                              {stat.label}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium truncate">{item.subject}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" /> {item.customerName}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {item.siteName}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          {item.status === 'assigned' || item.status === 'accepted' ? (
                            <Button size="sm" className="h-8 gap-1 text-xs bg-rose-600 hover:bg-rose-700" onClick={() => {
                              if (item.ticketId) handleJobAction({ ...item, id: item.ticketId, workOrder: undefined, workOrderId: undefined, customer: null, site: null, isOverdue: false } as unknown as TechTicket, 'start')
                            }}>
                              <LogIn className="h-3 w-3" /> Check In
                            </Button>
                          ) : item.status === 'in_progress' ? (
                            <Button size="sm" variant="outline" className="h-8 gap-1 text-xs" onClick={() => {
                              if (item.ticketId) handleJobAction({ ...item, id: item.ticketId, workOrder: undefined, workOrderId: undefined, customer: null, site: null, isOverdue: false } as unknown as TechTicket, 'complete')
                            }}>
                              <LogOut className="h-3 w-3" /> Check Out
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ট্যাব ৩: সম্পন্ন কাজ */}
        <TabsContent value="completed" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {completedLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}
                </div>
              ) : completedJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <CheckCircle2 className="h-10 w-10 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No completed jobs yet</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8"></TableHead>
                        <TableHead className="text-xs">Ticket#</TableHead>
                        <TableHead className="text-xs">Subject</TableHead>
                        <TableHead className="text-xs hidden md:table-cell">Customer</TableHead>
                        <TableHead className="text-xs hidden md:table-cell">Completed</TableHead>
                        <TableHead className="text-xs hidden lg:table-cell">Rating</TableHead>
                        <TableHead className="text-xs hidden lg:table-cell">Time Spent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedJobs.map((ticket) => {
                        const isExpanded = expandedCompleted === ticket.id
                        const timeSpent = ticket.startedAt && ticket.completedAt
                          ? Math.round((new Date(ticket.completedAt).getTime() - new Date(ticket.startedAt).getTime()) / 60000)
                          : 0
                        return (
                          <React.Fragment key={ticket.id}>
                            <TableRow
                              className="cursor-pointer hover:bg-muted/40"
                              onClick={() => setExpandedCompleted(prev => prev === ticket.id ? null : ticket.id)}
                            >
                              <TableCell className="py-3">
                                {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                              </TableCell>
                              <TableCell className="text-xs font-mono">{ticket.ticketNo}</TableCell>
                              <TableCell className="text-xs font-medium">{ticket.subject}</TableCell>
                              <TableCell className="text-xs text-muted-foreground hidden md:table-cell">{ticket.customer?.name || '—'}</TableCell>
                              <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                                {ticket.completedAt ? new Date(ticket.completedAt).toLocaleDateString() : '—'}
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                                  <span className="text-xs">—</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
                                {timeSpent > 0 ? formatDuration(timeSpent) : '—'}
                              </TableCell>
                            </TableRow>
                            {isExpanded && (
                              <TableRow>
                                <TableCell colSpan={7} className="bg-muted/20 px-6 py-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Details</h4>
                                      <div className="space-y-1.5 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Type:</span>
                                          <span className="font-medium">{ticket.type}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Site:</span>
                                          <span className="font-medium">{ticket.site?.name || '—'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Status:</span>
                                          <Badge variant="secondary" className={cn('text-[10px]', ticketStatusConfig[ticket.status]?.color)}>
                                            {ticketStatusConfig[ticket.status]?.label}
                                          </Badge>
                                        </div>
                                        {ticket.workOrder && (
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Work Order:</span>
                                            <span className="font-mono text-xs font-medium">{ticket.workOrder.woNo}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Timeline</h4>
                                      <div className="space-y-1.5 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Created:</span>
                                          <span className="text-xs">{new Date(ticket.createdAt).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Started:</span>
                                          <span className="text-xs">{ticket.startedAt ? new Date(ticket.startedAt).toLocaleString() : '—'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Completed:</span>
                                          <span className="text-xs">{ticket.completedAt ? new Date(ticket.completedAt).toLocaleString() : '—'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Duration:</span>
                                          <span className="text-xs font-medium">{timeSpent > 0 ? formatDuration(timeSpent) : '—'}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ট্যাব ৪: উপাদান অনুরোধ */}
        <TabsContent value="materials" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Dialog open={materialDialogOpen} onOpenChange={(open) => { setMaterialDialogOpen(open); if (!open) setSelectedJobForMaterial(null) }}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5 bg-rose-600 hover:bg-rose-700">
                  <Plus className="h-3.5 w-3.5" /> New Request
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>New Material Request</DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    {selectedJobForMaterial ? `For ${selectedJobForMaterial.ticketNo}: ${selectedJobForMaterial.subject}` : 'Select a job first'}
                  </p>
                </DialogHeader>
                <MaterialRequestForm
                  ticketId={selectedJobForMaterial?.id || ''}
                  ticketNo={selectedJobForMaterial?.ticketNo || ''}
                  onSubmit={(data) => createMaterialMutation.mutate(data)}
                  loading={createMaterialMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>

          {materialsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          ) : materialRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <ShoppingCart className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No material requests</p>
                <Button size="sm" variant="outline" className="mt-3 gap-1.5" onClick={() => {
                  if (myJobs.length > 0) {
                    setSelectedJobForMaterial(myJobs[0])
                    setMaterialDialogOpen(true)
                  } else {
                    toast({ title: 'No Jobs', description: 'You need an active job to request materials', variant: 'destructive' })
                  }
                }}>
                  <Plus className="h-3.5 w-3.5" /> Create Request
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materialRequests.map((mr) => {
                const status = materialStatusConfig[mr.status] || materialStatusConfig.requested
                const StatusIcon = status.icon
                return (
                  <Card key={mr.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-mono text-xs font-medium">{mr.mrNo}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {mr.ticket?.ticketNo || mr.ticketNo} — {mr.ticket?.subject || 'Material request'}
                          </p>
                        </div>
                        <Badge variant="secondary" className={cn('gap-1 text-[10px] px-1.5 py-0', status.color)}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </div>
                      {mr.items.length > 0 && (
                        <div className="space-y-1.5">
                          {mr.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs p-2 rounded bg-muted/50">
                              <span className="font-medium">{item.name}</span>
                              <span className="text-muted-foreground">
                                {item.requestedQty} {item.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-2">
                        Requested {formatTimeAgo(mr.createdAt)}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* ট্যাব ৫: কর্মক্ষমতা */}
        <TabsContent value="performance" className="mt-4 space-y-4">
          {perfLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
          ) : performance ? (
            <>
              {/* পরিসংখ্যান কার্ড */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Jobs</p>
                        <p className="text-2xl font-bold">{performance.totalJobs}</p>
                        <p className="text-xs text-muted-foreground">{performance.completedJobs} completed</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30">
                        <Briefcase className="h-5 w-5 text-rose-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Completion Rate</p>
                        <p className="text-2xl font-bold">{performance.completionRate.toFixed(1)}%</p>
                        <Progress value={performance.completionRate} className="mt-1 h-1.5 [&>div]:bg-rose-600" />
                      </div>
                      <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Response</p>
                        <p className="text-2xl font-bold">{formatDuration(performance.avgResponseTime)}</p>
                        <p className="text-xs text-muted-foreground">time to accept</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                        <Timer className="h-5 w-5 text-amber-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer Rating</p>
                        <div className="flex items-center gap-1">
                          <p className="text-2xl font-bold">{performance.customerRating.toFixed(1)}</p>
                          <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        </div>
                        <p className="text-xs text-muted-foreground">{performance.totalRatings} ratings</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                        <ThumbsUp className="h-5 w-5 text-amber-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* মাসিক ট্রেন্ড */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Monthly Trend</CardTitle>
                    <CardDescription className="text-xs">Last 6 months performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {performance.monthlyTrend.length > 0 ? (
                      <div className="space-y-2">
                        {performance.monthlyTrend.map((m, i) => (
                          <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                            <span className="text-xs font-mono text-muted-foreground w-16">{m.month}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-rose-500 transition-all"
                                    style={{ width: `${Math.min(100, (m.completed / Math.max(1, performance.totalJobs)) * 100)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-xs min-w-[140px] justify-end">
                              <span className="text-muted-foreground">{m.completed} jobs</span>
                              <span className="flex items-center gap-0.5">
                                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                                {m.avgRating.toFixed(1)}
                              </span>
                              <span className="text-muted-foreground">{formatDuration(m.avgResponse)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">
                        No trend data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* দক্ষতা ও সার্টিফিকেশন */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Skills & Certifications</CardTitle>
                    <CardDescription className="text-xs">Your qualifications and specializations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {performance.skills && performance.skills.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Specializations</p>
                        <div className="flex flex-wrap gap-2">
                          {performance.skills.map((skill, i) => (
                            <Badge key={i} variant="secondary" className="gap-1 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
                              <Wrench className="h-3 w-3" /> {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {performance.certifications && performance.certifications.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Certifications</p>
                        <div className="flex flex-wrap gap-2">
                          {performance.certifications.map((cert, i) => (
                            <Badge key={i} variant="secondary" className="gap-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              <Award className="h-3 w-3" /> {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {(!performance.skills?.length && !performance.certifications?.length) && (
                      <div className="h-20 flex items-center justify-center text-sm text-muted-foreground">
                        No skills data available
                      </div>
                    )}
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg Resolution:</span>
                        <span className="font-medium">{formatDuration(performance.avgResolutionTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Ratings:</span>
                        <span className="font-medium">{performance.totalRatings}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <BarChart3 className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">Performance data unavailable</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* ─── নিশ্চিতকরণ ডায়ালগ (গ্রহণ / প্রত্যাখ্যান) ─── */}
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => { if (!open) setConfirmAction(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === 'accept' ? 'Accept Job' : 'Reject Job'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === 'accept'
                ? `Are you sure you want to accept ${confirmAction?.ticket.ticketNo}? A work order will be created.`
                : `Are you sure you want to reject ${confirmAction?.ticket.ticketNo}? The assignment will be removed.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={confirmAction?.type === 'accept' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}
              onClick={() => {
                if (!confirmAction) return
                if (confirmAction.type === 'accept') {
                  acceptMutation.mutate(confirmAction.ticket.id)
                } else {
                  rejectMutation.mutate({ ticketId: confirmAction.ticket.id, reason: 'Technician rejected assignment' })
                }
              }}
              disabled={acceptMutation.isPending || rejectMutation.isPending}
            >
              {confirmAction?.type === 'accept' ? 'Accept Job' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── বিরতি ডায়ালগ ─── */}
      <Dialog open={pauseDialogOpen} onOpenChange={setPauseDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pause Work</DialogTitle>
            <DialogDescription>Provide a reason for pausing work on {pauseTicket?.ticketNo}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reason *</Label>
              <Textarea
                placeholder="Why are you pausing this work?"
                value={pauseNote}
                onChange={(e) => setPauseNote(e.target.value)}
                rows={3}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button
                className="bg-amber-600 hover:bg-amber-700"
                disabled={!pauseNote.trim() || pauseMutation.isPending}
                onClick={() => {
                  if (pauseTicket?.workOrderId || pauseTicket?.workOrder?.id) {
                    pauseMutation.mutate({ woId: pauseTicket.workOrderId || pauseTicket.workOrder!.id, note: pauseNote })
                  }
                }}
              >
                {pauseMutation.isPending ? 'Pausing...' : 'Pause Work'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── কাজ সম্পন্ন ডায়ালগ ─── */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Work</DialogTitle>
            <DialogDescription>Submit completion details for {completeTicket?.ticketNo}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Completion Notes *</Label>
              <Textarea
                placeholder="Describe what was done..."
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Labour Hours *</Label>
              <Input
                type="number"
                min={0}
                step={0.25}
                placeholder="e.g. 2.5"
                value={labourHours || ''}
                onChange={(e) => setLabourHours(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Used Materials</Label>
                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setUsedMaterials([...usedMaterials, { name: '', quantity: 1, unit: 'pcs', cost: 0 }])}>
                  <Plus className="h-3 w-3" /> Add
                </Button>
              </div>
              <ScrollArea className="max-h-36">
                <div className="space-y-2">
                  {usedMaterials.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input placeholder="Name" value={m.name} onChange={(e) => {
                        const updated = [...usedMaterials]
                        updated[idx] = { ...updated[idx], name: e.target.value }
                        setUsedMaterials(updated)
                      }} className="flex-1 h-8 text-xs" />
                      <Input type="number" min={0} value={m.quantity} onChange={(e) => {
                        const updated = [...usedMaterials]
                        updated[idx] = { ...updated[idx], quantity: Number(e.target.value) }
                        setUsedMaterials(updated)
                      }} className="w-16 h-8 text-xs" />
                      <Select value={m.unit} onValueChange={(v) => {
                        const updated = [...usedMaterials]
                        updated[idx] = { ...updated[idx], unit: v }
                        setUsedMaterials(updated)
                      }}>
                        <SelectTrigger className="w-16 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pcs">pcs</SelectItem>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="m">m</SelectItem>
                          <SelectItem value="l">l</SelectItem>
                          <SelectItem value="set">set</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input type="number" min={0} step={0.01} placeholder="Cost" value={m.cost || ''} onChange={(e) => {
                        const updated = [...usedMaterials]
                        updated[idx] = { ...updated[idx], cost: Number(e.target.value) }
                        setUsedMaterials(updated)
                      }} className="w-20 h-8 text-xs" />
                      {usedMaterials.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setUsedMaterials(usedMaterials.filter((_, i) => i !== idx))}>
                          <CircleX className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="space-y-2">
              <Label>Service Notes (optional)</Label>
              <Textarea
                placeholder="Additional service notes..."
                value={serviceNotes}
                onChange={(e) => setServiceNotes(e.target.value)}
                rows={2}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={!completionNotes.trim() || labourHours <= 0 || completeMutation.isPending}
                onClick={() => {
                  if (!completeTicket) return
                  const woId = completeTicket.workOrderId || completeTicket.workOrder?.id
                  if (woId) {
                    completeMutation.mutate({
                      woId,
                      body: {
                        completionNotes,
                        labourHours,
                        usedMaterials: usedMaterials.filter(m => m.name.trim()),
                        serviceNotes: serviceNotes.trim() || undefined,
                      },
                    })
                  }
                }}
              >
                {completeMutation.isPending ? 'Completing...' : 'Complete Work'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── ওয়ার্ক অর্ডার উপাদান অনুরোধ ডায়ালগ ─── */}
      <Dialog open={woMaterialDialogOpen} onOpenChange={setWoMaterialDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Materials</DialogTitle>
            <DialogDescription>Request materials for {woMaterialTicket?.ticketNo}: {woMaterialTicket?.subject}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Items</Label>
                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setWoMaterialItems([...woMaterialItems, { name: '', quantity: 1, unit: 'pcs', estimatedCost: 0 }])}>
                  <Plus className="h-3 w-3" /> Add Item
                </Button>
              </div>
              <ScrollArea className="max-h-48">
                <div className="space-y-2">
                  {woMaterialItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input placeholder="Item name" value={item.name} onChange={(e) => {
                        const updated = [...woMaterialItems]
                        updated[idx] = { ...updated[idx], name: e.target.value }
                        setWoMaterialItems(updated)
                      }} className="flex-1 h-8 text-xs" />
                      <Input type="number" min={1} value={item.quantity} onChange={(e) => {
                        const updated = [...woMaterialItems]
                        updated[idx] = { ...updated[idx], quantity: Number(e.target.value) }
                        setWoMaterialItems(updated)
                      }} className="w-16 h-8 text-xs" />
                      <Select value={item.unit} onValueChange={(v) => {
                        const updated = [...woMaterialItems]
                        updated[idx] = { ...updated[idx], unit: v }
                        setWoMaterialItems(updated)
                      }}>
                        <SelectTrigger className="w-20 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pcs">pcs</SelectItem>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="m">m</SelectItem>
                          <SelectItem value="l">l</SelectItem>
                          <SelectItem value="box">box</SelectItem>
                          <SelectItem value="set">set</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input type="number" min={0} step={0.01} placeholder="Est. cost" value={item.estimatedCost || ''} onChange={(e) => {
                        const updated = [...woMaterialItems]
                        updated[idx] = { ...updated[idx], estimatedCost: Number(e.target.value) }
                        setWoMaterialItems(updated)
                      }} className="w-24 h-8 text-xs" />
                      {woMaterialItems.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setWoMaterialItems(woMaterialItems.filter((_, i) => i !== idx))}>
                          <CircleX className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="space-y-2">
              <Label>Note (optional)</Label>
              <Textarea placeholder="Additional notes..." value={woMaterialNote} onChange={(e) => setWoMaterialNote(e.target.value)} rows={2} />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button
                className="bg-rose-600 hover:bg-rose-700"
                disabled={!woMaterialTicket || woMaterialItems.every(it => !it.name.trim()) || requestWOMaterialsMutation.isPending}
                onClick={() => {
                  if (!woMaterialTicket) return
                  const woId = woMaterialTicket.workOrderId || woMaterialTicket.workOrder?.id
                  if (woId) {
                    requestWOMaterialsMutation.mutate({
                      woId,
                      body: {
                        items: woMaterialItems.filter(it => it.name.trim()).map(it => ({ ...it, estimatedCost: it.estimatedCost || undefined })),
                        note: woMaterialNote.trim() || undefined,
                      },
                    })
                  }
                }}
              >
                {requestWOMaterialsMutation.isPending ? 'Submitting...' : 'Submit Request'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── কাজের কার্ড সাব-উপাদান ───
function JobCard({
  ticket,
  expanded,
  onToggle,
  onAction,
  onMaterial,
  updating,
}: {
  ticket: TechTicket
  expanded: boolean
  onToggle: () => void
  onAction: (ticket: TechTicket, action: string) => void
  onMaterial: (ticket: TechTicket) => void
  updating: boolean
}) {
  const pri = priorityConfig[ticket.priority] || priorityConfig.medium
  const stat = ticketStatusConfig[ticket.status] || ticketStatusConfig.assigned

  return (
    <Card className={cn('overflow-hidden transition-colors', ticket.isOverdue && 'border-orange-300 dark:border-orange-800')}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono font-medium">{ticket.ticketNo}</span>
              <Badge variant="secondary" className={cn('gap-1 text-[10px] px-1.5 py-0', pri.color)}>
                <span className={cn('h-1.5 w-1.5 rounded-full', pri.dotColor)} />
                {pri.label}
              </Badge>
              <Badge variant="secondary" className={cn('text-[10px] px-1.5 py-0', stat.color)}>
                {stat.label}
              </Badge>
              {ticket.isOverdue && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 gap-0.5">
                  <AlertTriangle className="h-3 w-3" /> OVERDUE
                </Badge>
              )}
            </div>
            <p className="font-semibold text-sm mb-1">{ticket.subject}</p>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" /> {ticket.customer?.name || 'Unknown'}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {ticket.site?.name || 'Unknown'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> SLA: {ticket.slaDeadline ? new Date(ticket.slaDeadline).toLocaleString() : '—'}
              </span>
              <span>{formatTimeAgo(ticket.createdAt)}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
            {/* ─── স্ট্যাটাস: বরাদ্দকৃত ─── */}
            {ticket.status === 'assigned' && (
              <>
                <Button size="sm" className="h-7 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700" disabled={updating} onClick={(e) => { e.stopPropagation(); onAction(ticket, 'accept') }}>
                  <CheckCircle2 className="h-3 w-3" /> Accept Job
                </Button>
                <Button size="sm" variant="outline" className="h-7 gap-1 text-xs text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30" disabled={updating} onClick={(e) => { e.stopPropagation(); onAction(ticket, 'reject') }}>
                  <Ban className="h-3 w-3" /> Reject
                </Button>
              </>
            )}

            {/* ─── স্ট্যাটাস: গৃহীত ─── */}
            {ticket.status === 'accepted' && (
              <Button size="sm" className="h-7 gap-1 text-xs bg-rose-600 hover:bg-rose-700" disabled={updating} onClick={(e) => { e.stopPropagation(); onAction(ticket, 'start') }}>
                <Play className="h-3 w-3" /> Start Work
              </Button>
            )}

            {/* ─── স্ট্যাটাস: চলমান ─── */}
            {ticket.status === 'in_progress' && (
              <>
                <Button size="sm" className="h-7 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700" disabled={updating} onClick={(e) => { e.stopPropagation(); onAction(ticket, 'complete') }}>
                  <ClipboardCheck className="h-3 w-3" /> Complete Work
                </Button>
                <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" disabled={updating} onClick={(e) => { e.stopPropagation(); onAction(ticket, 'request_materials') }}>
                  <Package className="h-3 w-3" /> Request Materials
                </Button>
                <Button size="sm" variant="outline" className="h-7 gap-1 text-xs bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/30 dark:border-amber-800" disabled={updating} onClick={(e) => { e.stopPropagation(); onAction(ticket, 'pause') }}>
                  <Pause className="h-3 w-3" /> Pause
                </Button>
              </>
            )}

            {/* ─── স্ট্যাটাস: যন্ত্রাংশের অপেক্ষমান ─── */}
            {ticket.status === 'pending_parts' && (
              <Button size="sm" className="h-7 gap-1 text-xs bg-rose-600 hover:bg-rose-700" disabled={updating} onClick={(e) => { e.stopPropagation(); onAction(ticket, 'start') }}>
                <RotateCcw className="h-3 w-3" /> Resume
              </Button>
            )}

            {/* ─── স্ট্যাটাস: গ্রাহকের অপেক্ষমান ─── */}
            {ticket.status === 'pending_customer' && (
              <div className="flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400">
                <Hourglass className="h-3.5 w-3.5" />
                <span>Waiting for Customer Approval</span>
              </div>
            )}

            {/* ─── স্ট্যাটাস: সম্পন্ন ─── */}
            {ticket.status === 'completed' && (
              <div className="space-y-1.5 sm:items-end">
                {ticket.completionNotes && (
                  <p className="text-xs text-muted-foreground max-w-[200px] truncate">{ticket.completionNotes}</p>
                )}
                {ticket.totalCost != null && ticket.totalCost > 0 && (
                  <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <DollarSign className="h-3 w-3" /> {ticket.totalCost.toLocaleString()}
                  </div>
                )}
                {ticket.customerRating != null && ticket.customerRating > 0 && (
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    <span className="font-medium">{ticket.customerRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {expanded && (
          <>
            <Separator className="my-3" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Details</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium capitalize">{ticket.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Work Order:</span>
                    <span className="font-mono text-xs font-medium">{ticket.workOrder?.woNo || '—'}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Location</h4>
                <p className="text-xs">{ticket.site?.address || ticket.site?.name || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Timeline</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                  </div>
                  {ticket.slaDeadline && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SLA:</span>
                      <span className={ticket.isOverdue ? 'text-red-600 font-medium' : ''}>
                        {new Date(ticket.slaDeadline).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        <button
          className="w-full mt-2 text-[10px] text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 transition-colors"
          onClick={onToggle}
        >
          {expanded ? 'Show Less' : 'Show More'}
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </CardContent>
    </Card>
  )
}

// ─── উপাদান অনুরোধ ফর্ম ───
function MaterialRequestForm({
  ticketId,
  ticketNo,
  onSubmit,
  loading,
}: {
  ticketId: string
  ticketNo: string
  onSubmit: (data: any) => void
  loading: boolean
}) {
  const [items, setItems] = useState([
    { name: '', quantity: 1, unit: 'pcs' },
  ])

  const addItem = () => {
    setItems([...items, { name: '', quantity: 1, unit: 'pcs' }])
  }

  const removeItem = (idx: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== idx))
  }

  const updateItem = (idx: number, field: string, value: any) => {
    setItems(items.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticketId) return
    const validItems = items.filter(it => it.name.trim())
    if (validItems.length === 0) return
    onSubmit({
      ticketId,
      ticketNo,
      items: validItems.map(it => ({ name: it.name, quantity: Number(it.quantity), unit: it.unit, requestedQty: Number(it.quantity) })),
    })
    setItems([{ name: '', quantity: 1, unit: 'pcs' }])
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Items</Label>
          <Button type="button" variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={addItem}>
            <Plus className="h-3 w-3" /> Add Item
          </Button>
        </div>
        <ScrollArea className="max-h-48">
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  placeholder="Item name"
                  value={item.name}
                  onChange={(e) => updateItem(idx, 'name', e.target.value)}
                  className="flex-1 h-8 text-xs"
                />
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                  className="w-16 h-8 text-xs"
                />
                <Select value={item.unit} onValueChange={(v) => updateItem(idx, 'unit', v)}>
                  <SelectTrigger className="w-20 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pcs">pcs</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="m">m</SelectItem>
                    <SelectItem value="l">l</SelectItem>
                    <SelectItem value="box">box</SelectItem>
                    <SelectItem value="set">set</SelectItem>
                  </SelectContent>
                </Select>
                {items.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => removeItem(idx)}>
                    <CircleX className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button
          type="submit"
          className="bg-rose-600 hover:bg-rose-700"
          disabled={loading || !ticketId || items.every(it => !it.name.trim())}
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </Button>
      </DialogFooter>
    </form>
  )
}