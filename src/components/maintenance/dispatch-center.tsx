'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useMaintenanceSocket } from '@/hooks/use-maintenance-socket'
import { cn } from '@/lib/utils'
import {
  AlertTriangle, ArrowUpRight, ArrowDownRight, Clock, Users, Zap,
  Search, Filter, UserPlus, Calendar, MapPin, Phone, Star,
  CheckCircle2, XCircle, Play, Pause, ChevronRight, Shield,
  Timer, Send, AlertOctagon, RotateCcw, TrendingUp, Hash,
  CircleDot, Wrench, ArrowRight, CheckCheck, X as XIcon,
  Siren, Radio, ListTodo, LayoutGrid, CalendarDays, Flame,
  ShieldCheck, Eye, Wifi, WifiOff,
} from 'lucide-react'

// ─── Types ───
interface DispatchTicket {
  id: string
  ticketNo: string
  type: string
  category: string
  priority: string
  subject: string
  status: string
  createdAt: string
  slaDeadline: string
  customer: { id: string; name: string } | null
  site: { id: string; name: string; address: string } | null
  technician: { id: string; name: string; employee: { phone?: string } | null } | null
  isOverdue: boolean
  responseMinutes?: number
}

interface Technician {
  id: string
  employee: { id: string; name: string; phone?: string; email?: string } | null
  specializations: string[]
  status: string
  maxConcurrentJobs: number
  currentJobCount: number
  location: string
  rating: number
  completedJobs: number
}

interface DispatchData {
  unassignedTickets: DispatchTicket[]
  emergencyTickets: DispatchTicket[]
  overdueTickets: DispatchTicket[]
  availableTechnicians: Technician[]
  stats: {
    unassignedCount: number
    emergencyCount: number
    overdueCount: number
    availableTechnicianCount: number
    avgResponseTime: number
    todayCompleted: number
  }
}

// ─── Config ───
const priorityConfig: Record<string, { label: string; color: string; dotColor: string }> = {
  emergency: { label: 'Emergency', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', dotColor: 'bg-red-500' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300', dotColor: 'bg-orange-500' },
  medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300', dotColor: 'bg-amber-500' },
  low: { label: 'Low', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', dotColor: 'bg-green-500' },
}

const techStatusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  available: { label: 'Available', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', dot: 'bg-emerald-500' },
  busy: { label: 'Busy', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30', dot: 'bg-amber-500' },
  offline: { label: 'Offline', color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800', dot: 'bg-gray-400' },
  on_leave: { label: 'On Leave', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30', dot: 'bg-red-500' },
}

const categoryLabels: Record<string, string> = {
  corrective: 'Corrective',
  preventive: 'Preventive',
  emergency: 'Emergency',
  installation: 'Installation',
  inspection: 'Inspection',
  other: 'Other',
}

const typeLabels: Record<string, string> = {
  repair: 'Repair',
  maintenance: 'Maintenance',
  installation: 'Installation',
  inspection: 'Inspection',
  replacement: 'Replacement',
  other: 'Other',
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function getSLAStatus(ticket: DispatchTicket): { label: string; color: string; isBreach: boolean } {
  if (!ticket.slaDeadline) return { label: 'No SLA', color: 'bg-gray-100 text-gray-500', isBreach: false }
  const now = Date.now()
  const deadline = new Date(ticket.slaDeadline).getTime()
  const hoursLeft = (deadline - now) / (1000 * 60 * 60)
  if (hoursLeft < 0) return { label: 'Breached', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', isBreach: true }
  if (hoursLeft < 2) return { label: `<2h`, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300', isBreach: false }
  if (hoursLeft < 6) return { label: `<6h`, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300', isBreach: false }
  return { label: 'On Track', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300', isBreach: false }
}

// ─── SLA Countdown Timer ───
function SLACountdownTimer({ deadline }: { deadline: string }) {
  const [remaining, setRemaining] = useState('')

  useEffect(() => {
    function calc() {
      const diff = new Date(deadline).getTime() - Date.now()
      if (diff <= 0) {
        setRemaining('BREACHED')
        return
      }
      const mins = Math.floor(diff / 60000)
      if (mins < 10) setRemaining(`${mins}m`)
      else if (mins < 30) setRemaining(`${mins}m`)
      else if (mins < 60) setRemaining(`${Math.floor(mins / 60)}h ${mins % 60}m`)
      else setRemaining(`${Math.floor(mins / 60)}h`)
    }
    calc()
    const interval = setInterval(calc, 15000)
    return () => clearInterval(interval)
  }, [deadline])

  const diffMs = new Date(deadline).getTime() - Date.now()
  const isBreached = diffMs <= 0
  const minsLeft = Math.floor(diffMs / 60000)
  const isCritical = !isBreached && minsLeft < 10
  const isRed = !isBreached && minsLeft < 30
  const isAmber = !isBreached && !isRed && minsLeft < 60

  return (
    <span className={cn(
      'font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded',
      isBreached ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 animate-pulse'
        : isCritical ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
        : isRed ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
        : isAmber ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
    )}>
      {isBreached ? 'BREACHED' : remaining}
    </span>
  )
}

// ─── Response Timer ───
function ResponseTimer({ createdAt, priority }: { createdAt: string; priority: string }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = new Date(createdAt).getTime()
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [createdAt])

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  const targetMins = priority === 'emergency' ? 30 : priority === 'high' ? 60 : 120
  const isOverTarget = mins >= targetMins

  return (
    <div className="flex items-center gap-1.5">
      <Timer className={cn('h-3.5 w-3.5', isOverTarget ? 'text-red-500 animate-pulse' : 'text-muted-foreground')} />
      <span className={cn('font-mono text-xs', isOverTarget ? 'text-red-600 font-semibold' : 'text-muted-foreground')}>
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
      <span className="text-[10px] text-muted-foreground">/ {targetMins}m</span>
    </div>
  )
}

// ─── Main Component ───
export function DispatchCenter() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('queue')
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<DispatchTicket | null>(null)
  const [selectedTechId, setSelectedTechId] = useState('')
  const [techSearch, setTechSearch] = useState('')
  const [techFilter, setTechFilter] = useState('all')
  const [techLocationFilter, setTechLocationFilter] = useState('all')
  const [scheduleView, setScheduleView] = useState('week')
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set())
  const [batchAssignOpen, setBatchAssignOpen] = useState(false)
  const [isLive, setIsLive] = useState(false)

  // Real-time socket integration
  const { joinRoom, socket } = useMaintenanceSocket({
    onTicketCreated: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-dispatch'] })
      toast({ title: 'New Ticket', description: 'A new ticket has been added to the queue.' })
    }, [queryClient, toast]),
    onTicketAssigned: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-dispatch'] })
    }, [queryClient]),
    onTicketStatusChanged: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-dispatch'] })
    }, [queryClient]),
    onEmergencyAlert: useCallback((data: any) => {
      toast({
        title: '🚨 Emergency Alert',
        description: data?.message || 'A new emergency ticket has been created!',
        variant: 'destructive',
      })
      queryClient.invalidateQueries({ queryKey: ['maintenance-dispatch'] })
      setActiveTab('emergency')
    }, [queryClient, toast]),
  })

  useEffect(() => {
    joinRoom('maintenance')
  }, [joinRoom])

  useEffect(() => {
    if (socket.current) {
      const onConnect = () => setIsLive(true)
      const onDisconnect = () => setIsLive(false)
      socket.current.on('connect', onConnect)
      socket.current.on('disconnect', onDisconnect)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (socket.current.connected) setIsLive(true)
      return () => {
        socket.current?.off('connect', onConnect)
        socket.current?.off('disconnect', onDisconnect)
      }
    }
  }, [socket])

  // Fetch dispatch data
  const { data, isLoading } = useQuery({
    queryKey: ['maintenance-dispatch'],
    queryFn: () => api.get<DispatchData>('/api/maintenance/dispatch').then(r => r.data!),
    refetchInterval: 30000,
  })

  const dispatch = data as DispatchData | undefined

  // Fetch all technicians for map/schedule
  const { data: techData } = useQuery({
    queryKey: ['maintenance-technicians-all'],
    queryFn: () => api.get<Technician[]>('/api/maintenance/technicians').then(r => r.data || []),
  })

  // Fetch tickets for schedule
  const { data: allTicketsData } = useQuery({
    queryKey: ['maintenance-tickets-all'],
    queryFn: () => api.get<DispatchTicket[]>('/api/maintenance/tickets?status=assigned,in_progress').then(r => r.data || []),
  })

  const technicians = techData || []
  const allTickets = allTicketsData || []

  // Assign mutation
  const assignMutation = useMutation({
    mutationFn: ({ ticketId, technicianId }: { ticketId: string; technicianId: string }) =>
      api.post(`/api/maintenance/tickets/${ticketId}/assign`, { technicianId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-dispatch'] })
      queryClient.invalidateQueries({ queryKey: ['maintenance-tickets'] })
      queryClient.invalidateQueries({ queryKey: ['maintenance-technicians'] })
      setAssignDialogOpen(false)
      setSelectedTicket(null)
      setSelectedTechId('')
      toast({ title: 'Technician Assigned', description: 'Ticket has been assigned successfully.' })
    },
    onError: (err: any) => {
      toast({ title: 'Assignment Failed', description: err.error || 'Failed to assign technician', variant: 'destructive' })
    },
  })

  // Update ticket mutation
  const updateTicketMutation = useMutation({
    mutationFn: ({ id, ...body }: { id: string; [key: string]: any }) =>
      api.put(`/api/maintenance/tickets/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-dispatch'] })
      queryClient.invalidateQueries({ queryKey: ['maintenance-tickets'] })
      toast({ title: 'Ticket Updated', description: 'Status has been updated.' })
    },
    onError: (err: any) => {
      toast({ title: 'Update Failed', description: err.error || 'Failed to update ticket', variant: 'destructive' })
    },
  })

  // Batch assign
  const batchAssignMutation = useMutation({
    mutationFn: ({ ticketIds, technicianId }: { ticketIds: string[]; technicianId: string }) =>
      Promise.all(ticketIds.map(tid => api.post(`/api/maintenance/tickets/${tid}/assign`, { technicianId }))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-dispatch'] })
      queryClient.invalidateQueries({ queryKey: ['maintenance-tickets'] })
      setBatchAssignOpen(false)
      setSelectedTickets(new Set())
      setSelectedTechId('')
      toast({ title: 'Batch Assign Complete', description: `${selectedTickets.size} tickets assigned.` })
    },
    onError: (err: any) => {
      toast({ title: 'Batch Assign Failed', description: err.error || 'Some assignments failed', variant: 'destructive' })
    },
  })

  const handleAssign = (ticket: DispatchTicket) => {
    setSelectedTicket(ticket)
    setSelectedTechId('')
    setAssignDialogOpen(true)
  }

  const confirmAssign = () => {
    if (selectedTicket && selectedTechId) {
      assignMutation.mutate({ ticketId: selectedTicket.id, technicianId: selectedTechId })
    }
  }

  const handleBatchAssign = () => {
    if (selectedTechId && selectedTickets.size > 0) {
      batchAssignMutation.mutate({ ticketIds: Array.from(selectedTickets), technicianId: selectedTechId })
    }
  }

  const toggleTicketSelect = (id: string) => {
    setSelectedTickets(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleEscalate = (ticket: DispatchTicket) => {
    updateTicketMutation.mutate({ id: ticket.id, priority: 'emergency', status: 'escalated' })
  }

  const handleReject = (ticket: DispatchTicket) => {
    updateTicketMutation.mutate({ id: ticket.id, status: 'rejected' })
  }

  // Available technicians for assign dialog
  const availableTechs = (dispatch?.availableTechnicians || []).filter(t => {
    if (techSearch) {
      const q = techSearch.toLowerCase()
      return t.employee?.name?.toLowerCase().includes(q) || t.specializations.some(s => s.toLowerCase().includes(q))
    }
    return true
  })

  // Technician map filters
  const uniqueLocations = useMemo(() => {
    const locs = new Set(technicians.map(t => t.location).filter(Boolean))
    return Array.from(locs)
  }, [technicians])

  const filteredTechnicians = useMemo(() => {
    return technicians.filter(t => {
      if (techFilter !== 'all' && t.status !== techFilter) return false
      if (techLocationFilter !== 'all' && t.location !== techLocationFilter) return false
      return true
    })
  }, [technicians, techFilter, techLocationFilter])

  // Week days for schedule
  const weekDays = useMemo(() => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return { label: d.toLocaleDateString('en', { weekday: 'short' }), date: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }), full: d.toISOString().split('T')[0], isToday: d.toDateString() === today.toDateString() }
    })
  }, [])

  // Schedule data: map technician to day slots
  const scheduleData = useMemo(() => {
    const techMap: Record<string, Technician> = {}
    technicians.forEach(t => { techMap[t.id] = t })
    return filteredTechnicians.map(tech => {
      const slots: Record<string, DispatchTicket[]> = {}
      weekDays.forEach(day => { slots[day.full] = [] })
      allTickets
        .filter(t => t.technician?.id === tech.id)
        .forEach(t => {
          const day = t.createdAt?.split('T')[0]
          if (day && slots[day]) slots[day].push(t)
        })
      return { tech, slots }
    })
  }, [filteredTechnicians, allTickets, weekDays])

  // Loading state
  if (isLoading || !dispatch) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  const stats = dispatch.stats

  const kpis = [
    { label: 'Unassigned Tickets', value: stats.unassignedCount, icon: ListTodo, sub: 'Awaiting assignment', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800/50', trend: 'up', trendVal: '+3' },
    { label: 'Emergency Tickets', value: stats.emergencyCount, icon: Siren, sub: 'Immediate attention', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30', trend: 'up', trendVal: stats.emergencyCount > 0 ? `${stats.emergencyCount} active` : '0' },
    { label: 'Overdue Tickets', value: stats.overdueCount, icon: AlertOctagon, sub: 'SLA breached', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30', trend: 'down', trendVal: stats.overdueCount > 0 ? `${stats.overdueCount} overdue` : 'All on track' },
    { label: 'Available Technicians', value: stats.availableTechnicianCount, icon: Users, sub: `Avg response ${stats.avgResponseTime}m`, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/30', trend: 'up', trendVal: `${stats.todayCompleted} done today` },
  ]

  const allQueueTickets = [...dispatch.unassignedTickets, ...dispatch.overdueTickets]

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Radio className="h-6 w-6 text-rose-600" />
            Dispatch Center
            {isLive ? (
              <Badge className="gap-1 bg-emerald-600 text-white text-[10px] px-1.5 py-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                LIVE
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1 text-[10px] px-1.5 py-0.5 text-muted-foreground">
                <WifiOff className="h-3 w-3" /> Offline
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Coordinate tickets, assign technicians, and manage emergencies</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30"
            onClick={() => toast({ title: 'Emergency Ticket', description: 'Create dialog would open here' })}
          >
            <Flame className="h-3.5 w-3.5" /> Emergency Ticket
          </Button>
          {selectedTickets.size > 0 && (
            <Button
              size="sm"
              className="gap-1.5 bg-slate-700 hover:bg-slate-800"
              onClick={() => { setSelectedTechId(''); setBatchAssignOpen(true) }}
            >
              <UserPlus className="h-3.5 w-3.5" /> Batch Assign ({selectedTickets.size})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              if (dispatch.overdueTickets.length === 0) {
                toast({ title: 'No Overdue Tickets', description: 'All tickets are within SLA.' })
                return
              }
              dispatch.overdueTickets.forEach(t => updateTicketMutation.mutate({ id: t.id, priority: 'high' }))
            }}
          >
            <ArrowUpRight className="h-3.5 w-3.5" /> Escalate Overdue
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                  <p className={cn('text-2xl font-bold', kpi.color)}>{kpi.value}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {kpi.trend === 'up' ? (
                      <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-orange-500" />
                    )}
                    {kpi.trendVal}
                  </p>
                </div>
                <div className={cn('p-2.5 rounded-lg', kpi.bg)}>
                  <kpi.icon className={cn('h-5 w-5', kpi.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="queue" className="gap-1.5 text-xs sm:text-sm">
            <ListTodo className="h-3.5 w-3.5" /> Ticket Queue
            {stats.unassignedCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-[10px] bg-slate-700 text-white">
                {stats.unassignedCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="technicians" className="gap-1.5 text-xs sm:text-sm">
            <LayoutGrid className="h-3.5 w-3.5" /> Technicians
          </TabsTrigger>
          <TabsTrigger value="schedule" className="gap-1.5 text-xs sm:text-sm">
            <CalendarDays className="h-3.5 w-3.5" /> Schedule
          </TabsTrigger>
          <TabsTrigger value="emergency" className="gap-1.5 text-xs sm:text-sm text-red-600">
            <Siren className="h-3.5 w-3.5" /> Emergency
            {stats.emergencyCount > 0 && (
              <Badge className="ml-1 h-5 min-w-5 px-1 text-[10px] bg-red-600 text-white">
                {stats.emergencyCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Ticket Queue */}
        <TabsContent value="queue" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {allQueueTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <CheckCheck className="h-10 w-10 text-emerald-300 mb-2" />
                  <p className="text-sm text-muted-foreground">All tickets are assigned</p>
                  <p className="text-xs text-muted-foreground mt-1">No pending tickets in the queue</p>
                </div>
              ) : (
                <div className="max-h-[calc(100vh-280px)] overflow-y-auto overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8">
                          <input
                            type="checkbox"
                            checked={selectedTickets.size === allQueueTickets.length && allQueueTickets.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedTickets(new Set(allQueueTickets.map(t => t.id)))
                              else setSelectedTickets(new Set())
                            }}
                            className="rounded"
                          />
                        </TableHead>
                        <TableHead className="text-xs">Ticket#</TableHead>
                        <TableHead className="text-xs">Type</TableHead>
                        <TableHead className="text-xs">Category</TableHead>
                        <TableHead className="text-xs">Priority</TableHead>
                        <TableHead className="text-xs">Customer</TableHead>
                        <TableHead className="text-xs">Site</TableHead>
                        <TableHead className="text-xs">Created</TableHead>
                        <TableHead className="text-xs">SLA Status</TableHead>
                        <TableHead className="text-xs">SLA Timer</TableHead>
                        <TableHead className="text-xs w-36">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allQueueTickets.map((ticket) => {
                        const pri = priorityConfig[ticket.priority] || priorityConfig.medium
                        const sla = getSLAStatus(ticket)
                        const isEmergency = ticket.priority === 'emergency'
                        const isOverdue = ticket.isOverdue
                        return (
                          <TableRow
                            key={ticket.id}
                            className={cn(
                              isEmergency && 'bg-red-50/50 dark:bg-red-950/20',
                              isOverdue && !isEmergency && 'bg-orange-50/50 dark:bg-orange-950/20',
                            )}
                          >
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedTickets.has(ticket.id)}
                                onChange={() => toggleTicketSelect(ticket.id)}
                                className="rounded"
                              />
                            </TableCell>
                            <TableCell className="text-xs font-mono font-medium">{ticket.ticketNo}</TableCell>
                            <TableCell className="text-xs">{typeLabels[ticket.type] || ticket.type}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                {categoryLabels[ticket.category] || ticket.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={cn('gap-1 text-[10px] px-1.5 py-0', pri.color)}>
                                <span className={cn('h-1.5 w-1.5 rounded-full', pri.dotColor)} />
                                {pri.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs">{ticket.customer?.name || '—'}</TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">{ticket.site?.name || '—'}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{formatTimeAgo(ticket.createdAt)}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={cn('text-[10px] px-1.5 py-0', sla.color)}>
                                {sla.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {ticket.slaDeadline ? <SLACountdownTimer deadline={ticket.slaDeadline} /> : <span className="text-xs text-muted-foreground">—</span>}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => handleAssign(ticket)}>
                                  <UserPlus className="h-3 w-3" /> Assign
                                </Button>
                                {ticket.status === 'new' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 gap-1 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                    onClick={() => {
                                      updateTicketMutation.mutate({ id: ticket.id, status: 'under_review' })
                                    }}
                                    disabled={updateTicketMutation.isPending}
                                  >
                                    <ShieldCheck className="h-3 w-3" /> Approve
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
        </TabsContent>

        {/* Tab 2: Technician Map (Grid) */}
        <TabsContent value="technicians" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search technicians or specializations..."
                    value={techSearch}
                    onChange={(e) => setTechSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={techFilter} onValueChange={setTechFilter}>
                  <SelectTrigger className="sm:w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {Object.entries(techStatusConfig).map(([key, val]) => (
                      <SelectItem key={key} value={key}>{val.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={techLocationFilter} onValueChange={setTechLocationFilter}>
                  <SelectTrigger className="sm:w-44">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {uniqueLocations.map(loc => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {filteredTechnicians.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Users className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No technicians found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTechnicians.map((tech) => {
                const status = techStatusConfig[tech.status] || techStatusConfig.offline
                const isAvailable = tech.status === 'available'
                const loadPct = tech.maxConcurrentJobs > 0 ? (tech.currentJobCount / tech.maxConcurrentJobs) * 100 : 0
                return (
                  <Card key={tech.id} className={cn('relative overflow-hidden border-2 transition-colors', isAvailable ? 'border-emerald-200 dark:border-emerald-900' : 'border-transparent')}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={cn('h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm', status.bg, status.color.replace('text-', 'bg-').replace('-700', '-500').replace('-400', '-500'))}>
                            {tech.employee?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{tech.employee?.name || 'Unknown'}</p>
                            <div className="flex items-center gap-1.5">
                              <span className={cn('h-2 w-2 rounded-full', status.dot)} />
                              <span className={cn('text-[11px]', status.color)}>{status.label}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                          <span className="text-xs font-medium">{tech.rating?.toFixed(1) || '0.0'}</span>
                        </div>
                      </div>

                      {tech.specializations.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {tech.specializations.map((spec, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0 bg-slate-100 dark:bg-slate-800">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Workload</span>
                          <span className="font-medium">{tech.currentJobCount} / {tech.maxConcurrentJobs} jobs</span>
                        </div>
                        <Progress value={loadPct} className={cn('h-1.5', loadPct >= 100 ? '[&>div]:bg-red-500' : loadPct >= 75 ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500')} />
                      </div>

                      {tech.location && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                          <MapPin className="h-3 w-3" />
                          <span>{tech.location}</span>
                        </div>
                      )}

                      {tech.employee?.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                          <Phone className="h-3 w-3" />
                          <span>{tech.employee.phone}</span>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="h-7 gap-1 text-xs flex-1 bg-rose-600 hover:bg-rose-700"
                          disabled={!isAvailable}
                          onClick={() => {
                            setSelectedTicket(null)
                            setSelectedTechId(tech.id)
                            toast({ title: 'Technician Selected', description: `Select a ticket to assign to ${tech.employee?.name}` })
                          }}
                        >
                          <UserPlus className="h-3 w-3" /> Quick Assign
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          <Phone className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Schedule View */}
        <TabsContent value="schedule" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {scheduleData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <CalendarDays className="h-10 w-10 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No schedule data available</p>
                </div>
              ) : (
                <ScrollArea className="w-full">
                  <div className="min-w-[800px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs sticky left-0 bg-background z-10 min-w-[180px]">Technician</TableHead>
                          {weekDays.map(day => (
                            <TableHead key={day.full} className={cn('text-xs text-center min-w-[140px]', day.isToday && 'bg-rose-50 dark:bg-rose-950/30')}>
                              <div>{day.label}</div>
                              <div className="text-[10px] font-normal text-muted-foreground">{day.date}</div>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {scheduleData.map(({ tech, slots }) => {
                          const status = techStatusConfig[tech.status] || techStatusConfig.offline
                          return (
                            <TableRow key={tech.id}>
                              <TableCell className="sticky left-0 bg-background z-10">
                                <div className="flex items-center gap-2">
                                  <span className={cn('h-2 w-2 rounded-full', status.dot)} />
                                  <div>
                                    <p className="text-xs font-medium">{tech.employee?.name || 'Unknown'}</p>
                                    <p className="text-[10px] text-muted-foreground">{tech.currentJobCount} jobs</p>
                                  </div>
                                </div>
                              </TableCell>
                              {weekDays.map(day => {
                                const dayTickets = slots[day.full] || []
                                return (
                                  <TableCell key={day.full} className={cn('p-1 align-top', day.isToday && 'bg-rose-50/50 dark:bg-rose-950/10')}>
                                    {dayTickets.length > 0 ? (
                                      <div className="space-y-1">
                                        {dayTickets.slice(0, 2).map(t => (
                                          <div
                                            key={t.id}
                                            className="text-[10px] p-1.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                            onClick={() => handleAssign(t)}
                                          >
                                            <div className="font-medium truncate">{t.ticketNo}</div>
                                            <div className="text-muted-foreground truncate">{t.subject}</div>
                                          </div>
                                        ))}
                                        {dayTickets.length > 2 && (
                                          <p className="text-[10px] text-muted-foreground text-center">+{dayTickets.length - 2} more</p>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="h-8" />
                                    )}
                                  </TableCell>
                                )
                              })}
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Emergency Board */}
        <TabsContent value="emergency" className="mt-4">
          {dispatch.emergencyTickets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Shield className="h-10 w-10 text-emerald-300 mb-2" />
                <p className="text-sm text-muted-foreground">No active emergencies</p>
                <p className="text-xs text-muted-foreground mt-1">All clear - no emergency tickets require attention</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {dispatch.emergencyTickets.map((ticket) => (
                <Card key={ticket.id} className="border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-red-600 text-white text-xs gap-1">
                            <Siren className="h-3 w-3" /> EMERGENCY
                          </Badge>
                          <span className="text-xs font-mono font-medium">{ticket.ticketNo}</span>
                          {ticket.isOverdue && (
                            <Badge variant="secondary" className="text-[10px] bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200">
                              <AlertOctagon className="h-3 w-3 mr-0.5" /> OVERDUE
                            </Badge>
                          )}
                        </div>
                        <p className="font-semibold text-sm">{ticket.subject}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" /> {ticket.customer?.name || 'Unknown'}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {ticket.site?.name || 'Unknown'}
                          </span>
                          <span>{categoryLabels[ticket.category] || ticket.category}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <ResponseTimer createdAt={ticket.createdAt} priority={ticket.priority} />
                        <div className="flex gap-2">
                          <Button size="sm" className="h-8 gap-1 text-xs bg-rose-600 hover:bg-rose-700" onClick={() => handleAssign(ticket)}>
                            <UserPlus className="h-3 w-3" /> Assign
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 gap-1 text-xs text-amber-600 border-amber-200" onClick={() => handleEscalate(ticket)}>
                            <ArrowUpRight className="h-3 w-3" /> Escalate
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 gap-1 text-xs text-red-600 border-red-200" onClick={() => handleReject(ticket)}>
                            <XIcon className="h-3 w-3" /> Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Technician</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {selectedTicket ? `Assign ${selectedTicket.ticketNo}: ${selectedTicket.subject}` : 'Select a technician'}
            </p>
          </DialogHeader>
          <div className="space-y-4">
            {selectedTicket && (
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-medium">{selectedTicket.customer?.name || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Site:</span>
                  <span className="font-medium">{selectedTicket.site?.name || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Priority:</span>
                  <Badge variant="secondary" className={cn('text-[10px]', priorityConfig[selectedTicket.priority]?.color)}>
                    {priorityConfig[selectedTicket.priority]?.label}
                  </Badge>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Select Technician</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or specialization..."
                  value={techSearch}
                  onChange={(e) => setTechSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <ScrollArea className="max-h-60">
              <div className="space-y-1">
                {availableTechs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No available technicians</p>
                ) : (
                  availableTechs.map(tech => {
                    const status = techStatusConfig[tech.status] || techStatusConfig.offline
                    return (
                      <button
                        key={tech.id}
                        className={cn(
                          'w-full flex items-center gap-3 p-2.5 rounded-lg border text-left transition-colors text-sm',
                          selectedTechId === tech.id
                            ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30'
                            : 'border-transparent hover:bg-muted'
                        )}
                        onClick={() => setSelectedTechId(tech.id)}
                      >
                        <div className={cn('h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold', status.bg, status.color)}>
                          {tech.employee?.name?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs">{tech.employee?.name || 'Unknown'}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{tech.specializations.join(', ')}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
                            <span className="text-[10px] text-muted-foreground">{tech.currentJobCount}/{tech.maxConcurrentJobs}</span>
                          </div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              className="bg-rose-600 hover:bg-rose-700"
              onClick={confirmAssign}
              disabled={!selectedTechId || assignMutation.isPending}
            >
              {assignMutation.isPending ? 'Assigning...' : 'Assign Technician'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Assign Dialog */}
      <Dialog open={batchAssignOpen} onOpenChange={setBatchAssignOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Batch Assign Tickets</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Assign {selectedTickets.size} tickets to one technician
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Technician</Label>
              <Select value={selectedTechId} onValueChange={setSelectedTechId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a technician..." />
                </SelectTrigger>
                <SelectContent>
                  {(dispatch?.availableTechnicians || []).map(tech => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.employee?.name || 'Unknown'} ({tech.currentJobCount}/{tech.maxConcurrentJobs} jobs)
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
              className="bg-slate-700 hover:bg-slate-800"
              onClick={handleBatchAssign}
              disabled={!selectedTechId || batchAssignMutation.isPending}
            >
              {batchAssignMutation.isPending ? 'Assigning...' : `Assign ${selectedTickets.size} Tickets`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}