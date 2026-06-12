'use client'

import { useState, useEffect, useMemo } from 'react'
import { api } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  BarChart3, TrendingUp, DollarSign, Clock, Star, Plus, Pencil, Trash2,
  Search,
} from 'lucide-react'

interface ProductivityLog {
  id: string
  projectId: string
  projectName?: string
  date: string
  resourceType: string
  resourceName: string
  task: string
  outputUnit: string
  outputQty: number
  hoursWorked: number
  cost: number
  quality: string
  notes: string
}

interface Project {
  id: string
  name: string
}

const emptyForm = {
  projectId: '', resourceType: 'labour', resourceName: '',
  task: '', outputUnit: 'units', outputQty: '0', hoursWorked: '0',
  cost: '0', quality: 'good', notes: '',
}

const qualityColors: Record<string, string> = {
  excellent: 'bg-emerald-100 text-emerald-800',
  good: 'bg-green-100 text-green-800',
  average: 'bg-yellow-100 text-yellow-800',
  poor: 'bg-red-100 text-red-800',
}

const resourceTypeLabels: Record<string, string> = {
  labour: 'Labour',
  employee: 'Employee',
  crew: 'Crew',
}

export function ResourceProductivity() {
  const [logs, setLogs] = useState<ProductivityLog[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [projectFilter, setProjectFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<ProductivityLog | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = () => {
      setLoading(true)
      Promise.all([
        api.get('/api/resources/productivity'),
        api.get('/api/projects'),
      ])
        .then(([logRes, projRes]) => {
          if (cancelled) return
          if (logRes.success && logRes.data) setLogs(logRes.data)
          else if (logRes.error) setError(logRes.error)
          if (projRes.success && projRes.data) setProjects(projRes.data)
        })
        .catch((err) => { if (!cancelled) setError(err.message || 'Failed to load') })
        .finally(() => { if (!cancelled) setLoading(false) })
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    let items = logs
    if (projectFilter !== 'all') items = items.filter(l => l.projectId === projectFilter)
    if (typeFilter !== 'all') items = items.filter(l => l.resourceType === typeFilter)
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(l =>
        l.resourceName?.toLowerCase().includes(q) ||
        l.task?.toLowerCase().includes(q) ||
        l.projectName?.toLowerCase().includes(q)
      )
    }
    return items
  }, [logs, projectFilter, typeFilter, search])

  const stats = useMemo(() => {
    const totalHours = logs.reduce((s, l) => s + (l.hoursWorked || 0), 0)
    const totalOutput = logs.reduce((s, l) => s + (l.outputQty || 0), 0)
    const totalCost = logs.reduce((s, l) => s + (l.cost || 0), 0)
    const avgProductivity = totalHours > 0 ? totalOutput / totalHours : 0
    return { totalHours, totalOutput, totalCost, avgProductivity }
  }, [logs])

  const openCreate = () => {
    setEditItem(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (item: ProductivityLog) => {
    setEditItem(item)
    setForm({
      projectId: item.projectId,
      resourceType: item.resourceType,
      resourceName: item.resourceName || '',
      task: item.task || '',
      outputUnit: item.outputUnit || 'units',
      outputQty: String(item.outputQty || 0),
      hoursWorked: String(item.hoursWorked || 0),
      cost: String(item.cost || 0),
      quality: item.quality || 'good',
      notes: item.notes || '',
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      date: new Date().toISOString(),
      outputQty: parseFloat(form.outputQty) || 0,
      hoursWorked: parseFloat(form.hoursWorked) || 0,
      cost: parseFloat(form.cost) || 0,
    }
    const res = editItem
      ? await api.put(`/api/resources/productivity/${editItem.id}`, payload)
      : await api.post('/api/resources/productivity', payload)
    if (res.success) {
      setDialogOpen(false)
      const reload = await api.get('/api/resources/productivity')
      if (reload.success && reload.data) setLogs(reload.data)
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this productivity log?')) return
    const res = await api.del(`/api/resources/productivity/${id}`)
    if (res.success) setLogs(prev => prev.filter(l => l.id !== id))
  }

  if (loading) return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-lg" />)}
      </div>
      <Skeleton className="h-96 rounded-lg" />
    </div>
  )

  if (error) return <div className="p-6"><p className="text-red-500">{error}</p></div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productivity Tracking</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Log Productivity</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg"><TrendingUp className="h-5 w-5 text-amber-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Output/Hour</p>
                <p className="text-2xl font-bold">{stats.avgProductivity.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><Clock className="h-5 w-5 text-blue-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{stats.totalHours.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg"><DollarSign className="h-5 w-5 text-emerald-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold">${stats.totalCost.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg"><Star className="h-5 w-5 text-purple-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Quality Avg</p>
                <p className="text-2xl font-bold capitalize">
                  {(() => {
                    const qCount: Record<string, number> = {}
                    logs.forEach(l => { if (l.quality) qCount[l.quality] = (qCount[l.quality] || 0) + 1 })
                    const entries = Object.entries(qCount)
                    if (entries.length === 0) return 'N/A'
                    entries.sort((a, b) => b[1] - a[1])
                    return entries[0][0]
                  })()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Projects" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="labour">Labour</SelectItem>
            <SelectItem value="employee">Employee</SelectItem>
            <SelectItem value="crew">Crew</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Productivity Logs ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Output</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Quality</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground py-8">No productivity logs found</TableCell></TableRow>
                ) : filtered.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">{new Date(log.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{log.resourceName || '-'}</TableCell>
                    <TableCell><Badge variant="outline">{resourceTypeLabels[log.resourceType] || log.resourceType}</Badge></TableCell>
                    <TableCell className="text-sm">{log.projectName || '-'}</TableCell>
                    <TableCell className="text-sm">{log.task || '-'}</TableCell>
                    <TableCell>{log.outputQty} {log.outputUnit || ''}</TableCell>
                    <TableCell>{log.hoursWorked}h</TableCell>
                    <TableCell>${log.cost.toLocaleString()}</TableCell>
                    <TableCell><Badge className={qualityColors[log.quality] || ''}>{log.quality || 'N/A'}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(log)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(log.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit Productivity Log' : 'Log Productivity'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project *</Label>
                <Select value={form.projectId} onValueChange={v => setForm(p => ({ ...p, projectId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>
                    {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Resource Type</Label>
                <Select value={form.resourceType} onValueChange={v => setForm(p => ({ ...p, resourceType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="labour">Labour</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="crew">Crew</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Resource Name *</Label>
                <Input value={form.resourceName} onChange={e => setForm(p => ({ ...p, resourceName: e.target.value }))} placeholder="Worker/crew name" required />
              </div>
              <div className="space-y-2">
                <Label>Task</Label>
                <Input value={form.task} onChange={e => setForm(p => ({ ...p, task: e.target.value }))} placeholder="Task description" />
              </div>
              <div className="space-y-2">
                <Label>Output Quantity</Label>
                <Input type="number" value={form.outputQty} onChange={e => setForm(p => ({ ...p, outputQty: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Output Unit</Label>
                <Input value={form.outputUnit} onChange={e => setForm(p => ({ ...p, outputUnit: e.target.value }))} placeholder="units, sqft, etc" />
              </div>
              <div className="space-y-2">
                <Label>Hours Worked</Label>
                <Input type="number" step="0.5" value={form.hoursWorked} onChange={e => setForm(p => ({ ...p, hoursWorked: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Cost ($)</Label>
                <Input type="number" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Quality</Label>
                <Select value={form.quality} onValueChange={v => setForm(p => ({ ...p, quality: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : editItem ? 'Update' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
