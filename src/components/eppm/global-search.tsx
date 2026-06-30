'use client'

import { useState, useEffect, useMemo } from 'react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Briefcase, Activity, AlertTriangle, FileEdit, Search, ArrowRight, GitBranch, Clock } from 'lucide-react'
import { useDashboardData } from './use-data'
import { fmtMoney, fmtPct, fmtDate, healthColor, statusColor, type View } from '@/lib/eppm'
import { cn } from '@/lib/utils'

interface SearchResult {
  id: string
  type: 'project' | 'activity' | 'risk' | 'change'
  title: string
  subtitle: string
  badge?: string
  badgeTone?: string
  icon: any
  action: () => void
}

export function GlobalSearch({
  open, onOpenChange, onNavigate, onOpenProject,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onNavigate: (v: View) => void
  onOpenProject: (id: string) => void
}) {
  const data = useDashboardData()
  const [query, setQuery] = useState('')

  const results = useMemo<SearchResult[]>(() => {
    if (!data || !query.trim()) return []
    const q = query.toLowerCase()
    const out: SearchResult[] = []

    // Projects
    data.projects.filter(p => `${p.code} ${p.name} ${p.client} ${p.location}`.toLowerCase().includes(q)).slice(0, 6).forEach(p => {
      out.push({
        id: `proj-${p.id}`, type: 'project', title: p.name, subtitle: `${p.code} · ${p.client ?? '—'} · ${fmtPct(p.progress)}`,
        badge: p.health, badgeTone: healthColor(p.health), icon: Briefcase,
        action: () => { onOpenChange(false); onOpenProject(p.id); onNavigate('projects') },
      })
    })
    // Activities
    data.activities.filter(a => `${a.activityId} ${a.name}`.toLowerCase().includes(q)).slice(0, 8).forEach(a => {
      out.push({
        id: `act-${a.id}`, type: 'activity', title: a.name, subtitle: `${a.activityId} · ${a.project?.code} · ${a.status} · ${a.progress}%`,
        badge: a.isCritical ? 'Critical' : a.status, badgeTone: a.isCritical ? 'text-rose-600 bg-rose-50 border-rose-200' : statusColor(a.status),
        icon: a.isCritical ? GitBranch : Activity,
        action: () => { onOpenChange(false); onOpenProject(a.projectId); onNavigate('activities') },
      })
    })
    // Risks
    data.risks.filter(r => `${r.code} ${r.title}`.toLowerCase().includes(q)).slice(0, 5).forEach(r => {
      out.push({
        id: `risk-${r.id}`, type: 'risk', title: r.title, subtitle: `${r.code} · ${r.project?.code} · Score ${r.score}`,
        badge: `Score ${r.score}`, badgeTone: r.score >= 15 ? 'text-rose-600 bg-rose-50 border-rose-200' : r.score >= 9 ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-emerald-600 bg-emerald-50 border-emerald-200',
        icon: AlertTriangle,
        action: () => { onOpenChange(false); onNavigate('risks') },
      })
    })
    // Changes
    data.changes.filter(c => `${c.code} ${c.title}`.toLowerCase().includes(q)).slice(0, 5).forEach(c => {
      out.push({
        id: `chg-${c.id}`, type: 'change', title: c.title, subtitle: `${c.code} · ${c.project?.code} · ${c.type} · ${c.status}`,
        badge: c.status, badgeTone: statusColor(c.status), icon: FileEdit,
        action: () => { onOpenChange(false); onNavigate('changes') },
      })
    })
    return out.slice(0, 24)
  }, [data, query, onOpenChange, onNavigate, onOpenProject])

  // Group results
  const groups = useMemo(() => {
    const g: Record<string, SearchResult[]> = { project: [], activity: [], risk: [], change: [] }
    for (const r of results) g[r.type].push(r)
    return g
  }, [results])

  const groupLabels = { project: 'Projects', activity: 'Activities', risk: 'Risks', change: 'Changes' }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl max-w-2xl" showCloseButton={false}>
        <Command shouldFilter={false} className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-4 [&_[cmdk-input-wrapper]_svg]:w-4 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-2 [&_[cmdk-item]_svg]:h-4 [&_[cmdk-item]_svg]:w-4">
          <div className="flex items-center gap-2 border-b px-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <CommandInput placeholder="Search projects, activities, risks, changes…" value={query} onValueChange={setQuery} className="border-0 ring-0" />
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">ESC</kbd>
          </div>
          <CommandList className="max-h-[420px]">
            <CommandEmpty>
              {query.trim() ? (
                <div className="py-8 text-center">
                  <Search className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <div className="text-xs text-muted-foreground">No results for "{query}"</div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Search className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <div className="text-xs text-muted-foreground">Start typing to search across the portfolio…</div>
                </div>
              )}
            </CommandEmpty>
            {(['project', 'activity', 'risk', 'change'] as const).map(g => (
              groups[g].length > 0 && (
                <CommandGroup key={g} heading={`${groupLabels[g]} (${groups[g].length})`}>
                  {groups[g].map(r => {
                    const Icon = r.icon
                    return (
                      <CommandItem key={r.id} value={`${r.type}-${r.id}`} onSelect={() => r.action()} className="gap-2.5">
                        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-muted">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-medium">{r.title}</div>
                          <div className="truncate text-[10px] text-muted-foreground">{r.subtitle}</div>
                        </div>
                        {r.badge && <span className={cn('shrink-0 text-[9px] px-1.5 py-0.5 rounded border', r.badgeTone)}>{r.badge}</span>}
                        <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 group-aria-selected:opacity-100" />
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )
            ))}
          </CommandList>
          <div className="border-t flex items-center justify-between px-3 py-1.5 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><kbd className="inline-flex h-4 items-center rounded border bg-muted px-1 font-mono text-[9px]">↑↓</kbd> navigate</span>
              <span className="flex items-center gap-1"><kbd className="inline-flex h-4 items-center rounded border bg-muted px-1 font-mono text-[9px]">↵</kbd> select</span>
            </div>
            <span>{results.length} results</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
