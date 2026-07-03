'use client'

// Maintenance Workflow Engine — the operator console for the complaint→payment
// state machine in @/lib/maintenance-workflow. Pick a case, pick the role you
// are acting as, and the engine exposes exactly the transitions that role may
// perform — with guards (checklist/photos/signature), auto-follow automations,
// live SLA clocks, escalations, notifications, timeline and audit trail.
import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Workflow, Bell, ScrollText, Clock, AlertTriangle, CheckCircle2, Camera,
  PenLine, Sparkles, MapPin, QrCode, ReceiptText, Gauge, ListChecks, User,
  Hammer, ChevronRight, Zap, History,
} from 'lucide-react'
import { type View } from '@/lib/eppm'
import {
  type WfCase, type WfRole, seedCases, availableActions, applyAction, slaState,
  aiInsights, WF_TECHS, STATUS_LABEL, MAIN_PATH, SLA_MATRIX,
} from '@/lib/maintenance-workflow'
import { cn } from '@/lib/utils'
import { FadeIn } from '../motion'

const ROLES: WfRole[] = ['Customer', 'Technician', 'Supervisor', 'Manager', 'Finance']

const fmtT = (ms: number) => new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
const fmtDT = (ms: number) => new Date(ms).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
const mins = (ms: number) => Math.round(ms / 60000)

function statusTone(s: WfCase['status']) {
  if (['CLOSED', 'PAID', 'CUSTOMER_APPROVED', 'WORK_ORDER_CLOSED'].includes(s)) return 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400'
  if (['IN_PROGRESS', 'EN_ROUTE', 'ARRIVED', 'CHECK_IN', 'SCHEDULED', 'ACCEPTED'].includes(s)) return 'border-sky-200 bg-sky-50 text-sky-600 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-400'
  if (['WAITING_PARTS', 'WAITING_APPROVAL', 'ON_HOLD', 'PAYMENT_PENDING', 'INVOICE_DRAFT', 'INVOICE_APPROVED', 'INVOICE_SENT'].includes(s)) return 'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-400'
  if (['CANCELLED', 'REJECTED'].includes(s)) return 'border-border bg-muted text-muted-foreground'
  if (['SUPERVISOR_REVIEW', 'CUSTOMER_REVIEW', 'WORK_COMPLETED'].includes(s)) return 'border-violet-200 bg-violet-50 text-violet-600 dark:border-violet-900 dark:bg-violet-950/50 dark:text-violet-400'
  return 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-400'
}

const prioTone = (p: WfCase['priority']) =>
  p === 'Emergency' ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-400'
  : p === 'High' ? 'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-400'
  : p === 'Medium' ? 'border-sky-200 bg-sky-50 text-sky-600 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-400'
  : 'border-border bg-muted text-muted-foreground'

export default function WorkflowEngineView({}: { onNavigate?: (v: View) => void }) {
  const [cases, setCases] = useState<WfCase[]>(() => seedCases())
  const [selectedId, setSelectedId] = useState<string>(() => cases[0]?.id ?? '')
  const [role, setRole] = useState<WfRole>('Supervisor')
  const [seq, setSeq] = useState(5123)

  const selected = cases.find((c) => c.id === selectedId) ?? cases[0]
  const sla = selected ? slaState(selected) : null
  const ai = selected ? aiInsights(selected, WF_TECHS) : null
  const actions = selected ? availableActions(selected, role) : []

  const actorName: Record<WfRole, string> = {
    Customer: selected?.customer ?? 'Customer',
    Technician: selected?.technician ?? 'Field Technician',
    Supervisor: 'S. Rahman',
    Manager: 'A. Jaya',
    Finance: 'Finance Team',
    System: 'Workflow Engine',
  }

  const run = (actionId: string) => {
    if (!selected) return
    setCases((prev) => prev.map((c) => {
      if (c.id !== selected.id) return c
      let next = applyAction(c, actionId, { name: actorName[role], role }, seq)
      if (actionId === 'assign') next = { ...next, technician: WF_TECHS.find((t) => t.trade === c.trade)?.name ?? WF_TECHS[0].name }
      return next
    }))
    setSeq((n) => n + 1)
  }

  const toggleChecklist = (idx: number) => {
    if (!selected || role !== 'Technician') return
    setCases((prev) => prev.map((c) => (c.id === selected.id
      ? { ...c, checklist: c.checklist.map((i, n) => (n === idx ? { ...i, done: !i.done } : i)) }
      : c)))
  }
  const addPhoto = (kind: 'before' | 'progress' | 'after') => {
    if (!selected) return
    setCases((prev) => prev.map((c) => (c.id === selected.id
      ? { ...c, photos: { ...c.photos, [kind]: c.photos[kind] + 1 } }
      : c)))
  }
  const captureSignature = () => {
    if (!selected) return
    setCases((prev) => prev.map((c) => (c.id === selected.id ? { ...c, signature: true } : c)))
  }

  // Dashboard widgets
  const widgets = useMemo(() => {
    const by = (statuses: WfCase['status'][]) => cases.filter((c) => statuses.includes(c.status)).length
    const breaches = cases.reduce((a, c) => a + slaState(c).breached.length, 0)
    const resolved = cases.filter((c) => c.resolvedAt)
    const avgRes = resolved.length ? mins(resolved.reduce((a, c) => a + ((c.resolvedAt ?? 0) - c.createdAt), 0) / resolved.length) : 0
    return [
      { label: 'New / Submitted', value: by(['NEW', 'SUBMITTED']), icon: Bell, tone: 'text-rose-600' },
      { label: 'Assigned / Accepted', value: by(['ASSIGNED', 'ACCEPTED', 'SCHEDULED']), icon: User, tone: 'text-violet-600' },
      { label: 'Field Active', value: by(['EN_ROUTE', 'ARRIVED', 'CHECK_IN', 'IN_PROGRESS']), icon: Hammer, tone: 'text-sky-600' },
      { label: 'Waiting (Parts/Appr.)', value: by(['WAITING_PARTS', 'WAITING_APPROVAL', 'ON_HOLD']), icon: Clock, tone: 'text-amber-600' },
      { label: 'Review & Invoicing', value: by(['WORK_COMPLETED', 'SUPERVISOR_REVIEW', 'CUSTOMER_REVIEW', 'INVOICE_DRAFT', 'INVOICE_APPROVED', 'INVOICE_SENT', 'PAYMENT_PENDING']), icon: ReceiptText, tone: 'text-teal-600' },
      { label: 'SLA Breaches', value: breaches, icon: AlertTriangle, tone: 'text-rose-600' },
      { label: 'Avg Resolution', value: avgRes ? `${Math.floor(avgRes / 60)}h ${avgRes % 60}m` : '—', icon: Gauge, tone: 'text-emerald-600' },
      { label: 'Closed / Paid', value: by(['PAID', 'CLOSED']), icon: CheckCircle2, tone: 'text-emerald-600' },
    ]
  }, [cases])

  if (!selected) return null
  const stageIdx = MAIN_PATH.indexOf(selected.status)
  const slaCfg = SLA_MATRIX[selected.priority]

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Workflow className="h-6 w-6 text-primary" /> Maintenance Workflow Engine</h1>
            <p className="text-sm text-muted-foreground">Complaint → verification → dispatch → execution → inspection → invoice → payment — no stage can be skipped</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Acting as</span>
            <Select value={role} onValueChange={(v) => setRole(v as WfRole)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </FadeIn>

      {/* Dashboard widgets */}
      <FadeIn delay={0.05}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
          {widgets.map((k) => (
            <Card key={k.label}><CardContent className="p-3.5">
              <k.icon className={cn('mb-2 h-6 w-6 rounded-md bg-muted p-1', k.tone)} />
              <div className="text-lg font-bold leading-none">{k.value}</div>
              <div className="mt-1 text-[10px] leading-tight text-muted-foreground">{k.label}</div>
            </CardContent></Card>
          ))}
        </div>
      </FadeIn>

      <div className="grid gap-4 xl:grid-cols-3">
        {/* Case queue */}
        <Card className="xl:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Complaint Queue</CardTitle>
            <CardDescription>Live SLA clocks per case</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {cases.map((c) => {
              const s = slaState(c)
              const active = c.id === selected.id
              return (
                <button key={c.id} onClick={() => setSelectedId(c.id)}
                  className={cn('w-full rounded-xl border p-3 text-left transition-colors', active ? 'border-primary bg-primary/5' : 'hover:border-primary/40')}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-mono text-[10px] text-muted-foreground">{c.id} · {c.woId ?? 'no WO yet'}</div>
                      <div className="truncate text-sm font-semibold">{c.title}</div>
                      <div className="truncate text-xs text-muted-foreground">{c.customer} · {c.site}</div>
                    </div>
                    <Badge variant="outline" className={prioTone(c.priority)}>{c.priority}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className={statusTone(c.status)}>{STATUS_LABEL[c.status]}</Badge>
                    {s.breached.length > 0 && (
                      <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-400">
                        <AlertTriangle className="mr-1 h-3 w-3" />{s.breached.length} SLA breach
                      </Badge>
                    )}
                    {!s.breached.length && !c.resolvedAt && !['CLOSED', 'CANCELLED', 'REJECTED', 'PAID'].includes(c.status) && (
                      <span className="text-[10px] text-muted-foreground">resolve in {Math.max(0, mins(s.resolutionDue - Date.now()))}m</span>
                    )}
                  </div>
                </button>
              )
            })}
          </CardContent>
        </Card>

        {/* Case detail */}
        <div className="space-y-4 xl:col-span-2">
          {/* Escalation banner */}
          {sla && sla.breached.length > 0 && (
            <Card className="border-rose-300 bg-rose-50/60 dark:border-rose-900 dark:bg-rose-950/30">
              <CardContent className="flex items-start gap-3 p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                <div>
                  <div className="text-sm font-semibold text-rose-700 dark:text-rose-400">Escalation engine triggered</div>
                  {sla.breached.map((b) => <div key={b} className="text-xs text-rose-600/90 dark:text-rose-400/80">{b}</div>)}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                    <span className="font-mono text-sm text-muted-foreground">{selected.id}</span>
                    {selected.title}
                    <Badge variant="outline" className={statusTone(selected.status)}>{STATUS_LABEL[selected.status]}</Badge>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {selected.customer} · {selected.site} · {selected.trade}
                    {selected.technician && <> · <span className="text-foreground">Tech: {selected.technician}</span></>}
                    {selected.woId && <> · <span className="font-mono">{selected.woId}</span> <QrCode className="inline h-3 w-3" /> <span className="font-mono">{selected.woQr}</span></>}
                    {selected.invoiceId && <> · <span className="font-mono">{selected.invoiceId}</span></>}
                  </CardDescription>
                </div>
                <Badge variant="outline" className={prioTone(selected.priority)}>{selected.priority}</Badge>
              </div>

              {/* Stage stepper */}
              <div className="mt-3 flex items-center gap-1 overflow-x-auto pb-1">
                {MAIN_PATH.map((s, i) => {
                  const passed = stageIdx >= 0 ? i < stageIdx : selected.timeline.some((t) => t.label.includes(STATUS_LABEL[s]))
                  const current = i === stageIdx
                  return (
                    <div key={s} className="flex shrink-0 items-center gap-1">
                      <div className={cn('rounded-full px-2 py-0.5 text-[9px] font-semibold whitespace-nowrap',
                        current ? 'bg-primary text-primary-foreground'
                        : passed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                        : 'bg-muted text-muted-foreground')}>
                        {STATUS_LABEL[s]}
                      </div>
                      {i < MAIN_PATH.length - 1 && <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/40" />}
                    </div>
                  )
                })}
              </div>

              {/* SLA strip */}
              {sla && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {[
                    { label: `Response (${slaCfg.response}m)`, met: sla.responseMet, at: selected.respondedAt },
                    { label: slaCfg.arrival ? `Arrival (${slaCfg.arrival}m)` : 'Arrival (n/a)', met: sla.arrivalMet, at: selected.arrivedAt },
                    { label: `Resolution (${Math.round(slaCfg.resolution / 60)}h)`, met: sla.resolutionMet, at: selected.resolvedAt },
                  ].map((x) => (
                    <div key={x.label} className={cn('rounded-lg border px-2.5 py-1.5 text-[11px]',
                      x.met === true ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : x.met === false ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-400'
                      : 'border-border bg-muted/40 text-muted-foreground')}>
                      <div className="font-semibold">{x.label}</div>
                      <div>{x.met === true ? `Met · ${fmtT(x.at!)}` : x.met === false ? 'BREACHED' : 'Running…'}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardHeader>

            <CardContent>
              {/* Role actions */}
              <div className="mb-4 rounded-xl border bg-muted/30 p-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Zap className="h-3.5 w-3.5" /> Available transitions for {role}
                </div>
                {actions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No actions for {role} at stage “{STATUS_LABEL[selected.status]}” — switch role or wait for the workflow to advance.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {actions.map(({ action, blockedReason }) => (
                      <div key={action.id} className="flex flex-col items-start gap-0.5">
                        <Button size="sm" variant={action.danger ? 'ghost' : 'default'} disabled={!!blockedReason} onClick={() => run(action.id)}
                          className={cn(action.danger && 'text-rose-600 hover:text-rose-700')}>
                          {action.label}
                        </Button>
                        {blockedReason && <span className="pl-1 text-[10px] text-rose-500">⛔ {blockedReason}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Tabs defaultValue="execution">
                <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
                  <TabsTrigger value="execution"><ListChecks className="mr-1.5 h-3.5 w-3.5" />Execution</TabsTrigger>
                  <TabsTrigger value="timeline"><History className="mr-1.5 h-3.5 w-3.5" />Timeline</TabsTrigger>
                  <TabsTrigger value="notifications"><Bell className="mr-1.5 h-3.5 w-3.5" />Notifications
                    <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">{selected.notifications.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="audit"><ScrollText className="mr-1.5 h-3.5 w-3.5" />Audit Log</TabsTrigger>
                  <TabsTrigger value="ai"><Sparkles className="mr-1.5 h-3.5 w-3.5" />AI Assist</TabsTrigger>
                </TabsList>

                {/* Execution: checklist, photos, signature, parts */}
                <TabsContent value="execution" className="space-y-4 pt-3">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border p-4">
                      <div className="mb-2 text-sm font-semibold">Mandatory Checklist</div>
                      <div className="space-y-2">
                        {selected.checklist.map((item, i) => (
                          <label key={item.label} className={cn('flex items-center gap-2 text-sm', role !== 'Technician' && 'opacity-70')}>
                            <Checkbox checked={item.done} disabled={role !== 'Technician'} onCheckedChange={() => toggleChecklist(i)} />
                            <span className={cn(item.done && 'text-muted-foreground line-through')}>{item.label}</span>
                          </label>
                        ))}
                      </div>
                      <p className="mt-2 text-[11px] text-muted-foreground">Only the Technician can tick items. Work cannot complete until all are done.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-xl border p-4">
                        <div className="mb-2 text-sm font-semibold">Photo Documentation</div>
                        <div className="grid grid-cols-3 gap-2">
                          {(['before', 'progress', 'after'] as const).map((k) => (
                            <button key={k} onClick={() => role === 'Technician' && addPhoto(k)} disabled={role !== 'Technician'}
                              className={cn('rounded-lg border p-2.5 text-center transition-colors', role === 'Technician' ? 'hover:border-primary/50' : 'opacity-70')}>
                              <Camera className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
                              <div className="text-sm font-bold">{selected.photos[k]}</div>
                              <div className="text-[10px] capitalize text-muted-foreground">{k}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between rounded-xl border p-4">
                        <div>
                          <div className="text-sm font-semibold">Customer Signature</div>
                          <div className="text-[11px] text-muted-foreground">{selected.signature ? 'Captured on device' : 'Required before completion'}</div>
                        </div>
                        {selected.signature
                          ? <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400"><CheckCircle2 className="mr-1 h-3 w-3" />Signed</Badge>
                          : <Button size="sm" variant="outline" disabled={role !== 'Customer' && role !== 'Technician'} onClick={captureSignature}><PenLine className="mr-1 h-3.5 w-3.5" />Capture</Button>}
                      </div>
                      {selected.parts && (
                        <div className="flex items-center justify-between rounded-xl border p-4">
                          <div>
                            <div className="text-sm font-semibold">Material Request</div>
                            <div className="text-[11px] text-muted-foreground">{selected.parts.items}</div>
                          </div>
                          <Badge variant="outline" className={selected.parts.status === 'Issued'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400'
                            : 'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-400'}>{selected.parts.status}</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="timeline" className="pt-3">
                  <div className="space-y-0">
                    {[...selected.timeline].reverse().map((t, i) => (
                      <div key={i} className="relative flex gap-3 pb-4 pl-1">
                        {i < selected.timeline.length - 1 && <div className="absolute left-[9px] top-5 h-full w-px bg-border" />}
                        <div className={cn('mt-1 h-2.5 w-2.5 shrink-0 rounded-full', i === 0 ? 'bg-primary' : 'bg-muted-foreground/30')} />
                        <div className="min-w-0">
                          <div className="text-sm font-medium">{t.label}</div>
                          <div className="text-xs text-muted-foreground">{fmtDT(t.at)} · {t.actor} <Badge variant="secondary" className="ml-1 text-[9px]">{t.role}</Badge></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="notifications" className="pt-3">
                  <div className="space-y-2">
                    {[...selected.notifications].reverse().map((n, i) => (
                      <div key={i} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                        <div className="flex items-start gap-2.5">
                          <Bell className="mt-0.5 h-4 w-4 text-primary" />
                          <div>
                            <div className="text-sm font-medium">{n.event}</div>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {n.recipients.map((r) => <Badge key={r} variant="secondary" className="text-[10px] font-normal">{r}</Badge>)}
                            </div>
                          </div>
                        </div>
                        <span className="shrink-0 text-[11px] text-muted-foreground">{fmtT(n.at)}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="audit" className="pt-3">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead><tr className="border-b text-muted-foreground">
                        <th className="py-2 pr-3 font-medium">Time</th><th className="py-2 pr-3 font-medium">Actor</th>
                        <th className="py-2 pr-3 font-medium">Action</th><th className="py-2 pr-3 font-medium">Transition</th>
                        <th className="py-2 pr-3 font-medium">IP</th><th className="py-2 pr-3 font-medium">GPS</th><th className="py-2 font-medium">Device</th>
                      </tr></thead>
                      <tbody>
                        {[...selected.audit].reverse().map((a, i) => (
                          <tr key={i} className="border-b border-border/50">
                            <td className="whitespace-nowrap py-2 pr-3">{fmtDT(a.at)}</td>
                            <td className="py-2 pr-3">{a.actor} <span className="text-muted-foreground">({a.role})</span></td>
                            <td className="py-2 pr-3 font-medium">{a.action}</td>
                            <td className="whitespace-nowrap py-2 pr-3 font-mono text-[10px]">{a.from} → {a.to}</td>
                            <td className="py-2 pr-3 font-mono text-[10px]">{a.ip}</td>
                            <td className="py-2 pr-3 font-mono text-[10px]">{a.gps}</td>
                            <td className="py-2 text-[10px]">{a.device}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="ai" className="pt-3">
                  {ai && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        { label: 'Suggested Priority', value: ai.suggestedPriority, icon: AlertTriangle },
                        { label: 'Recommended Technician', value: ai.recommendedTechnician, icon: User },
                        { label: 'Estimated Completion', value: `${ai.estimatedHours} hours on site`, icon: Clock },
                        { label: 'Predicted Materials', value: ai.predictedMaterials, icon: Hammer },
                        { label: 'SLA Risk', value: ai.slaRisk, icon: Gauge },
                      ].map((x) => (
                        <div key={x.label} className="rounded-xl border p-3.5">
                          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            <x.icon className="h-3.5 w-3.5" />{x.label}
                          </div>
                          <div className="text-sm font-medium">{x.value}</div>
                        </div>
                      ))}
                      <div className="rounded-xl border p-3.5 sm:col-span-2">
                        <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          <Sparkles className="h-3.5 w-3.5" />Generated Service Note
                        </div>
                        <p className="text-sm text-muted-foreground">{ai.serviceNote}</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* GPS strip for field stages */}
          {['EN_ROUTE', 'ARRIVED', 'CHECK_IN', 'IN_PROGRESS'].includes(selected.status) && (
            <Card>
              <CardContent className="flex flex-wrap items-center gap-4 p-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" />GPS: 4.9403°N, 114.9481°E (validated within 150 m of site)</span>
                <span>·</span><span>Device: Android · Field App</span>
                <span>·</span><span>IP: 10.0.4.18</span>
                <span>·</span><span>Times & coordinates written to the audit log on every field action</span>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
