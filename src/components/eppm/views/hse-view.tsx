'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Filter, AlertTriangle, Activity, Stethoscope, Eye, CalendarClock, Gauge, HardHat, Megaphone, ClipboardList, GraduationCap, Users, CheckCircle2 } from 'lucide-react'
import { fmtDate, type View } from '@/lib/eppm'
import { cn } from '@/lib/utils'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadialBarChart, RadialBar, PolarAngleAxis, BarChart, Bar, Cell } from 'recharts'
import { FadeIn } from '../motion'

const CHART = {
  emerald: 'oklch(0.55 0.12 162)',
  amber: 'oklch(0.7 0.16 80)',
  rose: 'oklch(0.6 0.2 25)',
  sky: 'oklch(0.62 0.1 195)',
  violet: 'oklch(0.65 0.18 305)',
  slate: 'oklch(0.55 0.02 250)',
}

type IncidentType = 'LTI' | 'First Aid' | 'Near Miss' | 'Property Damage' | 'Environmental'
type Severity = 'Critical' | 'High' | 'Medium' | 'Low'
type IncidentStatus = 'Open' | 'Investigating' | 'Closed'

interface Incident {
  id: string
  date: string
  project: string
  type: IncidentType
  severity: Severity
  location: string
  desc: string
  status: IncidentStatus
  reportedBy: string
}

const INCIDENTS: Incident[] = [
  { id: 'INC-308', date: '2025-01-22', project: 'PRJ-002', type: 'Near Miss', severity: 'Medium', location: 'Level 5 – Slab', desc: 'Worker nearly struck by swinging load from tower crane. Tag line not in use.', status: 'Investigating', reportedBy: 'M. Chen' },
  { id: 'INC-307', date: '2025-01-20', project: 'PRJ-001', type: 'First Aid', severity: 'Low', location: 'Basement Carpark', desc: 'Minor cut to finger while handling rebar. Treated on site by first-aider.', status: 'Closed', reportedBy: 'S. Patel' },
  { id: 'INC-306', date: '2025-01-18', project: 'PRJ-003', type: 'Property Damage', severity: 'Medium', location: 'MEP Risers', desc: 'Forklift damaged cable tray while manoeuvring in plant room.', status: 'Investigating', reportedBy: 'K. Ali' },
  { id: 'INC-305', date: '2025-01-16', project: 'PRJ-004', type: 'LTI', severity: 'High', location: 'Lift Shaft 2', desc: 'Sprained ankle from fall on stairs. Worker off duty 4 days.', status: 'Investigating', reportedBy: 'J. Müller' },
  { id: 'INC-304', date: '2025-01-14', project: 'PRJ-002', type: 'Near Miss', severity: 'High', location: 'Grid F – Steel', desc: 'Unsecured load shifted during lift. Area evacuated, no injuries.', status: 'Closed', reportedBy: 'R. Khan' },
  { id: 'INC-303', date: '2025-01-12', project: 'PRJ-001', type: 'Environmental', severity: 'Medium', location: 'Site Boundary', desc: 'Diesel spill 20L from generator refuelling. Contained and cleaned.', status: 'Closed', reportedBy: 'S. Patel' },
  { id: 'INC-302', date: '2025-01-10', project: 'PRJ-003', type: 'First Aid', severity: 'Low', location: 'Roof Slab', desc: 'Eye irritation from cement dust. Flushed at eyewash station.', status: 'Closed', reportedBy: 'K. Ali' },
  { id: 'INC-301', date: '2025-01-08', project: 'PRJ-004', type: 'Near Miss', severity: 'Critical', location: 'Pool Deck', desc: 'Edge protection dislodged by wind. Could have led to fall from height.', status: 'Closed', reportedBy: 'J. Müller' },
  { id: 'INC-300', date: '2025-01-06', project: 'PRJ-002', type: 'Property Damage', severity: 'Low', location: 'Curtain Wall', desc: 'Glazing panel cracked during installation. Panel replaced.', status: 'Closed', reportedBy: 'M. Chen' },
  { id: 'INC-299', date: '2025-01-04', project: 'PRJ-001', type: 'LTI', severity: 'Critical', location: 'Stair Core B', desc: 'Fall from height (1.8m) on temporary stairs. Fractured wrist, 21 days off.', status: 'Closed', reportedBy: 'L. Rossi' },
  { id: 'INC-298', date: '2024-12-29', project: 'PRJ-003', type: 'Near Miss', severity: 'Medium', location: 'Switchgear Room', desc: 'Live cable found untagged during isolation check. Isolation reinforced.', status: 'Closed', reportedBy: 'K. Ali' },
  { id: 'INC-297', date: '2024-12-27', project: 'PRJ-004', type: 'First Aid', severity: 'Low', location: 'Lobby Fit-out', desc: 'Splinter from timber formwork. Removed and dressed.', status: 'Closed', reportedBy: 'J. Müller' },
  { id: 'INC-296', date: '2024-12-22', project: 'PRJ-002', type: 'Environmental', severity: 'Low', location: 'Basement', desc: 'Minor hydraulic oil leak from excavator. Drip tray deployed.', status: 'Closed', reportedBy: 'R. Khan' },
  { id: 'INC-295', date: '2024-12-18', project: 'PRJ-001', type: 'Property Damage', severity: 'Medium', location: 'Façade N', desc: 'Suspended platform cable chafed on edge. Cable replaced.', status: 'Closed', reportedBy: 'S. Patel' },
]

interface ToolboxTalk {
  date: string
  topic: string
  presenter: string
  attendees: number
  project: string
  points: string[]
}

const TOOLBOX: ToolboxTalk[] = [
  { date: '2025-01-22', topic: 'Working at Heights – Edge Protection', presenter: 'S. Patel', attendees: 28, project: 'PRJ-001', points: ['Inspect edge protection daily', 'Use full body harness on all leading edges', 'Tag out damaged components'] },
  { date: '2025-01-21', topic: 'Crane Lift Safety & Tag Lines', presenter: 'M. Chen', attendees: 22, project: 'PRJ-002', points: ['Tag lines mandatory on all swinging loads', 'Exclusion zones clearly marked', 'Stop work if wind > 12 m/s'] },
  { date: '2025-01-20', topic: 'Electrical Isolation (LOTO)', presenter: 'K. Ali', attendees: 18, project: 'PRJ-003', points: ['Lock-out / tag-out before any electrical work', 'Verify isolation with tester', 'Only authorised persons restore power'] },
  { date: '2025-01-19', topic: 'Manual Handling & Lifting Technique', presenter: 'J. Müller', attendees: 16, project: 'PRJ-004', points: ['Assess load before lifting', 'Keep back straight, lift with legs', 'Use mechanical aids for > 25kg'] },
  { date: '2025-01-18', topic: 'Hot Work Permit & Fire Watch', presenter: 'R. Khan', attendees: 24, project: 'PRJ-002', points: ['Permit required for all hot work', 'Fire watch for 60 min after work', 'Extinguishers within 3m'] },
  { date: '2025-01-17', topic: 'PPE Compliance on Site', presenter: 'L. Rossi', attendees: 30, project: 'PRJ-001', points: ['Hard hat, safety boots & hi-vis mandatory', 'Eye protection for cutting/grinding', 'Gloves for handling sharp materials'] },
  { date: '2025-01-16', topic: 'Excavation & Trench Safety', presenter: 'K. Ali', attendees: 14, project: 'PRJ-003', points: ['Shoring required for trenches > 1.2m', 'Inspect daily before entry', 'Keep spoil piles 0.6m back from edge'] },
  { date: '2025-01-15', topic: 'Slips, Trips & Falls Prevention', presenter: 'S. Patel', attendees: 26, project: 'PRJ-001', points: ['Keep walkways clear of debris', 'Clean spills immediately', 'Report damaged formwork edges'] },
]

const TYPE_BADGE: Record<IncidentType, string> = {
  LTI: 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/50 dark:border-rose-900',
  'First Aid': 'text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950/50 dark:border-sky-900',
  'Near Miss': 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-900',
  'Property Damage': 'text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-950/50 dark:border-violet-900',
  Environmental: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900',
}

const SEVERITY_BADGE: Record<Severity, string> = {
  Critical: 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/50 dark:border-rose-900',
  High: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-900',
  Medium: 'text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950/50 dark:border-sky-900',
  Low: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900',
}

const STATUS_BADGE: Record<IncidentStatus, string> = {
  Open: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-900',
  Investigating: 'text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950/50 dark:border-sky-900',
  Closed: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900',
}

interface KpiDef {
  label: string
  value: string | number
  icon: any
  tile: string
  bar: string
}

function KpiCard({ kpi }: { kpi: KpiDef }) {
  const Icon = kpi.icon
  return (
    <Card className="overflow-hidden pt-0">
      <div className={cn('h-1 w-full', kpi.bar)} />
      <CardContent className="p-4 pt-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{kpi.label}</div>
            <div className="mt-1 text-2xl font-bold tabular-nums">{kpi.value}</div>
          </div>
          <div className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-lg', kpi.tile)}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const TREND_12M: any[] = [
  { m: 'Feb', incidents: 5, nearMiss: 9, lti: 1 },
  { m: 'Mar', incidents: 4, nearMiss: 11, lti: 0 },
  { m: 'Apr', incidents: 6, nearMiss: 13, lti: 1 },
  { m: 'May', incidents: 3, nearMiss: 10, lti: 0 },
  { m: 'Jun', incidents: 4, nearMiss: 12, lti: 1 },
  { m: 'Jul', incidents: 2, nearMiss: 15, lti: 0 },
  { m: 'Aug', incidents: 5, nearMiss: 14, lti: 1 },
  { m: 'Sep', incidents: 3, nearMiss: 16, lti: 0 },
  { m: 'Oct', incidents: 4, nearMiss: 18, lti: 1 },
  { m: 'Nov', incidents: 2, nearMiss: 17, lti: 0 },
  { m: 'Dec', incidents: 3, nearMiss: 19, lti: 1 },
  { m: 'Jan', incidents: 4, nearMiss: 14, lti: 1 },
]

const ATTENDANCE_TREND: any[] = [
  { d: 'Wk1', attendees: 96 },
  { d: 'Wk2', attendees: 112 },
  { d: 'Wk3', attendees: 124 },
  { d: 'Wk4', attendees: 108 },
]

export function HseView({ onNavigate }: { onNavigate: (v: View) => void }) {
  void onNavigate
  const [tab, setTab] = useState('incidents')

  const [q, setQ] = useState('')
  const [type, setType] = useState('all')
  const [sev, setSev] = useState('all')

  const filteredIncidents = useMemo(() => {
    return INCIDENTS.filter(i => {
      if (q && !`${i.id} ${i.project} ${i.location} ${i.desc} ${i.reportedBy} ${i.type}`.toLowerCase().includes(q.toLowerCase())) return false
      if (type !== 'all' && i.type !== type) return false
      if (sev !== 'all' && i.severity !== sev) return false
      return true
    })
  }, [q, type, sev])

  const totalIncidents = 47
  const lti = 6
  const recordable = 11
  const nearMiss = 168
  const daysSinceLTI = 14
  const trir = 0.74

  const kpis: KpiDef[] = [
    { label: 'Total Incidents (YTD)', value: totalIncidents, icon: AlertTriangle, tile: 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300', bar: 'bg-gradient-to-r from-slate-400 to-slate-500' },
    { label: 'Lost Time Injuries', value: lti, icon: Activity, tile: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700', bar: 'bg-gradient-to-r from-rose-400 to-rose-600' },
    { label: 'Recordable Cases', value: recordable, icon: Stethoscope, tile: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700', bar: 'bg-gradient-to-r from-amber-400 to-amber-600' },
    { label: 'Near Misses', value: nearMiss, icon: Eye, tile: 'bg-sky-50 dark:bg-sky-950/50 text-sky-700', bar: 'bg-gradient-to-r from-sky-400 to-sky-600' },
    { label: 'Days Since Last LTI', value: daysSinceLTI, icon: CalendarClock, tile: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700', bar: 'bg-gradient-to-r from-emerald-400 to-emerald-600' },
    { label: 'TRIR', value: trir.toFixed(2), icon: Gauge, tile: 'bg-violet-50 dark:bg-violet-950/50 text-violet-600', bar: 'bg-gradient-to-r from-violet-400 to-violet-600' },
  ]

  const safetyScore = 87
  const radialData: any[] = [{ name: 'Safety Score', value: safetyScore, fill: CHART.emerald }]
  const totalAttendees = TOOLBOX.reduce((s, t) => s + t.attendees, 0)
  const avgAttendees = Math.round(totalAttendees / TOOLBOX.length)

  return (
    <FadeIn>
      <div className="space-y-4">
        {/* KPI strip */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {kpis.map(k => <KpiCard key={k.label} kpi={k} />)}
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="incidents">Incident Register</TabsTrigger>
            <TabsTrigger value="metrics">Safety Metrics</TabsTrigger>
            <TabsTrigger value="toolbox">Toolbox Talks</TabsTrigger>
          </TabsList>

          {/* Incident Register */}
          <TabsContent value="incidents" className="mt-3 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle className="text-sm">Incident Register</CardTitle>
                    <CardDescription className="text-xs">{filteredIncidents.length} of {INCIDENTS.length} incidents</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search incidents…" className="pl-8 h-9 w-52" />
                    </div>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger className="h-9 w-40"><Filter className="h-3.5 w-3.5 mr-1.5" /><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="LTI">LTI</SelectItem>
                        <SelectItem value="First Aid">First Aid</SelectItem>
                        <SelectItem value="Near Miss">Near Miss</SelectItem>
                        <SelectItem value="Property Damage">Property Damage</SelectItem>
                        <SelectItem value="Environmental">Environmental</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sev} onValueChange={setSev}>
                      <SelectTrigger className="h-9 w-40"><Filter className="h-3.5 w-3.5 mr-1.5" /><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Severity</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[560px] overflow-auto scroll-thin">
                  <Table>
                    <TableHeader className="sticky top-0 bg-card z-10">
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="w-[90px]">Incident ID</TableHead>
                        <TableHead className="w-[90px]">Date</TableHead>
                        <TableHead className="w-[80px]">Project</TableHead>
                        <TableHead className="w-[120px]">Type</TableHead>
                        <TableHead className="w-[90px]">Severity</TableHead>
                        <TableHead className="min-w-[180px]">Location / Description</TableHead>
                        <TableHead className="w-[110px]">Status</TableHead>
                        <TableHead className="w-[110px]">Reported By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredIncidents.map(i => (
                        <TableRow key={i.id} className={cn('hover:bg-muted/40', i.severity === 'Critical' && 'bg-rose-50/60 dark:bg-rose-950/20')}>
                          <TableCell className="font-mono text-[10px] text-muted-foreground">{i.id}</TableCell>
                          <TableCell className="text-[10px] text-muted-foreground">{fmtDate(i.date)}</TableCell>
                          <TableCell className="font-mono text-[10px]">{i.project}</TableCell>
                          <TableCell><Badge variant="outline" className={cn('text-[9px]', TYPE_BADGE[i.type])}>{i.type}</Badge></TableCell>
                          <TableCell><Badge variant="outline" className={cn('text-[9px]', SEVERITY_BADGE[i.severity])}>{i.severity}</Badge></TableCell>
                          <TableCell>
                            <div className="text-[10px] font-medium text-muted-foreground">{i.location}</div>
                            <div className="text-xs truncate max-w-[320px]">{i.desc}</div>
                          </TableCell>
                          <TableCell><Badge variant="outline" className={cn('text-[9px]', STATUS_BADGE[i.status])}>{i.status}</Badge></TableCell>
                          <TableCell className="text-[11px]">{i.reportedBy}</TableCell>
                        </TableRow>
                      ))}
                      {filteredIncidents.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-xs text-muted-foreground py-10">No incidents match filters</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Safety Metrics */}
          <TabsContent value="metrics" className="mt-3 space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">12-Month Safety Trend</CardTitle>
                  <CardDescription className="text-xs">Incidents, near misses & LTI per month</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={TREND_12M} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="m" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                      <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" width={28} allowDecimals={false} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Line type="monotone" dataKey="incidents" name="Incidents" stroke={CHART.amber} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="nearMiss" name="Near Misses" stroke={CHART.sky} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="lti" name="LTI" stroke={CHART.rose} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Safety Score</CardTitle>
                  <CardDescription className="text-xs">Composite index 0–100</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <RadialBarChart innerRadius="68%" outerRadius="100%" data={radialData} startAngle={90} endAngle={-270}>
                      <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                      <RadialBar background={{ fill: 'oklch(0.55 0.02 250 / 0.15)' }} dataKey="value" cornerRadius={10} fill={CHART.emerald} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="-mt-[148px] mb-[100px] flex flex-col items-center pointer-events-none">
                    <div className="text-3xl font-bold tabular-nums" style={{ color: CHART.emerald }}>{safetyScore}</div>
                    <div className="text-[10px] text-muted-foreground">out of 100</div>
                  </div>
                  <div className="mt-1 flex items-center justify-center gap-1.5 text-[11px]">
                    <CheckCircle2 className="h-3 w-3 text-emerald-700" />
                    <span className="text-muted-foreground">Excellent — above 85 target</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Card><CardContent className="p-4 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700"><Megaphone className="h-5 w-5" /></div>
                <div>
                  <div className="text-[11px] uppercase text-muted-foreground">Toolbox Talks (YTD)</div>
                  <div className="text-2xl font-bold tabular-nums">186</div>
                </div>
              </CardContent></Card>
              <Card><CardContent className="p-4 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-700"><ClipboardList className="h-5 w-5" /></div>
                <div>
                  <div className="text-[11px] uppercase text-muted-foreground">Safety Inspections</div>
                  <div className="text-2xl font-bold tabular-nums">312</div>
                </div>
              </CardContent></Card>
              <Card><CardContent className="p-4 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-violet-50 dark:bg-violet-950/50 text-violet-600"><GraduationCap className="h-5 w-5" /></div>
                <div>
                  <div className="text-[11px] uppercase text-muted-foreground">Training Hours</div>
                  <div className="text-2xl font-bold tabular-nums">4,820</div>
                </div>
              </CardContent></Card>
            </div>
          </TabsContent>

          {/* Toolbox Talks */}
          <TabsContent value="toolbox" className="mt-3 space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">Recent Toolbox Talks</CardTitle>
                      <CardDescription className="text-xs">{TOOLBOX.length} sessions · {totalAttendees} total attendees · {avgAttendees} avg</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{TOOLBOX.length} sessions</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[560px] overflow-auto scroll-thin space-y-2 pr-1">
                    {TOOLBOX.map((t, idx) => (
                      <div key={idx} className="rounded-lg border p-3 hover:border-primary/40 transition-colors">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="grid h-7 w-7 place-items-center rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 shrink-0"><Megaphone className="h-3.5 w-3.5" /></div>
                              <span className="text-xs font-semibold truncate">{t.topic}</span>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
                              <span className="font-mono">{t.project}</span><span>·</span>
                              <span>{fmtDate(t.date)}</span><span>·</span>
                              <span>by {t.presenter}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 text-emerald-700">
                            <Users className="h-3.5 w-3.5" />
                            <span className="text-sm font-bold tabular-nums">{t.attendees}</span>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {t.points.map((p, i) => (
                            <span key={i} className="inline-flex items-center gap-1 rounded-md border bg-muted/40 px-1.5 py-0.5 text-[9px] text-muted-foreground">
                              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-700" />{p}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Attendance Trend</CardTitle>
                  <CardDescription className="text-xs">Weekly attendees — last 4 weeks</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={ATTENDANCE_TREND} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                      <XAxis dataKey="d" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                      <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" width={28} allowDecimals={false} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} cursor={{ fill: 'oklch(0.55 0.02 250 / 0.08)' }} />
                      <Bar dataKey="attendees" name="Attendees" radius={[4, 4, 0, 0]}>
                        {ATTENDANCE_TREND.map((_, i) => <Cell key={i} fill={CHART.emerald} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between rounded-md border p-2">
                      <div className="flex items-center gap-2"><HardHat className="h-3.5 w-3.5 text-amber-700" /><span className="text-[11px] text-muted-foreground">Active workforce</span></div>
                      <span className="text-xs font-bold tabular-nums">142</span>
                    </div>
                    <div className="flex items-center justify-between rounded-md border p-2">
                      <div className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-sky-700" /><span className="text-[11px] text-muted-foreground">Avg attendance</span></div>
                      <span className="text-xs font-bold tabular-nums">{avgAttendees}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-md border p-2">
                      <div className="flex items-center gap-2"><Megaphone className="h-3.5 w-3.5 text-emerald-700" /><span className="text-[11px] text-muted-foreground">Coverage rate</span></div>
                      <span className="text-xs font-bold tabular-nums text-emerald-700">
                        {Math.round((avgAttendees / 142) * 100)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </FadeIn>
  )
}
