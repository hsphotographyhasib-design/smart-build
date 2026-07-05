'use client'

// Mobile Work Orders — tabbed list (All / Assigned / In Progress / Completed)
// with priority, status, location, technician and schedule per the HJSB mobile
// reference. Rendered on small screens for the 'work-orders' route.
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Filter, MapPin, Clock, ChevronRight, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { View } from '@/lib/eppm'

type WoStatus = 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled'
type Priority = 'High' | 'Medium' | 'Low'
interface WorkOrder {
  id: string; title: string; location: string; tech: string
  priority: Priority; status: WoStatus; date: string; time: string
}

const ORDERS: WorkOrder[] = [
  { id: 'WO-2026-0158', title: 'Fix AC Not Cooling', location: 'Block A · Room 301', tech: 'Ahmad Faris', priority: 'High', status: 'Assigned', date: '23 Jun 2026', time: '10:00 AM' },
  { id: 'WO-2026-0157', title: 'Replace Ceiling Light', location: 'Block B · Corridor 2', tech: 'Muhammad Haikal', priority: 'Medium', status: 'In Progress', date: '23 Jun 2026', time: '02:00 PM' },
  { id: 'WO-2026-0156', title: 'Plumbing Leakage', location: 'Block C · Toilet 1', tech: 'Abdul Rahman', priority: 'Low', status: 'Completed', date: '22 Jun 2026', time: '11:30 AM' },
  { id: 'WO-2026-0155', title: 'Fire Pump Monthly Test', location: 'Times Square · B1', tech: 'Siti Aminah', priority: 'High', status: 'Assigned', date: '22 Jun 2026', time: '09:00 AM' },
  { id: 'WO-2026-0153', title: 'Lift Door Sensor Repair', location: 'Baiduri HQ · Level 1', tech: 'Daniel Wong', priority: 'High', status: 'In Progress', date: '21 Jun 2026', time: '03:15 PM' },
  { id: 'WO-2026-0150', title: 'Cooling Tower Fill Media', location: 'Gov Complex · Roof', tech: 'Azlan Rahman', priority: 'Medium', status: 'Completed', date: '19 Jun 2026', time: '08:45 AM' },
]

const TABS = ['All', 'Assigned', 'In Progress', 'Completed'] as const

const statusStyle = (s: WoStatus) =>
  s === 'Assigned' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
  : s === 'In Progress' ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400'
  : s === 'Completed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
  : 'bg-muted text-muted-foreground'

const prioDot = (p: Priority) => (p === 'High' ? 'bg-rose-500' : p === 'Medium' ? 'bg-amber-500' : 'bg-slate-400')

export default function MobileWorkOrders({ onNavigate }: { onNavigate: (v: View) => void }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>('All')
  const list = tab === 'All' ? ORDERS : ORDERS.filter((o) => o.status === tab)

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold tracking-tight">Work Orders</h1>
        <button className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground active:scale-95" aria-label="Filter">
          <Filter className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((t) => {
          const count = t === 'All' ? ORDERS.length : ORDERS.filter((o) => o.status === t).length
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-colors',
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
        {list.map((o, i) => (
          <motion.button
            key={o.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.04 }}
            onClick={() => onNavigate('workflow-engine')}
            className="w-full rounded-2xl border border-border bg-card p-4 text-left shadow-sm active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-muted-foreground">{o.id}</span>
              <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', statusStyle(o.status))}>{o.status}</span>
            </div>
            <div className="mt-1.5 text-base font-bold">{o.title}</div>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />{o.location}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 font-semibold">
                <span className={cn('h-2 w-2 rounded-full', prioDot(o.priority))} />{o.priority}
              </span>
              <span className="text-muted-foreground/50">·</span>
              <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3.5 w-3.5" />{o.date} · {o.time}</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5">
              <span className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
                  {o.tech.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </span>
                <span className="text-xs font-medium">{o.tech}</span>
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </motion.button>
        ))}
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
