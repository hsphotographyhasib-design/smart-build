'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Construction, Users, Camera, CloudSun, AlertTriangle, CheckCircle2, HardHat, MapPin, TrendingUp, Download, Image as ImageIcon } from 'lucide-react'
import { fmtDate, fmtNum, statusColor, type View } from '@/lib/eppm'
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { FadeIn } from '../motion'

const CHART = { emerald: 'oklch(0.55 0.12 162)', amber: 'oklch(0.7 0.16 80)', rose: 'oklch(0.6 0.2 25)', sky: 'oklch(0.62 0.1 195)', violet: 'oklch(0.65 0.18 305)', slate: 'oklch(0.55 0.02 250)' }
const PROGRESS_COLORS = [CHART.emerald, CHART.sky, CHART.amber, CHART.rose, CHART.violet, CHART.slate]

interface ReportData {
  reports: any[]
  manpowerTrend: { date: string; manpower: number }[]
  progressCurves: { code: string; name: string; progress: number; curve: { label: string; prog: number }[] }[]
  totals: { reports: number; totalManpowerToday: number; activeSites: number }
}

export function SiteProgressView({ onNavigate }: { onNavigate: (v: View) => void }) {
  const [data, setData] = useState<ReportData | null>(null)
  void onNavigate

  useEffect(() => {
    fetch('/api/daily-reports').then(r => r.json()).then(setData).catch(() => {})
  }, [])

  if (!data) {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">{Array.from({length:4}).map((_,i)=><div key={i} className="h-24 animate-pulse bg-muted/40 rounded-xl" />)}</div>
        <div className="h-80 animate-pulse bg-muted/40 rounded-xl" />
      </div>
    )
  }

  const today = data.reports.filter(r => r.reportDate.slice(0,10) === new Date().toISOString().slice(0,10))
  const recentReports = data.reports.slice(0, 30)

  return (
    <FadeIn>
      <div className="space-y-4">
        {/* KPI strip */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          {[
            { l: 'Active Sites', v: fmtNum(data.totals.activeSites), i: Construction, t: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40' },
            { l: 'Manpower Today', v: fmtNum(data.totals.totalManpowerToday), i: Users, t: 'text-sky-700 bg-sky-50 dark:bg-sky-950/40' },
            { l: 'Reports (14d)', v: fmtNum(data.totals.reports), i: CheckCircle2, t: 'text-amber-700 bg-amber-50 dark:bg-amber-950/40' },
            { l: 'Open Issues', v: fmtNum(data.reports.filter(r => r.delays && r.delays !== 'Nil').length), i: AlertTriangle, t: 'text-rose-700 bg-rose-50 dark:bg-rose-950/40' },
          ].map(s => (
            <Card key={s.l} className="relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/40 to-transparent" />
              <CardContent className="p-4 flex items-center justify-between">
                <div><div className="text-[11px] uppercase text-muted-foreground">{s.l}</div><div className="mt-1 text-2xl font-bold tabular-nums">{s.v}</div></div>
                <div className={`grid h-9 w-9 place-items-center rounded-lg ${s.t}`}><s.i className="h-[18px] w-[18px]" /></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="reports">
          <TabsList>
            <TabsTrigger value="reports">Daily Reports</TabsTrigger>
            <TabsTrigger value="manpower">Manpower Trend</TabsTrigger>
            <TabsTrigger value="curves">Progress Curves</TabsTrigger>
            <TabsTrigger value="gallery">Photo Gallery</TabsTrigger>
          </TabsList>

          {/* Daily Reports feed */}
          <TabsContent value="reports" className="mt-3">
            <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
              <Card>
                <CardHeader className="pb-2 flex-row items-center justify-between">
                  <div><CardTitle className="text-sm">Recent Daily Progress Reports</CardTitle><CardDescription className="text-xs">{recentReports.length} reports across {data.totals.activeSites} active sites</CardDescription></div>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5" asChild>
                    <a href="/api/export?type=projects" download><Download className="h-3.5 w-3.5" />Export</a>
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[560px] px-4 pb-3">
                    <div className="space-y-2.5">
                      {recentReports.map((r, i) => (
                        <div key={r.id} className="rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] text-muted-foreground">{r.project.code}</span>
                                <span className="text-xs font-semibold truncate">{r.project.name}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                                <span className="inline-flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{r.project.location}</span>
                                <span>·</span><span>{fmtDate(r.reportDate)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"><CloudSun className="h-3 w-3" />{r.weather}</span>
                              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"><Users className="h-3 w-3" />{r.manpower}</span>
                            </div>
                          </div>
                          <p className="text-xs text-foreground/80 leading-relaxed">{r.progress}</p>
                          {r.notes && <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">📝 {r.notes}</p>}
                          {r.delays && r.delays !== 'Nil' && (
                            <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                              <AlertTriangle className="h-3 w-3" />{r.delays}
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-border/40">
                            <div className="flex items-center gap-1.5">
                              <Avatar className="h-5 w-5"><AvatarFallback className="text-[8px] bg-primary/10 text-primary">{(r.supervisor ?? 'S').split(' ').map((w:string)=>w[0]).join('').slice(0,2)}</AvatarFallback></Avatar>
                              <span className="text-[10px] text-muted-foreground">{r.supervisor}</span>
                            </div>
                            <Badge variant="outline" className={`text-[9px] ${statusColor(r.project.health)}`}>{r.project.health}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Side: today summary */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Today's Site Status</CardTitle><CardDescription className="text-xs">{fmtDate(new Date().toISOString())}</CardDescription></CardHeader>
                  <CardContent className="space-y-2">
                    {data.reports.slice(0, 8).filter((r,i,a) => a.findIndex(x => x.projectId === r.projectId) === i).slice(0, 6).map((r) => (
                      <div key={r.id} className="flex items-center justify-between text-xs">
                        <div className="min-w-0 flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${r.project.health === 'Green' ? 'bg-emerald-500' : r.project.health === 'Yellow' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                          <span className="font-mono text-[10px] text-muted-foreground">{r.project.code}</span>
                          <span className="truncate">{r.project.name}</span>
                        </div>
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-sky-700"><HardHat className="h-3 w-3" />{r.manpower}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-primary/5 to-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2"><TrendingUp className="h-4 w-4 text-emerald-700" /><span className="text-sm font-semibold">Weekly Productivity</span></div>
                    <div className="text-2xl font-bold">87.3%</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">+2.1% vs last week · planned vs actual</div>
                    <div className="grid grid-cols-7 gap-1 mt-3">
                      {['M','T','W','T','F','S','S'].map((d, i) => (
                        <div key={i} className="text-center">
                          <div className="h-12 flex items-end"><div className="w-full rounded-sm bg-emerald-500/70" style={{ height: `${[88,92,85,90,87,60,45][i]}%` }} /></div>
                          <div className="text-[9px] text-muted-foreground mt-1">{d}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Manpower trend */}
          <TabsContent value="manpower" className="mt-3">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Manpower Trend (14 days)</CardTitle><CardDescription className="text-xs">Total workers deployed across all active sites</CardDescription></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={data.manpowerTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gManpower" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART.sky} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={CHART.sky} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" width={44} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Area type="monotone" dataKey="manpower" name="Workers" stroke={CHART.sky} fill="url(#gManpower)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress S-curves */}
          <TabsContent value="curves" className="mt-3">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Project Progress S-Curves</CardTitle><CardDescription className="text-xs">Cumulative progress (%) over project lifecycle</CardDescription></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={380}>
                  <LineChart data={mergeCurves(data.progressCurves)} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} unit="%" className="text-muted-foreground" width={40} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    {data.progressCurves.slice(0, 6).map((p, i) => (
                      <Line key={p.code} type="monotone" dataKey={p.code} name={p.code} stroke={PROGRESS_COLORS[i % 6]} strokeWidth={2} dot={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Photo gallery (synthetic) */}
          <TabsContent value="gallery" className="mt-3">
            <Card>
              <CardHeader className="pb-2 flex-row items-center justify-between">
                <div><CardTitle className="text-sm">Site Photo Gallery</CardTitle><CardDescription className="text-xs">Latest site progress photos</CardDescription></div>
                <Button variant="outline" size="sm" className="h-8 gap-1.5"><Camera className="h-3.5 w-3.5" />Upload</Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {data.reports.slice(0, 12).map((r, i) => (
                    <div key={r.id} className="group relative aspect-[4/3] rounded-lg overflow-hidden border bg-muted/40 cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-muted to-muted" />
                      <div className="absolute inset-0 grid place-items-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground/40 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <div className="text-[10px] font-mono text-white/90">{r.project.code}</div>
                        <div className="text-[9px] text-white/70 truncate">{fmtDate(r.reportDate)}</div>
                      </div>
                      <div className="absolute top-2 right-2"><Badge variant="secondary" className="text-[8px]">{r.project.health}</Badge></div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-center text-[11px] text-muted-foreground">📷 12 of 1,847 photos · QR-tagged & GPS-stamped</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </FadeIn>
  )
}

function mergeCurves(curves: { code: string; curve: { label: string; prog: number }[] }[]): any[] {
  if (!curves.length) return []
  const labels = curves[0].curve.map(c => c.label)
  return labels.map((label, i) => {
    const row: any = { label }
    for (const c of curves) row[c.code] = c.curve[i]?.prog ?? null
    return row
  })
}
