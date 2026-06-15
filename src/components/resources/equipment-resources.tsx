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
import { Search, Wrench, Eye, UserPlus, History } from 'lucide-react'
import { cn } from '@/lib/utils'

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────

interface Asset {
  id: string
  name: string
  code: string
  type: string
  category: string | null
  purchaseDate: string | null
  purchasePrice: number
  currentValue: number
  status: string
  location: string | null
}

interface Project {
  id: string
  name: string
  code: string
  status: string
}

interface Assignment {
  id: string
  resourceName: string
  projectId: string
  projectName: string
  role: string
  status: string
}

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

const statusColors: Record<string, string> = {
  available: 'bg-emerald-600 text-white border-0',
  issued: 'bg-blue-600 text-white border-0',
  maintenance: 'bg-amber-600 text-white border-0',
  disposed: 'bg-red-600 text-white border-0',
}

// ──────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────

export function EquipmentResources() {
  const [equipment, setEquipment] = useState<Asset[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewItem, setViewItem] = useState<Asset | null>(null)
  const [assignOpen, setAssignOpen] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<Asset | null>(null)
  const [assignForm, setAssignForm] = useState({ projectId: '', role: '', startDate: '', notes: '' })

  useEffect(() => {
    Promise.all([
      api.get<Asset[]>('/api/assets?type=equipment'),
      api.get<Assignment[]>('/api/resources/assignments?resourceType=equipment'),
      api.get<Project[]>('/api/projects'),
    ])
      .then(([eqRes, assignRes, projRes]) => {
        if (eqRes.success && eqRes.data) setEquipment(eqRes.data)
        else if (eqRes.error) setError(eqRes.error)
        if (assignRes.success && assignRes.data) setAssignments(assignRes.data)
        if (projRes.success && projRes.data) setProjects(projRes.data)
      })
      .catch((err) => setError(err.message || 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const filteredEquipment = useMemo(() => {
    if (!searchQuery) return equipment
    const q = searchQuery.toLowerCase()
    return equipment.filter((e) =>
      e.name.toLowerCase().includes(q) ||
      e.code.toLowerCase().includes(q) ||
      e.category?.toLowerCase().includes(q)
    )
  }, [equipment, searchQuery])

  const stats = useMemo(() => {
    const total = equipment.length
    const inUse = equipment.filter((e) => e.status === 'issued').length
    const idle = equipment.filter((e) => e.status === 'available').length
    const maintenance = equipment.filter((e) => e.status === 'maintenance').length
    return { total, inUse, idle, maintenance }
  }, [equipment])

  const getAssignment = (assetId: string) => {
    return assignments.find((a) => a.resourceId === assetId && a.status === 'active')
  }

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEquipment || !assignForm.projectId) {
      toast.error('Please select a project')
      return
    }
    api.post('/api/resources/assignments', {
      resourceId: selectedEquipment.id,
      resourceName: selectedEquipment.name,
      resourceType: 'equipment',
      projectId: assignForm.projectId,
      role: assignForm.role,
      startDate: assignForm.startDate,
      notes: assignForm.notes,
    }).then((res) => {
      if (res.success) {
        toast.success('Equipment assigned!')
        setAssignOpen(false)
        setSelectedEquipment(null)
        setAssignForm({ projectId: '', role: '', startDate: '', notes: '' })
        // Refresh
        api.get<Asset[]>('/api/assets?type=equipment').then((r) => {
          if (r.success && r.data) setEquipment(r.data)
        })
        api.get<Assignment[]>('/api/resources/assignments?resourceType=equipment').then((r) => {
          if (r.success && r.data) setAssignments(r.data)
        })
      } else {
        toast.error(res.error || 'Failed')
      }
    }).catch(() => toast.error('Failed'))
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Equipment Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {loading ? 'Loading...' : `${equipment.length} equipment item(s)`}
        </p>
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
                  <Wrench className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Equipment</p>
                  <p className="text-lg font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/50">
                  <Wrench className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">In Use</p>
                  <p className="text-lg font-bold text-blue-600">{stats.inUse}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/50">
                  <Wrench className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Idle</p>
                  <p className="text-lg font-bold text-emerald-600">{stats.idle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/50">
                  <History className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Under Maintenance</p>
                  <p className="text-lg font-bold text-amber-600">{stats.maintenance}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Equipment Table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Equipment Inventory</CardTitle>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search equipment..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
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
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-16 rounded-full ml-auto" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center"><p className="text-red-600 text-sm">{error}</p></div>
          ) : filteredEquipment.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              <Wrench className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <h3 className="font-semibold">No Equipment Found</h3>
              <p className="text-sm mt-1">Add equipment assets to manage them here.</p>
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold text-xs">Name</TableHead>
                    <TableHead className="font-semibold text-xs">Code</TableHead>
                    <TableHead className="font-semibold text-xs hidden md:table-cell">Brand/Model</TableHead>
                    <TableHead className="font-semibold text-xs hidden lg:table-cell">Current Project</TableHead>
                    <TableHead className="font-semibold text-xs hidden lg:table-cell">Operator</TableHead>
                    <TableHead className="font-semibold text-xs">Status</TableHead>
                    <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEquipment.map((eq) => {
                    const assignment = getAssignment(eq.id)
                    return (
                      <TableRow key={eq.id} className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors">
                        <TableCell className="text-sm font-medium">{eq.name}</TableCell>
                        <TableCell className="text-sm font-mono text-muted-foreground">{eq.code}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{eq.category || '—'}</TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground truncate max-w-[180px]">
                          {assignment?.projectName || '—'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {assignment?.role || '—'}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn('text-xs capitalize', statusColors[eq.status] || 'bg-secondary text-secondary-foreground')}>
                            {eq.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setViewItem(eq)}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            {eq.status === 'available' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700"
                                onClick={() => { setSelectedEquipment(eq); setAssignOpen(true) }}
                                title="Assign to Project"
                              >
                                <UserPlus className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-amber-600" />
              {viewItem?.name}
            </DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className="font-mono">{viewItem.code}</Badge>
                <Badge className={cn('text-xs capitalize', statusColors[viewItem.status])}>{viewItem.status}</Badge>
                {viewItem.category && <Badge variant="outline">{viewItem.category}</Badge>}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Purchase Price</span>
                  <p className="font-medium">{formatCurrency(viewItem.purchasePrice)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Current Value</span>
                  <p className="font-bold text-lg">{formatCurrency(viewItem.currentValue)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Location</span>
                  <p className="font-medium">{viewItem.location || '—'}</p>
                </div>
                {viewItem.purchaseDate && (
                  <div>
                    <span className="text-muted-foreground">Purchase Date</span>
                    <p className="font-medium">{viewItem.purchaseDate}</p>
                  </div>
                )}
              </div>
              {getAssignment(viewItem.id) && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Current Assignment</h4>
                  <div className="p-3 rounded-lg border bg-muted/30 text-sm">
                    <p className="font-medium">{getAssignment(viewItem.id)?.projectName}</p>
                    <p className="text-muted-foreground">{getAssignment(viewItem.id)?.role}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign {selectedEquipment?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssign} className="space-y-4">
            <div className="space-y-2">
              <Label>Project *</Label>
              <Select value={assignForm.projectId} onValueChange={(v) => setAssignForm({ ...assignForm, projectId: v })}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {projects.filter((p) => p.status === 'active').map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Role / Operator</Label>
              <Input value={assignForm.role} onChange={(e) => setAssignForm({ ...assignForm, role: e.target.value })} placeholder="e.g. Crane Operator" />
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={assignForm.startDate} onChange={(e) => setAssignForm({ ...assignForm, startDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={assignForm.notes} onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })} placeholder="Assignment notes..." rows={3} />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">Assign</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}