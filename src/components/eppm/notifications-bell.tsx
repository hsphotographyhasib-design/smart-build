'use client'

import { useMemo } from 'react'
import { Bell, AlertTriangle, CalendarClock, ShieldAlert, FileEdit, GitBranch, CheckCircle2, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useDashboardData } from './use-data'
import { fmtMoney, fmtDate, healthColor, statusColor, type View } from '@/lib/eppm'
import { cn } from '@/lib/utils'

interface Alert {
  id: string
  type: 'delay' | 'risk' | 'approval' | 'critical' | 'budget'
  severity: 'high' | 'medium' | 'low'
  title: string
  detail: string
  projectCode?: string
  date?: string
  meta?: string
}

export function NotificationsBell({ onNavigate }: { onNavigate: (v: View) => void }) {
  const data = useDashboardData()

  const alerts = useMemo<Alert[]>(() => {
    if (!data) return []
    const out: Alert[] = []
    // Delayed activities
    data.delayedActivities.slice(0, 6).forEach(a => {
      const slip = a.finishDate && a.baselineFinish ? Math.round((+new Date(a.finishDate) - +new Date(a.baselineFinish)) / 86400000) : 0
      out.push({
        id: `delay-${a.id}`, type: 'delay', severity: slip > 14 ? 'high' : 'medium',
        title: a.name, detail: `Finish slipped +${slip} days past baseline`,
        projectCode: a.project?.code, date: a.baselineFinish, meta: `+${slip}d`,
      })
    })
    // High risks (score >= 15, open)
    data.risks.filter(r => r.status === 'Open' && r.score >= 12).slice(0, 6).forEach(r => {
      out.push({
        id: `risk-${r.id}`, type: 'risk', severity: r.score >= 15 ? 'high' : 'medium',
        title: r.title, detail: `Risk score ${r.score} (${r.probability}×${r.impact}) · ${r.category}`,
        projectCode: r.project?.code, date: r.dueDate, meta: `Score ${r.score}`,
      })
    })
    // Pending approvals (change orders)
    data.changes.filter(c => c.status === 'Submitted' || c.status === 'Under Review').slice(0, 5).forEach(c => {
      out.push({
        id: `appr-${c.id}`, type: 'approval', severity: 'medium',
        title: c.title, detail: `${c.type} · ${c.status}${c.costImpact ? ` · ${fmtMoney(c.costImpact)}` : ''}${c.timeImpact ? ` · +${c.timeImpact}d` : ''}`,
        projectCode: c.project?.code, date: c.raisedDate, meta: c.status,
      })
    })
    // Critical path warnings (zero-float in-progress activities)
    data.criticalActivities.filter(a => a.totalFloat === 0 && a.status === 'In Progress').slice(0, 4).forEach(a => {
      out.push({
        id: `crit-${a.id}`, type: 'critical', severity: 'high',
        title: a.name, detail: `Zero float · ${a.remainingDur}d remaining · critical path`,
        projectCode: a.project?.code, meta: `${a.remainingDur}d`,
      })
    })
    // Budget overrun (forecast > budget by >5%)
    data.projects.filter(p => p.budget && p.forecastCost > p.budget * 1.05).slice(0, 4).forEach(p => {
      const over = ((p.forecastCost - p.budget) / p.budget) * 100
      out.push({
        id: `bud-${p.id}`, type: 'budget', severity: over > 15 ? 'high' : 'medium',
        title: p.name, detail: `Forecast overrun +${over.toFixed(1)}% over budget`,
        projectCode: p.code, meta: `+${over.toFixed(0)}%`,
      })
    })
    return out.sort((a, b) => sevRank(b.severity) - sevRank(a.severity))
  }, [data])

  const high = alerts.filter(a => a.severity === 'high').length
  const counts = {
    delay: alerts.filter(a => a.type === 'delay').length,
    risk: alerts.filter(a => a.type === 'risk').length,
    approval: alerts.filter(a => a.type === 'approval').length,
    critical: alerts.filter(a => a.type === 'critical').length,
    budget: alerts.filter(a => a.type === 'budget').length,
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-11 w-11 rounded-full sm:h-9 sm:w-9" aria-label="Alerts and notifications">
          <Bell className="h-5 w-5" />
          {alerts.length > 0 && (
            <span className={cn('absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[9px] font-bold text-white', high > 0 ? 'bg-rose-500 animate-pulse' : 'bg-amber-500')}>
              {alerts.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(400px,calc(100vw-2rem))] p-0" sideOffset={8}>
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="text-sm font-semibold">Alerts &amp; Notifications</span>
            {high > 0 && <Badge variant="outline" className="text-[9px] border-rose-300 text-rose-700 bg-rose-50">{high} high</Badge>}
          </div>
          <span className="text-[10px] text-muted-foreground">{alerts.length} total</span>
        </div>

        {!data ? (
          <div className="p-8 text-center text-xs text-muted-foreground">Loading alerts…</div>
        ) : alerts.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <div className="text-sm font-medium">All clear</div>
            <div className="text-[11px] text-muted-foreground">No active alerts in your portfolio</div>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <div className="border-b px-2 pt-1.5">
              <TabsList className="h-8 w-full grid grid-cols-6 gap-1">
                <TabsTrigger value="all" className="text-[10px] px-1">All <span className="ml-0.5 opacity-60">{alerts.length}</span></TabsTrigger>
                <TabsTrigger value="delay" className="text-[10px] px-1">Delay <span className="ml-0.5 opacity-60">{counts.delay}</span></TabsTrigger>
                <TabsTrigger value="risk" className="text-[10px] px-1">Risk <span className="ml-0.5 opacity-60">{counts.risk}</span></TabsTrigger>
                <TabsTrigger value="approval" className="text-[10px] px-1">Approve <span className="ml-0.5 opacity-60">{counts.approval}</span></TabsTrigger>
                <TabsTrigger value="critical" className="text-[10px] px-1">Crit <span className="ml-0.5 opacity-60">{counts.critical}</span></TabsTrigger>
                <TabsTrigger value="budget" className="text-[10px] px-1">Budget <span className="ml-0.5 opacity-60">{counts.budget}</span></TabsTrigger>
              </TabsList>
            </div>
            <ScrollArea className="h-[380px]">
              {(['all', 'delay', 'risk', 'approval', 'critical', 'budget'] as const).map(tab => {
                const list = tab === 'all' ? alerts : alerts.filter(a => a.type === tab)
                return (
                  <TabsContent key={tab} value={tab} className="m-0 mt-0">
                    <div className="divide-y">
                      {list.length === 0 ? (
                        <div className="py-8 text-center text-[11px] text-muted-foreground">No {tab} alerts</div>
                      ) : list.map(a => <AlertRow key={a.id} alert={a} onNavigate={onNavigate} />)}
                    </div>
                  </TabsContent>
                )
              })}
            </ScrollArea>
            <div className="border-t p-2 flex items-center justify-between">
              <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => onNavigate('risks')}>View Risk Register</Button>
              <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => onNavigate('changes')}>Pending Approvals</Button>
            </div>
          </Tabs>
        )}
      </PopoverContent>
    </Popover>
  )
}

function AlertRow({ alert, onNavigate }: { alert: Alert; onNavigate: (v: View) => void }) {
  const icon = { delay: CalendarClock, risk: ShieldAlert, approval: FileEdit, critical: GitBranch, budget: AlertTriangle }[alert.type]
  const Icon = icon
  const tone = {
    high: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
    medium: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    low: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400',
  }[alert.severity]
  const navTarget: View = alert.type === 'risk' ? 'risks' : alert.type === 'approval' ? 'changes' : alert.type === 'delay' || alert.type === 'critical' ? 'critical-path' : 'costs'
  return (
    <button onClick={() => onNavigate(navTarget)} className="flex w-full items-start gap-2.5 px-4 py-2.5 hover:bg-muted/40 transition-colors text-left">
      <div className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-lg', tone)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {alert.projectCode && <span className="font-mono text-[9px] text-muted-foreground shrink-0">{alert.projectCode}</span>}
          <span className="truncate text-xs font-medium">{alert.title}</span>
        </div>
        <div className="truncate text-[10px] text-muted-foreground mt-0.5">{alert.detail}</div>
        <div className="flex items-center gap-2 mt-1">
          {alert.date && <span className="text-[9px] text-muted-foreground">{fmtDate(alert.date)}</span>}
          {alert.meta && <Badge variant="outline" className={cn('text-[8px] h-4', alert.severity === 'high' ? 'border-rose-200 text-rose-700' : 'border-amber-200 text-amber-700')}>{alert.meta}</Badge>}
        </div>
      </div>
    </button>
  )
}

function sevRank(s: Alert['severity']) { return s === 'high' ? 3 : s === 'medium' ? 2 : 1 }
