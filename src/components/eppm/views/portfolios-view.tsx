'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Building2, FolderKanban, ArrowRight, Users, DollarSign, Activity } from 'lucide-react'
import { useDashboardData } from '../use-data'
import { fmtMoney, fmtPct, healthColor, statusColor, type View, type ProjectLite } from '@/lib/eppm'
import { ProjectDrawer } from '../project-drawer'

export function PortfoliosView({ onNavigate }: { onNavigate: (v: View) => void }) {
  const data = useDashboardData()
  const [drawerProject, setDrawerProject] = useState<ProjectLite | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  if (!data) return <div className="h-64 animate-pulse bg-muted/40 rounded-xl" />

  const totalBudget = data.portfolios.reduce((s, p) => s + (p.projects ?? []).reduce((a: number, x: any) => a + x.budget, 0), 0)
  const totalActual = data.portfolios.reduce((s, p) => s + (p.projects ?? []).reduce((a: number, x: any) => a + x.actualCost, 0), 0)

  return (
    <div className="space-y-4">
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 text-[11px] uppercase text-muted-foreground"><FolderKanban className="h-3.5 w-3.5" /> Portfolios</div>
          <div className="mt-1 text-2xl font-bold">{data.portfolios.length}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 text-[11px] uppercase text-muted-foreground"><DollarSign className="h-3.5 w-3.5" /> Total Investment</div>
          <div className="mt-1 text-2xl font-bold">{fmtMoney(totalBudget)}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 text-[11px] uppercase text-muted-foreground"><Activity className="h-3.5 w-3.5" /> Spend to Date</div>
          <div className="mt-1 text-2xl font-bold text-amber-700">{fmtMoney(totalActual)}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 text-[11px] uppercase text-muted-foreground"><Users className="h-3.5 w-3.5" /> Active Projects</div>
          <div className="mt-1 text-2xl font-bold">{data.projects.length}</div>
        </CardContent></Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.portfolios.map(p => {
          const projs = p.projects ?? []
          const pBudget = projs.reduce((s: number, x: any) => s + x.budget, 0)
          const pActual = projs.reduce((s: number, x: any) => s + x.actualCost, 0)
          const pProg = projs.length ? projs.reduce((s: number, x: any) => s + x.progress, 0) / projs.length : 0
          const green = projs.filter((x: any) => x.health === 'Green').length
          const yellow = projs.filter((x: any) => x.health === 'Yellow').length
          const red = projs.filter((x: any) => x.health === 'Red').length
          const spendRatio = pBudget ? (pActual / pBudget) * 100 : 0
          return (
            <Card key={p.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`h-1 ${p.health === 'Green' ? 'bg-emerald-500' : p.health === 'Yellow' ? 'bg-amber-500' : 'bg-rose-500'}`} />
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary shrink-0"><Building2 className="h-4.5 w-4.5" /></div>
                    <div className="min-w-0">
                      <CardTitle className="text-sm truncate">{p.name}</CardTitle>
                      <CardDescription className="text-[11px]">{p.businessUnit} · {p.client}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] shrink-0 ${healthColor(p.health)}`}>{p.health}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-muted-foreground">Budget utilisation</span>
                    <span className="font-medium tabular-nums">{fmtMoney(pActual)} / {fmtMoney(pBudget)}</span>
                  </div>
                  <Progress value={spendRatio} className="h-2" />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>{spendRatio.toFixed(0)}% spent</span>
                    <span>{fmtPct(pProg)} progress</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-md bg-muted/40 p-2 text-center">
                    <div className="text-base font-bold text-emerald-700">{green}</div>
                    <div className="text-[9px] uppercase text-muted-foreground">Green</div>
                  </div>
                  <div className="rounded-md bg-muted/40 p-2 text-center">
                    <div className="text-base font-bold text-amber-700">{yellow}</div>
                    <div className="text-[9px] uppercase text-muted-foreground">Yellow</div>
                  </div>
                  <div className="rounded-md bg-muted/40 p-2 text-center">
                    <div className="text-base font-bold text-rose-700">{red}</div>
                    <div className="text-[9px] uppercase text-muted-foreground">Red</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t">
                  <span>{projs.length} projects · {(p.programs ?? []).length} programs</span>
                  <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => onNavigate('projects')}>Open <ArrowRight className="h-3 w-3" /></Button>
                </div>
                {/* Project list */}
                <div className="space-y-1 mt-1">
                  {projs.slice(0, 4).map((pj: any) => (
                    <button
                      key={pj.id}
                      onClick={() => { setDrawerProject(pj as ProjectLite); setDrawerOpen(true) }}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted/50 transition-colors group"
                    >
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${pj.health === 'Green' ? 'bg-emerald-500' : pj.health === 'Yellow' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                      <span className="font-mono text-[9px] text-muted-foreground shrink-0 w-16 truncate">{pj.code}</span>
                      <span className="text-[11px] truncate flex-1 group-hover:text-primary">{pj.name}</span>
                      <span className="text-[10px] tabular-nums text-muted-foreground shrink-0">{pj.progress.toFixed(0)}%</span>
                    </button>
                  ))}
                  {projs.length > 4 && <div className="text-[10px] text-muted-foreground text-center pt-0.5">+{projs.length - 4} more</div>}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      <ProjectDrawer
        project={drawerProject}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onNavigate={onNavigate}
      />
    </div>
  )
}
