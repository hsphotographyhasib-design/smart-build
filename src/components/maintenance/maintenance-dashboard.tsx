'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts'
import {
  Ticket, AlertTriangle, CheckCircle2, Clock, ShieldAlert, TrendingDown,
  Plus, Radio, Users, ChevronDown, ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { EmptyTickets } from '@/components/common/empty-states'

// ─── ধ্রুবক ───
const ROSE_COLORS = ['#e11d48', '#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#ffe4e6', '#be123c', '#9f1239', '#881337']

const PRIORITY_CONFIG: Record<string, { label: string; color: string; dotColor: string }> = {
  emergency: { label: 'Emergency', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', dotColor: 'bg-red-500' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300', dotColor: 'bg-orange-500' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300', dotColor: 'bg-yellow-500' },
  low: { label: 'Low', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', dotColor: 'bg-green-500' },
  preventive: { label: 'Preventive', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', dotColor: 'bg-blue-500' },
}

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

const STATUS_WORKFLOW = [
  'new', 'under_review', 'assigned', 'accepted', 'in_progress',
  'pending_parts', 'pending_customer', 'completed', 'customer_verification', 'closed',
]

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

interface DashboardData {
  totalTickets: number
  openTickets: number
  completedTickets: number
  emergencyTickets: number
  slaBreachedTickets: number
  overdueTickets: number
  todayTickets: number
  avgResponseTime: number
  availableTechnicians: number
  avgTechnicianRating: number
  ticketsByCategory: Array<{ category: string; count: number }>
  ticketsByPriority: Array<{ priority: string; count: number }>
  ticketsByStatus: Array<{ status: string; count: number }>
}

function formatResponseTime(minutes: number): string {
  if (minutes >= 60) return `${(minutes / 60).toFixed(1)}h`
  return `${Math.round(minutes)}m`
}

export function MaintenanceDashboard() {
  const { navigate } = useAppStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['maintenance-dashboard'],
    queryFn: () => api.get<DashboardData>('/api/maintenance/dashboard').then(r => r.data!),
    refetchInterval: 30000,
  })

  const { data: recentTicketsData } = useQuery({
    queryKey: ['maintenance-recent-tickets'],
    queryFn: () => api.get<any>('/api/maintenance/tickets?limit=10&sort=createdAt:desc').then(r => r.data),
    refetchInterval: 30000,
  })

  const dashboard = data as DashboardData | undefined
  const recentTickets = (recentTicketsData?.tickets || recentTicketsData || []) as any[]

  if (isLoading || !dashboard) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <Skeleton className="h-8 w-72 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    )
  }

  const kpis = [
    {
      label: 'Total Tickets',
      value: `${dashboard.totalTickets}`,
      icon: Ticket,
      sub: 'All time',
      color: 'text-rose-600',
      bg: 'bg-rose-50 dark:bg-rose-950/30',
    },
    {
      label: 'Open Tickets',
      value: `${dashboard.openTickets}`,
      icon: Clock,
      sub: 'Awaiting action',
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
    },
    {
      label: 'Emergency',
      value: `${dashboard.emergencyTickets}`,
      icon: AlertTriangle,
      sub: dashboard.emergencyTickets > 0 ? 'Needs attention' : 'All clear',
      color: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-950/30',
    },
    {
      label: 'Completed Today',
      value: `${dashboard.todayTickets}`,
      icon: CheckCircle2,
      sub: 'Created today',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      label: 'SLA Breaches',
      value: `${dashboard.slaBreachedTickets}`,
      icon: ShieldAlert,
      sub: dashboard.slaBreachedTickets > 0 ? 'Review needed' : 'On track',
      color: dashboard.slaBreachedTickets > 0 ? 'text-red-600' : 'text-emerald-600',
      bg: dashboard.slaBreachedTickets > 0 ? 'bg-red-50 dark:bg-red-950/30' : 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      label: 'Avg Response',
      value: formatResponseTime(dashboard.avgResponseTime),
      icon: TrendingDown,
      sub: 'Response time',
      color: 'text-rose-600',
      bg: 'bg-rose-50 dark:bg-rose-950/30',
    },
  ]

  // চার্ট তথ্য প্রস্তুত করা
  const categoryChartData = (dashboard.ticketsByCategory || []).map(item => ({
    name: CATEGORY_LABELS[item.category] || item.category,
    value: item.count,
  }))

  const priorityChartData = (dashboard.ticketsByPriority || []).map(item => ({
    name: PRIORITY_CONFIG[item.priority]?.label || item.priority,
    count: item.count,
    fill: item.priority === 'emergency' ? '#ef4444'
      : item.priority === 'high' ? '#f97316'
      : item.priority === 'medium' ? '#eab308'
      : item.priority === 'low' ? '#22c55e'
      : '#3b82f6',
  }))

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Maintenance Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Overview of all maintenance operations and tickets</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            className="gap-1.5 bg-rose-600 hover:bg-rose-700"
            onClick={() => navigate('maintenance-service-requests')}
          >
            <Plus className="h-3.5 w-3.5" /> Create Ticket
          </Button>
          <Button
            variant="outline"
            className="gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/30"
            onClick={() => navigate('maintenance-dispatch')}
          >
            <Radio className="h-3.5 w-3.5" /> View Dispatch
          </Button>
          <Button
            variant="outline"
            className="gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/30"
            onClick={() => navigate('maintenance-technicians')}
          >
            <Users className="h-3.5 w-3.5" /> Technicians
          </Button>
        </div>
      </div>

      {/* KPI কার্ড */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground">{kpi.sub}</p>
                </div>
                <div className={cn('p-2.5 rounded-lg', kpi.bg)}>
                  <kpi.icon className={cn('h-5 w-5', kpi.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* চার্ট সারি */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* বিভাগ বিশ্লেষণ পাই চার্ট */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Tickets by Category</CardTitle>
            <CardDescription className="text-xs">Distribution across maintenance categories</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryChartData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name.slice(0, 12)} ${(percent * 100).toFixed(0)}%`}
                      labelLine={{ strokeWidth: 1 }}
                    >
                      {categoryChartData.map((_, i) => (
                        <Cell key={i} fill={ROSE_COLORS[i % ROSE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value} tickets`} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-sm text-muted-foreground">
                No ticket data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* অগ্রাধিকার বিশ্লেষণ বার চার্ট */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Tickets by Priority</CardTitle>
            <CardDescription className="text-xs">Current ticket distribution by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            {priorityChartData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      formatter={(value: number) => `${value} tickets`}
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    />
                    <Bar dataKey="count" name="Tickets" radius={[4, 4, 0, 0]}>
                      {priorityChartData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-sm text-muted-foreground">
                No ticket data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* সাম্প্রতিক টিকেট টেবিল */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Recent Tickets</CardTitle>
              <CardDescription className="text-xs">Last 10 maintenance tickets</CardDescription>
            </div>
            <Button
              variant="link"
              size="sm"
              className="text-rose-600"
              onClick={() => navigate('maintenance-service-requests')}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {recentTickets && recentTickets.length > 0 ? (
            <div className="max-h-[calc(100vh-280px)] overflow-y-auto overflow-x-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead className="text-xs">Ticket #</TableHead>
                    <TableHead className="text-xs">Subject</TableHead>
                    <TableHead className="text-xs">Category</TableHead>
                    <TableHead className="text-xs">Priority</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTickets.slice(0, 10).map((ticket: any) => {
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
                          <TableCell className="text-xs font-mono text-rose-600">{ticket.ticketNo}</TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">{ticket.subject}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{ticket.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {CATEGORY_LABELS[ticket.category] || ticket.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={cn('gap-1.5 text-xs', pri.color)}>
                              <span className={cn('h-1.5 w-1.5 rounded-full', pri.dotColor)} />
                              {pri.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={cn('text-xs', stat.color)}>
                              {stat.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={7} className="bg-muted/20 px-6 py-4">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Ticket Details</h4>
                                  <div className="space-y-2 text-sm">
                                    <div>
                                      <span className="text-muted-foreground text-xs">Description:</span>
                                      <p className="mt-1">{ticket.description || 'No description'}</p>
                                    </div>
                                    <div className="flex gap-6">
                                      <div>
                                        <span className="text-muted-foreground text-xs">Type:</span>
                                        <p className="font-medium">{TYPE_LABELS[ticket.type] || ticket.type}</p>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground text-xs">Site:</span>
                                        <p className="font-medium">{ticket.site?.name || '—'}</p>
                                      </div>
                                    </div>
                                    <div className="flex gap-6">
                                      <div>
                                        <span className="text-muted-foreground text-xs">Location:</span>
                                        <p className="font-medium">{ticket.location || '—'}</p>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground text-xs">Contact:</span>
                                        <p className="font-medium">{ticket.contactPerson || '—'}</p>
                                      </div>
                                    </div>
                                    {ticket.technician && (
                                      <div>
                                        <span className="text-muted-foreground text-xs">Assigned Technician:</span>
                                        <p className="font-medium">{ticket.technician.employee?.name || '—'}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Status Progress</h4>
                                  <div className="flex items-center gap-1 mb-3">
                                    {STATUS_WORKFLOW.map((step, idx) => {
                                      const isActive = (STATUS_CONFIG[ticket.status]?.step ?? -1) >= idx
                                      const isCurrent = (STATUS_CONFIG[ticket.status]?.step ?? -1) === idx
                                      return (
                                        <React.Fragment key={step}>
                                          <div
                                            className={cn(
                                              'h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors',
                                              isActive
                                                ? isCurrent
                                                  ? 'bg-rose-500 text-white ring-2 ring-rose-200 dark:ring-rose-800'
                                                  : 'bg-rose-500 text-white'
                                                : 'bg-muted text-muted-foreground'
                                            )}
                                            title={STATUS_CONFIG[step]?.label}
                                          >
                                            {isActive ? '✓' : idx + 1}
                                          </div>
                                          {idx < STATUS_WORKFLOW.length - 1 && (
                                            <div className={cn('flex-1 h-0.5', isActive ? 'bg-rose-500' : 'bg-muted')} />
                                          )}
                                        </React.Fragment>
                                      )
                                    })}
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {STATUS_WORKFLOW.map((step, idx) => (
                                      <div
                                        key={step}
                                        className={cn(
                                          'text-[9px] px-1 py-0.5 rounded',
                                          (STATUS_CONFIG[ticket.status]?.step ?? -1) === idx
                                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300 font-semibold'
                                            : 'text-muted-foreground'
                                        )}
                                      >
                                        {STATUS_CONFIG[step]?.label}
                                      </div>
                                    ))}
                                  </div>
                                  {ticket.slaDeadline && (
                                    <div className={cn(
                                      'mt-3 p-2 rounded-lg text-xs',
                                      new Date(ticket.slaDeadline) < new Date()
                                        ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900'
                                        : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                                    )}>
                                      <span className="font-semibold">SLA Deadline: </span>
                                      {new Date(ticket.slaDeadline).toLocaleString()}
                                      {new Date(ticket.slaDeadline) < new Date() && ' (BREACHED)'}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="mt-4 flex justify-end">
                                <Button
                                  size="sm"
                                  className="bg-rose-600 hover:bg-rose-700"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    navigate('maintenance-ticket-detail', { id: ticket.id })
                                  }}
                                >
                                  View Full Details
                                </Button>
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
          ) : (
            <EmptyTickets onAdd={() => navigate('maintenance-service-requests')} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}