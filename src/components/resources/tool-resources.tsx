'use client'

import { useState, useEffect, useMemo } from 'react'
import { api, useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Search, Wrench, Eye, ArrowDownToLine, ArrowUpFromLine, QrCode } from 'lucide-react'
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
  status: string
  location: string | null
  currentValue: number
}

interface Assignment {
  id: string
  resourceName: string
  projectName: string
  role: string
  status: string
}

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

const statusColors: Record<string, string> = {
  available: 'bg-emerald-600 text-white border-0',
  issued: 'bg-blue-600 text-white border-0',
  maintenance: 'bg-amber-600 text-white border-0',
  disposed: 'bg-red-600 text-white border-0',
}

// ──────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────

export function ToolResources() {
  const [tools, setTools] = useState<Asset[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewItem, setViewItem] = useState<Asset | null>(null)
  const [issueOpen, setIssueOpen] = useState(false)
  const [selectedTool, setSelectedTool] = useState<Asset | null>(null)
  const [issueForm, setIssueForm] = useState({ issuedTo: '', location: '', notes: '' })

  useEffect(() => {
    Promise.all([
      api.get<Asset[]>('/api/assets?type=tool'),
      api.get<Assignment[]>('/api/resources/assignments?resourceType=tool'),
    ])
      .then(([tRes, assignRes]) => {
        if (tRes.success && tRes.data) setTools(tRes.data)
        else if (tRes.error) setError(tRes.error)
        if (assignRes.success && assignRes.data) setAssignments(assignRes.data)
      })
      .catch((err) => setError(err.message || 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const filteredTools = useMemo(() => {
    if (!searchQuery) return tools
    const q = searchQuery.toLowerCase()
    return tools.filter((t) =>
      t.name.toLowerCase().includes(q) ||
      t.code.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q) ||
      t.location?.toLowerCase().includes(q)
    )
  }, [tools, searchQuery])

  const stats = useMemo(() => {
    const total = tools.length
    const issued = tools.filter((t) => t.status === 'issued').length
    const available = tools.filter((t) => t.status === 'available').length
    const maintenance = tools.filter((t) => t.status === 'maintenance').length
    return { total, issued, available, maintenance }
  }, [tools])

  const getAssignment = (id: string) => {
    return assignments.find((a) => a.resourceId === id && a.status === 'active')
  }

  const handleIssue = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTool || !issueForm.issuedTo) {
      toast.error('Please enter who the tool is issued to')
      return
    }
    // Update asset status to issued
    api.put(`/api/assets/${selectedTool.id}`, { status: 'issued', location: issueForm.location })
      .then((res) => {
        if (res.success) {
          toast.success(`Tool issued to ${issueForm.issuedTo}`)
          setIssueOpen(false)
          setSelectedTool(null)
          setIssueForm({ issuedTo: '', location: '', notes: '' })
          refreshData()
        } else {
          toast.error(res.error || 'Failed')
        }
      })
      .catch(() => toast.error('Failed'))
  }

  const handleReturn = (tool: Asset) => {
    const assignment = getAssignment(tool.id)
    api.put(`/api/assets/${tool.id}`, { status: 'available', location: 'Store' })
      .then((res) => {
        if (res.success) {
          if (assignment) {
            api.put(`/api/resources/assignments/${assignment.id}`, { status: 'completed' }).catch(() => {})
          }
          toast.success(`${tool.name} returned to store`)
          refreshData()
        } else {
          toast.error(res.error || 'Failed')
        }
      })
      .catch(() => toast.error('Failed'))
  }

  const refreshData = () => {
    api.get<Asset[]>('/api/assets?type=tool').then((r) => { if (r.success && r.data) setTools(r.data) })
    api.get<Assignment[]>('/api/resources/assignments?resourceType=tool').then((r) => { if (r.success && r.data) setAssignments(r.data) })
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tool Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {loading ? 'Loading...' : `${tools.length} tool(s)`}
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
                  <p className="text-xs text-muted-foreground">Total Tools</p>
                  <p className="text-lg font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/50">
                  <ArrowDownToLine className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Issued</p>
                  <p className="text-lg font-bold text-blue-600">{stats.issued}</p>
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
                  <Wrench className="h-4 w-4 text-amber-600" />
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

      {/* Tools Table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Tool Inventory</CardTitle>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search tools..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
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
          ) : filteredTools.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              <Wrench className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <h3 className="font-semibold">No Tools Found</h3>
              <p className="text-sm mt-1">Add tool assets to manage them here.</p>
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold text-xs">Name</TableHead>
                    <TableHead className="font-semibold text-xs">Code</TableHead>
                    <TableHead className="font-semibold text-xs hidden md:table-cell">Type</TableHead>
                    <TableHead className="font-semibold text-xs hidden lg:table-cell">Issued To</TableHead>
                    <TableHead className="font-semibold text-xs hidden lg:table-cell">Location</TableHead>
                    <TableHead className="font-semibold text-xs">Status</TableHead>
                    <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTools.map((t) => {
                    const assignment = getAssignment(t.id)
                    return (
                      <TableRow key={t.id} className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors">
                        <TableCell className="text-sm font-medium">{t.name}</TableCell>
                        <TableCell className="text-sm font-mono text-muted-foreground">{t.code}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{t.category || 'General'}</TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {assignment?.role || '—'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{t.location || 'Store'}</TableCell>
                        <TableCell>
                          <Badge className={cn('text-xs capitalize', statusColors[t.status] || 'bg-secondary text-secondary-foreground')}>
                            {t.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setViewItem(t)}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="QR Code">
                              <QrCode className="h-3.5 w-3.5" />
                            </Button>
                            {t.status === 'available' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700"
                                onClick={() => { setSelectedTool(t); setIssueOpen(true) }}
                                title="Issue"
                              >
                                <ArrowDownToLine className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {t.status === 'issued' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700"
                                onClick={() => handleReturn(t)}
                                title="Return"
                              >
                                <ArrowUpFromLine className="h-3.5 w-3.5" />
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
        <DialogContent className="sm:max-w-md">
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
                  <span className="text-muted-foreground">Location</span>
                  <p className="font-medium">{viewItem.location || 'Store'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Value</span>
                  <p className="font-medium">₹{viewItem.currentValue.toLocaleString('en-IN')}</p>
                </div>
              </div>
              {getAssignment(viewItem.id) && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Currently Issued To</h4>
                  <div className="p-3 rounded-lg border bg-muted/30 text-sm">
                    <p className="font-medium">{getAssignment(viewItem.id)?.role}</p>
                    <p className="text-muted-foreground">{getAssignment(viewItem.id)?.projectName}</p>
                  </div>
                </div>
              )}
              {/* QR Code Placeholder */}
              <div className="flex justify-center py-4">
                <div className="w-32 h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground">
                  <QrCode className="h-10 w-10 mb-1 opacity-40" />
                  <span className="text-xs">QR Code</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Issue Dialog */}
      <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Issue {selectedTool?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleIssue} className="space-y-4">
            <div className="space-y-2">
              <Label>Issued To *</Label>
              <Input value={issueForm.issuedTo} onChange={(e) => setIssueForm({ ...issueForm, issuedTo: e.target.value })} placeholder="Worker or person name" required />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={issueForm.location} onChange={(e) => setIssueForm({ ...issueForm, location: e.target.value })} placeholder="Site or location" />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input value={issueForm.notes} onChange={(e) => setIssueForm({ ...issueForm, notes: e.target.value })} placeholder="Optional notes" />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIssueOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">Issue Tool</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}