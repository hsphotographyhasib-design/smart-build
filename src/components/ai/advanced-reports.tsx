'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent,
} from '@/components/ui/chart'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, Line, LineChart } from 'recharts'
import {
  FileBarChart, Download, Printer, DollarSign, Users, Target, Wallet,
  CalendarRange, ChevronDown, ChevronUp, FileSpreadsheet
} from 'lucide-react'

const PIE_COLORS = ['hsl(270, 70%, 55%)', 'hsl(25, 95%, 53%)', 'hsl(142, 71%, 45%)', 'hsl(200, 70%, 50%)', 'hsl(340, 70%, 55%)', 'hsl(45, 95%, 53%)', 'hsl(180, 70%, 45%)', 'hsl(300, 60%, 50%)']

const REPORT_TYPES = [
  { value: 'project-pl', label: 'Project P&L', icon: DollarSign, desc: 'Revenue, costs, margins per project' },
  { value: 'labour-summary', label: 'Labour Summary', icon: Users, desc: 'Attendance, costs, productivity by project' },
  { value: 'cost-variance', label: 'Cost Variance', icon: Target, desc: 'Budget vs actual by cost code' },
  { value: 'resource-utilization', label: 'Resource Utilization', icon: CalendarRange, desc: 'Resource usage stats across projects' },
  { value: 'financial-health', label: 'Financial Health', icon: Wallet, desc: 'Cash flow, receivables, payables' },
]

function formatCurrency(val: number) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`
  return `₹${val.toLocaleString()}`
}

function ExportButtons() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => window.print()}>
        <Printer className="h-3 w-3" /> Print
      </Button>
      <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => {
        const el = document.getElementById('report-content')
        if (el) {
          const text = el.innerText
          const blob = new Blob([text], { type: 'text/csv' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'report.csv'
          a.click()
          URL.revokeObjectURL(url)
        }
      }}>
        <Download className="h-3 w-3" /> Export CSV
      </Button>
    </div>
  )
}

export function AdvancedReports() {
  const [reportType, setReportType] = useState('project-pl')
  const [selectedProject, setSelectedProject] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const { data: projectsData } = useQuery({
    queryKey: ['reports-projects'],
    queryFn: () => api.get('/api/projects?limit=100'),
  })

  const projects = projectsData?.data?.projects || []

  const queryParams = new URLSearchParams()
  queryParams.set('type', reportType)
  if (selectedProject) queryParams.set('projectId', selectedProject)
  if (startDate) queryParams.set('startDate', startDate)
  if (endDate) queryParams.set('endDate', endDate)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['advanced-report', reportType, selectedProject, startDate, endDate],
    queryFn: () => api.get(`/api/analytics/reports?${queryParams.toString()}`),
    enabled: !!reportType,
  })

  const report = data?.data
  const reportInfo = REPORT_TYPES.find(r => r.value === reportType)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-violet-600">
            <FileBarChart className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Advanced Reports</h1>
            <p className="text-sm text-muted-foreground">Generate and analyze detailed business reports</p>
          </div>
        </div>
        {report && <ExportButtons />}
      </div>

      {/* Report Config */}
      <Card className="border-purple-200/50 dark:border-purple-800/30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[180px]">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map(r => (
                    <SelectItem key={r.value} value={r.value} className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <r.icon className="h-3.5 w-3.5" />
                        <span>{r.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Project</label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger><SelectValue placeholder="All Projects" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Projects</SelectItem>
                  {projects.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.code} - {p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[140px]">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Start Date</label>
              <input type="date" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="min-w-[140px]">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">End Date</label>
              <input type="date" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700" disabled={isFetching}>
              <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
              {isFetching ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <div id="report-content">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-80 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
          </div>
        ) : !report ? (
          <Card className="py-16 text-center border-purple-200/50 dark:border-purple-800/30">
            <CardContent>
              <FileBarChart className="h-12 w-12 text-purple-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold">Select a Report Type</h3>
              <p className="text-sm text-muted-foreground mt-1">Configure and generate a report to view results</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Report Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  {reportInfo && <reportInfo.icon className="h-5 w-5 text-purple-500" />}
                  {reportInfo?.label} Report
                </h2>
                <p className="text-xs text-muted-foreground">Generated: {report.generatedAt ? new Date(report.generatedAt).toLocaleString() : 'N/A'}</p>
              </div>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300">
                {report.projects?.length || 0} project(s)
              </Badge>
            </div>

            {/* Project P&L */}
            {reportType === 'project-pl' && report.projects && (
              <>
                {/* Totals Row */}
                {report.totals && (
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    <Card className="border-purple-200/50 dark:border-purple-800/30 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-950/20 dark:to-gray-900">
                      <CardContent className="p-3 text-center">
                        <p className="text-[11px] text-muted-foreground">Total Revenue</p>
                        <p className="text-lg font-bold text-purple-600">{formatCurrency(report.totals.revenue)}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-purple-200/50 dark:border-purple-800/30">
                      <CardContent className="p-3 text-center">
                        <p className="text-[11px] text-muted-foreground">Total Collected</p>
                        <p className="text-lg font-bold text-emerald-600">{formatCurrency(report.totals.collected)}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-purple-200/50 dark:border-purple-800/30">
                      <CardContent className="p-3 text-center">
                        <p className="text-[11px] text-muted-foreground">Total Costs</p>
                        <p className="text-lg font-bold text-amber-600">{formatCurrency(report.totals.totalCosts)}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-purple-200/50 dark:border-purple-800/30">
                      <CardContent className="p-3 text-center">
                        <p className="text-[11px] text-muted-foreground">Net Profit</p>
                        <p className={`text-lg font-bold ${report.totals.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(report.totals.netProfit)}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-purple-200/50 dark:border-purple-800/30">
                      <CardContent className="p-3 text-center">
                        <p className="text-[11px] text-muted-foreground">Margin</p>
                        <p className={`text-lg font-bold ${report.totals.margin >= 15 ? 'text-emerald-600' : 'text-amber-600'}`}>{report.totals.margin}%</p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <Card className="border-purple-200/50 dark:border-purple-800/30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                  <CardHeader className="pb-2"><CardTitle className="text-base">Revenue vs Costs by Project</CardTitle></CardHeader>
                  <CardContent>
                    <ChartContainer config={{ revenue: { label: 'Revenue', color: 'hsl(270, 70%, 55%)' }, totalCosts: { label: 'Costs', color: 'hsl(25, 95%, 53%)' }, netProfit: { label: 'Profit', color: 'hsl(142, 71%, 45%)' } }} className="h-64 w-full">
                      <BarChart data={report.projects} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="projectName" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v >= 100000 ? `${(v / 100000).toFixed(0)}L` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="revenue" fill="hsl(270, 70%, 55%)" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="totalCosts" fill="hsl(25, 95%, 53%)" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Table */}
                <Card className="border-purple-200/50 dark:border-purple-800/30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                  <CardContent className="p-0">
                    <div className="max-h-96 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Project</TableHead>
                            <TableHead className="text-right">Revenue</TableHead>
                            <TableHead className="text-right">Collected</TableHead>
                            <TableHead className="text-right">Costs</TableHead>
                            <TableHead className="text-right">Profit</TableHead>
                            <TableHead className="text-right">Margin</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {report.projects.map((p: any) => (
                            <TableRow key={p.projectId}>
                              <TableCell className="font-medium">{p.projectName}</TableCell>
                              <TableCell className="text-right">{formatCurrency(p.revenue)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(p.collected)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(p.totalCosts)}</TableCell>
                              <TableCell className={`text-right font-medium ${p.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(p.netProfit)}</TableCell>
                              <TableCell className="text-right">
                                <Badge variant={p.margin >= 15 ? 'default' : 'outline'} className={p.margin >= 15 ? 'bg-emerald-100 text-emerald-700' : p.margin >= 0 ? '' : 'bg-red-100 text-red-700'}>
                                  {p.margin}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Labour Summary */}
            {reportType === 'labour-summary' && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <Card className="border-purple-200/50 dark:border-purple-800/30"><CardContent className="p-3 text-center"><p className="text-[11px] text-muted-foreground">Total Records</p><p className="text-lg font-bold">{report.totalAttendance}</p></CardContent></Card>
                  <Card className="border-purple-200/50 dark:border-purple-800/30"><CardContent className="p-3 text-center"><p className="text-[11px] text-muted-foreground">Total Hours</p><p className="text-lg font-bold">{report.totalHours.toLocaleString()}</p></CardContent></Card>
                  <Card className="border-purple-200/50 dark:border-purple-800/30"><CardContent className="p-3 text-center"><p className="text-[11px] text-muted-foreground">Overtime Hours</p><p className="text-lg font-bold text-amber-600">{report.totalOvertime.toLocaleString()}</p></CardContent></Card>
                  <Card className="border-purple-200/50 dark:border-purple-800/30"><CardContent className="p-3 text-center"><p className="text-[11px] text-muted-foreground">Labour Cost</p><p className="text-lg font-bold text-purple-600">{formatCurrency(report.totalLabourCost)}</p></CardContent></Card>
                </div>

                {report.attendanceByProject?.length > 0 && (
                  <Card className="border-purple-200/50 dark:border-purple-800/30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                    <CardContent className="p-0">
                      <div className="max-h-96 overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Project</TableHead>
                              <TableHead className="text-right">Worker-Days</TableHead>
                              <TableHead className="text-right">Total Hours</TableHead>
                              <TableHead className="text-right">Overtime</TableHead>
                              <TableHead className="text-right">Est. Cost</TableHead>
                              <TableHead className="text-right">Workers</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {report.attendanceByProject.map((p: any) => (
                              <TableRow key={p.projectId}>
                                <TableCell className="font-medium">{p.projectName}</TableCell>
                                <TableCell className="text-right">{p.totalDays}</TableCell>
                                <TableCell className="text-right">{p.totalHours.toLocaleString()}</TableCell>
                                <TableCell className="text-right text-amber-600">{p.totalOvertime.toLocaleString()}</TableCell>
                                <TableCell className="text-right">{formatCurrency(p.totalCost)}</TableCell>
                                <TableCell className="text-right">{p.uniqueWorkers}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Cost Variance */}
            {reportType === 'cost-variance' && report.projects && (
              <>
                <div className="grid grid-cols-1 gap-4">
                  {report.projects.map((p: any) => (
                    <Card key={p.projectId} className={`border ${p.isOverBudget ? 'border-red-200/50 dark:border-red-800/30' : 'border-purple-200/50 dark:border-purple-800/30'} bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm`}>
                      <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(expanded === p.projectId ? null : p.projectId)}>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-sm flex items-center gap-2">
                              {p.projectName}
                              <Badge variant={p.isOverBudget ? 'destructive' : 'outline'}>{p.isOverBudget ? 'OVER BUDGET' : `${p.variancePercent}% variance`}</Badge>
                            </CardTitle>
                            <CardDescription>Budget: {formatCurrency(p.totalOriginal)} • Actual: {formatCurrency(p.totalActual)} • Variance: {formatCurrency(p.totalVariance)}</CardDescription>
                          </div>
                          {expanded === p.projectId ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </CardHeader>
                      {expanded === p.projectId && p.lineItems?.length > 0 && (
                        <CardContent className="p-0">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Cost Code</TableHead>
                                <TableHead className="text-right">Budget</TableHead>
                                <TableHead className="text-right">Actual</TableHead>
                                <TableHead className="text-right">Variance</TableHead>
                                <TableHead className="text-right">%</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {p.lineItems.map((li: any, i: number) => (
                                <TableRow key={i}>
                                  <TableCell className="font-medium text-xs">{li.costCode}</TableCell>
                                  <TableCell className="text-right">{formatCurrency(li.originalBudget)}</TableCell>
                                  <TableCell className="text-right">{formatCurrency(li.actualCost)}</TableCell>
                                  <TableCell className={`text-right ${li.variance < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{formatCurrency(li.variance)}</TableCell>
                                  <TableCell className="text-right">
                                    <Badge variant={li.variancePercent >= 0 ? 'outline' : 'destructive'} className="text-[10px]">
                                      {li.variancePercent}%
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </>
            )}

            {/* Resource Utilization */}
            {reportType === 'resource-utilization' && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <Card className="border-purple-200/50 dark:border-purple-800/30"><CardContent className="p-3 text-center"><p className="text-[11px] text-muted-foreground">Total Assignments</p><p className="text-lg font-bold">{report.totalAssignments}</p></CardContent></Card>
                  <Card className="border-purple-200/50 dark:border-purple-800/30"><CardContent className="p-3 text-center"><p className="text-[11px] text-muted-foreground">Active</p><p className="text-lg font-bold text-emerald-600">{report.activeAssignments}</p></CardContent></Card>
                  <Card className="border-purple-200/50 dark:border-purple-800/30"><CardContent className="p-3 text-center"><p className="text-[11px] text-muted-foreground">Utilization</p><p className="text-lg font-bold text-purple-600">{report.overallUtilization}%</p></CardContent></Card>
                </div>

                {report.byCrew?.length > 0 && (
                  <Card className="border-purple-200/50 dark:border-purple-800/30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-base">Crew Utilization</CardTitle></CardHeader>
                    <CardContent>
                      <ChartContainer config={{ utilizationRate: { label: 'Utilization %', color: 'hsl(270, 70%, 55%)' } }} className="h-56 w-full">
                        <BarChart data={report.byCrew} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                          <YAxis type="category" dataKey="crewName" tick={{ fontSize: 10 }} width={75} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="utilizationRate" fill="hsl(270, 70%, 55%)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Financial Health */}
            {reportType === 'financial-health' && report.projects && (
              <>
                {report.totals && (
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    <Card className="border-purple-200/50 dark:border-purple-800/30 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-gray-900">
                      <CardContent className="p-3 text-center"><p className="text-[11px] text-muted-foreground">Inflow</p><p className="text-lg font-bold text-emerald-600">{formatCurrency(report.totals.inflow)}</p></CardContent>
                    </Card>
                    <Card className="border-purple-200/50 dark:border-purple-800/30 bg-gradient-to-br from-red-50/50 to-white dark:from-red-950/20 dark:to-gray-900">
                      <CardContent className="p-3 text-center"><p className="text-[11px] text-muted-foreground">Outflow</p><p className="text-lg font-bold text-red-600">{formatCurrency(report.totals.outflow)}</p></CardContent>
                    </Card>
                    <Card className="border-purple-200/50 dark:border-purple-800/30"><CardContent className="p-3 text-center"><p className="text-[11px] text-muted-foreground">Net</p><p className={`text-lg font-bold ${report.totals.net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(report.totals.net)}</p></CardContent></Card>
                    <Card className="border-purple-200/50 dark:border-purple-800/30"><CardContent className="p-3 text-center"><p className="text-[11px] text-muted-foreground">Receivables</p><p className="text-lg font-bold text-amber-600">{formatCurrency(report.totals.receivables)}</p></CardContent></Card>
                    <Card className="border-purple-200/50 dark:border-purple-800/30"><CardContent className="p-3 text-center"><p className="text-[11px] text-muted-foreground">Payables</p><p className="text-lg font-bold text-red-600">{formatCurrency(report.totals.payables)}</p></CardContent></Card>
                  </div>
                )}

                <Card className="border-purple-200/50 dark:border-purple-800/30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                  <CardContent className="p-0">
                    <div className="max-h-96 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Project</TableHead>
                            <TableHead className="text-right">Inflow</TableHead>
                            <TableHead className="text-right">Outflow</TableHead>
                            <TableHead className="text-right">Net</TableHead>
                            <TableHead className="text-right">Receivables</TableHead>
                            <TableHead className="text-right">Payables</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {report.projects.map((p: any) => (
                            <TableRow key={p.projectId}>
                              <TableCell className="font-medium">{p.projectName}</TableCell>
                              <TableCell className="text-right text-emerald-600">{formatCurrency(p.inflow)}</TableCell>
                              <TableCell className="text-right text-red-600">{formatCurrency(p.outflow)}</TableCell>
                              <TableCell className={`text-right font-medium ${p.net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(p.net)}</TableCell>
                              <TableCell className="text-right text-amber-600">{formatCurrency(p.receivables)}</TableCell>
                              <TableCell className="text-right text-red-600">{formatCurrency(p.payables)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}