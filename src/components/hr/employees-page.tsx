'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppStore, api, queryKeys } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
import { Plus, Search, Users, Pencil, Trash2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

// ──────────────────────────────────────────
// প্রকারভেদ
// ──────────────────────────────────────────

interface Employee {
  id: string
  empCode: string
  name: string
  email: string | null
  phone: string | null
  department: string | null
  designation: string | null
  joinDate: string | null
  basicSalary: number
  isActive: boolean
  createdAt: string
}

// ──────────────────────────────────────────
// সহায়ক ফাংশনসমূহ
// ──────────────────────────────────────────

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

const DEPARTMENTS = [
  'Management', 'Engineering', 'Site Supervision', 'Accounts', 'HR', 'Procurement',
  'Quality Control', 'Safety', 'Administration', 'IT',
]

// ──────────────────────────────────────────
// স্কেলেটন
// ──────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-16 rounded-full ml-auto" />
        </div>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────
// তৈরি / সম্পাদনা ডায়ালগ
// ──────────────────────────────────────────

function EmployeeFormDialog({ employee, open, onClose }: { employee: Employee | null; open: boolean; onClose: () => void }) {
  const isEdit = !!employee
  const [form, setForm] = useState({
    empCode: employee?.empCode || '',
    name: employee?.name || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    department: employee?.department || '',
    designation: employee?.designation || '',
    joinDate: employee?.joinDate ? format(parseISO(employee.joinDate), 'yyyy-MM-dd') : '',
    basicSalary: employee?.basicSalary?.toString() || '0',
  })
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      isEdit ? api.put(`/api/employees/${employee!.id}`, body) : api.post('/api/employees', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees })
      toast.success(isEdit ? 'Employee updated!' : 'Employee created!')
      onClose()
    },
    onError: (err: Error) => toast.error(err.message || 'Failed'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.empCode.trim() || !form.name.trim()) {
      toast.error('Employee code and name are required')
      return
    }
    mutation.mutate({
      empCode: form.empCode.trim(),
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      department: form.department.trim() || null,
      designation: form.designation.trim() || null,
      joinDate: form.joinDate || null,
      basicSalary: parseFloat(form.basicSalary) || 0,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Emp Code *</Label>
              <Input value={form.empCode} onChange={(e) => setForm({ ...form, empCode: e.target.value })} placeholder="e.g. EMP-001" required disabled={isEdit} />
            </div>
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" required />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Designation</Label>
              <Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="e.g. Site Engineer" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Join Date</Label>
              <Input type="date" value={form.joinDate} onChange={(e) => setForm({ ...form, joinDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Basic Salary (₹)</Label>
              <Input type="number" value={form.basicSalary} onChange={(e) => setForm({ ...form, basicSalary: e.target.value })} placeholder="0" />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ──────────────────────────────────────────
// প্রধান উপাদান
// ──────────────────────────────────────────

export function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: employees, isLoading, error } = useQuery({
    queryKey: [...queryKeys.employees, { search: searchQuery, department: departmentFilter, status: statusFilter }],
    queryFn: () => {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (departmentFilter && departmentFilter !== 'all') params.set('department', departmentFilter)
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      const qs = params.toString()
      return api.get<{ success: boolean; data: Employee[] }>(`/api/employees${qs ? `?${qs}` : ''}`).then((r) => r.data)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/api/employees/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees })
      toast.success('Employee deleted')
      setDeleteId(null)
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete'),
  })

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? 'Loading...' : employees ? `${employees.length} employee(s)` : 'No employees'}
          </p>
        </div>
        <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* অনুসন্ধান ও ফিল্টার */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, code, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* বিষয়বস্তু */}
      {isLoading ? (
        <Card><CardContent className="p-0"><TableSkeleton /></CardContent></Card>
      ) : error ? (
        <Card className="border-red-200">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 text-sm">Failed to load employees. Please try again.</p>
          </CardContent>
        </Card>
      ) : employees && employees.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg text-muted-foreground">No Employees Found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || departmentFilter !== 'all' || statusFilter !== 'all'
                ? 'Try a different search or filter.'
                : 'Add your first employee to get started.'}
            </p>
          </CardContent>
        </Card>
      ) : employees ? (
        <Card className="overflow-hidden">
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-xs">Emp Code</TableHead>
                  <TableHead className="font-semibold text-xs">Name</TableHead>
                  <TableHead className="font-semibold text-xs hidden md:table-cell">Email</TableHead>
                  <TableHead className="font-semibold text-xs hidden lg:table-cell">Phone</TableHead>
                  <TableHead className="font-semibold text-xs hidden lg:table-cell">Department</TableHead>
                  <TableHead className="font-semibold text-xs hidden xl:table-cell">Designation</TableHead>
                  <TableHead className="font-semibold text-xs hidden md:table-cell">Join Date</TableHead>
                  <TableHead className="font-semibold text-xs text-right">Salary</TableHead>
                  <TableHead className="font-semibold text-xs">Status</TableHead>
                  <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp.id} className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors">
                    <TableCell className="text-sm font-mono text-muted-foreground">{emp.empCode}</TableCell>
                    <TableCell className="text-sm font-medium">{emp.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{emp.email || '—'}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{emp.phone || '—'}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{emp.department || '—'}</TableCell>
                    <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">{emp.designation || '—'}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {emp.joinDate ? format(parseISO(emp.joinDate), 'dd MMM yyyy') : '—'}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">{formatCurrency(emp.basicSalary)}</TableCell>
                    <TableCell>
                      <Badge className={cn(
                        'text-xs',
                        emp.isActive ? 'bg-emerald-600 text-white border-0' : 'bg-secondary text-secondary-foreground'
                      )}>
                        {emp.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditEmployee(emp)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeleteId(emp.id)}
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
        </Card>
      ) : null}

      {/* তৈরির ডায়ালগ */}
      <EmployeeFormDialog employee={null} open={createOpen} onClose={() => setCreateOpen(false)} />

      {/* সম্পাদনা ডায়ালগ */}
      <EmployeeFormDialog employee={editEmployee} open={!!editEmployee} onClose={() => setEditEmployee(null)} />

      {/* মুছে ফেলার নিশ্চিতকরণ */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this employee and all associated records (leave requests, loans). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}