'use client'

// Notifications Center — responsive (mobile + desktop). All / Unread / Mentions
// tabs, categorised feed with read/unread state. Wired to the 'notifications'
// route (bottom-nav Notifications tab + header bell target).
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bell, CheckCircle2, MessageSquareWarning, AlertTriangle,
  Package, Wallet, CheckCheck, ClipboardList,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { View } from '@/lib/eppm'
import { useWorkflow } from '@/components/eppm/workflow/workflow-context'

type Cat = 'Maintenance' | 'Approvals' | 'Finance' | 'Inventory' | 'Mentions'
interface Notif {
  id: string; icon: typeof Bell; tone: string; text: string; when: string
  at: number; cat: Cat; unread: boolean; target?: View
}

// Non-workflow feeds (inventory / finance / mentions) — static demo entries.
const SEED: Notif[] = [
  { id: 'n6', at: Date.now() - 2 * 3600_000, icon: MessageSquareWarning, tone: 'text-primary bg-primary/10', text: '@you were mentioned on PR-0912 approval thread.', when: '2 hours ago', cat: 'Mentions', unread: true, target: 'purchase-requests' },
  { id: 'n7', at: Date.now() - 3 * 3600_000, icon: Package, tone: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50', text: 'Sprinkler heads stock fell below reorder point.', when: '3 hours ago', cat: 'Inventory', unread: false, target: 'stock' },
  { id: 'n8', at: Date.now() - 26 * 3600_000, icon: Wallet, tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50', text: 'Payment received for INV-AR-0335 (BND 94k).', when: 'Yesterday', cat: 'Finance', unread: false, target: 'payments' },
]

const TABS = ['All', 'Unread', 'Mentions'] as const

function relTime(ms: number) {
  const d = Date.now() - ms
  if (d < 60_000) return 'just now'
  if (d < 3600_000) return `${Math.floor(d / 60_000)} mins ago`
  if (d < 86_400_000) return `${Math.floor(d / 3600_000)} hour${d >= 7200_000 ? 's' : ''} ago`
  return `${Math.floor(d / 86_400_000)}d ago`
}

export default function NotificationsView({ onNavigate }: { onNavigate: (v: View) => void }) {
  const { cases, markNotificationsRead } = useWorkflow()
  const [items, setItems] = useState(SEED)
  const [tab, setTab] = useState<(typeof TABS)[number]>('All')

  // Live workflow events — every status change lands here automatically.
  const wfItems = useMemo<Notif[]>(() =>
    cases.flatMap((c) =>
      c.notifications.map((n, i) => {
        const escalation = n.event.startsWith('Escalation')
        const finance = /invoice|payment/i.test(n.event)
        return {
          id: `${c.id}:${i}`,
          at: n.at,
          icon: escalation ? AlertTriangle : finance ? Wallet : n.event.includes('Complete') || n.event.includes('Closed') ? CheckCircle2 : ClipboardList,
          tone: escalation ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/50'
            : finance ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50'
            : 'text-sky-600 bg-sky-50 dark:bg-sky-950/50',
          text: `${n.event} — ${c.woId ?? c.id} · ${c.title}`,
          when: relTime(n.at),
          cat: (finance ? 'Finance' : 'Maintenance') as Cat,
          unread: !n.read,
          target: 'workflow-engine' as View,
        }
      }),
    ), [cases])

  const all = useMemo(() => [...wfItems, ...items].sort((a, b) => b.at - a.at), [wfItems, items])
  const unreadCount = all.filter((n) => n.unread).length
  const list = all.filter((n) =>
    tab === 'All' ? true : tab === 'Unread' ? n.unread : n.cat === 'Mentions')

  const open = (n: Notif) => {
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, unread: false } : x)))
    if (n.target) onNavigate(n.target)
  }
  const markAll = () => {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })))
    markNotificationsRead()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold tracking-tight">Notifications</h1>
        {unreadCount > 0 && (
          <button onClick={markAll} className="flex items-center gap-1 text-xs font-semibold text-primary">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        )}
      </div>

      <div className="flex gap-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-colors',
              tab === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
            )}
          >
            {t}
            {t === 'Unread' && unreadCount > 0 && (
              <span className={cn('grid h-4 min-w-4 place-items-center rounded-full px-1 text-[9px]', tab === t ? 'bg-white/25' : 'bg-rose-500 text-white')}>{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {list.map((n, i) => (
          <motion.button
            key={n.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, delay: i * 0.03 }}
            onClick={() => open(n)}
            className={cn(
              'flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left shadow-sm transition-transform active:scale-[0.99]',
              n.unread ? 'border-primary/25 bg-primary/[0.03]' : 'border-border bg-card',
            )}
          >
            <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl', n.tone)}>
              <n.icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm leading-snug">{n.text}</div>
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-semibold text-muted-foreground">{n.cat}</span>
                <span className="text-[11px] text-muted-foreground">{n.when}</span>
              </div>
            </div>
            {n.unread && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
          </motion.button>
        ))}
        {list.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-12 text-center">
            <Bell className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">You&apos;re all caught up.</p>
          </div>
        )}
      </div>
    </div>
  )
}
