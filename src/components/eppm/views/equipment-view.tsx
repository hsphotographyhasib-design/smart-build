'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Wrench, Search, Download, Plus, AlertTriangle, CheckCircle2, Clock, QrCode, Calendar, Truck, Activity, Fuel, Settings, TrendingUp } from 'lucide-react'
import { fmtMoney, fmtDate, fmtNum, statusColor, type View } from '@/lib/eppm'
import { FadeIn } from '../motion'
import { cn } from '@/lib/utils'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts'

const CHART = { emerald: 'oklch(0.55 0.12 162)', amber: 'oklch(0.7 0.16 80)', rose: 'oklch(0.6 0.2 25)', sky: 'oklch(0.62 0.1 195)', violet: 'oklch(0.65 0.18 305)', slate: 'oklch(0.55 0.02 250)' }

interface Equipment {
  id: string
  code: string
  name: string
  type: string
  project: string
  projectCode: string
  status: 'Operating' | 'Idle' | 'Maintenance' | 'Breakdown' | 'Transport'
  utilisation: number
  hoursToday: number
  fuelLevel: number
  nextService: string
  serviceDays: number
  operator: string
  rate: number
  qrCode: string
}

const EQUIPMENT: Equipment[] = [
  { id: '1', code: 'EQP-CRANE-01', name: 'Tower Crane TC-7032', type: 'Crane', project: 'North Tower', projectCode: 'PRJ-TWR-NORTH', status: 'Operating', utilisation: 84, hoursToday: 7.5, fuelLevel: 72, nextService: '2026-07-15', serviceDays: 18, operator: 'J. Müller', rate: 2400, qrCode: 'QR-TC7032-A' },
  { id: '2', code: 'EQP-CRANE-02', name: 'Tower Crane TC-6015', type: 'Crane', project: 'South Tower', projectCode: 'PRJ-TWR-SOUTH', status: 'Operating', utilisation: 76, hoursToday: 6.8, fuelLevel: 58, nextService: '2026-07-08', serviceDays: 11, operator: 'R. Khan', rate: 2100, qrCode: 'QR-TC6015-B' },
  { id: '3', code: 'EQP-TBM-01', name: 'Tunnel Boring Machine "Eliza"', type: 'TBM', project: 'Metro Tunnel', projectCode: 'PRJ-METRO-TUN', status: 'Operating', utilisation: 92, hoursToday: 23, fuelLevel: 88, nextService: '2026-08-20', serviceDays: 54, operator: 'Crew-TUN-A', rate: 12500, qrCode: 'QR-TBM-ELIZA' },
  { id: '4', code: 'EQP-EXC-01', name: 'Hydraulic Excavator CAT 336', type: 'Excavator', project: 'Solar Farm', projectCode: 'PRJ-SOLAR-100MW', status: 'Operating', utilisation: 88, hoursToday: 8, fuelLevel: 45, nextService: '2026-07-02', serviceDays: 5, operator: 'M. Chen', rate: 1800, qrCode: 'QR-CAT336-1' },
  { id: '5', code: 'EQP-EXC-02', name: 'Hydraulic Excavator CAT 320', type: 'Excavator', project: 'Riverside Bridge', projectCode: 'PRJ-BRIDGE-RIV', status: 'Maintenance', utilisation: 0, hoursToday: 0, fuelLevel: 100, nextService: '2026-06-30', serviceDays: 3, operator: '—', rate: 1600, qrCode: 'QR-CAT320-2' },
  { id: '6', code: 'EQP-DOZER-01', name: 'Bulldozer D8T', type: 'Bulldozer', project: 'Solar Farm', projectCode: 'PRJ-SOLAR-100MW', status: 'Operating', utilisation: 81, hoursToday: 7.2, fuelLevel: 62, nextService: '2026-07-18', serviceDays: 21, operator: 'A. Novak', rate: 1600, qrCode: 'QR-D8T-1' },
  { id: '7', code: 'EQP-PUMP-01', name: 'Concrete Pump 52m', type: 'Pump', project: 'Metro Station A', projectCode: 'PRJ-METRO-STA-A', status: 'Idle', utilisation: 0, hoursToday: 2.5, fuelLevel: 78, nextService: '2026-07-22', serviceDays: 25, operator: 'L. Rossi', rate: 1100, qrCode: 'QR-CP52-1' },
  { id: '8', code: 'EQP-LIFT-01', name: 'Mobile Crane 100T', type: 'Crane', project: 'Hospital', projectCode: 'PRJ-HOSP-300', status: 'Operating', utilisation: 69, hoursToday: 5.5, fuelLevel: 51, nextService: '2026-07-12', serviceDays: 15, operator: 'S. Patel', rate: 1900, qrCode: 'QR-MC100-1' },
  { id: '9', code: 'EQP-EXC-03', name: 'Mini Excavator TB290', type: 'Excavator', project: 'Schools Cluster', projectCode: 'PRJ-SCHOOL-12', status: 'Breakdown', utilisation: 0, hoursToday: 0, fuelLevel: 34, nextService: '2026-06-28', serviceDays: 1, operator: '—', rate: 900, qrCode: 'QR-TB290-3' },
  { id: '10', code: 'EQP-DOZER-02', name: 'Bulldozer D6', type: 'Bulldozer', project: 'Highway Expansion', projectCode: 'PRJ-ROAD-HWY', status: 'Operating', utilisation: 79, hoursToday: 6.8, fuelLevel: 66, nextService: '2026-07-25', serviceDays: 28, operator: 'K. Ali', rate: 1400, qrCode: 'QR-D6-2' },
  { id: '11', code: 'EQP-PUMP-02', name: 'Concrete Pump 42m', type: 'Pump', project: 'Water Treatment Plant', projectCode: 'PRJ-WTP-NEW', status: 'Transport', utilisation: 0, hoursToday: 0, fuelLevel: 90, nextService: '2026-08-05', serviceDays: 39, operator: '—', rate: 950, qrCode: 'QR-CP42-2' },
  { id: '12', code: 'EQP-CRANE-03', name: 'Crawler Crane 250T', type: 'Crane', project: 'Port Terminal', projectCode: 'PRJ-PORT-EXP', status: 'Idle', utilisation: 0, hoursToday: 1.2, fuelLevel: 82, nextService: '2026-08-10', serviceDays: 44, operator: 'T. Wilson', rate: 3200, qrCode: 'QR-CC250-3' },
]

export function EquipmentView({ onNavigate }: { onNavigate: (v: View) => void }) {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [type, setType] = useState('all')
  void onNavigate

  const filtered = useMemo(() => EQUIPMENT.filter(e => {
    if (q && !`${e.code} ${e.name} ${e.project} ${e.operator}`.toLowerCase().includes(q.toLowerCase())) return false
    if (status !== 'all' && e.status !== status) return false
    if (type !== 'all' && e.type !== type) return false
    return true
  }), [q, status, type])

  const operating = EQUIPMENT.filter(e => e.status === 'Operating')
  const maintenance = EQUIPMENT.filter(e => e.status === 'Maintenance' || e.status === 'Breakdown')
  const idle = EQUIPMENT.filter(e => e.status === 'Idle')
  const avgUtil = Math.round(EQUIPMENT.reduce((s, e) => s + e.utilisation, 0) / EQUIPMENT.length)
  const serviceDue = EQUIPMENT.filter(e => e.serviceDays <= 7).length

  // Utilisation by type
  const byType: Record<string, { count: number; util: number }> = {}
  EQUIPMENT.forEach(e => {
    if (!byType[e.type]) byType[e.type] = { count: 0, util: 0 }
    byType[e.type].count++
    byType[e.type].util += e.utilisation
  })
  const typeData = Object.entries(byType).map(([name, v]) => ({ name, count: v.count, avgUtil: Math.round(v.util / v.count) }))

  // Status distribution
  const statusData = [
    { name: 'Operating', value: operating.length, color: CHART.emerald },
    { name: 'Idle', value: idle.length, color: CHART.amber },
    { name: 'Maintenance', value: EQUIPMENT.filter(e => e.status === 'Maintenance').length, color: CHART.sky },
    { name: 'Breakdown', value: EQUIPMENT.filter(e => e.status === 'Breakdown').length, color: CHART.rose },
    { name: 'Transport', value: EQUIPMENT.filter(e => e.status === 'Transport').length, color: CHART.violet },
  ].filter(s => s.value > 0)

  return (
    <FadeIn>
      <div className="space-y-4">
        {/* KPI strip */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {[
            { l: 'Total Fleet', v: fmtNum(EQUIPMENT.length), i: Wrench, t: 'text-foreground', bg: 'bg-muted/50 text-muted-foreground' },
            { l: 'Operating', v: fmtNum(operating.length), i: Activity, t: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600' },
            { l: 'Avg Utilisation', v: `${avgUtil}%`, i: TrendingUp, t: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600' },
            { l: 'Idle', v: fmtNum(idle.length), i: Clock, t: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600' },
            { l: 'In Service/Break', v: fmtNum(maintenance.length), i: Settings, t: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600' },
            { l: 'Service Due ≤7d', v: fmtNum(serviceDue), i: AlertTriangle, t: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600' },
          ].map(s => (
            <Card key={s.l} className="relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/40 to-transparent" />
              <CardContent className="p-4 flex items-center justify-between">
                <div><div className="text-[11px] uppercase text-muted-foreground">{s.l}</div><div className={cn('mt-1 text-xl font-bold tabular-nums', s.t)}>{s.v}</div></div>
                <div className={cn('grid h-9 w-9 place-items-center rounded-lg', s.bg)}><s.i className="h-[18px] w-[18px]" /></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="fleet">
          <TabsList>
            <TabsTrigger value="fleet">Fleet Register</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance Schedule</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Fleet Register */}
          <TabsContent value="fleet" className="mt-3">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div><CardTitle className="text-sm">Equipment Fleet Register</CardTitle><CardDescription className="text-xs">{filtered.length} of {EQUIPMENT.length} units</CardDescription></div>
                  <div className="flex flex-wrap gap-2">
                    <div className="relative"><Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…" className="pl-8 h-9 w-44" /></div>
                    <Select value={status} onValueChange={setStatus}><SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="Operating">Operating</SelectItem><SelectItem value="Idle">Idle</SelectItem><SelectItem value="Maintenance">Maintenance</SelectItem><SelectItem value="Breakdown">Breakdown</SelectItem><SelectItem value="Transport">Transport</SelectItem></SelectContent></Select>
                    <Select value={type} onValueChange={setType}><SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem><SelectItem value="Crane">Crane</SelectItem><SelectItem value="Excavator">Excavator</SelectItem><SelectItem value="TBM">TBM</SelectItem><SelectItem value="Bulldozer">Bulldozer</SelectItem><SelectItem value="Pump">Pump</SelectItem></SelectContent></Select>
                    <Button size="sm" className="h-9 gap-1.5"><Plus className="h-4 w-4" />Add</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[560px] overflow-auto scroll-thin">
                  <Table>
                    <TableHeader className="sticky top-0 bg-card"><TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-[110px]">Code</TableHead><TableHead className="min-w-[180px]">Equipment</TableHead><TableHead className="w-[90px]">Project</TableHead>
                      <TableHead className="w-[90px]">Status</TableHead><TableHead className="w-[80px]">Util</TableHead><TableHead className="w-[70px] text-right">Hrs</TableHead>
                      <TableHead className="w-[70px]">Fuel</TableHead><TableHead className="w-[100px]">Next Service</TableHead><TableHead className="w-[90px]">Operator</TableHead><TableHead className="w-[60px]">QR</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {filtered.map(e => (
                        <TableRow key={e.id} className={cn('hover:bg-muted/40', e.status === 'Breakdown' && 'bg-rose-50/30 dark:bg-rose-950/10', e.status === 'Maintenance' && 'bg-amber-50/20 dark:bg-amber-950/10')}>
                          <TableCell className="font-mono text-[10px] text-muted-foreground">{e.code}</TableCell>
                          <TableCell><div className="text-xs font-medium truncate max-w-[200px]">{e.name}</div><div className="text-[9px] text-muted-foreground">{e.type}</div></TableCell>
                          <TableCell className="font-mono text-[10px] text-muted-foreground">{e.projectCode.replace('PRJ-','')}</TableCell>
                          <TableCell><Badge variant="outline" className={cn('text-[9px]', statusColor(e.status))}>{e.status}</Badge></TableCell>
                          <TableCell><div className="flex items-center gap-1"><div className="h-1.5 w-10 rounded-full bg-muted overflow-hidden"><div className={cn('h-full', e.utilisation >= 80 ? 'bg-emerald-500' : e.utilisation >= 50 ? 'bg-amber-500' : 'bg-rose-500')} style={{ width: `${e.utilisation}%` }} /></div><span className="text-[9px] tabular-nums">{e.utilisation}</span></div></TableCell>
                          <TableCell className="text-right text-[10px] tabular-nums">{e.hoursToday}</TableCell>
                          <TableCell><div className="flex items-center gap-1"><Fuel className="h-2.5 w-2.5 text-muted-foreground" /><span className={cn('text-[9px] tabular-nums', e.fuelLevel < 40 ? 'text-rose-600 font-medium' : '')}>{e.fuelLevel}%</span></div></TableCell>
                          <TableCell className={cn('text-[10px]', e.serviceDays <= 3 ? 'text-rose-600 font-medium' : e.serviceDays <= 7 ? 'text-amber-600 font-medium' : 'text-muted-foreground')}>{fmtDate(e.nextService)}</TableCell>
                          <TableCell className="text-[10px] text-muted-foreground">{e.operator}</TableCell>
                          <TableCell><Button variant="ghost" size="sm" className="h-6 w-6 p-0"><QrCode className="h-3.5 w-3.5" /></Button></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Maintenance Schedule */}
          <TabsContent value="maintenance" className="mt-3">
            <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Upcoming Maintenance Schedule</CardTitle><CardDescription className="text-xs">Sorted by next service date</CardDescription></CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[460px] px-4 pb-3">
                    <div className="space-y-2">
                      {[...EQUIPMENT].sort((a, b) => a.serviceDays - b.serviceDays).map(e => {
                        const urgent = e.serviceDays <= 3
                        const soon = e.serviceDays <= 7
                        return (
                          <div key={e.id} className={cn('flex items-center gap-3 rounded-lg border p-3', urgent ? 'border-rose-200 bg-rose-50/30 dark:bg-rose-950/10' : soon ? 'border-amber-200 bg-amber-50/30 dark:bg-amber-950/10' : '')}>
                            <div className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-lg', urgent ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/50' : soon ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/50' : 'bg-muted text-muted-foreground')}><Settings className="h-4 w-4" /></div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5"><span className="font-mono text-[10px] text-muted-foreground">{e.code}</span><span className="truncate text-xs font-medium">{e.name}</span></div>
                              <div className="text-[10px] text-muted-foreground">{e.project} · {e.operator}</div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className={cn('text-xs font-bold', urgent ? 'text-rose-600' : soon ? 'text-amber-600' : 'text-foreground')}>{e.serviceDays}d</div>
                              <div className="text-[10px] text-muted-foreground">{fmtDate(e.nextService)}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              <div className="space-y-4">
                <Card className="bg-gradient-to-br from-rose/5 to-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2"><AlertTriangle className="h-4 w-4 text-rose-600" /><span className="text-sm font-semibold">Critical Alerts</span></div>
                    <div className="space-y-2">
                      {EQUIPMENT.filter(e => e.status === 'Breakdown').map(e => (
                        <div key={e.id} className="rounded-md border border-rose-200 bg-rose-50 dark:bg-rose-950/30 p-2.5 text-xs"><div className="font-medium">{e.name}</div><div className="text-[10px] text-muted-foreground mt-0.5">Breakdown — requires immediate repair</div></div>
                      ))}
                      {EQUIPMENT.filter(e => e.fuelLevel < 40 && e.status === 'Operating').map(e => (
                        <div key={e.id} className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/30 p-2.5 text-xs"><div className="font-medium">{e.name}</div><div className="text-[10px] text-muted-foreground mt-0.5">Low fuel: {e.fuelLevel}%</div></div>
                      ))}
                      {EQUIPMENT.filter(e => e.serviceDays <= 3).map(e => (
                        <div key={e.id} className="rounded-md border border-rose-200 bg-rose-50 dark:bg-rose-950/30 p-2.5 text-xs"><div className="font-medium">{e.name}</div><div className="text-[10px] text-muted-foreground mt-0.5">Service due in {e.serviceDays}d</div></div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-[11px] uppercase text-muted-foreground">Fleet Value (daily rate)</div>
                    <div className="text-2xl font-bold mt-1">{fmtMoney(EQUIPMENT.reduce((s,e)=>s+e.rate,0))}<span className="text-xs text-muted-foreground font-normal">/day</span></div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Across {EQUIPMENT.length} units</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="mt-3">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Utilisation by Equipment Type</CardTitle><CardDescription className="text-xs">Avg operating hours %</CardDescription></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={typeData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                      <YAxis yAxisId="left" tick={{ fontSize: 9 }} className="text-muted-foreground" width={32} />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 100]} unit="%" tick={{ fontSize: 9 }} className="text-muted-foreground" width={36} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar yAxisId="left" dataKey="count" name="Units" fill={CHART.sky} radius={[3,3,0,0]} />
                      <Bar yAxisId="right" dataKey="avgUtil" name="Avg Util %" fill={CHART.emerald} radius={[3,3,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Fleet Status Distribution</CardTitle><CardDescription className="text-xs">Current operational state</CardDescription></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: 10 }}>
                        {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </FadeIn>
  )
}

