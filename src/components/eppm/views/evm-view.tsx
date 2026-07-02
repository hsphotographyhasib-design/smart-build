'use client'

import { useMemo } from 'react'
import {
  CalendarClock, TrendingUp, TrendingDown, Wallet, Target, Gauge, Activity, Scale, Calculator, PieChart as PieIcon,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { KpiCard } from '../kpi-card'
import { useDashboardData } from '../use-data'
import { fmtMoney, type View, type ProjectLite } from '@/lib/eppm'
import {
  ResponsiveContainer, AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from 'recharts'

const CHART = {
  emerald: 'oklch(0.55 0.12 162)',
  amber: 'oklch(0.7 0.16 80)',
  rose: 'oklch(0.6 0.2 25)',
  sky: 'oklch(0.62 0.1 195)',
  violet: 'oklch(0.65 0.18 305)',
  slate: 'oklch(0.55 0.02 250)',
}

const now = Date.now()

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n))
}

function elapsedRatio(p: ProjectLite): number {
  if (!p.startDate || !p.finishDate) return 0
  const start = +new Date(p.startDate)
  const finish = +new Date(p.finishDate)
  if (finish <= start) return 0
  return clamp((now - start) / (finish - start), 0, 1)
}

interface ProjectEvm {
  project: ProjectLite
  pv: number; ev: number; ac: number; bac: number
  cv: number; sv: number; cpi: number; spi: number
  eac: number; etc: number; vac: number
  status: { label: string; cls: string }
}

function projectEvm(p: ProjectLite): ProjectEvm {
  const bac = p.budget || 0
  const pv = bac * elapsedRatio(p)
  const ev = bac * ((p.progress || 0) / 100)
  const ac = p.actualCost || 0
  const cv = ev - ac
  const sv = ev - pv
  const cpi = ac > 0 ? ev / ac : 1
  const spi = pv > 0 ? ev / pv : 1
  const eac = cpi > 0 ? bac / cpi : bac
  const etc = eac - ac
  const vac = bac - eac

  let label = 'On Track'
  let cls = 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-900'
  if (cpi < 0.95) {
    label = 'Over Budget'
    cls = 'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/40 dark:border-rose-900'
  } else if (spi < 0.95) {
    label = 'Behind'
    cls = 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-900'
  } else if (spi >= 1.05) {
    label = 'Ahead'
    cls = 'text-sky-600 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950/40 dark:border-sky-900'
  }

  return { project: p, pv, ev, ac, bac, cv, sv, cpi, spi, eac, etc, vac, status: { label, cls } }
}

function toneForIndex(idx: number): 'default' | 'emerald' | 'amber' | 'rose' | 'sky' {
  if (idx >= 1) return 'emerald'
  if (idx >= 0.9) return 'amber'
  return 'rose'
}

export function EvmView({ onNavigate }: { onNavigate: (v: View) => void }) {
  const data = useDashboardData()
  void onNavigate

  const portfolio = useMemo(() => {
    const projects = data?.projects ?? []
    const rows = projects.map(projectEvm)
    const bac = rows.reduce((s, r) => s + r.bac, 0)
    const pv = rows.reduce((s, r) => s + r.pv, 0)
    const ev = rows.reduce((s, r) => s + r.ev, 0)
    const ac = rows.reduce((s, r) => s + r.ac, 0)
    const cv = ev - ac
    const sv = ev - pv
    const cpi = ac > 0 ? ev / ac : 1
    const spi = pv > 0 ? ev / pv : 1
    const eac = cpi > 0 ? bac / cpi : bac
    const etc = eac - ac
    const vac = bac - eac
    return { rows, bac, pv, ev, ac, cv, sv, cpi, spi, eac, etc, vac }
  }, [data])

  const sCurve = useMemo(() => {
    if (!data?.cashFlow) return []
    const ratio = portfolio.pv > 0 ? portfolio.ev / portfolio.pv : 0
    return data.cashFlow.map(m => ({
      label: m.label,
      PV: Math.round(m.planned),
      EV: Math.round(m.planned * ratio),
      AC: Math.round(m.actual),
      EAC: Math.round(m.forecast),
    }))
  }, [data, portfolio])

  const cpiGauge = [
    { name: 'CPI', value: Math.round(portfolio.cpi * 100), fill: portfolio.cpi >= 1 ? CHART.emerald : portfolio.cpi >= 0.9 ? CHART.amber : CHART.rose },
  ]
  const spiGauge = [
    { name: 'SPI', value: Math.round(portfolio.spi * 100), fill: portfolio.spi >= 1 ? CHART.emerald : portfolio.spi >= 0.9 ? CHART.amber : CHART.rose },
  ]

  if (!data) {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse bg-muted/40 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 h-80 animate-pulse bg-muted/40 rounded-xl" />
          <div className="h-80 animate-pulse bg-muted/40 rounded-xl" />
        </div>
        <div className="h-96 animate-pulse bg-muted/40 rounded-xl" />
      </div>
    )
  }

  const fmtIdx = (n: number) => n.toFixed(2)

  return (
    <div className="space-y-4">
      {/* KPI strip */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
        <KpiCard label="PV (Planned)" value={fmtMoney(portfolio.pv)} sub="Planned value" icon={CalendarClock} tone="default" />
        <KpiCard label="EV (Earned)" value={fmtMoney(portfolio.ev)} sub="Earned value" icon={Activity} tone="sky" />
        <KpiCard label="AC (Actual)" value={fmtMoney(portfolio.ac)} sub="Actual cost" icon={TrendingDown} tone="amber" />
        <KpiCard label="BAC" value={fmtMoney(portfolio.bac)} sub="Budget at completion" icon={Wallet} tone="emerald" />
        <KpiCard label="EAC" value={fmtMoney(portfolio.eac)} sub="Estimate at completion" icon={Target} tone={toneForIndex(portfolio.cpi)} />
        <KpiCard label="CV" value={fmtMoney(portfolio.cv)} sub="Cost variance (EV−AC)" icon={Scale} tone={portfolio.cv >= 0 ? 'emerald' : 'rose'} />
        <KpiCard label="SV" value={fmtMoney(portfolio.sv)} sub="Schedule variance (EV−PV)" icon={CalendarClock} tone={portfolio.sv >= 0 ? 'emerald' : 'rose'} />
        <KpiCard label="CPI" value={fmtIdx(portfolio.cpi)} sub="Cost performance idx" icon={Gauge} tone={toneForIndex(portfolio.cpi)} />
        <KpiCard label="SPI" value={fmtIdx(portfolio.spi)} sub="Schedule perf idx" icon={Gauge} tone={toneForIndex(portfolio.spi)} />
        <KpiCard label="VAC" value={fmtMoney(portfolio.vac)} sub="Variance at completion" icon={Calculator} tone={portfolio.vac >= 0 ? 'emerald' : 'rose'} />
      </div>

      {/* S-curve + radial gauges */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="text-sm">S-Curve: PV vs EV vs AC with EAC Forecast</CardTitle>
                <CardDescription className="text-xs">Portfolio cumulative cost over time</CardDescription>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART.slate }} />PV</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART.sky }} />EV</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART.amber }} />AC</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART.rose }} />EAC</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={sCurve} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gPv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART.slate} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={CHART.slate} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gEv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART.sky} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={CHART.sky} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gAc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART.amber} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={CHART.amber} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" minTickGap={20} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => fmtMoney(v as number)} width={48} className="text-muted-foreground" />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: any) => fmtMoney(v as number, false)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="PV" name="PV (Planned)" stroke={CHART.slate} fill="url(#gPv)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="EV" name="EV (Earned)" stroke={CHART.sky} fill="url(#gEv)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="AC" name="AC (Actual)" stroke={CHART.amber} fill="url(#gAc)" strokeWidth={2} />
                <Line type="monotone" dataKey="EAC" name="EAC (Forecast)" stroke={CHART.rose} strokeWidth={2} strokeDasharray="5 3" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Performance Indices</CardTitle>
            <CardDescription className="text-xs">CPI &amp; SPI radial gauges (100 = 1.00)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: 'CPI', value: portfolio.cpi, data: cpiGauge, desc: portfolio.cpi >= 1 ? 'Under budget' : portfolio.cpi >= 0.9 ? 'Near budget' : 'Over budget' },
                { title: 'SPI', value: portfolio.spi, data: spiGauge, desc: portfolio.spi >= 1 ? 'Ahead of schedule' : portfolio.spi >= 0.9 ? 'On schedule' : 'Behind schedule' },
              ].map(g => (
                <div key={g.title} className="flex flex-col items-center">
                  <div className="relative w-full" style={{ height: 140 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart cx="50%" cy="50%" innerRadius="68%" outerRadius="100%" barSize={14} data={g.data} startAngle={90} endAngle={-270}>
                        <PolarAngleAxis type="number" domain={[0, 150]} tick={false} />
                        <RadialBar background={{ fill: 'var(--muted)' }} dataKey="value" cornerRadius={8} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <div className="text-2xl font-bold tabular-nums">{g.value.toFixed(2)}</div>
                      <div className="text-[9px] uppercase text-muted-foreground">{g.title}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] mt-1">{g.desc}</Badge>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
              <div className="rounded-md border p-2">
                <div className="text-muted-foreground uppercase">EAC</div>
                <div className="font-bold tabular-nums">{fmtMoney(portfolio.eac)}</div>
              </div>
              <div className="rounded-md border p-2">
                <div className="text-muted-foreground uppercase">ETC</div>
                <div className="font-bold tabular-nums">{fmtMoney(portfolio.etc)}</div>
              </div>
              <div className="rounded-md border p-2 col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground uppercase">VAC (BAC − EAC)</span>
                  <span className={`font-bold tabular-nums ${portfolio.vac >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {portfolio.vac >= 0 ? '+' : ''}{fmtMoney(portfolio.vac)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-project EVM table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm">Per-Project Earned Value Analysis</CardTitle>
              <CardDescription className="text-xs">{portfolio.rows.length} projects · CPI &lt; 0.95 = Over Budget · SPI &lt; 0.95 = Behind · SPI ≥ 1.05 = Ahead</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] gap-1"><PieIcon className="h-3 w-3" />Portfolio CPI {portfolio.cpi.toFixed(2)}</Badge>
              <Badge variant="outline" className="text-[10px] gap-1"><PieIcon className="h-3 w-3" />Portfolio SPI {portfolio.spi.toFixed(2)}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-auto scroll-thin">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[110px]">Code</TableHead>
                  <TableHead className="min-w-[220px]">Project</TableHead>
                  <TableHead className="w-[110px] text-right">BAC</TableHead>
                  <TableHead className="w-[110px] text-right">EV</TableHead>
                  <TableHead className="w-[110px] text-right">AC</TableHead>
                  <TableHead className="w-[70px] text-right">CPI</TableHead>
                  <TableHead className="w-[70px] text-right">SPI</TableHead>
                  <TableHead className="w-[110px] text-right">EAC</TableHead>
                  <TableHead className="w-[110px] text-right">VAC</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolio.rows.map(r => (
                  <TableRow key={r.project.id} className="hover:bg-muted/40">
                    <TableCell className="font-mono text-[10px] text-muted-foreground">{r.project.code}</TableCell>
                    <TableCell>
                      <div className="text-xs font-medium truncate max-w-[260px]">{r.project.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{r.project.client ?? '—'} · {fmtMoney(r.bac, false)}</div>
                    </TableCell>
                    <TableCell className="text-right text-xs tabular-nums">{fmtMoney(r.bac)}</TableCell>
                    <TableCell className="text-right text-xs tabular-nums text-sky-600">{fmtMoney(r.ev)}</TableCell>
                    <TableCell className="text-right text-xs tabular-nums text-amber-600">{fmtMoney(r.ac)}</TableCell>
                    <TableCell className={`text-right text-xs tabular-nums font-medium ${r.cpi >= 1 ? 'text-emerald-600' : r.cpi >= 0.95 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {r.cpi.toFixed(2)}
                    </TableCell>
                    <TableCell className={`text-right text-xs tabular-nums font-medium ${r.spi >= 1 ? 'text-emerald-600' : r.spi >= 0.95 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {r.spi.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-xs tabular-nums">{fmtMoney(r.eac)}</TableCell>
                    <TableCell className={`text-right text-xs tabular-nums font-medium ${r.vac >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {r.vac >= 0 ? '+' : ''}{fmtMoney(r.vac)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[9px] ${r.status.cls}`}>{r.status.label}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <tfoot className="sticky bottom-0 bg-card border-t">
                <tr className="bg-muted/30">
                  <td colSpan={2} className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide">Portfolio Roll-up</td>
                  <td className="px-3 py-2 text-right text-xs font-bold tabular-nums">{fmtMoney(portfolio.bac)}</td>
                  <td className="px-3 py-2 text-right text-xs font-bold tabular-nums text-sky-600">{fmtMoney(portfolio.ev)}</td>
                  <td className="px-3 py-2 text-right text-xs font-bold tabular-nums text-amber-600">{fmtMoney(portfolio.ac)}</td>
                  <td className={`px-3 py-2 text-right text-xs font-bold tabular-nums ${portfolio.cpi >= 1 ? 'text-emerald-600' : portfolio.cpi >= 0.95 ? 'text-amber-600' : 'text-rose-600'}`}>
                    {portfolio.cpi.toFixed(2)}
                  </td>
                  <td className={`px-3 py-2 text-right text-xs font-bold tabular-nums ${portfolio.spi >= 1 ? 'text-emerald-600' : portfolio.spi >= 0.95 ? 'text-amber-600' : 'text-rose-600'}`}>
                    {portfolio.spi.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right text-xs font-bold tabular-nums">{fmtMoney(portfolio.eac)}</td>
                  <td className={`px-3 py-2 text-right text-xs font-bold tabular-nums ${portfolio.vac >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {portfolio.vac >= 0 ? '+' : ''}{fmtMoney(portfolio.vac)}
                  </td>
                  <td className="px-3 py-2 text-[10px] text-muted-foreground">{portfolio.rows.length} proj</td>
                </tr>
              </tfoot>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
