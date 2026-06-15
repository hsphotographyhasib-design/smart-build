'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  MessageSquare, FileText, HelpCircle, AlertTriangle,
  ArrowRight, Clock, Plus, TrendingUp, BarChart3,
} from 'lucide-react'

const kpiCards = [
  { key: 'openRfis', label: 'Open RFIs', icon: HelpCircle, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
  { key: 'pendingSubmittals', label: 'Pending Submittals', icon: FileText, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40' },
  { key: 'activeDiscussions', label: 'Active Discussions', icon: MessageSquare, color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40' },
  { key: 'openItems', label: 'Open Items', icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
  { key: 'pendingChangeEvents', label: 'Pending Changes', icon: TrendingUp, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40' },
  { key: 'totalOverdue', label: 'Overdue Items', icon: Clock, color: 'text-red-600 bg-red-50 dark:bg-red-950/40' },
] as const

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  under_review: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  open: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
  in_progress: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  closed: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  review: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
}

const typeLabels: Record<string, string> = {
  rfi: 'RFI',
  discussion: 'Discussion',
  submittal: 'Submittal',
  change_event: 'Change Event',
}

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function CollaborationDashboard() {
  const { navigate } = useAppStore()

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['collaboration-dashboard'],
    queryFn: () => api.get('/api/collaboration/dashboard'),
  })

  const counts = dashboard?.data?.counts || {}
  const recentActivity = dashboard?.data?.recentActivity || []
  const categoryBreakdown = dashboard?.data?.categoryBreakdown || {}

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Collaboration Hub</h1>
          <p className="text-muted-foreground text-sm mt-1">Track RFIs, submittals, discussions, and team communication</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => navigate('collaboration-rfis')} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> New RFI
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate('collaboration-discussions')} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Discussion
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate('collaboration-announcements')} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Announcement
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon
            const value = counts[kpi.key] || 0
            return (
              <Card key={kpi.key} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
                if (kpi.key === 'openRfis') navigate('collaboration-rfis')
                else if (kpi.key === 'pendingSubmittals') navigate('collaboration-submittals')
                else if (kpi.key === 'activeDiscussions') navigate('collaboration-discussions')
                else if (kpi.key === 'openItems') navigate('collaboration-rfis')
                else if (kpi.key === 'pendingChangeEvents') navigate('collaboration-approvals')
              }}>
                <CardContent className="p-4">
                  <div className={`inline-flex items-center justify-center rounded-lg p-2 mb-3 ${kpi.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Recent Activity
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No recent activity</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recentActivity.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {typeLabels[item.type] || item.type} · {item.projectName}
                      </p>
                    </div>
                    <Badge variant="secondary" className={`text-[10px] shrink-0 ${statusColors[item.status] || ''}`}>
                      {item.status?.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{formatTimeAgo(item.updatedAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-8 rounded" />)}
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {Object.entries(categoryBreakdown).map(([category, count]) => {
                  const maxCount = Math.max(...Object.values(categoryBreakdown) as number[], 1)
                  const pct = ((count as number) / maxCount) * 100
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="truncate font-medium">{category.replace(/_/g, ' ')}</span>
                        <span className="text-muted-foreground ml-2 shrink-0">{count}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'RFI Management', page: 'collaboration-rfis' as const, desc: 'Track requests for information', icon: HelpCircle },
          { label: 'Submittals', page: 'collaboration-submittals' as const, desc: 'Review and approve submittals', icon: FileText },
          { label: 'Discussions', page: 'collaboration-discussions' as const, desc: 'Team discussions & threads', icon: MessageSquare },
          { label: 'Approvals Center', page: 'collaboration-approvals' as const, desc: 'Pending approvals queue', icon: ArrowRight },
        ].map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.page} className="cursor-pointer hover:shadow-md transition-shadow group" onClick={() => navigate(item.page)}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className="rounded-lg bg-teal-50 dark:bg-teal-950/40 p-2 text-teal-600 group-hover:bg-teal-100 dark:group-hover:bg-teal-950/60 transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1 shrink-0" />
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}