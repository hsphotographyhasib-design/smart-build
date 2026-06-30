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
import { Truck, Package, Search, Download, Plus, AlertTriangle, CheckCircle2, Clock, Factory, MapPin, TrendingUp, CalendarClock } from 'lucide-react'
import { useDashboardData } from '../use-data'
import { fmtMoney, fmtDate, fmtNum, statusColor, exportCsv, type View } from '@/lib/eppm'
import { FadeIn } from '../motion'
import { cn } from '@/lib/utils'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts'

const CHART = { emerald: 'oklch(0.55 0.12 162)', amber: 'oklch(0.7 0.16 80)', rose: 'oklch(0.6 0.2 25)', sky: 'oklch(0.62 0.1 195)', violet: 'oklch(0.65 0.18 305)', slate: 'oklch(0.55 0.02 250)' }

interface PR {
  id: string
  code: string
  material: string
  project: string
  projectCode: string
  quantity: number
  unit: string
  supplier: string
  leadTime: number
  status: 'Draft' | 'Requested' | 'Approved' | 'Ordered' | 'Delivered' | 'Delayed'
  orderDate: string
  deliveryDate: string
  cost: number
  category: string
}

const SUPPLIERS = [
  { name: 'BuildMat Supplies Ltd', rating: 4.6, onTime: 94, country: 'Singapore' },
  { name: 'SteelCorp International', rating: 4.3, onTime: 88, country: 'UAE' },
  { name: 'Concrete Solutions Co', rating: 4.7, onTime: 96, country: 'Singapore' },
  { name: 'PowerSys Electrical', rating: 4.2, onTime: 85, country: 'Malaysia' },
  { name: 'ClimateCo HVAC', rating: 4.5, onTime: 91, country: 'Thailand' },
  { name: 'GlassWorks Asia', rating: 4.1, onTime: 82, country: 'China' },
  { name: 'Formwork Masters', rating: 4.4, onTime: 89, country: 'Singapore' },
]

const PURCHASE_REQUESTS: PR[] = [
  { id: '1', code: 'PR-2026-0142', material: 'Ready-Mix Concrete C40', project: 'Metro Station A', projectCode: 'PRJ-METRO-STA-A', quantity: 5800, unit: 'm³', supplier: 'Concrete Solutions Co', leadTime: 3, status: 'Ordered', orderDate: '2026-06-20', deliveryDate: '2026-06-28', cost: 841000, category: 'Concrete' },
  { id: '2', code: 'PR-2026-0143', material: 'Reinforcement Steel Rebar Y16', project: 'Metro Station A', projectCode: 'PRJ-METRO-STA-A', quantity: 320, unit: 'ton', supplier: 'SteelCorp International', leadTime: 21, status: 'Approved', orderDate: '2026-06-25', deliveryDate: '2026-07-20', cost: 262400, category: 'Steel' },
  { id: '3', code: 'PR-2026-0144', material: 'Structural Steel Sections W360', project: 'North Tower', projectCode: 'PRJ-TWR-NORTH', quantity: 720, unit: 'ton', supplier: 'SteelCorp International', leadTime: 45, status: 'Delayed', orderDate: '2026-05-15', deliveryDate: '2026-07-05', cost: 1044000, category: 'Steel' },
  { id: '4', code: 'PR-2026-0145', material: 'PV Modules 540W Mono', project: 'Solar Farm 100MW', projectCode: 'PRJ-SOLAR-100MW', quantity: 84000, unit: 'No', supplier: 'PowerSys Electrical', leadTime: 60, status: 'Ordered', orderDate: '2026-06-10', deliveryDate: '2026-08-15', cost: 25200000, category: 'Electrical' },
  { id: '5', code: 'PR-2026-0146', material: 'Curtain Wall Glass Units', project: 'North Tower', projectCode: 'PRJ-TWR-NORTH', quantity: 1200, unit: 'panel', supplier: 'GlassWorks Asia', leadTime: 75, status: 'Requested', orderDate: '2026-06-28', deliveryDate: '2026-09-15', cost: 3600000, category: 'Finishes' },
  { id: '6', code: 'PR-2026-0147', material: 'HVAC Chillers 500RT', project: '300-Bed Hospital', projectCode: 'PRJ-HOSP-300', quantity: 4, unit: 'No', supplier: 'ClimateCo HVAC', leadTime: 90, status: 'Approved', orderDate: '2026-06-22', deliveryDate: '2026-09-25', cost: 1800000, category: 'MEP' },
  { id: '7', code: 'PR-2026-0148', material: 'Formwork Plywood 18mm', project: 'Metro Station A', projectCode: 'PRJ-METRO-STA-A', quantity: 2500, unit: 'm²', supplier: 'Formwork Masters', leadTime: 7, status: 'Delivered', orderDate: '2026-06-12', deliveryDate: '2026-06-19', cost: 95000, category: 'Formwork' },
  { id: '8', code: 'PR-2026-0149', material: 'Electrical Cables 4C 95mm²', project: 'Solar Farm 100MW', projectCode: 'PRJ-SOLAR-100MW', quantity: 45000, unit: 'm', supplier: 'PowerSys Electrical', leadTime: 30, status: 'Ordered', orderDate: '2026-06-18', deliveryDate: '2026-07-20', cost: 1215000, category: 'Electrical' },
  { id: '9', code: 'PR-2026-0150', material: 'Cement OPC 52.5N', project: 'Riverside Bridge', projectCode: 'PRJ-BRIDGE-RIV', quantity: 850, unit: 'ton', supplier: 'BuildMat Supplies Ltd', leadTime: 5, status: 'Delivered', orderDate: '2026-06-14', deliveryDate: '2026-06-21', cost: 80750, category: 'Concrete' },
  { id: '10', code: 'PR-2026-0151', material: 'Inverter Stations 2.5MW', project: 'Solar Farm 100MW', projectCode: 'PRJ-SOLAR-100MW', quantity: 12, unit: 'No', supplier: 'PowerSys Electrical', leadTime: 75, status: 'Approved', orderDate: '2026-06-24', deliveryDate: '2026-09-10', cost: 3600000, category: 'Electrical' },
  { id: '11', code: 'PR-2026-0152', material: 'Architectural Paint Premium', project: 'Luxury Mall', projectCode: 'PRJ-MALL-LUX', quantity: 1800, unit: 'L', supplier: 'BuildMat Supplies Ltd', leadTime: 10, status: 'Draft', orderDate: '2026-07-01', deliveryDate: '2026-07-12', cost: 86400, category: 'Finishes' },
  { id: '12', code: 'PR-2026-0153', material: 'Mounting Structure Galvanised', project: 'Solar Farm 100MW', projectCode: 'PRJ-SOLAR-100MW', quantity: 1200, unit: 'ton', supplier: 'SteelCorp International', leadTime: 40, status: 'Delayed', orderDate: '2026-05-20', deliveryDate: '2026-07-05', cost: 1740000, category: 'Steel' },
  { id: '13', code: 'PR-2026-0154', material: 'MEP Pipework Copper 50mm', project: 'North Tower', projectCode: 'PRJ-TWR-NORTH', quantity: 8500, unit: 'm', supplier: 'BuildMat Supplies Ltd', leadTime: 14, status: 'Requested', orderDate: '2026-06-30', deliveryDate: '2026-07-15', cost: 408000, category: 'MEP' },
  { id: '14', code: 'PR-2026-0155', material: 'Hospital Medical Gas Pipeline', project: '300-Bed Hospital', projectCode: 'PRJ-HOSP-300', quantity: 3200, unit: 'm', supplier: 'PowerSys Electrical', leadTime: 35, status: 'Approved', orderDate: '2026-06-26', deliveryDate: '2026-07-31', cost: 480000, category: 'MEP' },
  { id: '15', code: 'PR-2026-0156', material: 'Waterproofing Membrane', project: 'Water Treatment Plant', projectCode: 'PRJ-WTP-NEW', quantity: 4500, unit: 'm²', supplier: 'BuildMat Supplies Ltd', leadTime: 12, status: 'Ordered', orderDate: '2026-06-21', deliveryDate: '2026-07-05', cost: 157500, category: 'Waterproofing' },
]

export function ProcurementView({ onNavigate }: { onNavigate: (v: View) => void }) {
  const data = useDashboardData()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [category, setCategory] = useState('all')
  void onNavigate

  const filtered = useMemo(() => PURCHASE_REQUESTS.filter(r => {
    if (q && !`${r.code} ${r.material} ${r.supplier} ${r.project}`.toLowerCase().includes(q.toLowerCase())) return false
    if (status !== 'all' && r.status !== status) return false
    if (category !== 'all' && r.category !== category) return false
    return true
  }), [q, status, category])

  if (!data) return <div className="h-64 animate-pulse bg-muted/40 rounded-xl" />

  const totalValue = PURCHASE_REQUESTS.reduce((s, r) => s + r.cost, 0)
  const delayed = PURCHASE_REQUESTS.filter(r => r.status === 'Delayed')
  const ordered = PURCHASE_REQUESTS.filter(r => r.status === 'Ordered')
  const delivered = PURCHASE_REQUESTS.filter(r => r.status === 'Delivered')
  const pending = PURCHASE_REQUESTS.filter(r => ['Draft', 'Requested', 'Approved'].includes(r.status))

  // Spend by category
  const byCategory: Record<string, number> = {}
  PURCHASE_REQUESTS.forEach(r => { byCategory[r.category] = (byCategory[r.category] ?? 0) + r.cost })
  const catData = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([name, value], i) => ({ name, value, color: [CHART.emerald, CHART.sky, CHART.amber, CHART.violet, CHART.rose, CHART.slate][i % 6] }))

  // Lead-time chart
  const leadData = SUPPLIERS.map(s => ({ name: s.name.split(' ')[0], leadTime: [3, 21, 5, 30, 90, 75, 7][SUPPLIERS.indexOf(s)] ?? 14, onTime: s.onTime }))

  const today = new Date()

  return (
    <FadeIn>
      <div className="space-y-4">
        {/* KPI strip */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4 xl:grid-cols-6">
          {[
            { l: 'Total PR Value', v: fmtMoney(totalValue), i: Package, t: 'text-foreground', bg: 'bg-muted/50 text-muted-foreground' },
            { l: 'Open Requests', v: fmtNum(pending.length), i: Clock, t: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600' },
            { l: 'On Order', v: fmtNum(ordered.length), i: Truck, t: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600' },
            { l: 'Delivered', v: fmtNum(delivered.length), i: CheckCircle2, t: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600' },
            { l: 'Delayed', v: fmtNum(delayed.length), i: AlertTriangle, t: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600' },
            { l: 'Active Suppliers', v: fmtNum(SUPPLIERS.length), i: Factory, t: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/40 text-violet-600' },
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

        <Tabs defaultValue="register">
          <TabsList>
            <TabsTrigger value="register">Purchase Requests</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Purchase Requests */}
          <TabsContent value="register" className="mt-3">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div><CardTitle className="text-sm">Purchase Request Register</CardTitle><CardDescription className="text-xs">{filtered.length} of {PURCHASE_REQUESTS.length} requests</CardDescription></div>
                  <div className="flex flex-wrap gap-2">
                    <div className="relative"><Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…" className="pl-8 h-9 w-44" /></div>
                    <Select value={status} onValueChange={setStatus}><SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="Draft">Draft</SelectItem><SelectItem value="Requested">Requested</SelectItem><SelectItem value="Approved">Approved</SelectItem><SelectItem value="Ordered">Ordered</SelectItem><SelectItem value="Delivered">Delivered</SelectItem><SelectItem value="Delayed">Delayed</SelectItem></SelectContent></Select>
                    <Select value={category} onValueChange={setCategory}><SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Categories</SelectItem>{Object.keys(byCategory).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                    <Button variant="outline" size="sm" className="h-9 gap-1.5"><Download className="h-4 w-4" />Export</Button>
                    <Button size="sm" className="h-9 gap-1.5"><Plus className="h-4 w-4" />New PR</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[560px] overflow-auto scroll-thin">
                  <Table>
                    <TableHeader className="sticky top-0 bg-card"><TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-[110px]">PR Code</TableHead><TableHead className="min-w-[180px]">Material</TableHead><TableHead className="w-[90px]">Project</TableHead>
                      <TableHead className="w-[100px] text-right">Qty</TableHead><TableHead className="w-[130px]">Supplier</TableHead><TableHead className="w-[70px] text-right">Lead</TableHead>
                      <TableHead className="w-[90px]">Status</TableHead><TableHead className="w-[90px]">Delivery</TableHead><TableHead className="w-[110px] text-right">Value</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {filtered.map(r => {
                        const overdue = r.status !== 'Delivered' && new Date(r.deliveryDate) < today
                        return (
                          <TableRow key={r.id} className={cn('hover:bg-muted/40', r.status === 'Delayed' && 'bg-rose-50/30 dark:bg-rose-950/10')}>
                            <TableCell className="font-mono text-[10px] text-muted-foreground">{r.code}</TableCell>
                            <TableCell><div className="text-xs font-medium truncate max-w-[200px]">{r.material}</div><div className="text-[9px] text-muted-foreground">{r.category}</div></TableCell>
                            <TableCell className="font-mono text-[10px] text-muted-foreground">{r.projectCode}</TableCell>
                            <TableCell className="text-right text-[11px] tabular-nums">{fmtNum(r.quantity)} <span className="text-[9px] text-muted-foreground">{r.unit}</span></TableCell>
                            <TableCell className="text-[11px] truncate max-w-[120px]">{r.supplier.split(' ')[0]}</TableCell>
                            <TableCell className="text-right text-[10px] tabular-nums">{r.leadTime}d</TableCell>
                            <TableCell><Badge variant="outline" className={cn('text-[9px]', statusColor(r.status), overdue && r.status !== 'Delivered' && 'border-rose-300 text-rose-600')}>{r.status}</Badge></TableCell>
                            <TableCell className={cn('text-[10px]', overdue && r.status !== 'Delivered' ? 'text-rose-600 font-medium' : 'text-muted-foreground')}>{fmtDate(r.deliveryDate)}</TableCell>
                            <TableCell className="text-right text-[11px] tabular-nums font-medium">{fmtMoney(r.cost, false)}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suppliers */}
          <TabsContent value="suppliers" className="mt-3">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {SUPPLIERS.map(s => {
                const prs = PURCHASE_REQUESTS.filter(r => r.supplier === s.name)
                const value = prs.reduce((a, r) => a + r.cost, 0)
                return (
                  <Card key={s.name} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary shrink-0"><Factory className="h-4.5 w-4.5" /></div>
                          <div className="min-w-0"><CardTitle className="text-sm truncate">{s.name}</CardTitle><CardDescription className="text-[11px] flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{s.country}</CardDescription></div>
                        </div>
                        <Badge variant="outline" className="text-[9px] shrink-0">★ {s.rating}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><div className="text-[10px] uppercase text-muted-foreground">On-time Rate</div><div className={cn('font-bold', s.onTime >= 90 ? 'text-emerald-600' : s.onTime >= 85 ? 'text-amber-600' : 'text-rose-600')}>{s.onTime}%</div></div>
                        <div><div className="text-[10px] uppercase text-muted-foreground">Open Orders</div><div className="font-bold">{prs.length}</div></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground pt-1 border-t"><span>Order value</span><span className="font-medium tabular-nums">{fmtMoney(value)}</span></div>
                      <Progress value={s.onTime} className="h-1.5" />
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="mt-3">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Spend by Category</CardTitle><CardDescription className="text-xs">Total procurement value</CardDescription></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: 10 }}>
                        {catData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: any) => fmtMoney(v, false)} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Supplier Lead Times & On-time Performance</CardTitle><CardDescription className="text-xs">Days vs on-time %</CardDescription></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={leadData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} className="text-muted-foreground" />
                      <YAxis yAxisId="left" tick={{ fontSize: 9 }} className="text-muted-foreground" width={36} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} domain={[0, 100]} unit="%" className="text-muted-foreground" width={36} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar yAxisId="left" dataKey="leadTime" name="Lead Time (days)" fill={CHART.amber} radius={[3,3,0,0]} />
                      <Bar yAxisId="right" dataKey="onTime" name="On-time %" fill={CHART.emerald} radius={[3,3,0,0]} />
                    </BarChart>
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
