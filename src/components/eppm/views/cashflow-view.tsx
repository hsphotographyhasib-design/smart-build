'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Wallet, TrendingUp, TrendingDown, Download, DollarSign, ArrowUpRight, ArrowDownRight, Banknote, PiggyBank } from 'lucide-react'
import { useDashboardData } from '../use-data'
import { fmtMoney, fmtNum, fmtPct, type View } from '@/lib/eppm'
import { FadeIn } from '../motion'
import { cn } from '@/lib/utils'
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts'

const CHART = { emerald: 'oklch(0.55 0.12 162)', amber: 'oklch(0.7 0.16 80)', rose: 'oklch(0.6 0.2 25)', sky: 'oklch(0.62 0.1 195)', violet: 'oklch(0.65 0.18 305)', slate: 'oklch(0.55 0.02 250)' }

export function CashflowView({ onNavigate }: { onNavigate: (v: View) => void }) {
  const data = useDashboardData()
  void onNavigate

  // Build monthly cashflow with inflow (revenue) and outflow (cost)
  const monthly = useMemo(() => {
    if (!data) return []
    const now = new Date()
    const nowMs = now.getTime()
    return data.cashFlow.map(m => {
      const parts = m.label.split(' ')
      const yy = 2000 + parseInt(parts[1])
      const mi = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(parts[0])
      const d = new Date(Date.UTC(yy, mi, 15))
      const isPast = d.getTime() <= nowMs
      // Outflow: planned/actual/forecast cost
      const outflow = isPast ? m.actual : m.forecast
      // Inflow: revenue distributed proportionally (progress-based)
      const totalRev = data.projects.reduce((s, p) => s + p.revenue, 0)
      const revRatio = m.planned / (data.cashFlow.reduce((s, x) => s + x.planned, 0) || 1)
      const inflow = totalRev * revRatio * (isPast ? 0.85 : 1) // slight delay on collections
      const net = inflow - outflow
      return { label: m.label, inflow: Math.round(inflow), outflow: Math.round(outflow), net: Math.round(net), planned: Math.round(m.planned), actual: Math.round(m.actual), forecast: Math.round(m.forecast), isPast }
    })
  }, [data])

  // Cumulative net position
  const cumulative = useMemo(() => {
    return monthly.reduce<{ arr: any[]; run: number }>((acc, m) => {
      const run = acc.run + m.net
      return { arr: [...acc.arr, { ...m, cumulative: Math.round(run) }], run }
    }, { arr: [], run: 0 }).arr
  }, [monthly])

  const totalInflow = monthly.reduce((s, m) => s + m.inflow, 0)
  const totalOutflow = monthly.reduce((s, m) => s + m.outflow, 0)
  const totalNet = totalInflow - totalOutflow
  const peakFunding = Math.min(0, ...cumulative.map(c => c.cumulative))
  const pastMonths = monthly.filter(m => m.isPast)
  const ytdInflow = pastMonths.reduce((s, m) => s + m.inflow, 0)
  const ytdOutflow = pastMonths.reduce((s, m) => s + m.outflow, 0)

  if (!data) return <div className="h-64 animate-pulse bg-muted/40 rounded-xl" />

  return (
    <FadeIn>
      <div className="space-y-4">
        {/* KPI strip */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {[
            { l: 'Total Inflow', v: fmtMoney(totalInflow), i: ArrowUpRight, t: 'text-emerald-700', bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700' },
            { l: 'Total Outflow', v: fmtMoney(totalOutflow), i: ArrowDownRight, t: 'text-rose-700', bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700' },
            { l: 'Net Position', v: fmtMoney(totalNet), i: Wallet, t: totalNet >= 0 ? 'text-emerald-700' : 'text-rose-700', bg: 'bg-muted/50 text-muted-foreground' },
            { l: 'Peak Funding', v: fmtMoney(Math.abs(peakFunding)), i: Banknote, t: 'text-amber-700', bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700' },
            { l: 'YTD Inflow', v: fmtMoney(ytdInflow), i: TrendingUp, t: 'text-sky-700', bg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700' },
            { l: 'YTD Outflow', v: fmtMoney(ytdOutflow), i: TrendingDown, t: 'text-amber-700', bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700' },
          ].map(s => (
            <Card key={s.l} className="relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/40 to-transparent" />
              <CardContent className="p-4 flex items-center justify-between">
                <div><div className="text-[11px] uppercase text-muted-foreground">{s.l}</div><div className={cn('mt-1 text-xl font-bold tabular-nums', s.t)}>{s.v}</div></div>
                <div className={cn('grid h-9 w-9 place-items-center rounded-lg', s.bg)}><s.i className="h-[18px] w-[18px]" /></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="curve">
          <TabsList>
            <TabsTrigger value="curve">Cash Flow S-Curve</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Breakdown</TabsTrigger>
            <TabsTrigger value="position">Cumulative Position</TabsTrigger>
          </TabsList>

          {/* Combined inflow/outflow + net */}
          <TabsContent value="curve" className="mt-3">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Monthly Cash Flow (Inflow vs Outflow)</CardTitle><CardDescription className="text-xs">Revenue inflow against cost outflow, with net cash position</CardDescription></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={340}>
                  <ComposedChart data={monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={CHART.emerald} stopOpacity={0.4} /><stop offset="95%" stopColor={CHART.emerald} stopOpacity={0} /></linearGradient>
                      <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={CHART.rose} stopOpacity={0.4} /><stop offset="95%" stopColor={CHART.rose} stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" minTickGap={20} className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => fmtMoney(v)} width={48} className="text-muted-foreground" />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: any) => fmtMoney(v, false)} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Area type="monotone" dataKey="inflow" name="Inflow (Revenue)" stroke={CHART.emerald} fill="url(#gIn)" strokeWidth={2} />
                    <Area type="monotone" dataKey="outflow" name="Outflow (Cost)" stroke={CHART.rose} fill="url(#gOut)" strokeWidth={2} />
                    <Line type="monotone" dataKey="net" name="Net Cash" stroke={CHART.sky} strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monthly table */}
          <TabsContent value="monthly" className="mt-3">
            <Card>
              <CardHeader className="pb-2 flex-row items-center justify-between">
                <div><CardTitle className="text-sm">Monthly Cash Flow Breakdown</CardTitle><CardDescription className="text-xs">{monthly.length} months · past months shown with actuals</CardDescription></div>
                <Button variant="outline" size="sm" className="h-8 gap-1.5"><Download className="h-3.5 w-3.5" />Export</Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[480px] overflow-auto scroll-thin">
                  <Table>
                    <TableHeader className="sticky top-0 bg-card"><TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead>Month</TableHead><TableHead className="text-right">Inflow</TableHead><TableHead className="text-right">Outflow</TableHead>
                      <TableHead className="text-right">Net</TableHead><TableHead className="text-right">Cumulative</TableHead><TableHead className="w-[80px]">Status</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {cumulative.map((m, i) => (
                        <TableRow key={m.label} className={cn('hover:bg-muted/40', i % 2 === 1 && 'bg-muted/10')}>
                          <TableCell className="text-xs font-medium">{m.label}</TableCell>
                          <TableCell className="text-right text-xs tabular-nums text-emerald-700">{fmtMoney(m.inflow, false)}</TableCell>
                          <TableCell className="text-right text-xs tabular-nums text-rose-700">{fmtMoney(m.outflow, false)}</TableCell>
                          <TableCell className={cn('text-right text-xs tabular-nums font-medium', m.net >= 0 ? 'text-emerald-700' : 'text-rose-700')}>{m.net >= 0 ? '+' : ''}{fmtMoney(m.net, false)}</TableCell>
                          <TableCell className={cn('text-right text-xs tabular-nums font-bold', m.cumulative >= 0 ? 'text-emerald-700' : 'text-amber-700')}>{fmtMoney(m.cumulative, false)}</TableCell>
                          <TableCell><Badge variant="outline" className={cn('text-[9px]', m.isPast ? 'border-emerald-200 text-emerald-700' : 'border-sky-200 text-sky-700')}>{m.isPast ? 'Actual' : 'Forecast'}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cumulative position */}
          <TabsContent value="position" className="mt-3">
            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Cumulative Cash Position</CardTitle><CardDescription className="text-xs">Running net position — negative indicates funding requirement</CardDescription></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={340}>
                    <ComposedChart data={cumulative} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gCum" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={CHART.sky} stopOpacity={0.4} /><stop offset="95%" stopColor={CHART.sky} stopOpacity={0} /></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" minTickGap={20} className="text-muted-foreground" />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={v => fmtMoney(v)} width={48} className="text-muted-foreground" />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: any) => fmtMoney(v, false)} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Area type="monotone" dataKey="cumulative" name="Cumulative Position" stroke={CHART.sky} fill="url(#gCum)" strokeWidth={2} />
                          <Line type="monotone" dataKey="inflow" name="Monthly Inflow" stroke={CHART.emerald} strokeWidth={1} dot={false} />
                          <Line type="monotone" dataKey="outflow" name="Monthly Outflow" stroke={CHART.rose} strokeWidth={1} dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <div className="space-y-4">
                <Card className="bg-gradient-to-br from-primary/5 to-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2"><PiggyBank className="h-4 w-4 text-emerald-700" /><span className="text-sm font-semibold">Cash Health</span></div>
                    <div className="text-3xl font-bold text-emerald-700">{fmtMoney(totalNet)}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Net cash position over portfolio lifecycle</div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-md bg-muted/50 p-2"><div className="text-[9px] uppercase text-muted-foreground">Margin</div><div className="font-bold text-emerald-700">{fmtPct(totalInflow ? (totalNet / totalInflow) * 100 : 0)}</div></div>
                      <div className="rounded-md bg-muted/50 p-2"><div className="text-[9px] uppercase text-muted-foreground">Peak Funding</div><div className="font-bold text-amber-700">{fmtMoney(Math.abs(peakFunding))}</div></div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Funding Requirements</CardTitle></CardHeader>
                  <CardContent className="space-y-1.5">
                    {cumulative.filter(m => m.cumulative < 0).slice(0, 6).map(m => (
                      <div key={m.label} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{m.label}</span>
                        <Badge variant="outline" className="text-[9px] border-amber-300 text-amber-700">{fmtMoney(Math.abs(m.cumulative), false)}</Badge>
                      </div>
                    ))}
                    {cumulative.filter(m => m.cumulative < 0).length === 0 && <div className="text-xs text-muted-foreground text-center py-2">No funding gaps projected</div>}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </FadeIn>
  )
}
