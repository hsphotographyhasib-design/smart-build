'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  BarChart3, FileText, Clock, Users, Star, Shield, Wrench,
  DollarSign, TrendingUp, AlertTriangle, CheckCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── প্রতিবেদনের প্রকারভেদ ───
const reportTypes = [
  { value: 'complaints', label: 'Complaints Report', icon: FileText },
  { value: 'response_time', label: 'Response Time', icon: Clock },
  { value: 'resolution_time', label: 'Resolution Time', icon: TrendingUp },
  { value: 'technician_performance', label: 'Technician Performance', icon: Users },
  { value: 'customer_satisfaction', label: 'Customer Satisfaction', icon: Star },
  { value: 'amc', label: 'AMC Report', icon: Shield },
  { value: 'pm_compliance', label: 'PM Compliance', icon: Wrench },
  { value: 'sla', label: 'SLA Report', icon: AlertTriangle },
  { value: 'revenue', label: 'Revenue Report', icon: DollarSign },
] as const

type ReportType = (typeof reportTypes)[number]['value']

function formatCurrency(val: number) {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`
  return `$${val.toFixed(2)}`
}

function formatHours(h: number | null | undefined) {
  if (!h) return '—'
  if (h < 24) return `${h.toFixed(1)}h`
  const d = Math.floor(h / 24)
  const rem = h % 24
  return rem > 0 ? `${d}d ${rem.toFixed(0)}h` : `${d}d`
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString()
}

export function MaintenanceReports() {
  const [reportType, setReportType] = useState<ReportType>('complaints')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // প্রতিবেদন তথ্য আনা
  const { data, isLoading } = useQuery({
    queryKey: ['maintenance-report', reportType, startDate, endDate],
    queryFn: () => {
      const params = new URLSearchParams()
      params.set('type', reportType)
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)
      return api.get(`/api/maintenance/reports?${params.toString()}`)
    },
  })
  const report = data?.data || {}

  const currentReport = reportTypes.find((r) => r.value === reportType)!

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* হেডার */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Maintenance Reports</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Analytics and reporting dashboard for maintenance operations</p>
      </div>

      {/* প্রতিবেদনের প্রকার নির্বাচক */}
      <Tabs value={reportType} onValueChange={(v) => setReportType(v as ReportType)} className="w-full">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <TabsList className="flex-wrap h-auto gap-1">
            {reportTypes.map((rt) => (
              <TabsTrigger key={rt.value} value={rt.value} className="gap-1.5 text-xs">
                <rt.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{rt.label}</span>
                <span className="sm:hidden">{rt.label.split(' ')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* তারিখ পরিসর */}
          <div className="flex items-center gap-2">
            <div className="space-y-0.5">
              <Label className="text-xs">From</Label>
              <Input type="date" className="h-8 text-xs w-36" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-0.5">
              <Label className="text-xs">To</Label>
              <Input type="date" className="h-8 text-xs w-36" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            {(startDate || endDate) && (
              <Button size="sm" variant="ghost" className="h-8 mt-4 text-xs" onClick={() => { setStartDate(''); setEndDate('') }}>
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* প্রতিবেদন বিষয়বস্তু */}
        {reportTypes.map((rt) => (
          <TabsContent key={rt.value} value={rt.value}>
            {isLoading ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
                </div>
                <Skeleton className="h-64 rounded-xl" />
              </div>
            ) : (
              <ReportContent type={rt.value} data={report} />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

// ─── প্রতিবেদন বিষয়বস্তু রাউটার ───
function ReportContent({ type, data }: { type: ReportType; data: any }) {
  switch (type) {
    case 'complaints': return <ComplaintsReport data={data} />
    case 'response_time': return <ResponseTimeReport data={data} />
    case 'resolution_time': return <ResolutionTimeReport data={data} />
    case 'technician_performance': return <TechnicianPerformanceReport data={data} />
    case 'customer_satisfaction': return <CustomerSatisfactionReport data={data} />
    case 'amc': return <AMCReport data={data} />
    case 'pm_compliance': return <PMComplianceReport data={data} />
    case 'sla': return <SLAReport data={data} />
    case 'revenue': return <RevenueReport data={data} />
    default: return <p className="text-muted-foreground">Unknown report type</p>
  }
}

// ─── সহায়ক: ফাঁকা অবস্থা ───
function ReportEmpty({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <BarChart3 className="h-10 w-10 text-muted-foreground/30 mb-2" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  )
}

// ─── পরিসংখ্যান কার্ড ───
function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <Card className={cn('border-2', color)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}

// ─── ১. অভিযোগ প্রতিবেদন ───
function ComplaintsReport({ data }: { data: any }) {
  const byCategory = Array.isArray(data.byCategory) ? data.byCategory : []
  const byStatus = Array.isArray(data.byStatus) ? data.byStatus : []
  const tickets = Array.isArray(data.tickets) ? data.tickets : []

  const statusColors: Record<string, string> = {
    open: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    resolved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    closed: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Complaints" value={data.totalComplaints ?? 0} icon={FileText} color="border-violet-200 dark:border-violet-800" />
        <StatCard label="Open" value={data.openCount ?? 0} icon={AlertTriangle} color="border-amber-200 dark:border-amber-800" />
        <StatCard label="Resolved" value={data.resolvedCount ?? 0} icon={CheckCircle} color="border-green-200 dark:border-green-800" />
        <StatCard label="Avg Resolution (h)" value={(data.avgResolutionTime ?? 0).toFixed(1)} icon={Clock} color="border-blue-200 dark:border-blue-800" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">By Category</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Category</TableHead><TableHead className="text-right">Count</TableHead><TableHead className="text-right">%</TableHead></TableRow></TableHeader>
              <TableBody>
                {byCategory.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No data</TableCell></TableRow> :
                  byCategory.map((c: any) => (
                    <TableRow key={c.category}><TableCell className="text-sm">{c.category}</TableCell><TableCell className="text-right text-sm font-medium">{c.count}</TableCell><TableCell className="text-right text-sm text-muted-foreground">{c.percentage?.toFixed(1) ?? 0}%</TableCell></TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">By Status</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Status</TableHead><TableHead className="text-right">Count</TableHead></TableRow></TableHeader>
              <TableBody>
                {byStatus.length === 0 ? <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground py-8">No data</TableCell></TableRow> :
                  byStatus.map((s: any) => (
                    <TableRow key={s.status}><TableCell><Badge variant="secondary" className={cn('text-xs', statusColors[s.status] || '')}>{s.status}</Badge></TableCell><TableCell className="text-right text-sm font-medium">{s.count}</TableCell></TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {tickets.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Recent Complaints</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Ticket #</TableHead><TableHead>Customer</TableHead><TableHead>Category</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                <TableBody>
                  {tickets.map((t: any) => (
                    <TableRow key={t.id}>
                      <TableCell className="text-sm font-mono">{t.ticketNo}</TableCell>
                      <TableCell className="text-sm">{t.customerName || '—'}</TableCell>
                      <TableCell className="text-sm">{t.category || '—'}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs">{t.priority || '—'}</Badge></TableCell>
                      <TableCell><Badge variant="secondary" className={cn('text-xs', statusColors[t.status] || '')}>{t.status}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(t.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── ২. প্রতিক্রিয়া সময় প্রতিবেদন ───
function ResponseTimeReport({ data }: { data: any }) {
  const byPriority = Array.isArray(data.byPriority) ? data.byPriority : []
  const byCategory = Array.isArray(data.byCategory) ? data.byCategory : []

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Avg Response Time" value={formatHours(data.avgResponseTime)} icon={Clock} color="border-violet-200 dark:border-violet-800" />
        <StatCard label="Min Response" value={formatHours(data.minResponseTime)} icon={TrendingUp} color="border-green-200 dark:border-green-800" />
        <StatCard label="Max Response" value={formatHours(data.maxResponseTime)} icon={AlertTriangle} color="border-red-200 dark:border-red-800" />
        <StatCard label="SLA Compliance" value={`${data.slaCompliancePercent ?? 0}%`} icon={Shield} color="border-blue-200 dark:border-blue-800" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">By Priority</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Priority</TableHead><TableHead className="text-right">Avg Time</TableHead><TableHead className="text-right">Tickets</TableHead><TableHead className="text-right">SLA %</TableHead></TableRow></TableHeader>
              <TableBody>
                {byPriority.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No data</TableCell></TableRow> :
                  byPriority.map((p: any) => (
                    <TableRow key={p.priority}><TableCell className="text-sm font-medium">{p.priority}</TableCell><TableCell className="text-right text-sm">{formatHours(p.avgResponseTime)}</TableCell><TableCell className="text-right text-sm">{p.count}</TableCell><TableCell className="text-right text-sm"><Badge variant="secondary" className={p.slaCompliance >= 90 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}>{p.slaCompliance ?? 0}%</Badge></TableCell></TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">By Category</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Category</TableHead><TableHead className="text-right">Avg Time</TableHead><TableHead className="text-right">Tickets</TableHead></TableRow></TableHeader>
              <TableBody>
                {byCategory.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No data</TableCell></TableRow> :
                  byCategory.map((c: any) => (
                    <TableRow key={c.category}><TableCell className="text-sm">{c.category}</TableCell><TableCell className="text-right text-sm">{formatHours(c.avgResponseTime)}</TableCell><TableCell className="text-right text-sm">{c.count}</TableCell></TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── ৩. সমাধান সময় প্রতিবেদন ───
function ResolutionTimeReport({ data }: { data: any }) {
  const byPriority = Array.isArray(data.byPriority) ? data.byPriority : []
  const byCategory = Array.isArray(data.byCategory) ? data.byCategory : []

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Avg Resolution" value={formatHours(data.avgResolutionTime)} icon={Clock} color="border-violet-200 dark:border-violet-800" />
        <StatCard label="Min Resolution" value={formatHours(data.minResolutionTime)} icon={TrendingUp} color="border-green-200 dark:border-green-800" />
        <StatCard label="Max Resolution" value={formatHours(data.maxResolutionTime)} icon={AlertTriangle} color="border-red-200 dark:border-red-800" />
        <StatCard label="SLA Compliance" value={`${data.slaCompliancePercent ?? 0}%`} icon={Shield} color="border-blue-200 dark:border-blue-800" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">By Priority</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Priority</TableHead><TableHead className="text-right">Avg Time</TableHead><TableHead className="text-right">Tickets</TableHead><TableHead className="text-right">SLA %</TableHead></TableRow></TableHeader>
              <TableBody>
                {byPriority.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No data</TableCell></TableRow> :
                  byPriority.map((p: any) => (
                    <TableRow key={p.priority}><TableCell className="text-sm font-medium">{p.priority}</TableCell><TableCell className="text-right text-sm">{formatHours(p.avgResolutionTime)}</TableCell><TableCell className="text-right text-sm">{p.count}</TableCell><TableCell className="text-right text-sm"><Badge variant="secondary" className={p.slaCompliance >= 90 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}>{p.slaCompliance ?? 0}%</Badge></TableCell></TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">By Category</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Category</TableHead><TableHead className="text-right">Avg Time</TableHead><TableHead className="text-right">Tickets</TableHead></TableRow></TableHeader>
              <TableBody>
                {byCategory.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No data</TableCell></TableRow> :
                  byCategory.map((c: any) => (
                    <TableRow key={c.category}><TableCell className="text-sm">{c.category}</TableCell><TableCell className="text-right text-sm">{formatHours(c.avgResolutionTime)}</TableCell><TableCell className="text-right text-sm">{c.count}</TableCell></TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── ৪. প্রযুক্তিবিদ কর্মক্ষমতা প্রতিবেদন ───
function TechnicianPerformanceReport({ data }: { data: any }) {
  const technicians = Array.isArray(data.technicians) ? data.technicians : []

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Technicians" value={data.totalTechnicians ?? 0} icon={Users} color="border-violet-200 dark:border-violet-800" />
        <StatCard label="Total Jobs" value={data.totalJobs ?? 0} icon={Wrench} color="border-blue-200 dark:border-blue-800" />
        <StatCard label="Avg Completion Rate" value={`${data.avgCompletionRate ?? 0}%`} icon={CheckCircle} color="border-green-200 dark:border-green-800" />
        <StatCard label="Avg Rating" value={`${(data.avgRating ?? 0).toFixed(1)}/5`} icon={Star} color="border-amber-200 dark:border-amber-800" />
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Technician Details</CardTitle></CardHeader>
        <CardContent className="p-0">
          {technicians.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Users className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No technician data available</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="sticky top-0 bg-background z-10">
                    <TableHead>Technician</TableHead>
                    <TableHead className="text-right">Total Jobs</TableHead>
                    <TableHead className="hidden md:table-cell text-right">Avg Response</TableHead>
                    <TableHead className="text-right">Completion Rate</TableHead>
                    <TableHead className="text-right">Customer Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {technicians.map((t: any) => (
                    <TableRow key={t.id || t.technicianId}>
                      <TableCell className="text-sm font-medium">{t.name || t.technicianName || '—'}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{t.totalJobs ?? 0}</TableCell>
                      <TableCell className="hidden md:table-cell text-right text-sm">{formatHours(t.avgResponseTime)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className={cn('text-xs', (t.completionRate ?? 0) >= 90 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : (t.completionRate ?? 0) >= 70 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300')}>
                          {t.completionRate ?? 0}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                          <span className="text-sm font-medium">{(t.avgRating ?? 0).toFixed(1)}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── ৫. গ্রাহক সন্তুষ্টি প্রতিবেদন ───
function CustomerSatisfactionReport({ data }: { data: any }) {
  const byCategory = Array.isArray(data.byCategory) ? data.byCategory : []
  const byTechnician = Array.isArray(data.byTechnician) ? data.byTechnician : []
  const lowRated = Array.isArray(data.lowRatedTickets) ? data.lowRatedTickets : []

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Avg Rating" value={`${(data.avgRating ?? 0).toFixed(1)}/5`} icon={Star} color="border-violet-200 dark:border-violet-800" />
        <StatCard label="Total Ratings" value={data.totalRatings ?? 0} icon={Users} color="border-blue-200 dark:border-blue-800" />
        <StatCard label="5-Star % " value={`${data.fiveStarPercent ?? 0}%`} icon={CheckCircle} color="border-green-200 dark:border-green-800" />
        <StatCard label="Low-Rated" value={lowRated.length} icon={AlertTriangle} color="border-red-200 dark:border-red-800" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Rating by Category</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Category</TableHead><TableHead className="text-right">Avg Rating</TableHead><TableHead className="text-right">Count</TableHead></TableRow></TableHeader>
              <TableBody>
                {byCategory.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No data</TableCell></TableRow> :
                  byCategory.map((c: any) => (
                    <TableRow key={c.category}><TableCell className="text-sm">{c.category}</TableCell><TableCell className="text-right"><div className="flex items-center justify-end gap-1"><Star className="h-3 w-3 text-amber-500 fill-amber-500" /><span className="text-sm font-medium">{(c.avgRating ?? 0).toFixed(1)}</span></div></TableCell><TableCell className="text-right text-sm">{c.count}</TableCell></TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Rating by Technician</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Technician</TableHead><TableHead className="text-right">Avg Rating</TableHead><TableHead className="text-right">Count</TableHead></TableRow></TableHeader>
              <TableBody>
                {byTechnician.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No data</TableCell></TableRow> :
                  byTechnician.map((t: any) => (
                    <TableRow key={t.technicianId || t.name}><TableCell className="text-sm">{t.name}</TableCell><TableCell className="text-right"><div className="flex items-center justify-end gap-1"><Star className="h-3 w-3 text-amber-500 fill-amber-500" /><span className="text-sm font-medium">{(t.avgRating ?? 0).toFixed(1)}</span></div></TableCell><TableCell className="text-right text-sm">{t.count}</TableCell></TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {lowRated.length > 0 && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500" /> Low-Rated Tickets (≤2 stars)</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Ticket #</TableHead><TableHead>Customer</TableHead><TableHead>Technician</TableHead><TableHead>Rating</TableHead><TableHead>Feedback</TableHead></TableRow></TableHeader>
                <TableBody>
                  {lowRated.map((t: any) => (
                    <TableRow key={t.id}>
                      <TableCell className="text-sm font-mono">{t.ticketNo}</TableCell>
                      <TableCell className="text-sm">{t.customerName || '—'}</TableCell>
                      <TableCell className="text-sm">{t.technicianName || '—'}</TableCell>
                      <TableCell><Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 text-xs">{t.rating}/5</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{t.feedback || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── ৬. AMC প্রতিবেদন ───
function AMCReport({ data }: { data: any }) {
  const contracts = Array.isArray(data.contracts) ? data.contracts : []

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Active Contracts" value={data.activeContracts ?? 0} icon={Shield} color="border-emerald-200 dark:border-emerald-800" />
        <StatCard label="Expired" value={data.expiredContracts ?? 0} icon={AlertTriangle} color="border-red-200 dark:border-red-800" />
        <StatCard label="Total Revenue" value={formatCurrency(data.totalRevenue ?? 0)} icon={DollarSign} color="border-violet-200 dark:border-violet-800" />
        <StatCard label="Avg Utilization" value={`${data.avgUtilization ?? 0}%`} icon={TrendingUp} color="border-blue-200 dark:border-blue-800" />
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Contract Details</CardTitle></CardHeader>
        <CardContent className="p-0">
          {contracts.length === 0 ? (
            <ReportEmpty message="No AMC data available" />
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="sticky top-0 bg-background z-10">
                    <TableHead>Contract #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden md:table-cell">Value</TableHead>
                    <TableHead>Visits Used</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">End Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((c: any) => {
                    const utilization = c.totalVisits ? Math.round(((c.visitsUsed || 0) / c.totalVisits) * 100) : 0
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="text-sm font-mono">{c.amcNo}</TableCell>
                        <TableCell className="text-sm">{c.customerName || '—'}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm font-medium">{formatCurrency(c.annualValue || 0)}</TableCell>
                        <TableCell className="text-sm">{c.visitsUsed || 0}/{c.totalVisits}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={cn('text-xs', utilization >= 80 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300')}>
                            {utilization}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={cn('text-xs', c.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : c.status === 'expired' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400')}>
                            {c.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{formatDate(c.endDate)}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── ৭. PM সম্মতি প্রতিবেদন ───
function PMComplianceReport({ data }: { data: any }) {
  const schedules = Array.isArray(data.schedules) ? data.schedules : []

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="On-Time %" value={`${data.onTimePercent ?? 0}%`} icon={CheckCircle} color="border-green-200 dark:border-green-800" />
        <StatCard label="Overdue" value={data.overdueCount ?? 0} icon={AlertTriangle} color="border-red-200 dark:border-red-800" />
        <StatCard label="Completed" value={data.completedCount ?? 0} icon={Wrench} color="border-blue-200 dark:border-blue-800" />
        <StatCard label="Completion Rate" value={`${data.completionRate ?? 0}%`} icon={TrendingUp} color="border-violet-200 dark:border-violet-800" />
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Schedule Details</CardTitle></CardHeader>
        <CardContent className="p-0">
          {schedules.length === 0 ? (
            <ReportEmpty message="No PM compliance data available" />
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="sticky top-0 bg-background z-10">
                    <TableHead>PM #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden md:table-cell">Equipment</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Next Visit</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((s: any) => {
                    const pct = s.totalVisits ? Math.round(((s.visitsCompleted || 0) / s.totalVisits) * 100) : 0
                    const now = new Date()
                    const nv = s.nextVisitDate ? new Date(s.nextVisitDate) : null
                    const isOverdue = nv && nv < now
                    return (
                      <TableRow key={s.id}>
                        <TableCell className="text-sm font-mono">{s.pmNo}</TableCell>
                        <TableCell className="text-sm">{s.customerName || '—'}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{s.equipmentName || '—'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div className={cn('h-full rounded-full', pct >= 100 ? 'bg-green-500' : pct >= 50 ? 'bg-blue-500' : 'bg-amber-500')} style={{ width: `${Math.min(pct, 100)}%` }} />
                            </div>
                            <span className="text-xs text-muted-foreground">{s.visitsCompleted || 0}/{s.totalVisits}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatDate(s.lastVisitDate)}</TableCell>
                        <TableCell className={cn('text-xs', isOverdue ? 'text-red-600 font-medium' : '')}>{formatDate(s.nextVisitDate)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={cn('text-xs', isOverdue && s.status === 'active' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : s.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300')}>
                            {isOverdue && s.status === 'active' ? 'Overdue' : s.status}
                          </Badge>
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
    </div>
  )
}

// ─── ৮. SLA প্রতিবেদন ───
function SLAReport({ data }: { data: any }) {
  const byPriority = Array.isArray(data.byPriority) ? data.byPriority : []
  const breached = Array.isArray(data.breachedTickets) ? data.breachedTickets : []

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Overall Compliance" value={`${data.overallCompliance ?? 0}%`} icon={Shield} color="border-violet-200 dark:border-violet-800" />
        <StatCard label="Total Tickets" value={data.totalTickets ?? 0} icon={FileText} color="border-blue-200 dark:border-blue-800" />
        <StatCard label="Breached" value={data.breachedCount ?? 0} icon={AlertTriangle} color="border-red-200 dark:border-red-800" />
        <StatCard label="Avg Breach Duration" value={formatHours(data.avgBreachDuration)} icon={Clock} color="border-amber-200 dark:border-amber-800" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Compliance by Priority</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Priority</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-right">Breached</TableHead><TableHead className="text-right">Compliance %</TableHead></TableRow></TableHeader>
              <TableBody>
                {byPriority.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No data</TableCell></TableRow> :
                  byPriority.map((p: any) => (
                    <TableRow key={p.priority}>
                      <TableCell className="text-sm font-medium">{p.priority}</TableCell>
                      <TableCell className="text-right text-sm">{p.total ?? 0}</TableCell>
                      <TableCell className="text-right text-sm text-red-600 font-medium">{p.breached ?? 0}</TableCell>
                      <TableCell className="text-right"><Badge variant="secondary" className={cn('text-xs', (p.compliancePercent ?? 0) >= 90 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : (p.compliancePercent ?? 0) >= 70 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300')}>{p.compliancePercent ?? 0}%</Badge></TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Quick Stats</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              <div className="flex justify-between px-4 py-3"><span className="text-sm text-muted-foreground">Most Breached Priority</span><span className="text-sm font-medium">{data.mostBreachedPriority || '—'}</span></div>
              <div className="flex justify-between px-4 py-3"><span className="text-sm text-muted-foreground">Best Compliance Priority</span><span className="text-sm font-medium text-green-600">{data.bestCompliancePriority || '—'}</span></div>
              <div className="flex justify-between px-4 py-3"><span className="text-sm text-muted-foreground">This Month Breaches</span><span className="text-sm font-medium text-red-600">{data.thisMonthBreaches ?? 0}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {breached.length > 0 && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500" /> Breached Tickets</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Ticket #</TableHead><TableHead>Customer</TableHead><TableHead>Priority</TableHead><TableHead>SLA Deadline</TableHead><TableHead>Actual Time</TableHead><TableHead>Breach Duration</TableHead></TableRow></TableHeader>
                <TableBody>
                  {breached.map((t: any) => (
                    <TableRow key={t.id}>
                      <TableCell className="text-sm font-mono">{t.ticketNo}</TableCell>
                      <TableCell className="text-sm">{t.customerName || '—'}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs">{t.priority}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{t.slaDeadline ? new Date(t.slaDeadline).toLocaleString() : '—'}</TableCell>
                      <TableCell className="text-sm">{formatHours(t.actualTime)}</TableCell>
                      <TableCell className="text-sm text-red-600 font-medium">{formatHours(t.breachDuration)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── ৯. আয় প্রতিবেদন ───
function RevenueReport({ data }: { data: any }) {
  const byCustomer = Array.isArray(data.byCustomer) ? data.byCustomer : []
  const byMonth = Array.isArray(data.byMonth) ? data.byMonth : []
  const byCategory = Array.isArray(data.byCategory) ? data.byCategory : []

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={formatCurrency(data.totalRevenue ?? 0)} icon={DollarSign} color="border-emerald-200 dark:border-emerald-800" />
        <StatCard label="Paid Invoices" value={data.paidCount ?? 0} icon={CheckCircle} color="border-green-200 dark:border-green-800" />
        <StatCard label="Pending" value={data.pendingCount ?? 0} icon={Clock} color="border-amber-200 dark:border-amber-800" />
        <StatCard label="Cancelled" value={data.cancelledCount ?? 0} icon={AlertTriangle} color="border-red-200 dark:border-red-800" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Revenue by Customer</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Customer</TableHead><TableHead className="text-right">Invoices</TableHead><TableHead className="text-right">Revenue</TableHead></TableRow></TableHeader>
                <TableBody>
                  {byCustomer.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No data</TableCell></TableRow> :
                    byCustomer.map((c: any) => (
                      <TableRow key={c.customerId || c.customer}><TableCell className="text-sm font-medium">{c.customer || c.customerName || '—'}</TableCell><TableCell className="text-right text-sm">{c.count}</TableCell><TableCell className="text-right text-sm font-medium text-emerald-600">{formatCurrency(c.revenue || 0)}</TableCell></TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Monthly Revenue</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Month</TableHead><TableHead className="text-right">Invoices</TableHead><TableHead className="text-right">Revenue</TableHead></TableRow></TableHeader>
                <TableBody>
                  {byMonth.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No data</TableCell></TableRow> :
                    byMonth.map((m: any) => (
                      <TableRow key={m.month}><TableCell className="text-sm">{m.month}</TableCell><TableCell className="text-right text-sm">{m.count}</TableCell><TableCell className="text-right text-sm font-medium text-emerald-600">{formatCurrency(m.revenue || 0)}</TableCell></TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {byCategory.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Revenue by Category</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Category</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
              <TableBody>
                {byCategory.map((c: any) => (
                  <TableRow key={c.category}><TableCell className="text-sm">{c.category}</TableCell><TableCell className="text-right text-sm font-medium text-emerald-600">{formatCurrency(c.amount || 0)}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}