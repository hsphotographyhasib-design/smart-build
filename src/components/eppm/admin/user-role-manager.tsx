'use client'

import { useEffect, useState } from 'react'
import { Loader2, ShieldAlert, UserCog, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/components/auth/auth-context'
import { isAdminRole, ROLES } from '@/lib/auth'
import type { PublicUser } from '@/lib/user'
import { cn } from '@/lib/utils'

const ROLE_OPTIONS = [
  ROLES.CUSTOMER,
  ROLES.ADMIN,
  ROLES.SUPER_ADMIN,
  'Portfolio Director',
  'Project Manager',
  'Planning Manager',
  'Project Controls Manager',
  'Scheduler',
  'Site Engineer',
  'Quantity Surveyor',
]

const roleTint = (role: string) =>
  role === ROLES.SUPER_ADMIN
    ? 'text-rose-700'
    : role === ROLES.ADMIN
      ? 'text-violet-600'
      : role === ROLES.CUSTOMER
        ? 'text-sky-700'
        : 'text-slate-500'

const providerBadge = (p: string) =>
  p === 'google' ? 'Google' : p === 'whatsapp' ? 'WhatsApp' : 'Email'

export function UserRoleManager() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState<PublicUser[]>([])
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users', { cache: 'no-store' })
      if (res.status === 403) {
        setForbidden(true)
        return
      }
      const data = await res.json()
      setUsers(data.users ?? [])
    } catch {
      toast.error('Could not load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const patch = async (id: string, body: { role?: string; active?: boolean }) => {
    setSavingId(id)
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Update failed')
        return
      }
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data.user } : u)))
      toast.success('User updated')
    } catch {
      toast.error('Network error')
    } finally {
      setSavingId(null)
    }
  }

  if (!isAdminRole(me?.role)) {
    return (
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
        <CardContent className="flex items-center gap-3 py-5 text-sm text-amber-800 dark:text-amber-300">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <div>
            <div className="font-semibold">Admin access required</div>
            <div className="text-xs opacity-80">Only Admin and Super Admin users can manage roles. Your current role is <span className="font-semibold">{me?.role ?? '—'}</span>.</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (forbidden) {
    return (
      <Card>
        <CardContent className="py-5 text-sm text-muted-foreground">You don’t have permission to manage users.</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <UserCog className="h-4 w-4 text-violet-600" /> Role Management
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{users.length} users</span>
          </CardTitle>
          <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} /> Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : (
          <div tabIndex={0} className="max-h-[560px] overflow-auto scroll-thin">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-background">
                <tr className="border-b text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-2 font-medium">User</th>
                  <th className="px-2 py-2 font-medium">Sign-in</th>
                  <th className="px-2 py-2 font-medium">Role</th>
                  <th className="px-2 py-2 font-medium">Active</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u.id === me?.id
                  return (
                    <tr key={u.id} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="py-2.5 pr-2">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8 border">
                            <AvatarFallback className="bg-primary/10 text-[10px] font-bold text-primary">
                              {(u.name || 'U').split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="truncate font-medium">{u.name}{isSelf && <span className="ml-1.5 text-[10px] text-muted-foreground">(you)</span>}</div>
                            <div className="truncate text-[11px] text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2.5">
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{providerBadge(u.provider)}</span>
                      </td>
                      <td className="px-2 py-2.5">
                        <Select
                          value={u.role}
                          onValueChange={(role) => void patch(u.id, { role })}
                          disabled={isSelf || savingId === u.id}
                        >
                          <SelectTrigger aria-label={`Role for ${u.name}`} className={cn('h-8 w-[190px] text-xs font-semibold', roleTint(u.role))}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_OPTIONS.map((r) => (
                              <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-2 py-2.5">
                        <Switch
                          aria-label={`Account active for ${u.name}`}
                          checked={u.active}
                          onCheckedChange={(active) => void patch(u.id, { active })}
                          disabled={isSelf || savingId === u.id}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
