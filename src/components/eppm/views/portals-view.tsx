'use client'

// Portals — what clients see (Customer Portal) and what field technicians see
// (Technician Portal): live project/job views scoped to their role.
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Contact, HardHat, FileText, ReceiptText, MessageSquareWarning, MapPin,
  CheckCircle2, PlayCircle, Camera, QrCode, Building2, CalendarClock,
} from 'lucide-react'
import { type View } from '@/lib/eppm'
import { cn } from '@/lib/utils'
import { FadeIn } from '../motion'

const CLIENT_PROJECTS = [
  { name: 'HQ Tower AMC', ref: 'AMC-2026-04', progress: 54, status: 'On Track', nextVisit: '08 Jul 2026', openRequests: 2 },
  { name: 'Lobby Renovation — Phase 2', ref: 'PRJ-BB-102', progress: 78, status: 'On Track', nextVisit: '05 Jul 2026', openRequests: 0 },
  { name: 'Chiller Plant Upgrade', ref: 'PRJ-BB-108', progress: 31, status: 'Attention', nextVisit: '10 Jul 2026', openRequests: 1 },
]
const CLIENT_DOCS = [
  { name: 'Monthly Progress Report — June 2026', type: 'PDF', date: '01 Jul 2026' },
  { name: 'AMC Service Visit Record #26', type: 'PDF', date: '28 Jun 2026' },
  { name: 'Invoice INV-AR-0340 — Q2 AMC', type: 'PDF', date: '28 Jun 2026' },
]

type JobStatus = 'Assigned' | 'Accepted' | 'On Site' | 'Done'
interface TechJob {
  id: string; title: string; site: string; window: string; priority: 'High' | 'Medium' | 'Low'; status: JobStatus; qr?: string
}
const SEED_JOBS: TechJob[] = [
  { id: 'WO-5121', title: 'Lift 2 door sensor replacement', site: 'Baiduri HQ Tower — L1', window: '08:00 – 12:00', priority: 'High', status: 'On Site', qr: 'QR-LIFT-BB-02' },
  { id: 'WO-5120', title: 'Chiller 2 quarterly service', site: 'Gov Complex — Plant Room', window: '13:30 – 17:00', priority: 'Medium', status: 'Accepted', qr: 'QR-CH-GC-02' },
  { id: 'WO-5119', title: 'Fire pump monthly test run', site: 'Times Square Mall — B1', window: 'Tomorrow 09:00', priority: 'High', status: 'Assigned', qr: 'QR-FP-TS-01' },
]

export type PortalsFocus = 'customer-portal' | 'technician-portal'
const FOCUS_TAB: Record<PortalsFocus, string> = { 'customer-portal': 'customer', 'technician-portal': 'technician' }

export default function PortalsView({ focus = 'customer-portal' }: { onNavigate?: (v: View) => void; focus?: PortalsFocus }) {
  const [tab, setTab] = useState(FOCUS_TAB[focus])
  const [jobs, setJobs] = useState(SEED_JOBS)

  useEffect(() => { setTab(FOCUS_TAB[focus]) }, [focus])

  const advanceJob = (id: string) =>
    setJobs((prev) => prev.map((j) => {
      if (j.id !== id) return j
      const next: Record<JobStatus, JobStatus> = { Assigned: 'Accepted', Accepted: 'On Site', 'On Site': 'Done', Done: 'Done' }
      return { ...j, status: next[j.status] }
    }))

  const jobAction: Record<JobStatus, { label: string; icon: typeof PlayCircle } | null> = {
    Assigned: { label: 'Accept Job', icon: CheckCircle2 },
    Accepted: { label: 'Arrive On Site', icon: MapPin },
    'On Site': { label: 'Complete Job', icon: CheckCircle2 },
    Done: null,
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Contact className="h-6 w-6 text-primary" /> Portals</h1>
          <p className="text-sm text-muted-foreground">Role-scoped experiences for clients and field technicians</p>
        </div>
      </FadeIn>

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="customer"><Contact className="mr-1.5 h-3.5 w-3.5" />Customer Portal</TabsTrigger>
          <TabsTrigger value="technician"><HardHat className="mr-1.5 h-3.5 w-3.5" />Technician Portal</TabsTrigger>
        </TabsList>

        {/* Customer Portal — as seen by a client (Baiduri Bank) */}
        <TabsContent value="customer" className="space-y-4">
          <Card className="border-primary/20 bg-primary/[0.03]">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-9 w-9 rounded-lg bg-primary/10 p-1.5 text-primary" />
                <div>
                  <div className="text-sm font-semibold">Baiduri Bank — Client Workspace</div>
                  <div className="text-xs text-muted-foreground">This is exactly what the client sees when they sign in via the Client Portal</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline"><MessageSquareWarning className="mr-1 h-3.5 w-3.5" />Raise Request</Button>
                <Button size="sm" variant="outline"><ReceiptText className="mr-1 h-3.5 w-3.5" />Invoices</Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-3">
            {CLIENT_PROJECTS.map((p) => (
              <Card key={p.ref}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{p.name}</CardTitle>
                  <CardDescription className="font-mono text-xs">{p.ref}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>Progress</span><span>{p.progress}%</span></div>
                    <Progress value={p.progress} className="h-2" />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <Badge variant="outline" className={p.status === 'On Track'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400'
                      : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-400'}>{p.status}</Badge>
                    <span className="flex items-center gap-1 text-muted-foreground"><CalendarClock className="h-3 w-3" />Next visit {p.nextVisit}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{p.openRequests} open service request{p.openRequests === 1 ? '' : 's'}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Shared Documents</CardTitle><CardDescription>Reports, visit records and invoices published to the client</CardDescription></CardHeader>
            <CardContent className="space-y-2">
              {CLIENT_DOCS.map((d) => (
                <div key={d.name} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 text-primary" />
                    <div><div className="text-sm font-medium">{d.name}</div><div className="text-xs text-muted-foreground">{d.type} · {d.date}</div></div>
                  </div>
                  <Button size="sm" variant="ghost">View</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Technician Portal — mobile-first field view */}
        <TabsContent value="technician" className="space-y-4">
          <Card className="border-primary/20 bg-primary/[0.03]">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <HardHat className="h-9 w-9 rounded-lg bg-primary/10 p-1.5 text-primary" />
                <div>
                  <div className="text-sm font-semibold">Daniel Wong — My Jobs Today</div>
                  <div className="text-xs text-muted-foreground">Field view: technicians accept, arrive, document and complete their dispatched work orders</div>
                </div>
              </div>
              <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-400">
                {jobs.filter((j) => j.status !== 'Done').length} active
              </Badge>
            </CardContent>
          </Card>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((j) => {
              const action = jobAction[j.status]
              return (
                <Card key={j.id} className={cn(j.status === 'Done' && 'opacity-60')}>
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-mono text-xs text-muted-foreground">{j.id}</div>
                        <div className="text-sm font-semibold leading-snug">{j.title}</div>
                      </div>
                      <Badge variant="outline" className={
                        j.priority === 'High' ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-400'
                        : j.priority === 'Medium' ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-400'
                        : 'border-border bg-muted text-muted-foreground'
                      }>{j.priority}</Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{j.site}</div>
                      <div className="flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5" />{j.window}</div>
                      {j.qr && <div className="flex items-center gap-1.5 font-mono"><QrCode className="h-3.5 w-3.5" />{j.qr}</div>}
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <Badge variant="outline" className={
                        j.status === 'Done' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400'
                        : j.status === 'On Site' ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-400'
                        : j.status === 'Accepted' ? 'border-violet-200 bg-violet-50 text-violet-600 dark:border-violet-900 dark:bg-violet-950/50 dark:text-violet-400'
                        : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-400'
                      }>{j.status}</Badge>
                      <div className="flex gap-1.5">
                        {j.status === 'On Site' && <Button size="sm" variant="ghost" title="Attach site photo"><Camera className="h-3.5 w-3.5" /></Button>}
                        {action && <Button size="sm" onClick={() => advanceJob(j.id)}><action.icon className="mr-1 h-3.5 w-3.5" />{action.label}</Button>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
