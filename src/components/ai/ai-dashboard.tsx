'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, useAppStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DollarSign, TrendingUp, TrendingDown, Activity, Users, Target,
  Brain, Sparkles, FileBarChart, AlertTriangle, Eye, ArrowRight, Zap
} from 'lucide-react'
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent,
} from '@/components/ui/chart'
import { Line, LineChart, XAxis, YAxis, Bar, BarChart, CartesianGrid } from 'recharts'

const kpiChartConfig = {
  revenue: { label: 'Revenue', color: 'hsl(270, 70%, 55%)' },
  expenses: { label: 'Expenses', color: 'hsl(25, 95%, 53%)' },
  profit: { label: 'Profit', color: 'hsl(142, 71%, 45%)' },
}

const barChartConfig = {
  revenue: { label: 'Revenue', color: 'hsl(270, 70%, 55%)' },
}

function formatCurrency(val: number) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`
  return `₹${val.toLocaleString()}`
}

function KPICard({ title, value, icon: Icon, trend, color, subtitle }: {
  title: string; value: string; icon: React.ElementType; trend?: string; color: string; subtitle?: string
}) {
  return (
    <Card className="relative overflow-hidden border-purple-200/50 dark:border-purple-800/30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-100/60 to-transparent dark:from-purple-900/20" />
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">{title}</p>
            <p className="text-lg font-bold truncate">{value}</p>
          </div>
          {trend && (
            <div className={`flex items-center gap-0.5 text-xs font-medium ${trend.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend.startsWith('+') ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend}
            </div>
          )}
        </div>
        {subtitle && <p className="text-[11px] text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}

function InsightBadge({ type, severity }: { type: string; severity: string }) {
  const colors: Record<string, string> = {
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  }
  const icons: Record<string, React.ElementType> = {
    cost_anomaly: DollarSign,
    schedule_risk: AlertTriangle,
    resource_optimization: Users,
    budget_forecast: Target,
    quality_alert: Eye,
    safety_risk: AlertTriangle,
  }
  const Icon = icons[type] || Sparkles
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${colors[severity] || colors.info}`}>
      <Icon className="h-3 w-3" />
      {type.replace(/_/g, ' ')}
    </span>
  )
}

export function AIDashboard() {
  const { navigate } = useAppStore()

  const { data, isLoading } = useQuery({
    queryKey: ['ai-dashboard'],
    queryFn: () => api.get('/api/analytics/dashboard'),
  })

  const { data: insightsData } = useQuery({
    queryKey: ['ai-insights-recent'],
    queryFn: () => api.get('/api/ai/insights?limit=5'),
  })

  const kpis = data?.data?.kpis
  const monthlyTrends = data?.data?.monthlyTrends || []
  const topProjects = data?.data?.topProjectsByRevenue || []
  const insights = insightsData?.data?.insights || []

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-28 rounded-lg" />)}
        </div>
        <Skeleton className="h-80 rounded-lg" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-violet-600">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AI Analytics Dashboard</h1>
              <p className="text-sm text-muted-foreground">Real-time intelligence & predictive insights</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300" onClick={() => navigate('ai-forecast')}>
            <Zap className="h-3.5 w-3.5" /> Run Forecast
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300" onClick={() => navigate('advanced-reports')}>
            <FileBarChart className="h-3.5 w-3.5" /> Generate Report
          </Button>
          <Button size="sm" className="gap-1.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700" onClick={() => navigate('ai-insights')}>
            <Sparkles className="h-3.5 w-3.5" /> View Insights
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard title="Total Revenue" value={formatCurrency(kpis?.totalRevenue || 0)} icon={DollarSign} color="bg-gradient-to-br from-purple-500 to-violet-500" subtitle={`${kpis?.collectedRevenue ? formatCurrency(kpis.collectedRevenue) + ' collected' : ''}`} />
        <KPICard title="Total Expenses" value={formatCurrency(kpis?.totalExpenses || 0)} icon={TrendingDown} color="bg-gradient-to-br from-amber-500 to-orange-500" />
        <KPICard title="Net Profit" value={formatCurrency(kpis?.netProfit || 0)} icon={TrendingUp} color="bg-gradient-to-br from-emerald-500 to-green-500" trend={kpis?.totalRevenue > 0 ? `+${Math.round((kpis?.netProfit / kpis?.totalRevenue) * 100)}%` : undefined} />
        <KPICard title="Active Projects" value={`${kpis?.activeProjects || 0}`} icon={Activity} color="bg-gradient-to-br from-blue-500 to-indigo-500" subtitle={`${kpis?.totalProjects || 0} total`} />
        <KPICard title="Utilization" value={`${kpis?.resourceUtilization || 0}%`} icon={Users} color="bg-gradient-to-br from-cyan-500 to-teal-500" subtitle="Resource utilization" />
        <KPICard title="Avg Margin" value={`${kpis?.avgMargin || 0}%`} icon={Target} color="bg-gradient-to-br from-pink-500 to-rose-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trends Chart */}
        <Card className="lg:col-span-2 border-purple-200/50 dark:border-purple-800/30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Monthly Revenue, Expenses & Profit</CardTitle>
            <CardDescription>Last 12 months trend analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={kpiChartConfig} className="h-72 w-full">
              <LineChart data={monthlyTrends} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v >= 100000 ? `${(v / 100000).toFixed(0)}L` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(270, 70%, 55%}" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="expenses" stroke="hsl(25, 95%, 53%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="profit" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* AI Insights Feed */}
        <Card className="border-purple-200/50 dark:border-purple-800/30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-500" /> AI Insights
              </CardTitle>
              <CardDescription>Recent AI-detected patterns</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-purple-600" onClick={() => navigate('ai-insights')}>
              View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-72">
              {insights.length === 0 ? (
                <div className="p-6 text-center">
                  <Brain className="h-8 w-8 text-purple-300 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No insights detected yet</p>
                  <p className="text-xs text-muted-foreground mt-1">AI will analyze patterns as data accumulates</p>
                </div>
              ) : (
                <div className="space-y-0.5 p-3">
                  {insights.map((insight: any) => (
                    <div key={insight.id} className="p-3 rounded-lg hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-colors cursor-pointer">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">
                          <InsightBadge type={insight.insightType} severity={insight.severity} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{insight.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{insight.description}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="flex items-center gap-1">
                              <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                                <div className="h-full rounded-full bg-purple-500" style={{ width: `${Math.round((insight.confidence || 0) * 100)}%` }} />
                              </div>
                              <span className="text-[10px] text-muted-foreground">{Math.round((insight.confidence || 0) * 100)}%</span>
                            </div>
                            {insight.project?.name && (
                              <span className="text-[10px] text-muted-foreground truncate">{insight.project.name}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Projects by Revenue */}
        <Card className="border-purple-200/50 dark:border-purple-800/30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Projects by Revenue</CardTitle>
            <CardDescription>Highest revenue-generating projects</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barChartConfig} className="h-64 w-full">
              <BarChart data={topProjects.slice(0, 8)} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => v >= 100000 ? `${(v / 100000).toFixed(0)}L` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={140} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="hsl(270, 70%, 55%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Risk Alerts & Budget Health */}
        <div className="space-y-4">
          <Card className="border-purple-200/50 dark:border-purple-800/30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Risk Alerts
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-purple-600" onClick={() => navigate('ai-forecast')}>
                Details <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/30">
                  <p className="text-2xl font-bold text-red-600">{kpis?.overdueTasks || 0}</p>
                  <p className="text-xs text-muted-foreground">Overdue Tasks</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30">
                  <p className="text-2xl font-bold text-amber-600">{kpis?.overdueMilestones || 0}</p>
                  <p className="text-xs text-muted-foreground">Overdue Milestones</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/30">
                  <p className="text-2xl font-bold text-purple-600">{kpis?.overBudgetCount || 0}</p>
                  <p className="text-xs text-muted-foreground">Over Budget</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30">
                  <p className="text-2xl font-bold text-emerald-600">{kpis?.underBudgetCount || 0}</p>
                  <p className="text-xs text-muted-foreground">Under Budget</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200/50 dark:border-purple-800/30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="justify-start gap-2 border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300" onClick={() => navigate('ai-insights')}>
                <Sparkles className="h-4 w-4" /> AI Insights
              </Button>
              <Button variant="outline" className="justify-start gap-2 border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300" onClick={() => navigate('ai-forecast')}>
                <Zap className="h-4 w-4" /> Forecasting
              </Button>
              <Button variant="outline" className="justify-start gap-2 border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300" onClick={() => navigate('project-analytics')}>
                <Eye className="h-4 w-4" /> Project Analytics
              </Button>
              <Button variant="outline" className="justify-start gap-2 border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300" onClick={() => navigate('advanced-reports')}>
                <FileBarChart className="h-4 w-4" /> Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}