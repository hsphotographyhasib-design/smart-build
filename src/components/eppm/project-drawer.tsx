'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { CalendarRange, DollarSign, TrendingUp, AlertTriangle, Users, MapPin, Building2, GitBranch, Activity as ActivityIcon, Clock, Target, ArrowRight, Download } from 'lucide-react'
import { fmtMoney, fmtPct, fmtDate, fmtNum, healthColor, statusColor, exportCsv, type View } from '@/lib/eppm'
import { useProjectDetail } from './use-data'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts'
import { motion } from 'framer-motion'

const CHART = { emerald: 'oklch(0.55 0.12 162)', amber: 'oklch(0.7 0.16 80)', rose: 'oklch(0.6 0.2 25)', sky: 'oklch(0.62 0.1 195)', violet: 'oklch(0.65 0.18 305)', slate: 'oklch(0.55 0.02 250)' }

interface ProjectLite {
  id: string; code: string; name: string; status: string; health: string
  category?: string | null; priority: string; budget: number; actualCost: number
  committedCost: number; forecastCost: number; revenue: number; progress: number
  startDate?: string | null; finishDate?: string | null; baselineStart?: string | null
  baselineFinish?: string | null; managerId?: string | null; client?: string | null; location?: string | null
}

export function ProjectDrawer({
  project, open, onOpenChange, onNavigate,
}: {
  project: ProjectLite | null
  open: boolean
  onOpenChange: (v: boolean) => void
  onNavigate: (v: View) => void
}) {
  const detail = useProjectDetail(open && project ? project.id : null)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[640px] lg:max-w-[760px] p-0 flex flex-col">
        {project && (
          <>
            {/* Header */}
            <SheetHeader className="px-5 pt-5 pb-3 border-b shrink-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="font-mono text-[10px]">{project.code}</Badge>
                    <Badge variant="outline" className={`text-[10px] ${statusColor(project.status)}`}>{project.status}</Badge>
                    <Badge variant="outline" className={`text-[10px] ${healthColor(project.health)}`}>{project.health}</Badge>
                    {project.priority === 'Critical' && <Badge variant="outline" className="text-[10px] border-rose-300 text-rose-700">Critical Priority</Badge>}
                  </div>
                  <SheetTitle className="text-base mt-1.5 leading-snug">{project.name}</SheetTitle>
                  <SheetDescription className="text-xs flex items-center gap-3 mt-1 flex-wrap">
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{project.location || '—'}</span>
                    <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" />{project.client || '—'}</span>
                    <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{project.managerId || 'Unassigned'}</span>
                  </SheetDescription>
                </div>
              </div>
              {/* Mini KPI row */}
              <div className="grid grid-cols-4 gap-2 mt-3">
                {[
                  { l: 'Progress', v: fmtPct(project.progress), tone: 'text-emerald-700' },
                  { l: 'Budget', v: fmtMoney(project.budget), tone: 'text-foreground' },
                  { l: 'Spend', v: fmtMoney(project.actualCost), tone: 'text-amber-700' },
                  { l: 'Forecast', v: fmtMoney(project.forecastCost), tone: 'text-rose-700' },
                ].map(k => (
                  <div key={k.l} className="rounded-lg bg-muted/50 px-2.5 py-1.5">
                    <div className="text-[9px] uppercase text-muted-foreground">{k.l}</div>
                    <div className={`text-sm font-bold tabular-nums ${k.tone}`}>{k.v}</div>
                  </div>
                ))}
              </div>
            </SheetHeader>

            {/* Tabs */}
            <div className="flex-1 min-h-0 flex flex-col">
              <Tabs defaultValue="overview" className="flex-1 min-h-0 flex flex-col">
                <div className="px-5 pt-3 shrink-0">
                  <TabsList className="grid w-full grid-cols-5 h-9">
                    <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                    <TabsTrigger value="schedule" className="text-xs">Schedule</TabsTrigger>
                    <TabsTrigger value="cost" className="text-xs">Cost & EVM</TabsTrigger>
                    <TabsTrigger value="risk" className="text-xs">Risks</TabsTrigger>
                    <TabsTrigger value="team" className="text-xs">Team</TabsTrigger>
                  </TabsList>
                </div>

                <ScrollArea className="flex-1 min-h-0">
                  <div className="p-5">
                    {/* OVERVIEW */}
                    <TabsContent value="overview" className="mt-0 space-y-4">
                      <motion.div initial={{opacity:0, y:8}} animate={{opacity:1,y:0}} transition={{duration:0.25}} className="space-y-3">
                        <div className="rounded-lg border p-3">
                          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Schedule Snapshot</div>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div><div className="text-[10px] text-muted-foreground">Start</div><div className="font-medium">{fmtDate(project.startDate)}</div></div>
                            <div><div className="text-[10px] text-muted-foreground">Finish</div><div className="font-medium">{fmtDate(project.finishDate)}</div></div>
                            <div><div className="text-[10px] text-muted-foreground">Baseline Start</div><div className="font-medium">{fmtDate(project.baselineStart)}</div></div>
                            <div><div className="text-[10px] text-muted-foreground">Baseline Finish</div><div className="font-medium">{fmtDate(project.baselineFinish)}</div></div>
                          </div>
                          {project.baselineFinish && project.finishDate && (
                            <div className="mt-2 pt-2 border-t flex items-center justify-between text-[11px]">
                              <span className="text-muted-foreground">Finish variance</span>
                              {(() => {
                                const slip = Math.round((+new Date(project.finishDate) - +new Date(project.baselineFinish)) / 86400000)
                                return <Badge variant="outline" className={slip > 0 ? 'text-rose-700 border-rose-200' : 'text-emerald-700 border-emerald-200'}>{slip > 0 ? '+' : ''}{slip}d</Badge>
                              })()}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5"><span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Overall Progress</span><span className="text-sm font-bold">{fmtPct(project.progress)}</span></div>
                          <Progress value={project.progress} className="h-2.5" />
                          <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span></div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-lg border p-3">
                            <div className="flex items-center gap-1.5 text-[10px] uppercase text-muted-foreground mb-1"><DollarSign className="h-3 w-3" />Budget Health</div>
                            <div className="text-lg font-bold">{fmtPct(project.budget ? (project.actualCost / project.budget) * 100 : 0)}</div>
                            <div className="text-[10px] text-muted-foreground">spent of {fmtMoney(project.budget)}</div>
                            <Progress value={project.budget ? (project.actualCost / project.budget) * 100 : 0} className="h-1.5 mt-1.5" />
                          </div>
                          <div className="rounded-lg border p-3">
                            <div className="flex items-center gap-1.5 text-[10px] uppercase text-muted-foreground mb-1"><Target className="h-3 w-3" />Margin Forecast</div>
                            <div className="text-lg font-bold text-emerald-700">{fmtMoney(project.revenue - project.forecastCost)}</div>
                            <div className="text-[10px] text-muted-foreground">{project.revenue ? (((project.revenue - project.forecastCost) / project.revenue) * 100).toFixed(1) : 0}% margin</div>
                          </div>
                        </div>
                      </motion.div>
                    </TabsContent>

                    {/* SCHEDULE */}
                    <TabsContent value="schedule" className="mt-0 space-y-4">
                      <motion.div initial={{opacity:0, y:8}} animate={{opacity:1,y:0}} transition={{duration:0.25} as any} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Activities</div>
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { onOpenChange(false); onNavigate('gantt') }}>Open Gantt <ArrowRight className="h-3 w-3" /></Button>
                        </div>
                        {!detail ? <div className="h-24 animate-pulse bg-muted/40 rounded-lg" /> : (
                          <>
                            <div className="grid grid-cols-3 gap-2">
                              <Stat l="Total" v={fmtNum(detail.activities.length)} icon={ActivityIcon} />
                              <Stat l="Critical" v={fmtNum(detail.activities.filter((a:any)=>a.isCritical).length)} icon={GitBranch} tone="text-rose-700" />
                              <Stat l="In Progress" v={fmtNum(detail.activities.filter((a:any)=>a.status==='In Progress').length)} icon={Clock} tone="text-sky-700" />
                            </div>
                            <div className="rounded-lg border">
                              <div className="max-h-[280px] overflow-auto scroll-thin">
                                <table className="w-full text-xs">
                                  <thead className="sticky top-0 bg-muted/60 backdrop-blur"><tr className="text-left text-[10px] uppercase text-muted-foreground">
                                    <th className="px-2.5 py-1.5 font-medium">ID</th><th className="px-2.5 py-1.5 font-medium">Activity</th><th className="px-2.5 py-1.5 font-medium text-right">Dur</th><th className="px-2.5 py-1.5 font-medium text-right">%</th>
                                  </tr></thead>
                                  <tbody>
                                    {detail.activities.slice(0, 40).map((a:any) => (
                                      <tr key={a.id} className={`border-t hover:bg-muted/30 ${a.isCritical ? 'bg-rose-50/30 dark:bg-rose-950/10' : ''}`}>
                                        <td className="px-2.5 py-1.5 font-mono text-[10px] text-muted-foreground">{a.activityId}</td>
                                        <td className="px-2.5 py-1.5 truncate max-w-[200px]">{a.name}</td>
                                        <td className="px-2.5 py-1.5 text-right tabular-nums text-[10px]">{a.duration}d</td>
                                        <td className="px-2.5 py-1.5 text-right tabular-nums text-[10px] font-medium">{a.progress.toFixed(0)}%</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </>
                        )}
                      </motion.div>
                    </TabsContent>

                    {/* COST & EVM */}
                    <TabsContent value="cost" className="mt-0 space-y-4">
                      <motion.div initial={{opacity:0, y:8}} animate={{opacity:1,y:0}} transition={{duration:0.25} as any} className="space-y-3">
                        {!detail ? <div className="h-40 animate-pulse bg-muted/40 rounded-lg" /> : (
                          <>
                            <div className="grid grid-cols-4 gap-2">
                              <EvmStat l="PV" v={fmtMoney(detail.evm.PV)} />
                              <EvmStat l="EV" v={fmtMoney(detail.evm.EV)} tone="text-emerald-700" />
                              <EvmStat l="AC" v={fmtMoney(detail.evm.AC)} tone="text-amber-700" />
                              <EvmStat l="EAC" v={fmtMoney(detail.evm.EAC)} tone="text-rose-700" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="rounded-lg border p-3">
                                <div className="text-[10px] uppercase text-muted-foreground mb-1">CPI (Cost Performance)</div>
                                <div className="flex items-baseline gap-2"><span className={`text-2xl font-bold ${detail.evm.CPI >= 1 ? 'text-emerald-700' : detail.evm.CPI >= 0.9 ? 'text-amber-700' : 'text-rose-700'}`}>{detail.evm.CPI.toFixed(2)}</span><span className="text-[10px] text-muted-foreground">{detail.evm.CPI >= 1 ? 'under budget' : 'over budget'}</span></div>
                                <Progress value={Math.min(100, detail.evm.CPI * 50)} className="h-1.5 mt-1.5" />
                              </div>
                              <div className="rounded-lg border p-3">
                                <div className="text-[10px] uppercase text-muted-foreground mb-1">SPI (Schedule Performance)</div>
                                <div className="flex items-baseline gap-2"><span className={`text-2xl font-bold ${detail.evm.SPI >= 1 ? 'text-emerald-700' : detail.evm.SPI >= 0.9 ? 'text-amber-700' : 'text-rose-700'}`}>{detail.evm.SPI.toFixed(2)}</span><span className="text-[10px] text-muted-foreground">{detail.evm.SPI >= 1 ? 'ahead' : 'behind'}</span></div>
                                <Progress value={Math.min(100, detail.evm.SPI * 50)} className="h-1.5 mt-1.5" />
                              </div>
                            </div>
                            <div className="rounded-lg border p-3">
                              <div className="text-[10px] uppercase text-muted-foreground mb-2">S-Curve (PV vs EV vs AC)</div>
                              <ResponsiveContainer width="100%" height={180}>
                                <AreaChart data={detail.sCurve} margin={{top:4,right:4,left:0,bottom:0}}>
                                  <defs>
                                    <linearGradient id="dPV" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={CHART.slate} stopOpacity={0.3}/><stop offset="95%" stopColor={CHART.slate} stopOpacity={0}/></linearGradient>
                                    <linearGradient id="dEV" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={CHART.emerald} stopOpacity={0.4}/><stop offset="95%" stopColor={CHART.emerald} stopOpacity={0}/></linearGradient>
                                    <linearGradient id="dAC" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={CHART.amber} stopOpacity={0.4}/><stop offset="95%" stopColor={CHART.amber} stopOpacity={0}/></linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false}/>
                                  <XAxis dataKey="label" tick={{fontSize:9}} interval="preserveStartEnd" minTickGap={30} className="text-muted-foreground"/>
                                  <YAxis tick={{fontSize:9}} tickFormatter={(v)=>fmtMoney(v)} width={42} className="text-muted-foreground"/>
                                  <Tooltip contentStyle={{fontSize:10, borderRadius:8}} formatter={(v:any)=>fmtMoney(v,false)}/>
                                  <Area type="monotone" dataKey="planned" name="PV" stroke={CHART.slate} fill="url(#dPV)" strokeWidth={1.5}/>
                                  <Area type="monotone" dataKey="earned" name="EV" stroke={CHART.emerald} fill="url(#dEV)" strokeWidth={1.5}/>
                                  <Area type="monotone" dataKey="actual" name="AC" stroke={CHART.amber} fill="url(#dAC)" strokeWidth={1.5}/>
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                            <Button variant="outline" size="sm" className="w-full h-8 gap-1.5" onClick={() => exportCsv('activities', project.id)}><Download className="h-3.5 w-3.5" />Export Activities (CSV)</Button>
                          </>
                        )}
                      </motion.div>
                    </TabsContent>

                    {/* RISK */}
                    <TabsContent value="risk" className="mt-0 space-y-4">
                      <motion.div initial={{opacity:0, y:8}} animate={{opacity:1,y:0}} transition={{duration:0.25} as any} className="space-y-3">
                        {!detail ? <div className="h-24 animate-pulse bg-muted/40 rounded-lg" /> : (
                          <>
                            <div className="flex items-center justify-between">
                              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Risk Register</div>
                              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { onOpenChange(false); onNavigate('risks') }}>Full Register <ArrowRight className="h-3 w-3" /></Button>
                            </div>
                            {detail.project.risks?.length ? (
                              <div className="space-y-2">
                                {detail.project.risks.map((r:any) => {
                                  const score = r.probability * r.impact
                                  return (
                                    <div key={r.id} className="rounded-lg border p-2.5">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-center gap-1.5"><span className="font-mono text-[9px] text-muted-foreground">{r.code}</span><Badge variant="outline" className={`text-[8px] ${statusColor(r.status)}`}>{r.status}</Badge></div>
                                          <div className="text-xs font-medium mt-0.5">{r.title}</div>
                                        </div>
                                        <Badge variant="outline" className={`text-[9px] shrink-0 ${score >= 15 ? 'border-rose-300 text-rose-700' : score >= 9 ? 'border-amber-300 text-amber-700' : 'border-emerald-300 text-emerald-700'}`}>{score}</Badge>
                                      </div>
                                      {r.mitigation && <div className="text-[10px] text-muted-foreground mt-1">{r.mitigation}</div>}
                                    </div>
                                  )
                                })}
                              </div>
                            ) : <div className="text-center py-8 text-xs text-muted-foreground">No risks registered for this project</div>}
                          </>
                        )}
                      </motion.div>
                    </TabsContent>

                    {/* TEAM */}
                    <TabsContent value="team" className="mt-0 space-y-4">
                      <motion.div initial={{opacity:0, y:8}} animate={{opacity:1,y:0}} transition={{duration:0.25} as any} className="space-y-3">
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Project Team</div>
                        <div className="space-y-2">
                          {[
                            { role: 'Project Manager', name: project.managerId || 'Unassigned', initials: (project.managerId||'PM').split(' ').map(w=>w[0]).join('').slice(0,2), tone: 'bg-primary text-primary-foreground' },
                            { role: 'Planning Manager', name: 'Raj Patel', initials: 'RP', tone: 'bg-emerald-500 text-white' },
                            { role: 'Project Controls', name: 'Ahmed Hassan', initials: 'AH', tone: 'bg-amber-500 text-white' },
                            { role: 'Site Engineer', name: 'Tom Wilson', initials: 'TW', tone: 'bg-sky-500 text-white' },
                            { role: 'Quantity Surveyor', name: 'Lisa Brown', initials: 'LB', tone: 'bg-violet-500 text-white' },
                          ].map(m => (
                            <div key={m.role} className="flex items-center gap-3 rounded-lg border p-2.5">
                              <div className={`grid h-9 w-9 place-items-center rounded-full text-xs font-bold ${m.tone}`}>{m.initials}</div>
                              <div className="min-w-0 flex-1"><div className="text-xs font-medium">{m.name}</div><div className="text-[10px] text-muted-foreground">{m.role}</div></div>
                              <Badge variant="outline" className="text-[9px]">Active</Badge>
                            </div>
                          ))}
                        </div>
                        <Separator />
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Key Milestones</div>
                        {!detail ? <div className="h-16 animate-pulse bg-muted/40 rounded-lg" /> : (
                          <div className="space-y-1.5">
                            {detail.activities.filter((a:any)=>a.type?.includes('Milestone')).slice(0, 5).map((m:any) => (
                              <div key={m.id} className="flex items-center gap-2 text-xs">
                                <div className={`h-2.5 w-2.5 rotate-45 ${m.progress >= 100 ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                                <span className="flex-1 truncate">{m.name}</span>
                                <span className="text-[10px] text-muted-foreground">{fmtDate(m.startDate)}</span>
                              </div>
                            ))}
                            {detail.activities.filter((a:any)=>a.type?.includes('Milestone')).length === 0 && <div className="text-xs text-muted-foreground">No milestones</div>}
                          </div>
                        )}
                      </motion.div>
                    </TabsContent>
                  </div>
                </ScrollArea>
              </Tabs>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function Stat({ l, v, icon: Icon, tone = 'text-foreground' }: { l: string; v: string; icon: any; tone?: string }) {
  return (
    <div className="rounded-lg border p-2.5">
      <div className="flex items-center gap-1 text-[9px] uppercase text-muted-foreground"><Icon className="h-2.5 w-2.5" />{l}</div>
      <div className={`text-base font-bold tabular-nums ${tone}`}>{v}</div>
    </div>
  )
}

function EvmStat({ l, v, tone = 'text-foreground' }: { l: string; v: string; tone?: string }) {
  return (
    <div className="rounded-lg bg-muted/50 px-2.5 py-2 text-center">
      <div className="text-[9px] uppercase text-muted-foreground">{l}</div>
      <div className={`text-sm font-bold tabular-nums ${tone}`}>{v}</div>
    </div>
  )
}
