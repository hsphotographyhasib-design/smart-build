'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Milestone, Flag, Circle, CheckCircle2, Clock, AlertCircle, Calendar } from 'lucide-react'
import { useDashboardData } from '../use-data'
import { fmtDate, fmtPct, statusColor, healthColor, type View, type ProjectLite } from '@/lib/eppm'
import { ProjectDrawer } from '../project-drawer'
import { FadeIn } from '../motion'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface MilestoneItem {
  id: string
  activityId: string
  name: string
  projectId: string
  projectCode: string
  projectName: string
  projectHealth: string
  date: string
  progress: number
  status: 'completed' | 'upcoming' | 'overdue'
  type: string
  daysTo: number
}

const DAY = 86400000

export function MilestonesView({ onNavigate }: { onNavigate: (v: View) => void }) {
  const data = useDashboardData()
  const [drawerProject, setDrawerProject] = useState<ProjectLite | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'completed' | 'upcoming' | 'overdue'>('all')
  const now = Date.now()

  // Collect milestones from all projects (activities are in dashboard data)
  const milestones = useMemo<MilestoneItem[]>(() => {
    if (!data) return []
    const out: MilestoneItem[] = []
    const now = Date.now()
    for (const a of data.activities) {
      if (!a.type?.includes('Milestone')) continue
      const proj = data.projects.find(p => p.id === a.projectId)
      if (!proj) continue
      const date = a.startDate ? +new Date(a.startDate) : 0
      const daysTo = Math.round((date - now) / DAY)
      const status = a.progress >= 100 ? 'completed' : date < now ? 'overdue' : 'upcoming'
      out.push({
        id: a.id, activityId: a.activityId, name: a.name,
        projectId: proj.id, projectCode: proj.code, projectName: proj.name, projectHealth: proj.health,
        date: a.startDate ?? '', progress: a.progress, status, type: a.type,
        daysTo,
      })
    }
    return out.sort((a, b) => +new Date(a.date) - +new Date(b.date))
  }, [data])

  const filtered = filter === 'all' ? milestones : milestones.filter(m => m.status === filter)
  const counts = {
    total: milestones.length,
    completed: milestones.filter(m => m.status === 'completed').length,
    upcoming: milestones.filter(m => m.status === 'upcoming').length,
    overdue: milestones.filter(m => m.status === 'overdue').length,
  }

  if (!data) return <div className="h-64 animate-pulse bg-muted/40 rounded-xl" />

  // Timeline scale
  const dates = milestones.map(m => +new Date(m.date)).filter(Boolean)
  const minDate = dates.length ? Math.min(...dates) - 14 * DAY : now - 180 * DAY
  const maxDate = dates.length ? Math.max(...dates) + 14 * DAY : now + 180 * DAY
  const span = Math.max(1, maxDate - minDate)
  const nowX = ((now - minDate) / span) * 100

  // Month ticks
  const monthTicks: { label: string; x: number }[] = []
  const cur = new Date(minDate); cur.setUTCDate(1); cur.setUTCHours(0,0,0,0)
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  while (cur.getTime() <= maxDate) {
    monthTicks.push({
      label: cur.toLocaleString('en', { month: 'short', year: '2-digit', timeZone: 'UTC' }),
      x: ((cur.getTime() - minDate) / span) * 100,
    })
    cur.setUTCMonth(cur.getUTCMonth() + 1)
  }

  const openDrawer = (m: MilestoneItem) => {
    const proj = data.projects.find(p => p.id === m.projectId)
    if (proj) { setDrawerProject(proj as ProjectLite); setDrawerOpen(true) }
  }

  return (
    <FadeIn>
      <div className="space-y-4">
        {/* KPI strip */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          {[
            { l: 'Total Milestones', v: counts.total, i: Flag, t: 'text-foreground', bg: 'bg-muted/50 text-muted-foreground' },
            { l: 'Completed', v: counts.completed, i: CheckCircle2, t: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600' },
            { l: 'Upcoming', v: counts.upcoming, i: Clock, t: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600' },
            { l: 'Overdue', v: counts.overdue, i: AlertCircle, t: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600' },
          ].map(s => (
            <Card key={s.l} className="relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/40 to-transparent" />
              <CardContent className="p-4 flex items-center justify-between">
                <div><div className="text-[11px] uppercase text-muted-foreground">{s.l}</div><div className={cn('mt-1 text-2xl font-bold tabular-nums', s.t)}>{s.v}</div></div>
                <div className={cn('grid h-9 w-9 place-items-center rounded-lg', s.bg)}><s.i className="h-[18px] w-[18px]" /></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Timeline visualisation */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div><CardTitle className="text-sm flex items-center gap-2"><Milestone className="h-4 w-4 text-primary" />Programme Milestone Timeline</CardTitle><CardDescription className="text-xs">{filtered.length} milestones across {new Set(filtered.map(m=>m.projectCode)).size} projects</CardDescription></div>
              <div className="flex gap-1">
                {(['all','completed','upcoming','overdue'] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={cn('px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors capitalize', filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted')}>{f}</button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-x-auto scroll-thin pb-2">
              <div className="relative" style={{ minWidth: 800, height: 220 }}>
                {/* Month grid + labels */}
                <div className="absolute inset-x-0 top-0 h-6">
                  {monthTicks.map((t, i) => (
                    <div key={i} className="absolute top-0 h-6 flex items-center" style={{ left: `${t.x}%` }}>
                      <div className="absolute left-0 top-0 h-6 w-px bg-border" />
                      <span className="text-[9px] text-muted-foreground ml-1 whitespace-nowrap">{t.label}</span>
                    </div>
                  ))}
                </div>
                {/* Today line */}
                {nowX >= 0 && nowX <= 100 && (
                  <div className="absolute top-6 bottom-0 z-10" style={{ left: `${nowX}%` }}>
                    <div className="w-px h-full bg-rose-500/60" />
                    <div className="absolute -top-0 -translate-x-1/2 left-0 px-1.5 py-0.5 rounded bg-rose-500 text-white text-[8px] font-bold whitespace-nowrap">TODAY</div>
                  </div>
                )}
                {/* Milestone lanes by project (top 8) */}
                <div className="absolute inset-x-0 top-8 bottom-0">
                  {Array.from(new Set(filtered.map(m => m.projectCode))).slice(0, 8).map((code, laneIdx) => {
                    const laneMilestones = filtered.filter(m => m.projectCode === code)
                    const proj = data.projects.find(p => p.code === code)
                    return (
                      <div key={code} className="relative border-b border-border/30 last:border-0" style={{ height: `${100/Math.min(8, new Set(filtered.map(m=>m.projectCode)).size)}%` }}>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur px-1.5 py-0.5 rounded text-[9px] font-mono text-muted-foreground border">{code}</div>
                        {laneMilestones.map(m => {
                          const x = ((+new Date(m.date) - minDate) / span) * 100
                          const color = m.status === 'completed' ? 'oklch(0.55 0.12 162)' : m.status === 'overdue' ? 'oklch(0.6 0.2 25)' : 'oklch(0.7 0.16 80)'
                          return (
                            <motion.button
                              key={m.id}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: laneIdx * 0.05, type: 'spring', stiffness: 300, damping: 18 }}
                              onClick={() => openDrawer(m)}
                              title={`${m.name} · ${fmtDate(m.date)} · ${m.status}`}
                              className="absolute top-1/2 -translate-y-1/2 group"
                              style={{ left: `${Math.max(2, Math.min(98, x))}%` }}
                            >
                              <div className="relative">
                                <div className="h-3 w-3 rotate-45 group-hover:scale-125 transition-transform" style={{ backgroundColor: color }} />
                                <div className="absolute left-1/2 -translate-x-1/2 -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-popover border rounded-md px-2 py-1 text-[9px] whitespace-nowrap shadow-lg z-20 pointer-events-none">
                                  <div className="font-medium">{m.name}</div>
                                  <div className="text-muted-foreground">{fmtDate(m.date)}</div>
                                </div>
                              </div>
                            </motion.button>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground border-t pt-2">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rotate-45 bg-emerald-500" /> Completed</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rotate-45 bg-amber-500" /> Upcoming</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rotate-45 bg-rose-500" /> Overdue</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-px bg-rose-500" /> Today</span>
              <span className="ml-auto">Click any milestone to view project</span>
            </div>
          </CardContent>
        </Card>

        {/* Milestone list */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Milestone Register</CardTitle><CardDescription className="text-xs">All programme milestones sorted by date</CardDescription></CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <div className="divide-y">
                {filtered.length === 0 ? (
                  <div className="py-12 text-center text-xs text-muted-foreground">No milestones match this filter</div>
                ) : filtered.map(m => (
                  <button key={m.id} onClick={() => openDrawer(m)} className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-muted/40 transition-colors text-left">
                    <div className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-lg',
                      m.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                      : m.status === 'overdue' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600')}>
                      {m.status === 'completed' ? <CheckCircle2 className="h-4 w-4" /> : m.status === 'overdue' ? <AlertCircle className="h-4 w-4" /> : <Milestone className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[9px] text-muted-foreground">{m.projectCode}</span>
                        <span className="truncate text-xs font-medium">{m.name}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">{m.projectName}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-medium">{fmtDate(m.date)}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {m.status === 'completed' ? 'Achieved' : m.status === 'overdue' ? `${Math.abs(m.daysTo)}d overdue` : `in ${m.daysTo}d`}
                      </div>
                    </div>
                    <Badge variant="outline" className={cn('text-[9px] shrink-0', healthColor(m.projectHealth))}>{m.projectHealth}</Badge>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      <ProjectDrawer project={drawerProject} open={drawerOpen} onOpenChange={setDrawerOpen} onNavigate={onNavigate} />
    </FadeIn>
  )
}
