'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent,
} from '@/components/ui/chart'
import { Line, LineChart, XAxis, YAxis, Bar, BarChart, CartesianGrid, Area, AreaChart } from 'recharts'
import {
  Zap, Users, Package, DollarSign, Clock, AlertTriangle,
  TrendingUp, TrendingDown, Info, ChevronRight, Brain
} from 'lucide-react'

const labourChartConfig = {
  predicted: { label: 'Predicted Workers', color: 'hsl(270, 70%, 55%)' },
  lower: { label: 'Lower Bound', color: 'hsl(270, 70%, 80%)' },
  upper: { label: 'Upper Bound', color: 'hsl(270, 70%, 35%)' },
  totalWorkers: { label: 'Actual Workers', color: 'hsl(142, 71%, 45%)' },
  totalHours: { label: 'Total Hours', color: 'hsl(25, 95%, 53%)' },
}

const costChartConfig = {
  expenses: { label: 'Expenses', color: 'hsl(25, 95%, 53%)' },
  invoiced: { label: 'Revenue', color: 'hsl(270, 70%, 55%)' },
  predicted: { label: 'Predicted', color: 'hsl(270, 70%, 55%)' },
  lower: { label: 'Lower', color: 'hsl(270, 70%, 80%)' },
  upper: { label: 'Upper', color: 'hsl(270, 70%, 35%)' },
}

const utilizationConfig = {
  utilization: { label: 'Utilization %', color: 'hsl(270, 70%, 55%)' },
}

function ConfidenceBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-24 shrink-0">{label}</span>
      <div className="flex-1">
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${value > 0.8 ? 'bg-emerald-500' : value > 0.6 ? 'bg-amber-500' : 'bg-red-500'}`}
            style={{ width: `${Math.round(value * 100)}%` }}
          />
        </div>
      </div>
      <span className="text-xs font-semibold w-10 text-right">{Math.round(value * 100)}%</span>
    </div>
  )
}

function RecommendationCard({ text, icon: Icon }: { text: string; icon?: React.ElementType }) {
  const El = icon || Info
  return (
    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100/50 dark:border-purple-900/30">
      <El className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
      <p className="text-xs text-foreground leading-relaxed">{text}</p>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ElementType; color: string }) {
  return (
    <Card className="border-purple-200/50 dark:border-purple-800/30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
      <CardContent className="p-3 flex items-center gap-3">
        <div className={`p-1.5 rounded-lg ${color}`}><Icon className="h-3.5 w-3.5 text-white" /></div>
        <div>
          <p className="text-[11px] text-muted-foreground">{label}</p>
          <p className="text-sm font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function AIForecast() {
  const [activeTab, setActiveTab] = useState('labour')

  const { data, isLoading } = useQuery({
    queryKey: ['ai-forecast'],
    queryFn: () => api.get('/api/ai/forecast?type=all'),
    refetchInterval: 60000,
  })

  const forecastData = data?.data || {}

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3"><Skeleton className="h-20 rounded-lg" /><Skeleton className="h-20 rounded-lg" /><Skeleton className="h-20 rounded-lg" /><Skeleton className="h-20 rounded-lg" /></div>
        <Skeleton className="h-72 rounded-lg" />
      </div>
    )
  }

  const labour = forecastData.labour as any
  const resources = forecastData.resources as any
  const cost = forecastData.cost as any
  const schedule = forecastData.schedule as any

  return (
    <div className="p-6 space-y-6">
      {/* হেডার */}
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-violet-600">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">AI Forecasting</h1>
          <p className="text-sm text-muted-foreground">Predictive analytics for labour, resources, costs & schedule</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="labour" className="gap-1.5 text-xs"><Users className="h-3.5 w-3.5" /> Labour</TabsTrigger>
          <TabsTrigger value="resources" className="gap-1.5 text-xs"><Package className="h-3.5 w-3.5" /> Resources</TabsTrigger>
          <TabsTrigger value="cost" className="gap-1.5 text-xs"><DollarSign className="h-3.5 w-3.5" /> Cost</TabsTrigger>
          <TabsTrigger value="schedule" className="gap-1.5 text-xs"><Clock className="h-3.5 w-3.5" /> Schedule</TabsTrigger>
        </TabsList>

        {/* শ্রম ট্যাব */}
        <TabsContent value="labour" className="space-y-4">
          {labour && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard label="Current Workforce" value={`${labour.currentWorkforce} workers/mo`} icon={Users} color="bg-gradient-to-br from-purple-500 to-violet-500" />
                <StatCard label="Active Projects" value={`${labour.activeProjects}`} icon={TrendingUp} color="bg-gradient-to-br from-blue-500 to-indigo-500" />
                <StatCard label="Planned Projects" value={`${labour.plannedProjects}`} icon={Brain} color="bg-gradient-to-br from-cyan-500 to-teal-500" />
                <StatCard label="Forecast Confidence" value={`${Math.round((labour.confidence || 0) * 100)}%`} icon={Zap} color="bg-gradient-to-br from-emerald-500 to-green-500" />
              </div>

              <Card className="border-purple-200/50 dark:border-purple-800/30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Workforce Forecast (Next 3 Months)</CardTitle>
                  <CardDescription>Predicted worker requirements with confidence bounds</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={labourChartConfig} className="h-72 w-full">
                    <AreaChart data={labour.forecast || []} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Area type="monotone" dataKey="upper" stroke="hsl(270, 70%, 35%)" fill="hsl(270, 70%, 95%)" fillOpacity={0.3} strokeDasharray="4 4" name="upper" />
                      <Area type="monotone" dataKey="predicted" stroke="hsl(270, 70%, 55%)" fill="hsl(270, 70%, 55%)" fillOpacity={0.15} strokeWidth={2} name="predicted" />
                      <Area type="monotone" dataKey="lower" stroke="hsl(270, 70%, 80%)" fill="transparent" strokeDasharray="4 4" name="lower" />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {labour.recommendations?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5"><Brain className="h-4 w-4 text-purple-500" /> AI Recommendations</h3>
                  {labour.recommendations.map((r: string, i: number) => (
                    <RecommendationCard key={i} text={r} icon={Users} />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* সম্পদ ট্যাব */}
        <TabsContent value="resources" className="space-y-4">
          {resources && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard label="Total Assignments" value={`${resources.totalAssignments}`} icon={Package} color="bg-gradient-to-br from-purple-500 to-violet-500" />
                <StatCard label="Under-Utilized" value={`${resources.underUtilized?.length || 0} crews`} icon={TrendingDown} color="bg-gradient-to-br from-amber-500 to-orange-500" />
                <StatCard label="Over-Utilized" value={`${resources.overUtilized?.length || 0} crews`} icon={AlertTriangle} color="bg-gradient-to-br from-red-500 to-rose-500" />
                <StatCard label="Confidence" value={`${Math.round((resources.confidence || 0) * 100)}%`} icon={Zap} color="bg-gradient-to-br from-emerald-500 to-green-500" />
              </div>

              <Card className="border-purple-200/50 dark:border-purple-800/30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Crew Utilization</CardTitle>
                  <CardDescription>Utilization rates across all crews</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={utilizationConfig} className="h-64 w-full">
                    <BarChart data={resources.crews?.slice(0, 10) || []} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="utilization" fill="hsl(270, 70%, 55%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {resources.underUtilized?.length > 0 && (
                  <Card className="border-amber-200/50 dark:border-amber-800/30">
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1.5"><TrendingDown className="h-4 w-4 text-amber-500" /> Under-Utilized Crews</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {resources.underUtilized.map((c: any) => (
                        <div key={c.id} className="flex items-center justify-between p-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/20">
                          <span className="text-sm">{c.name}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={c.utilization} className="w-16 h-1.5" />
                            <span className="text-xs font-medium text-amber-600">{c.utilization}%</span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
                {resources.overUtilized?.length > 0 && (
                  <Card className="border-red-200/50 dark:border-red-800/30">
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1.5"><AlertTriangle className="h-4 w-4 text-red-500" /> Over-Utilized Crews</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {resources.overUtilized.map((c: any) => (
                        <div key={c.id} className="flex items-center justify-between p-2 rounded-lg bg-red-50/50 dark:bg-red-950/20">
                          <span className="text-sm">{c.name}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={c.utilization} className="w-16 h-1.5" />
                            <span className="text-xs font-medium text-red-600">{c.utilization}%</span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>

              {resources.recommendations?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5"><Brain className="h-4 w-4 text-purple-500" /> AI Recommendations</h3>
                  {resources.recommendations.map((r: string, i: number) => (
                    <RecommendationCard key={i} text={r} icon={Package} />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* খরচ ট্যাব */}
        <TabsContent value="cost" className="space-y-4">
          {cost && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard label="Anomalies" value={`${cost.anomalies?.length || 0}`} icon={AlertTriangle} color="bg-gradient-to-br from-red-500 to-rose-500" />
                <StatCard label="Budgets at Risk" value={`${cost.budgetHealth?.filter((b: any) => b.atRisk).length || 0}`} icon={DollarSign} color="bg-gradient-to-br from-amber-500 to-orange-500" />
                <StatCard label="Forecast Confidence" value={`${Math.round((cost.confidence || 0) * 100)}%`} icon={Zap} color="bg-gradient-to-br from-emerald-500 to-green-500" />
              </div>

              <Card className="border-purple-200/50 dark:border-purple-800/30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Cost Trend & Forecast</CardTitle>
                  <CardDescription>Historical expenses and 3-month cost forecast with bounds</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={costChartConfig} className="h-72 w-full">
                    <LineChart data={[...(cost.trend || []), ...(cost.forecast || [])]} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v >= 100000 ? `${(v / 100000).toFixed(0)}L` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Line type="monotone" dataKey="expenses" stroke="hsl(25, 95%, 53%)" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="predicted" stroke="hsl(270, 70%, 55%)" strokeWidth={2} strokeDasharray="6 3" dot={false} />
                      <Line type="monotone" dataKey="upper" stroke="hsl(270, 70%, 35%)" strokeWidth={1} strokeDasharray="3 3" dot={false} />
                      <Line type="monotone" dataKey="lower" stroke="hsl(270, 70%, 80%)" strokeWidth={1} strokeDasharray="3 3" dot={false} />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {cost.anomalies?.length > 0 && (
                <Card className="border-red-200/50 dark:border-red-800/30">
                  <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1.5"><AlertTriangle className="h-4 w-4 text-red-500" /> Cost Anomalies Detected</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {cost.anomalies.map((a: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-red-50/50 dark:bg-red-950/20">
                        <div>
                          <p className="text-sm font-medium">{a.category}</p>
                          <p className="text-xs text-muted-foreground">Current: ₹{(a.currentMonth / 1000).toFixed(0)}K vs Avg: ₹{(a.avgMonth / 1000).toFixed(0)}K</p>
                        </div>
                        <Badge className={a.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}>
                          {a.deviation > 0 ? '+' : ''}{a.deviation}%
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {cost.recommendations?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5"><Brain className="h-4 w-4 text-purple-500" /> AI Recommendations</h3>
                  {cost.recommendations.map((r: string, i: number) => (
                    <RecommendationCard key={i} text={r} icon={DollarSign} />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* সময়সূচি ট্যাব */}
        <TabsContent value="schedule" className="space-y-4">
          {schedule && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard label="Overdue Tasks" value={`${schedule.totalOverdue || 0}`} icon={AlertTriangle} color="bg-gradient-to-br from-red-500 to-rose-500" />
                <StatCard label="At-Risk Tasks" value={`${schedule.totalAtRisk || 0}`} icon={Clock} color="bg-gradient-to-br from-amber-500 to-orange-500" />
                <StatCard label="Risk Level" value={schedule.riskLevel || 'info'} icon={AlertTriangle} color="bg-gradient-to-br from-purple-500 to-violet-500" />
                <StatCard label="Confidence" value={`${Math.round((schedule.confidence || 0) * 100)}%`} icon={Zap} color="bg-gradient-to-br from-emerald-500 to-green-500" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {(schedule.overdueTasks?.length > 0) && (
                  <Card className="border-red-200/50 dark:border-red-800/30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1.5"><AlertTriangle className="h-4 w-4 text-red-500" /> Overdue Tasks</CardTitle></CardHeader>
                    <CardContent>
                      <div className="max-h-64 overflow-y-auto space-y-1.5">
                        {schedule.overdueTasks.slice(0, 10).map((t: any) => (
                          <div key={t.id} className="flex items-center gap-2 p-2 rounded-lg bg-red-50/50 dark:bg-red-950/20">
                            <ChevronRight className="h-3 w-3 text-red-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{t.title}</p>
                              <p className="text-[11px] text-muted-foreground">{t.project?.name} • Due: {t.endDate ? new Date(t.endDate).toLocaleDateString() : 'N/A'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                {(schedule.atRiskTasks?.length > 0) && (
                  <Card className="border-amber-200/50 dark:border-amber-800/30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1.5"><Clock className="h-4 w-4 text-amber-500" /> At-Risk Tasks (Due in 14 days)</CardTitle></CardHeader>
                    <CardContent>
                      <div className="max-h-64 overflow-y-auto space-y-1.5">
                        {schedule.atRiskTasks.slice(0, 10).map((t: any) => (
                          <div key={t.id} className="flex items-center gap-2 p-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/20">
                            <ChevronRight className="h-3 w-3 text-amber-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{t.title}</p>
                              <p className="text-[11px] text-muted-foreground">{t.project?.name} • Due: {t.endDate ? new Date(t.endDate).toLocaleDateString() : 'N/A'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {schedule.overdueMilestones?.length > 0 && (
                <Card className="border-red-200/50 dark:border-red-800/30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                  <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1.5"><AlertTriangle className="h-4 w-4 text-red-500" /> Overdue Milestones</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {schedule.overdueMilestones.map((m: any) => (
                      <div key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-red-50/50 dark:bg-red-950/20">
                        <div>
                          <p className="text-sm font-medium">{m.name}</p>
                          <p className="text-xs text-muted-foreground">{m.project?.name}</p>
                        </div>
                        <Badge className="bg-red-100 text-red-700">Due: {m.dueDate ? new Date(m.dueDate).toLocaleDateString() : 'N/A'}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {schedule.recommendations?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5"><Brain className="h-4 w-4 text-purple-500" /> AI Recommendations</h3>
                  {schedule.recommendations.map((r: string, i: number) => (
                    <RecommendationCard key={i} text={r} icon={Clock} />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}