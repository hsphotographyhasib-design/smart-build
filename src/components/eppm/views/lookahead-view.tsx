'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarRange, Package, FileQuestion, ClipboardCheck, FileSignature, AlertOctagon, CheckCircle2, Activity as ActivityIcon, Flag } from 'lucide-react'
import { useDashboardData } from '../use-data'
import { fmtDate, fmtNum, type View } from '@/lib/eppm'
import { cn } from '@/lib/utils'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

const CHART = { emerald: 'oklch(0.55 0.12 162)', amber: 'oklch(0.7 0.16 80)', rose: 'oklch(0.6 0.2 25)', sky: 'oklch(0.62 0.1 195)', violet: 'oklch(0.65 0.18 305)', slate: 'oklch(0.55 0.02 250)' }

type Constraint = 'Pending Material' | 'Pending RFI' | 'Pending Inspection' | 'Awaiting Approval' | 'None'

const CONSTRAINT_META: Record<Constraint, { color: string; icon: any; label: string }> = {
  'Pending Material': { color: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-900', icon: Package, label: 'Pending Material' },
  'Pending RFI': { color: 'text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-950/50 dark:border-violet-900', icon: FileQuestion, label: 'Pending RFI' },
  'Pending Inspection': { color: 'text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950/50 dark:border-sky-900', icon: ClipboardCheck, label: 'Pending Inspection' },
  'Awaiting Approval': { color: 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/50 dark:border-rose-900', icon: FileSignature, label: 'Awaiting Approval' },
  'None': { color: 'text-muted-foreground bg-muted border-border', icon: CheckCircle2, label: 'None' },
}

const CONSTRAINTS: Constraint[] = ['Pending Material', 'Pending RFI', 'Pending Inspection', 'Awaiting Approval', 'None']

function pickConstraint(i: number): Constraint {
  const opts: Constraint[] = ['Pending Material', 'Pending RFI', 'Pending Inspection', 'Awaiting Approval', 'None', 'None', 'None']
  return opts[i % opts.length]
}

const WINDOWS = [
  { value: '2', label: '2 Weeks' },
  { value: '4', label: '4 Weeks' },
  { value: '6', label: '6 Weeks' },
  { value: '8', label: '8 Weeks' },
]

export function LookaheadView({ onNavigate }: { onNavigate: (v: View) => void }) {
  void onNavigate
  const data = useDashboardData()
  const [weeks, setWeeks] = useState('4')

  const today = useMemo(() => new Date('2025-01-24T00:00:00Z'), [])
  const windowEnd = useMemo(() => {
    const d = new Date(today)
    d.setDate(d.getDate() + Number(weeks) * 7)
    return d
  }, [today, weeks])

  const windowActs = useMemo(() => {
    if (!data) return []
    return data.activities.filter((a: any) => {
      if (!a.finishDate) return false
      const f = new Date(a.finishDate)
      return f >= today && f <= windowEnd
    }).map((a: any, i: number) => ({ ...a, constraint: pickConstraint(i) }))
  }, [data, today, windowEnd])

  const weeklyBuckets = useMemo(() => {
    const n = Number(weeks)
    const buckets: { week: string; start: number; finish: number }[] = []
    for (let i = 0; i < n; i++) {
      const wStart = new Date(today); wStart.setDate(wStart.getDate() + i * 7)
      const wEnd = new Date(wStart); wEnd.setDate(wEnd.getDate() + 7)
      let start = 0, finish = 0
      windowActs.forEach((a: any) => {
        if (a.startDate) {
          const s = new Date(a.startDate)
          if (s >= wStart && s < wEnd) start++
        }
        if (a.finishDate) {
          const f = new Date(a.finishDate)
          if (f >= wStart && f < wEnd) finish++
        }
      })
      buckets.push({ week: `W${i + 1}`, start, finish })
    }
    return buckets
  }, [windowActs, weeks, today])

  const constraintCounts = useMemo(() => {
    const c: Record<Constraint, number> = { 'Pending Material': 0, 'Pending RFI': 0, 'Pending Inspection': 0, 'Awaiting Approval': 0, 'None': 0 }
    windowActs.forEach(a => { c[a.constraint]++ })
    return c
  }, [windowActs])

  if (!data) return <div className="h-64 animate-pulse bg-muted/40 rounded-xl" />

  return (
    <div className="space-y-4">
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Card><CardContent className="p-4"><div className="text-[11px] uppercase text-muted-foreground">Window</div><div className="text-2xl font-bold">{weeks} wks</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-[11px] uppercase text-muted-foreground">Activities in Window</div><div className="text-2xl font-bold text-sky-700">{fmtNum(windowActs.length, 0)}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-[11px] uppercase text-muted-foreground">Constraints Open</div><div className="text-2xl font-bold text-amber-700">{fmtNum(windowActs.filter(a => a.constraint !== 'None').length, 0)}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-[11px] uppercase text-muted-foreground">Activities Finishing</div><div className="text-2xl font-bold text-violet-600">{fmtNum(windowActs.length, 0)}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-sm flex items-center gap-2"><CalendarRange className="h-4 w-4 text-violet-600" />Lookahead Window</CardTitle>
              <CardDescription className="text-xs">{fmtDate(today.toISOString())} → {fmtDate(windowEnd.toISOString())}</CardDescription>
            </div>
            <Tabs value={weeks} onValueChange={setWeeks}>
              <TabsList>
                {WINDOWS.map(w => <TabsTrigger key={w.value} value={w.value} className="text-[11px]">{w.label}</TabsTrigger>)}
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-auto scroll-thin">
            <Table>
              <TableHeader className="sticky top-0 bg-card"><TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-[90px]">Act ID</TableHead>
                <TableHead className="min-w-[220px]">Activity</TableHead>
                <TableHead className="w-[90px]">Project</TableHead>
                <TableHead className="w-[90px]">Start</TableHead>
                <TableHead className="w-[90px]">Finish</TableHead>
                <TableHead className="w-[70px] text-right">Rem Dur</TableHead>
                <TableHead className="w-[80px]">Progress</TableHead>
                <TableHead className="w-[120px]">Responsible</TableHead>
                <TableHead className="w-[140px]">Constraint</TableHead>
                <TableHead className="w-[80px]">Status</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {windowActs.map(a => {
                  const cm = CONSTRAINT_META[a.constraint]
                  const CIcon = cm.icon
                  return (
                    <TableRow key={a.id} className={cn('hover:bg-muted/40', a.constraint !== 'None' && 'bg-amber-50/30 dark:bg-amber-950/10')}>
                      <TableCell className="font-mono text-[10px] text-muted-foreground">{a.activityId}</TableCell>
                      <TableCell><div className="text-xs font-medium truncate max-w-[260px]">{a.name}</div></TableCell>
                      <TableCell className="font-mono text-[10px]">{a.project?.code}</TableCell>
                      <TableCell className="text-[10px]">{fmtDate(a.startDate)}</TableCell>
                      <TableCell className="text-[10px]">{fmtDate(a.finishDate)}</TableCell>
                      <TableCell className="text-right text-[10px] tabular-nums">{a.remainingDur}d</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <div className="h-1.5 w-10 rounded-full bg-muted overflow-hidden"><div className="h-full bg-sky-500" style={{ width: `${a.progress}%` }} /></div>
                          <span className="text-[9px]">{a.progress.toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">{a.responsible ?? '—'}</TableCell>
                      <TableCell>
                        {a.constraint === 'None' ? (
                          <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1"><CIcon className="h-3 w-3" />None</span>
                        ) : (
                          <Badge variant="outline" className={cn('text-[9px] gap-1', cm.color)}><CIcon className="h-2.5 w-2.5" />{cm.label}</Badge>
                        )}
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-[9px]">{a.status}</Badge></TableCell>
                    </TableRow>
                  )
                })}
                {windowActs.length === 0 && <TableRow><TableCell colSpan={10} className="text-center text-xs text-muted-foreground py-10">No activities finishing within this window</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertOctagon className="h-4 w-4 text-amber-700" />Constraint Tracking</CardTitle><CardDescription className="text-xs">Pending items by type — must be cleared to keep schedule</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {CONSTRAINTS.filter(c => c !== 'None').map(c => {
                const cm = CONSTRAINT_META[c]
                const CIcon = cm.icon
                const count = constraintCounts[c]
                const pct = windowActs.length > 0 ? (count / windowActs.length) * 100 : 0
                return (
                  <div key={c} className="rounded-md border p-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={cn('grid h-7 w-7 place-items-center rounded border', cm.color)}><CIcon className="h-3.5 w-3.5" /></div>
                        <div>
                          <div className="text-xs font-medium">{cm.label}</div>
                          <div className="text-[10px] text-muted-foreground">{count} activities blocked</div>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn('text-[10px]', cm.color)}>{count}</Badge>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div className={cn('h-full', c === 'Pending Material' ? 'bg-amber-500' : c === 'Pending RFI' ? 'bg-violet-500' : c === 'Pending Inspection' ? 'bg-sky-500' : 'bg-rose-500')} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
              <div className="rounded-md border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 p-2.5 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                <div className="text-xs"><b className="text-emerald-700 dark:text-emerald-400">{constraintCounts['None']} activities</b> have no constraints — clear to execute</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><ActivityIcon className="h-4 w-4 text-sky-700" />Weekly Buckets</CardTitle><CardDescription className="text-xs">Activities starting vs finishing per week</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={weeklyBuckets} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" width={28} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="start" name="Starting" fill={CHART.emerald} radius={[3, 3, 0, 0]} />
                <Bar dataKey="finish" name="Finishing" fill={CHART.amber} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              <div className="rounded-md border p-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Flag className="h-3 w-3 text-emerald-700" />Total Starts</span>
                <span className="font-bold tabular-nums">{weeklyBuckets.reduce((s, b) => s + b.start, 0)}</span>
              </div>
              <div className="rounded-md border p-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Flag className="h-3 w-3 text-amber-700" />Total Finishes</span>
                <span className="font-bold tabular-nums">{weeklyBuckets.reduce((s, b) => s + b.finish, 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
