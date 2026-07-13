'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { GitBranch, Zap, AlertTriangle } from 'lucide-react'
import { useDashboardData } from '../use-data'
import { fmtDate, fmtNum, type View } from '@/lib/eppm'
import { cn } from '@/lib/utils'

export function CriticalPathView({ onNavigate }: { onNavigate: (v: View) => void }) {
  const data = useDashboardData()
  if (!data) return <div className="h-64 animate-pulse bg-muted/40 rounded-xl" />
  void onNavigate

  const crit = data.criticalActivities
  const byProject = crit.reduce((acc, a) => { (acc[a.project?.code ?? ''] ??= []).push(a); return acc }, {} as Record<string, any[]>)

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between"><div><div className="text-[11px] uppercase text-muted-foreground">Critical Activities</div><div className="text-2xl font-bold text-rose-700">{crit.length}</div></div><GitBranch className="h-6 w-6 text-rose-700" /></div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between"><div><div className="text-[11px] uppercase text-muted-foreground">Zero Float</div><div className="text-2xl font-bold">{crit.filter(a => a.totalFloat === 0).length}</div></div><Zap className="h-6 w-6 text-amber-700" /></div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between"><div><div className="text-[11px] uppercase text-muted-foreground">Avg Float (crit)</div><div className="text-2xl font-bold">{(crit.reduce((s,a)=>s+a.totalFloat,0)/Math.max(1,crit.length)).toFixed(1)}d</div></div><AlertTriangle className="h-6 w-6 text-muted-foreground" /></div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Critical Path Network</CardTitle><CardDescription className="text-xs">Activities with zero or near-zero float. Any slippage delays project finish 1:1.</CardDescription></CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-auto scroll-thin">
            <Table>
              <TableHeader className="sticky top-0 bg-card"><TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-[90px]">ID</TableHead><TableHead className="min-w-[260px]">Activity</TableHead><TableHead className="w-[90px]">Project</TableHead>
                <TableHead className="w-[70px]">Status</TableHead><TableHead className="w-[60px]">Dur</TableHead><TableHead className="w-[60px]">Float</TableHead>
                <TableHead className="w-[70px]">Progress</TableHead><TableHead className="w-[90px]">Early Start</TableHead><TableHead className="w-[90px]">Late Finish</TableHead><TableHead className="w-[100px]">Responsible</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {crit.map(a => (
                  <TableRow key={a.id} className="hover:bg-rose-50/40 dark:hover:bg-rose-950/20">
                    <TableCell className="font-mono text-[10px] text-muted-foreground">{a.activityId}</TableCell>
                    <TableCell><div className="text-xs font-medium truncate max-w-[300px]">{a.name}</div></TableCell>
                    <TableCell className="font-mono text-[10px]">{a.project?.code}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[9px]">{a.status}</Badge></TableCell>
                    <TableCell className="text-[10px] tabular-nums">{a.duration}d</TableCell>
                    <TableCell className={cn('text-[10px] tabular-nums font-bold', a.totalFloat === 0 ? 'text-rose-700' : 'text-amber-700')}>{a.totalFloat}d</TableCell>
                    <TableCell><div className="flex items-center gap-1"><div className="h-1.5 w-10 rounded-full bg-muted overflow-hidden"><div className="h-full bg-rose-500" style={{ width: `${a.progress}%` }} /></div><span className="text-[9px]">{a.progress.toFixed(0)}</span></div></TableCell>
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

      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(byProject).map(([code, acts]) => (
          <Card key={code}>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{code} · {fmtNum(acts.length)} critical</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {acts.slice(0, 6).map(a => (
                  <div key={a.id} className="flex items-center gap-2 rounded border p-2">
                    <GitBranch className="h-3.5 w-3.5 text-rose-700 shrink-0" />
                    <div className="min-w-0 flex-1"><div className="truncate text-xs font-medium">{a.name}</div><div className="text-[10px] text-muted-foreground">{fmtDate(a.startDate)} → {fmtDate(a.finishDate)}</div></div>
                    <Badge variant="outline" className="text-[9px] border-rose-200 text-rose-700">{a.progress.toFixed(0)}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
