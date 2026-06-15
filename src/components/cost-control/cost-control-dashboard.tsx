'use client'

import { useState } from 'react'
import { api } from '@/lib/store'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts'
import {
  DollarSign, FileCheck, TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight,
  CreditCard, Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Helpers ───
function formatCurrency(val: number) {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`
  return `$${val.toFixed(0)}`
}

function formatPct(val: number) {
  return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`
}

const AMBER_COLORS = ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f', '#fbbf24', '#fcd34d', '#fde68a']

interface DashboardData {
  counts: {
    totalBudgets: number
    approvedBudgets: number
    totalOriginalValue: number
    totalRevisedValue: number
    pendingChangeOrders: number
  }
  budgetVsActual: Array<{
    projectId: string
    projectName: string
    projectCode: string
    budgetAmount: number
    actualAmount: number
    committedAmount: number
    variance: number
    status: string
  }>
  costCodeDistribution: Array<{ name: string; code: string; value: number; id: string }>
  recentChangeOrders: Array<{
    id: string
    bcoNo: string
    title: string
    changeAmount: number
    status: string
    createdAt: string
    budget: { project: { name: string; code: string } }
  }>
  monthlyTrends: Array<{ month: string; budget: number; actual: number; committed: number; forecast: number }>
  statusOverview: Array<{ status: string; count: number }>
}

export function CostControlDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['cost-control-dashboard'],
    queryFn: () => api.get<DashboardData>('/api/cost-control/dashboard').then(r => r.data!),
  })

  const dashboard = data as DashboardData | undefined

  if (isLoading || !dashboard) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    )
  }

  const { counts, budgetVsActual, costCodeDistribution, recentChangeOrders, monthlyTrends, statusOverview } = dashboard
  const totalActual = budgetVsActual.reduce((s, b) => s + b.actualAmount, 0)
  const totalBudget = budgetVsActual.reduce((s, b) => s + b.budgetAmount, 0)
  const utilization = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0

  const kpis = [
    { label: 'Total Budget Value', value: formatCurrency(counts.totalOriginalValue), icon: DollarSign, sub: `${formatCurrency(counts.totalRevisedValue)} revised`, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    { label: 'Approved Budgets', value: `${counts.approvedBudgets}`, icon: FileCheck, sub: `of ${counts.totalBudgets} total`, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'Budget Utilization', value: `${utilization.toFixed(1)}%`, icon: TrendingUp, sub: `${formatCurrency(totalActual)} spent`, color: utilization > 90 ? 'text-red-600' : utilization > 70 ? 'text-amber-600' : 'text-emerald-600', bg: utilization > 90 ? 'bg-red-50 dark:bg-red-950/30' : utilization > 70 ? 'bg-amber-50 dark:bg-amber-950/30' : 'bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'Pending Change Orders', value: `${counts.pendingChangeOrders}`, icon: AlertCircle, sub: 'Awaiting review', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30' },
  ]

  const coStatusColor: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    reviewed: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    applied: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  }

  const budgetStatusColor: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
    locked: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    closed: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  }

  return (
    <div className="p-6 space-y-6">
      {/* হেডার */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cost Control Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Monitor budgets, costs, and change orders across all projects</p>
      </div>

      {/* KPI কার্ড */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* বাজেট বনাম প্রকৃত বার চার্ট */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Budget vs Actual by Project</CardTitle>
            <CardDescription className="text-xs">Comparison of budgeted amounts against actual costs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetVsActual} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="projectCode" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v)} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => {
                      const item = budgetVsActual.find(b => b.projectCode === label)
                      return item?.projectName || label
                    }}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="budgetAmount" name="Budget" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actualAmount" name="Actual" fill="#b45309" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="committedAmount" name="Committed" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* খরচ কোড বিতরণ পাই চার্ট */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Cost Code Distribution</CardTitle>
            <CardDescription className="text-xs">Budget allocation by cost category</CardDescription>
          </CardHeader>
          <CardContent>
            {costCodeDistribution.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={costCodeDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name.slice(0, 12)} ${(percent * 100).toFixed(0)}%`}
                      labelLine={{ strokeWidth: 1 }}
                    >
                      {costCodeDistribution.map((_, i) => (
                        <Cell key={i} fill={AMBER_COLORS[i % AMBER_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-sm text-muted-foreground">
                No budget data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* নিচের সারি */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* সাম্প্রতিক পরিবর্তন অর্ডার */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Recent Change Orders</CardTitle>
            <CardDescription className="text-xs">Latest budget change order activity</CardDescription>
          </CardHeader>
          <CardContent>
            {recentChangeOrders.length > 0 ? (
              <div className="max-h-72 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">BCO #</TableHead>
                      <TableHead className="text-xs">Title</TableHead>
                      <TableHead className="text-xs">Project</TableHead>
                      <TableHead className="text-xs text-right">Amount</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentChangeOrders.map((co) => (
                      <TableRow key={co.id}>
                        <TableCell className="text-xs font-mono">{co.bcoNo}</TableCell>
                        <TableCell className="text-xs font-medium max-w-[200px] truncate">{co.title}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{co.budget?.project?.name}</TableCell>
                        <TableCell className="text-xs text-right">
                          <span className={cn('flex items-center justify-end gap-1', co.changeAmount >= 0 ? 'text-amber-600' : 'text-emerald-600')}>
                            {co.changeAmount >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {formatCurrency(Math.abs(co.changeAmount))}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={cn('text-[10px] px-1.5 py-0', coStatusColor[co.status] || '')}>
                            {co.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                No change orders yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* বাজেট স্ট্যাটাস সারসংক্ষেপ */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Budget Status</CardTitle>
            <CardDescription className="text-xs">Distribution of budget statuses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {statusOverview.map((s) => (
              <div key={s.status} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={cn('text-[10px] px-1.5 py-0', budgetStatusColor[s.status] || '')}>
                    {s.status}
                  </Badge>
                  <span className="text-sm font-medium">{s.count}</span>
                </div>
                <div className="flex-1 mx-3">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        s.status === 'approved' ? 'bg-emerald-500' : s.status === 'draft' ? 'bg-gray-400' : s.status === 'locked' ? 'bg-amber-500' : 'bg-slate-500'
                      )}
                      style={{ width: `${counts.totalBudgets > 0 ? (s.count / counts.totalBudgets) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {statusOverview.length === 0 && (
              <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">
                No budgets created
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* মাসিক ট্রেন্ড */}
      {monthlyTrends.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Monthly Budget Trends</CardTitle>
            <CardDescription className="text-xs">Last 6 months budget performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrends} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v)} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="budget" name="Budget" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="actual" name="Actual" stroke="#b45309" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="committed" name="Committed" stroke="#fbbf24" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}