'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Maintenance Management — complete CMMS workflow in one shared-state view.
//
// Workflow:  Complaint / Service Request → triage (review → approve/reject)
//            → Work Order (Corrective) ─┐
//            PPM schedule due ──────────┼→ Assign technician (Dispatch)
//            Predictive alert ──────────┘
//            → Dispatched → In Progress → Completed → Verified → Closed
//
// All tabs read the same state, so approving a request instantly surfaces the
// new WO in Work Orders / Dispatch, and assignment updates technician load.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import {
  Search, Hammer, ClipboardList, CalendarClock, Radar, Truck, HardHat,
  FileCheck2, MessageSquareWarning, Wrench, CheckCircle2, PauseCircle,
  PlayCircle, ShieldCheck, AlertTriangle, Clock, Gauge, ArrowRight,
  Phone, MapPin, Star, QrCode, Plus, XCircle, Eye, Activity,
} from 'lucide-react'
import { fmtDate, type View } from '@/lib/eppm'
import { cn } from '@/lib/utils'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, LineChart, Line, Cell, PieChart, Pie,
} from 'recharts'
import { FadeIn } from '../motion'

const CHART = {
  emerald: 'oklch(0.55 0.12 162)',
  amber: 'oklch(0.7 0.16 80)',
  rose: 'oklch(0.6 0.2 25)',
  sky: 'oklch(0.62 0.1 195)',
  violet: 'oklch(0.65 0.18 305)',
  slate: 'oklch(0.55 0.02 250)',
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type Priority = 'Critical' | 'High' | 'Medium' | 'Low'
type Trade = 'HVAC' | 'Electrical' | 'Plumbing' | 'Civil' | 'Fire Protection' | 'Lifts'

type RequestType = 'Complaint' | 'Service Request'
type RequestStatus = 'New' | 'Under Review' | 'Converted' | 'Rejected'
interface ServiceRequest {
  id: string
  type: RequestType
  source: 'Customer Portal' | 'Phone' | 'Email' | 'QR Scan' | 'Walk-in'
  customer: string
  site: string
  trade: Trade
  priority: Priority
  title: string
  desc: string
  raised: string
  slaDue: string
  status: RequestStatus
  linkedWo?: string
}

type WoType = 'Corrective' | 'Preventive' | 'Predictive'
type WoStatus = 'New' | 'Assigned' | 'Dispatched' | 'In Progress' | 'On Hold' | 'Completed' | 'Verified' | 'Closed' | 'Cancelled'
interface WorkOrder {
  id: string
  title: string
  type: WoType
  origin: string           // SR-xxx / CMP-xxx / PPM-xxx / MON-xxx / Manual
  asset: string
  site: string
  trade: Trade
  priority: Priority
  status: WoStatus
  technicianId?: string
  raised: string
  due: string
  estHours: number
  laborCost: number
  partsCost: number
  completedAt?: string
}

interface Technician {
  id: string
  name: string
  trade: Trade
  phone: string
  zone: string
  onLeave?: boolean
  rating: number
  certs: string[]
}

type Frequency = 'Weekly' | 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual'
interface PpmSchedule {
  id: string
  asset: string
  site: string
  task: string
  trade: Trade
  frequency: Frequency
  lastDone: string
  nextDue: string
  compliance: number
}

interface Monitor {
  id: string
  asset: string
  site: string
  parameter: string
  reading: string
  threshold: string
  condition: 'Normal' | 'Watch' | 'Alert'
  recommendation: string
  woRaised?: string
}

interface AmcContract {
  id: string
  client: string
  site: string
  scope: string
  valueBnd: number
  start: string
  end: string
  sla: string
  visitsPlanned: number
  visitsDone: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Demo data (dates pivot around Jul 2026)
// ─────────────────────────────────────────────────────────────────────────────
const TECHNICIANS: Technician[] = [
  { id: 'T-01', name: 'Azlan Rahman', trade: 'HVAC', phone: '+673 871 2201', zone: 'BSB Central', rating: 4.8, certs: ['Refrigerant Handling', 'Working at Height'] },
  { id: 'T-02', name: 'Hafiz Omar', trade: 'Electrical', phone: '+673 871 2202', zone: 'BSB Central', rating: 4.6, certs: ['LV Authorised Person', 'First Aid'] },
  { id: 'T-03', name: 'Siti Aminah', trade: 'Fire Protection', phone: '+673 871 2203', zone: 'Gadong', rating: 4.9, certs: ['Fire Systems L2', 'Confined Space'] },
  { id: 'T-04', name: 'Kumar Selvam', trade: 'Plumbing', phone: '+673 871 2204', zone: 'Kuala Belait', rating: 4.4, certs: ['Water Systems', 'First Aid'] },
  { id: 'T-05', name: 'Daniel Wong', trade: 'Lifts', phone: '+673 871 2205', zone: 'BSB Central', rating: 4.7, certs: ['Lift Competent Person'] },
  { id: 'T-06', name: 'Rahim Bakar', trade: 'Civil', phone: '+673 871 2206', zone: 'Seria', rating: 4.5, certs: ['Scaffold Inspector', 'Working at Height'] },
  { id: 'T-07', name: 'Nurul Huda', trade: 'HVAC', phone: '+673 871 2207', zone: 'Gadong', onLeave: true, rating: 4.7, certs: ['Refrigerant Handling'] },
]

const SEED_REQUESTS: ServiceRequest[] = [
  { id: 'CMP-1041', type: 'Complaint', source: 'Customer Portal', customer: 'Ministry of Education', site: 'Rimba School Block B', trade: 'HVAC', priority: 'High', title: 'Classroom AC blowing warm air', desc: 'Level 2 classrooms 2.3–2.6 report AC not cooling since morning. Exam week — urgent.', raised: '2026-07-02', slaDue: '2026-07-03', status: 'New' },
  { id: 'SR-2318', type: 'Service Request', source: 'QR Scan', customer: 'Baiduri Bank', site: 'HQ Tower — Level 8', trade: 'Electrical', priority: 'Medium', title: 'Flickering lights in open office', desc: 'QR asset scan from fitting LT-8-114. Intermittent flicker, suspected ballast.', raised: '2026-07-02', slaDue: '2026-07-05', status: 'New' },
  { id: 'CMP-1040', type: 'Complaint', source: 'Phone', customer: 'Times Square Group', site: 'Mall — Food Court', trade: 'Plumbing', priority: 'Critical', title: 'Water leak above tenant kitchen', desc: 'Active drip from ceiling void above F&B unit 12. Risk to electrical below.', raised: '2026-07-01', slaDue: '2026-07-02', status: 'Under Review' },
  { id: 'SR-2317', type: 'Service Request', source: 'Email', customer: 'Public Works Department', site: 'Gov Complex — Car Park', trade: 'Civil', priority: 'Low', title: 'Pothole at entrance ramp', desc: 'Surface break-up ~0.5 m² at basement entry ramp. Request patch repair.', raised: '2026-06-30', slaDue: '2026-07-07', status: 'New' },
  { id: 'SR-2315', type: 'Service Request', source: 'Customer Portal', customer: 'Baiduri Bank', site: 'HQ Tower — Lobby', trade: 'Lifts', priority: 'High', title: 'Lift 2 door sensor intermittent', desc: 'Doors re-open randomly. Passengers report jerky levelling on L1.', raised: '2026-06-29', slaDue: '2026-07-01', status: 'Converted', linkedWo: 'WO-5121' },
  { id: 'CMP-1038', type: 'Complaint', source: 'Walk-in', customer: 'Private Tenant', site: 'Gadong Residences Unit 7', trade: 'Electrical', priority: 'Medium', title: 'Burning smell at DB board', desc: 'Tenant reported smell near distribution board. Inspected — rejected as tenant-owned appliance fault.', raised: '2026-06-27', slaDue: '2026-06-29', status: 'Rejected' },
]

const SEED_WORK_ORDERS: WorkOrder[] = [
  { id: 'WO-5121', title: 'Lift 2 door sensor replacement', type: 'Corrective', origin: 'SR-2315', asset: 'LIFT-BB-02', site: 'Baiduri HQ Tower', trade: 'Lifts', priority: 'High', status: 'In Progress', technicianId: 'T-05', raised: '2026-06-29', due: '2026-07-03', estHours: 6, laborCost: 480, partsCost: 1250 },
  { id: 'WO-5120', title: 'Chiller 2 quarterly service', type: 'Preventive', origin: 'PPM-014', asset: 'CH-GC-02', site: 'Gov Complex', trade: 'HVAC', priority: 'Medium', status: 'Dispatched', technicianId: 'T-01', raised: '2026-06-28', due: '2026-07-04', estHours: 8, laborCost: 640, partsCost: 300 },
  { id: 'WO-5119', title: 'Fire pump monthly test run', type: 'Preventive', origin: 'PPM-021', asset: 'FP-TS-01', site: 'Times Square Mall', trade: 'Fire Protection', priority: 'High', status: 'Assigned', technicianId: 'T-03', raised: '2026-06-28', due: '2026-07-05', estHours: 3, laborCost: 240, partsCost: 0 },
  { id: 'WO-5118', title: 'AHU-3 bearing vibration — replace bearing set', type: 'Predictive', origin: 'MON-07', asset: 'AHU-BB-03', site: 'Baiduri HQ Tower', trade: 'HVAC', priority: 'High', status: 'New', raised: '2026-06-27', due: '2026-07-06', estHours: 10, laborCost: 800, partsCost: 950 },
  { id: 'WO-5117', title: 'Corridor lighting circuit fault L5', type: 'Corrective', origin: 'CMP-1036', asset: 'DB-GC-L5', site: 'Gov Complex', trade: 'Electrical', priority: 'Medium', status: 'On Hold', technicianId: 'T-02', raised: '2026-06-25', due: '2026-07-02', estHours: 5, laborCost: 400, partsCost: 180 },
  { id: 'WO-5116', title: 'Roof gutter clearing & re-seal', type: 'Corrective', origin: 'SR-2311', asset: 'ROOF-RS-B', site: 'Rimba School', trade: 'Civil', priority: 'Low', status: 'Completed', technicianId: 'T-06', raised: '2026-06-22', due: '2026-06-30', estHours: 12, laborCost: 720, partsCost: 260, completedAt: '2026-06-29' },
  { id: 'WO-5114', title: 'Sprinkler zone valve annual overhaul', type: 'Preventive', origin: 'PPM-018', asset: 'SPR-TS-Z4', site: 'Times Square Mall', trade: 'Fire Protection', priority: 'Medium', status: 'Verified', technicianId: 'T-03', raised: '2026-06-18', due: '2026-06-28', estHours: 6, laborCost: 480, partsCost: 410, completedAt: '2026-06-26' },
  { id: 'WO-5110', title: 'Cooling tower fill media replacement', type: 'Corrective', origin: 'CMP-1031', asset: 'CT-GC-01', site: 'Gov Complex', trade: 'HVAC', priority: 'Medium', status: 'Closed', technicianId: 'T-01', raised: '2026-06-10', due: '2026-06-20', estHours: 16, laborCost: 1280, partsCost: 2100, completedAt: '2026-06-19' },
]

const SEED_PPM: PpmSchedule[] = [
  { id: 'PPM-014', asset: 'CH-GC-02 — Chiller 2', site: 'Gov Complex', task: 'Quarterly service: coils, refrigerant, controls', trade: 'HVAC', frequency: 'Quarterly', lastDone: '2026-03-28', nextDue: '2026-06-28', compliance: 92 },
  { id: 'PPM-021', asset: 'FP-TS-01 — Fire Pump', site: 'Times Square Mall', task: 'Monthly churn test & flow verification', trade: 'Fire Protection', frequency: 'Monthly', lastDone: '2026-06-01', nextDue: '2026-07-01', compliance: 100 },
  { id: 'PPM-018', asset: 'SPR-TS-Z4 — Sprinkler Zone 4', site: 'Times Square Mall', task: 'Annual zone valve overhaul & alarm test', trade: 'Fire Protection', frequency: 'Annual', lastDone: '2026-06-26', nextDue: '2027-06-26', compliance: 100 },
  { id: 'PPM-009', asset: 'GEN-BB-01 — Standby Generator', site: 'Baiduri HQ Tower', task: 'Monthly on-load test run 30 min', trade: 'Electrical', frequency: 'Monthly', lastDone: '2026-06-05', nextDue: '2026-07-05', compliance: 96 },
  { id: 'PPM-027', asset: 'LIFT-RS-01 — Passenger Lift', site: 'Rimba School', task: 'Monthly statutory lift inspection', trade: 'Lifts', frequency: 'Monthly', lastDone: '2026-06-10', nextDue: '2026-07-10', compliance: 100 },
  { id: 'PPM-032', asset: 'WT-GR-01 — Water Tank', site: 'Gadong Residences', task: 'Semi-annual tank cleaning & disinfection', trade: 'Plumbing', frequency: 'Semi-Annual', lastDone: '2026-01-15', nextDue: '2026-07-15', compliance: 88 },
]

const SEED_MONITORS: Monitor[] = [
  { id: 'MON-07', asset: 'AHU-BB-03', site: 'Baiduri HQ Tower', parameter: 'Bearing vibration', reading: '9.2 mm/s', threshold: '7.1 mm/s', condition: 'Alert', recommendation: 'Replace bearing set within 7 days', woRaised: 'WO-5118' },
  { id: 'MON-11', asset: 'CH-GC-01', site: 'Gov Complex', parameter: 'Condenser approach temp', reading: '4.1 °C', threshold: '5.0 °C', condition: 'Watch', recommendation: 'Schedule condenser tube brush at next PPM' },
  { id: 'MON-04', asset: 'GEN-BB-01', site: 'Baiduri HQ Tower', parameter: 'Battery voltage', reading: '25.9 V', threshold: '25.5 V', condition: 'Normal', recommendation: '—' },
  { id: 'MON-15', asset: 'LIFT-TS-03', site: 'Times Square Mall', parameter: 'Door cycle faults / week', reading: '14', threshold: '10', condition: 'Alert', recommendation: 'Inspect door operator & sensors' },
  { id: 'MON-09', asset: 'CT-GC-01', site: 'Gov Complex', parameter: 'Fan motor current', reading: '11.8 A', threshold: '12.5 A', condition: 'Normal', recommendation: '—' },
]

const SEED_AMC: AmcContract[] = [
  { id: 'AMC-2026-04', client: 'Baiduri Bank', site: 'HQ Tower (18 floors)', scope: 'Comprehensive M&E + lifts', valueBnd: 186000, start: '2026-01-01', end: '2026-12-31', sla: '2h response / 24h resolution', visitsPlanned: 48, visitsDone: 26 },
  { id: 'AMC-2026-02', client: 'Ministry of Education', site: 'Rimba School Campus', scope: 'HVAC + electrical + civil fabric', valueBnd: 96000, start: '2026-01-01', end: '2026-12-31', sla: '4h response / 48h resolution', visitsPlanned: 24, visitsDone: 13 },
  { id: 'AMC-2025-11', client: 'Times Square Group', site: 'Mall & Car Park', scope: 'Fire systems + HVAC comprehensive', valueBnd: 152000, start: '2025-09-01', end: '2026-08-31', sla: '2h response / 24h resolution', visitsPlanned: 36, visitsDone: 31 },
  { id: 'AMC-2026-07', client: 'Public Works Department', site: 'Gov Complex', scope: 'Full facility maintenance', valueBnd: 240000, start: '2026-04-01', end: '2027-03-31', sla: '4h response / 48h resolution', visitsPlanned: 52, visitsDone: 12 },
]

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const TODAY = new Date('2026-07-03T00:00:00Z')
const isPast = (iso: string) => new Date(iso + 'T00:00:00Z') < TODAY

const priorityColor = (p: Priority) =>
  p === 'Critical' ? 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/50 dark:border-rose-900'
  : p === 'High' ? 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-900'
  : p === 'Medium' ? 'text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950/50 dark:border-sky-900'
  : 'text-muted-foreground bg-muted border-border'

const woStatusColor = (s: WoStatus) =>
  s === 'Closed' || s === 'Verified' ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900'
  : s === 'Completed' ? 'text-teal-700 bg-teal-50 border-teal-200 dark:text-teal-400 dark:bg-teal-950/50 dark:border-teal-900'
  : s === 'In Progress' || s === 'Dispatched' ? 'text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950/50 dark:border-sky-900'
  : s === 'Assigned' ? 'text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-950/50 dark:border-violet-900'
  : s === 'On Hold' ? 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-900'
  : s === 'Cancelled' ? 'text-muted-foreground bg-muted border-border line-through'
  : 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/50 dark:border-rose-900' // New

const reqStatusColor = (s: RequestStatus) =>
  s === 'Converted' ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900'
  : s === 'Under Review' ? 'text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950/50 dark:border-sky-900'
  : s === 'Rejected' ? 'text-muted-foreground bg-muted border-border'
  : 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-900'

/** Next action in the WO lifecycle, if any. */
function nextTransition(s: WoStatus): { to: WoStatus; label: string; icon: typeof PlayCircle } | null {
  switch (s) {
    case 'Assigned': return { to: 'Dispatched', label: 'Dispatch', icon: Truck }
    case 'Dispatched': return { to: 'In Progress', label: 'Start Work', icon: PlayCircle }
    case 'In Progress': return { to: 'Completed', label: 'Complete', icon: CheckCircle2 }
    case 'Completed': return { to: 'Verified', label: 'Verify', icon: ShieldCheck }
    case 'Verified': return { to: 'Closed', label: 'Close', icon: FileCheck2 }
    default: return null // New (needs assignment), On Hold (resume), terminal states
  }
}

const addMonths = (iso: string, months: number) => {
  const d = new Date(iso + 'T00:00:00Z')
  d.setUTCMonth(d.getUTCMonth() + months)
  return d.toISOString().slice(0, 10)
}
const freqMonths: Record<Frequency, number> = { Weekly: 0, Monthly: 1, Quarterly: 3, 'Semi-Annual': 6, Annual: 12 }

const PIPELINE: WoStatus[] = ['New', 'Assigned', 'Dispatched', 'In Progress', 'On Hold', 'Completed', 'Verified', 'Closed']

const TREND = [
  { month: 'Feb', created: 34, completed: 31 },
  { month: 'Mar', created: 41, completed: 38 },
  { month: 'Apr', created: 37, completed: 39 },
  { month: 'May', created: 45, completed: 41 },
  { month: 'Jun', created: 42, completed: 44 },
  { month: 'Jul', created: 12, completed: 8 },
]

// ─────────────────────────────────────────────────────────────────────────────
// Focus presets — which tab/filters each nav entry opens
// ─────────────────────────────────────────────────────────────────────────────
export type MaintenanceFocus =
  | 'maintenance' | 'complaints' | 'service-requests' | 'work-orders'
  | 'preventive' | 'corrective' | 'predictive' | 'dispatch' | 'technicians' | 'amc'

const FOCUS_TAB: Record<MaintenanceFocus, string> = {
  maintenance: 'overview',
  complaints: 'requests',
  'service-requests': 'requests',
  'work-orders': 'workorders',
  corrective: 'workorders',
  preventive: 'ppm',
  predictive: 'predictive',
  dispatch: 'dispatch',
  technicians: 'technicians',
  amc: 'amc',
}

// ─────────────────────────────────────────────────────────────────────────────
// View
// ─────────────────────────────────────────────────────────────────────────────
export default function MaintenanceView({ focus = 'maintenance' }: { onNavigate?: (v: View) => void; focus?: MaintenanceFocus }) {
  const [tab, setTab] = useState(FOCUS_TAB[focus])
  const [requests, setRequests] = useState<ServiceRequest[]>(SEED_REQUESTS)
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(SEED_WORK_ORDERS)
  const [ppm, setPpm] = useState<PpmSchedule[]>(SEED_PPM)
  const [monitors, setMonitors] = useState<Monitor[]>(SEED_MONITORS)
  const [woSeq, setWoSeq] = useState(5122)

  const [search, setSearch] = useState('')
  const [reqTypeFilter, setReqTypeFilter] = useState<'All' | RequestType>(
    focus === 'complaints' ? 'Complaint' : focus === 'service-requests' ? 'Service Request' : 'All'
  )
  const [woTypeFilter, setWoTypeFilter] = useState<'All' | WoType>(focus === 'corrective' ? 'Corrective' : 'All')
  const [woStatusFilter, setWoStatusFilter] = useState<'All' | WoStatus>('All')
  const [detailWo, setDetailWo] = useState<WorkOrder | null>(null)

  // Re-focus when the user picks a different maintenance menu item while mounted.
  useEffect(() => {
    setTab(FOCUS_TAB[focus])
    if (focus === 'complaints') setReqTypeFilter('Complaint')
    if (focus === 'service-requests') setReqTypeFilter('Service Request')
    if (focus === 'corrective') setWoTypeFilter('Corrective')
  }, [focus])

  // ── Derived state ──────────────────────────────────────────────────────────
  const techLoad = useMemo(() => {
    const load: Record<string, number> = {}
    for (const wo of workOrders) {
      if (wo.technicianId && !['Closed', 'Cancelled', 'Verified'].includes(wo.status)) {
        load[wo.technicianId] = (load[wo.technicianId] ?? 0) + 1
      }
    }
    return load
  }, [workOrders])

  const openWos = workOrders.filter((w) => !['Closed', 'Cancelled'].includes(w.status))
  const overdueWos = openWos.filter((w) => isPast(w.due))
  const pendingRequests = requests.filter((r) => r.status === 'New' || r.status === 'Under Review')
  const unassignedWos = workOrders.filter((w) => w.status === 'New')
  const duePpm = ppm.filter((p) => isPast(p.nextDue))
  const alertMonitors = monitors.filter((m) => m.condition === 'Alert' && !m.woRaised)
  const slaCompliance = Math.round(((openWos.length - overdueWos.length) / Math.max(openWos.length, 1)) * 100)
  const avgPpmCompliance = Math.round(ppm.reduce((a, p) => a + p.compliance, 0) / Math.max(ppm.length, 1))

  // ── Workflow actions ───────────────────────────────────────────────────────
  const createWo = (partial: Omit<WorkOrder, 'id' | 'status' | 'raised'>): string => {
    const id = `WO-${woSeq}`
    setWoSeq((n) => n + 1)
    setWorkOrders((prev) => [{ ...partial, id, status: 'New', raised: '2026-07-03' }, ...prev])
    return id
  }

  const reviewRequest = (id: string) =>
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'Under Review' } : r)))

  const rejectRequest = (id: string) =>
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'Rejected' } : r)))

  const approveRequest = (req: ServiceRequest) => {
    const woId = createWo({
      title: req.title,
      type: 'Corrective',
      origin: req.id,
      asset: '—',
      site: req.site,
      trade: req.trade,
      priority: req.priority,
      due: req.slaDue,
      estHours: 4,
      laborCost: 320,
      partsCost: 0,
    })
    setRequests((prev) => prev.map((r) => (r.id === req.id ? { ...r, status: 'Converted', linkedWo: woId } : r)))
  }

  const assignWo = (woId: string, technicianId: string) =>
    setWorkOrders((prev) => prev.map((w) => (w.id === woId ? { ...w, technicianId, status: 'Assigned' } : w)))

  const advanceWo = (woId: string) =>
    setWorkOrders((prev) =>
      prev.map((w) => {
        if (w.id !== woId) return w
        const next = nextTransition(w.status)
        if (!next) return w
        return { ...w, status: next.to, completedAt: next.to === 'Completed' ? '2026-07-03' : w.completedAt }
      })
    )

  const holdWo = (woId: string, resume = false) =>
    setWorkOrders((prev) =>
      prev.map((w) => (w.id === woId ? { ...w, status: resume ? 'In Progress' : 'On Hold' } : w))
    )

  const cancelWo = (woId: string) =>
    setWorkOrders((prev) => prev.map((w) => (w.id === woId ? { ...w, status: 'Cancelled' } : w)))

  const generatePpmWo = (schedule: PpmSchedule) => {
    createWo({
      title: `${schedule.task} — ${schedule.asset}`,
      type: 'Preventive',
      origin: schedule.id,
      asset: schedule.asset.split(' — ')[0],
      site: schedule.site,
      trade: schedule.trade,
      priority: 'Medium',
      due: '2026-07-10',
      estHours: 6,
      laborCost: 480,
      partsCost: 150,
    })
    setPpm((prev) =>
      prev.map((p) =>
        p.id === schedule.id
          ? { ...p, lastDone: '2026-07-03', nextDue: addMonths('2026-07-03', freqMonths[p.frequency] || 1) }
          : p
      )
    )
  }

  const raiseMonitorWo = (mon: Monitor) => {
    const woId = createWo({
      title: `${mon.recommendation} — ${mon.asset}`,
      type: 'Predictive',
      origin: mon.id,
      asset: mon.asset,
      site: mon.site,
      trade: 'HVAC',
      priority: 'High',
      due: '2026-07-10',
      estHours: 8,
      laborCost: 640,
      partsCost: 400,
    })
    setMonitors((prev) => prev.map((m) => (m.id === mon.id ? { ...m, woRaised: woId } : m)))
  }

  // ── Filtered lists ─────────────────────────────────────────────────────────
  const q = search.toLowerCase()
  const filteredRequests = requests.filter(
    (r) =>
      (reqTypeFilter === 'All' || r.type === reqTypeFilter) &&
      (!q || [r.id, r.customer, r.site, r.title].join(' ').toLowerCase().includes(q))
  )
  const filteredWos = workOrders.filter(
    (w) =>
      (woTypeFilter === 'All' || w.type === woTypeFilter) &&
      (woStatusFilter === 'All' || w.status === woStatusFilter) &&
      (!q || [w.id, w.title, w.asset, w.site, w.origin].join(' ').toLowerCase().includes(q))
  )

  const techName = (id?: string) => TECHNICIANS.find((t) => t.id === id)?.name ?? '—'

  const woByTrade = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const w of openWos) counts[w.trade] = (counts[w.trade] ?? 0) + 1
    return Object.entries(counts).map(([trade, count]) => ({ trade, count }))
  }, [openWos])

  const woByType = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const w of workOrders) if (w.status !== 'Cancelled') counts[w.type] = (counts[w.type] ?? 0) + 1
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [workOrders])

  const TYPE_COLORS: Record<string, string> = { Corrective: CHART.rose, Preventive: CHART.emerald, Predictive: CHART.violet }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Wrench className="h-6 w-6 text-primary" /> Maintenance Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Requests → work orders → dispatch → completion → verification, in one workflow
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search WOs, requests, assets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
          </div>
        </div>
      </FadeIn>

      {/* KPI strip */}
      <FadeIn delay={0.05}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {[
            { label: 'Open Work Orders', value: openWos.length, icon: Hammer, tone: 'text-sky-700' },
            { label: 'Overdue', value: overdueWos.length, icon: AlertTriangle, tone: 'text-rose-700' },
            { label: 'Pending Requests', value: pendingRequests.length, icon: ClipboardList, tone: 'text-amber-700' },
            { label: 'SLA Compliance', value: `${slaCompliance}%`, icon: Gauge, tone: 'text-emerald-700' },
            { label: 'PPM Due', value: duePpm.length, icon: CalendarClock, tone: 'text-violet-600' },
            { label: 'Condition Alerts', value: alertMonitors.length, icon: Radar, tone: 'text-rose-700' },
          ].map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <kpi.icon className={cn('h-8 w-8 shrink-0 rounded-lg bg-muted p-1.5', kpi.tone)} />
                <div>
                  <div className="text-xl font-bold leading-none">{kpi.value}</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">{kpi.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </FadeIn>

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="overview"><Activity className="mr-1.5 h-3.5 w-3.5" />Overview</TabsTrigger>
          <TabsTrigger value="requests"><MessageSquareWarning className="mr-1.5 h-3.5 w-3.5" />Requests
            {pendingRequests.length > 0 && <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">{pendingRequests.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="workorders"><Hammer className="mr-1.5 h-3.5 w-3.5" />Work Orders
            <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">{openWos.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="ppm"><CalendarClock className="mr-1.5 h-3.5 w-3.5" />Preventive
            {duePpm.length > 0 && <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">{duePpm.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="predictive"><Radar className="mr-1.5 h-3.5 w-3.5" />Predictive</TabsTrigger>
          <TabsTrigger value="dispatch"><Truck className="mr-1.5 h-3.5 w-3.5" />Dispatch
            {unassignedWos.length > 0 && <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">{unassignedWos.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="technicians"><HardHat className="mr-1.5 h-3.5 w-3.5" />Technicians</TabsTrigger>
          <TabsTrigger value="amc"><FileCheck2 className="mr-1.5 h-3.5 w-3.5" />AMC Contracts</TabsTrigger>
        </TabsList>

        {/* ── OVERVIEW ─────────────────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Work Order Pipeline</CardTitle>
              <CardDescription>Live count at every workflow stage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-stretch gap-2">
                {PIPELINE.map((stage, i) => {
                  const count = workOrders.filter((w) => w.status === stage).length
                  return (
                    <div key={stage} className="flex items-center gap-2">
                      <button
                        onClick={() => { setTab('workorders'); setWoStatusFilter(stage); setWoTypeFilter('All') }}
                        className={cn(
                          'min-w-[92px] rounded-xl border px-3 py-2 text-center transition-colors hover:border-primary/50',
                          count > 0 ? 'bg-card' : 'bg-muted/40 opacity-60'
                        )}
                      >
                        <div className="text-lg font-bold leading-none">{count}</div>
                        <div className="mt-1 text-[10px] text-muted-foreground">{stage}</div>
                      </button>
                      {i < PIPELINE.length - 1 && <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Created vs Completed</CardTitle>
                <CardDescription>Work orders per month</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={TREND} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="created" stroke={CHART.sky} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="completed" stroke={CHART.emerald} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Open Work Orders by Trade</CardTitle>
                <CardDescription>Where the current workload sits</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={woByTrade} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                    <XAxis dataKey="trade" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {woByTrade.map((_, i) => (
                        <Cell key={i} fill={[CHART.emerald, CHART.sky, CHART.amber, CHART.violet, CHART.rose, CHART.slate][i % 6]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Mix by Type</CardTitle>
                <CardDescription>Corrective vs planned work</CardDescription>
              </CardHeader>
              <CardContent className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={woByType} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={3}>
                      {woByType.map((entry) => (
                        <Cell key={entry.name} fill={TYPE_COLORS[entry.name] ?? CHART.slate} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Needs Attention</CardTitle>
                <CardDescription>Overdue and unassigned work</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {[...overdueWos, ...unassignedWos.filter((w) => !overdueWos.includes(w))].slice(0, 5).map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setDetailWo(w)}
                    className="flex w-full items-center justify-between gap-3 rounded-lg border p-2.5 text-left transition-colors hover:border-primary/50"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      {isPast(w.due) ? <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" /> : <Clock className="h-4 w-4 shrink-0 text-amber-500" />}
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{w.id} · {w.title}</div>
                        <div className="text-xs text-muted-foreground">{w.site} · due {fmtDate(w.due)}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn('shrink-0', woStatusColor(w.status))}>{w.status}</Badge>
                  </button>
                ))}
                {overdueWos.length === 0 && unassignedWos.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">All clear — nothing overdue or unassigned 🎉</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── REQUESTS ─────────────────────────────────────────────────────── */}
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-base">Complaints & Service Requests</CardTitle>
                <CardDescription>Triage intake: review, then approve into a work order or reject</CardDescription>
              </div>
              <Select value={reqTypeFilter} onValueChange={(v) => setReqTypeFilter(v as typeof reqTypeFilter)}>
                <SelectTrigger aria-label="Filter by request type" className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All types</SelectItem>
                  <SelectItem value="Complaint">Complaints</SelectItem>
                  <SelectItem value="Service Request">Service Requests</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ref</TableHead>
                    <TableHead>Request</TableHead>
                    <TableHead className="hidden md:table-cell">Customer / Site</TableHead>
                    <TableHead className="hidden lg:table-cell">Source</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="hidden sm:table-cell">SLA Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Workflow</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">{r.id}</TableCell>
                      <TableCell>
                        <div className="font-medium">{r.title}</div>
                        <div className="max-w-[280px] truncate text-xs text-muted-foreground">{r.desc}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-sm">{r.customer}</div>
                        <div className="text-xs text-muted-foreground">{r.site}</div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline" className="font-normal">
                          {r.source === 'QR Scan' && <QrCode className="mr-1 h-3 w-3" />}{r.source}
                        </Badge>
                      </TableCell>
                      <TableCell><Badge variant="outline" className={priorityColor(r.priority)}>{r.priority}</Badge></TableCell>
                      <TableCell className={cn('hidden text-xs sm:table-cell', isPast(r.slaDue) && r.status !== 'Converted' && r.status !== 'Rejected' && 'font-semibold text-rose-700')}>
                        {fmtDate(r.slaDue)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={reqStatusColor(r.status)}>{r.status}</Badge>
                        {r.linkedWo && <div className="mt-1 font-mono text-[10px] text-muted-foreground">→ {r.linkedWo}</div>}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          {r.status === 'New' && (
                            <Button size="sm" variant="outline" onClick={() => reviewRequest(r.id)}>
                              <Eye className="mr-1 h-3.5 w-3.5" />Review
                            </Button>
                          )}
                          {(r.status === 'New' || r.status === 'Under Review') && (
                            <>
                              <Button size="sm" onClick={() => approveRequest(r)}>
                                <Hammer className="mr-1 h-3.5 w-3.5" />Create WO
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => rejectRequest(r.id)}>
                                <XCircle className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── WORK ORDERS ──────────────────────────────────────────────────── */}
        <TabsContent value="workorders" className="space-y-4">
          <Card>
            <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0 pb-3">
              <div>
                <CardTitle className="text-base">Work Orders</CardTitle>
                <CardDescription>Full lifecycle: assign → dispatch → execute → complete → verify → close</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={woTypeFilter} onValueChange={(v) => setWoTypeFilter(v as typeof woTypeFilter)}>
                  <SelectTrigger aria-label="Filter by work order type" className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All types</SelectItem>
                    <SelectItem value="Corrective">Corrective</SelectItem>
                    <SelectItem value="Preventive">Preventive</SelectItem>
                    <SelectItem value="Predictive">Predictive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={woStatusFilter} onValueChange={(v) => setWoStatusFilter(v as typeof woStatusFilter)}>
                  <SelectTrigger aria-label="Filter by work order status" className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All statuses</SelectItem>
                    {[...PIPELINE, 'Cancelled' as const].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>WO</TableHead>
                    <TableHead>Job</TableHead>
                    <TableHead className="hidden lg:table-cell">Type</TableHead>
                    <TableHead className="hidden md:table-cell">Technician</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="hidden sm:table-cell">Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Workflow</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWos.map((w) => {
                    const next = nextTransition(w.status)
                    return (
                      <TableRow key={w.id} className="cursor-pointer" onClick={() => setDetailWo(w)}>
                        <TableCell className="font-mono text-xs">
                          {w.id}
                          <div className="text-[10px] text-muted-foreground">from {w.origin}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{w.title}</div>
                          <div className="text-xs text-muted-foreground">{w.asset} · {w.site}</div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant="outline" className="font-normal">{w.type}</Badge>
                        </TableCell>
                        <TableCell className="hidden text-sm md:table-cell">{techName(w.technicianId)}</TableCell>
                        <TableCell><Badge variant="outline" className={priorityColor(w.priority)}>{w.priority}</Badge></TableCell>
                        <TableCell className={cn('hidden text-xs sm:table-cell', isPast(w.due) && !['Closed', 'Verified', 'Completed', 'Cancelled'].includes(w.status) && 'font-semibold text-rose-700')}>
                          {fmtDate(w.due)}
                        </TableCell>
                        <TableCell><Badge variant="outline" className={woStatusColor(w.status)}>{w.status}</Badge></TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-1.5">
                            {w.status === 'New' && (
                              <Select onValueChange={(techId) => assignWo(w.id, techId)}>
                                <SelectTrigger aria-label="Assign technician" className="h-8 w-[130px] text-xs"><SelectValue placeholder="Assign to..." /></SelectTrigger>
                                <SelectContent>
                                  {TECHNICIANS.filter((t) => !t.onLeave).map((t) => (
                                    <SelectItem key={t.id} value={t.id}>{t.name} · {t.trade}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                            {next && (
                              <Button size="sm" onClick={() => advanceWo(w.id)}>
                                <next.icon className="mr-1 h-3.5 w-3.5" />{next.label}
                              </Button>
                            )}
                            {['Assigned', 'Dispatched', 'In Progress'].includes(w.status) && (
                              <Button size="sm" variant="ghost" title="Put on hold" onClick={() => holdWo(w.id)}>
                                <PauseCircle className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {w.status === 'On Hold' && (
                              <Button size="sm" variant="outline" onClick={() => holdWo(w.id, true)}>
                                <PlayCircle className="mr-1 h-3.5 w-3.5" />Resume
                              </Button>
                            )}
                            {w.status === 'New' && (
                              <Button size="sm" variant="ghost" title="Cancel" onClick={() => cancelWo(w.id)}>
                                <XCircle className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── PPM ──────────────────────────────────────────────────────────── */}
        <TabsContent value="ppm" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Preventive Maintenance Schedules</CardTitle>
              <CardDescription>Planned PPM — generate a work order when a schedule falls due (avg compliance {avgPpmCompliance}%)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Asset / Task</TableHead>
                    <TableHead className="hidden md:table-cell">Frequency</TableHead>
                    <TableHead className="hidden sm:table-cell">Last Done</TableHead>
                    <TableHead>Next Due</TableHead>
                    <TableHead className="hidden lg:table-cell">Compliance</TableHead>
                    <TableHead className="text-right">Workflow</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ppm.map((p) => {
                    const due = isPast(p.nextDue)
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs">{p.id}</TableCell>
                        <TableCell>
                          <div className="font-medium">{p.asset}</div>
                          <div className="max-w-[300px] truncate text-xs text-muted-foreground">{p.task} · {p.site}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell"><Badge variant="outline" className="font-normal">{p.frequency}</Badge></TableCell>
                        <TableCell className="hidden text-xs sm:table-cell">{fmtDate(p.lastDone)}</TableCell>
                        <TableCell className={cn('text-xs', due && 'font-semibold text-rose-700')}>
                          {fmtDate(p.nextDue)}
                          {due && <Badge variant="outline" className="ml-2 border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-400">Due</Badge>}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-2">
                            <Progress value={p.compliance} className="h-1.5 w-16" />
                            <span className="text-xs text-muted-foreground">{p.compliance}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant={due ? 'default' : 'outline'} onClick={() => generatePpmWo(p)}>
                            <Plus className="mr-1 h-3.5 w-3.5" />Generate WO
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── PREDICTIVE ───────────────────────────────────────────────────── */}
        <TabsContent value="predictive" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Condition Monitoring</CardTitle>
              <CardDescription>Sensor readings vs thresholds — raise predictive work orders before failure</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Monitor</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead>Parameter</TableHead>
                    <TableHead className="hidden sm:table-cell">Reading / Threshold</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead className="hidden md:table-cell">Recommendation</TableHead>
                    <TableHead className="text-right">Workflow</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monitors.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-mono text-xs">{m.id}</TableCell>
                      <TableCell>
                        <div className="font-medium">{m.asset}</div>
                        <div className="text-xs text-muted-foreground">{m.site}</div>
                      </TableCell>
                      <TableCell className="text-sm">{m.parameter}</TableCell>
                      <TableCell className="hidden text-xs sm:table-cell">
                        <span className="font-semibold">{m.reading}</span>
                        <span className="text-muted-foreground"> / {m.threshold}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          m.condition === 'Alert' ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-400'
                          : m.condition === 'Watch' ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-400'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400'
                        }>
                          {m.condition}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden max-w-[240px] truncate text-xs text-muted-foreground md:table-cell">{m.recommendation}</TableCell>
                      <TableCell className="text-right">
                        {m.woRaised ? (
                          <span className="font-mono text-xs text-muted-foreground">→ {m.woRaised}</span>
                        ) : m.condition !== 'Normal' ? (
                          <Button size="sm" variant={m.condition === 'Alert' ? 'default' : 'outline'} onClick={() => raiseMonitorWo(m)}>
                            <Hammer className="mr-1 h-3.5 w-3.5" />Raise WO
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── DISPATCH ─────────────────────────────────────────────────────── */}
        <TabsContent value="dispatch" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-5">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Dispatch Queue</CardTitle>
                <CardDescription>Unassigned work orders awaiting a crew</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {unassignedWos.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">Queue clear — every work order has a technician.</p>
                )}
                {unassignedWos.map((w) => (
                  <div key={w.id} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{w.id} · {w.title}</div>
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />{w.site} · due {fmtDate(w.due)}
                        </div>
                      </div>
                      <Badge variant="outline" className={priorityColor(w.priority)}>{w.priority}</Badge>
                    </div>
                    <Select onValueChange={(techId) => assignWo(w.id, techId)}>
                      <SelectTrigger aria-label="Dispatch to technician" className="mt-2 h-8 text-xs"><SelectValue placeholder="Dispatch to technician..." /></SelectTrigger>
                      <SelectContent>
                        {TECHNICIANS.filter((t) => !t.onLeave).map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name} — {t.trade} · {t.zone} ({techLoad[t.id] ?? 0} active)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Crew Board</CardTitle>
                <CardDescription>Availability and live workload per technician</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {TECHNICIANS.map((t) => {
                    const load = techLoad[t.id] ?? 0
                    const status = t.onLeave ? 'On Leave' : load > 0 ? 'On Job' : 'Available'
                    return (
                      <div key={t.id} className={cn('rounded-lg border p-3', t.onLeave && 'opacity-60')}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                              {t.name.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <div>
                              <div className="text-sm font-medium">{t.name}</div>
                              <div className="text-xs text-muted-foreground">{t.trade} · {t.zone}</div>
                            </div>
                          </div>
                          <Badge variant="outline" className={
                            status === 'Available' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400'
                            : status === 'On Job' ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-400'
                            : 'border-border bg-muted text-muted-foreground'
                          }>
                            {status}
                          </Badge>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Hammer className="h-3 w-3" />{load} active job{load === 1 ? '' : 's'}</span>
                          <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{t.rating}</span>
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{t.phone.slice(-7)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── TECHNICIANS ──────────────────────────────────────────────────── */}
        <TabsContent value="technicians" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Technician Roster</CardTitle>
              <CardDescription>Skills, certifications, zones and live workload</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Technician</TableHead>
                    <TableHead>Trade</TableHead>
                    <TableHead className="hidden md:table-cell">Zone</TableHead>
                    <TableHead className="hidden lg:table-cell">Certifications</TableHead>
                    <TableHead>Active Jobs</TableHead>
                    <TableHead className="hidden sm:table-cell">Rating</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {TECHNICIANS.map((t) => {
                    const load = techLoad[t.id] ?? 0
                    return (
                      <TableRow key={t.id}>
                        <TableCell>
                          <div className="font-medium">{t.name}</div>
                          <div className="text-xs text-muted-foreground">{t.id} · {t.phone}</div>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="font-normal">{t.trade}</Badge></TableCell>
                        <TableCell className="hidden text-sm md:table-cell">{t.zone}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {t.certs.map((c) => <Badge key={c} variant="secondary" className="text-[10px] font-normal">{c}</Badge>)}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-semibold">{load}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="flex items-center gap-1 text-sm"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{t.rating}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            t.onLeave ? 'border-border bg-muted text-muted-foreground'
                            : load > 0 ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-400'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400'
                          }>
                            {t.onLeave ? 'On Leave' : load > 0 ? 'On Job' : 'Available'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── AMC ──────────────────────────────────────────────────────────── */}
        <TabsContent value="amc" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Annual Maintenance Contracts</CardTitle>
              <CardDescription>Coverage, SLA commitments and visit progress</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract</TableHead>
                    <TableHead>Client / Site</TableHead>
                    <TableHead className="hidden lg:table-cell">Scope</TableHead>
                    <TableHead className="hidden sm:table-cell">Value</TableHead>
                    <TableHead className="hidden md:table-cell">SLA</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Visits</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SEED_AMC.map((c) => {
                    const end = new Date(c.end + 'T00:00:00Z')
                    const monthsLeft = (end.getTime() - TODAY.getTime()) / (30 * 24 * 3600 * 1000)
                    const status = monthsLeft < 0 ? 'Expired' : monthsLeft < 3 ? 'Expiring' : 'Active'
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-xs">{c.id}</TableCell>
                        <TableCell>
                          <div className="font-medium">{c.client}</div>
                          <div className="text-xs text-muted-foreground">{c.site}</div>
                        </TableCell>
                        <TableCell className="hidden max-w-[200px] truncate text-sm lg:table-cell">{c.scope}</TableCell>
                        <TableCell className="hidden text-sm sm:table-cell">BND {(c.valueBnd / 1000).toFixed(0)}k</TableCell>
                        <TableCell className="hidden text-xs text-muted-foreground md:table-cell">{c.sla}</TableCell>
                        <TableCell className="text-xs">{fmtDate(c.start)} → {fmtDate(c.end)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={(c.visitsDone / c.visitsPlanned) * 100} className="h-1.5 w-16" />
                            <span className="text-xs text-muted-foreground">{c.visitsDone}/{c.visitsPlanned}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            status === 'Active' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400'
                            : status === 'Expiring' ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-400'
                            : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-400'
                          }>
                            {status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── WO Detail Dialog ─────────────────────────────────────────────── */}
      <Dialog open={!!detailWo} onOpenChange={(open) => !open && setDetailWo(null)}>
        <DialogContent className="max-w-lg">
          {detailWo && (() => {
            // Re-read live state so workflow buttons inside the dialog stay current
            const wo = workOrders.find((w) => w.id === detailWo.id) ?? detailWo
            const next = nextTransition(wo.status)
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span className="font-mono text-sm text-muted-foreground">{wo.id}</span>
                    <Badge variant="outline" className={woStatusColor(wo.status)}>{wo.status}</Badge>
                  </DialogTitle>
                  <DialogDescription>{wo.title}</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div><div className="text-xs text-muted-foreground">Type</div>{wo.type} <span className="text-xs text-muted-foreground">(from {wo.origin})</span></div>
                  <div><div className="text-xs text-muted-foreground">Priority</div><Badge variant="outline" className={priorityColor(wo.priority)}>{wo.priority}</Badge></div>
                  <div><div className="text-xs text-muted-foreground">Asset</div>{wo.asset}</div>
                  <div><div className="text-xs text-muted-foreground">Site</div>{wo.site}</div>
                  <div><div className="text-xs text-muted-foreground">Technician</div>{techName(wo.technicianId)}</div>
                  <div><div className="text-xs text-muted-foreground">Trade</div>{wo.trade}</div>
                  <div><div className="text-xs text-muted-foreground">Raised</div>{fmtDate(wo.raised)}</div>
                  <div><div className="text-xs text-muted-foreground">Due</div><span className={cn(isPast(wo.due) && !['Closed', 'Verified', 'Cancelled'].includes(wo.status) && 'font-semibold text-rose-700')}>{fmtDate(wo.due)}</span></div>
                  <div><div className="text-xs text-muted-foreground">Estimate</div>{wo.estHours} h</div>
                  <div><div className="text-xs text-muted-foreground">Cost (labour + parts)</div>BND {(wo.laborCost + wo.partsCost).toLocaleString()}</div>
                  {wo.completedAt && <div><div className="text-xs text-muted-foreground">Completed</div>{fmtDate(wo.completedAt)}</div>}
                </div>
                <div className="flex flex-wrap justify-end gap-2 pt-2">
                  {wo.status === 'New' && (
                    <Select onValueChange={(techId) => assignWo(wo.id, techId)}>
                      <SelectTrigger aria-label="Assign technician" className="h-9 w-[170px] text-xs"><SelectValue placeholder="Assign technician..." /></SelectTrigger>
                      <SelectContent>
                        {TECHNICIANS.filter((t) => !t.onLeave).map((t) => (
                          <SelectItem key={t.id} value={t.id}>{t.name} · {t.trade}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {wo.status === 'On Hold' && (
                    <Button variant="outline" onClick={() => holdWo(wo.id, true)}>
                      <PlayCircle className="mr-1.5 h-4 w-4" />Resume
                    </Button>
                  )}
                  {next && (
                    <Button onClick={() => advanceWo(wo.id)}>
                      <next.icon className="mr-1.5 h-4 w-4" />{next.label}
                    </Button>
                  )}
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
