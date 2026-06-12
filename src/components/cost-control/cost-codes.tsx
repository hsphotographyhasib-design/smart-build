'use client'

import { useState } from 'react'
import { api } from '@/lib/store'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import {
  Plus, Pencil, Trash2, ChevronDown, ChevronRight, Search, Tag, FolderTree,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ───
interface CostCodeNode {
  id: string
  code: string
  name: string
  level: number
  description?: string
  unitType?: string
  isActive: boolean
  sortOrder: number
  parentId?: string
  parent?: { id: string; code: string; name: string } | null
  children?: CostCodeNode[]
  _count?: { budgetItems: number; children: number }
}

interface CostCodeFlat {
  id: string
  code: string
  name: string
  level: number
  description?: string
  unitType?: string
  isActive: boolean
  sortOrder: number
  parentId?: string
  parent?: { id: string; code: string; name: string } | null
  children: Array<{ id: string; code: string; name: string; level: number; isActive: boolean; sortOrder: number }>
  _count?: { budgetItems: number; children: number }
}

const levelLabels: Record<number, string> = { 1: 'Division', 2: 'Category', 3: 'Subcategory', 4: 'Line Item' }
const levelColors: Record<number, string> = {
  1: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  2: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  3: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  4: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200',
}

export function CostCodes() {
  const queryClient = useQueryClient()
  const [levelFilter, setLevelFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editCode, setEditCode] = useState<CostCodeNode | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const { data: costCodes = [], isLoading } = useQuery({
    queryKey: ['cost-codes', levelFilter],
    queryFn: () => {
      const params = new URLSearchParams()
      if (levelFilter !== 'all') params.set('level', levelFilter)
      params.set('includeUsage', 'true')
      return api.get<CostCodeFlat[]>(`/api/cost-control/cost-codes?${params}`).then(r => r.data || [])
    },
  })

  // Parent codes for create dialog
  const { data: parentCodes = [] } = useQuery({
    queryKey: ['cost-codes-parents'],
    queryFn: () => api.get<CostCodeFlat[]>('/api/cost-control/cost-codes').then(r => r.data || []),
  })

  const createMutation = useMutation({
    mutationFn: (body: any) => api.post('/api/cost-control/cost-codes', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-codes'] })
      setCreateDialogOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: any) => api.put(`/api/cost-control/cost-codes/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-codes'] })
      setEditCode(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/api/cost-control/cost-codes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-codes'] })
      setDeleteConfirm(null)
    },
  })

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Build tree from flat list (only root nodes at top level)
  const roots = costCodes.filter(c => !c.parentId)
  const filteredRoots = search
    ? roots.filter(r => {
        const matches = (node: CostCodeFlat) =>
          node.code.toLowerCase().includes(search.toLowerCase()) ||
          node.name.toLowerCase().includes(search.toLowerCase()) ||
          node.children.some(c => matches(c as unknown as CostCodeFlat))
        return matches(r)
      })
    : roots

  const totalCodes = costCodes.length
  const activeCodes = costCodes.filter(c => c.isActive).length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cost Codes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage hierarchical cost coding structure ({totalCodes} total, {activeCodes} active)
          </p>
        </div>
        <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> New Cost Code
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cost codes..."
                className="pl-9 h-9 text-sm"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-40 h-9 text-sm">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="1">Division (L1)</SelectItem>
                <SelectItem value="2">Category (L2)</SelectItem>
                <SelectItem value="3">Subcategory (L3)</SelectItem>
                <SelectItem value="4">Line Item (L4)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tree Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 rounded-lg" />)}
            </div>
          ) : filteredRoots.length === 0 ? (
            <div className="py-16 text-center">
              <FolderTree className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No cost codes found. Create the first division to build your cost structure.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-8"></TableHead>
                  <TableHead className="text-xs">Code</TableHead>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Level</TableHead>
                  <TableHead className="text-xs">Unit</TableHead>
                  <TableHead className="text-xs text-center">Active</TableHead>
                  <TableHead className="text-xs text-center">Usage</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoots.map(root => (
                  <CostCodeRow
                    key={root.id}
                    node={root}
                    depth={0}
                    expandedIds={expandedIds}
                    toggleExpand={toggleExpand}
                    onEdit={setEditCode}
                    onDelete={setDeleteConfirm}
                    onToggleActive={(id, active) => updateMutation.mutate({ id, isActive: active })}
                    levelColors={levelColors}
                    levelLabels={levelLabels}
                    search={search}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Cost Code</DialogTitle>
            <DialogDescription>Add a new cost code to the hierarchy</DialogDescription>
          </DialogHeader>
          <CreateCostCodeForm
            parentCodes={parentCodes}
            onSubmit={(data) => createMutation.mutate(data)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editCode} onOpenChange={() => setEditCode(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Cost Code</DialogTitle>
            <DialogDescription>Update {editCode?.code} — {editCode?.name}</DialogDescription>
          </DialogHeader>
          {editCode && (
            <EditCostCodeForm
              code={editCode}
              onSubmit={(data) => updateMutation.mutate({ id: editCode.id, ...data })}
              isLoading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Cost Code</DialogTitle>
            <DialogDescription>Are you sure? This action cannot be undone. Cost codes with budget items or children cannot be deleted.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline" size="sm">Cancel</Button></DialogClose>
            <Button variant="destructive" size="sm" disabled={deleteMutation.isPending} onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Tree Row Component ───
function CostCodeRow({ node, depth, expandedIds, toggleExpand, onEdit, onDelete, onToggleActive, levelColors, levelLabels, search }: {
  node: any; depth: number; expandedIds: Set<string>; toggleExpand: (id: string) => void
  onEdit: (node: any) => void; onDelete: (id: string) => void; onToggleActive: (id: string, active: boolean) => void
  levelColors: Record<number, string>; levelLabels: Record<number, string>; search: string
}) {
  const hasChildren = node.children && node.children.length > 0
  const isExpanded = expandedIds.has(node.id)
  const children = (node.children || []) as any[]

  const matchesSearch = !search ||
    node.code.toLowerCase().includes(search.toLowerCase()) ||
    node.name.toLowerCase().includes(search.toLowerCase())

  return (
    <>
      <TableRow className={cn(!matchesSearch && 'opacity-50')}>
        <TableCell>
          {hasChildren ? (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleExpand(node.id)}>
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>
          ) : <span className="w-6" />}
        </TableCell>
        <TableCell>
          <span className="font-mono text-sm" style={{ paddingLeft: `${depth * 20}px` }}>
            {node.code}
          </span>
        </TableCell>
        <TableCell>
          <span className="text-sm" style={{ paddingLeft: `${depth * 20}px` }}>
            {node.name}
          </span>
          {node.description && <p className="text-[11px] text-muted-foreground mt-0.5" style={{ paddingLeft: `${depth * 20}px` }}>{node.description}</p>}
        </TableCell>
        <TableCell>
          <Badge variant="secondary" className={cn('text-[10px] px-1.5 py-0', levelColors[node.level] || '')}>
            L{node.level} {levelLabels[node.level] || ''}
          </Badge>
        </TableCell>
        <TableCell className="text-xs text-muted-foreground">{node.unitType || '—'}</TableCell>
        <TableCell className="text-center">
          <Switch checked={node.isActive} onCheckedChange={(checked) => onToggleActive(node.id, checked)} className="scale-75" />
        </TableCell>
        <TableCell className="text-center text-xs text-muted-foreground">{node._count?.budgetItems || 0}</TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(node)}>
              <Pencil className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(node.id)}>
              <Trash2 className="h-3 w-3 text-red-500" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {isExpanded && hasChildren && children.map(child => (
        <CostCodeRow
          key={child.id}
          node={child}
          depth={depth + 1}
          expandedIds={expandedIds}
          toggleExpand={toggleExpand}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
          levelColors={levelColors}
          levelLabels={levelLabels}
          search={search}
        />
      ))}
    </>
  )
}

// ─── Forms ───
function CreateCostCodeForm({ parentCodes, onSubmit, isLoading }: { parentCodes: any[]; onSubmit: (data: any) => void; isLoading: boolean }) {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [level, setLevel] = useState('1')
  const [parentId, setParentId] = useState('')
  const [description, setDescription] = useState('')
  const [unitType, setUnitType] = useState('')

  return (
    <div className="space-y-3 py-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-sm">Code *</Label>
          <Input className="h-9 text-sm" placeholder="e.g. 01-000" value={code} onChange={e => setCode(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-sm">Name *</Label>
          <Input className="h-9 text-sm" placeholder="e.g. General Requirements" value={name} onChange={e => setName(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-sm">Level</Label>
          <Select value={level} onValueChange={v => { setLevel(v); setParentId('') }}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 — Division</SelectItem>
              <SelectItem value="2">2 — Category</SelectItem>
              <SelectItem value="3">3 — Subcategory</SelectItem>
              <SelectItem value="4">4 — Line Item</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-sm">Unit Type</Label>
          <Select value={unitType} onValueChange={setUnitType}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ls">Lump Sum (LS)</SelectItem>
              <SelectItem value="ea">Each (EA)</SelectItem>
              <SelectItem value="sqm">Sq. Meter (SQM)</SelectItem>
              <SelectItem value="sqft">Sq. Foot (SQFT)</SelectItem>
              <SelectItem value="m">Meter (M)</SelectItem>
              <SelectItem value="rmt">Running Meter (RMT)</SelectItem>
              <SelectItem value="kg">Kilogram (KG)</SelectItem>
              <SelectItem value="cum">Cubic Meter (CUM)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {Number(level) > 1 && (
        <div className="space-y-1">
          <Label className="text-sm">Parent Cost Code</Label>
          <Select value={parentId} onValueChange={setParentId}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Select parent..." /></SelectTrigger>
            <SelectContent className="max-h-60">
              {parentCodes.filter(p => p.level === Number(level) - 1).map(p => (
                <SelectItem key={p.id} value={p.id}>{p.code} — {p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-1">
        <Label className="text-sm">Description</Label>
        <Textarea className="text-sm min-h-[60px]" placeholder="Optional description..." value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <DialogFooter>
        <DialogClose asChild><Button variant="outline" size="sm">Cancel</Button></DialogClose>
        <Button size="sm" className="bg-amber-600 hover:bg-amber-700" disabled={!code || !name || isLoading} onClick={() => onSubmit({ code, name, level: Number(level), parentId: parentId || null, description, unitType: unitType || null })}>
          {isLoading ? 'Creating...' : 'Create'}
        </Button>
      </DialogFooter>
    </div>
  )
}

function EditCostCodeForm({ code, onSubmit, isLoading }: { code: CostCodeNode; onSubmit: (data: any) => void; isLoading: boolean }) {
  const [name, setName] = useState(code.name)
  const [description, setDescription] = useState(code.description || '')
  const [unitType, setUnitType] = useState(code.unitType || '')

  return (
    <div className="space-y-3 py-2">
      <div className="space-y-1">
        <Label className="text-sm">Code</Label>
        <Input className="h-9 text-sm bg-muted" value={code.code} disabled />
      </div>
      <div className="space-y-1">
        <Label className="text-sm">Name *</Label>
        <Input className="h-9 text-sm" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label className="text-sm">Unit Type</Label>
        <Select value={unitType} onValueChange={setUnitType}>
          <SelectTrigger className="h-9"><SelectValue placeholder="Select..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ls">Lump Sum (LS)</SelectItem>
            <SelectItem value="ea">Each (EA)</SelectItem>
            <SelectItem value="sqm">Sq. Meter (SQM)</SelectItem>
            <SelectItem value="sqft">Sq. Foot (SQFT)</SelectItem>
            <SelectItem value="m">Meter (M)</SelectItem>
            <SelectItem value="rmt">Running Meter (RMT)</SelectItem>
            <SelectItem value="kg">Kilogram (KG)</SelectItem>
            <SelectItem value="cum">Cubic Meter (CUM)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-sm">Description</Label>
        <Textarea className="text-sm min-h-[60px]" value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <DialogFooter>
        <DialogClose asChild><Button variant="outline" size="sm">Cancel</Button></DialogClose>
        <Button size="sm" className="bg-amber-600 hover:bg-amber-700" disabled={!name || isLoading} onClick={() => onSubmit({ name, description, unitType: unitType || null })}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </div>
  )
}