'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download, GitCompare, Layers, CheckCircle2, FolderGit2, TrendingUp } from 'lucide-react'
import { useDashboardData } from '../use-data'
import { fmtMoney, fmtDate, statusColor, type View } from '@/lib/eppm'
import { cn } from '@/lib/utils'

function daysBetween(a?: string | null, b?: string | null) {
  if (!a || !b) return 0
  const ms = new Date(b).getTime() - new Date(a).getTime()
  return Math.round(ms / 86400000)
}

export function BaselinesView({ onNavigate }: { onNavigate: (v: View) => void }) {
  const data = useDashboardData()

  const baselines: any[] = data?.baselines ?? []
  const projects: any[] = data?.projects ?? []

  const varianceRows = useMemo(() => {
    return projects
      .map(p => {
        const bl = baselines.find(b => b.projectId === p.id && b.isCurrent) ?? baselines.find(b => b.projectId === p.id)
        if (!bl) return null
        const slipDays = daysBetween(bl.finishDate, p.finishDate)
        const costVar = (p.forecastCost || 0) - (bl.budget || 0)
        const variancePct = bl.budget ? (costVar / bl.budget) * 100 : 0
        return {
          projectId: p.id,
          code: p.code,
          name: p.name,
          baselineName: bl.name,
          baselineFinish: bl.finishDate,
          forecastFinish: p.finishDate,
          slipDays,
          costVar,
          variancePct,
        }
      })
      .filter(Boolean) as Array<{
        projectId: string; code: string; name: string; baselineName: string
        baselineFinish: string | null; forecastFinish: string | null
        slipDays: number; costVar: number; variancePct: number
      }>
  }, [projects, baselines])

  const maxAbsCost = Math.max(1, ...varianceRows.map(v => Math.abs(v.costVar)))
  const maxAbsSlip = Math.max(1, ...varianceRows.map(v => Math.abs(v.slipDays)))

  if (!data) return <div className="h-64 animate-pulse bg-muted/40 rounded-xl" />
  void onNavigate

  const currentCount = baselines.filter(b => b.isCurrent).length
  const projectIdsWithBaseline = new Set(baselines.map(b => b.projectId))
  const projectsWithBaseline = projectIdsWithBaseline.size
  const avgVariance = varianceRows.length
    ? varianceRows.reduce((s, v) => s + v.variancePct, 0) / varianceRows.length
    : 0

  return (
    <div className="space-y-4">
      {/* KPI strip */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        {[
          { l: 'Total Baselines', v: baselines.length, i: Layers, t: 'text-foreground' },
          { l: 'Current Baselines', v: currentCount, i: CheckCircle2, t: 'text-emerald-700' },
          { l: 'Projects w/ Baseline', v: projectsWithBaseline, i: FolderGit2, t: 'text-foreground' },
          { l: 'Avg Variance', v: `${avgVariance >= 0 ? '+' : ''}${avgVariance.toFixed(1)}%`, i: TrendingUp, t: avgVariance > 0 ? 'text-rose-700' : 'text-emerald-700' },
        ].map(s => (
          <Card key={s.l}><CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase text-muted-foreground">{s.l}</div>
                <div className={cn('mt-1 text-2xl font-bold tabular-nums', s.t)}>{s.v}</div>
              </div>
              <s.i className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent></Card>
        ))}
      </div>

      {/* Variance Analysis */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <GitCompare className="h-4 w-4 text-muted-foreground" />
            <div>
              <CardTitle className="text-sm">Variance Analysis</CardTitle>
              <CardDescription className="text-xs">Current baseline vs forecast · slip = forecast finish − baseline finish · Δ = forecast − baseline budget</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="mb-3 flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground">
            <span className="font-semibold">Legend:</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-4 rounded bg-rose-500" />Over (slip / overrun)</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-4 rounded bg-emerald-500" />Under (ahead / saving)</span>
            <span className="flex items-center gap-1"><span className="h-3 w-px bg-foreground/40" />Baseline reference</span>
          </div>
          {varianceRows.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">No baselines available for variance analysis.</div>
          ) : (
            <div className="max-h-[400px] overflow-auto scroll-thin space-y-3 pr-1">
              {varianceRows.map(v => (
                <div key={v.projectId} className="space-y-1.5 rounded-lg border bg-card/40 p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold">{v.code} · {v.name}</div>
                      <div className="text-[10px] text-muted-foreground">Baseline: {v.baselineName}</div>
                    </div>
                    <div className="shrink-0 text-right text-[10px] tabular-nums">
                      <div className={cn('font-semibold', v.slipDays > 0 ? 'text-rose-700' : v.slipDays < 0 ? 'text-emerald-700' : 'text-muted-foreground')}>
                        Slip {v.slipDays > 0 ? '+' : ''}{v.slipDays}d
                      </div>
                      <div className={cn('font-semibold', v.costVar > 0 ? 'text-rose-700' : v.costVar < 0 ? 'text-emerald-700' : 'text-muted-foreground')}>
                        Δ {fmtMoney(v.costVar, false)}
                      </div>
                    </div>
                  </div>
                  {/* Finish slip bar */}
                  <div>
                    <div className="mb-0.5 text-[9px] uppercase text-muted-foreground">Finish Slip (days)</div>
                    <div className="relative h-2.5 rounded bg-muted overflow-hidden">
                      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-foreground/40" />
                      <div
                        className={cn('absolute top-0 bottom-0', v.slipDays >= 0 ? 'bg-rose-500' : 'bg-emerald-500')}
                        style={
                          v.slipDays >= 0
                            ? { left: '50%', width: `${Math.min(50, (v.slipDays / maxAbsSlip) * 50)}%` }
                            : { right: '50%', width: `${Math.min(50, (Math.abs(v.slipDays) / maxAbsSlip) * 50)}%` }
                        }
                      />
                    </div>
                  </div>
                  {/* Cost variance bar */}
                  <div>
                    <div className="mb-0.5 text-[9px] uppercase text-muted-foreground">Cost Variance ({fmtMoney(v.costVar, false)})</div>
                    <div className="relative h-2.5 rounded bg-muted overflow-hidden">
                      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-foreground/40" />
                      <div
                        className={cn('absolute top-0 bottom-0', v.costVar >= 0 ? 'bg-rose-500' : 'bg-emerald-500')}
                        style={
                          v.costVar >= 0
                            ? { left: '50%', width: `${Math.min(50, (v.costVar / maxAbsCost) * 50)}%` }
                            : { right: '50%', width: `${Math.min(50, (Math.abs(v.costVar) / maxAbsCost) * 50)}%` }
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Baseline Register Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-sm">Baseline Register</CardTitle>
              <CardDescription className="text-xs">{baselines.length} baseline(s) across {projectsWithBaseline} project(s)</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-1.5"><Download className="h-4 w-4" />Export</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-auto scroll-thin">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="min-w-[200px]">Name</TableHead>
                  <TableHead className="w-[110px]">Project</TableHead>
                  <TableHead className="w-[110px]">Type</TableHead>
                  <TableHead className="w-[90px]">Current</TableHead>
                  <TableHead className="w-[100px]">Start</TableHead>
                  <TableHead className="w-[100px]">Finish</TableHead>
                  <TableHead className="w-[110px] text-right">Budget</TableHead>
                  <TableHead className="w-[80px] text-right">Duration</TableHead>
                  <TableHead className="w-[110px]">Created By</TableHead>
                  <TableHead className="w-[100px]">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {baselines.slice(0, 300).map(b => (
                  <TableRow key={b.id} className={cn('hover:bg-muted/40', b.isCurrent && 'bg-emerald-50/40 dark:bg-emerald-950/15')}>
                    <TableCell><div className="truncate text-xs font-medium max-w-[240px]">{b.name}</div></TableCell>
                    <TableCell><span className="font-mono text-[10px] text-muted-foreground">{b.project?.code}</span></TableCell>
                    <TableCell><span className="text-[10px]">{b.type}</span></TableCell>
                    <TableCell>{b.isCurrent ? <Badge variant="outline" className="text-[9px] border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900">Current</Badge> : <span className="text-[10px] text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="text-[10px]">{fmtDate(b.startDate)}</TableCell>
                    <TableCell className="text-[10px]">{fmtDate(b.finishDate)}</TableCell>
                    <TableCell className="text-right text-[11px] tabular-nums">{fmtMoney(b.budget)}</TableCell>
                    <TableCell className="text-right text-[11px] tabular-nums">{b.duration}d</TableCell>
                    <TableCell className="text-[10px] text-muted-foreground">{b.createdBy ?? '—'}</TableCell>
                    <TableCell className="text-[10px]">{fmtDate(b.createdAt)}</TableCell>
                  </TableRow>
                ))}
                {baselines.length === 0 && (
                  <TableRow><TableCell colSpan={10} className="text-center text-xs text-muted-foreground py-8">No baselines recorded.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
