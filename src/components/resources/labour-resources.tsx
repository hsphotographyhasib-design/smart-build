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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { Search, Users, Eye, Plus, Star, HardHat } from 'lucide-react'
import { cn } from '@/lib/utils'

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────

interface Labour {
  id: string
  name: string
  phone: string | null
  dailyRate: number
  isActive: boolean
}

interface LabourGroup {
  id: string
  name: string
  rate: number
  isActive: boolean
  labours: Labour[]
  _count: { labours: number }
}

interface Assignment {
  id: string
  resourceId: string
  resourceName: string
  resourceType: string
  projectName: string
  role: string
  shift: string
  status: string
}

interface WorkerWithAssignment extends Labour {
  groupName: string
  groupId: string
  assignment: Assignment | null
}

interface Skill {
  id: string
  name: string
  category: string
}

interface WorkerSkill {
  id: string
  workerId: string
  skillId: string
  proficiency: string
  skill?: Skill
}

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

const proficiencyColors: Record<string, string> = {
  expert: 'bg-emerald-600 text-white border-0',
  advanced: 'bg-blue-600 text-white border-0',
  intermediate: 'bg-amber-600 text-white border-0',
  beginner: 'bg-slate-500 text-white border-0',
}

// ──────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────

export function LabourResources() {
  const [workers, setWorkers] = useState<WorkerWithAssignment[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewWorker, setViewWorker] = useState<WorkerWithAssignment | null>(null)
  const [workerSkills, setWorkerSkills] = useState<WorkerSkill[]>([])

  // Skill matching
  const [skillSearch, setSkillSearch] = useState('')
  const [allSkills, setAllSkills] = useState<Skill[]>([])
  const [allWorkerSkills, setAllWorkerSkills] = useState<WorkerSkill[]>([])
  const [addSkillOpen, setAddSkillOpen] = useState(false)
  const [skillForm, setSkillForm] = useState({ workerId: '', skillId: '', proficiency: 'intermediate' })

  useEffect(() => {
    Promise.all([
      api.get<LabourGroup[]>('/api/labour-groups'),
      api.get<Assignment[]>('/api/resources/assignments?resourceType=labour'),
    ])
      .then(([groupsRes, assignRes]) => {
        const groups = (groupsRes.success && groupsRes.data) ? groupsRes.data : []
        const assignList = (assignRes.success && assignRes.data) ? assignRes.data : []
        setAssignments(assignList)

        const allWorkers: WorkerWithAssignment[] = []
        groups.forEach((g) => {
          if (g.labours) {
            g.labours.forEach((l) => {
              const assignment = assignList.find((a) => a.resourceId === l.id && a.status === 'active')
              allWorkers.push({
                ...l,
                groupName: g.name,
                groupId: g.id,
                assignment: assignment || null,
              })
            })
          }
        })
        setWorkers(allWorkers)
      })
      .catch((err) => setError(err.message || 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  // Load skills data
  useEffect(() => {
    Promise.all([
      api.get<Skill[]>('/api/resources/skills').catch(() => ({ success: false, data: [] })),
      api.get<WorkerSkill[]>('/api/resources/worker-skills').catch(() => ({ success: false, data: [] })),
    ]).then(([skillsRes, wsRes]) => {
      if (skillsRes.success && skillsRes.data) setAllSkills(skillsRes.data)
      if (wsRes.success && wsRes.data) setAllWorkerSkills(wsRes.data)
    })
  }, [])

  const filteredWorkers = useMemo(() => {
    if (!searchQuery) return workers
    const q = searchQuery.toLowerCase()
    return workers.filter((w) =>
      w.name.toLowerCase().includes(q) ||
      w.groupName.toLowerCase().includes(q) ||
      w.assignment?.projectName?.toLowerCase().includes(q)
    )
  }, [workers, searchQuery])

  const filteredSkillMatches = useMemo(() => {
    if (!skillSearch || allWorkerSkills.length === 0) return []
    const q = skillSearch.toLowerCase()
    const matchingSkillIds = allSkills
      .filter((s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q))
      .map((s) => s.id)

    const matchedWorkers = allWorkerSkills
      .filter((ws) => matchingSkillIds.includes(ws.skillId) || ws.skill?.name?.toLowerCase().includes(q))
      .map((ws) => {
        const worker = workers.find((w) => w.id === ws.workerId)
        return {
          ...ws,
          workerName: worker?.name || 'Unknown',
          groupName: worker?.groupName || '',
        }
      })
    return matchedWorkers
  }, [skillSearch, allWorkerSkills, allSkills, workers])

  const stats = useMemo(() => {
    const total = workers.length
    const assigned = workers.filter((w) => w.assignment).length
    const unassigned = total - assigned
    const avgRate = total > 0 ? workers.reduce((sum, w) => sum + w.dailyRate, 0) / total : 0
    return { total, assigned, unassigned, avgRate }
  }, [workers])

  const handleViewWorker = (worker: WorkerWithAssignment) => {
    setViewWorker(worker)
    const wSkills = allWorkerSkills.filter((ws) => ws.workerId === worker.id)
    setWorkerSkills(wSkills)
  }

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault()
    if (!skillForm.workerId || !skillForm.skillId) {
      toast.error('Worker and Skill are required')
      return
    }
    api.post('/api/resources/worker-skills', skillForm)
      .then((res) => {
        if (res.success) {
          toast.success('Skill added!')
          setAddSkillOpen(false)
          setSkillForm({ workerId: '', skillId: '', proficiency: 'intermediate' })
          // Refresh
          api.get<WorkerSkill[]>('/api/resources/worker-skills').then((wsRes) => {
            if (wsRes.success && wsRes.data) setAllWorkerSkills(wsRes.data)
          })
        } else {
          toast.error(res.error || 'Failed')
        }
      })
      .catch(() => toast.error('Failed'))
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Labour Management Center</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? 'Loading...' : `${workers.length} worker(s)`}
          </p>
        </div>
        <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setAddSkillOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />Add Worker Skill
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
                  <p className="text-xs text-muted-foreground">Total Workers</p>
                  <p className="text-lg font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/50">
                  <HardHat className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Assigned</p>
                  <p className="text-lg font-bold text-emerald-600">{stats.assigned}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                  <Users className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Unassigned</p>
                  <p className="text-lg font-bold">{stats.unassigned}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/50">
                  <Star className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Daily Rate</p>
                  <p className="text-lg font-bold">{formatCurrency(stats.avgRate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Workers Table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-sm font-semibold">Workers</CardTitle>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search workers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-16 rounded-full ml-auto" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center"><p className="text-red-600 text-sm">{error}</p></div>
          ) : filteredWorkers.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <h3 className="font-semibold">No Workers Found</h3>
              <p className="text-sm mt-1">Add labour groups and members to see workers here.</p>
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold text-xs">Name</TableHead>
                    <TableHead className="font-semibold text-xs hidden sm:table-cell">Group</TableHead>
                    <TableHead className="font-semibold text-xs hidden md:table-cell">Phone</TableHead>
                    <TableHead className="font-semibold text-xs hidden lg:table-cell text-right">Daily Rate</TableHead>
                    <TableHead className="font-semibold text-xs hidden md:table-cell">Current Project</TableHead>
                    <TableHead className="font-semibold text-xs hidden xl:table-cell">Role</TableHead>
                    <TableHead className="font-semibold text-xs hidden lg:table-cell">Shift</TableHead>
                    <TableHead className="font-semibold text-xs">Status</TableHead>
                    <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkers.map((w) => (
                    <TableRow key={w.id} className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors">
                      <TableCell className="text-sm font-medium">{w.name}</TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{w.groupName}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{w.phone || '—'}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-right font-medium">{formatCurrency(w.dailyRate)}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground truncate max-w-[180px]">
                        {w.assignment?.projectName || '—'}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">{w.assignment?.role || '—'}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">
                        {w.assignment?.shift ? (
                          <Badge className={cn(
                            'text-xs capitalize border-0',
                            w.assignment.shift === 'day' ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' :
                            w.assignment.shift === 'night' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                            'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                          )}>{w.assignment.shift}</Badge>
                        ) : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(
                          'text-xs',
                          w.assignment ? 'bg-emerald-600 text-white border-0' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border-0'
                        )}>
                          {w.assignment ? 'Assigned' : 'Available'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleViewWorker(w)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skill Matching Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Skill Matching</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by trade or skill name..."
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {skillSearch && filteredSkillMatches.length === 0 && (
            <div className="py-8 text-center text-muted-foreground text-sm">No matching workers found for this skill.</div>
          )}
          {filteredSkillMatches.length > 0 && (
            <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-2">
              {filteredSkillMatches.map((ws) => (
                <div key={ws.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">{ws.workerName}</p>
                    <p className="text-xs text-muted-foreground">{ws.groupName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {ws.skill && <Badge variant="outline" className="text-xs">{ws.skill.name}</Badge>}
                    <Badge className={cn('text-xs capitalize', proficiencyColors[ws.proficiency] || 'bg-secondary')}>
                      {ws.proficiency}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Worker Details Dialog */}
      <Dialog open={!!viewWorker} onOpenChange={() => setViewWorker(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HardHat className="h-5 w-5 text-amber-600" />
              {viewWorker?.name}
            </DialogTitle>
          </DialogHeader>
          {viewWorker && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className="font-mono">{viewWorker.groupName}</Badge>
                <Badge className={cn(
                  'text-xs',
                  viewWorker.assignment ? 'bg-emerald-600 text-white border-0' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border-0'
                )}>
                  {viewWorker.assignment ? 'Assigned' : 'Available'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Phone</span>
                  <p className="font-medium">{viewWorker.phone || '—'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Daily Rate</span>
                  <p className="font-medium">{formatCurrency(viewWorker.dailyRate)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Current Project</span>
                  <p className="font-medium">{viewWorker.assignment?.projectName || 'None'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Role</span>
                  <p className="font-medium">{viewWorker.assignment?.role || 'None'}</p>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Skills</h4>
                {workerSkills.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No skills recorded.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {workerSkills.map((ws) => (
                      <Badge key={ws.id} className={cn('text-xs capitalize', proficiencyColors[ws.proficiency] || 'bg-secondary')}>
                        {ws.skill?.name || 'Unknown'} - {ws.proficiency}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Assignment History */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Assignment History</h4>
                {assignments.filter((a) => a.resourceId === viewWorker.id).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No assignment history.</p>
                ) : (
                  <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1">
                    {assignments.filter((a) => a.resourceId === viewWorker.id).map((a) => (
                      <div key={a.id} className="flex items-center justify-between p-2 rounded border text-sm">
                        <div>
                          <span className="font-medium">{a.projectName}</span>
                          <span className="text-muted-foreground ml-2">{a.role}</span>
                        </div>
                        <Badge className={cn('text-xs capitalize', a.status === 'active' ? 'bg-emerald-600 text-white border-0' : 'bg-secondary text-secondary-foreground')}>
                          {a.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Skill Dialog */}
      <Dialog open={addSkillOpen} onOpenChange={setAddSkillOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Worker Skill</DialogTitle></DialogHeader>
          <form onSubmit={handleAddSkill} className="space-y-4">
            <div className="space-y-2">
              <Label>Worker</Label>
              <Select value={skillForm.workerId} onValueChange={(v) => setSkillForm({ ...skillForm, workerId: v })}>
                <SelectTrigger><SelectValue placeholder="Select worker" /></SelectTrigger>
                <SelectContent>
                  {workers.map((w) => (
                    <SelectItem key={w.id} value={w.id}>{w.name} ({w.groupName})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Skill</Label>
              <Select value={skillForm.skillId} onValueChange={(v) => setSkillForm({ ...skillForm, skillId: v })}>
                <SelectTrigger><SelectValue placeholder="Select skill" /></SelectTrigger>
                <SelectContent>
                  {allSkills.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.category})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Proficiency</Label>
              <Select value={skillForm.proficiency} onValueChange={(v) => setSkillForm({ ...skillForm, proficiency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setAddSkillOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">Add Skill</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}