'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ZoomIn, ZoomOut, Maximize2, GitBranch, AlertTriangle, Filter, Printer } from 'lucide-react'
import { useDashboardData, useProjectDetail } from '../use-data'
import { fmtDate, fmtPct, type View } from '@/lib/eppm'
import { cn } from '@/lib/utils'

const DAY = 86400000

export function GanttView({ projectId, setProjectId, onNavigate }: {
  projectId: string | null; setProjectId: (id: string | null) => void; onNavigate: (v: View) => void
}) {
  const dash = useDashboardData()
  const [activeId, setActiveId] = useState<string | null>(projectId ?? dash?.projects[0]?.id ?? null)
  const detail = useProjectDetail(activeId)
  const [zoom, setZoom] = useState(28) // px per day
  const [showCritical, setShowCritical] = useState(true)
  const [showBaseline, setShowBaseline] = useState(true)
  const [showProgress, setShowProgress] = useState(true)
  const [rowHeight, setRowHeight] = useState(34)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!activeId && dash?.projects?.length) {
      const first = dash.projects[0].id
      setActiveId(first)
      setProjectId(first)
    }
  }, [dash, activeId, setProjectId])

  const project = dash?.projects.find(p => p.id === activeId) ?? null

  const { rows, minDate, maxDate, totalDays } = useMemo(() => {
    if (!detail) return { rows: [], minDate: 0, maxDate: 0, totalDays: 0 }
    const acts = detail.activities
    const starts = acts.map(a => a.startDate ? +new Date(a.startDate) : 0).filter(Boolean)
    const ends = acts.map(a => a.finishDate ? +new Date(a.finishDate) : 0).filter(Boolean)
    const minD = starts.length ? Math.min(...starts) : 0
    const maxD = ends.length ? Math.max(...ends) : 0
    const pad = 3 * DAY
    return {
      rows: acts,
      minDate: minD - pad,
      maxDate: maxD + pad,
      totalDays: Math.max(1, Math.ceil((maxD - minD + 2 * pad) / DAY)),
    }
  }, [detail])

  const monthTicks = useMemo(() => {
    if (!totalDays) return []
    const ticks: { label: string; x: number; major: boolean }[] = []
    const cur = new Date(minDate); cur.setUTCDate(1); cur.setUTCHours(0, 0, 0, 0)
    while (cur.getTime() <= maxDate) {
      const x = ((cur.getTime() - minDate) / DAY) * zoom
      ticks.push({
        label: cur.toLocaleString('en', { month: 'short', year: '2-digit', timeZone: 'UTC' }),
        x, major: cur.getUTCMonth() === 0,
      })
      cur.setUTCMonth(cur.getUTCMonth() + 1)
    }
    return ticks
  }, [minDate, maxDate, totalDays, zoom])

  const weekTicks = useMemo(() => {
    if (!totalDays || zoom < 40) return []
    const ticks: { x: number; label: string }[] = []
    const cur = new Date(minDate); cur.setUTCHours(0, 0, 0, 0)
    const day = cur.getUTCDay()
    cur.setUTCDate(cur.getUTCDate() - day)
    while (cur.getTime() <= maxDate) {
      const x = ((cur.getTime() - minDate) / DAY) * zoom
      ticks.push({ x, label: cur.toLocaleString('en', { day: 'numeric', timeZone: 'UTC' }) })
      cur.setUTCDate(cur.getUTCDate() + 7)
    }
    return ticks
  }, [minDate, maxDate, totalDays, zoom])

  if (!dash) return <div className="h-64 animate-pulse bg-muted/40 rounded-xl" />

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Select value={activeId ?? ''} onValueChange={(v) => { setActiveId(v); setProjectId(v) }}>
                <SelectTrigger className="h-9 w-[280px]"><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {dash.projects.map(p => <SelectItem key={p.id} value={p.id}>{p.code} — {p.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {project && (
                <div className="hidden md:flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Badge variant="outline" className={project.health === 'Green' ? 'border-emerald-300 text-emerald-700' : project.health === 'Yellow' ? 'border-amber-300 text-amber-700' : 'border-rose-300 text-rose-700'}>{project.health}</Badge>
                  <span>{fmtPct(project.progress)} complete</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.max(8, z - 6))}><ZoomOut className="h-4 w-4" /></Button>
                <Slider value={[zoom]} onValueChange={([v]) => setZoom(v)} min={8} max={80} step={2} className="w-28" />
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.min(80, z + 6))}><ZoomIn className="h-4 w-4" /></Button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5"><Switch checked={showCritical} onCheckedChange={setShowCritical} id="crit" /><Label htmlFor="crit" className="text-[11px]">Critical</Label></div>
                <div className="flex items-center gap-1.5"><Switch checked={showBaseline} onCheckedChange={setShowBaseline} id="base" /><Label htmlFor="base" className="text-[11px]">Baseline</Label></div>
                <div className="flex items-center gap-1.5"><Switch checked={showProgress} onCheckedChange={setShowProgress} id="prog" /><Label htmlFor="prog" className="text-[11px]">Progress</Label></div>
              </div>
              <Button variant="outline" size="sm" className="h-8 gap-1.5"><Maximize2 className="h-3.5 w-3.5" />Full</Button>
              <Button variant="outline" size="sm" className="h-8 gap-1.5"><Printer className="h-3.5 w-3.5" />Print</Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {!detail ? (
        <Card><CardContent className="h-96 animate-pulse bg-muted/30 rounded-xl m-4" /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="flex">
            {/* Left activity list */}
            <div className="border-r shrink-0 w-[360px] bg-muted/20">
              <div className="grid grid-cols-[60px_1fr_70px_60px] gap-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground border-b bg-muted/40 sticky top-0 z-10">
                <span>ID</span><span>Activity</span><span className="text-right">Dur</span><span className="text-right">Float</span>
              </div>
              <div style={{ maxHeight: 540 }} className="overflow-y-auto scroll-thin">
                {rows.map((a, i) => (
                  <div key={a.id} className={cn('grid grid-cols-[60px_1fr_70px_60px] gap-2 px-3 items-center border-b border-border/40 hover:bg-muted/40', showCritical && a.isCritical && 'bg-rose-50/40 dark:bg-rose-950/20')} style={{ height: rowHeight }}>
                    <span className="font-mono text-[10px] text-muted-foreground truncate">{a.activityId}</span>
                    <div className="min-w-0">
                      <div className={cn('truncate text-[11px] font-medium', a.isCritical && showCritical && 'text-rose-700 dark:text-rose-400')}>{a.name}</div>
                      <div className="text-[9px] text-muted-foreground">{a.type} · {a.status}</div>
                    </div>
                    <span className="text-right text-[10px] tabular-nums">{a.duration}d</span>
                    <span className={cn('text-right text-[10px] tabular-nums', a.totalFloat === 0 ? 'text-rose-600 font-bold' : 'text-muted-foreground')}>{a.totalFloat}d</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right timeline */}
            <div className="flex-1 overflow-x-auto scroll-thin" ref={scrollRef}>
              <div style={{ width: Math.max(800, totalDays * zoom + 40), position: 'relative' }}>
                {/* Header: months */}
                <div className="sticky top-0 z-20 bg-card border-b h-12 relative">
                  <svg width="100%" height="48" className="block">
                    {monthTicks.map((t, i) => (
                      <g key={i}>
                        <line x1={t.x} y1={0} x2={t.x} y2={48} stroke="var(--border)" strokeWidth={1} />
                        <text x={t.x + 4} y={16} fontSize={10} fill="var(--muted-foreground)" className="font-medium">{t.label}</text>
                        {weekTicks[i] && <text x={weekTicks[i].x + 2} y={40} fontSize={8} fill="var(--muted-foreground)">{weekTicks[i].label}</text>}
                      </g>
                    ))}
                    {weekTicks.map((t, i) => (
                      <line key={`w${i}`} x1={t.x} y1={20} x2={t.x} y2={48} stroke="var(--border)" strokeWidth={0.5} opacity={0.5} />
                    ))}
                  </svg>
                </div>
                {/* Bars */}
                <div className="relative grid-bg" style={{ minHeight: rows.length * rowHeight }}>
                  <svg width="100%" height={rows.length * rowHeight} className="block">
                    {/* vertical month grid */}
                    {monthTicks.map((t, i) => (
                      <line key={i} x1={t.x} y1={0} x2={t.x} y2={rows.length * rowHeight} stroke="var(--border)" strokeWidth={t.major ? 1 : 0.5} opacity={t.major ? 0.6 : 0.3} />
                    ))}
                    {/* today line */}
                    {(() => {
                      const tx = ((Date.now() - minDate) / DAY) * zoom
                      if (tx < 0 || tx > totalDays * zoom) return null
                      return <g><line x1={tx} y1={0} x2={tx} y2={rows.length * rowHeight} stroke="oklch(0.6 0.2 25)" strokeWidth={1.5} strokeDasharray="4 3" /><text x={tx + 4} y={12} fontSize={9} fill="oklch(0.6 0.2 25)" className="font-bold">TODAY</text></g>
                    })()}
                    {/* dependency lines */}
                    {detail.dependencies.map((d, i) => {
                      const from = rows.find(r => r.id === d.fromId)
                      const to = rows.find(r => r.id === d.toId)
                      if (!from || !to || !from.finishDate || !to.startDate) return null
                      const fi = rows.indexOf(from), ti = rows.indexOf(to)
                      const fx = ((+new Date(from.finishDate) - minDate) / DAY) * zoom
                      const fy = fi * rowHeight + rowHeight / 2
                      const tx = ((+new Date(to.startDate) - minDate) / DAY) * zoom
                      const ty = ti * rowHeight + rowHeight / 2
                      const midX = fx + 8
                      const crit = from.isCritical && to.isCritical && showCritical
                      return (
                        <g key={i}>
                          <path d={`M ${fx} ${fy} L ${midX} ${fy} L ${midX} ${ty} L ${tx} ${ty}`} fill="none" stroke={crit ? 'oklch(0.6 0.2 25)' : 'oklch(0.55 0.02 250)'} strokeWidth={crit ? 1.5 : 1} opacity={0.7} />
                          <polygon points={`${tx},${ty} ${tx - 5},${ty - 3} ${tx - 5},${ty + 3}`} fill={crit ? 'oklch(0.6 0.2 25)' : 'oklch(0.55 0.02 250)'} opacity={0.8} />
                        </g>
                      )
                    })}
                    {/* bars */}
                    {rows.map((a, i) => {
                      if (!a.startDate || !a.finishDate) return null
                      const s = +new Date(a.startDate), e = +new Date(a.finishDate)
                      const x = ((s - minDate) / DAY) * zoom
                      const w = Math.max(2, ((e - s) / DAY) * zoom)
                      const y = i * rowHeight + 8
                      const h = rowHeight - 16
                      const isMilestone = a.type.includes('Milestone')
                      const crit = a.isCritical && showCritical
                      const done = a.progress / 100
                      const baseColor = crit ? 'oklch(0.6 0.2 25)' : a.status === 'Completed' ? 'oklch(0.55 0.12 162)' : 'oklch(0.62 0.1 195)'
                      if (isMilestone) {
                        const cx = x, cy = y + h / 2
                        return (
                          <TooltipProvider key={a.id} delayDuration={150}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <g><polygon points={`${cx},${cy - 7} ${cx + 7},${cy} ${cx},${cy + 7} ${cx - 7},${cy}`} fill={crit ? 'oklch(0.6 0.2 25)' : 'oklch(0.7 0.16 80)'} stroke="white" strokeWidth={1} /></g>
                              </TooltipTrigger>
                              <TooltipContent className="text-xs"><div className="font-mono text-[10px] text-muted-foreground">{a.activityId}</div><div className="font-semibold">{a.name}</div><div>Milestone · {fmtDate(a.startDate)}</div></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )
                      }
                      const baseline = a.baselineStart && a.baselineFinish ? {
                        x: ((+new Date(a.baselineStart) - minDate) / DAY) * zoom,
                        w: Math.max(2, ((+new Date(a.baselineFinish) - +new Date(a.baselineStart)) / DAY) * zoom),
                      } : null
                      return (
                        <TooltipProvider key={a.id} delayDuration={150}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <g className="cursor-pointer">
                                {showBaseline && baseline && (
                                  <rect x={baseline.x} y={y + h + 1} width={baseline.w} height={3} rx={1} fill="oklch(0.55 0.02 250)" opacity={0.5} />
                                )}
                                <rect x={x} y={y} width={w} height={h} rx={3} fill={baseColor} opacity={a.status === 'Completed' ? 0.7 : 0.85} stroke={crit ? 'oklch(0.4 0.2 25)' : 'oklch(0.3 0.02 250)'} strokeWidth={0.5} />
                                {showProgress && done > 0 && (
                                  <rect x={x} y={y} width={Math.max(2, w * done)} height={h} rx={3} fill={crit ? 'oklch(0.4 0.18 25)' : 'oklch(0.42 0.1 162)'} opacity={0.95} />
                                )}
                                {w > 40 && (
                                  <text x={x + w / 2} y={y + h / 2 + 3} textAnchor="middle" fontSize={9} fill="white" className="font-bold pointer-events-none">{a.progress.toFixed(0)}%</text>
                                )}
                              </g>
                            </TooltipTrigger>
                            <TooltipContent className="text-xs max-w-xs">
                              <div className="font-mono text-[10px] text-muted-foreground">{a.activityId} · {a.type}</div>
                              <div className="font-semibold">{a.name}</div>
                              <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
                                <span>Start: <b>{fmtDate(a.startDate)}</b></span>
                                <span>Finish: <b>{fmtDate(a.finishDate)}</b></span>
                                <span>Duration: <b>{a.duration}d</b></span>
                                <span>Progress: <b>{a.progress.toFixed(0)}%</b></span>
                                <span>Float: <b className={a.totalFloat === 0 ? 'text-rose-600' : ''}>{a.totalFloat}d</b></span>
                                <span>Critical: <b>{a.isCritical ? 'Yes' : 'No'}</b></span>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )
                    })}
                  </svg>
                </div>
              </div>
            </div>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 border-t px-4 py-2 text-[10px] text-muted-foreground bg-muted/20">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm" style={{ background: 'oklch(0.62 0.1 195)' }} /> Task Activity</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm" style={{ background: 'oklch(0.55 0.12 162)' }} /> Completed</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm" style={{ background: 'oklch(0.6 0.2 25)' }} /> Critical Path</span>
            <span className="flex items-center gap-1.5"><span className="h-1 w-4 rounded-sm" style={{ background: 'oklch(0.55 0.02 250)' }} /> Baseline</span>
            <span className="flex items-center gap-1.5"><span className="h-0 w-0 border-x-4 border-x-transparent border-y-4 border-y-transparent" style={{ borderTopColor: 'oklch(0.7 0.16 80)' }} /> Milestone</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-0.5" style={{ background: 'oklch(0.6 0.2 25)' }} /> Today</span>
            <span className="ml-auto">{rows.length} activities · {detail.dependencies.length} dependencies</span>
          </div>
        </Card>
      )}
    </div>
  )
}
