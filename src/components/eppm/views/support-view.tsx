'use client'

// Support — knowledge base + internal support tickets with a status workflow.
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, LifeBuoy, BookOpenCheck, PlayCircle, CheckCircle2, FileText, Eye, Clock } from 'lucide-react'
import { type View } from '@/lib/eppm'
import { cn } from '@/lib/utils'
import { FadeIn } from '../motion'

interface Article {
  id: string; title: string; category: string; updated: string; views: number; mins: number
}
type TicketStatus = 'Open' | 'In Progress' | 'Resolved'
interface Ticket {
  id: string; subject: string; requester: string; module: string
  priority: 'High' | 'Medium' | 'Low'; raised: string; status: TicketStatus
}

const ARTICLES: Article[] = [
  { id: 'KB-101', title: 'Getting started with HJSB EPPM', category: 'Basics', updated: '12 Jun 2026', views: 482, mins: 6 },
  { id: 'KB-114', title: 'Creating and dispatching a work order', category: 'Maintenance', updated: '28 Jun 2026', views: 391, mins: 4 },
  { id: 'KB-108', title: 'Raising a purchase request and approval flow', category: 'Procurement', updated: '20 Jun 2026', views: 344, mins: 5 },
  { id: 'KB-121', title: 'Reading the Gantt schedule and critical path', category: 'Scheduling', updated: '30 Jun 2026', views: 297, mins: 8 },
  { id: 'KB-117', title: 'QR asset scanning from a mobile device', category: 'Assets', updated: '25 Jun 2026', views: 231, mins: 3 },
  { id: 'KB-105', title: 'Roles & permissions explained', category: 'Administration', updated: '15 Jun 2026', views: 208, mins: 7 },
]

const SEED_TICKETS: Ticket[] = [
  { id: 'TCK-0451', subject: 'Cannot export Gantt to PDF', requester: 'Lim Wei Ming', module: 'Scheduling', priority: 'Medium', raised: '02 Jul 2026', status: 'Open' },
  { id: 'TCK-0450', subject: 'Technician login OTP not arriving', requester: 'Kumar Selvam', module: 'Authentication', priority: 'High', raised: '02 Jul 2026', status: 'In Progress' },
  { id: 'TCK-0448', subject: 'Request: add Fire Protection trade to filters', requester: 'Siti Aminah', module: 'Maintenance', priority: 'Low', raised: '30 Jun 2026', status: 'Open' },
  { id: 'TCK-0445', subject: 'Dashboard KPI mismatch vs report pack', requester: 'Finance Team', module: 'Reports', priority: 'Medium', raised: '28 Jun 2026', status: 'Resolved' },
]

export type SupportFocus = 'docs' | 'tickets'

export default function SupportView({ focus = 'docs' }: { onNavigate?: (v: View) => void; focus?: SupportFocus }) {
  const [tab, setTab] = useState<string>(focus)
  const [tickets, setTickets] = useState(SEED_TICKETS)
  const [search, setSearch] = useState('')

  useEffect(() => { setTab(focus) }, [focus])

  const advance = (id: string) =>
    setTickets((prev) => prev.map((t) => {
      if (t.id !== id) return t
      const next: Record<TicketStatus, TicketStatus> = { Open: 'In Progress', 'In Progress': 'Resolved', Resolved: 'Resolved' }
      return { ...t, status: next[t.status] }
    }))

  const q = search.toLowerCase()
  const fArticles = ARTICLES.filter((a) => !q || [a.title, a.category].join(' ').toLowerCase().includes(q))
  const openTickets = tickets.filter((t) => t.status !== 'Resolved').length

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><LifeBuoy className="h-6 w-6 text-primary" /> Help & Support</h1>
            <p className="text-sm text-muted-foreground">Knowledge base guides and internal support tickets</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'KB Articles', value: ARTICLES.length, icon: BookOpenCheck, tone: 'text-sky-700' },
            { label: 'Open Tickets', value: openTickets, icon: LifeBuoy, tone: 'text-amber-700' },
            { label: 'Resolved (30d)', value: tickets.filter((t) => t.status === 'Resolved').length, icon: CheckCircle2, tone: 'text-emerald-700' },
            { label: 'Avg First Response', value: '2.4h', icon: Clock, tone: 'text-violet-600' },
          ].map((k) => (
            <Card key={k.label}><CardContent className="flex items-center gap-3 p-4">
              <k.icon className={cn('h-8 w-8 shrink-0 rounded-lg bg-muted p-1.5', k.tone)} />
              <div><div className="text-xl font-bold leading-none">{k.value}</div><div className="mt-1 text-[11px] text-muted-foreground">{k.label}</div></div>
            </CardContent></Card>
          ))}
        </div>
      </FadeIn>

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="docs"><BookOpenCheck className="mr-1.5 h-3.5 w-3.5" />Documentation</TabsTrigger>
          <TabsTrigger value="tickets"><LifeBuoy className="mr-1.5 h-3.5 w-3.5" />Support Tickets
            {openTickets > 0 && <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">{openTickets}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="docs">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {fArticles.map((a) => (
              <Card key={a.id} className="transition-colors hover:border-primary/40">
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <Badge variant="outline" className="font-normal">{a.category}</Badge>
                    <span className="text-[10px] text-muted-foreground">{a.mins} min read</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="text-sm font-medium leading-snug">{a.title}</div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Updated {a.updated}</span>
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{a.views}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tickets">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Support Tickets</CardTitle><CardDescription>Open → In Progress → Resolved</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Ticket</TableHead><TableHead>Subject</TableHead>
                  <TableHead className="hidden md:table-cell">Requester</TableHead>
                  <TableHead className="hidden sm:table-cell">Module</TableHead>
                  <TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Workflow</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {tickets.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs">{t.id}<div className="text-[10px] text-muted-foreground">{t.raised}</div></TableCell>
                      <TableCell className="text-sm font-medium">{t.subject}</TableCell>
                      <TableCell className="hidden text-sm md:table-cell">{t.requester}</TableCell>
                      <TableCell className="hidden sm:table-cell"><Badge variant="outline" className="font-normal">{t.module}</Badge></TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          t.priority === 'High' ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-400'
                          : t.priority === 'Medium' ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-400'
                          : 'border-border bg-muted text-muted-foreground'
                        }>{t.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          t.status === 'Resolved' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400'
                          : t.status === 'In Progress' ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-400'
                          : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-400'
                        }>{t.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {t.status !== 'Resolved' && (
                          <Button size="sm" variant={t.status === 'In Progress' ? 'default' : 'outline'} onClick={() => advance(t.id)}>
                            {t.status === 'Open' ? <><PlayCircle className="mr-1 h-3.5 w-3.5" />Start</> : <><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Resolve</>}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
