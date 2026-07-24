'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { ChevronRight, ChevronDown, ListTree, Plus, Download, Milestone } from 'lucide-react'
import { useDashboardData, useProjectDetail } from '../use-data'
import { fmtMoney, fmtPct, fmtDate, type View } from '@/lib/eppm'
import { cn } from '@/lib/utils'

interface WbsNode { id: string; code: string; name: string; level: number; weight: number; progress: number; budget: number; actualCost: number; startDate?: string | null; finishDate?: string | null; isMilestone?: boolean; children?: WbsNode[] }

export function WbsView({ projectId, onNavigate }: { projectId: string | null; onNavigate: (v: View) => void }) {
  const dash = useDashboardData()
  const [activeId, setActiveId] = useState<string | null>(projectId ?? dash?.projects[0]?.id ?? null)
  const detail = useProjectDetail(activeId)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const project = dash?.projects.find(p => p.id === activeId) ?? null

  useEffect(() => {
    if (!activeId && dash?.projects?.length) setActiveId(dash.projects[0].id)
  }, [dash, activeId])

  const toggle = (id: string) => setExpanded(s => ({ ...s, [id]: !s[id] }))
  const expandAll = () => { const m: Record<string, boolean> = {}; walk(detail?.wbsTree ?? [], n => { m[n.id] = true }); setExpanded(m) }
  const collapseAll = () => setExpanded({})

  const flatten = useMemo(() => {
    const out: { node: WbsNode; depth: number }[] = []
    const walk2 = (nodes: WbsNode[], depth: number) => {
      for (const n of nodes) {
        out.push({ node: n, depth })
        if (expanded[n.id] && n.children?.length) walk2(n.children, depth + 1)
        else if (!expanded[n.id] && n.children?.length && depth === 0) walk2(n.children, depth + 1) // expand root by default
      }
    }
    if (detail?.wbsTree) walk2(detail.wbsTree as WbsNode[], 0)
    return out
  }, [detail, expanded])

  const rootNodes = detail?.wbsTree ?? []

  if (!dash) return <div className="h-64 animate-pulse bg-muted/40 rounded-xl" />
  void onNavigate

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <Select value={activeId ?? ''} onValueChange={setActiveId}>
                <SelectTrigger className="h-9 w-[280px]"><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>{dash.projects.map(p => <SelectItem key={p.id} value={p.id}>{p.code} — {p.name}</SelectItem>)}</SelectContent>
              </Select>
              {project && <Badge variant="outline" className="text-[10px]">{fmtPct(project.progress)} complete</Badge>}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8" onClick={expandAll}>Expand All</Button>
              <Button variant="outline" size="sm" className="h-8" onClick={collapseAll}>Collapse All</Button>
              <Button variant="outline" size="sm" className="h-8 gap-1.5"><Download className="h-3.5 w-3.5" />Export</Button>
              <Button size="sm" className="h-8 gap-1.5"><Plus className="h-3.5 w-3.5" />Add WBS</Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Work Breakdown Structure</CardTitle><CardDescription className="text-xs">Hierarchical scope decomposition · drag &amp; drop enabled</CardDescription></CardHeader>
        <CardContent className="p-0">
          {!detail ? (
            <div className="h-64 m-4 animate-pulse bg-muted/30 rounded-xl" />
          ) : (
            <div className="max-h-[640px] overflow-auto scroll-thin">
              {/* Header */}
              <div className="grid grid-cols-[minmax(320px,1fr)_90px_90px_120px_120px_120px_100px] gap-2 px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground border-b bg-muted/40 sticky top-0 z-10">
                <span>WBS Code / Name</span><span className="text-right">Weight</span><span className="text-right">Progress</span><span className="text-right">Budget</span><span className="text-right">Actual</span><span>Start</span><span>Finish</span>
              </div>
              <div>
                {flatten.map(({ node, depth }) => {
                  const hasChildren = (node.children?.length ?? 0) > 0
                  const isOpen = expanded[node.id]
                  return (
                    <div key={node.id} className={cn('grid grid-cols-[minmax(320px,1fr)_90px_90px_120px_120px_120px_100px] gap-2 px-4 py-2 items-center border-b border-border/40 hover:bg-muted/30 group', depth === 0 && 'bg-primary/5')}>
                      <div className="flex items-center gap-1.5 min-w-0" style={{ paddingLeft: depth * 20 }}>
                        {hasChildren ? (
                          <button onClick={() => toggle(node.id)} className="grid h-5 w-5 place-items-center rounded hover:bg-muted shrink-0">
                            {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                          </button>
                        ) : (
                          <span className="w-5 shrink-0" />
                        )}
                        {node.isMilestone ? <Milestone className="h-3.5 w-3.5 text-amber-500 shrink-0" /> : <ListTree className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                        <span className="font-mono text-[10px] text-muted-foreground shrink-0">{node.code}</span>
                        <span className="truncate text-xs font-medium">{node.name}</span>
                      </div>
                      <span className="text-right text-[10px] tabular-nums text-muted-foreground">{node.weight.toFixed(0)}%</span>
                      <div className="flex items-center gap-1.5"><Progress value={node.progress} className="h-1.5 flex-1" /><span className="text-[9px] tabular-nums w-7 text-right">{node.progress.toFixed(0)}</span></div>
                      <span className="text-right text-[10px] tabular-nums font-medium">{fmtMoney(node.budget)}</span>
                      <span className="text-right text-[10px] tabular-nums text-amber-700">{fmtMoney(node.actualCost)}</span>
                      <span className="text-[10px] text-muted-foreground">{fmtDate(node.startDate)}</span>
                      <span className="text-[10px] text-muted-foreground">{fmtDate(node.finishDate)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* WBS summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-4"><div className="text-[11px] uppercase text-muted-foreground">WBS Elements</div><div className="text-2xl font-bold">{flatten.length}</div><div className="text-[10px] text-muted-foreground">{rootNodes.length} root nodes</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-[11px] uppercase text-muted-foreground">Max Depth</div><div className="text-2xl font-bold">{Math.max(0, ...flatten.map(f => f.depth)) + 1}</div><div className="text-[10px] text-muted-foreground">levels</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-[11px] uppercase text-muted-foreground">WBS Budget</div><div className="text-2xl font-bold">{fmtMoney(rootNodes.reduce((s, r) => s + (r.budget ?? 0), 0))}</div></CardContent></Card>
      </div>
    </div>
  )
}

function walk(nodes: any[], fn: (n: any) => void) { for (const n of nodes) { fn(n); walk(n.children ?? [], fn) } }
