'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Network } from 'lucide-react'
import { useDashboardData } from '../use-data'
import { fmtMoney, fmtPct, healthColor, type View } from '@/lib/eppm'

export function ProgramsView({ onNavigate }: { onNavigate: (v: View) => void }) {
  const data = useDashboardData()
  if (!data) return <div className="h-64 animate-pulse bg-muted/40 rounded-xl" />
  void onNavigate

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {data.programs.map(pr => {
        const projs = pr.projects ?? []
        const pBudget = projs.reduce((s: number, x: any) => s + x.budget, 0)
        const pActual = projs.reduce((s: number, x: any) => s + x.actualCost, 0)
        const pProg = projs.length ? projs.reduce((s: number, x: any) => s + x.progress, 0) / projs.length : 0
        return (
          <Card key={pr.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary shrink-0"><Network className="h-4.5 w-4.5" /></div>
                  <div className="min-w-0">
                    <CardTitle className="text-sm truncate">{pr.name}</CardTitle>
                    <CardDescription className="text-[11px]">{pr.code} · {projs.length} projects</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className={`text-[10px] shrink-0 ${healthColor(pr.health)}`}>{pr.health}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><div className="text-[10px] uppercase text-muted-foreground">Budget</div><div className="font-bold tabular-nums">{fmtMoney(pBudget)}</div></div>
                <div><div className="text-[10px] uppercase text-muted-foreground">Spend</div><div className="font-bold tabular-nums text-amber-700">{fmtMoney(pActual)}</div></div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1"><span>Program progress</span><span>{fmtPct(pProg)}</span></div>
                <Progress value={pProg} className="h-1.5" />
              </div>
              <div className="space-y-1 pt-1 border-t">
                {projs.slice(0, 4).map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between text-[11px]">
                    <span className="truncate font-mono text-muted-foreground">{p.code}</span>
                    <span className="truncate ml-2">{p.name}</span>
                    <Badge variant="outline" className={`text-[9px] ml-2 ${healthColor(p.health)}`}>{p.progress.toFixed(0)}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
