'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  FolderKanban, FileText, AlertTriangle, TrendingUp,
  ArrowRight, MessageSquare, Camera, ClipboardList,
  Activity, ThumbsUp, DollarSign, CheckCircle2,
} from 'lucide-react'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)
}

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

const activityIcons: Record<string, React.ElementType> = {
  document: FileText,
  daily_note: ClipboardList,
  complaint: AlertTriangle,
}

const activityColors: Record<string, string> = {
  document: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40',
  daily_note: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40',
  complaint: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/40',
}

const statusColors: Record<string, string> = {
  planning: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  on_hold: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
}

export function ClientDashboard() {
  const { navigate, user } = useAppStore()

  const { data, isLoading } = useQuery({
    queryKey: ['client-portal-dashboard'],
    queryFn: () => api.get('/api/client-portal/dashboard'),
  })

  const kpis = data?.data?.kpis || {}
  const projects = data?.data?.projects || []
  const recentActivity = data?.data?.recentActivity || []

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Client Portal</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Welcome back, {user?.name || 'Client'} — Here&apos;s your project overview
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={() => navigate('client-progress')} className="gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" /> View Progress
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate('client-invoices')} className="gap-1.5">
            <DollarSign className="h-3.5 w-3.5" /> Invoices
          </Button>
          <Button size="sm" onClick={() => navigate('client-complaints')} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
            <MessageSquare className="h-3.5 w-3.5" /> File Complaint
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-emerald-100 dark:border-emerald-900/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                <FolderKanban className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium">Active Projects</p>
                <p className="text-2xl font-bold">{kpis.activeProjects || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-100 dark:border-amber-900/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium">Pending Invoices</p>
                <p className="text-2xl font-bold">{kpis.pendingInvoiceCount || 0}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(kpis.pendingInvoiceTotal || 0)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-100 dark:border-red-900/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium">Open Complaints</p>
                <p className="text-2xl font-bold">{kpis.openComplaints || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-100 dark:border-emerald-900/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                <ThumbsUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium">Satisfaction Rate</p>
                <p className="text-2xl font-bold">{kpis.satisfactionRate || 100}%</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Overview Cards */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Your Projects</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => navigate('projects')} className="text-emerald-600 hover:text-emerald-700 gap-1 text-xs">
                  View All <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 rounded-lg" />
                  ))}
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8">
                  <FolderKanban className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No active projects found</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {projects.slice(0, 5).map((project: any) => (
                    <div
                      key={project.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-border/60 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors cursor-pointer"
                      onClick={() => navigate('client-progress', { id: project.id })}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm truncate">{project.name}</p>
                          <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${statusColors[project.status] || ''}`}>
                            {project.status?.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{project.code}</span>
                          {project.startDate && <span>Started {new Date(project.startDate).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:w-48">
                        <Progress value={project.progress} className="h-2 flex-1" />
                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 w-10 text-right">{Math.round(project.progress)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Feed */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-14 rounded-lg" />
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {recentActivity.map((item: any, idx: number) => {
                    const Icon = activityIcons[item.type] || FileText
                    const colorClass = activityColors[item.type] || 'text-gray-600 bg-gray-50'
                    return (
                      <div key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{item.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">
                          {formatTimeAgo(item.timestamp)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="mt-4">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-auto py-3 flex-col gap-1.5 text-xs"
                  onClick={() => navigate('client-progress')}
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Track Progress
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-auto py-3 flex-col gap-1.5 text-xs"
                  onClick={() => navigate('client-invoices')}
                >
                  <FileText className="h-4 w-4 text-amber-500" />
                  View Invoices
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-auto py-3 flex-col gap-1.5 text-xs"
                  onClick={() => navigate('client-documents')}
                >
                  <Camera className="h-4 w-4 text-blue-500" />
                  Documents
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-auto py-3 flex-col gap-1.5 text-xs"
                  onClick={() => navigate('client-complaints')}
                >
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  File Complaint
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
