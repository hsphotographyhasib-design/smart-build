'use client'

import React, { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  DollarSign, Clock, Users, Target, Eye, AlertTriangle, Sparkles,
  CheckCircle2, XCircle, ArrowRight, Plus, Brain, Filter, ChevronDown, ChevronUp, Trash2
} from 'lucide-react'
import { toast } from 'sonner'

const TYPE_ICONS: Record<string, React.ElementType> = {
  cost_anomaly: DollarSign,
  schedule_risk: Clock,
  resource_optimization: Users,
  budget_forecast: Target,
  quality_alert: Eye,
  safety_risk: AlertTriangle,
}

const TYPE_LABELS: Record<string, string> = {
  cost_anomaly: 'Cost Anomaly',
  schedule_risk: 'Schedule Risk',
  resource_optimization: 'Resource Optimization',
  budget_forecast: 'Budget Forecast',
  quality_alert: 'Quality Alert',
  safety_risk: 'Safety Risk',
}

const SEVERITY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  info: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800/50' },
  warning: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800/50' },
  critical: { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800/50' },
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  acknowledged: { label: 'Acknowledged', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  actioned: { label: 'Actioned', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  dismissed: { label: 'Dismissed', color: 'bg-gray-100 text-gray-500 dark:bg-gray-800/30 dark:text-gray-400' },
}

export function AIInsights() {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState({ insightType: 'all', severity: 'all', status: 'all', projectId: '' })
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({ insightType: 'cost_anomaly', severity: 'info', title: '', description: '', confidence: 0.7, recommendations: [''] })

  const queryParams = new URLSearchParams()
  if (filters.insightType !== 'all') queryParams.set('insightType', filters.insightType)
  if (filters.severity !== 'all') queryParams.set('severity', filters.severity)
  if (filters.status !== 'all') queryParams.set('status', filters.status)
  if (filters.projectId) queryParams.set('projectId', filters.projectId)

  const { data, isLoading } = useQuery({
    queryKey: ['ai-insights', filters],
    queryFn: () => api.get(`/api/ai/insights?${queryParams.toString()}`),
  })

  const { data: projectsData } = useQuery({
    queryKey: ['projects-list'],
    queryFn: () => api.get('/api/projects?limit=100'),
  })

  const projects = projectsData?.data?.projects || []

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.put(`/api/ai/insights/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] })
      toast.success('Insight status updated')
    },
    onError: () => toast.error('Failed to update insight'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/api/ai/insights/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] })
      toast.success('Insight deleted')
    },
    onError: () => toast.error('Failed to delete insight'),
  })

  const createMutation = useMutation({
    mutationFn: () => api.post('/api/ai/insights', {
      ...createForm,
      recommendations: createForm.recommendations.filter(r => r.trim()),
      confidence: parseFloat(String(createForm.confidence)),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] })
      toast.success('Insight created')
      setCreateOpen(false)
      setCreateForm({ insightType: 'cost_anomaly', severity: 'info', title: '', description: '', confidence: 0.7, recommendations: [''] })
    },
    onError: () => toast.error('Failed to create insight'),
  })

  const toggleExpanded = useCallback((id: string) => {
    setExpandedId(prev => prev === id ? null : id)
  }, [])

  const insights = data?.data?.insights || []
  const pagination = data?.data?.pagination

  return (
    <div className="p-6 space-y-6">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-violet-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">AI Insights</h1>
            <p className="text-sm text-muted-foreground">AI-powered pattern detection & recommendations</p>
          </div>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700">
              <Plus className="h-3.5 w-3.5" /> Create Insight
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Manual Insight</DialogTitle>
              <DialogDescription>Add a manual AI insight or observation</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Type</Label>
                  <Select value={createForm.insightType} onValueChange={v => setCreateForm(f => ({ ...f, insightType: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Severity</Label>
                  <Select value={createForm.severity} onValueChange={v => setCreateForm(f => ({ ...f, severity: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Title</Label>
                <Input className="mt-1" value={createForm.title} onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))} placeholder="Insight title..." />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea className="mt-1" value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the insight..." rows={3} />
              </div>
              <div>
                <Label className="text-xs">Confidence ({Math.round(createForm.confidence * 100)}%)</Label>
                <Input type="range" min="0" max="1" step="0.05" className="mt-1" value={createForm.confidence} onChange={e => setCreateForm(f => ({ ...f, confidence: parseFloat(e.target.value) }))} />
              </div>
              <div>
                <Label className="text-xs">Recommendations</Label>
                {createForm.recommendations.map((rec, i) => (
                  <div key={i} className="flex gap-2 mt-1">
                    <Input value={rec} onChange={e => {
                      const next = [...createForm.recommendations]
                      next[i] = e.target.value
                      setCreateForm(f => ({ ...f, recommendations: next }))
                    }} placeholder={`Recommendation ${i + 1}`} />
                    {createForm.recommendations.length > 1 && (
                      <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setCreateForm(f => ({ ...f, recommendations: f.recommendations.filter((_, j) => j !== i) }))}>
                        <XCircle className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="mt-1" onClick={() => setCreateForm(f => ({ ...f, recommendations: [...f.recommendations, ''] }))}>
                  <Plus className="h-3 w-3 mr-1" /> Add Recommendation
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-purple-600 to-violet-600" onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !createForm.title || !createForm.description}>
                {createMutation.isPending ? 'Creating...' : 'Create Insight'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ফিল্টারসমূহ */}
      <Card className="border-purple-200/50 dark:border-purple-800/30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filters.insightType} onValueChange={v => setFilters(f => ({ ...f, insightType: v }))}>
              <SelectTrigger className="w-40 h-8 text-xs"><SelectValue placeholder="All Types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.severity} onValueChange={v => setFilters(f => ({ ...f, severity: v }))}>
              <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="All Severity" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={v => setFilters(f => ({ ...f, status: v }))}>
              <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="actioned">Actioned</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.projectId} onValueChange={v => setFilters(f => ({ ...f, projectId: v }))}>
              <SelectTrigger className="w-48 h-8 text-xs"><SelectValue placeholder="All Projects" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Projects</SelectItem>
                {projects.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* অন্তর্দৃষ্টি তালিকা */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      ) : insights.length === 0 ? (
        <Card className="border-purple-200/50 dark:border-purple-800/30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
          <CardContent className="py-16 text-center">
            <Brain className="h-12 w-12 text-purple-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold">No insights detected</h3>
            <p className="text-sm text-muted-foreground mt-1">AI will generate insights as patterns emerge from your data</p>
            <Button variant="outline" size="sm" className="mt-4 border-purple-200 text-purple-700" onClick={() => setCreateOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Create Manual Insight
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {insights.map((insight: any) => {
            const Icon = TYPE_ICONS[insight.insightType] || Sparkles
            const sevStyle = SEVERITY_STYLES[insight.severity] || SEVERITY_STYLES.info
            const statusInfo = STATUS_LABELS[insight.status] || STATUS_LABELS.new
            const isExpanded = expandedId === insight.id
            const recs = Array.isArray(insight.recommendations) ? insight.recommendations : []

            return (
              <Card key={insight.id} className={`border ${sevStyle.border} ${sevStyle.bg} overflow-hidden transition-all`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${sevStyle.bg} mt-0.5`}>
                      <Icon className={`h-4 w-4 ${sevStyle.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold">{insight.title}</h3>
                        <Badge variant="outline" className={statusInfo.color}>{statusInfo.label}</Badge>
                        <Badge variant="outline" className={sevStyle.text}>{insight.severity}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{insight.description}</p>

                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-muted-foreground">Confidence</span>
                          <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
                            <div className={`h-full rounded-full ${insight.confidence > 0.8 ? 'bg-emerald-500' : insight.confidence > 0.6 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Math.round((insight.confidence || 0) * 100)}%` }} />
                          </div>
                          <span className="text-[11px] font-medium">{Math.round((insight.confidence || 0) * 100)}%</span>
                        </div>
                        {insight.project?.name && (
                          <span className="text-[11px] text-muted-foreground">Project: {insight.project.name}</span>
                        )}
                        <span className="text-[11px] text-muted-foreground">{new Date(insight.createdAt).toLocaleDateString()}</span>
                        <button onClick={() => toggleExpanded(insight.id)} className="text-[11px] text-purple-600 hover:text-purple-700 flex items-center gap-0.5">
                          {isExpanded ? 'Less' : 'More'} {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 space-y-3">
                          {recs.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1.5">Recommendations</p>
                              <ul className="space-y-1">
                                {recs.map((r: string, i: number) => (
                                  <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                                    <ArrowRight className="h-3 w-3 mt-0.5 text-purple-400 shrink-0" />
                                    {r}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {insight.affectedEntities?.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1.5">Affected Entities</p>
                              <div className="flex flex-wrap gap-1">
                                {insight.affectedEntities.map((e: any, i: number) => (
                                  <Badge key={i} variant="secondary" className="text-[10px]">{typeof e === 'string' ? e : e.name || e.id}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          <Separator />
                          <div className="flex items-center gap-2">
                            {insight.status === 'new' && (
                              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => statusMutation.mutate({ id: insight.id, status: 'acknowledged' })}>
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Acknowledge
                              </Button>
                            )}
                            {insight.status !== 'actioned' && insight.status !== 'dismissed' && (
                              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => statusMutation.mutate({ id: insight.id, status: 'actioned' })}>
                                <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-500" /> Mark Actioned
                              </Button>
                            )}
                            {insight.status !== 'dismissed' && (
                              <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={() => statusMutation.mutate({ id: insight.id, status: 'dismissed' })}>
                                <XCircle className="h-3 w-3 mr-1" /> Dismiss
                              </Button>
                            )}
                            <div className="flex-1" />
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500 hover:text-red-600" onClick={() => deleteMutation.mutate(insight.id)}>
                              <Trash2 className="h-3 w-3 mr-1" /> Delete
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {insights.length} of {pagination.total} insights
        </div>
      )}
    </div>
  )
}