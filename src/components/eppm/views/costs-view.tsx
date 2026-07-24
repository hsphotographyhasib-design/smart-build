'use client'

import { useMemo } from 'react'
import {
  Wallet, TrendingDown, Receipt, TrendingUp, Target, PiggyBank, Scale, HardHat, Wrench, Package, UserCircle, Building2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { KpiCard } from '../kpi-card'
import { useDashboardData } from '../use-data'
import { fmtMoney, fmtPct, healthColor, type View, type ProjectLite } from '@/lib/eppm'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'

const CHART = {
  emerald: 'oklch(0.55 0.12 162)',
  amber: 'oklch(0.7 0.16 80)',
  rose: 'oklch(0.6 0.2 25)',
  sky: 'oklch(0.62 0.1 195)',
  violet: 'oklch(0.65 0.18 305)',
  slate: 'oklch(0.55 0.02 250)',
}

// Synthetic cost breakdown structure weights per category
const CBS: { name: string; weight: number; budgetBias: number; icon: any; color: string }[] = [
  { name: 'Labour',        weight: 0.34, budgetBias: 0.96, icon: HardHat,      color: CHART.emerald },
  { name: 'Equipment',     weight: 0.17, budgetBias: 1.02, icon: Wrench,       color: CHART.sky },
  { name: 'Material',      weight: 0.26, budgetBias: 1.05, icon: Package,      color: CHART.amber },
  { name: 'Subcontractor', weight: 0.15, budgetBias: 0.98, icon: UserCircle,   color: CHART.violet },
  { name: 'Indirect',      weight: 0.08, budgetBias: 1.08, icon: Building2,    color: CHART.slate },
]

export function CostsView({ onNavigate }: { onNavigate: (v: View) => void }) {
  const data = useDashboardData()
  void onNavigate

  const projects = useMemo<ProjectLite[]>(() => data?.projects ?? [], [data])

  const totals = useMemo(() => {
    const budget = projects.reduce((s, p) => s + (p.budget || 0), 0)
    const actual = projects.reduce((s, p) => s + (p.actualCost || 0), 0)
    const committed = projects.reduce((s, p) => s + (p.committedCost || 0), 0)
    const forecast = projects.reduce((s, p) => s + (p.forecastCost || 0), 0)
    const revenue = projects.reduce((s, p) => s + (p.revenue || 0), 0)
    const grossProfit = revenue - forecast
    const variance = budget - forecast
    return { budget, actual, committed, forecast, revenue, grossProfit, variance }
  }, [projects])

  const topProjects = useMemo(() =>
    [...projects].sort((a, b) => (b.budget || 0) - (a.budget || 0)).slice(0, 8)
      .map(p => ({
        name: p.code.replace('PRJ-', ''),
        Budget: Math.round(p.budget || 0),
        Actual: Math.round(p.actualCost || 0),
        Committed: Math.round(p.committedCost || 0),
        Forecast: Math.round(p.forecastCost || 0),
      })), [projects])

  const cbsData = useMemo(() => {
    const totalActual = totals.actual || 1
    return CBS.map(c => {
      const catBudget = Math.round(totals.budget * c.weight * c.budgetBias)
      const catActual = Math.round(totals.actual * c.weight)
      const catForecast = Math.round(catBudget * (catActual / Math.max(catBudget * 0.9, 1)))
      return {
        ...c,
        budget: catBudget,
        actual: catActual,
        forecast: catForecast,
        pctOfActual: (catActual / totalActual) * 100,
        spendPct: catBudget ? (catActual / catBudget) * 100 : 0,
        variance: catBudget - catForecast,
      }
    })
  }, [totals])

  if (!data) {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4 xl:grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse bg-muted/40 rounded-xl" />
          ))}
        </div>
        <div className="h-80 animate-pulse bg-muted/40 rounded-xl" />
        <div className="h-96 animate-pulse bg-muted/40 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* KPI strip */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4 xl:grid-cols-7">
        <KpiCard label="Total Budget" value={fmtMoney(totals.budget)} sub={`${projects.length} projects`} icon={Wallet} tone="emerald" />
        <KpiCard label="Actual Cost" value={fmtMoney(totals.actual)} sub={`${totals.budget ? ((totals.actual / totals.budget) * 100).toFixed(0) : 0}% of budget`} icon={TrendingDown} tone="amber" />
        <KpiCard label="Committed" value={fmtMoney(totals.committed)} sub="PO + contracts" icon={Receipt} tone="sky" />
        <KpiCard label="Forecast (EAC)" value={fmtMoney(totals.forecast)} sub="Estimate at completion" icon={TrendingUp} tone="amber" />
        <KpiCard label="Revenue" value={fmtMoney(totals.revenue)} sub="Backlog recognised" icon={Target} tone="emerald" />
        <KpiCard
          label="Gross Profit"
          value={fmtMoney(totals.grossProfit)}
          sub={`${totals.revenue ? ((totals.grossProfit / totals.revenue) * 100).toFixed(1) : 0}% margin`}
          icon={PiggyBank}
          tone={totals.grossProfit >= 0 ? 'emerald' : 'rose'}
        />
        <KpiCard
          label="Cost Variance"
          value={fmtMoney(totals.variance)}
          sub="Budget − Forecast"
          icon={Scale}
          tone={totals.variance >= 0 ? 'emerald' : 'rose'}
        />
      </div>

      {/* Bar chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm">Budget vs Actual vs Committed vs Forecast by Project</CardTitle>
              <CardDescription className="text-xs">Top {topProjects.length} projects by approved budget</CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px]">USD, grouped</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={topProjects} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => fmtMoney(v as number)} width={48} className="text-muted-foreground" />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: any) => fmtMoney(v as number, false)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Budget" fill={CHART.slate} radius={[3, 3, 0, 0]} />
              <Bar dataKey="Actual" fill={CHART.emerald} radius={[3, 3, 0, 0]} />
              <Bar dataKey="Committed" fill={CHART.sky} radius={[3, 3, 0, 0]} />
              <Bar dataKey="Forecast" fill={CHART.amber} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cost Breakdown Structure */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm">Cost Breakdown Structure (CBS)</CardTitle>
              <CardDescription className="text-xs">Synthetic allocation by cost category — budget vs actual vs forecast</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground uppercase">Total Actual</div>
              <div className="text-sm font-bold tabular-nums">{fmtMoney(totals.actual)}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {cbsData.map(c => {
            const Icon = c.icon
            const overBudget = c.actual > c.budget
            return (
              <div key={c.name} className="rounded-lg border p-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="grid h-8 w-8 place-items-center rounded-md" style={{ backgroundColor: `${c.color}1a`, color: c.color }}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold">{c.name}</span>
                      <span className="text-[10px] text-muted-foreground tabular-nums">{c.pctOfActual.toFixed(1)}% of actual</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground tabular-nums">
                        Budget {fmtMoney(c.budget)} · Actual {fmtMoney(c.actual)} · Forecast {fmtMoney(c.forecast)}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[9px] ${overBudget ? 'text-rose-700 border-rose-200 bg-rose-50 dark:bg-rose-950/40' : 'text-emerald-700 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40'}`}
                      >
                        {c.variance >= 0 ? '+' : ''}{fmtMoney(c.variance)}
                      </Badge>
                    </div>
                  </div>
                </div>
                {/* Dual bar: budget (background) and actual (foreground) */}
                <div className="relative h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full opacity-30"
                    style={{ width: '100%', backgroundColor: c.color }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all"
                    style={{ width: `${Math.min(c.spendPct, 100)}%`, backgroundColor: c.color }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                  <span>Spend {c.spendPct.toFixed(0)}% of budget</span>
                  <span className={overBudget ? 'text-rose-700 font-medium' : 'text-emerald-700 font-medium'}>
                    {overBudget ? `+${(c.spendPct - 100).toFixed(0)}% over` : `${(100 - c.spendPct).toFixed(0)}% remaining`}
                  </span>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Project cost table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm">Project Cost Ledger</CardTitle>
              <CardDescription className="text-xs">{projects.length} projects · variance = forecast − budget</CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px]">{projects.length} rows</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-auto scroll-thin">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[110px]">Code</TableHead>
                  <TableHead className="min-w-[240px]">Project</TableHead>
                  <TableHead className="w-[120px] text-right">Budget</TableHead>
                  <TableHead className="w-[120px] text-right">Actual</TableHead>
                  <TableHead className="w-[120px] text-right">Committed</TableHead>
                  <TableHead className="w-[120px] text-right">Forecast</TableHead>
                  <TableHead className="w-[120px] text-right">Variance</TableHead>
                  <TableHead className="w-[110px]">Spend %</TableHead>
                  <TableHead className="w-[80px]">Health</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map(p => {
                  const variance = (p.forecastCost || 0) - (p.budget || 0)
                  const spendPct = p.budget ? ((p.actualCost || 0) / p.budget) * 100 : 0
                  return (
                    <TableRow key={p.id} className="hover:bg-muted/40">
                      <TableCell className="font-mono text-[10px] text-muted-foreground">{p.code}</TableCell>
                      <TableCell>
                        <div className="text-xs font-medium truncate max-w-[260px]">{p.name}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{p.client ?? '—'} · {p.location ?? '—'}</div>
                      </TableCell>
                      <TableCell className="text-right text-xs tabular-nums">{fmtMoney(p.budget)}</TableCell>
                      <TableCell className="text-right text-xs tabular-nums">{fmtMoney(p.actualCost)}</TableCell>
                      <TableCell className="text-right text-xs tabular-nums text-muted-foreground">{fmtMoney(p.committedCost)}</TableCell>
                      <TableCell className="text-right text-xs tabular-nums">{fmtMoney(p.forecastCost)}</TableCell>
                      <TableCell className={`text-right text-xs tabular-nums font-medium ${variance > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                        {variance > 0 ? '+' : ''}{fmtMoney(variance)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Progress value={Math.min(spendPct, 100)} className="h-1.5 w-14" />
                          <span className={`text-[10px] tabular-nums w-10 ${spendPct > 100 ? 'text-rose-700 font-medium' : 'text-muted-foreground'}`}>
                            {spendPct.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[9px] ${healthColor(p.health)}`}>{p.health}</Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
              {/* Totals footer */}
              <tfoot className="sticky bottom-0 bg-card border-t">
                <tr className="bg-muted/30">
                  <td colSpan={2} className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide">Portfolio Total</td>
                  <td className="px-3 py-2 text-right text-xs font-bold tabular-nums">{fmtMoney(totals.budget)}</td>
                  <td className="px-3 py-2 text-right text-xs font-bold tabular-nums">{fmtMoney(totals.actual)}</td>
                  <td className="px-3 py-2 text-right text-xs font-bold tabular-nums">{fmtMoney(totals.committed)}</td>
                  <td className="px-3 py-2 text-right text-xs font-bold tabular-nums">{fmtMoney(totals.forecast)}</td>
                  <td className={`px-3 py-2 text-right text-xs font-bold tabular-nums ${totals.forecast - totals.budget > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {(totals.forecast - totals.budget) > 0 ? '+' : ''}{fmtMoney(totals.forecast - totals.budget)}
                  </td>
                  <td colSpan={2} className="px-3 py-2 text-[10px] text-muted-foreground">
                    {fmtPct(totals.budget ? (totals.actual / totals.budget) * 100 : 0)} spent
                  </td>
                </tr>
              </tfoot>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
