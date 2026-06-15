'use client'

import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  ArrowLeft, Search, ChevronDown, ChevronUp, Ticket, CheckCircle2,
  Clock, Star, Link as LinkIcon, AlertTriangle, Wrench, FileText,
  ClipboardCheck, FileQuestion, ShieldCheck, MessageSquarePlus,
  CalendarClock, Download, TrendingUp, TrendingDown, Minus,
  User, Phone, MapPin, Camera, Video, Timer,
} from 'lucide-react'
import { EmptyTickets } from '@/components/common/empty-states'

// ─── ভাগ করা ধ্রুবক ───
const PRIORITY_CONFIG: Record<string, { label: string; color: string; dotColor: string }> = {
  emergency: { label: 'Emergency', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', dotColor: 'bg-red-500' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300', dotColor: 'bg-orange-500' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300', dotColor: 'bg-yellow-500' },
  low: { label: 'Low', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', dotColor: 'bg-green-500' },
  preventive: { label: 'Preventive', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', dotColor: 'bg-blue-500' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string; step: number }> = {
  new: { label: 'New', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', step: 0 },
  under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', step: 1 },
  assigned: { label: 'Assigned', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300', step: 2 },
  accepted: { label: 'Accepted', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300', step: 3 },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300', step: 4 },
  pending_parts: { label: 'Pending Parts', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300', step: 5 },
  pending_customer: { label: 'Pending Customer', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300', step: 6 },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300', step: 7 },
  customer_verification: { label: 'Customer Verification', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300', step: 8 },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400', step: 9 },
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

const QUICK_ACTIONS = [
  { type: 'complaint', label: 'Report Complaint', icon: MessageSquarePlus, color: 'text-rose-600 bg-rose-50 hover:bg-rose-100 border-rose-200 dark:bg-rose-950 dark:border-rose-800 dark:hover:bg-rose-900' },
  { type: 'work_request', label: 'Request Service', icon: Wrench, color: 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200 dark:bg-blue-950 dark:border-blue-800 dark:hover:bg-blue-900' },
  { type: 'emergency', label: 'Emergency!', icon: AlertTriangle, color: 'text-red-600 bg-red-50 hover:bg-red-100 border-red-200 dark:bg-red-950 dark:border-red-800 dark:hover:bg-red-900' },
  { type: 'inspection', label: 'Request Inspection', icon: ClipboardCheck, color: 'text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-200 dark:bg-purple-950 dark:border-purple-800 dark:hover:bg-purple-900' },
  { type: 'quotation', label: 'Request Quotation', icon: FileQuestion, color: 'text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-200 dark:bg-amber-950 dark:border-amber-800 dark:hover:bg-amber-900' },
  { type: 'preventive_maintenance', label: 'Preventive Maintenance', icon: ShieldCheck, color: 'text-cyan-600 bg-cyan-50 hover:bg-cyan-100 border-cyan-200 dark:bg-cyan-950 dark:border-cyan-800 dark:hover:bg-cyan-900' },
]

// ─── SLA কাউন্টডাউন কম্পোনেন্ট ───
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
        setRemaining(`${days}d ${hours % 24}h`)
      } else {
        setRemaining(`${hours}h ${mins}m`)
      }
    }
    calc()
    const interval = setInterval(calc, 60000)
    return () => clearInterval(interval)
  }, [deadline])

  const isBreached = remaining === 'BREACHED'

  return (
    <span className={cn(
      'text-xs font-mono font-medium',
      isBreached ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
    )}>
      {isBreached && '⚠ '}{remaining}
    </span>
  )
}

// ─── ওয়ার্কফ্লো স্টেপার ───
function WorkflowStepper({ status }: { status: string }) {
  const currentStep = STATUS_CONFIG[status]?.step ?? -1

  return (
    <div>
      <div className="flex items-center gap-0.5">
        {STATUS_WORKFLOW.map((step, idx) => {
          const isActive = currentStep >= idx
          const isCurrent = currentStep === idx
          return (
            <React.Fragment key={step}>
              <div
                className={cn(
                  'h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-colors shrink-0',
                  isActive
                    ? isCurrent
                      ? 'bg-emerald-500 text-white ring-2 ring-emerald-200 dark:ring-emerald-800'
                      : 'bg-emerald-500 text-white'
                    : 'bg-muted text-muted-foreground'
                )}
                title={STATUS_CONFIG[step]?.label}
              >
                {isActive ? <CheckCircle2 className="h-3 w-3" /> : idx + 1}
              </div>
              {idx < STATUS_WORKFLOW.length - 1 && (
                <div className={cn('flex-1 h-0.5 min-w-[6px]', isActive ? 'bg-emerald-500' : 'bg-muted')} />
              )}
            </React.Fragment>
          )
        })}
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {STATUS_WORKFLOW.map((step, idx) => (
          <span
            key={step}
            className={cn(
              'text-[9px] px-1.5 py-0.5 rounded',
              currentStep === idx
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 font-semibold'
                : 'text-muted-foreground'
            )}
          >
            {STATUS_CONFIG[step]?.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── পরিসংখ্যান কার্ড স্কেলিটন ───
function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-16 mt-2" />
        <Skeleton className="h-3 w-20 mt-1" />
      </CardContent>
    </Card>
  )
}

// ─── প্রধান কম্পোনেন্ট ───
export function ClientServiceRequests() {
  const { navigate, user } = useAppStore()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const customerId = user?.customerId || user?.id

  // ফিল্টার
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [prefillType, setPrefillType] = useState('')

  // এই গ্রাহকের জন্য টিকেট আনা হচ্ছে
  const { data, isLoading } = useQuery({
    queryKey: ['client-service-tickets', customerId, statusFilter, priorityFilter, categoryFilter, typeFilter],
    queryFn: () => {
      const params = new URLSearchParams()
      if (customerId) params.set('customerId', customerId)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (priorityFilter !== 'all') params.set('priority', priorityFilter)
      if (categoryFilter !== 'all') params.set('category', categoryFilter)
      if (typeFilter !== 'all') params.set('type', typeFilter)
      const qs = params.toString()
      return api.get(`/api/maintenance/tickets${qs ? `?${qs}` : ''}`)
    },
    enabled: !!customerId,
  })

  const tickets = (data?.data || []) as any[]

  // গ্রাহক সাইট আনা হচ্ছে
  const { data: sitesData } = useQuery({
    queryKey: ['client-maintenance-sites', customerId],
    queryFn: () => {
      const params = new URLSearchParams()
      if (customerId) params.set('customerId', customerId)
      return api.get(`/api/maintenance/sites${params.toString() ? `?${params.toString()}` : ''}`)
    },
    enabled: !!customerId,
  })
  const sites = (sitesData?.data || []) as any[]

  // এই গ্রাহকের জন্য PM সময়সূচি আনা হচ্ছে
  const { data: pmData } = useQuery({
    queryKey: ['client-pm-schedules', customerId],
    queryFn: () => {
      const params = new URLSearchParams()
      if (customerId) params.set('customerId', customerId)
      return api.get(`/api/maintenance/pm-schedules${params.toString() ? `?${params.toString()}` : ''}`)
    },
    enabled: !!customerId,
  })
  const pmSchedules = (pmData?.data || []) as any[]

  // তৈরি মিউটেশন
  const createMutation = useMutation({
    mutationFn: (body: any) => api.post('/api/maintenance/tickets', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-service-tickets'] })
      setCreateOpen(false)
      setPrefillType('')
      toast({ title: 'Request Submitted', description: 'Your service request has been created successfully.' })
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.error || 'Failed to submit request', variant: 'destructive' })
    },
  })

  // অনুমোদন/প্রত্যাখ্যান মিউটেশন
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => api.put(`/api/maintenance/tickets/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-service-tickets'] })
      queryClient.invalidateQueries({ queryKey: ['client-ticket-timeline'] })
      toast({ title: 'Updated', description: 'Ticket status has been updated.' })
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.error || 'Failed to update', variant: 'destructive' })
    },
  })

  // দ্রুত কার্য হ্যান্ডলার
  const handleQuickAction = (type: string) => {
    setPrefillType(type)
    setCreateOpen(true)
  }

  // ক্লায়েন্ট-সাইড অনুসন্ধান
  const filtered = tickets.filter((t: any) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        t.subject?.toLowerCase().includes(q) ||
        t.ticketNo?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      )
    }
    return true
  })

  // ট্যাব ফিল্টারিং
  const getTabTickets = (tab: string) => {
    switch (tab) {
      case 'open': return filtered.filter((t: any) => ['new', 'under_review', 'assigned', 'accepted'].includes(t.status))
      case 'in_progress': return filtered.filter((t: any) => ['in_progress', 'pending_parts'].includes(t.status))
      case 'pending_approval': return filtered.filter((t: any) => ['pending_customer', 'customer_verification'].includes(t.status))
      case 'completed': return filtered.filter((t: any) => ['completed', 'closed'].includes(t.status))
      default: return filtered
    }
  }

  const displayTickets = getTabTickets(activeTab)

  // ড্যাশবোর্ড পরিসংখ্যান
  const openCount = tickets.filter((t: any) => ['new', 'under_review', 'assigned', 'accepted'].includes(t.status)).length
  const pendingApprovalCount = tickets.filter((t: any) => ['pending_customer', 'customer_verification'].includes(t.status)).length
  const inProgressCount = tickets.filter((t: any) => ['in_progress', 'pending_parts'].includes(t.status)).length
  const now = new Date()
  const thisMonth = tickets.filter((t: any) => {
    const d = new Date(t.createdAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && ['completed', 'closed'].includes(t.status)
  }).length
  const emergencyCount = tickets.filter((t: any) => t.priority === 'emergency' && !['completed', 'closed'].includes(t.status)).length

  // গড় প্রতিক্রিয়া সময় (নতুন থেকে বরাদ্দ পর্যন্ত)
  const avgResponseCalc = (() => {
    const responded = tickets.filter((t: any) => t.createdAt && (t.assignedAt || t.updatedAt))
    if (responded.length === 0) return null
    let totalHours = 0
    let count = 0
    for (const t of responded) {
      const start = new Date(t.createdAt).getTime()
      const end = new Date(t.assignedAt || t.updatedAt).getTime()
      const diff = (end - start) / 3600000
      if (diff > 0 && diff < 720) { // ignore unreasonable values
        totalHours += diff
        count++
      }
    }
    return count > 0 ? totalHours / count : null
  })()

  const stats = [
    { label: 'Open Requests', value: openCount, icon: Ticket, trend: 'active', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
    { label: 'Pending My Approval', value: pendingApprovalCount, icon: ClipboardCheck, trend: pendingApprovalCount > 0 ? 'up' : 'neutral', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950' },
    { label: 'In Progress', value: inProgressCount, icon: Wrench, trend: 'neutral', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950' },
    { label: 'Completed This Month', value: thisMonth, icon: CheckCircle2, trend: thisMonth > 0 ? 'up' : 'neutral', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950' },
    { label: 'Emergency Requests', value: emergencyCount, icon: AlertTriangle, trend: emergencyCount > 0 ? 'up' : 'neutral', color: 'text-red-600 bg-red-50 dark:bg-red-950' },
    { label: 'Avg Response Time', value: avgResponseCalc ? `${Math.round(avgResponseCalc)}h` : '—', icon: Clock, trend: 'neutral', color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950' },
  ]

  // সেবা ইতিহাসের জন্য সম্পন্ন টিকেট
  const completedTickets = tickets
    .filter((t: any) => ['completed', 'closed'].includes(t.status))
    .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  // সক্রিয় PM সময়সূচি
  const activePMs = pmSchedules.filter((pm: any) => pm.status === 'active')

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button size="icon" variant="ghost" onClick={() => navigate('client-dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Service Requests</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Submit and track maintenance service requests</p>
          </div>
        </div>
        <Button
          className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
          onClick={() => { setPrefillType(''); setCreateOpen(true) }}
        >
          <MessageSquarePlus className="h-3.5 w-3.5" /> New Request
        </Button>
      </div>

      {/* ─── Dashboard Stats ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
          : stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
                    <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', stat.color)}>
                      <stat.icon className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {stat.trend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                    {stat.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                    {stat.trend === 'neutral' && <Minus className="h-3 w-3 text-muted-foreground" />}
                    <span className="text-[10px] text-muted-foreground">
                      {stat.trend === 'up' ? 'Active' : stat.trend === 'neutral' ? 'Stable' : 'Declining'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
        }
      </div>

      {/* ─── Quick Submit Buttons ─── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Quick Submit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {QUICK_ACTIONS.map((action) => (
              <Button
                key={action.type}
                variant="outline"
                className={cn('h-auto py-3 flex flex-col items-center gap-1.5 text-xs border', action.color)}
                onClick={() => handleQuickAction(action.type)}
              >
                <action.icon className="h-5 w-5" />
                {action.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── Tabs: My Requests / Service History / Upcoming Visits ─── */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setExpandedId(null) }}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="pending_approval">Pending My Approval</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="history">Service History</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Visits</TabsTrigger>
        </TabsList>

        {/* সকল / খোলা / চলমান / অপেক্ষমান / সম্পন্ন ট্যাব */}
        {['all', 'open', 'in_progress', 'pending_approval', 'completed'].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4 mt-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by ticket #, subject, or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                          <SelectItem key={key} value={key}>{val.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        {Object.entries(PRIORITY_CONFIG).map(([key, val]) => (
                          <SelectItem key={key} value={key}>
                            <span className="flex items-center gap-1.5">
                              <span className={cn('h-2 w-2 rounded-full', val.dotColor)} />
                              {val.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {Object.entries(TYPE_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tickets Table */}
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6 space-y-3">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}
                  </div>
                ) : displayTickets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Ticket className="h-10 w-10 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No requests found</p>
                    <Button size="sm" variant="outline" className="mt-3 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => { setPrefillType(''); setCreateOpen(true) }}>
                      <MessageSquarePlus className="h-3.5 w-3.5" /> Submit a Request
                    </Button>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="sticky top-0 bg-background z-10">
                          <TableHead className="w-8"></TableHead>
                          <TableHead className="text-xs">Ticket #</TableHead>
                          <TableHead className="text-xs">Subject</TableHead>
                          <TableHead className="text-xs hidden sm:table-cell">Category</TableHead>
                          <TableHead className="text-xs">Priority</TableHead>
                          <TableHead className="text-xs">Status</TableHead>
                          <TableHead className="text-xs hidden md:table-cell">Assigned To</TableHead>
                          <TableHead className="text-xs hidden lg:table-cell">Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayTickets.map((ticket: any) => {
                          const pri = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.medium
                          const stat = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.new
                          const isExpanded = expandedId === ticket.id
                          return (
                            <React.Fragment key={ticket.id}>
                              <TableRow
                                className="cursor-pointer hover:bg-muted/40"
                                onClick={() => setExpandedId(prev => prev === ticket.id ? null : ticket.id)}
                              >
                                <TableCell className="py-3">
                                  {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                </TableCell>
                                <TableCell className="text-xs font-mono text-emerald-600 font-medium">{ticket.ticketNo}</TableCell>
                                <TableCell>
                                  <div>
                                    <p className="text-sm font-medium">{ticket.subject}</p>
                                    <p className="text-xs text-muted-foreground truncate max-w-[180px]">{ticket.description}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">
                                  <Badge variant="secondary" className="text-xs">
                                    {CATEGORY_LABELS[ticket.category] || ticket.category}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className={cn('gap-1 text-xs', pri.color)}>
                                    <span className={cn('h-1.5 w-1.5 rounded-full', pri.dotColor)} />
                                    {pri.label}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className={cn('text-xs', stat.color)}>
                                    {stat.label}
                                  </Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                                  {ticket.technician?.employee?.name || '—'}
                                </TableCell>
                                <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                                  {new Date(ticket.createdAt).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                              {isExpanded && (
                                <TableRow>
                                  <TableCell colSpan={8} className="bg-muted/20 px-6 py-4">
                                    <TicketDetailExpanded
                                      ticket={ticket}
                                      onApprove={() => updateMutation.mutate({ id: ticket.id, body: { status: 'completed', action: 'approve' } })}
                                      onReject={() => updateMutation.mutate({ id: ticket.id, body: { status: 'in_progress', action: 'reject', customerFeedback: 'Rejected by customer, needs rework' } })}
                                      isUpdating={updateMutation.isPending}
                                    />
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
        ))}

        {/* Service History Tab */}
        <TabsContent value="history" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Recently Completed</CardTitle>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast({ title: 'Coming Soon', description: 'Service report download will be available soon.' })}>
                  <Download className="h-3.5 w-3.5" /> Download Report
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
                </div>
              ) : completedTickets.length === 0 ? (
                <EmptyTickets />
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="sticky top-0 bg-background z-10">
                        <TableHead className="text-xs">Ticket #</TableHead>
                        <TableHead className="text-xs">Subject</TableHead>
                        <TableHead className="text-xs hidden sm:table-cell">Category</TableHead>
                        <TableHead className="text-xs">Type</TableHead>
                        <TableHead className="text-xs hidden md:table-cell">Completed</TableHead>
                        <TableHead className="text-xs hidden md:table-cell">Rating</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedTickets.map((ticket: any) => (
                        <TableRow key={ticket.id}>
                          <TableCell className="text-xs font-mono text-emerald-600 font-medium">{ticket.ticketNo}</TableCell>
                          <TableCell className="text-sm font-medium">{ticket.subject}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant="secondary" className="text-xs">
                              {CATEGORY_LABELS[ticket.category] || ticket.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={cn('text-[10px]', TYPE_BADGE_COLORS[ticket.type] || '')}>
                              {TYPE_LABELS[ticket.type] || ticket.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                            {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleDateString() : '—'}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {ticket.rating ? (
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={cn('h-3 w-3', i < ticket.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground')} />
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upcoming Visits Tab */}
        <TabsContent value="upcoming" className="space-y-4 mt-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-lg" />)}
            </div>
          ) : activePMs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <CalendarClock className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No upcoming preventive maintenance visits</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activePMs.map((pm: any) => {
                const nextVisit = pm.nextVisitDate ? new Date(pm.nextVisitDate) : null
                const isOverdue = nextVisit && nextVisit < new Date()
                const daysUntil = nextVisit ? Math.ceil((nextVisit.getTime() - Date.now()) / 86400000) : null
                return (
                  <Card key={pm.id} className={cn('border', isOverdue ? 'border-red-200 dark:border-red-800' : 'border-emerald-200 dark:border-emerald-800')}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs font-mono">{pm.pmNo}</Badge>
                        <Badge variant={isOverdue ? 'destructive' : 'secondary'} className={cn('text-xs', !isOverdue && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300')}>
                          {isOverdue ? 'Overdue' : daysUntil !== null && daysUntil <= 3 ? 'Due Soon' : 'Upcoming'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{pm.description || 'Preventive Maintenance'}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{pm.site?.name || 'No site'}</p>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Frequency</span>
                          <p className="font-medium capitalize">{pm.frequency?.replace('_', ' ') || '—'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Next Visit</span>
                          <p className={cn('font-medium', isOverdue ? 'text-red-600' : 'text-emerald-600')}>
                            {nextVisit ? nextVisit.toLocaleDateString() : '—'}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Technician</span>
                          <p className="font-medium">{pm.technician?.employee?.name || '—'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Progress</span>
                          <p className="font-medium">{pm.completedVisits || 0} / {pm.totalVisits || '—'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ─── Create Request Dialog ─── */}
      <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) setPrefillType('') }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submit Service Request</DialogTitle>
          </DialogHeader>
          <CreateRequestForm
            key={prefillType || 'default'}
            sites={sites}
            prefillType={prefillType}
            customerId={customerId}
            onSubmit={(data) => createMutation.mutate(data)}
            loading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── প্রসারিত টিকেট বিবরণ ───
function TicketDetailExpanded({
  ticket,
  onApprove,
  onReject,
  isUpdating,
}: {
  ticket: any
  onApprove: () => void
  onReject: () => void
  isUpdating: boolean
}) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [rating, setRating] = useState(ticket.rating || 0)
  const [feedback, setFeedback] = useState(ticket.customerFeedback || '')
  const [showRating, setShowRating] = useState(false)

  // টাইমলাইন আনা হচ্ছে
  const { data: timelineData } = useQuery({
    queryKey: ['client-ticket-timeline', ticket.id],
    queryFn: () => api.get(`/api/maintenance/tickets/${ticket.id}/timeline`),
    enabled: !!ticket.id,
  })
  const timeline = (timelineData?.data || []) as any[]

  // রেটিং মিউটেশন
  const ratingMutation = useMutation({
    mutationFn: (body: any) => api.put(`/api/maintenance/tickets/${ticket.id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-service-tickets'] })
      queryClient.invalidateQueries({ queryKey: ['client-ticket-timeline'] })
      setShowRating(false)
      toast({ title: 'Thank you!', description: 'Your feedback has been submitted.' })
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.error || 'Failed to submit feedback', variant: 'destructive' })
    },
  })

  const handleSubmitRating = () => {
    ratingMutation.mutate({
      rating,
      customerFeedback: feedback || undefined,
    })
  }

  const isPendingCustomer = ticket.status === 'pending_customer' || ticket.status === 'customer_verification'
  const isCompleted = ticket.status === 'completed' || ticket.status === 'closed'

  return (
    <div className="space-y-4">
      {/* Workflow Stepper */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Status Progress</h4>
        <WorkflowStepper status={ticket.status} />
      </div>

      <Separator />

      {/* SLA */}
      {ticket.slaDeadline && (
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-amber-500" />
          <span className="text-xs text-muted-foreground">SLA Response Deadline:</span>
          <SLACountdown deadline={ticket.slaDeadline} />
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground text-xs">Description</span>
          <p className="mt-1">{ticket.description || 'No description'}</p>
        </div>
        <div>
          <span className="text-muted-foreground text-xs">Site / Location</span>
          <p className="mt-1 font-medium">{ticket.site?.name || '—'}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {[ticket.building, ticket.floor, ticket.room].filter(Boolean).join(' / ') || ticket.location || '—'}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground text-xs flex items-center gap-1"><User className="h-3 w-3" /> Contact Person</span>
          <p className="mt-1 font-medium">{ticket.contactPerson || '—'}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" /> {ticket.contactPhone || '—'}</p>
        </div>
        <div>
          <span className="text-muted-foreground text-xs flex items-center gap-1"><Wrench className="h-3 w-3" /> Equipment</span>
          <p className="mt-1 font-medium">{ticket.asset?.name || '—'}</p>
        </div>
        <div>
          <span className="text-muted-foreground text-xs flex items-center gap-1"><CalendarClock className="h-3 w-3" /> Preferred Visit</span>
          <p className="mt-1 font-medium">
            {ticket.preferredVisitDate
              ? `${ticket.preferredVisitDate}${ticket.preferredVisitTime ? ` at ${ticket.preferredVisitTime}` : ''}`
              : '—'}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground text-xs flex items-center gap-1"><Wrench className="h-3 w-3" /> Assigned Technician</span>
          <p className="mt-1 font-medium">{ticket.technician?.employee?.name || '—'}</p>
          {ticket.technician?.employee?.phone && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" /> {ticket.technician.employee.phone}</p>
          )}
        </div>
      </div>

      {/* Attachments */}
      {(ticket.photoUrls?.length > 0 || ticket.videoUrls?.length > 0) && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Attachments</h4>
          <div className="flex flex-wrap gap-2">
            {ticket.photoUrls?.map((url: string, i: number) => (
              <Badge key={`p${i}`} variant="outline" className="gap-1 text-xs">
                <Camera className="h-3 w-3" /> Photo {i + 1}
              </Badge>
            ))}
            {ticket.videoUrls?.map((url: string, i: number) => (
              <Badge key={`v${i}`} variant="outline" className="gap-1 text-xs">
                <Video className="h-3 w-3" /> Video {i + 1}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      {timeline.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Activity Timeline</h4>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {timeline.map((entry: any, idx: number) => {
              const actionColors: Record<string, string> = {
                created: 'bg-slate-500',
                status_change: 'bg-emerald-500',
                assigned: 'bg-blue-500',
                note: 'bg-amber-500',
                approved: 'bg-emerald-500',
                rejected: 'bg-red-500',
                rated: 'bg-purple-500',
              }
              const dotColor = actionColors[entry.action] || 'bg-gray-400'
              return (
                <div key={idx} className="flex gap-3 text-xs">
                  <div className="flex flex-col items-center">
                    <div className={cn('h-2.5 w-2.5 rounded-full mt-0.5 shrink-0', dotColor)} />
                    {idx < timeline.length - 1 && <div className="w-px flex-1 bg-muted mt-1" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{entry.action?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      <span className="text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</span>
                    </div>
                    {entry.note && <p className="text-muted-foreground mt-0.5">{entry.note}</p>}
                    {entry.newValue && <p className="text-muted-foreground mt-0.5">→ {String(entry.newValue)}</p>}
                    {entry.userName && <p className="text-muted-foreground mt-0.5">by {entry.userName}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <Separator />

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Approve / Reject */}
        {isPendingCustomer && (
          <>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={onApprove}
              disabled={isUpdating}
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
              onClick={onReject}
              disabled={isUpdating}
            >
              <XCircleIcon className="h-3.5 w-3.5 mr-1" /> Reject
            </Button>
          </>
        )}

        {/* সম্পন্ন টিকেটের রেটিং */}
        {(isCompleted && !showRating) && (
          <Button
            size="sm"
            variant="outline"
            className="border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-950"
            onClick={() => setShowRating(true)}
          >
            <Star className="h-3.5 w-3.5 mr-1" /> Rate Service
          </Button>
        )}

        {/* Download report */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => toast({ title: 'Coming Soon', description: 'Service report download will be available soon.' })}
        >
          <Download className="h-3.5 w-3.5 mr-1" /> Download Report
        </Button>
      </div>

      {/* Rating Form */}
      {showRating && (
        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 space-y-3">
          <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300">Rate This Service</h4>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-0.5 hover:scale-110 transition-transform"
              >
                <Star className={cn('h-6 w-6', star <= rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground')} />
              </button>
            ))}
            <span className="text-sm text-muted-foreground ml-2">{rating > 0 ? `${rating}/5` : 'Select rating'}</span>
          </div>
          <Textarea
            placeholder="Share your feedback about the service..."
            rows={2}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleSubmitRating}
              disabled={rating === 0 || ratingMutation.isPending}
            >
              {ratingMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowRating(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Existing rating display */}
      {ticket.rating && !showRating && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Your Rating:</span>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={cn('h-4 w-4', i < ticket.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground')} />
            ))}
          </div>
          {ticket.customerFeedback && (
            <span className="text-xs text-muted-foreground italic ml-2">&ldquo;{ticket.customerFeedback}&rdquo;</span>
          )}
        </div>
      )}
    </div>
  )
}

// ─── XCircle আইকন (lucide-এ ডিফল্ট নেই, একটি সাধারণ span ব্যবহার করুন) ───
function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  )
}

// ─── অনুরোধ তৈরি ফর্ম ───
function CreateRequestForm({
  sites,
  prefillType,
  customerId,
  onSubmit,
  loading,
}: {
  sites: any[]
  prefillType: string
  customerId: string | null | undefined
  onSubmit: (data: any) => void
  loading: boolean
}) {
  const [form, setForm] = useState({
    type: prefillType || '',
    category: '',
    priority: prefillType === 'emergency' ? 'emergency' : 'medium',
    subject: '',
    description: '',
    siteId: '',
    building: '',
    floor: '',
    room: '',
    assetId: '',
    location: '',
    preferredVisitDate: '',
    preferredVisitTime: '',
    contactPerson: '',
    contactPhone: '',
    photoUrls: '',
    videoUrls: '',
  })

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.type || !form.category || !form.subject) return

    const payload: any = {
      type: form.type,
      category: form.category,
      priority: form.priority,
      subject: form.subject,
      description: form.description,
      customerId: customerId || undefined,
      siteId: form.siteId || undefined,
      building: form.building || undefined,
      floor: form.floor || undefined,
      room: form.room || undefined,
      assetId: form.assetId || undefined,
      location: form.location || undefined,
      preferredVisitDate: form.preferredVisitDate || undefined,
      preferredVisitTime: form.preferredVisitTime || undefined,
      contactPerson: form.contactPerson || undefined,
      contactPhone: form.contactPhone || undefined,
    }

    if (form.photoUrls.trim()) {
      payload.photoUrls = form.photoUrls.split('\n').map(u => u.trim()).filter(Boolean)
    }
    if (form.videoUrls.trim()) {
      payload.videoUrls = form.videoUrls.split('\n').map(u => u.trim()).filter(Boolean)
    }

    onSubmit(payload)
    setForm({
      type: '', category: '', priority: 'medium', subject: '', description: '',
      siteId: '', building: '', floor: '', room: '', assetId: '',
      location: '', preferredVisitDate: '', preferredVisitTime: '',
      contactPerson: '', contactPhone: '', photoUrls: '', videoUrls: '',
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Row 1: Type, Category, Priority */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Request Type *</Label>
          <Select value={form.type} onValueChange={v => update('type', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Category *</Label>
          <Select value={form.category} onValueChange={v => update('category', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={form.priority} onValueChange={v => update('priority', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PRIORITY_CONFIG).map(([key, val]) => (
                <SelectItem key={key} value={key}>
                  <span className="flex items-center gap-1.5">
                    <span className={cn('h-2 w-2 rounded-full', val.dotColor)} />
                    {val.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Subject */}
      <div className="space-y-2">
        <Label>Subject *</Label>
        <Input
          placeholder="Brief description of the request"
          value={form.subject}
          onChange={e => update('subject', e.target.value)}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          placeholder="Provide detailed information about the service request..."
          rows={3}
          value={form.description}
          onChange={e => update('description', e.target.value)}
        />
      </div>

      <Separator />

      {/* Site, Building, Floor, Room */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Site</Label>
          <Select value={form.siteId} onValueChange={v => update('siteId', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select site..." />
            </SelectTrigger>
            <SelectContent>
              {sites.map((s: any) => (
                <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Building</Label>
          <Input placeholder="Building name/number" value={form.building} onChange={e => update('building', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Floor</Label>
          <Input placeholder="Floor" value={form.floor} onChange={e => update('floor', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Room</Label>
          <Input placeholder="Room number" value={form.room} onChange={e => update('room', e.target.value)} />
        </div>
      </div>

      {/* Location, Preferred Visit */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Location</Label>
          <Input placeholder="Specific location" value={form.location} onChange={e => update('location', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Preferred Visit Date</Label>
          <Input type="date" value={form.preferredVisitDate} onChange={e => update('preferredVisitDate', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Preferred Visit Time</Label>
          <Input type="time" value={form.preferredVisitTime} onChange={e => update('preferredVisitTime', e.target.value)} />
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-1"><User className="h-3 w-3" /> Contact Person</Label>
          <Input placeholder="Name of on-site contact" value={form.contactPerson} onChange={e => update('contactPerson', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-1"><Phone className="h-3 w-3" /> Contact Number</Label>
          <Input placeholder="Phone number" value={form.contactPhone} onChange={e => update('contactPhone', e.target.value)} />
        </div>
      </div>

      {/* Photo / Video URLs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-1"><Camera className="h-3 w-3" /> Photo URLs</Label>
          <Textarea
            placeholder="One URL per line..."
            rows={2}
            value={form.photoUrls}
            onChange={e => update('photoUrls', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-1"><Video className="h-3 w-3" /> Video URLs</Label>
          <Textarea
            placeholder="One URL per line..."
            rows={2}
            value={form.videoUrls}
            onChange={e => update('videoUrls', e.target.value)}
          />
        </div>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button
          type="submit"
          disabled={loading || !form.type || !form.category || !form.subject}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </Button>
      </DialogFooter>
    </form>
  )
}