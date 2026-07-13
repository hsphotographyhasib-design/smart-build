'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Download, GitBranch, AlertTriangle, Clock } from 'lucide-react'
import { useDashboardData } from '../use-data'
import { fmtDate, fmtPct, statusColor, exportCsv, type View } from '@/lib/eppm'
import { cn } from '@/lib/utils'

export function ActivitiesView({ onNavigate }: { onNavigate: (v: View) => void }) {
  const data = useDashboardData()
  const [q, setQ] = useState('')
  const [crit, setCrit] = useState('all')
  const [status, setStatus] = useState('all')
  const [proj, setProj] = useState('all')

  const rows = useMemo(() => {
    if (!data) return []
    return data.activities.filter(a => {
      if (q && !`${a.activityId} ${a.name}`.toLowerCase().includes(q.toLowerCase())) return false
      if (crit === 'critical' && !a.isCritical) return false
      if (crit === 'normal' && a.isCritical) return false
      if (status !== 'all' && a.status !== status) return false
      if (proj !== 'all' && a.projectId !== proj) return false
      return true
    })
  }, [data, q, crit, status, proj])

  if (!data) return <div className="h-64 animate-pulse bg-muted/40 rounded-xl" />
  void onNavigate

  return (
    <div className="space-y-4">
      <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
        {[
          { l: 'Total Activities', v: data.activities.length, i: Clock, t: 'text-foreground' },
          { l: 'Critical', v: data.criticalActivities.length, i: GitBranch, t: 'text-rose-700' },
          { l: 'Delayed', v: data.delayedActivities.length, i: AlertTriangle, t: 'text-amber-700' },
          { l: 'In Progress', v: data.activities.filter(a => a.status === 'In Progress').length, i: Clock, t: 'text-sky-700' },
          { l: 'Completed', v: data.activities.filter(a => a.status === 'Completed').length, i: Clock, t: 'text-emerald-700' },
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

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><CardTitle className="text-sm">Activity Register</CardTitle><CardDescription className="text-xs">{rows.length} activities</CardDescription></div>
            <div className="flex flex-wrap gap-2">
              <div className="relative"><Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…" className="pl-8 h-9 w-48" /></div>
              <Select value={proj} onValueChange={setProj}><SelectTrigger className="h-9 w-40"><SelectValue placeholder="Project" /></SelectTrigger><SelectContent><SelectItem value="all">All Projects</SelectItem>{data.projects.map(p => <SelectItem key={p.id} value={p.id}>{p.code}</SelectItem>)}</SelectContent></Select>
              <Select value={crit} onValueChange={setCrit}><SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="critical">Critical</SelectItem><SelectItem value="normal">Non-critical</SelectItem></SelectContent></Select>
              <Select value={status} onValueChange={setStatus}><SelectTrigger className="h-9 w-36"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="Not Started">Not Started</SelectItem><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="Completed">Completed</SelectItem></SelectContent></Select>
              <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={() => exportCsv('activities', proj !== 'all' ? proj : undefined)}><Download className="h-4 w-4" />Export</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-auto scroll-thin">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[90px]">ID</TableHead>
                  <TableHead className="min-w-[240px]">Activity</TableHead>
                  <TableHead className="w-[90px]">Project</TableHead>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[60px]">Dur</TableHead>
                  <TableHead className="w-[60px]">Rem</TableHead>
                  <TableHead className="w-[70px]">Progress</TableHead>
                  <TableHead className="w-[60px]">Float</TableHead>
                  <TableHead className="w-[90px]">Start</TableHead>
                  <TableHead className="w-[90px]">Finish</TableHead>
                  <TableHead className="w-[100px]">Responsible</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.slice(0, 300).map(a => (
                  <TableRow key={a.id} className={cn('hover:bg-muted/40', a.isCritical && 'bg-rose-50/30 dark:bg-rose-950/10')}>
                    <TableCell className="font-mono text-[10px] text-muted-foreground">{a.activityId}</TableCell>
                    <TableCell><div className="truncate text-xs font-medium max-w-[280px]">{a.name}</div></TableCell>
                    <TableCell className="font-mono text-[10px] text-muted-foreground">{a.project?.code}</TableCell>
                    <TableCell><span className="text-[10px]">{a.type}</span></TableCell>
                    <TableCell><Badge variant="outline" className={`text-[9px] ${statusColor(a.status)}`}>{a.status}</Badge></TableCell>
                    <TableCell className="text-[10px] tabular-nums">{a.duration}d</TableCell>
                    <TableCell className="text-[10px] tabular-nums text-amber-700">{a.remainingDur}d</TableCell>
                    <TableCell><div className="flex items-center gap-1"><div className="h-1.5 w-10 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary" style={{ width: `${a.progress}%` }} /></div><span className="text-[9px] tabular-nums">{a.progress.toFixed(0)}</span></div></TableCell>
                    <TableCell className={cn('text-[10px] tabular-nums font-medium', a.totalFloat === 0 ? 'text-rose-700' : 'text-muted-foreground')}>{a.totalFloat}d</TableCell>
                    <TableCell className="text-[10px]">{fmtDate(a.startDate)}</TableCell>
                    <TableCell className="text-[10px]">{fmtDate(a.finishDate)}</TableCell>
                    <TableCell className="text-[10px] text-muted-foreground">{a.responsible ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
