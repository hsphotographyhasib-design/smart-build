'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent,
} from '@/components/ui/chart'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, RadialBarChart, RadialBar } from 'recharts'
import {
  Eye, DollarSign, Clock, Users, Target, AlertTriangle,
  TrendingUp, TrendingDown, Heart, BarChart3
} from 'lucide-react'

const budgetConfig = {
  totalBudget: { label: 'Budget', color: 'hsl(270, 70%, 55%)' },
  totalActual: { label: 'Actual', color: 'hsl(25, 95%, 53%)' },
  totalCommitted: { label: 'Committed', color: 'hsl(200, 70%, 50%)' },
}

const PIE_COLORS = ['hsl(270, 70%, 55%)', 'hsl(25, 95%, 53%)', 'hsl(142, 71%, 45%)', 'hsl(200, 70%, 50%)', 'hsl(340, 70%, 55%)', 'hsl(45, 95%, 53%)', 'hsl(180, 70%, 45%)', 'hsl(300, 60%, 50%)']

function formatCurrency(val: number) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`
  return `₹${val.toLocaleString()}`
}

function HealthGauge({ value, label }: { value: number; label: string }) {
  const color = value >= 80 ? 'hsl(142, 71%, 45%)' : value >= 60 ? 'hsl(45, 95%, 53%)' : value >= 40 ? 'hsl(25, 95%, 53%)' : 'hsl(0, 84%, 60%)'
  const gaugeData = [{ name: label, value, fill: color }]
  const gaugeConfig = { value: { label, color } }

  return (
    <Card className="border-purple-200/50 dark:border-purple-800/30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
      <CardHeader className="pb-0 text-center">
        <CardTitle className="text-sm">Financial Health Score</CardTitle>
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center pb-4">
        <ChartContainer config={gaugeConfig} className="h-36 w-36">
          <RadialBarChart data={gaugeData} startAngle={180} endAngle={0} innerRadius="70%" outerRadius="100%">
            <RadialBar dataKey="value" cornerRadius={10} />
          </RadialBarChart>
        </ChartContainer>
        <p className="text-3xl font-bold" style={{ color }}>{value}</p>
        <p className="text-xs text-muted-foreground">out of 100</p>
      </CardContent>
    </Card>
  )
}

function MetricCard({ label, value, sub, icon: Icon, color }: { label: string; value: string; sub?: string; icon: React.ElementType; color: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-purple-100/50 dark:border-purple-900/30">
      <div className={`p-2 rounded-lg ${color}`}><Icon className="h-4 w-4 text-white" /></div>
      <div>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm font-bold">{value}</p>
        {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
      </div>
    </div>
  )
}

export function ProjectAnalytics() {
  const [selectedProject, setSelectedProject] = useState('')

  const { data: projectsData } = useQuery({
    queryKey: ['projects-analytics-list'],
    queryFn: () => api.get('/api/projects?limit=100'),
  })

  const projects = projectsData?.data?.projects || []
  const activeProject = selectedProject || projects[0]?.id || ''

  const { data, isLoading } = useQuery({
    queryKey: ['project-analytics', activeProject],
    queryFn: () => api.get(`/api/analytics/project/${activeProject}`),
    enabled: !!activeProject,
  })

  const analytics = data?.data
  const proj = analytics?.project
  const budget = analytics?.budgetVsActual
  const costBreakdown = analytics?.costBreakdown || []
  const budgetByCode = analytics?.budgetByCode || []
  const timeline = analytics?.timelinePerformance
  const resources = analytics?.resourceUtilization
  const financial = analytics?.financialHealth
  const risks = analytics?.risks || []

  return (
    <div className="p-6 space-y-6">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-violet-600">
            <Eye className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Project Deep Analytics</h1>
            <p className="text-sm text-muted-foreground">Comprehensive project performance analysis</p>
          </div>
        </div>
        <div className="w-72">
          <Select value={activeProject} onValueChange={setSelectedProject}>
            <SelectTrigger><SelectValue placeholder="Select project..." /></SelectTrigger>
            <SelectContent>
              {projects.map((p: any) => (
                <SelectItem key={p.id} value={p.id}>{p.code} - {p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!activeProject ? (
        <Card className="py-16 text-center border-purple-200/50 dark:border-purple-800/30">
          <CardContent>
            <Eye className="h-12 w-12 text-purple-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold">Select a Project</h3>
            <p className="text-sm text-muted-foreground mt-1">Choose a project from the dropdown to view deep analytics</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}</div>
          <Skeleton className="h-80 rounded-lg" />
        </div>
      ) : (
        <>
          {/* প্রকল্পের শিরোনাম */}
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-semibold">{proj?.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline">{proj?.code}</Badge>
                <Badge variant="outline">{proj?.status}</Badge>
                <span className="text-xs text-muted-foreground">Progress: {proj?.progress}%</span>
              </div>
            </div>
          </div>

          <Tabs defaultValue="financial" className="space-y-4">
            <TabsList>
              <TabsTrigger value="financial" className="gap-1.5 text-xs"><DollarSign className="h-3.5 w-3.5" /> Financial</TabsTrigger>
              <TabsTrigger value="timeline" className="gap-1.5 text-xs"><Clock className="h-3.5 w-3.5" /> Timeline</TabsTrigger>
              <TabsTrigger value="resources" className="gap-1.5 text-xs"><Users className="h-3.5 w-3.5" /> Resources</TabsTrigger>
              <TabsTrigger value="risks" className="gap-1.5 text-xs"><AlertTriangle className="h-3.5 w-3.5" /> Risks</TabsTrigger>
            </TabsList>

            {/* আর্থিক ট্যাব */}
            <TabsContent value="financial" className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <MetricCard label="Total Budget" value={formatCurrency(budget?.totalBudget || 0)} sub={`Revised: ${formatCurrency(budget?.revisedBudget || 0)}`} icon={DollarSign} color="bg-gradient-to-br from-purple-500 to-violet-500" />
                <MetricCard label="Actual Spent" value={formatCurrency(budget?.totalActual || 0)} sub={`Committed: ${formatCurrency(budget?.totalCommitted || 0)}`} icon={TrendingDown} color="bg-gradient-to-br from-amber-500 to-orange-500" />
                <MetricCard label="Variance" value={formatCurrency(budget?.variance || 0)} sub={`${budget?.variancePercent}% variance`} icon={Target} color={budget?.variance >= 0 ? 'bg-gradient-to-br from-emerald-500 to-green-500' : 'bg-gradient-to-br from-red-500 to-rose-500'} />
                <MetricCard label="Burn Rate" value={`${budget?.burnRate || 0}%`} sub="Budget consumed" icon={BarChart3} color="bg-gradient-to-br from-cyan-500 to-teal-500" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* বাজেট বনাম প্রকৃত */}
                <Card className="lg:col-span-2 border-purple-200/50 dark:border-purple-800/30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Budget vs Actual by Cost Code</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={budgetConfig} className="h-64 w-full">
                      <BarChart data={budgetByCode.slice(0, 8)} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="code" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v >= 100000 ? `${(v / 100000).toFixed(0)}L` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="totalBudget" fill="hsl(270, 70%, 55%)" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="actual" fill="hsl(25, 95%, 53%)" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* স্বাস্থ্য গেজ */}
                <HealthGauge value={financial?.healthScore || 0} label={financial?.healthLabel || 'N/A'} />
              </div>

              {/* খরচ বিশ্লেষণ পাই */}
              {costBreakdown.length > 0 && (
                <Card className="border-purple-200/50 dark:border-purple-800/30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                  <CardHeader className="pb-2"><CardTitle className="text-base">Cost Breakdown by Category</CardTitle></CardHeader>
                  <CardContent>
                    <ChartContainer config={{}} className="h-64 w-full">
                      <PieChart>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Pie data={costBreakdown} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`} labelLine={false}>
                          {costBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              )}

              {/* আর্থিক সারসংক্ষেপ */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <MetricCard label="Total Invoiced" value={formatCurrency(financial?.totalInvoiced || 0)} icon={DollarSign} color="bg-gradient-to-br from-purple-500 to-violet-500" />
                <MetricCard label="Collected" value={formatCurrency(financial?.totalCollected || 0)} sub={`Collection rate: ${financial?.collectionRate || 0}%`} icon={TrendingUp} color="bg-gradient-to-br from-emerald-500 to-green-500" />
                <MetricCard label="Gross Margin" value={`${financial?.margin || 0}%`} sub={`Gross profit: ${formatCurrency(financial?.grossProfit || 0)}`} icon={Target} color={financial?.margin >= 15 ? 'bg-gradient-to-br from-emerald-500 to-green-500' : 'bg-gradient-to-br from-amber-500 to-orange-500'} />
              </div>
            </TabsContent>

            {/* টাইমলাইন ট্যাব */}
            <TabsContent value="timeline" className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <MetricCard label="Total Tasks" value={`${timeline?.totalTasks || 0}`} sub={`${timeline?.completedTasks || 0} completed`} icon={BarChart3} color="bg-gradient-to-br from-purple-500 to-violet-500" />
                <MetricCard label="In Progress" value={`${timeline?.inProgressTasks || 0}`} icon={Clock} color="bg-gradient-to-br from-blue-500 to-indigo-500" />
                <MetricCard label="Overdue Tasks" value={`${timeline?.overdueTasks || 0}`} icon={AlertTriangle} color="bg-gradient-to-br from-red-500 to-rose-500" />
                <MetricCard label="On-Time Rate" value={`${timeline?.onTimeCompletionRate || 0}%`} icon={Target} color={timeline?.onTimeCompletionRate >= 80 ? 'bg-gradient-to-br from-emerald-500 to-green-500' : 'bg-gradient-to-br from-amber-500 to-orange-500'} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="border-purple-200/50 dark:border-purple-800/30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                  <CardHeader className="pb-2"><CardTitle className="text-base">Task Summary</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm"><span>Completed</span><span className="font-semibold text-emerald-600">{timeline?.completedTasks || 0}</span></div>
                    <Progress value={timeline?.totalTasks ? ((timeline?.completedTasks || 0) / timeline.totalTasks) * 100 : 0} className="h-2" />
                    <div className="flex items-center justify-between text-sm"><span>In Progress</span><span className="font-semibold text-blue-600">{timeline?.inProgressTasks || 0}</span></div>
                    <div className="flex items-center justify-between text-sm"><span>Overdue</span><span className="font-semibold text-red-600">{timeline?.overdueTasks || 0}</span></div>
                    <div className="flex items-center justify-between text-sm"><span>Days Since Start</span><span className="font-semibold">{timeline?.daysSinceStart || 0}</span></div>
                    <div className="flex items-center justify-between text-sm"><span>Days Remaining</span><span className="font-semibold">{timeline?.daysRemaining || 0}</span></div>
                  </CardContent>
                </Card>

                <Card className="border-purple-200/50 dark:border-purple-800/30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                  <CardHeader className="pb-2"><CardTitle className="text-base">Milestones</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm"><span>Total Milestones</span><span className="font-semibold">{timeline?.totalMilestones || 0}</span></div>
                    <div className="flex items-center justify-between text-sm"><span>Completed</span><span className="font-semibold text-emerald-600">{timeline?.completedMilestones || 0}</span></div>
                    <div className="flex items-center justify-between text-sm"><span>Overdue Milestones</span><span className="font-semibold text-red-600">{timeline?.overdueMilestones || 0}</span></div>
                    <Progress value={timeline?.totalMilestones ? ((timeline?.completedMilestones || 0) / timeline.totalMilestones) * 100 : 0} className="h-2" />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* সম্পদ ট্যাব */}
            <TabsContent value="resources" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <MetricCard label="Total Assignments" value={`${resources?.totalAssignments || 0}`} icon={Users} color="bg-gradient-to-br from-purple-500 to-violet-500" />
                <MetricCard label="Active Assignments" value={`${resources?.activeAssignments || 0}`} icon={TrendingUp} color="bg-gradient-to-br from-blue-500 to-indigo-500" />
                <MetricCard label="Avg Daily Labour" value={`${resources?.avgDailyLabour || 0} workers`} icon={Users} color="bg-gradient-to-br from-cyan-500 to-teal-500" />
              </div>
              <Card className="border-purple-200/50 dark:border-purple-800/30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium w-32">Utilization Rate</span>
                    <div className="flex-1">
                      <Progress value={resources?.utilizationRate || 0} className="h-3" />
                    </div>
                    <span className="text-sm font-bold w-12 text-right">{resources?.utilizationRate || 0}%</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ঝুঁকি ট্যাব */}
            <TabsContent value="risks" className="space-y-4">
              {risks.length === 0 ? (
                <Card className="py-12 text-center border-purple-200/50 dark:border-purple-800/30">
                  <CardContent>
                    <Heart className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold">No Risk Indicators</h3>
                    <p className="text-sm text-muted-foreground">This project is performing within healthy parameters</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {risks.map((risk: any, i: number) => (
                    <Card key={i} className={`border ${risk.severity === 'critical' ? 'border-red-200/50 dark:border-red-800/30 bg-red-50/50 dark:bg-red-950/20' : 'border-amber-200/50 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-950/20'}`}>
                      <CardContent className="p-4 flex items-start gap-3">
                        <AlertTriangle className={`h-5 w-5 mt-0.5 shrink-0 ${risk.severity === 'critical' ? 'text-red-500' : 'text-amber-500'}`} />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={risk.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}>
                              {risk.severity}
                            </Badge>
                            <Badge variant="outline">{risk.type}</Badge>
                          </div>
                          <p className="text-sm font-medium">{risk.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}