'use client'

import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  Radio, Clock, AlertTriangle, Phone, CheckCircle2, ArrowRight,
  MessageSquare, UserCheck,
} from 'lucide-react'

// ─── Types ───
interface UnassignedTicket {
  id: string
  ticketNo: string
  subject: string
  category: string
  priority: string
  createdAt: string
  source?: string
}

interface DispatchStats {
  unassignedCount: number
  emergencyCount: number
  availableTechnicianCount: number
  avgResponseTime?: number
  todayCompleted?: number
}

// ─── Config ───
const priorityConfig: Record<string, { label: string; color: string; dot: string }> = {
  emergency: { label: 'Emergency', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300', dot: 'bg-rose-500' },
  high: { label: 'High', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', dot: 'bg-amber-500' },
  medium: { label: 'Medium', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300', dot: 'bg-orange-500' },
  low: { label: 'Low', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', dot: 'bg-emerald-500' },
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

// ─── Skeletons ───
function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-12" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TableSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Stat Cards ───
function StatCard({
  icon: Icon,
  label,
  value,
  iconBg,
  iconColor,
  subtext,
}: {
  icon: React.ElementType
  label: string
  value: number
  iconBg: string
  iconColor: string
  subtext?: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', iconBg)}>
            <Icon className={cn('h-5 w-5', iconColor)} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground truncate">{label}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {subtext && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtext}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Component ───
export function WhatsAppDispatchPage() {
  const { navigate } = useAppStore()
  const [activeTab, setActiveTab] = useState<'unassigned' | 'emergency' | 'all_open'>('unassigned')

  // Fetch unassigned tickets
  const { data: ticketsData, isLoading: ticketsLoading } = useQuery({
    queryKey: ['wa-dispatch-tickets', activeTab],
    queryFn: () => {
      if (activeTab === 'emergency') {
        return api.get<UnassignedTicket[]>('/api/maintenance/tickets?priority=emergency&status=new,assigned,in_progress&limit=20')
      }
      if (activeTab === 'all_open') {
        return api.get<UnassignedTicket[]>('/api/maintenance/tickets?status=new,assigned,in_progress&limit=20')
      }
      return api.get<UnassignedTicket[]>('/api/maintenance/tickets?status=new&limit=20')
    },
  })

  // Fetch dispatch stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['wa-dispatch-stats'],
    queryFn: () => api.get<DispatchStats>('/api/maintenance/dispatch'),
  })

  const tickets = ticketsData?.success ? ticketsData.data ?? [] : []
  const stats = statsData?.success ? statsData.data : null

  const displayTickets = useMemo(() => {
    if (activeTab === 'emergency') {
      return tickets.filter((t: UnassignedTicket) => t.priority === 'emergency')
    }
    if (activeTab === 'all_open') {
      return tickets
    }
    return tickets
  }, [tickets, activeTab])

  const emergencyCount = useMemo(() => {
    return tickets.filter((t: UnassignedTicket) => t.priority === 'emergency').length
  }, [tickets])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/40">
            <Radio className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">WhatsApp Dispatch Center</h1>
            <p className="text-sm text-muted-foreground">Real-time complaint assignment from WhatsApp</p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={MessageSquare}
            label="Unassigned Tickets"
            value={stats?.unassignedCount ?? tickets.length}
            iconBg="bg-rose-100 dark:bg-rose-900/40"
            iconColor="text-rose-600 dark:text-rose-400"
            subtext="Awaiting technician"
          />
          <StatCard
            icon={AlertTriangle}
            label="Emergency Queue"
            value={stats?.emergencyCount ?? emergencyCount}
            iconBg="bg-amber-100 dark:bg-amber-900/40"
            iconColor="text-amber-600 dark:text-amber-400"
            subtext="Requires immediate action"
          />
          <StatCard
            icon={UserCheck}
            label="Available Technicians"
            value={stats?.availableTechnicianCount ?? 0}
            iconBg="bg-emerald-100 dark:bg-emerald-900/40"
            iconColor="text-emerald-600 dark:text-emerald-400"
            subtext="Ready for dispatch"
          />
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="unassigned" className="gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Unassigned
          </TabsTrigger>
          <TabsTrigger value="emergency" className="gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            Emergency
          </TabsTrigger>
          <TabsTrigger value="all_open" className="gap-1.5">
            <Phone className="h-3.5 w-3.5" />
            All Open
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Tickets Table */}
      {ticketsLoading ? (
        <TableSkeleton />
      ) : displayTickets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground font-medium">No tickets found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {activeTab === 'emergency'
                ? 'No emergency tickets — all clear!'
                : activeTab === 'all_open'
                  ? 'No open tickets at this time.'
                  : 'All tickets have been assigned. Great work!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Ticket #</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="hidden sm:table-cell">Category</TableHead>
                    <TableHead className="w-[110px]">Priority</TableHead>
                    <TableHead className="hidden md:table-cell w-[110px]">Received</TableHead>
                    <TableHead className="text-right w-[110px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayTickets.map((ticket: UnassignedTicket) => {
                    const pCfg = priorityConfig[ticket.priority] || priorityConfig.medium
                    const isEmergency = ticket.priority === 'emergency'
                    return (
                      <TableRow
                        key={ticket.id}
                        className={cn(
                          'cursor-pointer transition-colors',
                          isEmergency && 'bg-rose-50/60 dark:bg-rose-950/20 hover:bg-rose-100/60 dark:hover:bg-rose-950/30'
                        )}
                      >
                        <TableCell className="font-mono text-xs font-medium">
                          {ticket.ticketNo}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-0">
                            {isEmergency && (
                              <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                            )}
                            <span className="truncate text-sm font-medium">
                              {ticket.subject}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className="text-xs capitalize">
                            {ticket.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn('text-xs gap-1', pCfg.color)}>
                            <span className={cn('h-1.5 w-1.5 rounded-full', pCfg.dot)} />
                            {pCfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground whitespace-nowrap">
                          {formatTimeAgo(ticket.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant={isEmergency ? 'destructive' : 'default'}
                            className="gap-1 text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate('maintenance-ticket-detail', { id: ticket.id })
                            }}
                          >
                            Assign
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default WhatsAppDispatchPage