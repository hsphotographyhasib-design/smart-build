'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppStore, api, queryKeys } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
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
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Plus, Search, Users, ChevronDown, ChevronUp, Pencil, Trash2, UserPlus, Power, UserX } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

// ──────────────────────────────────────────
// প্রকারভেদ
// ──────────────────────────────────────────

interface Labour {
  id: string
  name: string
  phone: string | null
  aadhaar: string | null
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

// ──────────────────────────────────────────
// সহায়ক ফাংশনসমূহ
// ──────────────────────────────────────────

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

// ──────────────────────────────────────────
// স্কেলেটন
// ──────────────────────────────────────────

function CardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────
// দল তৈরি ডায়ালগ
// ──────────────────────────────────────────

function CreateGroupDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ name: '', rate: '' })
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/api/labour-groups', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.labourGroups })
      toast.success('Group created!')
      onClose()
      setForm({ name: '', rate: '' })
    },
    onError: (err: Error) => toast.error(err.message || 'Failed'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Group name is required'); return }
    mutation.mutate({
      name: form.name.trim(),
      rate: parseFloat(form.rate) || 0,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Labour Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Group Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Masons, Carpenters" required />
          </div>
          <div className="space-y-2">
            <Label>Default Daily Rate (₹)</Label>
            <Input type="number" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} placeholder="0" />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating...' : 'Create Group'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ──────────────────────────────────────────
// সদস্য যোগ ডায়ালগ
// ──────────────────────────────────────────

function AddMemberDialog({ groupId, groupName, open, onClose }: { groupId: string; groupName: string; open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ name: '', phone: '', aadhaar: '', dailyRate: '' })
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post(`/api/labour-groups/${groupId}/members`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.labourGroups })
      toast.success('Member added!')
      onClose()
      setForm({ name: '', phone: '', aadhaar: '', dailyRate: '' })
    },
    onError: (err: Error) => toast.error(err.message || 'Failed'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Name is required'); return }
    mutation.mutate({
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      aadhaar: form.aadhaar.trim() || null,
      dailyRate: parseFloat(form.dailyRate) || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Member to {groupName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Labour name" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" />
            </div>
            <div className="space-y-2">
              <Label>Aadhaar</Label>
              <Input value={form.aadhaar} onChange={(e) => setForm({ ...form, aadhaar: e.target.value })} placeholder="Aadhaar number" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Daily Rate (₹)</Label>
            <Input type="number" value={form.dailyRate} onChange={(e) => setForm({ ...form, dailyRate: e.target.value })} placeholder="Leave empty for group default" />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={mutation.isPending}>
              {mutation.isPending ? 'Adding...' : 'Add Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ──────────────────────────────────────────
// দল কার্ড
// ──────────────────────────────────────────

function GroupCard({ group, onAddMember, onToggleMember, onDeleteMember, onDeleteGroup }: {
  group: LabourGroup
  onAddMember: (g: LabourGroup) => void
  onToggleMember: (id: string, active: boolean) => void
  onDeleteMember: (id: string) => void
  onDeleteGroup: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className={cn('transition-colors', expanded && 'ring-2 ring-amber-500/30')}>
      <CardHeader className="pb-2 cursor-pointer select-none" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/50">
              <Users className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-base">{group.name}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {group._count.labours} active member{group._count.labours !== 1 ? 's' : ''} &middot; {formatCurrency(group.rate)}/day
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => { e.stopPropagation(); onAddMember(group) }}
              title="Add Member"
            >
              <UserPlus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={(e) => { e.stopPropagation(); onDeleteGroup(group.id) }}
              title="Delete Group"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </div>
      </CardHeader>

      {expanded && group.labours && group.labours.length > 0 && (
        <CardContent className="pt-0">
          <div className="max-h-96 overflow-y-auto custom-scrollbar rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-xs">Name</TableHead>
                  <TableHead className="font-semibold text-xs hidden sm:table-cell">Phone</TableHead>
                  <TableHead className="font-semibold text-xs text-right">Daily Rate</TableHead>
                  <TableHead className="font-semibold text-xs">Status</TableHead>
                  <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.labours.map((labour) => (
                  <TableRow key={labour.id} className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors">
                    <TableCell className="text-sm font-medium">{labour.name}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{labour.phone || '—'}</TableCell>
                    <TableCell className="text-right text-sm">{formatCurrency(labour.dailyRate)}</TableCell>
                    <TableCell>
                      <Badge className={cn(
                        'text-xs',
                        labour.isActive ? 'bg-emerald-600 text-white border-0' : 'bg-secondary text-secondary-foreground'
                      )}>
                        {labour.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => onToggleMember(labour.id, !labour.isActive)}
                          title={labour.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {labour.isActive ? (
                            <UserX className="h-3.5 w-3.5 text-red-500" />
                          ) : (
                            <Power className="h-3.5 w-3.5 text-emerald-500" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => onDeleteMember(labour.id)}
                          title="Remove Member"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      )}

      {expanded && (!group.labours || group.labours.length === 0) && (
        <CardContent className="pt-0">
          <div className="text-center py-6 text-muted-foreground text-sm">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
            No members in this group yet.
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// ──────────────────────────────────────────
// প্রধান উপাদান
// ──────────────────────────────────────────

export function LabourGroupsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [addMemberGroup, setAddMemberGroup] = useState<LabourGroup | null>(null)
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null)
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: groups, isLoading, error } = useQuery({
    queryKey: [...queryKeys.labourGroups, { search: searchQuery }],
    queryFn: () =>
      api.get<{ success: boolean; data: LabourGroup[] }>('/api/labour-groups').then((r) => r.data),
  })

  const filteredGroups = (groups || []).filter((g) =>
    !searchQuery || g.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.put(`/api/labour/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.labourGroups })
      toast.success('Member status updated')
    },
    onError: (err: Error) => toast.error(err.message || 'Failed'),
  })

  const deleteMemberMutation = useMutation({
    mutationFn: (id: string) => api.del(`/api/labour/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.labourGroups })
      toast.success('Member removed')
      setDeleteMemberId(null)
    },
    onError: (err: Error) => toast.error(err.message || 'Failed'),
  })

  const deleteGroupMutation = useMutation({
    mutationFn: (id: string) => api.del(`/api/labour-groups/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.labourGroups })
      toast.success('Group deleted')
      setDeleteGroupId(null)
    },
    onError: (err: Error) => toast.error(err.message || 'Failed'),
  })

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Labour Groups</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? 'Loading...' : groups ? `${groups.length} group(s)` : 'No groups'}
          </p>
        </div>
        <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Group
        </Button>
      </div>

      {/* অনুসন্ধান */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* বিষয়বস্তু */}
      {isLoading ? (
        <CardsSkeleton />
      ) : error ? (
        <Card className="border-red-200">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 text-sm">Failed to load labour groups. Please try again.</p>
          </CardContent>
        </Card>
      ) : filteredGroups.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg text-muted-foreground">No Labour Groups Found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery ? 'Try a different search term.' : 'Create your first labour group to get started.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onAddMember={setAddMemberGroup}
              onToggleMember={(id, active) => toggleMutation.mutate({ id, isActive: active })}
              onDeleteMember={setDeleteMemberId}
              onDeleteGroup={setDeleteGroupId}
            />
          ))}
        </div>
      )}

      {/* তৈরির ডায়ালগ */}
      <CreateGroupDialog open={createOpen} onClose={() => setCreateOpen(false)} />

      {/* সদস্য যোগ ডায়ালগ */}
      <AddMemberDialog
        groupId={addMemberGroup?.id || ''}
        groupName={addMemberGroup?.name || ''}
        open={!!addMemberGroup}
        onClose={() => setAddMemberGroup(null)}
      />

      {/* দল মুছে ফেলার নিশ্চিতকরণ */}
      <AlertDialog open={!!deleteGroupId} onOpenChange={() => setDeleteGroupId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Labour Group?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this group and all its members. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => deleteGroupId && deleteGroupMutation.mutate(deleteGroupId)}
              disabled={deleteGroupMutation.isPending}
            >
              {deleteGroupMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* সদস্য মুছে ফেলার নিশ্চিতকরণ */}
      <AlertDialog open={!!deleteMemberId} onOpenChange={() => setDeleteMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this labour member from the group. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => deleteMemberId && deleteMemberMutation.mutate(deleteMemberId)}
              disabled={deleteMemberMutation.isPending}
            >
              {deleteMemberMutation.isPending ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}