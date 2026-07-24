'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FileText, FileSpreadsheet, FileChartColumn, Presentation, FileBarChart, Activity, HeartPulse, AlertTriangle, DollarSign, Users, TrendingUp, GitBranch, Banknote, CalendarClock, Download, Sparkles, FileDown, Clock, CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useDashboardData } from '../use-data'
import { fmtMoney, fmtDate, fmtNum, exportCsv, type View } from '@/lib/eppm'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts'

const CHART = { emerald: 'oklch(0.55 0.12 162)', amber: 'oklch(0.7 0.16 80)', rose: 'oklch(0.6 0.2 25)', sky: 'oklch(0.62 0.1 195)', violet: 'oklch(0.65 0.18 305)', slate: 'oklch(0.55 0.02 250)' }

interface Template {
  id: string
  title: string
  desc: string
  icon: any
  formats: string[]
  color: string
}

const TEMPLATES: (Template & { exportType?: 'projects' | 'activities' | 'risks' | 'resources' | 'changes' })[] = [
  { id: 'exec', title: 'Executive Summary', desc: 'High-level KPI snapshot for leadership review', icon: FileBarChart, formats: ['PDF', 'PPT'], color: 'emerald', exportType: 'projects' },
  { id: 'portfolio', title: 'Portfolio Status', desc: 'Cross-portfolio health, budget & progress', icon: Banknote, formats: ['PDF', 'Excel'], color: 'sky', exportType: 'projects' },
  { id: 'health', title: 'Project Health', desc: 'Health scorecards by project & program', icon: HeartPulse, formats: ['PDF'], color: 'rose', exportType: 'projects' },
  { id: 'delay', title: 'Delay Analysis', desc: 'Slippage, float erosion & delay impact', icon: AlertTriangle, formats: ['PDF', 'Excel'], color: 'amber', exportType: 'activities' },
  { id: 'costvar', title: 'Cost Variance', desc: 'Budget vs actual vs forecast deviations', icon: DollarSign, formats: ['Excel', 'CSV'], color: 'emerald', exportType: 'projects' },
  { id: 'resutil', title: 'Resource Utilisation', desc: 'Capacity, allocation & over-allocation', icon: Users, formats: ['Excel', 'PDF'], color: 'violet', exportType: 'resources' },
  { id: 'evm', title: 'EVM Report', desc: 'Earned value metrics: CPI, SPI, EAC, VAC', icon: TrendingUp, formats: ['PDF', 'Excel'], color: 'sky', exportType: 'projects' },
  { id: 'risk', title: 'Risk Register', desc: 'All risks, scores, mitigation status', icon: AlertTriangle, formats: ['Excel', 'CSV'], color: 'rose', exportType: 'risks' },
  { id: 'scurve', title: 'Progress S-Curve', desc: 'Planned vs actual progress over time', icon: Activity, formats: ['PDF'], color: 'amber', exportType: 'activities' },
  { id: 'cpath', title: 'Critical Path', desc: 'Critical activities & float analysis', icon: GitBranch, formats: ['PDF', 'Excel'], color: 'rose', exportType: 'activities' },
  { id: 'cashflow', title: 'Cash Flow Forecast', desc: 'Planned vs actual cashflow & projection', icon: Banknote, formats: ['Excel', 'CSV'], color: 'emerald', exportType: 'projects' },
  { id: 'weekly', title: 'Weekly Progress', desc: 'Site progress, look-ahead & exceptions', icon: CalendarClock, formats: ['PDF', 'PPT'], color: 'sky', exportType: 'changes' },
]

const FORMAT_ICON: Record<string, any> = { PDF: FileText, Excel: FileSpreadsheet, CSV: FileChartColumn, PPT: Presentation }
const COLOR_MAP: Record<string, string> = {
  emerald: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 border-emerald-200 dark:border-emerald-900',
  amber: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 border-amber-200 dark:border-amber-900',
  rose: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 border-rose-200 dark:border-rose-900',
  sky: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 border-sky-200 dark:border-sky-900',
  violet: 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 border-violet-200 dark:border-violet-900',
}

interface RecentReport {
  id: string
  name: string
  type: string
  generatedBy: string
  date: string
  format: string
  status: string
}

const RECENT: RecentReport[] = [
  { id: 'RPT-001', name: 'Executive Summary – January 2025', type: 'Executive Summary', generatedBy: 'A. Novak', date: '2025-01-22', format: 'PDF', status: 'Ready' },
  { id: 'RPT-002', name: 'Portfolio Status – Q4 2024', type: 'Portfolio Status', generatedBy: 'S. Patel', date: '2025-01-15', format: 'Excel', status: 'Ready' },
  { id: 'RPT-003', name: 'Delay Analysis – Tower B', type: 'Delay Analysis', generatedBy: 'M. Chen', date: '2025-01-18', format: 'PDF', status: 'Ready' },
  { id: 'RPT-004', name: 'EVM Report – PRJ-002', type: 'EVM Report', generatedBy: 'K. Ali', date: '2025-01-20', format: 'Excel', status: 'Ready' },
  { id: 'RPT-005', name: 'Risk Register – Portfolio A', type: 'Risk Register', generatedBy: 'L. Rossi', date: '2025-01-19', format: 'CSV', status: 'Ready' },
  { id: 'RPT-006', name: 'Weekly Progress Wk3', type: 'Weekly Progress', generatedBy: 'R. Khan', date: '2025-01-22', format: 'PDF', status: 'Generating' },
  { id: 'RPT-007', name: 'Cash Flow Forecast – FY25', type: 'Cash Flow Forecast', generatedBy: 'A. Novak', date: '2025-01-10', format: 'Excel', status: 'Ready' },
  { id: 'RPT-008', name: 'Critical Path – PRJ-003', type: 'Critical Path', generatedBy: 'J. Müller', date: '2025-01-21', format: 'PDF', status: 'Ready' },
]

const fmtBadge = (s: string) =>
  s === 'Ready' ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900'
  : s === 'Generating' ? 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-900'
  : 'text-muted-foreground bg-muted border-border'

export function ReportsView({ onNavigate }: { onNavigate: (v: View) => void }) {
  void onNavigate
  const data = useDashboardData()
  const [generating, setGenerating] = useState<string | null>(null)

  const statusData = useMemo<any[]>(() => {
    if (!data) return []
    const counts: Record<string, number> = {}
    data.projects.forEach((p: any) => { counts[p.status] = (counts[p.status] ?? 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [data])

  const budgetByCat = useMemo<any[]>(() => {
    if (!data) return []
    const sums: Record<string, number> = {}
    data.projects.forEach((p: any) => {
      const k = p.category ?? 'Uncategorised'
      sums[k] = (sums[k] ?? 0) + (p.budget ?? 0)
    })
    return Object.entries(sums).map(([name, value]) => ({ name, budget: value }))
  }, [data])

  const progressBuckets = useMemo<any[]>(() => {
    if (!data) return []
    const buckets = [
      { name: '0-20%', min: 0, max: 20, count: 0 },
      { name: '20-40%', min: 20, max: 40, count: 0 },
      { name: '40-60%', min: 40, max: 60, count: 0 },
      { name: '60-80%', min: 60, max: 80, count: 0 },
      { name: '80-100%', min: 80, max: 101, count: 0 },
    ]
    data.projects.forEach((p: any) => {
      const b = buckets.find(x => p.progress >= x.min && p.progress < x.max)
      if (b) b.count++
    })
    return buckets
  }, [data])

  const pieColors = [CHART.emerald, CHART.amber, CHART.rose, CHART.sky, CHART.violet, CHART.slate]

  if (!data) return <div className="h-64 animate-pulse bg-muted/40 rounded-xl" />

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-violet-600" />Report Templates</CardTitle>
              <CardDescription className="text-xs">Generate standardised reports from current project data</CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px]">{TEMPLATES.length} templates</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {TEMPLATES.map(t => {
              const Icon = t.icon
              return (
                <div key={t.id} className="rounded-lg border p-3 flex flex-col gap-2 hover:border-primary/40 hover:shadow-sm transition-all">
                  <div className="flex items-start gap-2">
                    <div className={`grid h-9 w-9 place-items-center rounded-lg border shrink-0 ${COLOR_MAP[t.color]}`}><Icon className="h-4 w-4" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold leading-tight">{t.title}</div>
                      <div className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{t.desc}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-auto">
                    {t.formats.map(f => {
                      const FI = FORMAT_ICON[f] ?? FileText
                      return <Badge key={f} variant="secondary" className="text-[9px] gap-1 px-1.5"><FI className="h-2.5 w-2.5" />{f}</Badge>
                    })}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px] w-full mt-1 gap-1"
                    disabled={generating === t.id}
                    onClick={() => {
                      setGenerating(t.id)
                      toast({ title: `Generating "${t.title}"`, description: `Format: ${t.formats.join(', ')} · sourcing live portfolio data` })
                      setTimeout(() => {
                        if (t.exportType) exportCsv(t.exportType)
                        setGenerating(null)
                        toast({ title: `Report ready`, description: `"${t.title}" exported as CSV` })
                      }, 900)
                    }}
                  >
                    {generating === t.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileDown className="h-3 w-3" />}
                    {generating === t.id ? 'Generating…' : 'Generate'}
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Analytics</CardTitle><CardDescription className="text-xs">Live distribution insights from current portfolio</CardDescription></CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-3">
            <div>
              <div className="text-[11px] font-medium text-muted-foreground mb-2">Project Count by Status</div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2}>
                    {statusData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <div className="text-[11px] font-medium text-muted-foreground mb-2">Budget by Category</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={budgetByCat} layout="vertical" margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => fmtMoney(v)} className="text-muted-foreground" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} className="text-muted-foreground" width={88} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: any) => fmtMoney(v)} />
                  <Bar dataKey="budget" name="Budget" fill={CHART.emerald} radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <div className="text-[11px] font-medium text-muted-foreground mb-2">Progress Distribution</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={progressBuckets} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" width={28} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Bar dataKey="count" name="Projects" fill={CHART.sky} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">Recent Reports</CardTitle>
              <CardDescription className="text-xs">Last generated reports across portfolio</CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px]">{RECENT.length} reports</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-auto scroll-thin">
            <Table>
              <TableHeader className="sticky top-0 bg-card"><TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-[90px]">Report ID</TableHead>
                <TableHead className="min-w-[260px]">Report Name</TableHead>
                <TableHead className="w-[140px]">Type</TableHead>
                <TableHead className="w-[120px]">Generated By</TableHead>
                <TableHead className="w-[100px]">Date</TableHead>
                <TableHead className="w-[80px]">Format</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[80px] text-right">Action</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {RECENT.map(r => {
                  const FI = FORMAT_ICON[r.format] ?? FileText
                  const isReady = r.status === 'Ready'
                  return (
                    <TableRow key={r.id} className="hover:bg-muted/40">
                      <TableCell className="font-mono text-[10px] text-muted-foreground">{r.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FI className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-xs font-medium">{r.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[11px] text-muted-foreground">{r.type}</TableCell>
                      <TableCell className="text-[11px]">{r.generatedBy}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">{fmtDate(r.date)}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-[9px]">{r.format}</Badge></TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[9px] gap-1 ${fmtBadge(r.status)}`}>
                          {isReady ? <CheckCircle2 className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5 animate-pulse" />}
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" disabled={!isReady}><Download className="h-3.5 w-3.5" /></Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card><CardContent className="p-4"><div className="text-[11px] uppercase text-muted-foreground">Total Reports Generated</div><div className="text-2xl font-bold">{fmtNum(148, 0)}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-[11px] uppercase text-muted-foreground">Scheduled Reports</div><div className="text-2xl font-bold text-sky-700">{fmtNum(12, 0)}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-[11px] uppercase text-muted-foreground">Storage Used</div><div className="text-2xl font-bold text-violet-600">{fmtNum(2.4, 1)} GB</div></CardContent></Card>
      </div>
    </div>
  )
}
