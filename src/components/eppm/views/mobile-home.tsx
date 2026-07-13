'use client'

// Mobile Home dashboard — the phone landing screen from the HJSB mobile
// reference: greeting card, KPI tiles, quick-access grid, upcoming schedule
// and recent activity. Rendered only on small screens (see app/page.tsx).
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Building2, Hammer, MessageSquareWarning, CalendarClock, Boxes, Package,
  BarChart3, QrCode, ShieldCheck, MoreHorizontal, ChevronRight, Wrench,
  CheckCircle2, Clock, FolderKanban,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/auth/auth-context'
import type { View } from '@/lib/eppm'

const KPIS = [
  { label: 'Projects', value: 12, icon: FolderKanban, view: 'projects' as View, tone: 'text-sky-700' },
  { label: 'Work Orders', value: 24, icon: Hammer, view: 'work-orders' as View, tone: 'text-primary' },
  { label: 'Complaints', value: 8, icon: MessageSquareWarning, view: 'complaints' as View, tone: 'text-amber-700' },
  { label: 'PM Tasks', value: 16, icon: CalendarClock, view: 'preventive' as View, tone: 'text-violet-600' },
]

const QUICK = [
  { label: 'Work Orders', icon: Hammer, view: 'work-orders' as View },
  { label: 'Complaints', icon: MessageSquareWarning, view: 'complaints' as View },
  { label: 'PM Schedule', icon: CalendarClock, view: 'preventive' as View },
  { label: 'Assets', icon: Boxes, view: 'assets' as View },
  { label: 'Inventory', icon: Package, view: 'stock' as View },
  { label: 'Reports', icon: BarChart3, view: 'reports' as View },
  { label: 'QR Scanner', icon: QrCode, view: 'assets' as View },
  { label: 'Safety', icon: ShieldCheck, view: 'hse' as View },
]

const SCHEDULE = [
  { title: 'AC Preventive Maintenance', where: 'Block A · Level 3', time: '10:00 AM', icon: CalendarClock },
  { title: 'Fire Pump Monthly Test', where: 'Times Square Mall · B1', time: '02:30 PM', icon: ShieldCheck },
]

const ACTIVITY = [
  { text: 'WO-5122 marked Completed', when: '12 min ago', icon: CheckCircle2, tone: 'text-emerald-700' },
  { text: 'New complaint CMP-1042 created', when: '38 min ago', icon: MessageSquareWarning, tone: 'text-amber-700' },
  { text: 'PPM-014 chiller service due', when: '1 hr ago', icon: Wrench, tone: 'text-sky-700' },
]

export default function MobileHome({
  onNavigate,
  onOpenDrawer,
}: {
  onNavigate: (v: View) => void
  onOpenDrawer: () => void
}) {
  const { user } = useAuth()
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => { setNow(new Date()) }, [])

  const hour = now?.getHours() ?? 9
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening'
  const dateStr = now?.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) ?? ''

  return (
    <div className="space-y-5 pb-4">
      {/* Greeting card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-emerald-800 p-5 text-primary-foreground shadow-lg shadow-primary/20"
      >
        <div className="relative z-10">
          <div className="text-sm/none opacity-80">{greeting},</div>
          <div className="mt-1 flex items-center gap-2 text-xl font-extrabold tracking-tight">
            {user?.name ?? 'Site Administrator'} <span className="text-lg">👋</span>
          </div>
          <div className="mt-1.5 text-xs opacity-75" suppressHydrationWarning>{dateStr}</div>
          <div className="mt-2 inline-flex items-center rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold backdrop-blur-sm">
            {user?.role ?? 'Super Admin'}
          </div>
        </div>
        <Building2 className="absolute -right-3 -bottom-3 h-28 w-28 text-white/10" />
      </motion.div>

      {/* KPI tiles */}
      <div className="grid grid-cols-4 gap-2.5">
        {KPIS.map((k, i) => (
          <motion.button
            key={k.label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}
            onClick={() => onNavigate(k.view)}
            className="flex flex-col items-center rounded-2xl border border-border bg-card p-2.5 text-center shadow-sm active:scale-95 transition-transform"
          >
            <k.icon className={cn('mb-1 h-4.5 w-4.5', k.tone)} />
            <div className="text-lg font-bold leading-none">{k.value}</div>
            <div className="mt-1 text-[9px] leading-tight text-muted-foreground">{k.label}</div>
          </motion.button>
        ))}
      </div>

      {/* Quick access */}
      <div>
        <div className="mb-2.5 px-1 text-sm font-bold">Quick Access</div>
        <div className="grid grid-cols-3 gap-2.5">
          {QUICK.map((q) => (
            <button
              key={q.label}
              onClick={() => onNavigate(q.view)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3.5 shadow-sm active:scale-95 transition-transform"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <q.icon className="h-5 w-5" />
              </span>
              <span className="text-[11px] font-semibold text-foreground">{q.label}</span>
            </button>
          ))}
          <button
            onClick={onOpenDrawer}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3.5 shadow-sm active:scale-95 transition-transform"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-muted-foreground">
              <MoreHorizontal className="h-5 w-5" />
            </span>
            <span className="text-[11px] font-semibold text-foreground">More</span>
          </button>
        </div>
      </div>

      {/* Upcoming schedule */}
      <div>
        <div className="mb-2.5 flex items-center justify-between px-1">
          <span className="text-sm font-bold">Upcoming Schedule</span>
          <button onClick={() => onNavigate('preventive')} className="flex items-center gap-0.5 text-xs font-semibold text-primary">
            View All <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="space-y-2.5">
          {SCHEDULE.map((s) => (
            <div key={s.title} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-sm">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{s.title}</div>
                <div className="truncate text-xs text-muted-foreground">{s.where}</div>
              </div>
              <div className="shrink-0 text-xs font-bold text-primary">{s.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <div className="mb-2.5 px-1 text-sm font-bold">Recent Activity</div>
        <div className="rounded-2xl border border-border bg-card p-1.5 shadow-sm">
          {ACTIVITY.map((a, i) => (
            <div key={i} className={cn('flex items-center gap-3 rounded-xl px-3 py-2.5', i < ACTIVITY.length - 1 && 'border-b border-border/60')}>
              <a.icon className={cn('h-4.5 w-4.5 shrink-0', a.tone)} />
              <div className="min-w-0 flex-1 truncate text-sm">{a.text}</div>
              <div className="flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" />{a.when}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
