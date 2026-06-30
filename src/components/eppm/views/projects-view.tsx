'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Briefcase, Search, Plus, Filter, Download, MapPin, User, CalendarDays } from 'lucide-react'
import { useDashboardData } from '../use-data'
import { fmtMoney, fmtPct, fmtDate, healthColor, statusColor, exportCsv, type View } from '@/lib/eppm'

export function ProjectsView({ onNavigate, onOpenProject }: { onNavigate: (v: View) => void; onOpenProject: (id: string) => void }) {
  const data = useDashboardData()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [health, setHealth] = useState('all')

  const projects = useMemo(() => {
    if (!data) return []
    return data.projects.filter(p => {
      if (q && !`${p.code} ${p.name} ${p.client} ${p.location}`.toLowerCase().includes(q.toLowerCase())) return false
      if (status !== 'all' && p.status !== status) return false
      if (health !== 'all' && p.health !== health) return false
      return true
    })
  }, [data, q, status, health])

  if (!data) return <div className="h-64 animate-pulse bg-muted/40 rounded-xl" />

  const totalBudget = projects.reduce((s, p) => s + p.budget, 0)
  const totalActual = projects.reduce((s, p) => s + p.actualCost, 0)

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        {[
          { label: 'Active Projects', value: projects.length, tone: 'text-emerald-600' },
          { label: 'Total Budget', value: fmtMoney(totalBudget), tone: 'text-foreground' },
          { label: 'Spend to Date', value: fmtMoney(totalActual), tone: 'text-amber-600' },
          { label: 'Avg Progress', value: fmtPct(projects.length ? projects.reduce((s,p)=>s+p.progress,0)/projects.length : 0), tone: 'text-sky-600' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{s.label}</div>
              <div className={`mt-1 text-xl font-bold tabular-nums ${s.tone}`}>{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-sm">Project Register</CardTitle>
              <CardDescription className="text-xs">{projects.length} of {data.projects.length} projects shown</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search projects…" className="pl-8 h-9 w-56" />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-9 w-36"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={health} onValueChange={setHealth}>
                <SelectTrigger className="h-9 w-32"><SelectValue placeholder="Health" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Health</SelectItem>
                  <SelectItem value="Green">Green</SelectItem>
                  <SelectItem value="Yellow">Yellow</SelectItem>
                  <SelectItem value="Red">Red</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={() => exportCsv('projects')}><Download className="h-4 w-4" />Export</Button>
              <Button size="sm" className="h-9 gap-1.5"><Plus className="h-4 w-4" />New</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto scroll-thin">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[120px]">Code</TableHead>
                  <TableHead className="min-w-[260px]">Project</TableHead>
                  <TableHead className="w-[110px]">Status</TableHead>
                  <TableHead className="w-[90px]">Health</TableHead>
                  <TableHead className="w-[90px]">Progress</TableHead>
                  <TableHead className="w-[130px] text-right">Budget</TableHead>
                  <TableHead className="w-[120px] text-right">Spend</TableHead>
                  <TableHead className="w-[120px]">Finish</TableHead>
                  <TableHead className="w-[100px]">Manager</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map(p => (
                  <TableRow key={p.id} className="cursor-pointer hover:bg-muted/40" onClick={() => onOpenProject(p.id)}>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">{p.code}</TableCell>
                    <TableCell>
                      <div className="font-medium text-sm truncate max-w-[280px]">{p.name}</div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                        <span className="inline-flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{p.location}</span>
                        <span>·</span><span>{p.client}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className={`text-[10px] ${statusColor(p.status)}`}>{p.status}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className={`text-[10px] ${healthColor(p.health)}`}>{p.health}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Progress value={p.progress} className="h-1.5 w-14" />
                        <span className="text-[10px] tabular-nums text-muted-foreground w-8">{p.progress.toFixed(0)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-xs font-medium">{fmtMoney(p.budget)}</TableCell>
                    <TableCell className="text-right tabular-nums text-xs">
                      <div className="text-amber-600">{fmtMoney(p.actualCost)}</div>
                      <div className="text-[9px] text-muted-foreground">{p.budget ? ((p.actualCost/p.budget)*100).toFixed(0) : 0}%</div>
                    </TableCell>
                    <TableCell className="text-[11px]">{fmtDate(p.finishDate)}</TableCell>
                    <TableCell className="text-[11px] text-muted-foreground">{p.managerId ?? '—'}</TableCell>
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
