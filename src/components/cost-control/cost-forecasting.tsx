'use client'

import { useState } from 'react'
import { api, useAppStore } from '@/lib/store'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, ReferenceLine,
} from 'recharts'
import {
  TrendingUp, TrendingDown, AlertTriangle, Target, DollarSign, Activity,
  ChevronDown, ChevronRight, Camera,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

// ─── সহায়ক ফাংশনসমূহ ───
function formatCurrency(val: number) {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`
  return `$${val.toFixed(0)}`
}

// ─── প্রকারভেদ ───
interface ForecastSummary {
  totalProjects: number
  totalOriginalBudget: number
  totalRevisedBudget: number
  totalActualCost: number
  totalCommittedCost: number
  totalEarnedRevenue: number
  totalEAC: number
  totalETC: number
  overallCPI: number
  overallSPI: number
}

interface ForecastProject {
  budgetId: string
  projectId: string
  projectName: string
  projectCode: string
  projectProgress: number
  budgetStatus: string
  originalBudget: number
  revisedBudget: number
  actualCost: number
  committedCost: number
  earnedRevenue: number
  billedRevenue: number
  estimateAtCompletion: number
  estimateToComplete: number
  cpi: number
  spi: number
  costVariance: number
  costVariancePercent: number
  scheduleVariance: number
  scheduleVariancePercent: number
  atCompletionVariance: number
  toCompleteIndex: number
  lineItems: Array<{
    id: string
    costCode: { id: string; code: string; name: string; level: number }
    originalBudget: number
    revisedBudget: number
    actualCost: number
    committedCost: number
    percentComplete: number
    earnedRevenue: number
    forecastToComplete: number
    eac: number
    cpi: number | null
    variance: number
  }>
}

interface Snapshot {
  id: string
  name: string
  snapshotType: string
  totalBudget: number
  totalActual: number
  totalCommitted: number
  totalForecast: number
  totalEarned: number
  totalBilled: number
  createdAt: string
}

export function CostForecasting() {
  const queryClient = useQueryClient()
  const { pageParams } = useAppStore()
  const [expandedProject, setExpandedProject] = useState<string | null>(null)
  const [selectedBudgetForSnap, setSelectedBudgetForSnap] = useState('')

  const { data: forecastData, isLoading } = useQuery({
    queryKey: ['cost-forecast'],
    queryFn: () => api.get<{ summary: ForecastSummary; projects: ForecastProject[] }>('/api/cost-control/forecast').then(r => r.data),
  })

  // ট্রেন্ড চার্টের জন্য স্ন্যাপশট আনা
  const { data: snapshots = [] } = useQuery({
    queryKey: ['forecast-snapshots', selectedBudgetForSnap],
    queryFn: () => api.get<Snapshot[]>(`/api/cost-control/budgets/${selectedBudgetForSnap}/snapshots`).then(r => r.data || []),
    enabled: !!selectedBudgetForSnap,
  })

  // স্ন্যাপশট তৈরি মিউটেশন
  const createSnapMutation = useMutation({
    mutationFn: (body: any) => api.post(`/api/cost-control/budgets/${selectedBudgetForSnap}/snapshots`, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['forecast-snapshots'] }),
  })

  const summary = forecastData?.summary
  const projects = forecastData?.projects || []

  if (isLoading || !forecastData) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  // স্ন্যাপশট থেকে ট্রেন্ড চার্ট তথ্য
  const trendData = snapshots.map(s => ({
    date: format(new Date(s.createdAt), 'MMM d'),
    budget: s.totalBudget,
    actual: s.totalActual,
    forecast: s.totalForecast,
    earned: s.totalEarned,
  }))

  const budgetStatusColor: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
    locked: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    closed: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  }

  return (
    <div className="p-6 space-y-6">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cost Forecasting</h1>
          <p className="text-muted-foreground text-sm mt-1">EAC, ETC, CPI, SPI analysis and variance tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedBudgetForSnap || '_none'} onValueChange={v => setSelectedBudgetForSnap(v === '_none' ? '' : v)}>
            <SelectTrigger className="w-48 h-9 text-sm">
              <SelectValue placeholder="Select project for trend..." />
            </SelectTrigger>
            <SelectContent>
              {projects.map(p => (
                <SelectItem key={p.budgetId} value={p.budgetId}>{p.projectCode} — {p.projectName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedBudgetForSnap && (
            <Button variant="outline" size="sm" className="h-9" onClick={() => createSnapMutation.mutate({ name: `Manual ${format(new Date(), 'MMM d, yyyy')}`, snapshotType: 'custom' })} disabled={createSnapMutation.isPending}>
              <Camera className="h-3.5 w-3.5 mr-1" /> Take Snapshot
            </Button>
          )}
        </div>
      </div>

      {/* সারসংক্ষেপ KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Overall CPI</p>
                <p className={cn('text-2xl font-bold', summary!.overallCPI >= 1 ? 'text-emerald-600' : 'text-red-600')}>
                  {summary!.overallCPI.toFixed(3)}
                </p>
                <p className="text-xs text-muted-foreground">{summary!.overallCPI >= 1 ? 'Under budget' : 'Over budget'}</p>
              </div>
              <div className={cn('p-2.5 rounded-lg', summary!.overallCPI >= 1 ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-red-50 dark:bg-red-950/30')}>
                {summary!.overallCPI >= 1 ? <TrendingUp className="h-5 w-5 text-emerald-600" /> : <TrendingDown className="h-5 w-5 text-red-600" />}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Overall SPI</p>
                <p className={cn('text-2xl font-bold', summary!.overallSPI >= 1 ? 'text-emerald-600' : 'text-red-600')}>
                  {summary!.overallSPI.toFixed(3)}
                </p>
                <p className="text-xs text-muted-foreground">{summary!.overallSPI >= 1 ? 'On schedule' : 'Behind schedule'}</p>
              </div>
              <div className={cn('p-2.5 rounded-lg', summary!.overallSPI >= 1 ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-red-50 dark:bg-red-950/30')}>
                {summary!.overallSPI >= 1 ? <Target className="h-5 w-5 text-emerald-600" /> : <AlertTriangle className="h-5 w-5 text-red-600" />}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Est. at Completion</p>
                <p className="text-2xl font-bold">{formatCurrency(summary!.totalEAC)}</p>
                <p className="text-xs text-muted-foreground">vs {formatCurrency(summary!.totalRevisedBudget)} budget</p>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                <DollarSign className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Est. to Complete</p>
                <p className="text-2xl font-bold">{formatCurrency(summary!.totalETC)}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(summary!.totalActualCost)} spent so far</p>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* বাজেট ট্রেন্ড চার্ট */}
      {selectedBudgetForSnap && trendData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Budget Trend</CardTitle>
            <CardDescription className="text-xs">Historical snapshot data over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v)} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="budget" name="Budget" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="actual" name="Actual" stroke="#b45309" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="forecast" name="Forecast (EAC)" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="earned" name="Earned" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* তারতম্য বার চার্ট */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Budget vs Actual vs EAC by Project</CardTitle>
          <CardDescription className="text-xs">Cost performance comparison across projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projects} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="projectCode" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => {
                    const item = projects.find(p => p.projectCode === label)
                    return item?.projectName || label
                  }}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="revisedBudget" name="Budget" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actualCost" name="Actual" fill="#b45309" radius={[4, 4, 0, 0]} />
                <Bar dataKey="estimateAtCompletion" name="EAC" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* প্রকল্প-স্তরের পূর্বাভাস টেবিল */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Project Forecast Summary</CardTitle>
          <CardDescription className="text-xs">CPI, SPI, EAC, and variance analysis per project</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-8"></TableHead>
                  <TableHead className="text-xs">Project</TableHead>
                  <TableHead className="text-xs text-right">Budget</TableHead>
                  <TableHead className="text-xs text-right">Actual</TableHead>
                  <TableHead className="text-xs text-center">CPI</TableHead>
                  <TableHead className="text-xs text-center">SPI</TableHead>
                  <TableHead className="text-xs text-right">EAC</TableHead>
                  <TableHead className="text-xs text-right">ETC</TableHead>
                  <TableHead className="text-xs text-right">Cost Var %</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map(p => (
                  <>
                    <TableRow key={p.budgetId} className={cn('cursor-pointer', expandedProject === p.budgetId && 'bg-muted/50')}>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setExpandedProject(expandedProject === p.budgetId ? null : p.budgetId)}>
                          {expandedProject === p.budgetId ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{p.projectName}</p>
                          <p className="text-xs text-muted-foreground">{p.projectCode} &middot; {p.projectProgress}% complete</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-right">{formatCurrency(p.revisedBudget)}</TableCell>
                      <TableCell className="text-xs font-mono text-right">{formatCurrency(p.actualCost)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className={cn('text-[10px] px-1.5 py-0 font-mono', p.cpi >= 0.95 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300')}>
                          {p.cpi.toFixed(3)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className={cn('text-[10px] px-1.5 py-0 font-mono', p.spi >= 0.95 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300')}>
                          {p.spi.toFixed(3)}
                        </Badge>
                      </TableCell>
                      <TableCell className={cn('text-xs font-mono text-right', p.estimateAtCompletion > p.revisedBudget ? 'text-red-600' : '')}>
                        {formatCurrency(p.estimateAtCompletion)}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-right">{formatCurrency(p.estimateToComplete)}</TableCell>
                      <TableCell className={cn('text-xs font-mono text-right', p.costVariancePercent < -5 ? 'text-red-600' : p.costVariancePercent < 0 ? 'text-amber-600' : 'text-emerald-600')}>
                        {p.costVariancePercent >= 0 ? '+' : ''}{p.costVariancePercent.toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn('text-[10px] px-1.5 py-0', budgetStatusColor[p.budgetStatus] || '')}>
                          {p.budgetStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    {/* প্রসারিত লাইন আইটেম */}
                    {expandedProject === p.budgetId && (
                      <TableRow key={`${p.budgetId}-detail`}>
                        <TableCell colSpan={10} className="bg-muted/20 p-0">
                          <div className="p-4 border-t">
                            <h4 className="text-xs font-semibold mb-3">Line Item Forecast — {p.projectName}</h4>
                            <div className="rounded-lg border overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="text-xs">Cost Code</TableHead>
                                    <TableHead className="text-xs text-right">Budget</TableHead>
                                    <TableHead className="text-xs text-right">Actual</TableHead>
                                    <TableHead className="text-xs text-right">Variance</TableHead>
                                    <TableHead className="text-xs">Progress</TableHead>
                                    <TableHead className="text-xs text-center">CPI</TableHead>
                                    <TableHead className="text-xs text-right">EAC</TableHead>
                                    <TableHead className="text-xs text-right">Earned</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {p.lineItems.map(li => (
                                    <TableRow key={li.id}>
                                      <TableCell>
                                        <p className="text-xs font-mono">{li.costCode.code}</p>
                                        <p className="text-[11px] text-muted-foreground">{li.costCode.name}</p>
                                      </TableCell>
                                      <TableCell className="text-xs font-mono text-right">{formatCurrency(li.revisedBudget)}</TableCell>
                                      <TableCell className="text-xs font-mono text-right">{formatCurrency(li.actualCost)}</TableCell>
                                      <TableCell className={cn('text-xs font-mono text-right', li.variance < 0 ? 'text-red-600' : 'text-emerald-600')}>
                                        {li.variance >= 0 ? '+' : ''}{formatCurrency(li.variance)}
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-2 w-20">
                                          <Progress value={li.percentComplete} className="h-1.5" />
                                          <span className="text-[10px] w-8 text-right">{li.percentComplete.toFixed(0)}%</span>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-center">
                                        {li.cpi !== null ? (
                                          <Badge variant="secondary" className={cn('text-[10px] px-1 py-0 font-mono', li.cpi >= 0.95 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300')}>
                                            {li.cpi.toFixed(2)}
                                          </Badge>
                                        ) : <span className="text-[10px] text-muted-foreground">—</span>}
                                      </TableCell>
                                      <TableCell className={cn('text-xs font-mono text-right', li.eac > li.revisedBudget ? 'text-red-600' : '')}>
                                        {formatCurrency(li.eac)}
                                      </TableCell>
                                      <TableCell className="text-xs font-mono text-right">{formatCurrency(li.earnedRevenue)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}