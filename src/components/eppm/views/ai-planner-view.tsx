'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sparkles, Send, Loader2, Bot, User, Zap, TrendingUp, AlertTriangle, GitBranch } from 'lucide-react'
import { useDashboardData } from '../use-data'
import { type View } from '@/lib/eppm'

const SUGGESTIONS = [
  'Analyse the critical path and forecast likely slippage',
  'Which 3 activities are most at risk of delay this month?',
  'Recommend a resource leveling strategy for over-allocated crews',
  'Forecast final cost vs budget and explain the variance drivers',
  'Identify the highest-impact risks and propose mitigations',
  'Generate a recovery schedule for the Solar Farm project',
]

export function AiPlannerView({ onNavigate }: { onNavigate: (v: View) => void }) {
  const dash = useDashboardData()
  const [projectId, setProjectId] = useState<string>('portfolio')
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  const ask = async (prompt: string) => {
    if (!prompt.trim() || loading) return
    setMessages(m => [...m, { role: 'user', content: prompt }])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/ai-planner', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, projectId: projectId === 'portfolio' ? undefined : projectId }),
      })
      const data = await res.json()
      setMessages(m => [...m, { role: 'ai', content: data.content }])
    } catch {
      setMessages(m => [...m, { role: 'ai', content: 'Sorry, I could not reach the planning engine. Please retry.' }])
    } finally {
      setLoading(false)
    }
  }

  void onNavigate

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      {/* Chat panel */}
      <Card className="flex flex-col h-[calc(100vh-220px)] min-h-[500px]">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground"><Sparkles className="h-4.5 w-4.5" /></div>
              <div>
                <CardTitle className="text-sm">HJSB AI Planner</CardTitle>
                <CardDescription className="text-xs">Primavera-grade schedule intelligence</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px] gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />Online</Badge>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="h-8 w-[200px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="portfolio">Portfolio-wide</SelectItem>
                  {dash?.projects.map(p => <SelectItem key={p.id} value={p.id}>{p.code}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-thin p-4 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary mb-4"><Sparkles className="h-8 w-8" /></div>
              <h3 className="text-lg font-bold">Project Controls Copilot</h3>
              <p className="text-sm text-muted-foreground max-w-md mt-1">Ask me to analyse your schedule, predict delays, optimise resources, forecast costs, or draft a recovery plan. I have live access to your portfolio data.</p>
              <div className="grid sm:grid-cols-2 gap-2 mt-6 w-full max-w-xl">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => ask(s)} className="text-left rounded-lg border p-3 text-xs hover:bg-muted/50 hover:border-primary/40 transition-colors">
                    <Zap className="h-3.5 w-3.5 text-primary inline mr-1.5" />{s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${m.role === 'user' ? 'bg-muted text-foreground' : 'bg-primary text-primary-foreground'}`}>
                {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_li]:my-0.5 [&_strong]:font-semibold [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_code]:text-xs [&_pre]:text-xs [&_table]:text-xs" dangerouslySetInnerHTML={{ __html: renderMd(m.content) }} />
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground"><Bot className="h-4 w-4" /></div>
              <div className="rounded-xl bg-muted px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Analysing portfolio data…
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-3">
          <form onSubmit={(e) => { e.preventDefault(); ask(input) }} className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask the AI planner anything about your portfolio…"
              className="flex-1 rounded-lg border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button type="submit" disabled={loading || !input.trim()} className="gap-1.5"><Send className="h-4 w-4" /></Button>
          </form>
        </div>
      </Card>

      {/* Side panel: capabilities */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">AI Capabilities</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[
              { icon: GitBranch, title: 'Schedule Optimiser', desc: 'Re-sequencing & float analysis', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40' },
              { icon: AlertTriangle, title: 'Delay Prediction', desc: 'Early warning on slipping tasks', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
              { icon: TrendingUp, title: 'Cost Forecast', desc: 'EAC & cash-flow projection', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
              { icon: Zap, title: 'Resource Optimisation', desc: 'Leveling & crew balancing', color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40' },
              { icon: Sparkles, title: 'Auto Recovery Plan', desc: 'Generate crash/recovery schedules', color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/40' },
            ].map(c => (
              <div key={c.title} className="flex items-center gap-2.5 rounded-lg border p-2.5">
                <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-md ${c.color}`}><c.icon className="h-4 w-4" /></div>
                <div className="min-w-0"><div className="text-xs font-semibold truncate">{c.title}</div><div className="text-[10px] text-muted-foreground truncate">{c.desc}</div></div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Live Context</CardTitle></CardHeader>
          <CardContent className="text-xs space-y-1.5">
            {dash ? <>
              <div className="flex justify-between"><span className="text-muted-foreground">Projects</span><span className="font-semibold">{dash.kpis.projects}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Activities</span><span className="font-semibold">{dash.kpis.activities}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Critical path</span><span className="font-semibold text-rose-600">{dash.kpis.criticalActivities}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Open risks</span><span className="font-semibold text-amber-600">{dash.kpis.openRisks}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Portfolio budget</span><span className="font-semibold">${(dash.kpis.totalBudget/1e6).toFixed(0)}M</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Avg progress</span><span className="font-semibold">{dash.kpis.avgProgress.toFixed(1)}%</span></div>
            </> : <div className="text-muted-foreground">Loading…</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function renderMd(md: string): string {
  return md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^[-*] (.*)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/^(?!<[hul])(.+)$/gm, '<p>$1</p>')
    .replace(/<p><h/g, '<h').replace(/<\/h(\d)><\/p>/g, '</h$1>')
    .replace(/<p><ul>/g, '<ul>').replace(/<\/ul><\/p>/g, '</ul>')
}
