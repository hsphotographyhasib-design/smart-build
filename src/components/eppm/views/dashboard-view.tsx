'use client'

import { useEffect, useState } from 'react'
import {
  Briefcase, DollarSign, TrendingUp, AlertTriangle, Activity, Users, GitBranch,
  CalendarClock, FileEdit, Sparkles, ArrowRight, Clock, Target, ShieldAlert,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { KpiCard } from '../kpi-card'
import { AnimatedNumber } from '../animated-number'
import { ProjectDrawer } from '../project-drawer'
import { fmtMoney, fmtNum, fmtPct, fmtDate, healthColor, statusColor, type Kpis, type ProjectLite, type RiskLite, type ActivityLite, type ChangeLite } from '@/lib/eppm'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts'

const CHART = {
  emerald: 'oklch(0.55 0.12 162)', amber: 'oklch(0.7 0.16 80)', rose: 'oklch(0.6 0.2 25)',
  sky: 'oklch(0.62 0.1 195)', violet: 'oklch(0.65 0.18 305)', slate: 'oklch(0.55 0.02 250)',
}

interface DashData {
  kpis: Kpis
  health: { Green: number; Yellow: number; Red: number }
  portfolios: any[]; programs: any[]; projects: ProjectLite[]
  risks: RiskLite[]; activities: ActivityLite[]
  criticalActivities: ActivityLite[]; delayedActivities: ActivityLite[]
  cashFlow: { label: string; planned: number; actual: number; forecast: number }[]
  resourceByType: Record<string, number>; resourceCount: Record<string, number>
  changes: ChangeLite[]; baselines: any[]
}

export function DashboardView({ onNavigate }: { onNavigate: (v: any) => void }) {
  const [data, setData] = useState<DashData | null>(null)
  const [aiInsight, setAiInsight] = useState<string>('')
  const [drawerProject, setDrawerProject] = useState<ProjectLite | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(setData).catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/ai-planner', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Provide a concise executive briefing: top 3 portfolio risks right now, schedule health verdict, and the single highest-leverage action this week.' }),
    }).then(r => r.json()).then(d => setAiInsight(d.content)).catch(() => {})
  }, [])

  if (!data) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}><CardContent className="h-32 animate-pulse bg-muted/40 rounded-xl" /></Card>
        ))}
      </div>
    )
  }

  const k = data.kpis
  const healthData = [
    { name: 'Green', value: data.health.Green, color: CHART.emerald },
    { name: 'Yellow', value: data.health.Yellow, color: CHART.amber },
    { name: 'Red', value: data.health.Red, color: CHART.rose },
  ]
  const resPie = Object.entries(data.resourceCount).map(([name, value], i) => ({
    name, value, color: [CHART.emerald, CHART.amber, CHART.rose, CHART.sky, CHART.violet, CHART.slate][i % 6],
  }))
  const topRisks = [...data.risks].sort((a, b) => b.score - a.score).slice(0, 6)
  const topCritical = data.criticalActivities.slice(0, 8)
  const delayed = data.delayedActivities.slice(0, 6)
  const pendingChanges = data.changes.filter(c => c.status === 'Submitted' || c.status === 'Under Review').slice(0, 5)

  return (
    <div className="space-y-4">
      {/* AI Insight banner */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">AI Executive Briefing</h3>
                <Badge variant="secondary" className="text-[10px]">live</Badge>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none mt-1 text-[13px] text-muted-foreground">
                {aiInsight ? (
                  <div className="space-y-1.5 [&_strong]:text-foreground [&_li]:text-muted-foreground">
                    <div dangerouslySetInnerHTML={{ __html: aiInsight.replace(/\n/g, '<br/>') }} />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-full rounded bg-muted animate-pulse" />
                    <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI grid */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <KpiCard label="Portfolio Budget" value={<AnimatedNumber value={k.totalBudget} format="money" />} sub={`${k.portfolios} portfolios`} icon={DollarSign} tone="emerald" trend={{ value: 2.4, up: true }} />
        <KpiCard label="Actual Spend" value={<AnimatedNumber value={k.totalActual} format="money" />} sub={`of ${fmtMoney(k.totalForecast)} forecast`} icon={TrendingUp} tone="amber" trend={{ value: 1.8, up: true }} />
        <KpiCard label="Revenue (Backlog)" value={<AnimatedNumber value={k.totalRevenue} format="money" />} sub={`GP ${fmtMoney(k.grossProfit)}`} icon={Target} tone="sky" trend={{ value: 3.1, up: true }} />
        <KpiCard label="Avg Progress" value={<AnimatedNumber value={k.avgProgress} format="percent" />} sub={`${k.projects} active projects`} icon={Activity} tone="default" trend={{ value: 4.2, up: true }} />
        <KpiCard label="Critical Activities" value={<AnimatedNumber value={k.criticalActivities} format="int" />} sub={`avg float ${k.avgFloat.toFixed(1)}d`} icon={GitBranch} tone="rose" />
        <KpiCard label="Open Risks" value={<AnimatedNumber value={k.openRisks} format="int" />} sub={`${k.highRisks} high-severity`} icon={AlertTriangle} tone="rose" />
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">Portfolio Cash Flow S-Curve</CardTitle>
                <CardDescription className="text-xs">Planned vs actual vs forecast (monthly)</CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px]">{data.cashFlow.length} mo</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.cashFlow} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gPlanned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART.slate} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART.slate} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART.emerald} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={CHART.emerald} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART.amber} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART.amber} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" minTickGap={20} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => fmtMoney(v).replace('$', '$')} className="text-muted-foreground" width={48} />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid var(--border)' }}
                  formatter={(v: any) => fmtMoney(v, false)}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="planned" name="Planned (PV)" stroke={CHART.slate} fill="url(#gPlanned)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="actual" name="Actual (AC)" stroke={CHART.emerald} fill="url(#gActual)" strokeWidth={2} />
                <Area type="monotone" dataKey="forecast" name="Forecast (EAC)" stroke={CHART.amber} fill="url(#gForecast)" strokeWidth={1.5} strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Project Health</CardTitle>
            <CardDescription className="text-xs">{k.projects} projects across {k.portfolios} portfolios</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={healthData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                  {healthData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {healthData.map(h => (
                <div key={h.name} className="text-center">
                  <div className="text-lg font-bold tabular-nums" style={{ color: h.color }}>{h.value}</div>
                  <div className="text-[10px] text-muted-foreground uppercase">{h.name}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Budget vs Forecast by Project</CardTitle>
            <CardDescription className="text-xs">Top projects by budget</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={[...data.projects].sort((a, b) => b.budget - a.budget).slice(0, 6).map(p => ({
                name: p.code.replace('PRJ-', ''), Budget: p.budget, Actual: p.actualCost, Forecast: p.forecastCost,
              }))} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => fmtMoney(v)} width={42} className="text-muted-foreground" />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: any) => fmtMoney(v, false)} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="Budget" fill={CHART.slate} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Actual" fill={CHART.emerald} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Forecast" fill={CHART.amber} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Resource Distribution</CardTitle>
            <CardDescription className="text-xs">{k.resources} resources by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={resPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: 10 }}>
                  {resPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm">Critical Activities</CardTitle>
              <CardDescription className="text-xs">Zero/near-zero float, in progress</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onNavigate('critical-path')}>View all <ArrowRight className="h-3 w-3" /></Button>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[240px] px-4 pb-3">
              <div className="space-y-1.5">
                {topCritical.map(a => {
                  const proj = data.projects.find(p => p.id === a.projectId)
                  return (
                  <button key={a.id} onClick={() => proj && (setDrawerProject(proj), setDrawerOpen(true))} className="flex w-full items-center gap-2 rounded-md border p-2 hover:bg-muted/50 hover:border-primary/40 transition-colors text-left">
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded bg-rose-50 dark:bg-rose-950/40">
                      <GitBranch className="h-3.5 w-3.5 text-rose-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-medium">{a.name}</div>
                      <div className="truncate text-[10px] text-muted-foreground">{a.project?.code} · float {a.totalFloat}d · {a.progress}%</div>
                    </div>
                    <Badge variant="outline" className="text-[9px] shrink-0 border-rose-200 text-rose-600">{a.remainingDur}d left</Badge>
                  </button>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Tables row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm">Delayed Activities</CardTitle>
              <CardDescription className="text-xs">{delayed.length} activities past baseline finish</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onNavigate('activities')}>Activities <ArrowRight className="h-3 w-3" /></Button>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[260px] px-4 pb-3">
              <div className="space-y-1.5">
                {delayed.map(a => {
                  const slip = a.finishDate && a.baselineFinish ? Math.round((+new Date(a.finishDate) - +new Date(a.baselineFinish)) / 86400000) : 0
                  const proj = data.projects.find(p => p.id === a.projectId)
                  return (
                    <button key={a.id} onClick={() => proj && (setDrawerProject(proj), setDrawerOpen(true))} className="flex w-full items-center gap-2 rounded-md border p-2 hover:bg-muted/50 hover:border-primary/40 transition-colors text-left">
                      <CalendarClock className="h-4 w-4 text-amber-600 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-medium">{a.name}</div>
                        <div className="truncate text-[10px] text-muted-foreground">{a.project?.code} · due {fmtDate(a.baselineFinish)}</div>
                      </div>
                      <Badge variant="outline" className="text-[9px] border-amber-200 text-amber-600">+{slip}d slip</Badge>
                    </button>
                  )
                })}
                {delayed.length === 0 && <div className="py-8 text-center text-xs text-muted-foreground">No delayed activities</div>}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm">Top Risk Exposure</CardTitle>
              <CardDescription className="text-xs">Sorted by score (P × I)</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onNavigate('risks')}>Register <ArrowRight className="h-3 w-3" /></Button>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[260px] px-4 pb-3">
              <div className="space-y-1.5">
                {topRisks.map(r => (
                  <div key={r.id} className="flex items-center gap-2 rounded-md border p-2">
                    <div className={`grid h-7 w-7 shrink-0 place-items-center rounded text-[10px] font-bold ${
                      r.score >= 15 ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                      : r.score >= 9 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                    }`}>{r.score}</div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-medium">{r.title}</div>
                      <div className="truncate text-[10px] text-muted-foreground">{r.project.code} · {r.category} · {r.owner ?? 'Unassigned'}</div>
                    </div>
                    <Badge variant="outline" className={`text-[9px] shrink-0 ${statusColor(r.status)}`}>{r.status}</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Pending changes + portfolio summary */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm">Pending Approvals</CardTitle>
              <CardDescription className="text-xs">{pendingChanges.length} change orders awaiting review</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onNavigate('changes')}>All <ArrowRight className="h-3 w-3" /></Button>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[240px] px-4 pb-3">
              <div className="space-y-1.5">
                {pendingChanges.map(c => (
                  <div key={c.id} className="rounded-md border p-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground">{c.code}</span>
                      <Badge variant="outline" className={`text-[9px] ${statusColor(c.status)}`}>{c.status}</Badge>
                    </div>
                    <div className="truncate text-xs font-medium mt-0.5">{c.title}</div>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground">
                      <span>{c.project.code}</span>
                      <span>{c.costImpact > 0 ? `+${fmtMoney(c.costImpact)}` : ''} {c.timeImpact > 0 ? `· +${c.timeImpact}d` : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm">Portfolio Overview</CardTitle>
              <CardDescription className="text-xs">Investment, health & progress by portfolio</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onNavigate('portfolios')}>Portfolios <ArrowRight className="h-3 w-3" /></Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.portfolios.map(p => {
                const projCount = p.projects?.length ?? 0
                const pBudget = (p.projects ?? []).reduce((s: number, x: any) => s + x.budget, 0)
                const pActual = (p.projects ?? []).reduce((s: number, x: any) => s + x.actualCost, 0)
                const pProg = projCount ? (p.projects ?? []).reduce((s: number, x: any) => s + x.progress, 0) / projCount : 0
                const spendRatio = pBudget ? (pActual / pBudget) * 100 : 0
                return (
                  <div key={p.id} className="rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold truncate">{p.name}</span>
                          <Badge variant="outline" className={`text-[9px] ${healthColor(p.health)}`}>{p.health}</Badge>
                        </div>
                        <div className="text-[10px] text-muted-foreground">{p.businessUnit} · {projCount} projects · {p.client}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold tabular-nums">{fmtMoney(pBudget)}</div>
                        <div className="text-[10px] text-muted-foreground">{fmtPct(pProg)} progress</div>
                      </div>
                    </div>
                    <Progress value={spendRatio} className="h-1.5" />
                    <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                      <span>Spend {fmtMoney(pActual)} ({spendRatio.toFixed(0)}%)</span>
                      <span>{fmtMoney(pBudget - pActual)} remaining</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      <ProjectDrawer
        project={drawerProject}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onNavigate={onNavigate}
      />
    </div>
  )
}
