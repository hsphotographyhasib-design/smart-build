'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { SlidersHorizontal, RotateCcw, TrendingUp, TrendingDown, Clock, DollarSign, AlertTriangle, CheckCircle2, Zap, Gauge } from 'lucide-react'
import { useDashboardData } from '../use-data'
import { fmtMoney, fmtPct, fmtNum, type View } from '@/lib/eppm'
import { FadeIn } from '../motion'
import { cn } from '@/lib/utils'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ComposedChart, Line } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'

const CHART = { emerald: 'oklch(0.55 0.12 162)', amber: 'oklch(0.7 0.16 80)', rose: 'oklch(0.6 0.2 25)', sky: 'oklch(0.62 0.1 195)', violet: 'oklch(0.65 0.18 305)', slate: 'oklch(0.55 0.02 250)' }

export function WhatIfView({ onNavigate }: { onNavigate: (v: View) => void }) {
  const data = useDashboardData()
  const [projectId, setProjectId] = useState<string>('')
  void onNavigate

  // Scenario sliders
  const [progressBoost, setProgressBoost] = useState(0)        // +/- % productivity change
  const [costVariance, setCostVariance] = useState(0)          // +/- % cost change
  const [durationVariance, setDurationVariance] = useState(0)  // +/- % duration change
  const [riskRealised, setRiskRealised] = useState(0)          // 0-100% risk contingency consumed

  const project = useMemo(() => {
    if (!data) return null
    if (!projectId && data.projects.length) return data.projects[0]
    return data.projects.find(p => p.id === projectId) ?? data.projects[0]
  }, [data, projectId])

  // Base metrics
  const base = useMemo(() => {
    if (!project) return null
    const progressFrac = project.progress / 100
    const PV = project.budget * Math.min(1, Math.max(0, (Date.now() - (project.startDate ? +new Date(project.startDate) : Date.now())) / Math.max(1, (project.finishDate ? +new Date(project.finishDate) : Date.now()) - (project.startDate ? +new Date(project.startDate) : Date.now()))))
    const EV = project.budget * progressFrac
    const AC = project.actualCost
    const CPI = AC > 0 ? EV / AC : 1
    const EAC = CPI > 0 ? project.budget / CPI : project.budget
    const slip = project.finishDate && project.baselineFinish ? Math.round((+new Date(project.finishDate) - +new Date(project.baselineFinish)) / 86400000) : 0
    return { budget: project.budget, actualCost: project.actualCost, forecastCost: project.forecastCost, revenue: project.revenue, progress: project.progress, EAC, CPI, slip, PV, EV, AC }
  }, [project])

  // Scenario-adjusted metrics
  const scenario = useMemo(() => {
    if (!base || !project) return null
    // Progress: boost productivity affects remaining work
    const remainingFrac = 1 - project.progress / 100
    const adjustedProgress = Math.min(100, project.progress + remainingFrac * (progressBoost / 100) * 100)
    // Cost: variance applied to remaining budget
    const remainingBudget = base.budget - base.actualCost
    const adjustedForecast = base.actualCost + remainingBudget * (1 + costVariance / 100)
    // Duration: variance applied to remaining duration
    const remainingDays = project.finishDate ? Math.max(0, (+new Date(project.finishDate) - Date.now()) / 86400000) : 0
    const adjustedSlip = base.slip + Math.round(remainingDays * (durationVariance / 100))
    // Risk contingency consumed
    const riskContingency = base.budget * 0.05 // 5% contingency
    const riskCost = riskContingency * (riskRealised / 100)
    const finalForecast = adjustedForecast + riskCost
    // New EAC & margin
    const newEAC = finalForecast
    const newMargin = base.revenue - finalForecast
    const newMarginPct = base.revenue ? (newMargin / base.revenue) * 100 : 0
    // Health verdict
    const costOverrun = (finalForecast - base.budget) / base.budget * 100
    const verdict = adjustedSlip > 30 || costOverrun > 10 ? 'critical' : adjustedSlip > 14 || costOverrun > 5 ? 'at-risk' : adjustedSlip > 0 || costOverrun > 0 ? 'watch' : 'healthy'
    return { adjustedProgress, adjustedForecast: finalForecast, adjustedSlip, riskCost, newEAC, newMargin, newMarginPct, costOverrun, verdict }
  }, [base, project, progressBoost, costVariance, durationVariance, riskRealised])

  if (!data || !base || !scenario || !project) return <div className="h-64 animate-pulse bg-muted/40 rounded-xl" />

  // Comparison data for chart
  const compareData = [
    { name: 'Budget', Baseline: base.budget, Scenario: scenario.adjustedForecast },
    { name: 'Forecast', Baseline: base.forecastCost, Scenario: scenario.adjustedForecast },
    { name: 'Revenue', Baseline: base.revenue, Scenario: base.revenue },
    { name: 'Margin', Baseline: base.revenue - base.forecastCost, Scenario: scenario.newMargin },
  ]

  const verdictConfig = {
    healthy: { label: 'Healthy', color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400', icon: CheckCircle2 },
    watch: { label: 'Watch', color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400', icon: Gauge },
    'at-risk': { label: 'At Risk', color: 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400', icon: AlertTriangle },
    critical: { label: 'Critical', color: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400', icon: AlertTriangle },
  }[scenario.verdict as 'healthy' | 'watch' | 'at-risk' | 'critical']

  const reset = () => { setProgressBoost(0); setCostVariance(0); setDurationVariance(0); setRiskRealised(0) }
  const isModified = progressBoost !== 0 || costVariance !== 0 || durationVariance !== 0 || riskRealised !== 0

  return (
    <FadeIn>
      <div className="space-y-4">
        {/* Project selector + reset */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground"><SlidersHorizontal className="h-4.5 w-4.5" /></div>
                <div>
                  <CardTitle className="text-sm">Scenario Modelling</CardTitle>
                  <CardDescription className="text-xs">Adjust levers to model portfolio outcomes</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select value={project.id} onValueChange={setProjectId}>
                  <SelectTrigger className="h-9 w-[260px]"><SelectValue /></SelectTrigger>
                  <SelectContent>{data.projects.map(p => <SelectItem key={p.id} value={p.id}>{p.code} — {p.name}</SelectItem>)}</SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={reset} disabled={!isModified}><RotateCcw className="h-3.5 w-3.5" />Reset</Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
          {/* Sliders panel */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Scenario Levers</CardTitle><CardDescription className="text-xs">Drag sliders to model changes</CardDescription></CardHeader>
            <CardContent className="space-y-5">
              {/* Productivity */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-amber-500" />Productivity Change</Label>
                  <Badge variant="outline" className={cn('text-[10px] tabular-nums', progressBoost > 0 ? 'text-emerald-600' : progressBoost < 0 ? 'text-rose-600' : '')}>{progressBoost > 0 ? '+' : ''}{progressBoost}%</Badge>
                </div>
                <Slider value={[progressBoost]} onValueChange={([v]) => setProgressBoost(v)} min={-30} max={30} step={5} className="py-1" />
                <div className="flex justify-between text-[9px] text-muted-foreground"><span>-30%</span><span>0%</span><span>+30%</span></div>
              </div>
              <Separator />
              {/* Cost variance */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5 text-emerald-500" />Cost Variance</Label>
                  <Badge variant="outline" className={cn('text-[10px] tabular-nums', costVariance > 0 ? 'text-rose-600' : costVariance < 0 ? 'text-emerald-600' : '')}>{costVariance > 0 ? '+' : ''}{costVariance}%</Badge>
                </div>
                <Slider value={[costVariance]} onValueChange={([v]) => setCostVariance(v)} min={-20} max={40} step={5} className="py-1" />
                <div className="flex justify-between text-[9px] text-muted-foreground"><span>-20%</span><span>0%</span><span>+40%</span></div>
              </div>
              <Separator />
              {/* Duration variance */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-sky-500" />Duration Variance</Label>
                  <Badge variant="outline" className={cn('text-[10px] tabular-nums', durationVariance > 0 ? 'text-rose-600' : durationVariance < 0 ? 'text-emerald-600' : '')}>{durationVariance > 0 ? '+' : ''}{durationVariance}%</Badge>
                </div>
                <Slider value={[durationVariance]} onValueChange={([v]) => setDurationVariance(v)} min={-25} max={50} step={5} className="py-1" />
                <div className="flex justify-between text-[9px] text-muted-foreground"><span>-25%</span><span>0%</span><span>+50%</span></div>
              </div>
              <Separator />
              {/* Risk realised */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-rose-500" />Risk Contingency Realised</Label>
                  <Badge variant="outline" className={cn('text-[10px] tabular-nums', riskRealised > 0 ? 'text-amber-600' : '')}>{riskRealised}%</Badge>
                </div>
                <Slider value={[riskRealised]} onValueChange={([v]) => setRiskRealised(v)} min={0} max={100} step={10} className="py-1" />
                <div className="flex justify-between text-[9px] text-muted-foreground"><span>0%</span><span>50%</span><span>100%</span></div>
              </div>
              <Separator />
              <div className="rounded-lg bg-muted/40 p-2.5 text-[10px] text-muted-foreground leading-relaxed">
                <b className="text-foreground">How it works:</b> Productivity affects remaining progress; cost & duration variances apply to remaining work; risk contingency (5% of budget) is consumed proportionally.
              </div>
            </CardContent>
          </Card>

          {/* Results panel */}
          <div className="space-y-4">
            {/* Verdict banner */}
            <AnimatePresence mode="wait">
              <motion.div
                key={scenario.verdict}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={cn('border-2', verdictConfig.color.split(' ').find(c => c.includes('border-')))}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={cn('grid h-12 w-12 shrink-0 place-items-center rounded-xl', verdictConfig.color)}>
                      <verdictConfig.icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">Scenario Verdict: {verdictConfig.label}</span>
                        {isModified && <Badge variant="secondary" className="text-[9px]">modified</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {scenario.verdict === 'healthy' && 'Project stays on track under this scenario.'}
                        {scenario.verdict === 'watch' && 'Minor slippage — monitor closely.'}
                        {scenario.verdict === 'at-risk' && 'Significant overrun — mitigation recommended.'}
                        {scenario.verdict === 'critical' && 'Severe impact — immediate recovery action required.'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Impact KPIs */}
            <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
              <ImpactCard label="Forecast (EAC)" base={fmtMoney(base.forecastCost)} scenario={fmtMoney(scenario.adjustedForecast)} delta={scenario.adjustedForecast - base.forecastCost} icon={DollarSign} />
              <ImpactCard label="Finish Slip" base={`${base.slip}d`} scenario={`${scenario.adjustedSlip}d`} delta={scenario.adjustedSlip - base.slip} icon={Clock} unit="d" />
              <ImpactCard label="Progress" base={fmtPct(project.progress)} scenario={fmtPct(scenario.adjustedProgress)} delta={scenario.adjustedProgress - project.progress} icon={TrendingUp} unit="%" invert />
              <ImpactCard label="Margin" base={fmtMoney(base.revenue - base.forecastCost)} scenario={fmtMoney(scenario.newMargin)} delta={scenario.newMargin - (base.revenue - base.forecastCost)} icon={TrendingUp} />
            </div>

            {/* Comparison chart */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Baseline vs Scenario Comparison</CardTitle><CardDescription className="text-xs">Financial impact across key metrics</CardDescription></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={compareData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => fmtMoney(v)} width={48} className="text-muted-foreground" />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: any) => fmtMoney(v, false)} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="Baseline" fill={CHART.slate} radius={[3,3,0,0]} />
                    <Bar dataKey="Scenario" fill={CHART.emerald} radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Detailed breakdown */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Detailed Impact Breakdown</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    { l: 'Original Budget', v: fmtMoney(base.budget), tone: 'text-foreground' },
                    { l: 'Actual to Date', v: fmtMoney(base.actualCost), tone: 'text-amber-600' },
                    { l: 'Base Forecast', v: fmtMoney(base.forecastCost), tone: 'text-foreground' },
                    { l: 'Scenario Forecast', v: fmtMoney(scenario.adjustedForecast), tone: scenario.adjustedForecast > base.forecastCost ? 'text-rose-600' : 'text-emerald-600' },
                    { l: 'Cost Overrun vs Budget', v: `${scenario.costOverrun > 0 ? '+' : ''}${scenario.costOverrun.toFixed(1)}%`, tone: scenario.costOverrun > 0 ? 'text-rose-600' : 'text-emerald-600' },
                    { l: 'Risk Cost Added', v: fmtMoney(scenario.riskCost), tone: scenario.riskCost > 0 ? 'text-amber-600' : 'text-muted-foreground' },
                    { l: 'Base Margin %', v: `${base.revenue ? ((base.revenue - base.forecastCost) / base.revenue * 100).toFixed(1) : 0}%`, tone: 'text-foreground' },
                    { l: 'Scenario Margin %', v: `${scenario.newMarginPct.toFixed(1)}%`, tone: scenario.newMarginPct >= 15 ? 'text-emerald-600' : scenario.newMarginPct >= 10 ? 'text-amber-600' : 'text-rose-600' },
                  ].map(r => (
                    <div key={r.l} className="flex items-center justify-between rounded-md border px-3 py-2">
                      <span className="text-[11px] text-muted-foreground">{r.l}</span>
                      <span className={cn('text-xs font-bold tabular-nums', r.tone)}>{r.v}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </FadeIn>
  )
}

function ImpactCard({ label, base, scenario, delta, icon: Icon, unit, invert }: {
  label: string; base: string; scenario: string; delta: number; icon: any; unit?: string; invert?: boolean
}) {
  const positive = invert ? delta > 0 : unit === 'd' ? delta < 0 : delta > 0
  const isZero = Math.abs(delta) < 0.01
  return (
    <Card className="relative overflow-hidden">
      <div className={cn('absolute inset-x-0 top-0 h-0.5', isZero ? 'bg-muted' : positive ? 'bg-emerald-500' : 'bg-rose-500')} />
      <CardContent className="p-3">
        <div className="flex items-center gap-1.5 text-[10px] uppercase text-muted-foreground mb-1"><Icon className="h-3 w-3" />{label}</div>
        <div className="text-lg font-bold tabular-nums">{scenario}</div>
        <div className="flex items-center gap-1 mt-0.5">
          {isZero ? (
            <span className="text-[10px] text-muted-foreground">no change</span>
          ) : (
            <span className={cn('inline-flex items-center gap-0.5 text-[10px] font-medium', positive ? 'text-emerald-600' : 'text-rose-600')}>
              {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {delta > 0 ? '+' : ''}{unit === 'd' ? `${delta}d` : unit === '%' ? `${delta.toFixed(1)}%` : fmtMoney(delta)}
            </span>
          )}
          <span className="text-[9px] text-muted-foreground ml-auto">from {base}</span>
        </div>
      </CardContent>
    </Card>
  )
}
