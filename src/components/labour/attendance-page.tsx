'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppStore, api, queryKeys } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Plus, Search, CalendarCheck, Clock, UserX, AlertCircle, Users } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

// ──────────────────────────────────────────
// প্রকারভেদ
// ──────────────────────────────────────────

interface AttendanceRecord {
  id: string
  labourId: string
  projectId: string
  date: string
  status: string
  hoursWorked: number | null
  overtime: number | null
  labour: {
    id: string
    name: string
    groupId: string
    group: { id: string; name: string }
  }
}

interface AttendanceSummary {
  present: number
  absent: number
  half_day: number
  overtime: number
  total: number
}

interface Project {
  id: string
  name: string
  code: string
}

interface LabourGroup {
  id: string
  name: string
  labours: { id: string; name: string; isActive: boolean }[]
}

// ──────────────────────────────────────────
// সহায়ক ফাংশনসমূহ
// ──────────────────────────────────────────

function statusBadge(status: string) {
  switch (status) {
    case 'present':
      return <Badge className="bg-emerald-600 text-white border-0 text-xs">Present</Badge>
    case 'absent':
      return <Badge className="bg-red-600 text-white border-0 text-xs">Absent</Badge>
    case 'half_day':
      return <Badge className="bg-amber-600 text-white border-0 text-xs">Half Day</Badge>
    case 'overtime':
      return <Badge className="bg-orange-600 text-white border-0 text-xs">Overtime</Badge>
    default:
      return <Badge variant="secondary" className="text-xs">{status}</Badge>
  }
}

// ──────────────────────────────────────────
// স্কেলেটন
// ──────────────────────────────────────────

function SummarySkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-8 w-12" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-16 rounded-full ml-auto" />
        </div>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────
// উপস্থিতি চিহ্নিতকরণ ডায়ালগ
// ──────────────────────────────────────────

function MarkAttendanceDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ projectId: '', groupId: '', date: format(new Date(), 'yyyy-MM-dd') })
  const [selectedLabours, setSelectedLabours] = useState<Record<string, string>>({})

  const { data: projects } = useQuery({
    queryKey: ['projects-mini'],
    queryFn: () => api.get<{ success: boolean; data: Project[] }>('/api/projects?status=active').then((r) => r.data),
  })

  const { data: groups } = useQuery({
    queryKey: ['labour-groups-mini'],
    queryFn: () => api.get<{ success: boolean; data: LabourGroup[] }>('/api/labour-groups').then((r) => r.data),
    enabled: !!form.projectId,
  })

  const selectedGroupLabours = useMemo(() => {
    if (!groups || !form.groupId) return []
    const g = groups.find((gr) => gr.id === form.groupId)
    return (g?.labours || []).filter((l) => l.isActive)
  }, [groups, form.groupId])

  const mutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/api/attendance', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance })
      toast.success('Attendance marked!')
      onClose()
      setForm({ projectId: '', groupId: '', date: format(new Date(), 'yyyy-MM-dd') })
      setSelectedLabours({})
    },
    onError: (err: Error) => toast.error(err.message || 'Failed'),
  })

  const handleSubmit = () => {
    if (!form.projectId || !form.groupId || !form.date) {
      toast.error('Project, group, and date are required')
      return
    }
    const records = Object.entries(selectedLabours)
      .filter(([, status]) => status)
      .map(([labourId, status]) => ({
        labourId,
        status,
        hoursWorked: status === 'half_day' ? 4 : status === 'overtime' ? 10 : 8,
        overtime: status === 'overtime' ? 2 : 0,
      }))
    if (records.length === 0) { toast.error('Mark at least one labour attendance'); return }
    mutation.mutate({ projectId: form.projectId, date: form.date, records })
  }

  const selectAll = (status: string) => {
    const updated: Record<string, string> = {}
    selectedGroupLabours.forEach((l) => { updated[l.id] = status })
    setSelectedLabours(updated)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mark Attendance</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Project *</Label>
              <Select value={form.projectId} onValueChange={(v) => setForm({ ...form, projectId: v, groupId: '' })}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {(projects || []).map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Group *</Label>
              <Select value={form.groupId} onValueChange={(v) => setForm({ ...form, groupId: v })}>
                <SelectTrigger><SelectValue placeholder="Select group" /></SelectTrigger>
                <SelectContent>
                  {(groups || []).map((g) => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>

          {selectedGroupLabours.length > 0 && (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Quick Select:</span>
                <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => selectAll('present')}>All Present</Button>
                <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => selectAll('absent')}>All Absent</Button>
                <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => selectAll('half_day')}>All Half Day</Button>
              </div>
              <div className="max-h-64 overflow-y-auto custom-scrollbar rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold text-xs">Name</TableHead>
                      <TableHead className="font-semibold text-xs text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedGroupLabours.map((labour) => (
                      <TableRow key={labour.id}>
                        <TableCell className="text-sm font-medium">{labour.name}</TableCell>
                        <TableCell className="text-right">
                          <Select
                            value={selectedLabours[labour.id] || 'present'}
                            onValueChange={(v) => setSelectedLabours({ ...selectedLabours, [labour.id]: v })}
                          >
                            <SelectTrigger className="w-28 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="present">Present</SelectItem>
                              <SelectItem value="absent">Absent</SelectItem>
                              <SelectItem value="half_day">Half Day</SelectItem>
                              <SelectItem value="overtime">Overtime</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          {form.projectId && form.groupId && selectedGroupLabours.length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
              No active members in this group.
            </div>
          )}
        </div>
        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Mark Attendance'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ──────────────────────────────────────────
// প্রধান উপাদান
// ──────────────────────────────────────────

export function AttendancePage() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [dateFilter, setDateFilter] = useState(today)
  const [projectFilter, setProjectFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [markOpen, setMarkOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: projects } = useQuery({
    queryKey: ['projects-att'],
    queryFn: () => api.get<{ success: boolean; data: Project[] }>('/api/projects').then((r) => r.data),
  })

  const { data: attendanceData, isLoading, error } = useQuery({
    queryKey: [...queryKeys.attendance, { date: dateFilter, project: projectFilter, status: statusFilter }],
    queryFn: () => {
      const params = new URLSearchParams()
      params.set('date', dateFilter)
      if (projectFilter && projectFilter !== 'all') params.set('projectId', projectFilter)
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      return api.get<{ success: boolean; data: { records: AttendanceRecord[]; summary: AttendanceSummary } }>(
        `/api/attendance?${params.toString()}`
      ).then((r) => r.data)
    },
  })

  const records = attendanceData?.records || []
  const summary = attendanceData?.summary || { present: 0, absent: 0, half_day: 0, overtime: 0, total: 0 }

  const filteredRecords = useMemo(() => {
    if (!searchQuery) return records
    return records.filter((r) =>
      r.labour.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.labour.group?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [records, searchQuery])

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? 'Loading...' : `${summary.total} record(s) for ${format(parseISO(dateFilter), 'dd MMM yyyy')}`}
          </p>
        </div>
        <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setMarkOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Mark Attendance
        </Button>
      </div>

      {/* সারসংক্ষেপ কার্ড */}
      {isLoading ? (
        <SummarySkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarCheck className="h-4 w-4 text-emerald-600" />
                Present
              </div>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{summary.present}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserX className="h-4 w-4 text-red-600" />
                Absent
              </div>
              <p className="text-2xl font-bold text-red-600 mt-1">{summary.absent}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                Half Day
              </div>
              <p className="text-2xl font-bold text-amber-600 mt-1">{summary.half_day}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-orange-600" />
                Overtime
              </div>
              <p className="text-2xl font-bold text-orange-600 mt-1">{summary.overtime}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ফিল্টারসমূহ */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by labour or group name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-full sm:w-44"
        />
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {(projects || []).map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="present">Present</SelectItem>
            <SelectItem value="absent">Absent</SelectItem>
            <SelectItem value="half_day">Half Day</SelectItem>
            <SelectItem value="overtime">Overtime</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* বিষয়বস্তু */}
      {isLoading ? (
        <Card><CardContent className="p-0"><TableSkeleton /></CardContent></Card>
      ) : error ? (
        <Card className="border-red-200">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 text-sm">Failed to load attendance. Please try again.</p>
          </CardContent>
        </Card>
      ) : filteredRecords.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CalendarCheck className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg text-muted-foreground">No Attendance Records</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || projectFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters.'
                : 'Mark attendance for the selected date.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-xs">Labour Name</TableHead>
                  <TableHead className="font-semibold text-xs hidden md:table-cell">Group</TableHead>
                  <TableHead className="font-semibold text-xs hidden lg:table-cell">Project</TableHead>
                  <TableHead className="font-semibold text-xs">Date</TableHead>
                  <TableHead className="font-semibold text-xs">Status</TableHead>
                  <TableHead className="font-semibold text-xs text-right hidden sm:table-cell">Hours</TableHead>
                  <TableHead className="font-semibold text-xs text-right hidden sm:table-cell">OT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((r) => (
                  <TableRow key={r.id} className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors">
                    <TableCell className="text-sm font-medium">{r.labour.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{r.labour.group?.name || '—'}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{r.projectId}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{format(parseISO(r.date), 'dd MMM yyyy')}</TableCell>
                    <TableCell>{statusBadge(r.status)}</TableCell>
                    <TableCell className="text-right text-sm hidden sm:table-cell">{r.hoursWorked ?? '—'}h</TableCell>
                    <TableCell className="text-right text-sm hidden sm:table-cell">{r.overtime ? `${r.overtime}h` : '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* উপস্থিতি চিহ্নিতকরণ ডায়ালগ */}
      <MarkAttendanceDialog open={markOpen} onClose={() => setMarkOpen(false)} />
    </div>
  )
}