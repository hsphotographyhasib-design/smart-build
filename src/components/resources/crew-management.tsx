'use client'

import { useState, useEffect, useMemo } from 'react'
import { api, useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { Plus, Search, Users, Pencil, Trash2, ChevronDown, ChevronUp, X, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

// ──────────────────────────────────────────
// ধরন
// ──────────────────────────────────────────

interface Crew {
  id: string
  name: string
  type: string
  leaderId: string
  leaderName: string
  description: string
  status: string
  members: CrewMember[]
  _count: { members: number }
}

interface CrewMember {
  id: string
  crewId: string
  workerId: string
  workerName: string
  role: string
}

interface Worker {
  id: string
  name: string
  groupName: string
}

const crewTypes = [
  { value: 'electrical', label: 'Electrical' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'mechanical', label: 'Mechanical' },
  { value: 'civil', label: 'Civil' },
  { value: 'finishing', label: 'Finishing' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'general', label: 'General' },
]

const typeColors: Record<string, string> = {
  electrical: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  hvac: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  mechanical: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  civil: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  finishing: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  maintenance: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  general: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

// ──────────────────────────────────────────
// প্রধান কম্পোনেন্ট
// ──────────────────────────────────────────

export function CrewManagement() {
  const [crews, setCrews] = useState<Crew[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCrew, setExpandedCrew] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editCrew, setEditCrew] = useState<Crew | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // ফর্ম অবস্থা
  const [form, setForm] = useState({
    name: '',
    type: 'general',
    leaderId: '',
    description: '',
  })
  const [members, setMembers] = useState<Array<{ workerId: string; role: string }>>([])
  const [newMemberWorker, setNewMemberWorker] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchCrews = () => {
    setLoading(true)
    Promise.all([
      api.get<Crew[]>('/api/resources/crews'),
      api.get<LabourGroup[]>('/api/labour-groups').catch(() => ({ success: false, data: [] as LabourGroup[] })),
    ])
      .then(([crewRes, groupRes]) => {
        if (crewRes.success && crewRes.data) setCrews(crewRes.data)
        else if (crewRes.error) setError(crewRes.error)

        if (groupRes.success && groupRes.data) {
          const allWorkers: Worker[] = []
          groupRes.data.forEach((g) => {
            if (g.labours) {
              g.labours.forEach((l) => {
                allWorkers.push({ id: l.id, name: l.name, groupName: g.name })
              })
            }
          })
          setWorkers(allWorkers)
        }
      })
      .catch((err) => setError(err.message || 'Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    let cancelled = false
    const load = () => {
      setLoading(true)
      Promise.all([
        api.get('/api/resources/crews'),
        api.get('/api/labour-groups'),
      ])
        .then(([crewRes, groupRes]) => {
          if (cancelled) return
          if (crewRes.success && crewRes.data) setCrews(crewRes.data)
          else if (crewRes.error) setError(crewRes.error)
          if (groupRes.success && groupRes.data) {
            const allWorkers: Worker[] = []
            groupRes.data.forEach((g) => {
              if (g.labours) {
                g.labours.forEach((l) => {
                  allWorkers.push({ id: l.id, name: l.name, groupName: g.name })
                })
              }
            })
            setWorkers(allWorkers)
          }
        })
        .catch((err) => { if (!cancelled) setError(err.message || 'Failed to load') })
        .finally(() => { if (!cancelled) setLoading(false) })
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filteredCrews = useMemo(() => {
    if (!searchQuery) return crews
    const q = searchQuery.toLowerCase()
    return crews.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q) ||
      c.leaderName?.toLowerCase().includes(q)
    )
  }, [crews, searchQuery])

  const stats = useMemo(() => {
    const total = crews.length
    const active = crews.filter((c) => c.status === 'active').length
    const memberCount = crews.reduce((sum, c) => sum + (c.members?.length || c._count?.members || 0), 0)
    const avgSize = total > 0 ? Math.round(memberCount / total) : 0
    return { total, active, memberCount, avgSize }
  }, [crews])

  const resetForm = () => {
    setForm({ name: '', type: 'general', leaderId: '', description: '' })
    setMembers([])
    setNewMemberWorker('')
    setNewMemberRole('')
  }

  const openCreate = () => {
    setEditCrew(null)
    resetForm()
    setDialogOpen(true)
  }

  const openEdit = (crew: Crew) => {
    setEditCrew(crew)
    setForm({
      name: crew.name,
      type: crew.type,
      leaderId: crew.leaderId || '',
      description: crew.description || '',
    })
    setMembers(
      (crew.members || []).map((m) => ({ workerId: m.workerId, role: m.role }))
    )
    setNewMemberWorker('')
    setNewMemberRole('')
    setDialogOpen(true)
  }

  const addMember = () => {
    if (!newMemberWorker) return
    if (members.some((m) => m.workerId === newMemberWorker)) {
      toast.error('Worker already in crew')
      return
    }
    setMembers([...members, { workerId: newMemberWorker, role: newMemberRole || 'Member' }])
    setNewMemberWorker('')
    setNewMemberRole('')
  }

  const removeMember = (workerId: string) => {
    setMembers(members.filter((m) => m.workerId !== workerId))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Crew name is required'); return }

    setSubmitting(true)
    const body = {
      name: form.name.trim(),
      type: form.type,
      leaderId: form.leaderId,
      description: form.description,
      members: members.map((m) => ({ workerId: m.workerId, role: m.role })),
    }

    const url = editCrew ? `/api/resources/crews/${editCrew.id}` : '/api/resources/crews'
    const method = editCrew ? api.put : api.post
    method(url, body)
      .then((res) => {
        if (res.success) {
          toast.success(editCrew ? 'Crew updated!' : 'Crew created!')
          setDialogOpen(false)
          resetForm()
          fetchCrews()
        } else {
          toast.error(res.error || 'Failed')
        }
      })
      .catch(() => toast.error('Failed'))
      .finally(() => setSubmitting(false))
  }

  const handleDelete = () => {
    if (!deleteId) return
    setSubmitting(true)
    api.del(`/api/resources/crews/${deleteId}`)
      .then((res) => {
        if (res.success) {
          toast.success('Crew deleted')
          setDeleteId(null)
          fetchCrews()
        } else {
          toast.error(res.error || 'Failed')
        }
      })
      .catch(() => toast.error('Failed'))
      .finally(() => setSubmitting(false))
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Crew Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? 'Loading...' : `${crews.length} crew(s)`}
          </p>
        </div>
        <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />Create Crew
        </Button>
      </div>

      {/* Stats Row */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4 space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-6 w-12" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/50">
                  <Users className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Crews</p>
                  <p className="text-lg font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/50">
                  <Users className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Active</p>
                  <p className="text-lg font-bold text-emerald-600">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/50">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Members</p>
                  <p className="text-lg font-bold text-blue-600">{stats.memberCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/50">
                  <Users className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Size</p>
                  <p className="text-lg font-bold">{stats.avgSize}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search crews..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
      </div>

      {/* Crews Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4 space-y-3"><Skeleton className="h-5 w-32" /><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-16" /></CardContent></Card>
          ))}
        </div>
      ) : error ? (
        <Card className="border-red-200"><CardContent className="p-8 text-center"><p className="text-red-600 text-sm">{error}</p></CardContent></Card>
      ) : filteredCrews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <h3 className="font-semibold">No Crews Found</h3>
            <p className="text-sm mt-1">Create your first crew to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCrews.map((crew) => {
            const memberCount = crew.members?.length || crew._count?.members || 0
            const isExpanded = expandedCrew === crew.id
            return (
              <Card key={crew.id} className={cn('transition-colors', isExpanded && 'ring-2 ring-amber-500/30')}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base cursor-pointer" onClick={() => setExpandedCrew(isExpanded ? null : crew.id)}>
                        {crew.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={cn('text-xs capitalize', typeColors[crew.type] || 'bg-secondary')}>{crew.type}</Badge>
                        {crew.leaderName && <span className="text-xs text-muted-foreground">Leader: {crew.leaderName}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(crew)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeleteId(crew.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
                    <Badge className={cn(
                      'text-xs',
                      crew.status === 'active' ? 'bg-emerald-600 text-white border-0' : 'bg-secondary text-secondary-foreground'
                    )}>{crew.status}</Badge>
                  </div>

                  {isExpanded && crew.description && (
                    <p className="text-sm text-muted-foreground mb-3">{crew.description}</p>
                  )}

                  {isExpanded && (
                    <div className="max-h-64 overflow-y-auto custom-scrollbar rounded-lg border">
                      {(!crew.members || crew.members.length === 0) ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">No members in this crew.</div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="text-xs font-semibold">Name</TableHead>
                              <TableHead className="text-xs font-semibold">Role</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {crew.members.map((m) => (
                              <TableRow key={m.id} className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20">
                                <TableCell className="text-sm font-medium">{m.workerName}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">{m.role}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>{editCrew ? 'Edit Crew' : 'Create Crew'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Crew name" required />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {crewTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Leader</Label>
              <Select value={form.leaderId} onValueChange={(v) => setForm({ ...form, leaderId: v })}>
                <SelectTrigger><SelectValue placeholder="Search & select leader" /></SelectTrigger>
                <SelectContent>
                  {workers.map((w) => (
                    <SelectItem key={w.id} value={w.id}>{w.name} ({w.groupName})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Crew description..." rows={3} />
            </div>

            {/* Members Management */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Members ({members.length})</Label>
              </div>
              <div className="flex gap-2">
                <Select value={newMemberWorker} onValueChange={setNewMemberWorker}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Select worker" /></SelectTrigger>
                  <SelectContent>
                    {workers
                      .filter((w) => !members.some((m) => m.workerId === w.id))
                      .map((w) => (
                        <SelectItem key={w.id} value={w.id}>{w.name} ({w.groupName})</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Role"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-32"
                />
                <Button type="button" variant="outline" size="sm" onClick={addMember} disabled={!newMemberWorker}>
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
              {members.length > 0 && (
                <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1">
                  {members.map((m, idx) => {
                    const worker = workers.find((w) => w.id === m.workerId)
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 rounded border text-sm">
                        <div>
                          <span className="font-medium">{worker?.name || 'Unknown'}</span>
                          <span className="text-muted-foreground ml-2">({m.role})</span>
                        </div>
                        <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => removeMember(m.workerId)}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={submitting}>
                {submitting ? 'Saving...' : (editCrew ? 'Update' : 'Create')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Crew?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete this crew. Members will not be removed from the system.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete} disabled={submitting}>
              {submitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}