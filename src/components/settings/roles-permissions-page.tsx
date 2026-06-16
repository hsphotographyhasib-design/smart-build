'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { api } from '@/lib/store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Shield,
  Users,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Lock,
  Unlock,
  ChevronRight,
  Search,
  Save,
  Loader2,
  Eye,
  Printer,
  Download,
  CheckCircle2,
  History,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react'

// ──────────────────────────────────────────
// প্রকারভেদ
// ──────────────────────────────────────────

interface Role {
  id: string
  name: string
  code: string
  description: string | null
  level: number
  isSystem: boolean
  userCount: number
  permissionCount: number
}

interface PermissionAction {
  key: string
  label: string
}

interface FeaturePermission {
  feature: string
  actions: Record<string, boolean>
}

interface ModulePermissions {
  module: string
  label: string
  features: FeaturePermission[]
}

interface PermissionMatrix {
  [moduleKey: string]: ModulePermissions
}

interface AuditLogEntry {
  id: string
  timestamp: string
  userId: string
  userName: string
  action: string
  entityType: string
  entityId: string
  entityName: string
  details: string
}

// ──────────────────────────────────────────
// ধ্রুবকসমূহ
// ──────────────────────────────────────────

const ACTION_COLUMNS: PermissionAction[] = [
  { key: 'view', label: 'View' },
  { key: 'create', label: 'Create' },
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' },
  { key: 'approve', label: 'Approve' },
  { key: 'export', label: 'Export' },
  { key: 'print', label: 'Print' },
]

const ACTION_ICONS: Record<string, React.ReactNode> = {
  view: <Eye className="size-3.5" />,
  create: <Plus className="size-3.5" />,
  edit: <Edit2 className="size-3.5" />,
  delete: <Trash2 className="size-3.5" />,
  approve: <CheckCircle2 className="size-3.5" />,
  export: <Download className="size-3.5" />,
  print: <Printer className="size-3.5" />,
}

// ──────────────────────────────────────────
// সহায়ক: সংরক্ষণের জন্য অনুমতি ম্যাট্রিক্সকে কী-মানে রূপান্তর
// ──────────────────────────────────────────

function flattenPermissions(matrix: PermissionMatrix): Record<string, boolean> {
  const flat: Record<string, boolean> = {}
  for (const [, mod] of Object.entries(matrix)) {
    for (const feat of mod.features) {
      for (const [action, allowed] of Object.entries(feat.actions)) {
        const key = `${mod.module}.${feat.feature}.${action}`
        flat[key] = allowed
      }
    }
  }
  return flat
}

// ──────────────────────────────────────────
// প্রধান উপাদান
// ──────────────────────────────────────────

export function RolesPermissionsPage() {
  const [activeTab, setActiveTab] = useState('roles')

  // ── ভূমিকা তালিকা অবস্থা ──
  const [roles, setRoles] = useState<Role[]>([])
  const [rolesLoading, setRolesLoading] = useState(true)

  // ── ডায়ালগ অবস্থা ──
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [cloneOpen, setCloneOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  // ── ফর্ম অবস্থা ──
  const [formName, setFormName] = useState('')
  const [formCode, setFormCode] = useState('')
  const [formDescription, setFormDescription] = useState('')

  // ── অনুমতি ম্যাট্রিক্স অবস্থা ──
  const [matrixRoleId, setMatrixRoleId] = useState<string>('')
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrix>({})
  const [originalPermissions, setOriginalPermissions] = useState<Record<string, boolean>>({})
  const [matrixLoading, setMatrixLoading] = useState(false)
  const [matrixSaving, setMatrixSaving] = useState(false)
  const [moduleSearch, setModuleSearch] = useState('')

  // ── অডিট লগ অবস্থা ──
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [auditLoading, setAuditLoading] = useState(false)
  const [auditPage, setAuditPage] = useState(1)
  const [auditTotalPages, setAuditTotalPages] = useState(1)

  // নকল প্রাথমিক আনা প্রতিরোধে রেফারেন্স
  const rolesFetched = useRef(false)

  // ──────────────────────────────────────────
  // তথ্য আনার ফাংশন (ইফেক্ট থেকে কল করা হয় না)
  // ──────────────────────────────────────────

  const loadRoles = async () => {
    setRolesLoading(true)
    const r = await api.get<Role[]>('/api/roles')
    if (r.success && r.data) {
      setRoles(r.data.sort((a, b) => a.level - b.level))
    } else {
      toast.error('Failed to load roles')
    }
    setRolesLoading(false)
  }

  const loadPermissionMatrix = async (roleId: string) => {
    if (!roleId) {
      setPermissionMatrix({})
      setOriginalPermissions({})
      return
    }
    setMatrixLoading(true)
    const r = await api.get<PermissionMatrix>(`/api/roles/${roleId}/permissions`)
    if (r.success && r.data) {
      setPermissionMatrix(r.data)
      setOriginalPermissions(flattenPermissions(r.data))
    } else {
      toast.error('Failed to load permissions')
      setPermissionMatrix({})
      setOriginalPermissions({})
    }
    setMatrixLoading(false)
  }

  const loadAuditLog = async (page: number) => {
    setAuditLoading(true)
    const r = await api.get<{ data: AuditLogEntry[]; total: number; pages: number }>(
      `/api/permissions/audit-log?page=${page}&limit=20`
    )
    if (r.success && r.data) {
      setAuditLogs(r.data.data || [])
      setAuditTotalPages(r.data.pages || 1)
    } else {
      toast.error('Failed to load audit log')
      setAuditLogs([])
    }
    setAuditLoading(false)
  }

  // ──────────────────────────────────────────
  // প্রাথমিক ভূমিকা লোড (কলব্যাক-শুধু প্যাটার্ন ব্যবহার করে)
  // ──────────────────────────────────────────

  useEffect(() => {
    if (rolesFetched.current) return
    rolesFetched.current = true
    let cancelled = false
    api.get<Role[]>('/api/roles').then((r) => {
      if (cancelled) return
      if (r.success && r.data) {
        setRoles(r.data.sort((a, b) => a.level - b.level))
      } else {
        toast.error('Failed to load roles')
      }
    }).finally(() => {
      if (!cancelled) setRolesLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  // ──────────────────────────────────────────
  // ট্যাব পরিবর্তন পরিচালনা — তথ্য লোডিং ট্রিগার
  // ──────────────────────────────────────────

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (tab === 'permissions' && matrixRoleId) {
      loadPermissionMatrix(matrixRoleId)
    }
    if (tab === 'audit') {
      setAuditPage(1)
      loadAuditLog(1)
    }
  }

  // ভূমিকা নির্বাচক পরিবর্তন পরিচালনা
  const handleMatrixRoleChange = (roleId: string) => {
    setMatrixRoleId(roleId)
    setModuleSearch('')
    if (roleId) loadPermissionMatrix(roleId)
  }

  // ──────────────────────────────────────────
  // গণনাকৃত: পরিবর্তিত অনুমতি গণনা
  // ──────────────────────────────────────────

  const modifiedCount = useMemo(() => {
    const current = flattenPermissions(permissionMatrix)
    let count = 0
    for (const key of Object.keys({ ...current, ...originalPermissions })) {
      if (current[key] !== originalPermissions[key]) count++
    }
    return count
  }, [permissionMatrix, originalPermissions])

  // ──────────────────────────────────────────
  // গণনাকৃত: ফিল্টারকৃত মডিউল
  // ──────────────────────────────────────────

  const filteredModules = useMemo(() => {
    const entries = Object.entries(permissionMatrix)
    if (!moduleSearch.trim()) return entries
    const q = moduleSearch.toLowerCase()
    return entries.filter(
      ([, mod]) =>
        mod.module.toLowerCase().includes(q) ||
        mod.label.toLowerCase().includes(q) ||
        mod.features.some(
          (f) =>
            f.feature.toLowerCase().includes(q)
        )
    )
  }, [permissionMatrix, moduleSearch])

  // ──────────────────────────────────────────
  // ভূমিকা CRUD হ্যান্ডলার
  // ──────────────────────────────────────────

  const openCreate = () => {
    setFormName('')
    setFormCode('')
    setFormDescription('')
    setCreateOpen(true)
  }

  const handleCreate = async () => {
    if (!formName.trim() || !formCode.trim()) {
      toast.error('Name and code are required')
      return
    }
    setFormLoading(true)
    const r = await api.post('/api/roles', {
      name: formName.trim(),
      code: formCode.trim(),
      description: formDescription.trim() || null,
    })
    setFormLoading(false)
    if (r.success) {
      toast.success('Role created successfully')
      setCreateOpen(false)
      loadRoles()
    } else {
      toast.error(r.error || 'Failed to create role')
    }
  }

  const openEdit = (role: Role) => {
    setSelectedRole(role)
    setFormName(role.name)
    setFormDescription(role.description || '')
    setEditOpen(true)
  }

  const handleEdit = async () => {
    if (!selectedRole || !formName.trim()) {
      toast.error('Role name is required')
      return
    }
    setFormLoading(true)
    const r = await api.put(`/api/roles/${selectedRole.id}`, {
      name: formName.trim(),
      description: formDescription.trim() || null,
    })
    setFormLoading(false)
    if (r.success) {
      toast.success('Role updated successfully')
      setEditOpen(false)
      loadRoles()
    } else {
      toast.error(r.error || 'Failed to update role')
    }
  }

  const openClone = (role: Role) => {
    setSelectedRole(role)
    setFormName(`${role.name} (Copy)`)
    setFormCode(`${role.code}_copy`)
    setCloneOpen(true)
  }

  const handleClone = async () => {
    if (!selectedRole || !formName.trim() || !formCode.trim()) {
      toast.error('Name and code are required')
      return
    }
    setFormLoading(true)
    const r = await api.post(`/api/roles/${selectedRole.id}/clone`, {
      name: formName.trim(),
      code: formCode.trim(),
    })
    setFormLoading(false)
    if (r.success) {
      toast.success('Role cloned successfully')
      setCloneOpen(false)
      loadRoles()
    } else {
      toast.error(r.error || 'Failed to clone role')
    }
  }

  const openDelete = (role: Role) => {
    if (role.isSystem) {
      toast.error('System roles cannot be deleted')
      return
    }
    setSelectedRole(role)
    setDeleteOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedRole) return
    setFormLoading(true)
    const r = await api.del(`/api/roles/${selectedRole.id}`)
    setFormLoading(false)
    if (r.success) {
      toast.success('Role deleted successfully')
      setDeleteOpen(false)
      if (matrixRoleId === selectedRole.id) {
        setMatrixRoleId('')
        setPermissionMatrix({})
      }
      loadRoles()
    } else {
      toast.error(r.error || 'Failed to delete role')
    }
  }

  // ──────────────────────────────────────────
  // অনুমতি ম্যাট্রিক্স হ্যান্ডলার
  // ──────────────────────────────────────────

  const togglePermission = (
    moduleKey: string,
    featureKey: string,
    actionKey: string,
    checked: boolean
  ) => {
    setPermissionMatrix((prev) => {
      const updated = { ...prev }
      const mod = { ...updated[moduleKey] }
      mod.features = mod.features.map((f) => {
        if (f.feature === featureKey) {
          return { ...f, actions: { ...f.actions, [actionKey]: checked } }
        }
        return f
      })
      updated[moduleKey] = mod
      return updated
    })
  }

  const toggleAllModule = (moduleKey: string, checked: boolean) => {
    setPermissionMatrix((prev) => {
      const updated = { ...prev }
      const mod = { ...updated[moduleKey] }
      mod.features = mod.features.map((f) => {
        const newActions: Record<string, boolean> = {}
        for (const a of ACTION_COLUMNS) {
          newActions[a.key] = checked
        }
        return { ...f, actions: newActions }
      })
      updated[moduleKey] = mod
      return updated
    })
  }

  const toggleAllFeature = (moduleKey: string, featureKey: string, checked: boolean) => {
    setPermissionMatrix((prev) => {
      const updated = { ...prev }
      const mod = { ...updated[moduleKey] }
      mod.features = mod.features.map((f) => {
        if (f.feature === featureKey) {
          const newActions: Record<string, boolean> = {}
          for (const a of ACTION_COLUMNS) {
            newActions[a.key] = checked
          }
          return { ...f, actions: newActions }
        }
        return f
      })
      updated[moduleKey] = mod
      return updated
    })
  }

  const handleSavePermissions = async () => {
    if (!matrixRoleId) return
    setMatrixSaving(true)
    const flat = flattenPermissions(permissionMatrix)
    const r = await api.put(`/api/roles/${matrixRoleId}/permissions`, flat)
    setMatrixSaving(false)
    if (r.success) {
      toast.success('Permissions saved successfully')
      setOriginalPermissions(flat)
    } else {
      toast.error(r.error || 'Failed to save permissions')
    }
  }

  // ──────────────────────────────────────────
  // ট্যাব ১: ভূমিকা তালিকা
  // ──────────────────────────────────────────

  const renderRolesList = () => {
    if (rolesLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      )
    }

    return (
      <>
        {/* ডেস্কটপ টেবিল */}
        <div className="hidden md:block">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>System</TableHead>
                    <TableHead className="text-center">Users</TableHead>
                    <TableHead className="text-center">Permissions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        <Shield className="size-10 mx-auto mb-2 opacity-30" />
                        No roles found. Create your first role to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                            {role.code}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <div
                              className={cn(
                                'size-2 rounded-full',
                                role.level === 0
                                  ? 'bg-amber-500'
                                  : role.level <= 2
                                  ? 'bg-emerald-500'
                                  : role.level <= 4
                                  ? 'bg-orange-400'
                                  : 'bg-neutral-400'
                              )}
                            />
                            <span className="text-sm text-muted-foreground">L{role.level}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {role.isSystem ? (
                            <Badge variant="secondary" className="bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                              <Lock className="size-3 mr-1" />
                              System
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800">
                              <Unlock className="size-3 mr-1" />
                              Custom
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm font-medium">{role.userCount || 0}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm font-medium">{role.permissionCount || 0}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => openEdit(role)}
                              title="Edit role"
                            >
                              <Edit2 className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => openClone(role)}
                              title="Clone role"
                            >
                              <Copy className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-destructive hover:text-destructive"
                              onClick={() => openDelete(role)}
                              disabled={role.isSystem}
                              title={role.isSystem ? 'System role cannot be deleted' : 'Delete role'}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* মোবাইল কার্ড */}
        <div className="md:hidden space-y-3">
          {roles.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Shield className="size-10 mx-auto mb-2 opacity-30" />
                No roles found.
              </CardContent>
            </Card>
          ) : (
            roles.map((role) => (
              <Card key={role.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{role.name}</p>
                      <code className="text-xs font-mono text-muted-foreground">{role.code}</code>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div
                        className={cn(
                          'size-2 rounded-full',
                          role.level === 0
                            ? 'bg-amber-500'
                            : role.level <= 2
                            ? 'bg-emerald-500'
                            : 'bg-orange-400'
                        )}
                      />
                      <span className="text-xs text-muted-foreground">L{role.level}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    {role.isSystem ? (
                      <Badge variant="secondary" className="bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 text-xs">
                        <Lock className="size-3 mr-1" />
                        System
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800 text-xs">
                        <Unlock className="size-3 mr-1" />
                        Custom
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {role.userCount || 0} users · {role.permissionCount || 0} perms
                    </span>
                  </div>
                  <div className="flex items-center gap-1 border-t pt-3">
                    <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => openEdit(role)}>
                      <Edit2 className="size-3.5" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => openClone(role)}>
                      <Copy className="size-3.5" /> Clone
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs gap-1 text-destructive hover:text-destructive ml-auto"
                      onClick={() => openDelete(role)}
                      disabled={role.isSystem}
                    >
                      <Trash2 className="size-3.5" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </>
    )
  }

  // ──────────────────────────────────────────
  // ট্যাব ২: অনুমতি ম্যাট্রিক্স
  // ──────────────────────────────────────────

  const renderPermissionMatrix = () => {
    if (!matrixRoleId) {
      return (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Shield className="size-12 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-muted-foreground font-medium">Select a role to manage permissions</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Choose a role from the dropdown above to view and edit its permission matrix.
            </p>
          </CardContent>
        </Card>
      )
    }

    if (matrixLoading) {
      return (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-6 w-24" />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardContent className="p-0">
          {/* টুলবার */}
          <div className="flex items-center justify-between gap-3 p-4 border-b">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Filter modules..."
                value={moduleSearch}
                onChange={(e) => setModuleSearch(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
            <div className="flex items-center gap-3">
              {modifiedCount > 0 && (
                <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-400">
                  <AlertTriangle className="size-3 mr-1" />
                  {modifiedCount} unsaved change{modifiedCount !== 1 ? 's' : ''}
                </Badge>
              )}
              <Button
                size="sm"
                onClick={handleSavePermissions}
                disabled={matrixSaving || modifiedCount === 0}
              >
                {matrixSaving ? (
                  <Loader2 className="size-4 mr-1.5 animate-spin" />
                ) : (
                  <Save className="size-4 mr-1.5" />
                )}
                Save Changes
              </Button>
            </div>
          </div>

          {/* ম্যাট্রিক্স হেডার */}
          <div className="hidden lg:grid lg:grid-cols-[minmax(240px,2fr)_repeat(7,minmax(80px,1fr))] gap-0 px-4 py-2.5 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
            <div>Module / Feature</div>
            {ACTION_COLUMNS.map((a) => (
              <div key={a.key} className="flex items-center justify-center gap-1">
                {ACTION_ICONS[a.key]}
                <span className="hidden xl:inline">{a.label}</span>
              </div>
            ))}
          </div>

          {/* ম্যাট্রিক্স বডি */}
          <div className="max-h-[calc(100vh-18rem)] overflow-y-auto">
            {filteredModules.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Search className="size-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No modules match your search.</p>
              </div>
            ) : (
              filteredModules.map(([moduleKey, mod], modIdx) => (
                <div key={moduleKey} className={cn(modIdx > 0 && 'border-t')}>
                  {/* মডিউল হেডার — ডেস্কটপ */}
                  <div
                    className={cn(
                      'hidden lg:grid lg:grid-cols-[minmax(240px,2fr)_repeat(7,minmax(80px,1fr))] gap-0 px-4 py-2 bg-muted/30 sticky top-0 z-10',
                      'font-semibold text-sm text-foreground'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <ChevronRight className="size-4 text-muted-foreground" />
                      {mod.label}
                    </div>
                    {ACTION_COLUMNS.map((a) => {
                      const allChecked = mod.features.every(
                        (f) => f.actions[a.key] === true
                      )
                      const someChecked = mod.features.some(
                        (f) => f.actions[a.key] === true
                      )
                      return (
                        <div key={a.key} className="flex items-center justify-center">
                          <Checkbox
                            checked={allChecked ? true : someChecked ? 'indeterminate' : false}
                            onCheckedChange={(checked) =>
                              toggleAllModule(moduleKey, !!checked)
                            }
                            className="size-4"
                          />
                        </div>
                      )
                    })}
                  </div>

                  {/* মডিউল হেডার — মোবাইল */}
                  <div className="lg:hidden px-4 py-2.5 bg-muted/30 sticky top-0 z-10 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold text-sm">
                        <ChevronDown className="size-4 text-muted-foreground" />
                        {mod.label}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {mod.features.length} feature{mod.features.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* বৈশিষ্ট্য সারিসমূহ */}
                  {mod.features.map((feat) => {
                    const rowKey = `${moduleKey}.${feat.feature}`
                    const currentFlat = flattenPermissions(permissionMatrix)
                    const hasChanges = ACTION_COLUMNS.some(
                      (a) => currentFlat[`${rowKey}.${a.key}`] !== originalPermissions[`${rowKey}.${a.key}`]
                    )

                    return (
                      <div
                        key={feat.feature}
                        className={cn(
                          'group',
                          hasChanges && 'bg-amber-50/50 dark:bg-amber-950/20'
                        )}
                      >
                        {/* ডেস্কটপ সারি */}
                        <div className="hidden lg:grid lg:grid-cols-[minmax(240px,2fr)_repeat(7,minmax(80px,1fr))] gap-0 px-4 py-1.5 items-center hover:bg-muted/20 transition-colors border-b border-border/50 last:border-b-0">
                          <div className="flex items-center gap-2 pl-6">
                            <span className="text-sm truncate" title={feat.feature}>
                              {feat.feature.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                            </span>
                            {hasChanges && (
                              <span className="size-1.5 rounded-full bg-amber-500 shrink-0" />
                            )}
                          </div>
                          {ACTION_COLUMNS.map((a) => {
                            const actionKey = `${rowKey}.${a.key}`
                            const isModified = currentFlat[actionKey] !== originalPermissions[actionKey]
                            return (
                              <div key={a.key} className="flex items-center justify-center">
                                <Checkbox
                                  checked={feat.actions[a.key] || false}
                                  onCheckedChange={(checked) =>
                                    togglePermission(moduleKey, feat.feature, a.key, !!checked)
                                  }
                                  className={cn(
                                    'size-4',
                                    isModified && 'border-amber-500 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600'
                                  )}
                                />
                              </div>
                            )
                          })}
                        </div>

                        {/* মোবাইল সারি */}
                        <div className="lg:hidden px-4 py-3 border-b border-border/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium truncate">
                              {feat.feature.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                            </span>
                            <Checkbox
                              checked={feat.actions['view'] && feat.actions['create'] && feat.actions['edit'] && feat.actions['delete'] && feat.actions['approve'] && feat.actions['export'] && feat.actions['print']}
                              onCheckedChange={(checked) =>
                                toggleAllFeature(moduleKey, feat.feature, !!checked)
                              }
                              className="size-4"
                            />
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {ACTION_COLUMNS.map((a) => {
                              const actionKey = `${rowKey}.${a.key}`
                              const isModified = currentFlat[actionKey] !== originalPermissions[actionKey]
                              return (
                                <label
                                  key={a.key}
                                  className={cn(
                                    'flex items-center gap-1.5 text-xs cursor-pointer px-1.5 py-1 rounded',
                                    'hover:bg-muted/50 transition-colors',
                                    feat.actions[a.key] && 'text-foreground font-medium',
                                    !feat.actions[a.key] && 'text-muted-foreground'
                                  )}
                                >
                                  <Checkbox
                                    checked={feat.actions[a.key] || false}
                                    onCheckedChange={(checked) =>
                                      togglePermission(moduleKey, feat.feature, a.key, !!checked)
                                    }
                                    className={cn(
                                      'size-3.5',
                                      isModified && 'border-amber-500 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600'
                                    )}
                                  />
                                  <span className="truncate">{a.label}</span>
                                </label>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // ──────────────────────────────────────────
  // ট্যাব ৩: অডিট লগ
  // ──────────────────────────────────────────

  const renderAuditLog = () => {
    if (auditLoading) {
      return (
        <Card>
          <CardContent className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
      )
    }

    const actionColors: Record<string, string> = {
      grant: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950',
      revoke: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950',
      update: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950',
      create: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950',
      delete: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950',
    }

    return (
      <>
        {/* ডেস্কটপ টেবিল */}
        <div className="hidden md:block">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        <History className="size-10 mx-auto mb-2 opacity-30" />
                        No audit log entries found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    auditLogs.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(entry.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm font-medium">{entry.userName}</TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                              actionColors[entry.action.toLowerCase()] || 'bg-muted text-muted-foreground'
                            )}
                          >
                            {entry.action}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          <span className="text-muted-foreground">{entry.entityType}</span>
                          {entry.entityName && (
                            <span className="ml-1 font-medium">· {entry.entityName}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {entry.details}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* মোবাইল কার্ড */}
        <div className="md:hidden space-y-3">
          {auditLogs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <History className="size-10 mx-auto mb-2 opacity-30" />
                No audit log entries found.
              </CardContent>
            </Card>
          ) : (
            auditLogs.map((entry) => (
              <Card key={entry.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-sm">{entry.userName}</span>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                        actionColors[entry.action.toLowerCase()] || 'bg-muted text-muted-foreground'
                      )}
                    >
                      {entry.action}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {new Date(entry.timestamp).toLocaleString()}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">{entry.entityType}</span>
                    {entry.entityName && (
                      <span className="ml-1 font-medium">· {entry.entityName}</span>
                    )}
                  </p>
                  {entry.details && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">{entry.details}</p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* পেজিনেশন */}
        {auditTotalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={auditPage <= 1}
              onClick={() => {
                const p = auditPage - 1
                setAuditPage(p)
                loadAuditLog(p)
              }}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              Page {auditPage} of {auditTotalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={auditPage >= auditTotalPages}
              onClick={() => {
                const p = auditPage + 1
                setAuditPage(p)
                loadAuditLog(p)
              }}
            >
              Next
            </Button>
          </div>
        )}
      </>
    )
  }

  // ──────────────────────────────────────────
  // রেন্ডার
  // ──────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* পৃষ্ঠা হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="size-6 text-primary" />
            Roles & Permissions
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage user roles, configure access permissions, and track changes.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2 self-start">
          <Plus className="size-4" />
          Create Role
        </Button>
      </div>

      <Separator />

      {/* ট্যাবসমূহ */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="roles" className="gap-1.5">
            <Users className="size-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-1.5">
            <Shield className="size-4" />
            Permission Matrix
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-1.5">
            <History className="size-4" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        {/* ট্যাব ১: ভূমিকা তালিকা */}
        <TabsContent value="roles">
          {renderRolesList()}
        </TabsContent>

        {/* ট্যাব ২: অনুমতি ম্যাট্রিক্স */}
        <TabsContent value="permissions">
          <div className="space-y-4">
            {/* ভূমিকা নির্বাচক */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <Label className="text-sm font-medium shrink-0">Select Role</Label>
                  <Select
                    value={matrixRoleId}
                    onValueChange={handleMatrixRoleChange}
                  >
                    <SelectTrigger className="w-full sm:max-w-xs">
                      <SelectValue placeholder="Choose a role..." />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          <span className="flex items-center gap-2">
                            {role.name}
                            {role.isSystem && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                                SYS
                              </Badge>
                            )}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {matrixRoleId && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => setActiveTab('permissions')}
                      disabled
                    >
                      <Eye className="size-3.5 mr-1.5" />
                      Viewing Matrix
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {renderPermissionMatrix()}
          </div>
        </TabsContent>

        {/* ট্যাব ৩: অডিট লগ */}
        <TabsContent value="audit">
          {renderAuditLog()}
        </TabsContent>
      </Tabs>

      {/* ── ভূমিকা তৈরির ডায়ালগ ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Define a new role with a unique name and code. You can configure permissions after creation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="create-name">Role Name *</Label>
              <Input
                id="create-name"
                placeholder="e.g., Site Engineer"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-code">Role Code *</Label>
              <Input
                id="create-code"
                placeholder="e.g., site_engineer"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Unique identifier used internally. Use lowercase with underscores.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-desc">Description</Label>
              <Textarea
                id="create-desc"
                placeholder="Brief description of this role..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={formLoading}>
              {formLoading && <Loader2 className="size-4 mr-1.5 animate-spin" />}
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── ভূমিকা সম্পাদনা ডায়ালগ ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update the role name and description. The code cannot be changed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Role Name *</Label>
              <Input
                id="edit-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            {selectedRole && (
              <div className="space-y-2">
                <Label>Role Code</Label>
                <div className="flex items-center gap-2">
                  <code className="rounded bg-muted px-2 py-1 text-sm font-mono text-muted-foreground">
                    {selectedRole.code}
                  </code>
                  <Badge variant="secondary" className="text-xs">Read-only</Badge>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Description</Label>
              <Textarea
                id="edit-desc"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={formLoading}>
              {formLoading && <Loader2 className="size-4 mr-1.5 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── ভূমিকা ক্লোন ডায়ালগ ── */}
      <Dialog open={cloneOpen} onOpenChange={setCloneOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clone Role</DialogTitle>
            <DialogDescription>
              Create a copy of <span className="font-semibold">{selectedRole?.name}</span> with its permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {selectedRole && (
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Source Role</p>
                <p className="font-medium text-sm">{selectedRole.name}</p>
                <code className="text-xs font-mono text-muted-foreground">{selectedRole.code}</code>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedRole.permissionCount} permissions will be copied
                </p>
              </div>
            )}
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="clone-name">New Role Name *</Label>
              <Input
                id="clone-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clone-code">New Role Code *</Label>
              <Input
                id="clone-code"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloneOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleClone} disabled={formLoading}>
              {formLoading && <Loader2 className="size-4 mr-1.5 animate-spin" />}
              <Copy className="size-4 mr-1.5" />
              Clone Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── ভূমিকা মুছে ফেলার নিশ্চিতকরণ ── */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              Delete Role
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  Are you sure you want to delete <span className="font-semibold">{selectedRole?.name}</span>?
                  This action cannot be undone.
                </p>
                {selectedRole && (selectedRole.userCount || 0) > 0 && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                    <p className="text-sm font-medium text-destructive">
                      {selectedRole.userCount} user{selectedRole.userCount !== 1 ? 's' : ''} currently assigned to this role.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Please reassign users before deleting.
                    </p>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={formLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={formLoading}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {formLoading && <Loader2 className="size-4 mr-1.5 animate-spin" />}
              Delete Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}