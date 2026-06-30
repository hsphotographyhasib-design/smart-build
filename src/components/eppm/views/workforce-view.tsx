'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { HardHat, Search, Download, Plus, Users, TrendingUp, Award, Calendar, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react'
import { fmtMoney, fmtNum, fmtDate, statusColor, type View } from '@/lib/eppm'
import { FadeIn } from '../motion'
import { cn } from '@/lib/utils'
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

const CHART = { emerald: 'oklch(0.55 0.12 162)', amber: 'oklch(0.7 0.16 80)', rose: 'oklch(0.6 0.2 25)', sky: 'oklch(0.62 0.1 195)', violet: 'oklch(0.65 0.18 305)', slate: 'oklch(0.55 0.02 250)' }

interface Crew {
  id: string
  name: string
  type: string
  project: string
  projectCode: string
  size: number
  allocated: number
  available: number
  shift: string
  competency: number
  certifications: number
  status: 'Active' | 'Rotating' | 'Standby' | 'Mobilising'
  foreman: string
  weeklyHours: number
  overtime: number
}

const CREWS: Crew[] = [
  { id: '1', name: 'Steel Fixer Crew A', type: 'Structural', project: 'North Tower', projectCode: 'PRJ-TWR-NORTH', size: 12, allocated: 12, available: 0, shift: 'Day', competency: 92, certifications: 8, status: 'Active', foreman: 'J. Müller', weeklyHours: 48, overtime: 6 },
  { id: '2', name: 'Concrete Pour Crew', type: 'Civil', project: 'Metro Station A', projectCode: 'PRJ-METRO-STA-A', size: 10, allocated: 10, available: 0, shift: 'Day', competency: 88, certifications: 6, status: 'Active', foreman: 'R. Khan', weeklyHours: 50, overtime: 8 },
  { id: '3', name: 'Masonry Crew', type: 'Finishing', project: 'Luxury Mall', projectCode: 'PRJ-MALL-LUX', size: 8, allocated: 6, available: 2, shift: 'Day', competency: 84, certifications: 5, status: 'Active', foreman: 'L. Rossi', weeklyHours: 44, overtime: 2 },
  { id: '4', name: 'Electrical Team Alpha', type: 'MEP', project: 'Solar Farm', projectCode: 'PRJ-SOLAR-100MW', size: 15, allocated: 15, available: 0, shift: 'Day', competency: 95, certifications: 12, status: 'Active', foreman: 'A. Novak', weeklyHours: 54, overtime: 12 },
  { id: '5', name: 'MEP Mechanical Team', type: 'MEP', project: 'Hospital', projectCode: 'PRJ-HOSP-300', size: 12, allocated: 10, available: 2, shift: 'Day', competency: 90, certifications: 9, status: 'Active', foreman: 'S. Patel', weeklyHours: 46, overtime: 4 },
  { id: '6', name: 'Plumbing Crew', type: 'MEP', project: 'North Tower', projectCode: 'PRJ-TWR-NORTH', size: 8, allocated: 8, available: 0, shift: 'Night', competency: 82, certifications: 5, status: 'Active', foreman: 'M. Chen', weeklyHours: 42, overtime: 3 },
  { id: '7', name: 'Tunnelling Specialist Crew', type: 'Underground', project: 'Metro Tunnel', projectCode: 'PRJ-METRO-TUN', size: 20, allocated: 20, available: 0, shift: '24h', competency: 97, certifications: 18, status: 'Active', foreman: 'Crew-TUN-A', weeklyHours: 56, overtime: 16 },
  { id: '8', name: 'Painting & Finishing', type: 'Finishing', project: 'South Tower', projectCode: 'PRJ-TWR-SOUTH', size: 6, allocated: 4, available: 2, shift: 'Day', competency: 78, certifications: 4, status: 'Rotating', foreman: 'K. Ali', weeklyHours: 40, overtime: 0 },
  { id: '9', name: 'Site Surveyor Team', type: 'Engineering', project: 'Multiple', projectCode: 'MULTI', size: 5, allocated: 3, available: 2, shift: 'Day', competency: 91, certifications: 7, status: 'Active', foreman: 'T. Wilson', weeklyHours: 45, overtime: 2 },
  { id: '10', name: 'Earthworks Crew', type: 'Civil', project: 'Highway Expansion', projectCode: 'PRJ-ROAD-HWY', size: 14, allocated: 14, available: 0, shift: 'Day', competency: 85, certifications: 6, status: 'Active', foreman: 'J. Smith', weeklyHours: 48, overtime: 5 },
  { id: '11', name: 'Steel Fixer Crew B', type: 'Structural', project: 'Standby', projectCode: '—', size: 12, allocated: 0, available: 12, shift: 'Day', competency: 87, certifications: 7, status: 'Standby', foreman: 'D. Lee', weeklyHours: 0, overtime: 0 },
  { id: '12', name: 'Waterproofing Specialists', type: 'Specialist', project: 'Water Treatment Plant', projectCode: 'PRJ-WTP-NEW', size: 6, allocated: 6, available: 0, shift: 'Day', competency: 93, certifications: 8, status: 'Mobilising', foreman: 'P. Garcia', weeklyHours: 38, overtime: 0 },
]

const COMPETENCY_MATRIX = [
  { role: 'Steel Fixer', safety: 95, technical: 92, quality: 88, productivity: 84 },
  { role: 'Concreter', safety: 92, technical: 88, quality: 85, productivity: 90 },
  { role: 'Electrician', safety: 96, technical: 95, quality: 93, productivity: 86 },
  { role: 'Mason', safety: 88, technical: 84, quality: 90, productivity: 80 },
  { role: 'Plumber', safety: 90, technical: 89, quality: 87, productivity: 83 },
  { role: 'Operator', safety: 94, technical: 91, quality: 85, productivity: 92 },
]

export function WorkforceView({ onNavigate }: { onNavigate: (v: View) => void }) {
  const [q, setQ] = useState('')
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('all')
  void onNavigate

  const filtered = useMemo(() => CREWS.filter(c => {
    if (q && !`${c.name} ${c.project} ${c.foreman} ${c.type}`.toLowerCase().includes(q.toLowerCase())) return false
    if (type !== 'all' && c.type !== type) return false
    if (status !== 'all' && c.status !== status) return false
    return true
  }), [q, type, status])

  const totalWorkforce = CREWS.reduce((s, c) => s + c.size, 0)
  const allocated = CREWS.reduce((s, c) => s + c.allocated, 0)
  const available = CREWS.reduce((s, c) => s + c.available, 0)
  const overtime = CREWS.reduce((s, c) => s + c.overtime, 0)
  const avgComp = Math.round(CREWS.reduce((s, c) => s + c.competency, 0) / CREWS.length)

  // Manpower trend (synthetic 8 weeks)
  const trendData = Array.from({ length: 8 }, (_, i) => ({
    week: `W${i + 1}`, planned: 180 + i * 8 + Math.round(Math.sin(i) * 12), actual: 175 + i * 9 + Math.round(Math.cos(i) * 15), forecast: 190 + i * 7,
  }))

  return (
    <FadeIn>
      <div className="space-y-4">
        {/* KPI strip */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {[
            { l: 'Total Workforce', v: fmtNum(totalWorkforce), i: Users, t: 'text-foreground', bg: 'bg-muted/50 text-muted-foreground' },
            { l: 'Allocated', v: fmtNum(allocated), i: HardHat, t: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600' },
            { l: 'Available', v: fmtNum(available), i: CheckCircle2, t: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600' },
            { l: 'Active Crews', v: fmtNum(CREWS.filter(c => c.status === 'Active').length), i: TrendingUp, t: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/40 text-violet-600' },
            { l: 'Avg Competency', v: `${avgComp}%`, i: Award, t: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600' },
            { l: 'Overtime Hrs/wk', v: fmtNum(overtime), i: AlertTriangle, t: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600' },
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

        <Tabs defaultValue="crews">
          <TabsList>
            <TabsTrigger value="crews">Crew Allocation</TabsTrigger>
            <TabsTrigger value="competency">Competency Matrix</TabsTrigger>
            <TabsTrigger value="forecast">Manpower Forecast</TabsTrigger>
          </TabsList>

          {/* Crew Allocation */}
          <TabsContent value="crews" className="mt-3">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div><CardTitle className="text-sm">Crew Allocation Register</CardTitle><CardDescription className="text-xs">{filtered.length} of {CREWS.length} crews · {filtered.reduce((s,c)=>s+c.allocated,0)} workers deployed</CardDescription></div>
                  <div className="flex flex-wrap gap-2">
                    <div className="relative"><Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search crews…" className="pl-8 h-9 w-44" /></div>
                    <Select value={type} onValueChange={setType}><SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem><SelectItem value="Structural">Structural</SelectItem><SelectItem value="Civil">Civil</SelectItem><SelectItem value="MEP">MEP</SelectItem><SelectItem value="Finishing">Finishing</SelectItem><SelectItem value="Underground">Underground</SelectItem><SelectItem value="Engineering">Engineering</SelectItem><SelectItem value="Specialist">Specialist</SelectItem></SelectContent></Select>
                    <Select value={status} onValueChange={setStatus}><SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="Active">Active</SelectItem><SelectItem value="Rotating">Rotating</SelectItem><SelectItem value="Standby">Standby</SelectItem><SelectItem value="Mobilising">Mobilising</SelectItem></SelectContent></Select>
                    <Button size="sm" className="h-9 gap-1.5"><Plus className="h-4 w-4" />Add Crew</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[560px] overflow-auto scroll-thin">
                  <Table>
                    <TableHeader className="sticky top-0 bg-card"><TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="min-w-[180px]">Crew</TableHead><TableHead className="w-[100px]">Type</TableHead><TableHead className="w-[90px]">Project</TableHead>
                      <TableHead className="w-[70px] text-right">Size</TableHead><TableHead className="w-[70px] text-right">Alloc</TableHead><TableHead className="w-[60px]">Shift</TableHead>
                      <TableHead className="w-[70px]">Comp</TableHead><TableHead className="w-[70px] text-right">OT/wk</TableHead><TableHead className="w-[90px]">Status</TableHead><TableHead className="w-[100px]">Foreman</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {filtered.map(c => (
                        <TableRow key={c.id} className={cn('hover:bg-muted/40', c.status === 'Standby' && 'bg-muted/20', c.overtime > 10 && 'bg-rose-50/20 dark:bg-rose-950/10')}>
                          <TableCell><div className="flex items-center gap-2"><Avatar className="h-6 w-6"><AvatarFallback className="text-[8px] bg-primary/10 text-primary">{c.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</AvatarFallback></Avatar><div><div className="text-xs font-medium truncate max-w-[160px]">{c.name}</div><div className="text-[9px] text-muted-foreground">{c.certifications} certs</div></div></div></TableCell>
                          <TableCell><Badge variant="secondary" className="text-[9px]">{c.type}</Badge></TableCell>
                          <TableCell className="font-mono text-[10px] text-muted-foreground">{c.projectCode === '—' ? '—' : c.projectCode.replace('PRJ-','')}</TableCell>
                          <TableCell className="text-right text-[11px] tabular-nums font-medium">{c.size}</TableCell>
                          <TableCell className="text-right text-[11px] tabular-nums"><span className={c.allocated === c.size ? 'text-emerald-600 font-medium' : ''}>{c.allocated}</span></TableCell>
                          <TableCell><Badge variant="outline" className="text-[9px]">{c.shift}</Badge></TableCell>
                          <TableCell><div className="flex items-center gap-1"><div className="h-1.5 w-8 rounded-full bg-muted overflow-hidden"><div className={cn('h-full', c.competency >= 90 ? 'bg-emerald-500' : c.competency >= 80 ? 'bg-amber-500' : 'bg-rose-500')} style={{ width: `${c.competency}%` }} /></div><span className="text-[9px] tabular-nums">{c.competency}</span></div></TableCell>
                          <TableCell className={cn('text-right text-[10px] tabular-nums', c.overtime > 10 ? 'text-rose-600 font-medium' : c.overtime > 0 ? 'text-amber-600' : 'text-muted-foreground')}>{c.overtime}</TableCell>
                          <TableCell><Badge variant="outline" className={cn('text-[9px]', statusColor(c.status))}>{c.status}</Badge></TableCell>
                          <TableCell className="text-[10px] text-muted-foreground">{c.foreman}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Competency Matrix */}
          <TabsContent value="competency" className="mt-3">
            <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Competency Matrix by Trade</CardTitle><CardDescription className="text-xs">Skills assessment (0–100) across 4 dimensions</CardDescription></CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader><TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="px-4">Trade</TableHead><TableHead className="text-right">Safety</TableHead><TableHead className="text-right">Technical</TableHead><TableHead className="text-right">Quality</TableHead><TableHead className="text-right">Productivity</TableHead><TableHead className="text-right">Overall</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {COMPETENCY_MATRIX.map((r, i) => {
                        const overall = Math.round((r.safety + r.technical + r.quality + r.productivity) / 4)
                        return (
                          <TableRow key={r.role} className={cn(i % 2 === 1 && 'bg-muted/10')}>
                            <TableCell className="px-4 text-xs font-medium">{r.role}</TableCell>
                            <CompCell v={r.safety} />
                            <CompCell v={r.technical} />
                            <CompCell v={r.quality} />
                            <CompCell v={r.productivity} />
                            <TableCell className="text-right"><Badge variant="outline" className={cn('text-[10px] font-bold', overall >= 90 ? 'border-emerald-300 text-emerald-600' : overall >= 85 ? 'border-amber-300 text-amber-600' : 'border-rose-300 text-rose-600')}>{overall}</Badge></TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Competency Radar</CardTitle><CardDescription className="text-xs">Average scores by dimension</CardDescription></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={COMPETENCY_MATRIX.map(r => ({ trade: r.role, Safety: r.safety, Technical: r.technical, Quality: r.quality, Productivity: r.productivity }))}>
                      <PolarGrid stroke="var(--border)" />
                      <PolarAngleAxis dataKey="trade" tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
                      <PolarRadiusAxis domain={[70, 100]} tick={{ fontSize: 8, fill: 'var(--muted-foreground)' }} />
                      <Radar name="Safety" dataKey="Safety" stroke={CHART.emerald} fill={CHART.emerald} fillOpacity={0.1} strokeWidth={2} />
                      <Radar name="Technical" dataKey="Technical" stroke={CHART.sky} fill={CHART.sky} fillOpacity={0.1} strokeWidth={2} />
                      <Radar name="Productivity" dataKey="Productivity" stroke={CHART.amber} fill={CHART.amber} fillOpacity={0.1} strokeWidth={2} />
                      <Legend wrapperStyle={{ fontSize: 9 }} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Manpower Forecast */}
          <TabsContent value="forecast" className="mt-3">
            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">8-Week Manpower Forecast</CardTitle><CardDescription className="text-xs">Planned vs actual vs forecast headcount</CardDescription></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={trendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gPlan" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={CHART.slate} stopOpacity={0.3} /><stop offset="95%" stopColor={CHART.slate} stopOpacity={0} /></linearGradient>
                        <linearGradient id="gAct" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={CHART.emerald} stopOpacity={0.4} /><stop offset="95%" stopColor={CHART.emerald} stopOpacity={0} /></linearGradient>
                        <linearGradient id="gFc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={CHART.amber} stopOpacity={0.3} /><stop offset="95%" stopColor={CHART.amber} stopOpacity={0} /></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                      <XAxis dataKey="week" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                      <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" width={36} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Area type="monotone" dataKey="planned" name="Planned" stroke={CHART.slate} fill="url(#gPlan)" strokeWidth={1.5} />
                      <Area type="monotone" dataKey="actual" name="Actual" stroke={CHART.emerald} fill="url(#gAct)" strokeWidth={2} />
                      <Area type="monotone" dataKey="forecast" name="Forecast" stroke={CHART.amber} fill="url(#gFc)" strokeWidth={1.5} strokeDasharray="4 2" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <div className="space-y-4">
                <Card className="bg-gradient-to-br from-primary/5 to-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2"><TrendingUp className="h-4 w-4 text-emerald-600" /><span className="text-sm font-semibold">Utilisation Health</span></div>
                    <div className="text-3xl font-bold">{Math.round((allocated / totalWorkforce) * 100)}%</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{allocated} of {totalWorkforce} workers deployed</div>
                    <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${(allocated / totalWorkforce) * 100}%` }} /></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Overtime Hotspots</CardTitle></CardHeader>
                  <CardContent className="space-y-1.5">
                    {CREWS.filter(c => c.overtime > 5).sort((a,b) => b.overtime - a.overtime).map(c => (
                      <div key={c.id} className="flex items-center justify-between text-xs">
                        <span className="truncate flex-1">{c.name}</span>
                        <Badge variant="outline" className={cn('text-[9px] ml-2', c.overtime > 10 ? 'border-rose-300 text-rose-600' : 'border-amber-300 text-amber-600')}>+{c.overtime}h</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </FadeIn>
  )
}

function CompCell({ v }: { v: number }) {
  return (
    <TableCell className="text-right">
      <div className="inline-flex items-center gap-1.5">
        <div className="h-1.5 w-8 rounded-full bg-muted overflow-hidden"><div className={cn('h-full', v >= 90 ? 'bg-emerald-500' : v >= 85 ? 'bg-amber-500' : 'bg-rose-500')} style={{ width: `${v}%` }} /></div>
        <span className="text-[10px] tabular-nums w-6 text-right">{v}</span>
      </div>
    </TableCell>
  )
}
