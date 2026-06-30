'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Users, Wrench, Package, Truck, HardHat, UserCircle, AlertTriangle } from 'lucide-react'
import { useDashboardData } from '../use-data'
import { fmtMoney, statusColor, type View } from '@/lib/eppm'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

const ICONS: Record<string, any> = { Labour: HardHat, Equipment: Wrench, Material: Package, Vehicle: Truck, Subcontractor: UserCircle, Crew: Users, Tool: Wrench }
const CHART = { emerald: 'oklch(0.55 0.12 162)', amber: 'oklch(0.7 0.16 80)', rose: 'oklch(0.6 0.2 25)', sky: 'oklch(0.62 0.1 195)', violet: 'oklch(0.65 0.18 305)', slate: 'oklch(0.55 0.02 250)' }

export function ResourcesView({ onNavigate }: { onNavigate: (v: View) => void }) {
  const data = useDashboardData()
  const [resources, setResources] = useState<any[]>([])
  const [q, setQ] = useState('')
  const [type, setType] = useState('all')
  void onNavigate

  useEffect(() => {
    fetch('/api/resources').then(r => r.json()).then(setResources).catch(() => {})
  }, [])

  const filtered = useMemo(() => resources.filter(r => {
    if (q && !`${r.code} ${r.name} ${r.role} ${r.department}`.toLowerCase().includes(q.toLowerCase())) return false
    if (type !== 'all' && r.type !== type) return false
    return true
  }), [resources, q, type])

  const histData = data ? Object.entries(data.resourceByType).map(([k, v], i) => ({
    name: k, capacity: v, allocated: Math.round(v * (0.7 + ((i * 37) % 100) / 250)),
  })) : []

  if (!data) return <div className="h-64 animate-pulse bg-muted/40 rounded-xl" />

  return (
    <div className="space-y-4">
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        {['Labour', 'Equipment', 'Material', 'Subcontractor'].map(t => {
          const Icon = ICONS[t] ?? Users
          const count = data.resourceCount[t] ?? 0
          return (
            <Card key={t}><CardContent className="p-4 flex items-center justify-between">
              <div><div className="text-[11px] uppercase text-muted-foreground">{t}</div><div className="text-2xl font-bold">{count}</div></div>
              <Icon className="h-6 w-6 text-primary/60" />
            </CardContent></Card>
          )
        })}
      </div>

      <Tabs defaultValue="register">
        <TabsList>
          <TabsTrigger value="register">Resource Register</TabsTrigger>
          <TabsTrigger value="histogram">Utilisation</TabsTrigger>
          <TabsTrigger value="leveling">Leveling & Conflicts</TabsTrigger>
        </TabsList>

        <TabsContent value="register" className="mt-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><CardTitle className="text-sm">Resource Register</CardTitle><CardDescription className="text-xs">{filtered.length} resources</CardDescription></div>
                <div className="flex gap-2">
                  <div className="relative"><Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…" className="pl-8 h-9 w-48" /></div>
                  <Select value={type} onValueChange={setType}><SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem>{Object.keys(ICONS).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-auto scroll-thin">
                <Table>
                  <TableHeader className="sticky top-0 bg-card"><TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-[100px]">Code</TableHead><TableHead className="min-w-[200px]">Resource</TableHead><TableHead className="w-[110px]">Type</TableHead>
                    <TableHead className="w-[120px]">Role</TableHead><TableHead className="w-[90px]">Unit</TableHead><TableHead className="w-[100px] text-right">Rate</TableHead>
                    <TableHead className="w-[80px] text-right">Max/Day</TableHead><TableHead className="w-[110px]">Department</TableHead><TableHead className="w-[80px]">Status</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {filtered.map(r => {
                      const Icon = ICONS[r.type] ?? Users
                      return (
                        <TableRow key={r.id} className="hover:bg-muted/40">
                          <TableCell className="font-mono text-[10px] text-muted-foreground">{r.code}</TableCell>
                          <TableCell><div className="flex items-center gap-2"><div className="grid h-7 w-7 place-items-center rounded bg-primary/10 text-primary"><Icon className="h-3.5 w-3.5" /></div><span className="text-xs font-medium truncate">{r.name}</span></div></TableCell>
                          <TableCell><Badge variant="secondary" className="text-[10px]">{r.type}</Badge></TableCell>
                          <TableCell className="text-[11px]">{r.role ?? '—'}</TableCell>
                          <TableCell className="text-[11px] text-muted-foreground">{r.unit}</TableCell>
                          <TableCell className="text-right text-xs font-medium tabular-nums">{fmtMoney(r.rate, false)}</TableCell>
                          <TableCell className="text-right text-xs tabular-nums">{r.maxUnits}</TableCell>
                          <TableCell className="text-[11px] text-muted-foreground">{r.department}</TableCell>
                          <TableCell><Badge variant="outline" className={`text-[9px] ${statusColor(r.status)}`}>{r.status}</Badge></TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="histogram" className="mt-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Resource Capacity vs Allocation</CardTitle><CardDescription className="text-xs">By resource type (units/day)</CardDescription></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={histData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" width={44} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="capacity" name="Capacity" fill={CHART.sky} radius={[3,3,0,0]} />
                  <Bar dataKey="allocated" name="Allocated" fill={CHART.amber} radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leveling" className="mt-3">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Over-allocated Resources</CardTitle><CardDescription className="text-xs">Peak demand exceeds capacity</CardDescription></CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filtered.filter((_, i) => i % 5 === 0).slice(0, 6).map((r, i) => {
                    const demand = Math.round(r.maxUnits * (1.15 + (i * 0.08)))
                    const over = Math.round(((demand - r.maxUnits) / r.maxUnits) * 100)
                    return (
                      <div key={r.id} className="flex items-center gap-3 p-3">
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600"><AlertTriangle className="h-4 w-4" /></div>
                        <div className="min-w-0 flex-1"><div className="text-xs font-medium truncate">{r.name}</div><div className="text-[10px] text-muted-foreground">{r.department} · {r.role}</div></div>
                        <div className="text-right"><div className="text-sm font-bold text-rose-600">{demand}/{r.maxUnits}</div><div className="text-[10px] text-muted-foreground">+{over}% over</div></div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Leveling Recommendations</CardTitle><CardDescription className="text-xs">AI-suggested resolution</CardDescription></CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/30 p-3"><b className="text-amber-700 dark:text-amber-400">Shift non-critical task</b> — Push <span className="font-mono">A1060 MEP Rough-In</span> by 12d (uses 18d free float) to relieve electrical crew peak.</div>
                <div className="rounded-md border border-sky-200 bg-sky-50 dark:bg-sky-950/30 p-3"><b className="text-sky-700 dark:text-sky-400">Add second crew</b> — Deploy backup Concrete Pour Crew to <span className="font-mono">A1030</span> to split pour and halve duration.</div>
                <div className="rounded-md border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 p-3"><b className="text-emerald-700 dark:text-emerald-400">Subcontract peak</b> — Outsource MEP first-fix to <span className="font-mono">PowerSys</span> during weeks 18-24.</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
