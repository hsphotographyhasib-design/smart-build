'use client'

// Mobile Work Orders — live view over the workflow engine's case list.
// Tabs bucket the engine statuses (All / Assigned / In Progress / Completed);
// tapping a card opens the workflow console for that case.
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Filter, MapPin, Clock, ChevronRight, User, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { View } from '@/lib/eppm'
import { type WfCase, type WfStatus, STATUS_LABEL, slaState } from '@/lib/maintenance-workflow'
import { useWorkflow } from '@/components/eppm/workflow/workflow-context'

type Bucket = 'Assigned' | 'In Progress' | 'Completed' | 'Pending'

const BUCKET_OF: Partial<Record<WfStatus, Bucket>> = {
  NEW: 'Pending', SUBMITTED: 'Pending', VERIFIED: 'Pending', APPROVED: 'Pending',
  ASSIGNED: 'Assigned', ACCEPTED: 'Assigned', SCHEDULED: 'Assigned',
  EN_ROUTE: 'In Progress', ARRIVED: 'In Progress', CHECK_IN: 'In Progress',
  WORK_STARTED: 'In Progress', IN_PROGRESS: 'In Progress', WAITING_PARTS: 'In Progress',
  WAITING_APPROVAL: 'In Progress', ON_HOLD: 'In Progress', RESUMED: 'In Progress',
  WORK_COMPLETED: 'Completed', SUPERVISOR_REVIEW: 'Completed', CUSTOMER_REVIEW: 'Completed',
  CUSTOMER_APPROVED: 'Completed', WORK_ORDER_CLOSED: 'Completed', INVOICE_DRAFT: 'Completed',
  INVOICE_APPROVED: 'Completed', INVOICE_SENT: 'Completed', PAYMENT_PENDING: 'Completed',
  PAID: 'Completed', CLOSED: 'Completed',
}

const TABS = ['All', 'Pending', 'Assigned', 'In Progress', 'Completed'] as const

const bucketStyle = (b: Bucket) =>
  b === 'Pending' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
  : b === 'Assigned' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
  : b === 'In Progress' ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400'
  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'

const prioDot = (p: WfCase['priority']) =>
  p === 'Emergency' ? 'bg-rose-600' : p === 'High' ? 'bg-rose-500' : p === 'Medium' ? 'bg-amber-500' : 'bg-slate-400'

const fmtWhen = (ms: number) =>
  new Date(ms).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

export default function MobileWorkOrders({ onNavigate }: { onNavigate: (v: View) => void }) {
  const { cases } = useWorkflow()
  const [tab, setTab] = useState<(typeof TABS)[number]>('All')

  const visible = cases.filter((c) => !['CANCELLED', 'REJECTED'].includes(c.status))
  const bucket = (c: WfCase): Bucket => BUCKET_OF[c.status] ?? 'Pending'
  const list = tab === 'All' ? visible : visible.filter((c) => bucket(c) === tab)

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold tracking-tight">Work Orders</h1>
        <button className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-muted-foreground active:scale-95" aria-label="Filter">
          <Filter className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((t) => {
          const count = t === 'All' ? visible.length : visible.filter((c) => bucket(c) === t).length
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors',
                tab === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
              )}
            >
              {t} <span className={cn('ml-0.5', tab === t ? 'text-primary-foreground/80' : 'text-muted-foreground/70')}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {list.map((c, i) => {
          const b = bucket(c)
          const breaches = slaState(c).breached.length
          return (
            <motion.button
              key={c.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.04 }}
              onClick={() => onNavigate('workflow-engine')}
              className="w-full rounded-2xl border border-border bg-card p-4 text-left shadow-sm active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-mono text-[11px] text-muted-foreground">{c.woId ?? c.id}</span>
                <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold', bucketStyle(b))}>{STATUS_LABEL[c.status]}</span>
              </div>
              <div className="mt-1.5 text-base font-bold">{c.title}</div>
              <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{c.site}</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="flex items-center gap-1 font-semibold">
                  <span className={cn('h-2 w-2 rounded-full', prioDot(c.priority))} />{c.priority}
                </span>
                <span className="text-muted-foreground/50">·</span>
                <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3.5 w-3.5" />{fmtWhen(c.createdAt)}</span>
                {breaches > 0 && (
                  <span className="flex items-center gap-1 font-semibold text-rose-600"><AlertTriangle className="h-3.5 w-3.5" />SLA</span>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5">
                <span className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
                    {(c.technician ?? '—').split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </span>
                  <span className="text-xs font-medium">{c.technician ?? 'Unassigned'}</span>
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </motion.button>
          )
        })}
        {list.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-12 text-center">
            <User className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No {tab.toLowerCase()} work orders.</p>
          </div>
        )}
      </div>
    </div>
  )
}
