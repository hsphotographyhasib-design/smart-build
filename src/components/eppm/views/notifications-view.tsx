'use client'

// Notifications Center — responsive (mobile + desktop). All / Unread / Mentions
// tabs, categorised feed with read/unread state. Wired to the 'notifications'
// route (bottom-nav Notifications tab + header bell target).
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ClipboardList, UserCheck, Bell, PlayCircle, CheckCircle2, MessageSquareWarning,
  Package, Wallet, CheckCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { View } from '@/lib/eppm'

type Cat = 'Maintenance' | 'Approvals' | 'Finance' | 'Inventory' | 'Mentions'
interface Notif {
  id: string; icon: typeof Bell; tone: string; text: string; when: string
  cat: Cat; unread: boolean; target?: View
}

const SEED: Notif[] = [
  { id: 'n1', icon: ClipboardList, tone: 'text-sky-600 bg-sky-50 dark:bg-sky-950/50', text: 'New complaint CMP-2026-0123 has been created.', when: '2 mins ago', cat: 'Maintenance', unread: true, target: 'complaints' },
  { id: 'n2', icon: UserCheck, tone: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50', text: 'You have been assigned to WO-2026-0158.', when: '5 mins ago', cat: 'Approvals', unread: true, target: 'work-orders' },
  { id: 'n3', icon: Bell, tone: 'text-violet-600 bg-violet-50 dark:bg-violet-950/50', text: 'Technician Ahmad Faris accepted WO-2026-0158.', when: '10 mins ago', cat: 'Maintenance', unread: true, target: 'workflow-engine' },
  { id: 'n4', icon: PlayCircle, tone: 'text-sky-600 bg-sky-50 dark:bg-sky-950/50', text: 'Work started for WO-2026-0158.', when: '15 mins ago', cat: 'Maintenance', unread: false, target: 'workflow-engine' },
  { id: 'n5', icon: CheckCircle2, tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50', text: 'Work completed for WO-2026-0157.', when: '1 hour ago', cat: 'Maintenance', unread: false, target: 'workflow-engine' },
  { id: 'n6', icon: MessageSquareWarning, tone: 'text-primary bg-primary/10', text: '@you were mentioned on PR-0912 approval thread.', when: '2 hours ago', cat: 'Mentions', unread: true, target: 'purchase-requests' },
  { id: 'n7', icon: Package, tone: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50', text: 'Sprinkler heads stock fell below reorder point.', when: '3 hours ago', cat: 'Inventory', unread: false, target: 'stock' },
  { id: 'n8', icon: Wallet, tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50', text: 'Payment received for INV-AR-0335 (BND 94k).', when: 'Yesterday', cat: 'Finance', unread: false, target: 'payments' },
]

const TABS = ['All', 'Unread', 'Mentions'] as const

export default function NotificationsView({ onNavigate }: { onNavigate: (v: View) => void }) {
  const [items, setItems] = useState(SEED)
  const [tab, setTab] = useState<(typeof TABS)[number]>('All')

  const unreadCount = items.filter((n) => n.unread).length
  const list = items.filter((n) =>
    tab === 'All' ? true : tab === 'Unread' ? n.unread : n.cat === 'Mentions')

  const open = (n: Notif) => {
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, unread: false } : x)))
    if (n.target) onNavigate(n.target)
  }
  const markAll = () => setItems((prev) => prev.map((n) => ({ ...n, unread: false })))

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
