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
import { Search, Truck, Eye, ArrowRightLeft, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

// ──────────────────────────────────────────
// ধরন
// ──────────────────────────────────────────

interface Asset {
  id: string
  name: string
  code: string
  type: string
  category: string | null
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
// সহায়ক ফাংশনসমূহ
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
// প্রধান কম্পোনেন্ট
// ──────────────────────────────────────────

export function VehicleResources() {
  const [vehicles, setVehicles] = useState<Asset[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewItem, setViewItem] = useState<Asset | null>(null)
  const [actionOpen, setActionOpen] = useState(false)
  const [actionType, setActionType] = useState<'assign' | 'transfer'>('assign')
  const [selectedVehicle, setSelectedVehicle] = useState<Asset | null>(null)
  const [actionForm, setActionForm] = useState({ projectId: '', role: '', startDate: '', notes: '' })

  useEffect(() => {
    Promise.all([
      api.get<Asset[]>('/api/assets?type=vehicle'),
      api.get<Assignment[]>('/api/resources/assignments?resourceType=vehicle'),
      api.get<Project[]>('/api/projects'),
    ])
      .then(([vRes, assignRes, projRes]) => {
        if (vRes.success && vRes.data) setVehicles(vRes.data)
        else if (vRes.error) setError(vRes.error)
        if (assignRes.success && assignRes.data) setAssignments(assignRes.data)
        if (projRes.success && projRes.data) setProjects(projRes.data)
      })
      .catch((err) => setError(err.message || 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const filteredVehicles = useMemo(() => {
    if (!searchQuery) return vehicles
    const q = searchQuery.toLowerCase()
    return vehicles.filter((v) =>
      v.name.toLowerCase().includes(q) ||
      v.code.toLowerCase().includes(q) ||
      v.category?.toLowerCase().includes(q)
    )
  }, [vehicles, searchQuery])

  const stats = useMemo(() => {
    const total = vehicles.length
    const inUse = vehicles.filter((v) => v.status === 'issued').length
    const available = vehicles.filter((v) => v.status === 'available').length
    const maintenance = vehicles.filter((v) => v.status === 'maintenance').length
    return { total, inUse, available, maintenance }
  }, [vehicles])

  const getAssignment = (id: string) => {
    return assignments.find((a) => a.resourceId === id && a.status === 'active')
  }

  const openAction = (vehicle: Asset, type: 'assign' | 'transfer') => {
    setSelectedVehicle(vehicle)
    setActionType(type)
    const current = getAssignment(vehicle.id)
    if (current) {
      setActionForm({ projectId: current.projectId, role: current.role, startDate: '', notes: '' })
    } else {
      setActionForm({ projectId: '', role: '', startDate: '', notes: '' })
    }
    setActionOpen(true)
  }

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVehicle || !actionForm.projectId) {
      toast.error('Please select a project')
      return
    }

    if (actionType === 'transfer' && getAssignment(selectedVehicle.id)) {
      // বর্তমান বরাদ্দ সম্পন্ন করুন এবং নতুনটি তৈরি করুন
      const currentAssignment = getAssignment(selectedVehicle.id)!
      api.put(`/api/resources/assignments/${currentAssignment.id}`, { status: 'transferred' })
        .then(() => {
          api.post('/api/resources/assignments', {
            resourceId: selectedVehicle.id,
            resourceName: selectedVehicle.name,
            resourceType: 'vehicle',
            projectId: actionForm.projectId,
            role: actionForm.role || 'Driver',
            startDate: actionForm.startDate,
            notes: actionForm.notes,
          }).then((res) => {
            if (res.success) {
              toast.success('Vehicle transferred!')
              setActionOpen(false)
              refreshData()
            } else {
              toast.error(res.error || 'Failed')
            }
          })
        })
    } else {
      api.post('/api/resources/assignments', {
        resourceId: selectedVehicle.id,
        resourceName: selectedVehicle.name,
        resourceType: 'vehicle',
        projectId: actionForm.projectId,
        role: actionForm.role || 'Driver',
        startDate: actionForm.startDate,
        notes: actionForm.notes,
      }).then((res) => {
        if (res.success) {
          toast.success('Vehicle assigned!')
          setActionOpen(false)
          refreshData()
        } else {
          toast.error(res.error || 'Failed')
        }
      })
    }
  }

  const refreshData = () => {
    api.get<Asset[]>('/api/assets?type=vehicle').then((r) => { if (r.success && r.data) setVehicles(r.data) })
    api.get<Assignment[]>('/api/resources/assignments?resourceType=vehicle').then((r) => { if (r.success && r.data) setAssignments(r.data) })
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vehicle Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {loading ? 'Loading...' : `${vehicles.length} vehicle(s)`}
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
                  <Truck className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Vehicles</p>
                  <p className="text-lg font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/50">
                  <Truck className="h-4 w-4 text-blue-600" />
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
                  <Truck className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Available</p>
                  <p className="text-lg font-bold text-emerald-600">{stats.available}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/50">
                  <Truck className="h-4 w-4 text-amber-600" />
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

      {/* Vehicles Table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Vehicle Fleet</CardTitle>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search vehicles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
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
          ) : filteredVehicles.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              <Truck className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <h3 className="font-semibold">No Vehicles Found</h3>
              <p className="text-sm mt-1">Add vehicle assets to manage them here.</p>
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold text-xs">Name</TableHead>
                    <TableHead className="font-semibold text-xs">Code</TableHead>
                    <TableHead className="font-semibold text-xs hidden md:table-cell">Driver/Assigned To</TableHead>
                    <TableHead className="font-semibold text-xs hidden lg:table-cell">Project</TableHead>
                    <TableHead className="font-semibold text-xs hidden lg:table-cell">Fuel Cost Est.</TableHead>
                    <TableHead className="font-semibold text-xs hidden xl:table-cell">Utilization</TableHead>
                    <TableHead className="font-semibold text-xs">Status</TableHead>
                    <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((v) => {
                    const assignment = getAssignment(v.id)
                    return (
                      <TableRow key={v.id} className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors">
                        <TableCell className="text-sm font-medium">{v.name}</TableCell>
                        <TableCell className="text-sm font-mono text-muted-foreground">{v.code}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {assignment?.role || '—'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground truncate max-w-[180px]">
                          {assignment?.projectName || '—'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {v.currentValue > 0 ? formatCurrency(Math.round(v.currentValue * 0.15 / 365)) : '—'}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-sm">
                          {v.status === 'issued' ? (
                            <div className="flex items-center gap-2">
                              <div className="h-2 flex-1 bg-muted rounded-full max-w-[80px]">
                                <div className="h-2 bg-amber-500 rounded-full w-3/4" />
                              </div>
                              <span className="text-xs text-muted-foreground">75%</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">0%</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn('text-xs capitalize', statusColors[v.status] || 'bg-secondary text-secondary-foreground')}>
                            {v.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setViewItem(v)}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            {v.status === 'available' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700"
                                onClick={() => openAction(v, 'assign')}
                                title="Assign"
                              >
                                <UserPlus className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {v.status === 'issued' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                                onClick={() => openAction(v, 'transfer')}
                                title="Transfer"
                              >
                                <ArrowRightLeft className="h-3.5 w-3.5" />
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
              <Truck className="h-5 w-5 text-amber-600" />
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
                {getAssignment(viewItem.id) && (
                  <div>
                    <span className="text-muted-foreground">Assigned To</span>
                    <p className="font-medium">{getAssignment(viewItem.id)!.projectName}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign/Transfer Dialog */}
      <Dialog open={actionOpen} onOpenChange={setActionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'assign' ? `Assign ${selectedVehicle?.name}` : `Transfer ${selectedVehicle?.name}`}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAction} className="space-y-4">
            <div className="space-y-2">
              <Label>Project *</Label>
              <Select value={actionForm.projectId} onValueChange={(v) => setActionForm({ ...actionForm, projectId: v })}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {projects.filter((p) => p.status === 'active').map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Driver / Assigned To</Label>
              <Input value={actionForm.role} onChange={(e) => setActionForm({ ...actionForm, role: e.target.value })} placeholder="e.g. Driver Name" />
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={actionForm.startDate} onChange={(e) => setActionForm({ ...actionForm, startDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={actionForm.notes} onChange={(e) => setActionForm({ ...actionForm, notes: e.target.value })} placeholder="Notes..." rows={3} />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setActionOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
                {actionType === 'assign' ? 'Assign' : 'Transfer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}