// ─────────────────────────────────────────────────────────────────────────────
// HJSB EPPM — Maintenance Workflow Engine
//
// A typed state machine for the complaint→payment lifecycle. Every transition
// is an Action: role-gated, guard-checked, and side-effecting. Applying an
// action returns a NEW case with appended timeline, audit, and notification
// events, plus any auto-follow (system) transitions chained on — so a single
// click can run "accept → WO generated → QR issued → auto-scheduled" exactly
// like Maximo/ServiceNow flow rules.
// ─────────────────────────────────────────────────────────────────────────────

export type WfStatus =
  | 'NEW' | 'SUBMITTED' | 'VERIFIED' | 'APPROVED' | 'ASSIGNED' | 'ACCEPTED'
  | 'SCHEDULED' | 'EN_ROUTE' | 'ARRIVED' | 'CHECK_IN' | 'WORK_STARTED'
  | 'IN_PROGRESS' | 'WAITING_PARTS' | 'WAITING_APPROVAL' | 'ON_HOLD' | 'RESUMED'
  | 'WORK_COMPLETED' | 'SUPERVISOR_REVIEW' | 'CUSTOMER_REVIEW' | 'CUSTOMER_APPROVED'
  | 'WORK_ORDER_CLOSED' | 'INVOICE_DRAFT' | 'INVOICE_APPROVED' | 'INVOICE_SENT'
  | 'PAYMENT_PENDING' | 'PAID' | 'CLOSED' | 'CANCELLED' | 'REJECTED'

export type WfRole = 'Customer' | 'Technician' | 'Supervisor' | 'Manager' | 'Finance' | 'System'
export type WfPriority = 'Emergency' | 'High' | 'Medium' | 'Low'

/** SLA matrix (minutes) per the HJSB service commitments. */
export const SLA_MATRIX: Record<WfPriority, { response: number; arrival?: number; resolution: number }> = {
  Emergency: { response: 30, arrival: 60, resolution: 240 },
  High: { response: 60, arrival: 120, resolution: 480 },
  Medium: { response: 240, resolution: 1440 },
  Low: { response: 480, resolution: 4320 },
}

export interface TimelineEvent { at: number; label: string; actor: string; role: WfRole }
export interface AuditEntry {
  at: number; actor: string; role: WfRole; action: string
  from: WfStatus; to: WfStatus; ip: string; gps: string; device: string
}
export interface WfNotification { at: number; event: string; recipients: string[]; read: boolean }
export interface ChecklistItem { label: string; done: boolean }

export interface WfCase {
  id: string
  title: string
  desc: string
  customer: string
  site: string
  trade: string
  priority: WfPriority
  status: WfStatus
  /** Breach messages already escalated — prevents duplicate escalation events. */
  escalated?: string[]
  createdAt: number
  respondedAt?: number   // first supervisor action — response SLA
  arrivedAt?: number     // technician check-in — arrival SLA
  resolvedAt?: number    // work completed — resolution SLA
  technician?: string
  woId?: string
  woQr?: string
  invoiceId?: string
  amountBnd: number
  checklist: ChecklistItem[]
  photos: { before: number; progress: number; after: number }
  signature: boolean
  parts?: { items: string; status: 'Requested' | 'Approved' | 'Issued' }
  timeline: TimelineEvent[]
  audit: AuditEntry[]
  notifications: WfNotification[]
}

export interface WfAction {
  id: string
  label: string
  from: WfStatus[]
  to: WfStatus
  roles: WfRole[]
  /** Recipient groups notified on this transition (per the notification matrix). */
  notify: string[]
  /** Returns a human reason the action is blocked, or null if allowed. */
  guard?: (c: WfCase) => string | null
  /** Mutates the draft copy (set timestamps, generate WO/invoice, ...). */
  effect?: (c: WfCase, seq: number) => void
  /** System actions applied immediately after, in order. */
  autoFollow?: string[]
  danger?: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// The transition map
// ─────────────────────────────────────────────────────────────────────────────
export const ACTIONS: WfAction[] = [
  { id: 'submit', label: 'Submit Complaint', from: ['NEW'], to: 'SUBMITTED', roles: ['Customer'], notify: ['Super Admin', 'Maintenance Admin', 'Maintenance Manager', 'Supervisor'] },
  { id: 'verify', label: 'Verify Complaint', from: ['SUBMITTED'], to: 'VERIFIED', roles: ['Supervisor'], notify: ['Maintenance Manager'], effect: (c) => { c.respondedAt = c.respondedAt ?? Date.now() } },
  { id: 'approve', label: 'Approve Complaint', from: ['VERIFIED'], to: 'APPROVED', roles: ['Supervisor', 'Manager'], notify: ['Assigned Supervisor'] },
  { id: 'reject', label: 'Reject Complaint', from: ['SUBMITTED', 'VERIFIED'], to: 'REJECTED', roles: ['Supervisor', 'Manager'], notify: ['Customer'], danger: true },
  { id: 'assign', label: 'Assign Technician', from: ['APPROVED'], to: 'ASSIGNED', roles: ['Supervisor'], notify: ['Technician', 'Supervisor', 'Customer'] },
  { id: 'reassign', label: 'Reassign Technician', from: ['ASSIGNED'], to: 'ASSIGNED', roles: ['Supervisor'], notify: ['Technician', 'Customer'] },
  {
    id: 'accept', label: 'Accept Job', from: ['ASSIGNED'], to: 'ACCEPTED', roles: ['Technician'],
    notify: ['Customer', 'Supervisor', 'Manager'],
    effect: (c, seq) => { c.woId = `WO-${seq}`; c.woQr = `QR-${c.id}` },
    autoFollow: ['auto-schedule'],
  },
  { id: 'decline', label: 'Reject Job', from: ['ASSIGNED'], to: 'APPROVED', roles: ['Technician'], notify: ['Supervisor', 'Dispatch'], danger: true },
  { id: 'auto-schedule', label: 'Job Auto-Scheduled', from: ['ACCEPTED'], to: 'SCHEDULED', roles: ['System'], notify: ['Technician', 'Customer'] },
  { id: 'en-route', label: 'Start Travel (Navigate)', from: ['SCHEDULED'], to: 'EN_ROUTE', roles: ['Technician'], notify: ['Customer', 'Dispatch'] },
  { id: 'arrive', label: 'Arrive at Site', from: ['EN_ROUTE'], to: 'ARRIVED', roles: ['Technician'], notify: ['Dispatch'] },
  {
    id: 'check-in', label: 'Check In (GPS validated)', from: ['ARRIVED'], to: 'CHECK_IN', roles: ['Technician'],
    notify: ['Supervisor'], effect: (c) => { c.arrivedAt = c.arrivedAt ?? Date.now() },
  },
  { id: 'start-work', label: 'Start Work', from: ['CHECK_IN'], to: 'IN_PROGRESS', roles: ['Technician'], notify: ['Customer', 'Supervisor', 'Dispatch'] },
  { id: 'request-parts', label: 'Request Parts', from: ['IN_PROGRESS'], to: 'WAITING_PARTS', roles: ['Technician'], notify: ['Inventory', 'Procurement', 'Supervisor'], effect: (c) => { c.parts = { items: 'Replacement parts per fault diagnosis', status: 'Requested' } } },
  { id: 'issue-parts', label: 'Approve & Issue Parts', from: ['WAITING_PARTS'], to: 'IN_PROGRESS', roles: ['Supervisor'], notify: ['Technician', 'Inventory'], effect: (c) => { if (c.parts) c.parts.status = 'Issued' } },
  { id: 'request-extra', label: 'Request Additional Work', from: ['IN_PROGRESS'], to: 'WAITING_APPROVAL', roles: ['Technician'], notify: ['Customer', 'Supervisor', 'Manager'] },
  { id: 'approve-extra', label: 'Approve Additional Work', from: ['WAITING_APPROVAL'], to: 'IN_PROGRESS', roles: ['Customer', 'Manager'], notify: ['Technician', 'Supervisor'] },
  { id: 'hold', label: 'Pause Work', from: ['IN_PROGRESS'], to: 'ON_HOLD', roles: ['Technician', 'Supervisor'], notify: ['Supervisor'] },
  { id: 'resume', label: 'Resume Work', from: ['ON_HOLD'], to: 'IN_PROGRESS', roles: ['Technician', 'Supervisor'], notify: ['Supervisor'] },
  {
    id: 'complete', label: 'Complete Work', from: ['IN_PROGRESS'], to: 'WORK_COMPLETED', roles: ['Technician'],
    notify: ['Supervisor', 'Customer', 'Finance'],
    guard: (c) => {
      if (c.checklist.some((i) => !i.done)) return 'Mandatory checklist incomplete'
      if (c.photos.before === 0 || c.photos.after === 0) return 'Before & after photos required'
      if (!c.signature) return 'Customer signature not captured'
      return null
    },
    effect: (c) => { c.resolvedAt = c.resolvedAt ?? Date.now() },
    autoFollow: ['auto-inspection'],
  },
  { id: 'auto-inspection', label: 'Sent for Supervisor Inspection', from: ['WORK_COMPLETED'], to: 'SUPERVISOR_REVIEW', roles: ['System'], notify: ['Supervisor'] },
  { id: 'pass-inspection', label: 'Pass Inspection', from: ['SUPERVISOR_REVIEW'], to: 'CUSTOMER_REVIEW', roles: ['Supervisor'], notify: ['Customer'] },
  { id: 'fail-inspection', label: 'Fail Inspection (Rework)', from: ['SUPERVISOR_REVIEW'], to: 'IN_PROGRESS', roles: ['Supervisor'], notify: ['Technician'], danger: true },
  { id: 'customer-reject', label: 'Reject & Reopen Work', from: ['CUSTOMER_REVIEW'], to: 'IN_PROGRESS', roles: ['Customer'], notify: ['Supervisor', 'Technician'], danger: true },
  {
    id: 'customer-approve', label: 'Customer Approve & Sign-off', from: ['CUSTOMER_REVIEW'], to: 'CUSTOMER_APPROVED', roles: ['Customer'],
    notify: ['Finance', 'Supervisor'], autoFollow: ['auto-close-wo', 'auto-draft-invoice'],
  },
  { id: 'auto-close-wo', label: 'Work Order Closed', from: ['CUSTOMER_APPROVED'], to: 'WORK_ORDER_CLOSED', roles: ['System'], notify: ['Supervisor'] },
  {
    id: 'auto-draft-invoice', label: 'Draft Invoice Auto-Generated', from: ['WORK_ORDER_CLOSED'], to: 'INVOICE_DRAFT', roles: ['System'],
    notify: ['Finance'], effect: (c, seq) => { c.invoiceId = `INV-AR-0${seq}` },
  },
  { id: 'approve-invoice', label: 'Approve Invoice', from: ['INVOICE_DRAFT'], to: 'INVOICE_APPROVED', roles: ['Finance'], notify: ['Customer', 'Finance'] },
  { id: 'send-invoice', label: 'Send Invoice', from: ['INVOICE_APPROVED'], to: 'INVOICE_SENT', roles: ['Finance'], notify: ['Customer'], autoFollow: ['auto-payment-pending'] },
  { id: 'auto-payment-pending', label: 'Awaiting Payment', from: ['INVOICE_SENT'], to: 'PAYMENT_PENDING', roles: ['System'], notify: [] },
  {
    id: 'record-payment', label: 'Record Payment', from: ['PAYMENT_PENDING'], to: 'PAID', roles: ['Finance'],
    notify: ['Finance', 'Manager', 'Customer'], autoFollow: ['auto-close'],
  },
  { id: 'auto-close', label: 'Complaint Auto-Closed', from: ['PAID'], to: 'CLOSED', roles: ['System'], notify: ['Customer', 'Manager'] },
  { id: 'cancel', label: 'Cancel Complaint', from: ['NEW', 'SUBMITTED', 'VERIFIED', 'APPROVED', 'ASSIGNED'], to: 'CANCELLED', roles: ['Customer', 'Manager'], notify: ['Supervisor'], danger: true },
]

const actionById = new Map(ACTIONS.map((a) => [a.id, a]))

/** Ordered main path — used for the stage stepper. */
export const MAIN_PATH: WfStatus[] = [
  'SUBMITTED', 'VERIFIED', 'APPROVED', 'ASSIGNED', 'ACCEPTED', 'SCHEDULED',
  'EN_ROUTE', 'ARRIVED', 'CHECK_IN', 'IN_PROGRESS', 'WORK_COMPLETED',
  'SUPERVISOR_REVIEW', 'CUSTOMER_REVIEW', 'CUSTOMER_APPROVED', 'WORK_ORDER_CLOSED',
  'INVOICE_DRAFT', 'INVOICE_APPROVED', 'INVOICE_SENT', 'PAYMENT_PENDING', 'PAID', 'CLOSED',
]

export function availableActions(c: WfCase, role: WfRole): { action: WfAction; blockedReason: string | null }[] {
  return ACTIONS
    .filter((a) => a.roles.includes(role) && a.from.includes(c.status) && a.roles[0] !== 'System')
    .filter((a) => !(a.id === 'reassign')) // keep the demo surface tight; assign covers it
    .map((a) => ({ action: a, blockedReason: a.guard ? a.guard(c) : null }))
}

/** Apply an action (plus its auto-follow chain). Returns a new WfCase. */
export function applyAction(c: WfCase, actionId: string, actor: { name: string; role: WfRole }, seq: number): WfCase {
  const action = actionById.get(actionId)
  if (!action || !action.from.includes(c.status)) return c
  if (action.guard) {
    const blocked = action.guard(c)
    if (blocked) return c
  }

  const now = Date.now()
  const draft: WfCase = {
    ...c,
    checklist: c.checklist.map((i) => ({ ...i })),
    photos: { ...c.photos },
    parts: c.parts ? { ...c.parts } : undefined,
    timeline: [...c.timeline],
    audit: [...c.audit],
    notifications: [...c.notifications],
  }

  const from = draft.status
  draft.status = action.to
  action.effect?.(draft, seq)

  draft.timeline.push({ at: now, label: action.label, actor: actor.name, role: actor.role })
  draft.audit.push({
    at: now, actor: actor.name, role: actor.role, action: action.label,
    from, to: action.to,
    ip: actor.role === 'System' ? '127.0.0.1' : '10.0.4.18',
    gps: ['check-in', 'arrive', 'en-route'].includes(actionId) ? '4.9403°N, 114.9481°E' : '—',
    device: actor.role === 'Technician' ? 'Android · Field App' : actor.role === 'System' ? 'Workflow Engine' : 'Chrome · Windows 11',
  })
  if (action.notify.length > 0) {
    draft.notifications.push({ at: now, event: action.label, recipients: action.notify, read: false })
  }

  // Chain system automations
  let result = draft
  for (const followId of action.autoFollow ?? []) {
    result = applyAction(result, followId, { name: 'Workflow Engine', role: 'System' }, seq)
  }
  return result
}

// ─────────────────────────────────────────────────────────────────────────────
// SLA & escalation
// ─────────────────────────────────────────────────────────────────────────────
export interface SlaState {
  responseDue: number; resolutionDue: number; arrivalDue?: number
  responseMet: boolean | null; arrivalMet: boolean | null; resolutionMet: boolean | null
  breached: string[]   // active breaches needing escalation
}

const DONE: WfStatus[] = ['CLOSED', 'CANCELLED', 'REJECTED', 'PAID']

export function slaState(c: WfCase): SlaState {
  const m = SLA_MATRIX[c.priority]
  const responseDue = c.createdAt + m.response * 60000
  const arrivalDue = m.arrival ? c.createdAt + m.arrival * 60000 : undefined
  const resolutionDue = c.createdAt + m.resolution * 60000
  const now = Date.now()
  const active = !DONE.includes(c.status)

  const responseMet = c.respondedAt ? c.respondedAt <= responseDue : (active && now > responseDue ? false : null)
  const arrivalMet = arrivalDue === undefined ? null : c.arrivedAt ? c.arrivedAt <= arrivalDue : (active && now > arrivalDue ? false : null)
  const resolutionMet = c.resolvedAt ? c.resolvedAt <= resolutionDue : (active && now > resolutionDue ? false : null)

  const breached: string[] = []
  if (responseMet === false && !c.respondedAt) breached.push(`Response SLA breached (${m.response} min) — escalate to Supervisor`)
  if (arrivalMet === false && !c.arrivedAt) breached.push(`Arrival SLA breached (${m.arrival} min) — escalate to Manager`)
  if (resolutionMet === false && !c.resolvedAt) breached.push(`Resolution SLA breached (${Math.round(m.resolution / 60)} h) — escalate to Admin`)
  return { responseDue, arrivalDue, resolutionDue, responseMet, arrivalMet, resolutionMet, breached }
}

/**
 * Escalation engine tick. If a breach exists that has not been escalated yet,
 * returns a NEW case with escalation timeline/audit/notification events
 * appended (status unchanged). Returns null when nothing new to escalate.
 */
export function escalateIfNeeded(c: WfCase): WfCase | null {
  const fresh = slaState(c).breached.filter((b) => !(c.escalated ?? []).includes(b))
  if (fresh.length === 0) return null
  const now = Date.now()
  const next: WfCase = {
    ...c,
    escalated: [...(c.escalated ?? []), ...fresh],
    timeline: [...c.timeline],
    audit: [...c.audit],
    notifications: [...c.notifications],
  }
  for (const b of fresh) {
    next.timeline.push({ at: now, label: `Escalation: ${b}`, actor: 'SLA Engine', role: 'System' })
    next.audit.push({
      at: now, actor: 'SLA Engine', role: 'System', action: `Auto-escalation — ${b}`,
      from: c.status, to: c.status, ip: '127.0.0.1', gps: '—', device: 'Workflow Engine',
    })
    next.notifications.push({ at: now, event: `Escalation: ${b}`, recipients: ['Supervisor', 'Maintenance Manager'], read: false })
  }
  return next
}

// ─────────────────────────────────────────────────────────────────────────────
// AI assistance (deterministic heuristics over live case data)
// ─────────────────────────────────────────────────────────────────────────────
export interface TechInfo { name: string; trade: string; load: number; rating: number }

export function aiInsights(c: WfCase, techs: TechInfo[]) {
  const text = `${c.title} ${c.desc}`.toLowerCase()
  const suggestedPriority: WfPriority =
    /leak|fire|smoke|electric shock|sparks|flood|no power/.test(text) ? 'Emergency'
    : /not cooling|lift|stuck|urgent|exam|outage/.test(text) ? 'High'
    : /flicker|noise|slow|intermittent/.test(text) ? 'Medium' : 'Low'

  const candidates = techs.filter((t) => t.trade === c.trade).sort((a, b) => a.load - b.load || b.rating - a.rating)
  const recommended = candidates[0] ?? techs.sort((a, b) => a.load - b.load)[0]

  const baseHours = c.priority === 'Emergency' ? 2 : c.priority === 'High' ? 4 : 6
  const materials =
    c.trade === 'HVAC' ? 'Refrigerant, filter set, contactor'
    : c.trade === 'Electrical' ? 'Ballast/driver, MCB, cable ties'
    : c.trade === 'Plumbing' ? 'Pipe section, couplings, sealant'
    : c.trade === 'Lifts' ? 'Door sensor, rollers' : 'General consumables'

  const sla = slaState(c)
  const riskMins = Math.round((sla.resolutionDue - Date.now()) / 60000)
  const slaRisk = sla.breached.length > 0 ? 'BREACHED — escalation active'
    : riskMins < 120 ? `At risk — ${riskMins} min to resolution SLA` : 'On track'

  return {
    suggestedPriority,
    recommendedTechnician: recommended ? `${recommended.name} (${recommended.trade}, ${recommended.load} active, ★${recommended.rating})` : '—',
    estimatedHours: baseHours,
    predictedMaterials: materials,
    slaRisk,
    serviceNote: `${c.trade} fault at ${c.site}: ${c.title}. Diagnosis and rectification per checklist; parts as required (${materials.toLowerCase()}). Est. ${baseHours}h on site.`,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Seed cases (times relative to now so SLA clocks are live)
// ─────────────────────────────────────────────────────────────────────────────
const min = 60000
function seedEvents(c: WfCase, steps: { minsAgo: number; actionId: string; actor: string; role: WfRole }[]): WfCase {
  let out = c
  for (const s of steps) {
    const realNow = Date.now
    // Temporarily shift "now" for historic events
    ;(Date as unknown as { now: () => number }).now = () => realNow.call(Date) - s.minsAgo * min
    const seq = 5100 + (Number(c.id.slice(-2)) || 0) // stable per-case doc numbers
    out = applyAction(out, s.actionId, { name: s.actor, role: s.role }, seq)
    ;(Date as unknown as { now: () => number }).now = realNow
  }
  return out
}

function blankCase(partial: Omit<WfCase, 'status' | 'checklist' | 'photos' | 'signature' | 'timeline' | 'audit' | 'notifications'>): WfCase {
  return {
    ...partial,
    status: 'NEW',
    checklist: [
      { label: 'Isolate & make safe', done: false },
      { label: 'Diagnose root cause', done: false },
      { label: 'Repair / replace faulty component', done: false },
      { label: 'Test & verify operation', done: false },
      { label: 'Housekeeping & handback', done: false },
    ],
    photos: { before: 0, progress: 0, after: 0 },
    signature: false,
    timeline: [{ at: partial.createdAt, label: 'Complaint Created', actor: partial.customer, role: 'Customer' }],
    audit: [{ at: partial.createdAt, actor: partial.customer, role: 'Customer', action: 'Complaint Created', from: 'NEW', to: 'NEW', ip: '203.82.90.14', gps: '—', device: 'Customer Portal · Web' }],
    notifications: [{ at: partial.createdAt, event: 'Complaint Created', recipients: ['Super Admin', 'Maintenance Admin', 'Maintenance Manager', 'Supervisor'], read: true }],
  }
}

export interface NewComplaintInput {
  title: string
  desc: string
  customer: string
  site: string
  trade: string
  priority: WfPriority
  photos?: number
}

/**
 * Customer intake → live case. Creates the case, runs the SUBMIT transition as
 * the customer, then records the system-validation pass — the complaint lands
 * in SUBMITTED with admin notifications fired, exactly like the portal flow.
 */
export function createComplaintCase(input: NewComplaintInput, seq: number): WfCase {
  const now = Date.now()
  const id = `CMP-${seq}`
  let c = blankCase({
    id, title: input.title, desc: input.desc, customer: input.customer,
    site: input.site, trade: input.trade, priority: input.priority,
    createdAt: now, amountBnd: 0,
  })
  if (input.photos && input.photos > 0) c = { ...c, photos: { before: input.photos, progress: 0, after: 0 } }
  c = applyAction(c, 'submit', { name: input.customer, role: 'Customer' }, seq)
  // System validation gate (duplicate/asset/site checks) — recorded on the trail
  c = {
    ...c,
    timeline: [...c.timeline, { at: now, label: 'System Validation Passed', actor: 'Workflow Engine', role: 'System' }],
    audit: [...c.audit, { at: now, actor: 'Workflow Engine', role: 'System', action: 'System Validation Passed', from: 'SUBMITTED', to: 'SUBMITTED', ip: '127.0.0.1', gps: '—', device: 'Workflow Engine' }],
    notifications: [...c.notifications, { at: now, event: 'Complaint validated — awaiting supervisor review', recipients: ['Maintenance Admin', 'Supervisor'], read: false }],
  }
  return c
}

export function seedCases(): WfCase[] {
  const now = Date.now()

  // Case 1 — fresh emergency, just submitted (drive it through the full flow)
  let c1 = blankCase({
    id: 'CMP-1042', title: 'Water leak above server room', desc: 'Active leak from ceiling void directly above the server room racks. Immediate attendance required.',
    customer: 'Baiduri Bank', site: 'HQ Tower — Level 3', trade: 'Plumbing', priority: 'Emergency',
    createdAt: now - 12 * min, amountBnd: 1850,
  })
  c1 = seedEvents(c1, [{ minsAgo: 11, actionId: 'submit', actor: 'Baiduri Bank', role: 'Customer' }])

  // Case 2 — mid-flow: technician on site, working
  let c2 = blankCase({
    id: 'CMP-1041', title: 'Classroom AC blowing warm air', desc: 'Level 2 classrooms 2.3–2.6 report AC not cooling since morning. Exam week — urgent.',
    customer: 'Ministry of Education', site: 'Rimba School Block B', trade: 'HVAC', priority: 'High',
    createdAt: now - 150 * min, amountBnd: 940,
  })
  c2 = seedEvents(c2, [
    { minsAgo: 148, actionId: 'submit', actor: 'Ministry of Education', role: 'Customer' },
    { minsAgo: 140, actionId: 'verify', actor: 'S. Rahman', role: 'Supervisor' },
    { minsAgo: 138, actionId: 'approve', actor: 'S. Rahman', role: 'Supervisor' },
    { minsAgo: 132, actionId: 'assign', actor: 'S. Rahman', role: 'Supervisor' },
    { minsAgo: 128, actionId: 'accept', actor: 'Azlan Rahman', role: 'Technician' },
    { minsAgo: 110, actionId: 'en-route', actor: 'Azlan Rahman', role: 'Technician' },
    { minsAgo: 82, actionId: 'arrive', actor: 'Azlan Rahman', role: 'Technician' },
    { minsAgo: 80, actionId: 'check-in', actor: 'Azlan Rahman', role: 'Technician' },
    { minsAgo: 75, actionId: 'start-work', actor: 'Azlan Rahman', role: 'Technician' },
  ])
  c2.technician = 'Azlan Rahman'
  c2.checklist = c2.checklist.map((i, idx) => ({ ...i, done: idx < 2 }))
  c2.photos = { before: 3, progress: 2, after: 0 }

  // Case 3 — awaiting customer approval near the end of the chain
  let c3 = blankCase({
    id: 'CMP-1039', title: 'Lobby lighting circuit fault', desc: 'Feature lighting circuit tripping repeatedly in main lobby.',
    customer: 'Times Square Group', site: 'Mall — Main Lobby', trade: 'Electrical', priority: 'Medium',
    createdAt: now - 26 * 60 * min, amountBnd: 620,
  })
  c3 = seedEvents(c3, [
    { minsAgo: 25 * 60, actionId: 'submit', actor: 'Times Square Group', role: 'Customer' },
    { minsAgo: 24 * 60, actionId: 'verify', actor: 'S. Rahman', role: 'Supervisor' },
    { minsAgo: 24 * 60 - 5, actionId: 'approve', actor: 'S. Rahman', role: 'Supervisor' },
    { minsAgo: 23 * 60, actionId: 'assign', actor: 'S. Rahman', role: 'Supervisor' },
    { minsAgo: 22 * 60, actionId: 'accept', actor: 'Hafiz Omar', role: 'Technician' },
    { minsAgo: 21 * 60, actionId: 'en-route', actor: 'Hafiz Omar', role: 'Technician' },
    { minsAgo: 20 * 60, actionId: 'arrive', actor: 'Hafiz Omar', role: 'Technician' },
    { minsAgo: 20 * 60 - 3, actionId: 'check-in', actor: 'Hafiz Omar', role: 'Technician' },
    { minsAgo: 20 * 60 - 8, actionId: 'start-work', actor: 'Hafiz Omar', role: 'Technician' },
  ])
  c3.technician = 'Hafiz Omar'
  c3.checklist = c3.checklist.map((i) => ({ ...i, done: true }))
  c3.photos = { before: 2, progress: 4, after: 3 }
  c3.signature = true
  c3 = seedEvents(c3, [
    { minsAgo: 18 * 60, actionId: 'complete', actor: 'Hafiz Omar', role: 'Technician' },
    { minsAgo: 17 * 60, actionId: 'pass-inspection', actor: 'S. Rahman', role: 'Supervisor' },
  ])

  // Case 4 — SLA breach demo: high priority, nobody responded
  const c4 = blankCase({
    id: 'CMP-1040', title: 'Lift 3 stuck between floors (released)', desc: 'Lift 3 stopped between L2–L3 this morning; passengers released by building team. Lift isolated, needs inspection.',
    customer: 'Public Works Department', site: 'Gov Complex — Tower B', trade: 'Lifts', priority: 'High',
    createdAt: now - 4 * 60 * min, amountBnd: 2400,
  })
  const c4s = seedEvents(c4, [{ minsAgo: 4 * 60 - 2, actionId: 'submit', actor: 'Public Works Department', role: 'Customer' }])

  return [c1, c2, c4s, c3]
}

export const WF_TECHS: TechInfo[] = [
  { name: 'Azlan Rahman', trade: 'HVAC', load: 2, rating: 4.8 },
  { name: 'Hafiz Omar', trade: 'Electrical', load: 1, rating: 4.6 },
  { name: 'Siti Aminah', trade: 'Fire Protection', load: 1, rating: 4.9 },
  { name: 'Kumar Selvam', trade: 'Plumbing', load: 0, rating: 4.4 },
  { name: 'Daniel Wong', trade: 'Lifts', load: 1, rating: 4.7 },
  { name: 'Rahim Bakar', trade: 'Civil', load: 0, rating: 4.5 },
]

export const STATUS_LABEL: Record<WfStatus, string> = {
  NEW: 'New', SUBMITTED: 'Submitted', VERIFIED: 'Verified', APPROVED: 'Approved',
  ASSIGNED: 'Assigned', ACCEPTED: 'Accepted', SCHEDULED: 'Scheduled', EN_ROUTE: 'En Route',
  ARRIVED: 'Arrived', CHECK_IN: 'Checked In', WORK_STARTED: 'Work Started',
  IN_PROGRESS: 'In Progress', WAITING_PARTS: 'Waiting Parts', WAITING_APPROVAL: 'Waiting Approval',
  ON_HOLD: 'On Hold', RESUMED: 'Resumed', WORK_COMPLETED: 'Work Completed',
  SUPERVISOR_REVIEW: 'Supervisor Review', CUSTOMER_REVIEW: 'Customer Review',
  CUSTOMER_APPROVED: 'Customer Approved', WORK_ORDER_CLOSED: 'WO Closed',
  INVOICE_DRAFT: 'Invoice Draft', INVOICE_APPROVED: 'Invoice Approved', INVOICE_SENT: 'Invoice Sent',
  PAYMENT_PENDING: 'Payment Pending', PAID: 'Paid', CLOSED: 'Closed',
  CANCELLED: 'Cancelled', REJECTED: 'Rejected',
}
