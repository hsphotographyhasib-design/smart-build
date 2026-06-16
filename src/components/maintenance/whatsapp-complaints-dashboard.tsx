'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import {
  MessageSquare, Clock, AlertTriangle, CheckCircle2, ShieldAlert,
  TrendingDown, Radio, Users, Phone, Bot, ArrowRight,
} from 'lucide-react'

// ─── Constants ───────────────────────────────────────────────

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  emergency: { label: 'Emergency', color: 'bg-red-100 text-red-700' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  low: { label: 'Low', color: 'bg-green-100 text-green-700' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-slate-100 text-slate-600' },
  under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-700' },
  assigned: { label: 'Assigned', color: 'bg-indigo-100 text-indigo-700' },
  accepted: { label: 'Accepted', color: 'bg-violet-100 text-violet-700' },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-700' },
  pending_parts: { label: 'Pending Parts', color: 'bg-orange-100 text-orange-700' },
  pending_customer: { label: 'Pending Customer', color: 'bg-cyan-100 text-cyan-700' },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700' },
  customer_verification: { label: 'Verification', color: 'bg-teal-100 text-teal-700' },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-500' },
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

const AI_CATEGORY_LABELS: Record<string, string> = {
  complaint: 'Complaint',
  service_request: 'Service Request',
  general_inquiry: 'General Inquiry',
  feedback: 'Feedback',
  status_query: 'Status Query',
  emergency: 'Emergency',
}

const GREEN_COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5']

const PRIORITY_PIE_COLORS: Record<string, string> = {
  emergency: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
}

// ─── Interfaces ──────────────────────────────────────────────

interface WhatsAppDashboardData {
  totalMessages: number
  messagesToday: number
  openConversations: number
  unresolvedCount: number
  avgResponseTime: number
  complaintsCreatedToday: number
  byCategory: Record<string, number>
  byPriority: Record<string, number>
}

interface MaintenanceDashboardData {
  totalTickets: number
  openTickets: number
  completedTickets: number
  emergencyTickets: number
  slaBreachedTickets: number
  avgResponseTime: number
  ticketsByCategory: Array<{ category: string; count: number }>
  ticketsByPriority: Array<{ priority: string; count: number }>
}

// ─── Helpers ────────────────────────────────────────────────

function formatResponseTime(minutes: number): string {
  if (minutes >= 60) return `${(minutes / 60).toFixed(1)}h`
  return `${Math.round(minutes)}m`
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// ─── Loading Skeleton ───────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <Skeleton className="h-8 w-80 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────

export function WhatsAppComplaintsDashboard() {
  const { navigate } = useAppStore()
  const [activeTab, setActiveTab] = useState('overview')

  // WhatsApp dashboard data
  const { data: whatsappData, isLoading: whatsappLoading } = useQuery({
    queryKey: ['whatsapp-dashboard'],
    queryFn: () =>
      api.get<WhatsAppDashboardData>('/api/whatsapp/dashboard').then((r) => r.data!),
    refetchInterval: 30000,
  })

  // Maintenance dashboard data (for tickets)
  const { data: maintenanceData, isLoading: maintenanceLoading } = useQuery({
    queryKey: ['maintenance-dashboard-whatsapp'],
    queryFn: () =>
      api.get<MaintenanceDashboardData>('/api/maintenance/dashboard').then((r) => r.data!),
    refetchInterval: 30000,
  })

  // WhatsApp-sourced recent tickets
  const { data: ticketsData, isLoading: ticketsLoading } = useQuery({
    queryKey: ['whatsapp-recent-tickets'],
    queryFn: () =>
      api
        .get<any>('/api/maintenance/tickets?source=whatsapp&limit=15&sort=createdAt:desc')
        .then((r) => r.data),
    refetchInterval: 30000,
  })

  const whatsapp = whatsappData as WhatsAppDashboardData | undefined
  const maintenance = maintenanceData as MaintenanceDashboardData | undefined
  const tickets = (Array.isArray(ticketsData) ? ticketsData : []) as any[]

  if (whatsappLoading || maintenanceLoading || !whatsapp || !maintenance) {
    return <DashboardSkeleton />
  }

  // ─── KPI Cards ─────────────────────────────────────────────

  const kpis = [
    {
      label: 'New Messages',
      value: `${whatsapp.messagesToday}`,
      icon: MessageSquare,
      sub: 'Received today',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'WhatsApp Complaints Created',
      value: `${whatsapp.complaintsCreatedToday}`,
      icon: Bot,
      sub: 'Converted today',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Open Tickets',
      value: `${maintenance.openTickets}`,
      icon: Clock,
      sub: 'Awaiting action',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Emergency Tickets',
      value: `${maintenance.emergencyTickets}`,
      icon: AlertTriangle,
      sub:
        maintenance.emergencyTickets > 0
          ? 'Needs immediate attention'
          : 'All clear',
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'SLA Breaches',
      value: `${maintenance.slaBreachedTickets}`,
      icon: ShieldAlert,
      sub:
        maintenance.slaBreachedTickets > 0
          ? 'Review required'
          : 'On track',
      color:
        maintenance.slaBreachedTickets > 0 ? 'text-red-600' : 'text-emerald-600',
      bg:
        maintenance.slaBreachedTickets > 0 ? 'bg-red-50' : 'bg-emerald-50',
    },
    {
      label: 'Avg Response Time',
      value: formatResponseTime(whatsapp.avgResponseTime),
      icon: TrendingDown,
      sub: 'WhatsApp response',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ]

  // ─── Chart data ────────────────────────────────────────────

  const categoryChartData = (maintenance.ticketsByCategory || []).map((item) => ({
    name: CATEGORY_LABELS[item.category] || item.category,
    count: item.count,
  }))

  const priorityPieData = (maintenance.ticketsByPriority || []).map((item) => ({
    name: PRIORITY_CONFIG[item.priority]?.label || item.priority,
    value: item.count,
    fill: PRIORITY_PIE_COLORS[item.priority] || '#94a3b8',
  }))

  // AI classification bar data
  const aiCategoryEntries = whatsapp.byCategory
    ? Object.entries(whatsapp.byCategory).map(([key, count]) => ({
        name: AI_CATEGORY_LABELS[key] || key.replace(/_/g, ' '),
        count: count as number,
      }))
    : []

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* ─── Header ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            WhatsApp Complaints Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            WhatsApp-powered maintenance service desk
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => navigate('whatsapp-inbox')}
          >
            <Phone className="h-3.5 w-3.5" />
            Open Inbox
          </Button>
          <Button
            variant="outline"
            className="gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            onClick={() => navigate('whatsapp-dispatch')}
          >
            <Radio className="h-3.5 w-3.5" />
            Dispatch
          </Button>
          <Button
            variant="outline"
            className="gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            onClick={() => navigate('maintenance-technicians')}
          >
            <Users className="h-3.5 w-3.5" />
            Technicians
          </Button>
        </div>
      </div>

      {/* ─── KPI Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {kpi.label}
                  </p>
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

      {/* ─── Tabs ────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-emerald-50 dark:bg-emerald-950/20">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recent">Recent Complaints</TabsTrigger>
          <TabsTrigger value="ai-classification">AI Classification</TabsTrigger>
        </TabsList>

        {/* ─── Overview Tab ──────────────────────────────────── */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Bar chart: Tickets by Category */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  Tickets by Category
                </CardTitle>
                <CardDescription className="text-xs">
                  Distribution across maintenance categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                {categoryChartData.length > 0 ? (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={categoryChartData}
                        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip
                          formatter={(value: number) => `${value} tickets`}
                          contentStyle={{ fontSize: 12, borderRadius: 8 }}
                        />
                        <Bar
                          dataKey="count"
                          name="Tickets"
                          fill="#059669"
                          radius={[4, 4, 0, 0]}
                        />
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

            {/* Pie chart: Tickets by Priority */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  Tickets by Priority
                </CardTitle>
                <CardDescription className="text-xs">
                  Current ticket distribution by priority level
                </CardDescription>
              </CardHeader>
              <CardContent>
                {priorityPieData.length > 0 ? (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={priorityPieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="45%"
                          outerRadius={80}
                          label={({ name, percent }) =>
                            `${name.slice(0, 12)} ${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={{ strokeWidth: 1 }}
                        >
                          {priorityPieData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => `${value} tickets`}
                          contentStyle={{ fontSize: 12, borderRadius: 8 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-72 flex items-center justify-center text-sm text-muted-foreground">
                    No priority data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Recent Complaints Tab ───────────────────────────── */}
        <TabsContent value="recent" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">
                    WhatsApp Complaints
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Recent tickets created from WhatsApp conversations
                  </CardDescription>
                </div>
                <Button
                  variant="link"
                  size="sm"
                  className="text-emerald-600"
                  onClick={() => navigate('whatsapp-complaints')}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {ticketsLoading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : tickets.length > 0 ? (
                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Ticket #</TableHead>
                        <TableHead className="text-xs">Subject</TableHead>
                        <TableHead className="text-xs">Category</TableHead>
                        <TableHead className="text-xs">Priority</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs">Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tickets.map((ticket: any) => {
                        const pri = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.medium
                        const stat = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.new

                        return (
                          <TableRow
                            key={ticket.id}
                            className="cursor-pointer hover:bg-emerald-50/50 transition-colors"
                            onClick={() =>
                              navigate('maintenance-ticket-detail', {
                                id: ticket.id,
                              })
                            }
                          >
                            <TableCell className="text-xs font-mono text-emerald-600">
                              {ticket.ticketNo}
                            </TableCell>
                            <TableCell className="max-w-[200px]">
                              <p className="text-sm font-medium truncate">
                                {ticket.subject}
                              </p>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">
                                {CATEGORY_LABELS[ticket.category] ||
                                  ticket.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={cn('text-xs', pri.color)}
                              >
                                {pri.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={cn('text-xs', stat.color)}
                              >
                                {stat.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {formatShortDate(ticket.createdAt)}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mb-3 opacity-40" />
                  <p className="text-sm font-medium">No WhatsApp complaints yet</p>
                  <p className="text-xs mt-1">
                    Complaints created via WhatsApp will appear here
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                    onClick={() => navigate('whatsapp-inbox')}
                  >
                    Open Inbox
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── AI Classification Tab ──────────────────────────── */}
        <TabsContent value="ai-classification" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                AI Message Classification
              </CardTitle>
              <CardDescription className="text-xs">
                WhatsApp messages classified by AI into categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              {aiCategoryEntries.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={aiCategoryEntries}
                      margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip
                        formatter={(value: number) => `${value} messages`}
                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
                      />
                      <Bar dataKey="count" name="Messages" radius={[4, 4, 0, 0]}>
                        {aiCategoryEntries.map((_, i) => (
                          <Cell
                            key={i}
                            fill={GREEN_COLORS[i % GREEN_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex flex-col items-center justify-center text-muted-foreground">
                  <Bot className="h-10 w-10 mb-3 opacity-40" />
                  <p className="text-sm font-medium">
                    No AI classification data available
                  </p>
                  <p className="text-xs mt-1">
                    AI-classified WhatsApp messages will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
