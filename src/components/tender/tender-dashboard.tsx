'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAppStore, api } from '@/lib/store'
import { useFormat } from '@/hooks/use-format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Briefcase, DollarSign, FileText, Users, Clock, CheckCircle,
  TrendingUp, TrendingDown, Minus, ArrowUp, CircleCheck,
  BarChart3, Activity, ClipboardList, Wrench, Plus, Eye,
  Gavel, Send, Target, Trophy,
} from 'lucide-react'
import { EmptyData } from '@/components/common/empty-states'

// ─── Color palette (matches uploaded KPI design) ───
const COLORS = {
  green:  { bg: '#E1F5EE', fg: '#0F6E56', pill: '#E1F5EE', pillFg: '#0F6E56' },
  blue:   { bg: '#E6F1FB', fg: '#185FA5', pill: '#E6F1FB', pillFg: '#185FA5' },
  red:    { bg: '#FCEBEB', fg: '#A32D2D', pill: '#FCEBEB', pillFg: '#A32D2D' },
  amber:  { bg: '#FAEEDA', fg: '#854F0B', pill: '#FAEEDA', pillFg: '#854F0B' },
  purple: { bg: '#EEEDFE', fg: '#534AB7', pill: '#EEEDFE', pillFg: '#534AB7' },
  bar:    ['#378ADD', '#1D9E75', '#BA7517', '#993556', '#534AB7', '#888780'],
}

// ─── Types ───
interface DashboardData {
  activeTenders: number
  totalTenderValue: number
  bidSavings: number
  openInvitations: number
  submittedBids: number
  pendingApprovals: number
  awardedBids: number
  activeTendersChange: number
  totalTenderValueChange: number
  bidSavingsChange: number
  openInvitationsChange: number
  submittedBidsChange: number
  pendingApprovalsChange: number
  awardedBidsChange: number
  vendorParticipationRate: number
  vendorParticipationChange: number
  pipeline: { status: string; count: number }[]
  upcomingDeadlines: { id: string; packageNo: string; name: string; closingDate: string; daysRemaining: number; project: { id: string; name: string } | null }[]
  recentTenders: { id: string; packageNo: string; name: string; status: string; estimatedBudget: number; createdAt: string; project: { id: string; name: string; code: string } | null; category: { name: string } | null; submittedCount: number; invitedCount: number }[]
  recentActivity: { id: string; text: string; time: string; color: string }[]
  categoryBreakdown: { name: string; count: number; percentage: number }[]
  totalVendors: number
  totalInvitations: number
  expiredBids: number
}

const statusConfig: Record<string, { label: string; pill: string; pillFg: string }> = {
  draft:              { label: 'Draft',             pill: COLORS.amber.pill,  pillFg: COLORS.amber.pillFg },
  published:          { label: 'Published',         pill: COLORS.amber.pill,  pillFg: COLORS.amber.pillFg },
  under_evaluation:   { label: 'Under Evaluation',  pill: COLORS.amber.pill,  pillFg: COLORS.amber.pillFg },
  awarded:            { label: 'Awarded',           pill: COLORS.green.pill,  pillFg: COLORS.green.pillFg },
  cancelled:           { label: 'Cancelled',         pill: COLORS.red.pill,    pillFg: COLORS.red.pillFg },
  closed:              { label: 'Closed',            pill: '#F1F5F9',           pillFg: '#64748B' },
}

// ─── Helpers ───
function TrendIcon({ change }: { change: number }) {
  if (change > 0) return <ArrowUp className="h-3 w-3" style={{ color: '#1D9E75' }} />
  if (change < 0) return <TrendingDown className="h-3 w-3" style={{ color: '#E24B4A' }} />
  return <Minus className="h-3 w-3" style={{ color: '#999' }} />
}

function TrendText({ change, positive, negative, neutral }: { change: number; positive: string; negative: string; neutral: string }) {
  const color = change > 0 ? '#1D9E75' : change < 0 ? '#E24B4A' : '#999'
  const txt = change > 0 ? positive : change < 0 ? negative : neutral
  return <span className="text-[11px]" style={{ color }}>{txt}</span>
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function LucideIcon({ name, className, color }: { name: string; className?: string; color?: string }) {
  const iconMap: Record<string, any> = { Briefcase, DollarSign, FileText, Users, Clock, CheckCircle, Send, Target, Trophy }
  const Icon = iconMap[name]
  return Icon ? <Icon className={className} style={color ? { color } : undefined} /> : null
}

// ─── Component ───
export function TenderDashboard() {
  const { navigate } = useAppStore()
  const { formatCurrency, formatCurrencyCompact } = useFormat()

  const { data, isLoading } = useQuery({
    queryKey: ['tender-dashboard'],
    queryFn: () => api.get<DashboardData>('/api/tender/dashboard'),
  })

  const dash = data?.data
  const now = new Date()
  const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // ── KPI card definitions ──
  const kpis = [
    { label: 'Active Tenders', value: dash?.activeTenders ?? 0, change: dash?.activeTendersChange ?? 0, icon: 'Briefcase', bg: COLORS.green.bg, fg: COLORS.green.fg, positive: 'Growing', negative: 'Declining', neutral: 'No change' },
    { label: 'Tender Value', value: formatCurrencyCompact(dash?.totalTenderValue ?? 0), change: dash?.totalTenderValueChange ?? 0, icon: 'DollarSign', bg: COLORS.blue.bg, fg: COLORS.blue.fg, isFormatted: true, positive: 'Up this month', negative: 'Down', neutral: 'Pending' },
    { label: 'Bid Savings', value: formatCurrencyCompact(dash?.bidSavings ?? 0), change: dash?.bidSavingsChange ?? 0, icon: 'Trophy', bg: COLORS.green.bg, fg: COLORS.green.fg, isFormatted: true, positive: 'Savings up', negative: 'Savings down', neutral: 'On budget' },
    { label: 'Open Invitations', value: dash?.openInvitations ?? 0, change: dash?.openInvitationsChange ?? 0, icon: 'Send', bg: COLORS.blue.bg, fg: COLORS.blue.fg, positive: 'More sent', negative: 'Fewer', neutral: 'Steady' },
    { label: 'Submitted Bids', value: dash?.submittedBids ?? 0, change: dash?.submittedBidsChange ?? 0, icon: 'Target', bg: COLORS.amber.bg, fg: COLORS.amber.fg, positive: 'Increasing', negative: 'Decreasing', neutral: 'On track' },
    { label: 'Pending Approvals', value: dash?.pendingApprovals ?? 0, change: dash?.pendingApprovalsChange ?? 0, icon: 'CheckCircle', bg: COLORS.purple.bg, fg: COLORS.purple.fg, positive: 'Needs action', negative: 'Clearing', neutral: 'All clear' },
  ]

  const maxPipeline = Math.max(1, ...(dash?.pipeline?.map((p) => p.count) || [1]))

  return (
    <div className="space-y-0">
      <h2 className="sr-only">Tender & Bid Management Dashboard</h2>

      {/* ── শীর্ষ বার ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[20px] font-medium text-foreground m-0">Dashboard</p>
          <p className="text-[13px] text-muted-foreground m-0 mt-0.5">Tender & Bid Management — Overview of all tendering operations</p>
        </div>
        <Badge
          variant="outline"
          className="text-[11px] px-3 py-1 rounded-full border-border/50 text-muted-foreground bg-muted/40"
        >
          <Clock className="h-3.5 w-3.5 mr-1" />{monthLabel}
        </Badge>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[110px] rounded-lg" />)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
        </div>
      ) : (
        <>
          {/* ═══════ KPI কার্ড ═══════ */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-5">
            {kpis.map((k) => (
              <div
                key={k.label}
                className="bg-muted/60 rounded-lg p-3.5 relative overflow-hidden"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5"
                  style={{ background: k.bg }}
                >
                  <LucideIcon name={k.icon} className="h-4 w-4" color={k.fg} />
                </div>
                <p className="text-[12px] text-muted-foreground mb-1 m-0">{k.label}</p>
                <p className="text-[22px] font-medium text-foreground m-0 leading-tight">
                  {k.isFormatted ? k.value : (typeof k.value === 'number' ? k.value.toLocaleString() : k.value)}
                </p>
                <div className="flex items-center gap-[3px] mt-1.5">
                  <TrendIcon change={k.change} />
                  <TrendText change={k.change} positive={k.positive} negative={k.negative} neutral={k.neutral} />
                </div>
              </div>
            ))}
          </div>

          {/* ═══════ বিভাগ সারি ১: পাইপলাইন + কার্যকলাপ ═══════ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {/* ── টেন্ডার পাইপলাইন ── */}
            <Card className="border-border/50 bg-card">
              <CardHeader className="p-4 pb-3.5">
                <CardTitle className="text-[13px] font-medium text-foreground m-0 flex items-center gap-1.5">
                  <BarChart3 className="h-[15px] w-[15px] text-muted-foreground" />Tender pipeline
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                  {dash?.pipeline?.map((p, idx) => {
                    const sc = statusConfig[p.status] || statusConfig.draft
                    return (
                      <div key={p.status} className="flex items-center justify-between">
                        <span className="text-[12px] text-muted-foreground">{sc.label}</span>
                        <span
                          className="text-[11px] px-2 py-[2px] rounded-full font-medium"
                          style={{ background: COLORS.bar[idx % COLORS.bar.length] + '20', color: COLORS.bar[idx % COLORS.bar.length] }}
                        >
                          {p.count}
                        </span>
                      </div>
                    )
                  })}
                  {(!dash?.pipeline || dash.pipeline.every((p) => p.count === 0)) && (
                    <EmptyData title="No pipeline data yet" description="Pipeline data will appear here once tenders are created." />
                  )}
                </div>

                {/* মিনি বার চার্ট */}
                {(dash?.pipeline?.some((p) => p.count > 0)) && (
                  <div className="flex items-end gap-1 mt-4 h-20 overflow-hidden">
                    {dash.pipeline.map((p, idx) => (
                      <div key={p.status} className="flex-1 flex flex-col items-center gap-0.5">
                        <div
                          className="w-full rounded-sm transition-all"
                          style={{
                            height: `${Math.max(3, (p.count / maxPipeline) * 100)}%`,
                            background: COLORS.bar[idx % COLORS.bar.length],
                            minHeight: p.count > 0 ? '6px' : '3px',
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── সাম্প্রতিক কার্যকলাপ ── */}
            <Card className="border-border/50 bg-card">
              <CardHeader className="p-4 pb-3.5">
                <CardTitle className="text-[13px] font-medium text-foreground m-0 flex items-center gap-1.5">
                  <Activity className="h-[15px] w-[15px] text-muted-foreground" />Recent activity
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <ScrollArea className="max-h-[220px]">
                  {(dash?.recentActivity || []).length === 0 ? (
                    <p className="text-[12px] text-muted-foreground text-center py-6">No recent activity</p>
                  ) : (
                    dash.recentActivity.map((act) => (
                      <div key={act.id} className="flex items-start gap-2.5 py-2 border-b border-border/50 last:border-b-0">
                        <div
                          className="w-2 h-2 rounded-full mt-[5px] shrink-0"
                          style={{ background: act.color }}
                        />
                        <div className="min-w-0">
                          <p className="text-[12px] text-foreground leading-[1.4] m-0">{act.text}</p>
                          <p className="text-[11px] text-muted-foreground m-0 mt-0.5">{formatTimeAgo(act.time)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* ═══════ বিভাগ সারি ২: আসন্ন সময়সীমা + বিভাগ ═══════ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {/* ── আসন্ন সময়সীমা ── */}
            <Card className="border-border/50 bg-card">
              <CardHeader className="p-4 pb-3.5 flex flex-row items-center justify-between">
                <CardTitle className="text-[13px] font-medium text-foreground m-0 flex items-center gap-1.5">
                  <Clock className="h-[15px] w-[15px] text-muted-foreground" />Upcoming deadlines
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-[11px] h-6 px-2" onClick={() => navigate('tender-packages')}>
                  View All
                </Button>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                {(dash?.upcomingDeadlines || []).length === 0 ? (
                  <p className="text-[12px] text-muted-foreground text-center py-6">No upcoming deadlines</p>
                ) : (
                  <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                    {dash.upcomingDeadlines.map((d) => (
                      <div
                        key={d.id}
                        className="flex items-center justify-between cursor-pointer py-1 px-1 rounded-md hover:bg-muted/50 transition-colors"
                        onClick={() => navigate('tender-detail', { id: d.id })}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-medium text-foreground m-0 truncate">{d.name}</p>
                          <p className="text-[11px] text-muted-foreground m-0">{d.packageNo}{d.project ? ` · ${d.project.name}` : ''}</p>
                        </div>
                        <span
                          className="text-[11px] px-2 py-[2px] rounded-full font-medium ml-2 shrink-0"
                          style={{
                            background: d.daysRemaining <= 3 ? COLORS.red.pill : d.daysRemaining <= 7 ? COLORS.amber.pill : COLORS.green.pill,
                            color: d.daysRemaining <= 3 ? COLORS.red.pillFg : d.daysRemaining <= 7 ? COLORS.amber.pillFg : COLORS.green.pillFg,
                          }}
                        >
                          {d.daysRemaining}d left
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── কাজের বিভাগ (বাণিজ্য বিশ্লেষণ) ── */}
            <Card className="border-border/50 bg-card">
              <CardHeader className="p-4 pb-3.5">
                <CardTitle className="text-[13px] font-medium text-foreground m-0 flex items-center gap-1.5">
                  <Wrench className="h-[15px] w-[15px] text-muted-foreground" />Work categories
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <div className="flex flex-col gap-2.5">
                  {(dash?.categoryBreakdown || []).length === 0 ? (
                    <p className="text-[12px] text-muted-foreground text-center py-6">No category data</p>
                  ) : (
                    dash.categoryBreakdown.map((cat, idx) => (
                      <div key={cat.name}>
                        <div className="flex justify-between text-[12px] mb-1">
                          <span className="text-muted-foreground">{cat.name}</span>
                          <span className="font-medium text-foreground">{cat.percentage}%</span>
                        </div>
                        <div className="h-[5px] rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.max(cat.percentage, 2)}%`,
                              background: COLORS.bar[idx % COLORS.bar.length],
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* ভেন্ডর পরিসংখ্যান */}
                <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                  <span className="text-[12px] text-muted-foreground">
                    {dash?.totalVendors ?? 0} vendors · {dash?.vendorParticipationRate ?? 0}% participation
                  </span>
                  <Button variant="ghost" size="sm" className="text-[11px] h-6 px-2" onClick={() => navigate('tender-vendors')}>
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ═══════ সাম্প্রতিক টেন্ডার টেবিল ═══════ */}
          <Card className="border-border/50 bg-card">
            <CardHeader className="p-4 pb-3.5 flex flex-row items-center justify-between">
              <CardTitle className="text-[13px] font-medium text-foreground m-0 flex items-center gap-1.5">
                <ClipboardList className="h-[15px] w-[15px] text-muted-foreground" />Recent tenders
              </CardTitle>
              <Button
                className="text-[11px] h-7 gap-1.5 px-3"
                onClick={() => navigate('tender-packages')}
              >
                <Plus className="h-3.5 w-3.5" />Create Bid Package
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[320px]">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-[11px] h-8">Package No</TableHead>
                      <TableHead className="text-[11px] h-8">Name</TableHead>
                      <TableHead className="text-[11px] h-8">Project</TableHead>
                      <TableHead className="text-[11px] h-8">Category</TableHead>
                      <TableHead className="text-[11px] h-8 text-right">Est. Budget</TableHead>
                      <TableHead className="text-[11px] h-8 text-center">Invited</TableHead>
                      <TableHead className="text-[11px] h-8 text-center">Submitted</TableHead>
                      <TableHead className="text-[11px] h-8">Status</TableHead>
                      <TableHead className="text-[11px] h-8 w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(dash?.recentTenders || []).map((t) => {
                      const sc = statusConfig[t.status] || statusConfig.draft
                      return (
                        <TableRow
                          key={t.id}
                          className="cursor-pointer hover:bg-muted/50 h-10"
                          onClick={() => navigate('tender-detail', { id: t.id })}
                        >
                          <TableCell className="text-[11px] font-mono font-medium py-2">{t.packageNo}</TableCell>
                          <TableCell className="text-[11px] max-w-[160px] truncate py-2">{t.name}</TableCell>
                          <TableCell className="text-[11px] max-w-[120px] truncate py-2 text-muted-foreground">{t.project?.name || '—'}</TableCell>
                          <TableCell className="text-[11px] py-2 text-muted-foreground">{t.category?.name || '—'}</TableCell>
                          <TableCell className="text-[11px] text-right py-2 font-medium">{formatCurrency(t.estimatedBudget)}</TableCell>
                          <TableCell className="text-[11px] text-center py-2">{t.invitedCount}</TableCell>
                          <TableCell className="text-[11px] text-center py-2">{t.submittedCount}</TableCell>
                          <TableCell className="py-2">
                            <span
                              className="text-[11px] px-2 py-[2px] rounded-full font-medium"
                              style={{ background: sc.pill, color: sc.pillFg }}
                            >
                              {sc.label}
                            </span>
                          </TableCell>
                          <TableCell className="py-2 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => { e.stopPropagation(); navigate('tender-detail', { id: t.id }) }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {(!dash?.recentTenders || dash.recentTenders.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-[12px] text-muted-foreground py-8">
                          No tenders yet.{' '}
                          <button
                            className="text-amber-600 hover:underline bg-transparent border-0 p-0 text-[12px] cursor-pointer"
                            onClick={() => navigate('tender-packages')}
                          >
                            Create your first bid package
                          </button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
