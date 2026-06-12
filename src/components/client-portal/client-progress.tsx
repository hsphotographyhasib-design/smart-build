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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  TrendingUp, CheckCircle2, Clock, AlertTriangle, Calendar,
  ClipboardList, Camera, Target, BarChart3, ArrowLeft,
} from 'lucide-react'

const statusColors: Record<string, string> = {
  planning: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  on_hold: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
}

const milestoneStatusColors: Record<string, string> = {
  pending: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  overdue: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
}

const milestoneStatusIcons: Record<string, React.ElementType> = {
  pending: Clock,
  in_progress: TrendingUp,
  completed: CheckCircle2,
  overdue: AlertTriangle,
}

export function ClientProgress() {
  const { navigate } = useAppStore()
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>('')
  const [hasInitialized, setHasInitialized] = React.useState(false)

  // Fetch projects list for the selector
  const { data: projectsData } = useQuery({
    queryKey: ['client-portal-projects'],
    queryFn: () => api.get('/api/client-portal/projects'),
  })

  const projects = projectsData?.data || []

  // Auto-select first project
  React.useEffect(() => {
    if (!hasInitialized && projects.length > 0) {
      setSelectedProjectId(projects[0].id)
      setHasInitialized(true)
    }
  }, [projects, hasInitialized])

  // Fetch progress data for selected project
  const { data, isLoading } = useQuery({
    queryKey: ['client-portal-progress', selectedProjectId],
    queryFn: () => api.get(`/api/client-portal/projects/${selectedProjectId}/progress`),
    enabled: !!selectedProjectId,
  })

  const progress = data?.data || {}
  const project = progress.project || {}
  const taskStats = progress.taskStats || { total: 0, completed: 0, inProgress: 0, overdue: 0 }
  const milestones = progress.milestones || []
  const recentNotes = progress.recentNotes || []
  const photos = progress.photos || []
  const statusBreakdown = progress.statusBreakdown || []

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button size="icon" variant="ghost" onClick={() => navigate('client-dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Project Progress</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Track milestones, tasks, and site updates</p>
          </div>
        </div>
        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Select a project..." />
          </SelectTrigger>
          <SelectContent>
            {projects.map((p: any) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name} ({p.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedProjectId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Target className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Select a project to view progress</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        </div>
      ) : (
        <>
          {/* Project Info + Progress Ring */}
          <Card className="border-emerald-100 dark:border-emerald-900/50">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Progress Ring */}
                <div className="relative h-28 w-28 flex-shrink-0">
                  <svg className="h-28 w-28 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted/20" />
                    <circle
                      cx="60" cy="60" r="52" stroke="currentColor" strokeWidth="8" fill="none"
                      strokeDasharray={`${(project.progress || 0) / 100 * 326.73} 326.73`}
                      strokeLinecap="round"
                      className="text-emerald-500 transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{Math.round(project.progress || 0)}%</span>
                  </div>
                </div>
                {/* Project Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-bold">{project.name}</h2>
                    <Badge variant="secondary" className={statusColors[project.status] || ''}>
                      {project.status?.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{project.code} — {project.description || 'No description'}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    {project.startDate && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {project.endDate && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>End: {new Date(project.endDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <BarChart3 className="h-3.5 w-3.5" />
                      <span>Budget: ${Number(project.budget || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Task Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="h-5 w-5 text-emerald-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{taskStats.total}</p>
                <p className="text-xs text-muted-foreground">Total Tasks</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">{taskStats.overdue}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </CardContent>
            </Card>
          </div>

          {/* Status Breakdown Bar */}
          {statusBreakdown.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Task Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex rounded-lg overflow-hidden h-3">
                  {statusBreakdown.map((item: any) => {
                    const colors: Record<string, string> = {
                      completed: 'bg-emerald-500',
                      in_progress: 'bg-blue-500',
                      todo: 'bg-slate-300 dark:bg-slate-600',
                      cancelled: 'bg-red-400',
                    }
                    return (
                      <div
                        key={item.status}
                        className={`${colors[item.status] || 'bg-gray-400'}`}
                        style={{ width: `${(item.count / taskStats.total) * 100}%` }}
                        title={`${item.status}: ${item.count}`}
                      />
                    )
                  })}
                </div>
                <div className="flex flex-wrap gap-3 mt-3">
                  {statusBreakdown.map((item: any) => (
                    <div key={item.status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className={`h-2.5 w-2.5 rounded-full ${
                        item.status === 'completed' ? 'bg-emerald-500' :
                        item.status === 'in_progress' ? 'bg-blue-500' :
                        item.status === 'todo' ? 'bg-slate-300' : 'bg-red-400'
                      }`} />
                      {item.status.replace('_', ' ')}: {item.count}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Milestones Timeline */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Milestones</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {milestones.length === 0 ? (
                  <div className="text-center py-6">
                    <Clock className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No milestones defined</p>
                  </div>
                ) : (
                  <div className="relative space-y-0 max-h-72 overflow-y-auto">
                    <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-border" />
                    {milestones.map((ms: any, idx: number) => {
                      const Icon = milestoneStatusIcons[ms.status] || Clock
                      return (
                        <div key={ms.id} className="flex items-start gap-3 pb-4 relative">
                          <div className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 border-background ${milestoneStatusColors[ms.status] || ''}`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <p className="text-sm font-medium">{ms.name}</p>
                            <p className="text-xs text-muted-foreground">{ms.description || ''}</p>
                            {ms.dueDate && (
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                Due: {new Date(ms.dueDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${milestoneStatusColors[ms.status] || ''}`}>
                            {ms.status?.replace('_', ' ')}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Daily Notes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Site Updates</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {recentNotes.length === 0 ? (
                  <div className="text-center py-6">
                    <ClipboardList className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No site updates yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {recentNotes.map((note: any) => (
                      <div key={note.id} className="p-3 rounded-lg border border-border/50">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium">{new Date(note.date).toLocaleDateString()}</span>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {note.weather && <span>{note.weather}</span>}
                            {note.temperature != null && <span>{note.temperature}°C</span>}
                          </div>
                        </div>
                        <p className="text-sm line-clamp-2">{note.workDone || 'No work recorded'}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Labour on site: {note.labourCount || 0}
                          {note.supervisor && ` — by ${note.supervisor.name}`}
                        </p>
                        {note.issues && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">⚠ {note.issues}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Photo Gallery */}
          {photos.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">Photo Gallery</CardTitle>
                  <Badge variant="secondary" className="text-xs">{photos.length} photos</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {photos.slice(0, 10).map((photo: any) => (
                    <div key={photo.id} className="aspect-square rounded-lg bg-muted border border-border/50 flex flex-col items-center justify-center p-2 hover:border-emerald-300 transition-colors">
                      <Camera className="h-6 w-6 text-muted-foreground/40 mb-1" />
                      <p className="text-[10px] text-muted-foreground text-center truncate w-full">{photo.name}</p>
                    </div>
                  ))}
                </div>
                {photos.length > 10 && (
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Showing 10 of {photos.length} photos
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
