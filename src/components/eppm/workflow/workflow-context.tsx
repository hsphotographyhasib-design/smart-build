'use client'

// ─────────────────────────────────────────────────────────────────────────────
// WorkflowProvider — the single live store for the maintenance workflow engine.
//
// Every surface (workflow console, complaints, work orders, mobile screens,
// notification center, nav badges) reads the SAME case list, so a transition
// made anywhere is instantly visible everywhere. State persists to
// localStorage so the workflow survives navigation and reloads, and an SLA
// sweep escalates breached cases automatically in the background.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  type WfCase, type WfRole, type NewComplaintInput,
  seedCases, applyAction, createComplaintCase, escalateIfNeeded, slaState, WF_TECHS,
} from '@/lib/maintenance-workflow'

const STORE_KEY = 'sb:wf:cases:v1'
const SEQ_KEY = 'sb:wf:seq:v1'

interface WorkflowContextValue {
  cases: WfCase[]
  hydrated: boolean
  runAction: (caseId: string, actionId: string, actor: { name: string; role: WfRole }) => void
  createComplaint: (input: NewComplaintInput) => string
  toggleChecklist: (caseId: string, idx: number) => void
  addPhoto: (caseId: string, kind: 'before' | 'progress' | 'after') => void
  captureSignature: (caseId: string) => void
  markNotificationsRead: () => void
  resetDemo: () => void
  /** Live badge counts derived from the case list. */
  counts: { fieldActive: number; pendingApprovals: number; slaBreaches: number; unreadNotifications: number }
}

const WorkflowContext = createContext<WorkflowContextValue | null>(null)

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  // SSR renders the seed; localStorage (if any) replaces it after mount.
  const [cases, setCases] = useState<WfCase[]>(() => seedCases())
  const [hydrated, setHydrated] = useState(false)
  const seq = useRef(5200)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as WfCase[]
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id) setCases(parsed)
      }
      const s = Number(localStorage.getItem(SEQ_KEY))
      if (Number.isFinite(s) && s > seq.current) seq.current = s
    } catch { /* corrupt store → keep seeds */ }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(cases))
      localStorage.setItem(SEQ_KEY, String(seq.current))
    } catch { /* quota — non-fatal */ }
  }, [cases, hydrated])

  // SLA escalation sweep — runs on hydrate and every minute.
  useEffect(() => {
    if (!hydrated) return
    const sweep = () => setCases((prev) => {
      let changed = false
      const next = prev.map((c) => {
        const esc = escalateIfNeeded(c)
        if (esc) changed = true
        return esc ?? c
      })
      return changed ? next : prev
    })
    sweep()
    const id = setInterval(sweep, 60_000)
    return () => clearInterval(id)
  }, [hydrated])

  const nextSeq = () => { seq.current += 1; return seq.current }

  const runAction = useCallback((caseId: string, actionId: string, actor: { name: string; role: WfRole }) => {
    const n = nextSeq()
    setCases((prev) => prev.map((c) => {
      if (c.id !== caseId) return c
      let next = applyAction(c, actionId, actor, n)
      if (actionId === 'assign' || actionId === 'reassign') {
        next = { ...next, technician: WF_TECHS.find((t) => t.trade === c.trade)?.name ?? WF_TECHS[0].name }
      }
      return next
    }))
  }, [])

  const createComplaint = useCallback((input: NewComplaintInput) => {
    const c = createComplaintCase(input, nextSeq())
    setCases((prev) => [c, ...prev])
    return c.id
  }, [])

  const toggleChecklist = useCallback((caseId: string, idx: number) => {
    setCases((prev) => prev.map((c) => (c.id === caseId
      ? { ...c, checklist: c.checklist.map((i, n) => (n === idx ? { ...i, done: !i.done } : i)) }
      : c)))
  }, [])

  const addPhoto = useCallback((caseId: string, kind: 'before' | 'progress' | 'after') => {
    setCases((prev) => prev.map((c) => (c.id === caseId
      ? { ...c, photos: { ...c.photos, [kind]: c.photos[kind] + 1 } }
      : c)))
  }, [])

  const captureSignature = useCallback((caseId: string) => {
    setCases((prev) => prev.map((c) => (c.id === caseId ? { ...c, signature: true } : c)))
  }, [])

  const markNotificationsRead = useCallback(() => {
    setCases((prev) => prev.map((c) => ({
      ...c,
      notifications: c.notifications.map((n) => (n.read ? n : { ...n, read: true })),
    })))
  }, [])

  const resetDemo = useCallback(() => {
    setCases(seedCases())
    seq.current = 5200
  }, [])

  const counts = useMemo(() => ({
    fieldActive: cases.filter((c) => ['ASSIGNED', 'ACCEPTED', 'SCHEDULED', 'EN_ROUTE', 'ARRIVED', 'CHECK_IN', 'IN_PROGRESS', 'WAITING_PARTS', 'ON_HOLD'].includes(c.status)).length,
    pendingApprovals: cases.filter((c) => ['SUBMITTED', 'VERIFIED', 'WAITING_APPROVAL', 'SUPERVISOR_REVIEW', 'CUSTOMER_REVIEW', 'INVOICE_DRAFT'].includes(c.status)).length,
    slaBreaches: cases.reduce((a, c) => a + slaState(c).breached.length, 0),
    unreadNotifications: cases.reduce((a, c) => a + c.notifications.filter((n) => !n.read).length, 0),
  }), [cases])

  const value = useMemo<WorkflowContextValue>(() => ({
    cases, hydrated, runAction, createComplaint, toggleChecklist, addPhoto,
    captureSignature, markNotificationsRead, resetDemo, counts,
  }), [cases, hydrated, runAction, createComplaint, toggleChecklist, addPhoto, captureSignature, markNotificationsRead, resetDemo, counts])

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>
}

export function useWorkflow(): WorkflowContextValue {
  const ctx = useContext(WorkflowContext)
  if (!ctx) throw new Error('useWorkflow must be used within WorkflowProvider')
  return ctx
}

/** Null-safe variant for components that may render outside the provider. */
export function useWorkflowSafe(): WorkflowContextValue | null {
  return useContext(WorkflowContext)
}
