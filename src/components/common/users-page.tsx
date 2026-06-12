'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, queryKeys } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
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
import { Plus, Users, Shield, Trash2, Pencil, Clock } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

interface UserRecord {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
}

const ROLES = ['admin', 'supervisor', 'hr_manager', 'accountant', 'store_manager', 'client', 'labour']

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  supervisor: 'Supervisor',
  hr_manager: 'HR Manager',
  accountant: 'Accountant',
  store_manager: 'Store Manager',
  client: 'Client',
  labour: 'Labour',
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-5 w-24 rounded-full ml-auto" />
        </div>
      ))}
    </div>
  )
}

export function UsersPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editUser, setEditUser] = useState<UserRecord | null>(null)
  const [deactivateId, setDeactivateId] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'labour', phone: '' })
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.users,
    queryFn: () => api.get('/api/auth/users').then((r) => {
      const d = r.data as any
      return Array.isArray(d) ? d : d?.users || []
    }),
  })
  const users = data as UserRecord[]

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/api/auth/register', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
      toast.success('User created!')
      setCreateOpen(false)
      setCreateForm({ name: '', email: '', password: '', role: 'labour', phone: '' })
    },
    onError: (err: Error) => toast.error(err.message || 'Failed'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api.put(`/api/auth/users/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
      toast.success('User updated!')
      setEditUser(null)
    },
    onError: (err: Error) => toast.error(err.message || 'Failed'),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.put(`/api/auth/users/${id}`, { isActive: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
      toast.success('User deactivated')
      setDeactivateId(null)
    },
    onError: (err: Error) => toast.error(err.message || 'Failed'),
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!createForm.name || !createForm.email || !createForm.password) {
      toast.error('Name, email, and password are required')
      return
    }
    createMutation.mutate({
      ...createForm,
      phone: createForm.phone || null,
    })
  }

  const roleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-amber-600 text-white border-0'
      case 'supervisor': return 'bg-emerald-600 text-white border-0'
      case 'hr_manager': return 'bg-violet-600 text-white border-0'
      case 'accountant': return 'bg-teal-600 text-white border-0'
      case 'store_manager': return 'bg-orange-600 text-white border-0'
      default: return 'bg-secondary text-secondary-foreground'
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? 'Loading...' : users ? `${users.length} user(s)` : 'No users'}
          </p>
        </div>
        <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />Add User
        </Button>
      </div>

      {isLoading ? (
        <Card><CardContent className="p-0"><TableSkeleton /></CardContent></Card>
      ) : error ? (
        <Card className="border-red-200"><CardContent className="p-8 text-center"><p className="text-red-600 text-sm">Failed to load users.</p></CardContent></Card>
      ) : users && users.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg text-muted-foreground">No Users Found</h3>
          </CardContent>
        </Card>
      ) : users ? (
        <Card className="overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-xs">Name</TableHead>
                  <TableHead className="font-semibold text-xs">Email</TableHead>
                  <TableHead className="font-semibold text-xs">Role</TableHead>
                  <TableHead className="font-semibold text-xs">Status</TableHead>
                  <TableHead className="font-semibold text-xs hidden md:table-cell">Last Login</TableHead>
                  <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors">
                    <TableCell className="text-sm font-medium">{u.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs', roleBadgeColor(u.role))}>
                        <Shield className="h-3 w-3 mr-1" />
                        {roleLabels[u.role] || u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs', u.isActive ? 'bg-emerald-600 text-white border-0' : 'bg-slate-500 text-white border-0')}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {u.lastLoginAt ? (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(parseISO(u.lastLoginAt), 'dd MMM yyyy HH:mm')}
                        </span>
                      ) : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditUser(u)}><Pencil className="h-3.5 w-3.5" /></Button>
                        {u.isActive && (
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setDeactivateId(u.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : null}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Add User</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} placeholder="Full name" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} placeholder="email@example.com" required />
              </div>
              <div className="space-y-2">
                <Label>Password *</Label>
                <Input type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} placeholder="Min 6 characters" required minLength={6} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={createForm.role} onValueChange={(v) => setCreateForm({ ...createForm, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (<SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} placeholder="Phone" />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit User - {editUser?.name}</DialogTitle></DialogHeader>
          {editUser && (
            <EditUserForm user={editUser} onClose={() => setEditUser(null)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Deactivate Dialog */}
      <AlertDialog open={!!deactivateId} onOpenChange={() => setDeactivateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate User?</AlertDialogTitle>
            <AlertDialogDescription>This will deactivate the user. They will not be able to log in.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={() => deactivateId && deactivateMutation.mutate(deactivateId)} disabled={deactivateMutation.isPending}>
              {deactivateMutation.isPending ? 'Deactivating...' : 'Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function EditUserForm({ user, onClose }: { user: UserRecord; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [role, setRole] = useState(user.role)
  const [isActive, setIsActive] = useState(user.isActive)

  const mutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.put(`/api/auth/users/${user.id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
      toast.success('User updated!')
      onClose()
    },
    onError: (err: Error) => toast.error(err.message || 'Failed'),
  })

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      mutation.mutate({ role, isActive })
    }} className="space-y-4">
      <div className="space-y-2">
        <Label>Role</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (<SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="edit-active" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" />
        <Label htmlFor="edit-active">Active</Label>
      </div>
      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={mutation.isPending}>Update</Button>
      </DialogFooter>
    </form>
  )
}