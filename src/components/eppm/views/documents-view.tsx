'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, FileText, PencilRuler, FileStack, FileCheck2, FileQuestion, FileImage, FileSpreadsheet, FileSignature, Upload, Filter, Clock, CheckCircle2, Send, Eye } from 'lucide-react'
import { statusColor, fmtDate, type View } from '@/lib/eppm'
import { cn } from '@/lib/utils'

type DocType = 'Drawing' | 'Spec' | 'Method Statement' | 'Contract' | 'RFI' | 'Submittal' | 'Photo' | 'Report'
type DocStatus = 'Draft' | 'Under Review' | 'Approved' | 'Superseded'

interface Doc {
  id: string
  name: string
  type: DocType
  projectCode: string
  version: string
  status: DocStatus
  uploadedBy: string
  date: string
  daysOpen?: number
  rfiTimeline?: { label: string; done: boolean; date?: string }[]
}

const TYPE_ICON: Record<DocType, any> = {
  Drawing: PencilRuler,
  Spec: FileText,
  'Method Statement': FileStack,
  Contract: FileSignature,
  RFI: FileQuestion,
  Submittal: FileCheck2,
  Photo: FileImage,
  Report: FileSpreadsheet,
}

const DOCS: Doc[] = [
  { id: 'D001', name: 'Architectural Floor Plans – Level 3', type: 'Drawing', projectCode: 'PRJ-001', version: 'Rev C', status: 'Approved', uploadedBy: 'S. Patel', date: '2025-01-14' },
  { id: 'D002', name: 'Structural Steel Detail – Grid F', type: 'Drawing', projectCode: 'PRJ-002', version: 'Rev B', status: 'Under Review', uploadedBy: 'M. Chen', date: '2025-01-18' },
  { id: 'D003', name: 'MEP Rough-In Layout', type: 'Drawing', projectCode: 'PRJ-003', version: 'Rev A', status: 'Under Review', uploadedBy: 'K. Ali', date: '2025-01-20' },
  { id: 'D004', name: 'Façade Panel Detail', type: 'Drawing', projectCode: 'PRJ-001', version: 'Rev D', status: 'Superseded', uploadedBy: 'S. Patel', date: '2024-12-08' },
  { id: 'D005', name: 'Concrete Pour Sequence – Tower B', type: 'Method Statement', projectCode: 'PRJ-002', version: 'v1.2', status: 'Approved', uploadedBy: 'R. Khan', date: '2025-01-10' },
  { id: 'D006', name: 'Lift Installation Method Statement', type: 'Method Statement', projectCode: 'PRJ-004', version: 'v2.0', status: 'Under Review', uploadedBy: 'J. Müller', date: '2025-01-22' },
  { id: 'D007', name: 'Hot Work Permit Procedure', type: 'Method Statement', projectCode: 'PRJ-003', version: 'v1.0', status: 'Approved', uploadedBy: 'L. Rossi', date: '2025-01-05' },
  { id: 'D008', name: 'Subcontract Agreement – MEP Works', type: 'Contract', projectCode: 'PRJ-003', version: 'Final', status: 'Approved', uploadedBy: 'A. Novak', date: '2024-11-22' },
  { id: 'D009', name: 'Variation Order #4 – Foundation', type: 'Contract', projectCode: 'PRJ-002', version: 'Draft', status: 'Draft', uploadedBy: 'A. Novak', date: '2025-01-23' },
  { id: 'D010', name: 'Main Contract – Tower A', type: 'Contract', projectCode: 'PRJ-001', version: 'Signed', status: 'Approved', uploadedBy: 'A. Novak', date: '2024-09-15' },
  { id: 'D011', name: 'RFI-042 – Beam clearance at L4', type: 'RFI', projectCode: 'PRJ-001', version: 'v1', status: 'Under Review', uploadedBy: 'M. Chen', date: '2025-01-19', daysOpen: 5, rfiTimeline: [{ label: 'Submitted', done: true, date: '2025-01-19' }, { label: 'Reviewing', done: true, date: '2025-01-21' }, { label: 'Response', done: false }, { label: 'Closed', done: false }] },
  { id: 'D012', name: 'RFI-043 – Ductwork routing', type: 'RFI', projectCode: 'PRJ-003', version: 'v1', status: 'Under Review', uploadedBy: 'K. Ali', date: '2025-01-16', daysOpen: 8, rfiTimeline: [{ label: 'Submitted', done: true, date: '2025-01-16' }, { label: 'Reviewing', done: true, date: '2025-01-19' }, { label: 'Response', done: false }, { label: 'Closed', done: false }] },
  { id: 'D013', name: 'RFI-044 – Tile spec change', type: 'RFI', projectCode: 'PRJ-004', version: 'v1', status: 'Approved', uploadedBy: 'J. Müller', date: '2025-01-12', daysOpen: 0, rfiTimeline: [{ label: 'Submitted', done: true, date: '2025-01-12' }, { label: 'Reviewing', done: true, date: '2025-01-13' }, { label: 'Response', done: true, date: '2025-01-15' }, { label: 'Closed', done: true, date: '2025-01-15' }] },
  { id: 'D014', name: 'RFI-045 – Paint colour approval', type: 'RFI', projectCode: 'PRJ-001', version: 'v1', status: 'Under Review', uploadedBy: 'S. Patel', date: '2025-01-21', daysOpen: 3, rfiTimeline: [{ label: 'Submitted', done: true, date: '2025-01-21' }, { label: 'Reviewing', done: false }, { label: 'Response', done: false }, { label: 'Closed', done: false }] },
  { id: 'D015', name: 'Submittal – HVAC Units (Trane)', type: 'Submittal', projectCode: 'PRJ-003', version: 'Sub-2.1', status: 'Under Review', uploadedBy: 'K. Ali', date: '2025-01-17' },
  { id: 'D016', name: 'Submittal – Switchgear', type: 'Submittal', projectCode: 'PRJ-002', version: 'Sub-1.4', status: 'Approved', uploadedBy: 'M. Chen', date: '2025-01-09' },
  { id: 'D017', name: 'Submittal – Curtain Wall System', type: 'Submittal', projectCode: 'PRJ-001', version: 'Sub-3.0', status: 'Under Review', uploadedBy: 'S. Patel', date: '2025-01-20' },
  { id: 'D018', name: 'Submittal – Ceramic Tiles', type: 'Submittal', projectCode: 'PRJ-004', version: 'Sub-1.1', status: 'Draft', uploadedBy: 'J. Müller', date: '2025-01-23' },
  { id: 'D019', name: 'Spec – Section 09 30 00 Tiling', type: 'Spec', projectCode: 'PRJ-004', version: 'Issued', status: 'Approved', uploadedBy: 'L. Rossi', date: '2024-12-20' },
  { id: 'D020', name: 'Spec – Section 23 00 00 HVAC', type: 'Spec', projectCode: 'PRJ-003', version: 'Issued', status: 'Approved', uploadedBy: 'L. Rossi', date: '2024-12-20' },
  { id: 'D021', name: 'Site Progress Photos – Jan Wk3', type: 'Photo', projectCode: 'PRJ-001', version: 'Set 4', status: 'Approved', uploadedBy: 'R. Khan', date: '2025-01-22' },
  { id: 'D022', name: 'Weekly Progress Report – Wk3', type: 'Report', projectCode: 'PRJ-002', version: 'Wk3', status: 'Approved', uploadedBy: 'M. Chen', date: '2025-01-22' },
  { id: 'D023', name: 'Monthly Cost Report – December', type: 'Report', projectCode: 'PRJ-001', version: 'Dec-24', status: 'Approved', uploadedBy: 'A. Novak', date: '2025-01-05' },
  { id: 'D024', name: 'HSE Incident Log – Q4', type: 'Report', projectCode: 'PRJ-004', version: 'Q4-24', status: 'Under Review', uploadedBy: 'L. Rossi', date: '2025-01-18' },
]

const TAB_MAP: Record<string, DocType | null> = {
  all: null,
  drawings: 'Drawing',
  rfis: 'RFI',
  submittals: 'Submittal',
  ms: 'Method Statement',
}

export function DocumentsView({ onNavigate }: { onNavigate: (v: View) => void }) {
  void onNavigate
  const [q, setQ] = useState('')
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('all')
  const [tab, setTab] = useState('all')

  const filtered = useMemo(() => {
    return DOCS.filter(d => {
      if (q && !`${d.name} ${d.projectCode} ${d.uploadedBy}`.toLowerCase().includes(q.toLowerCase())) return false
      if (type !== 'all' && d.type !== type) return false
      if (status !== 'all' && d.status !== status) return false
      const tabType = TAB_MAP[tab]
      if (tabType && d.type !== tabType) return false
      return true
    })
  }, [q, type, status, tab])

  const kpis = {
    total: DOCS.length,
    approved: DOCS.filter(d => d.status === 'Approved').length,
    review: DOCS.filter(d => d.status === 'Under Review').length,
    rfiOpen: DOCS.filter(d => d.type === 'RFI' && d.status !== 'Approved').length,
    subPending: DOCS.filter(d => d.type === 'Submittal' && d.status !== 'Approved').length,
  }

  const openRFIs = DOCS.filter(d => d.type === 'RFI' && d.status === 'Under Review')

  return (
    <div className="space-y-4">
      <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
        <Card><CardContent className="p-4"><div className="text-[11px] uppercase text-muted-foreground">Total Documents</div><div className="text-2xl font-bold">{kpis.total}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-[11px] uppercase text-muted-foreground">Approved</div><div className="text-2xl font-bold text-emerald-700">{kpis.approved}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-[11px] uppercase text-muted-foreground">Under Review</div><div className="text-2xl font-bold text-sky-700">{kpis.review}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-[11px] uppercase text-muted-foreground">RFIs Open</div><div className="text-2xl font-bold text-amber-700">{kpis.rfiOpen}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-[11px] uppercase text-muted-foreground">Submittals Pending</div><div className="text-2xl font-bold text-violet-600">{kpis.subPending}</div></CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="drawings">Drawings</TabsTrigger>
          <TabsTrigger value="rfis">RFIs</TabsTrigger>
          <TabsTrigger value="submittals">Submittals</TabsTrigger>
          <TabsTrigger value="ms">Method Statements</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-3 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-sm">Document Register</CardTitle>
                  <CardDescription className="text-xs">{filtered.length} documents</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="relative"><Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search docs…" className="pl-8 h-9 w-48" /></div>
                  <Select value={type} onValueChange={setType}><SelectTrigger className="h-9 w-36"><Filter className="h-3.5 w-3.5 mr-1.5" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem>{Object.keys(TYPE_ICON).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
                  <Select value={status} onValueChange={setStatus}><SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="Draft">Draft</SelectItem><SelectItem value="Under Review">Under Review</SelectItem><SelectItem value="Approved">Approved</SelectItem><SelectItem value="Superseded">Superseded</SelectItem></SelectContent></Select>
                  <Button size="sm" className="h-9"><Upload className="h-3.5 w-3.5 mr-1.5" />Upload</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-auto scroll-thin">
                <Table>
                  <TableHeader className="sticky top-0 bg-card"><TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-[90px]">Doc ID</TableHead>
                    <TableHead className="min-w-[260px]">Document Name</TableHead>
                    <TableHead className="w-[120px]">Type</TableHead>
                    <TableHead className="w-[90px]">Project</TableHead>
                    <TableHead className="w-[80px]">Version</TableHead>
                    <TableHead className="w-[110px]">Status</TableHead>
                    <TableHead className="w-[120px]">Uploaded By</TableHead>
                    <TableHead className="w-[100px]">Date</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {filtered.map(d => {
                      const Icon = TYPE_ICON[d.type] ?? FileText
                      return (
                        <TableRow key={d.id} className="hover:bg-muted/40">
                          <TableCell className="font-mono text-[10px] text-muted-foreground">{d.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="grid h-7 w-7 place-items-center rounded bg-primary/10 text-primary shrink-0"><Icon className="h-3.5 w-3.5" /></div>
                              <span className="text-xs font-medium truncate max-w-[260px]">{d.name}</span>
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="secondary" className="text-[10px]">{d.type}</Badge></TableCell>
                          <TableCell className="font-mono text-[10px]">{d.projectCode}</TableCell>
                          <TableCell className="text-[11px] text-muted-foreground">{d.version}</TableCell>
                          <TableCell><Badge variant="outline" className={cn('text-[9px]', statusColor(d.status))}>{d.status}</Badge></TableCell>
                          <TableCell className="text-[11px]">{d.uploadedBy}</TableCell>
                          <TableCell className="text-[10px] text-muted-foreground">{fmtDate(d.date)}</TableCell>
                        </TableRow>
                      )
                    })}
                    {filtered.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-xs text-muted-foreground py-10">No documents match filters</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">RFI Workflow</CardTitle>
                  <CardDescription className="text-xs">{openRFIs.length} open RFIs awaiting response</CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-950/40">{openRFIs.length} Open</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {openRFIs.map(rfi => (
                  <div key={rfi.id} className="rounded-lg border p-3 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="grid h-8 w-8 place-items-center rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 shrink-0"><FileQuestion className="h-4 w-4" /></div>
                        <div className="min-w-0">
                          <div className="text-xs font-medium truncate">{rfi.name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{rfi.id} · {rfi.projectCode}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-amber-700">{rfi.daysOpen}d</div>
                        <div className="text-[9px] text-muted-foreground">open</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {rfi.rfiTimeline?.map((s, i) => {
                        const Icon = s.done ? CheckCircle2 : (i === rfi.rfiTimeline!.findIndex(x => !x.done) ? Eye : Clock)
                        return (
                          <div key={s.label} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center gap-1">
                              <div className={cn('grid h-6 w-6 place-items-center rounded-full border', s.done ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-700' : i === rfi.rfiTimeline!.findIndex(x => !x.done) ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 text-amber-700' : 'bg-muted border-border text-muted-foreground')}>
                                <Icon className="h-3 w-3" />
                              </div>
                              <div className={cn('text-[9px]', s.done ? 'text-emerald-700' : 'text-muted-foreground')}>{s.label}</div>
                            </div>
                            {i < (rfi.rfiTimeline!.length - 1) && <div className={cn('h-0.5 flex-1 mx-1 -mt-3', s.done ? 'bg-emerald-300' : 'bg-muted')} />}
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t">
                      <div className="text-[10px] text-muted-foreground">Submitted by {rfi.uploadedBy} · {fmtDate(rfi.date)}</div>
                      <Button size="sm" variant="outline" className="h-7 text-[10px]"><Send className="h-3 w-3 mr-1" />Respond</Button>
                    </div>
                  </div>
                ))}
                {openRFIs.length === 0 && (
                  <div className="md:col-span-2 flex flex-col items-center justify-center py-8 text-center">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
                    <div className="text-sm font-medium">All RFIs resolved</div>
                    <div className="text-[11px] text-muted-foreground">No open RFIs awaiting response</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Quick Stats</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {Object.keys(TYPE_ICON).map(t => {
              const count = DOCS.filter(d => d.type === t).length
              const Icon = TYPE_ICON[t]
              return (
                <div key={t} className="flex items-center gap-2 rounded-md border p-2.5">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0"><div className="truncate">{t}</div></div>
                  <span className="font-bold tabular-nums">{count}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
