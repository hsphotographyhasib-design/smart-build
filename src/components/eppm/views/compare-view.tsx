'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Scale, X, Plus, TrendingUp, TrendingDown, Minus, Download, ArrowUpDown, Check } from 'lucide-react'
import { useDashboardData } from '../use-data'
import { fmtMoney, fmtPct, fmtDate, fmtNum, healthColor, statusColor, exportCsv, type View, type ProjectLite } from '@/lib/eppm'
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { FadeIn } from '../motion'

const PALETTE = [
  'oklch(0.55 0.12 162)', // emerald
  'oklch(0.7 0.16 80)',   // amber
  'oklch(0.62 0.1 195)',  // sky
  'oklch(0.65 0.18 305)', // violet
  'oklch(0.6 0.2 25)',    // rose
  'oklch(0.55 0.02 250)', // slate
]

export function CompareView({ onNavigate }: { onNavigate: (v: View) => void }) {
  const data = useDashboardData()
  const [selected, setSelected] = useState<string[]>([])
  void onNavigate

  const projects = data?.projects ?? []
  const selectedProjects = useMemo(
    () => projects.filter(p => selected.includes(p.id)),
    [projects, selected]
  )

  const toggle = (id: string) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : s.length >= 4 ? s : [...s, id])
  }

  if (!data) return <div className="h-64 animate-pulse bg-muted/40 rounded-xl" />

  // Radar chart data — normalize metrics to 0-100 scale
  const radarData = selectedProjects.length < 2 ? [] : (() => {
    const maxBudget = Math.max(...selectedProjects.map(p => p.budget), 1)
    const maxRevenue = Math.max(...selectedProjects.map(p => p.revenue), 1)
    return [
      { metric: 'Progress', ...norm(selectedProjects, p => p.progress) },
      { metric: 'Budget', ...norm(selectedProjects, p => (p.budget / maxBudget) * 100) },
      { metric: 'Cost Eff.', ...norm(selectedProjects, p => p.budget ? Math.max(0, 100 - (p.actualCost / p.budget) * 60) : 0) },
      { metric: 'Revenue', ...norm(selectedProjects, p => (p.revenue / maxRevenue) * 100) },
      { metric: 'Margin', ...norm(selectedProjects, p => p.revenue ? Math.max(0, Math.min(100, ((p.revenue - p.forecastCost) / p.revenue) * 100)) : 0) },
      { metric: 'Schedule', ...norm(selectedProjects, p => 100 - Math.min(100, Math.abs(slipDays(p)) * 2)) },
    ]
  })()

  // Comparison metrics rows
  const metricRows: { label: string; key: string; render: (p: ProjectLite) => React.ReactNode; best: (p: ProjectLite[]) => ProjectLite; better: 'high' | 'low' }[] = [
    { label: 'Status', key: 'status', render: p => <Badge variant="outline" className={`text-[10px] ${statusColor(p.status)}`}>{p.status}</Badge>, best: () => selectedProjects[0], better: 'high' },
    { label: 'Health', key: 'health', render: p => <Badge variant="outline" className={`text-[10px] ${healthColor(p.health)}`}>{p.health}</Badge>, best: () => selectedProjects[0], better: 'high' },
    { label: 'Progress', key: 'progress', render: p => fmtPct(p.progress), best: ps => ps.reduce((a, b) => a.progress > b.progress ? a : b), better: 'high' },
    { label: 'Budget', key: 'budget', render: p => fmtMoney(p.budget), best: ps => ps.reduce((a, b) => a.budget > b.budget ? a : b), better: 'high' },
    { label: 'Actual Cost', key: 'actualCost', render: p => <span className="text-amber-700">{fmtMoney(p.actualCost)}</span>, best: ps => ps.reduce((a, b) => a.actualCost < b.actualCost ? a : b), better: 'low' },
    { label: 'Committed', key: 'committedCost', render: p => fmtMoney(p.committedCost), best: ps => ps.reduce((a, b) => a.committedCost < b.committedCost ? a : b), better: 'low' },
    { label: 'Forecast (EAC)', key: 'forecastCost', render: p => <span className="text-rose-700">{fmtMoney(p.forecastCost)}</span>, best: ps => ps.reduce((a, b) => a.forecastCost < b.forecastCost ? a : b), better: 'low' },
    { label: 'Cost Variance', key: 'cv', render: p => { const cv = p.budget - p.forecastCost; return <span className={cv >= 0 ? 'text-emerald-700' : 'text-rose-700'}>{cv >= 0 ? '+' : ''}{fmtMoney(cv)}</span> }, best: ps => ps.reduce((a, b) => (a.budget - a.forecastCost) > (b.budget - b.forecastCost) ? a : b), better: 'high' },
    { label: 'Revenue', key: 'revenue', render: p => fmtMoney(p.revenue), best: ps => ps.reduce((a, b) => a.revenue > b.revenue ? a : b), better: 'high' },
    { label: 'Gross Profit', key: 'profit', render: p => { const gp = p.revenue - p.forecastCost; return <span className={gp >= 0 ? 'text-emerald-700' : 'text-rose-700'}>{fmtMoney(gp)}</span> }, best: ps => ps.reduce((a, b) => (a.revenue - a.forecastCost) > (b.revenue - b.forecastCost) ? a : b), better: 'high' },
    { label: 'Margin %', key: 'margin', render: p => <span className="font-medium">{p.revenue ? (((p.revenue - p.forecastCost) / p.revenue) * 100).toFixed(1) : '0'}%</span>, best: ps => ps.reduce((a, b) => marginPct(a) > marginPct(b) ? a : b), better: 'high' },
    { label: 'Spend %', key: 'spendPct', render: p => <span>{p.budget ? ((p.actualCost / p.budget) * 100).toFixed(0) : 0}%</span>, best: ps => ps.reduce((a, b) => spendPct(a) < spendPct(b) ? a : b), better: 'low' },
    { label: 'Finish Slip', key: 'slip', render: p => { const s = slipDays(p); return <Badge variant="outline" className={s > 0 ? 'text-[9px] text-rose-700 border-rose-200' : 'text-[9px] text-emerald-700 border-emerald-200'}>{s > 0 ? '+' : ''}{s}d</Badge> }, best: ps => ps.reduce((a, b) => slipDays(a) < slipDays(b) ? a : b), better: 'low' },
    { label: 'Start', key: 'start', render: p => <span className="text-xs">{fmtDate(p.startDate)}</span>, best: () => selectedProjects[0], better: 'high' },
    { label: 'Finish', key: 'finish', render: p => <span className="text-xs">{fmtDate(p.finishDate)}</span>, best: () => selectedProjects[0], better: 'high' },
  ]

  return (
    <FadeIn>
      <div className="space-y-4">
        {/* Selector + selected chips */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="text-sm flex items-center gap-2"><Scale className="h-4 w-4 text-primary" />Select Projects to Compare</CardTitle>
                <CardDescription className="text-xs">Choose 2–4 projects for side-by-side benchmarking</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">{selected.length}/4 selected</Badge>
                {selected.length > 0 && <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSelected([])}>Clear</Button>}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {selected.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                <AnimatePresence>
                  {selectedProjects.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="inline-flex items-center gap-1.5 rounded-full pl-2.5 pr-1 py-1 text-xs font-medium border"
                      style={{ borderColor: PALETTE[i % 6] + '60', backgroundColor: PALETTE[i % 6] + '15' }}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PALETTE[i % 6] }} />
                      <span className="font-mono text-[10px]">{p.code}</span>
                      <button onClick={() => toggle(p.id)} className="grid h-4 w-4 place-items-center rounded-full hover:bg-muted"><X className="h-3 w-3" /></button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
            <ScrollArea className="h-[160px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 pr-2">
                {projects.map(p => {
                  const checked = selected.includes(p.id)
                  const disabled = !checked && selected.length >= 4
                  const idx = selected.indexOf(p.id)
                  return (
                    <div
                      key={p.id}
                      role="button"
                      tabIndex={disabled ? -1 : 0}
                      onClick={() => !disabled && toggle(p.id)}
                      onKeyDown={(e) => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggle(p.id) } }}
                      className={cn(
                        'flex items-center gap-2.5 rounded-lg border p-2 text-left transition-all',
                        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-muted/40',
                        checked ? 'border-primary bg-primary/5' : 'hover:bg-muted/40'
                      )}
                      style={checked ? { borderColor: PALETTE[idx % 6] + '80', backgroundColor: PALETTE[idx % 6] + '10' } : {}}
                    >
                      <span className={cn('grid h-4 w-4 shrink-0 place-items-center rounded border transition-colors', checked ? 'bg-primary border-primary text-primary-foreground' : 'border-input')}>
                        {checked && <Check className="h-3 w-3" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-muted-foreground">{p.code}</span>
                          <span className={`h-1.5 w-1.5 rounded-full ${p.health === 'Green' ? 'bg-emerald-500' : p.health === 'Yellow' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                        </div>
                        <div className="text-xs font-medium truncate">{p.name}</div>
                      </div>
                      <span className="text-[10px] tabular-nums text-muted-foreground shrink-0">{p.progress.toFixed(0)}%</span>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {selectedProjects.length < 2 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="grid h-14 w-14 mx-auto place-items-center rounded-2xl bg-primary/10 text-primary mb-3"><Scale className="h-7 w-7" /></div>
              <h3 className="text-sm font-semibold">Select at least 2 projects</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">Pick projects from the list above to see a side-by-side comparison of budget, cost, progress, schedule and risk metrics.</p>
            </CardContent>
          </Card>
        ) : (
          <FadeIn>
            <div className="space-y-4">
              {/* Radar chart + ranked bars */}
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Performance Radar</CardTitle><CardDescription className="text-xs">Normalised 0–100 across 6 dimensions</CardDescription></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="var(--border)" />
                        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                        <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 8, fill: 'var(--muted-foreground)' }} />
                        {selectedProjects.map((p, i) => (
                          <Radar key={p.id} name={p.code} dataKey={p.code} stroke={PALETTE[i % 6]} fill={PALETTE[i % 6]} fillOpacity={0.15} strokeWidth={2} />
                        ))}
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Budget vs Actual vs Forecast</CardTitle><CardDescription className="text-xs">Grouped by selected project</CardDescription></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={selectedProjects.map(p => ({ name: p.code.replace('PRJ-', ''), Budget: p.budget, Actual: p.actualCost, Forecast: p.forecastCost }))} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} className="text-muted-foreground" />
                        <YAxis tick={{ fontSize: 9 }} tickFormatter={v => fmtMoney(v)} width={44} className="text-muted-foreground" />
                        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: any) => fmtMoney(v, false)} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="Budget" fill="oklch(0.55 0.02 250)" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="Actual" fill="oklch(0.55 0.12 162)" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="Forecast" fill="oklch(0.7 0.16 80)" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Side-by-side metric table */}
              <Card>
                <CardHeader className="pb-2 flex-row items-center justify-between">
                  <div><CardTitle className="text-sm">Metric Comparison</CardTitle><CardDescription className="text-xs">Best value in each row is highlighted</CardDescription></div>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => exportCsv('projects')}><Download className="h-3.5 w-3.5" />Export</Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto scroll-thin">
                    <table className="w-full">
                      <thead className="sticky top-0 bg-card z-10">
                        <tr className="border-b bg-muted/40">
                          <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground w-[160px]">Metric</th>
                          {selectedProjects.map((p, i) => (
                            <th key={p.id} className="text-right px-4 py-2.5" style={{ borderBottomColor: PALETTE[i % 6], borderBottomWidth: 2 }}>
                              <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1.5 justify-end">
                                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PALETTE[i % 6] }} />
                                  <span className="font-mono text-[10px] text-muted-foreground">{p.code}</span>
                                </div>
                                <span className="text-[10px] font-medium truncate max-w-[140px]">{p.name}</span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {metricRows.map((row, ri) => {
                          const best = row.best(selectedProjects)
                          return (
                            <tr key={row.key} className={cn('border-b last:border-0 hover:bg-muted/20 transition-colors', ri % 2 === 1 && 'bg-muted/10')}>
                              <td className="px-4 py-2 text-[11px] font-medium text-muted-foreground">{row.label}</td>
                              {selectedProjects.map(p => (
                                <td key={p.id} className={cn('px-4 py-2 text-right text-xs tabular-nums', p.id === best.id && 'bg-primary/5 font-semibold')}>
                                  <div className="inline-flex items-center gap-1 justify-end">
                                    {p.id === best.id && <ArrowUpDown className="h-3 w-3 text-emerald-700" style={{ transform: row.better === 'high' ? 'none' : 'scaleY(-1)' }} />}
                                    {row.render(p)}
                                  </div>
                                </td>
                              ))}
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Verdict cards */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {(() => {
                  const byProfit = [...selectedProjects].sort((a, b) => (b.revenue - b.forecastCost) - (a.revenue - a.forecastCost))
                  const byProgress = [...selectedProjects].sort((a, b) => b.progress - a.progress)
                  const byCostCtrl = [...selectedProjects].sort((a, b) => spendPct(a) - spendPct(b))
                  const bySchedule = [...selectedProjects].sort((a, b) => slipDays(a) - slipDays(b))
                  const cards = [
                    { label: 'Highest Margin', project: byProfit[0], value: fmtMoney(byProfit[0].revenue - byProfit[0].forecastCost), tone: 'text-emerald-700', icon: TrendingUp },
                    { label: 'Most Progress', project: byProgress[0], value: fmtPct(byProgress[0].progress), tone: 'text-sky-700', icon: TrendingUp },
                    { label: 'Best Cost Control', project: byCostCtrl[0], value: `${spendPct(byCostCtrl[0]).toFixed(0)}% spent`, tone: 'text-emerald-700', icon: TrendingDown },
                    { label: 'Best Schedule', project: bySchedule[0], value: `${slipDays(bySchedule[0]) >= 0 ? '+' : ''}${slipDays(bySchedule[0])}d slip`, tone: slipDays(bySchedule[0]) <= 0 ? 'text-emerald-700' : 'text-amber-700', icon: slipDays(bySchedule[0]) <= 0 ? TrendingUp : Minus },
                  ]
                  return cards.map(c => (
                    <Card key={c.label} className="relative overflow-hidden">
                      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/40 to-transparent" />
                      <CardContent className="p-4">
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{c.label}</div>
                        <div className={cn('mt-1 text-xl font-bold tabular-nums', c.tone)}>{c.value}</div>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-muted-foreground">{c.project.code}</span>
                          <span className="text-[10px] truncate">{c.project.name}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                })()}
              </div>
            </div>
          </FadeIn>
        )}
      </div>
    </FadeIn>
  )
}

function norm(projects: ProjectLite[], fn: (p: ProjectLite) => number): Record<string, number> {
  const out: Record<string, number> = {}
  for (const p of projects) out[p.code] = Math.round(Math.max(0, Math.min(100, fn(p))))
  return out
}
function slipDays(p: ProjectLite): number {
  if (!p.finishDate || !p.baselineFinish) return 0
  return Math.round((+new Date(p.finishDate) - +new Date(p.baselineFinish)) / 86400000)
}
function marginPct(p: ProjectLite): number {
  return p.revenue ? ((p.revenue - p.forecastCost) / p.revenue) * 100 : 0
}
function spendPct(p: ProjectLite): number {
  return p.budget ? (p.actualCost / p.budget) * 100 : 0
}
