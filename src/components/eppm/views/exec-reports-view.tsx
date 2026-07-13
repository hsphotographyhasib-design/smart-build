'use client'

// Executive & Financial Reporting — board packs, statements and KPI analytics.
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollText, ReceiptText, Download, FileBarChart, TrendingUp, Wallet, CheckCircle2, Clock } from 'lucide-react'
import { type View } from '@/lib/eppm'
import { cn } from '@/lib/utils'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts'
import { FadeIn } from '../motion'

const CHART = { emerald: 'oklch(0.55 0.12 162)', amber: 'oklch(0.7 0.16 80)', sky: 'oklch(0.62 0.1 195)', rose: 'oklch(0.6 0.2 25)' }

interface ReportPack {
  id: string; name: string; audience: string; cadence: string; lastRun?: string; status: 'Ready' | 'Generating' | 'Scheduled'
}

const SEED_EXEC: ReportPack[] = [
  { id: 'RPT-EX-01', name: 'Board Pack — Portfolio Performance', audience: 'Board of Directors', cadence: 'Monthly', lastRun: '30 Jun 2026', status: 'Ready' },
  { id: 'RPT-EX-02', name: 'Sponsor Dashboard — Gadong Residences', audience: 'Project Sponsor', cadence: 'Fortnightly', lastRun: '28 Jun 2026', status: 'Ready' },
  { id: 'RPT-EX-03', name: 'Government Client Progress Pack', audience: 'PWD / Ministries', cadence: 'Monthly', lastRun: '30 Jun 2026', status: 'Ready' },
  { id: 'RPT-EX-04', name: 'HSE Executive Summary', audience: 'Executive Committee', cadence: 'Monthly', status: 'Scheduled' },
]
const SEED_FIN: ReportPack[] = [
  { id: 'RPT-FN-01', name: 'P&L by Project', audience: 'Finance / Directors', cadence: 'Monthly', lastRun: '30 Jun 2026', status: 'Ready' },
  { id: 'RPT-FN-02', name: 'Cashflow Forecast — 12 Weeks', audience: 'Finance', cadence: 'Weekly', lastRun: '01 Jul 2026', status: 'Ready' },
  { id: 'RPT-FN-03', name: 'WIP & Retention Schedule', audience: 'Commercial', cadence: 'Monthly', lastRun: '30 Jun 2026', status: 'Ready' },
  { id: 'RPT-FN-04', name: 'Debtors & Creditors Aging', audience: 'Finance', cadence: 'Weekly', status: 'Scheduled' },
]

const REVENUE = [
  { month: 'Jan', revenue: 1.42, cost: 1.18 }, { month: 'Feb', revenue: 1.31, cost: 1.09 },
  { month: 'Mar', revenue: 1.66, cost: 1.35 }, { month: 'Apr', revenue: 1.52, cost: 1.28 },
  { month: 'May', revenue: 1.78, cost: 1.44 }, { month: 'Jun', revenue: 1.84, cost: 1.51 },
]
const MARGIN = REVENUE.map((r) => ({ month: r.month, margin: +(((r.revenue - r.cost) / r.revenue) * 100).toFixed(1) }))

export type ExecReportsFocus = 'exec-reports' | 'financial-reports'

// Module-scope (not recreated per render — react-hooks/static-components).
function PackTable({ group, rows, onGenerate }: {
  group: 'exec' | 'fin'
  rows: ReportPack[]
  onGenerate: (group: 'exec' | 'fin', id: string) => void
}) {
  return (
    <Table>
      <TableHeader><TableRow>
        <TableHead>Report</TableHead><TableHead className="hidden md:table-cell">Audience</TableHead>
        <TableHead className="hidden sm:table-cell">Cadence</TableHead>
        <TableHead className="hidden sm:table-cell">Last Run</TableHead>
        <TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
      </TableRow></TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.id}>
            <TableCell><div className="font-medium">{r.name}</div><div className="font-mono text-xs text-muted-foreground">{r.id}</div></TableCell>
            <TableCell className="hidden text-sm md:table-cell">{r.audience}</TableCell>
            <TableCell className="hidden sm:table-cell"><Badge variant="outline" className="font-normal">{r.cadence}</Badge></TableCell>
            <TableCell className="hidden text-xs sm:table-cell">{r.lastRun ?? '—'}</TableCell>
            <TableCell>
              <Badge variant="outline" className={
                r.status === 'Ready' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400'
                : r.status === 'Generating' ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-400'
                : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-400'
              }>
                {r.status === 'Generating' ? <Clock className="mr-1 h-3 w-3 animate-spin" /> : r.status === 'Ready' ? <CheckCircle2 className="mr-1 h-3 w-3" /> : null}
                {r.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1.5">
                <Button size="sm" variant="outline" disabled={r.status === 'Generating'} onClick={() => onGenerate(group, r.id)}>
                  <FileBarChart className="mr-1 h-3.5 w-3.5" />Generate
                </Button>
                {r.status === 'Ready' && <Button size="sm" variant="ghost" title="Download PDF"><Download className="h-3.5 w-3.5" /></Button>}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default function ExecReportsView({ focus = 'exec-reports' }: { onNavigate?: (v: View) => void; focus?: ExecReportsFocus }) {
  const [tab, setTab] = useState<string>(focus === 'financial-reports' ? 'financial' : 'executive')
  const [packs, setPacks] = useState({ exec: SEED_EXEC, fin: SEED_FIN })

  useEffect(() => { setTab(focus === 'financial-reports' ? 'financial' : 'executive') }, [focus])

  const generate = (group: 'exec' | 'fin', id: string) => {
    setPacks((prev) => ({ ...prev, [group]: prev[group].map((r) => (r.id === id ? { ...r, status: 'Generating' as const } : r)) }))
    setTimeout(() => {
      setPacks((prev) => ({ ...prev, [group]: prev[group].map((r) => (r.id === id ? { ...r, status: 'Ready' as const, lastRun: '03 Jul 2026' } : r)) }))
    }, 1200)
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><ScrollText className="h-6 w-6 text-primary" /> Executive & Financial Reporting</h1>
          <p className="text-sm text-muted-foreground">Board packs, financial statements and portfolio analytics</p>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Revenue YTD', value: 'BND 9.5M', icon: TrendingUp, tone: 'text-emerald-700' },
            { label: 'Gross Margin', value: '18.2%', icon: Wallet, tone: 'text-sky-700' },
            { label: 'Report Packs', value: packs.exec.length + packs.fin.length, icon: FileBarChart, tone: 'text-violet-600' },
            { label: 'Ready to Send', value: [...packs.exec, ...packs.fin].filter((r) => r.status === 'Ready').length, icon: CheckCircle2, tone: 'text-amber-700' },
          ].map((k) => (
            <Card key={k.label}><CardContent className="flex items-center gap-3 p-4">
              <k.icon className={cn('h-8 w-8 shrink-0 rounded-lg bg-muted p-1.5', k.tone)} />
              <div><div className="text-xl font-bold leading-none">{k.value}</div><div className="mt-1 text-[11px] text-muted-foreground">{k.label}</div></div>
            </CardContent></Card>
          ))}
        </div>
      </FadeIn>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Revenue vs Cost (BND M)</CardTitle><CardDescription>Portfolio-wide, 2026 to date</CardDescription></CardHeader>
          <CardContent className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} />
                <Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="revenue" fill={CHART.emerald} radius={[3, 3, 0, 0]} />
                <Bar dataKey="cost" fill={CHART.amber} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Gross Margin Trend (%)</CardTitle><CardDescription>Monthly margin performance</CardDescription></CardHeader>
          <CardContent className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MARGIN} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} domain={[0, 25]} />
                <Tooltip />
                <Line type="monotone" dataKey="margin" stroke={CHART.sky} strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="executive"><ScrollText className="mr-1.5 h-3.5 w-3.5" />Executive Reports</TabsTrigger>
          <TabsTrigger value="financial"><ReceiptText className="mr-1.5 h-3.5 w-3.5" />Financial Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="executive">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Executive Report Packs</CardTitle><CardDescription>Board and sponsor reporting on a fixed cadence</CardDescription></CardHeader>
            <CardContent><PackTable group="exec" rows={packs.exec} onGenerate={generate} /></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="financial">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Financial Report Packs</CardTitle><CardDescription>Cost, cashflow and commercial reporting</CardDescription></CardHeader>
            <CardContent><PackTable group="fin" rows={packs.fin} onGenerate={generate} /></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
