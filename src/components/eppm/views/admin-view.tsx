'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, ShieldCheck, KeyRound, Lock, Fingerprint, Gauge, ShieldAlert, ScrollText, Settings2, CheckCircle2, XCircle, Search, UserCog, Calendar, Coins, Globe, BellRing, Activity as ActivityIcon } from 'lucide-react'
import { fmtDate, type View } from '@/lib/eppm'
import { cn } from '@/lib/utils'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const CHART = { emerald: 'oklch(0.55 0.12 162)', amber: 'oklch(0.7 0.16 80)', rose: 'oklch(0.6 0.2 25)', sky: 'oklch(0.62 0.1 195)', violet: 'oklch(0.65 0.18 305)', slate: 'oklch(0.55 0.02 250)' }

type Role = 'Super Admin' | 'Portfolio Director' | 'Planning Manager' | 'Project Controls Manager' | 'Project Manager' | 'Scheduler' | 'Site Engineer' | 'Quantity Surveyor'

interface User {
  id: string
  name: string
  email: string
  role: Role
  status: 'Active' | 'Suspended'
  lastActive: string
}

const USERS: User[] = [
  { id: 'U001', name: 'Alex Novak', email: 'a.novak@eppm.io', role: 'Super Admin', status: 'Active', lastActive: '2025-01-24T09:12:00Z' },
  { id: 'U002', name: 'Sara Patel', email: 's.patel@eppm.io', role: 'Portfolio Director', status: 'Active', lastActive: '2025-01-24T08:45:00Z' },
  { id: 'U003', name: 'Michael Chen', email: 'm.chen@eppm.io', role: 'Planning Manager', status: 'Active', lastActive: '2025-01-23T17:20:00Z' },
  { id: 'U004', name: 'Karim Ali', email: 'k.ali@eppm.io', role: 'Project Controls Manager', status: 'Active', lastActive: '2025-01-24T07:55:00Z' },
  { id: 'U005', name: 'Julia Müller', email: 'j.muller@eppm.io', role: 'Project Manager', status: 'Active', lastActive: '2025-01-23T19:10:00Z' },
  { id: 'U006', name: 'Luca Rossi', email: 'l.rossi@eppm.io', role: 'Scheduler', status: 'Active', lastActive: '2025-01-24T06:30:00Z' },
  { id: 'U007', name: 'Rashid Khan', email: 'r.khan@eppm.io', role: 'Site Engineer', status: 'Active', lastActive: '2025-01-22T15:40:00Z' },
  { id: 'U008', name: 'Anita Novak', email: 'a.novak2@eppm.io', role: 'Quantity Surveyor', status: 'Suspended', lastActive: '2025-01-10T11:25:00Z' },
]

const ROLES: Role[] = ['Super Admin', 'Portfolio Director', 'Planning Manager', 'Project Controls Manager', 'Project Manager', 'Scheduler', 'Site Engineer', 'Quantity Surveyor']

const MODULES = ['Dashboard', 'Portfolios', 'Projects', 'Activities', 'Gantt', 'Resources', 'Costs', 'EVM', 'Risks', 'Changes', 'Documents', 'Reports', 'Admin'] as const

// Permission matrix: role -> module -> has access
const PERMISSIONS: Record<Role, Record<string, boolean>> = {
  'Super Admin': Object.fromEntries(MODULES.map(m => [m, true])) as any,
  'Portfolio Director': Object.fromEntries(MODULES.map(m => [m, !['Admin'].includes(m)])) as any,
  'Planning Manager': Object.fromEntries(MODULES.map(m => [m, ['Dashboard', 'Portfolios', 'Projects', 'Activities', 'Gantt', 'Resources', 'Reports'].includes(m)])) as any,
  'Project Controls Manager': Object.fromEntries(MODULES.map(m => [m, ['Dashboard', 'Portfolios', 'Projects', 'Activities', 'Costs', 'EVM', 'Changes', 'Risks', 'Reports'].includes(m)])) as any,
  'Project Manager': Object.fromEntries(MODULES.map(m => [m, ['Dashboard', 'Projects', 'Activities', 'Gantt', 'Resources', 'Costs', 'Documents', 'Reports'].includes(m)])) as any,
  'Scheduler': Object.fromEntries(MODULES.map(m => [m, ['Dashboard', 'Projects', 'Activities', 'Gantt'].includes(m)])) as any,
  'Site Engineer': Object.fromEntries(MODULES.map(m => [m, ['Dashboard', 'Activities', 'Documents'].includes(m)])) as any,
  'Quantity Surveyor': Object.fromEntries(MODULES.map(m => [m, ['Dashboard', 'Projects', 'Costs', 'Changes', 'Reports'].includes(m)])) as any,
}

interface AuditEntry {
  id: string
  ts: string
  user: string
  action: string
  module: string
  details: string
}

const AUDIT: AuditEntry[] = [
  { id: 'A001', ts: '2025-01-24T09:12:00Z', user: 'a.novak', action: 'Login', module: 'Auth', details: 'Successful login from 10.0.1.42' },
  { id: 'A002', ts: '2025-01-24T08:58:00Z', user: 's.patel', action: 'Updated', module: 'Portfolios', details: 'Modified budget for Portfolio A (+$2.4M)' },
  { id: 'A003', ts: '2025-01-24T08:45:00Z', user: 'k.ali', action: 'Created', module: 'Risks', details: 'New risk RSK-018 in PRJ-003' },
  { id: 'A004', ts: '2025-01-24T08:30:00Z', user: 'm.chen', action: 'Approved', module: 'Changes', details: 'Approved change order CHG-007' },
  { id: 'A005', ts: '2025-01-24T08:12:00Z', user: 'l.rossi', action: 'Updated', module: 'Activities', details: 'Re-baselined 12 activities in PRJ-001' },
  { id: 'A006', ts: '2025-01-24T07:55:00Z', user: 'k.ali', action: 'Uploaded', module: 'Documents', details: 'Uploaded D017 Submittal – Curtain Wall' },
  { id: 'A007', ts: '2025-01-24T07:30:00Z', user: 'j.muller', action: 'Login', module: 'Auth', details: 'Successful login from 10.0.2.18' },
  { id: 'A008', ts: '2025-01-24T06:30:00Z', user: 'l.rossi', action: 'Generated', module: 'Reports', details: 'Generated Critical Path report RPT-008' },
  { id: 'A009', ts: '2025-01-24T06:15:00Z', user: 'system', action: 'Scheduled', module: 'System', details: 'Auto-backup completed (2.4 GB)' },
  { id: 'A010', ts: '2025-01-23T19:10:00Z', user: 'j.muller', action: 'Updated', module: 'Projects', details: 'Updated progress on PRJ-004 (62% → 68%)' },
  { id: 'A011', ts: '2025-01-23T17:20:00Z', user: 'm.chen', action: 'Deleted', module: 'Activities', details: 'Removed duplicate activity A1142' },
  { id: 'A012', ts: '2025-01-23T16:45:00Z', user: 's.patel', action: 'Login', module: 'Auth', details: 'Failed login attempt (x2) then success' },
]

const FAILED_LOGINS = [
  { day: 'Mon', attempts: 3 },
  { day: 'Tue', attempts: 1 },
  { day: 'Wed', attempts: 5 },
  { day: 'Thu', attempts: 2 },
  { day: 'Fri', attempts: 4 },
  { day: 'Sat', attempts: 0 },
  { day: 'Sun', attempts: 1 },
]

const actionColor = (a: string) =>
  a === 'Login' || a === 'Created' || a === 'Approved' || a === 'Uploaded' || a === 'Generated' ? 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900'
  : a === 'Updated' || a === 'Scheduled' ? 'text-sky-600 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950/50 dark:border-sky-900'
  : a === 'Deleted' ? 'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/50 dark:border-rose-900'
  : 'text-muted-foreground bg-muted border-border'

const SECURITY_CARDS = [
  { icon: Fingerprint, title: 'Two-Factor Auth', desc: 'TOTP-based 2FA enforced for all admin roles', status: 'Active' },
  { icon: KeyRound, title: 'Role-Based Access (RBAC)', desc: 'Granular module-level permissions per role', status: 'Active' },
  { icon: Lock, title: 'Encryption at Rest', desc: 'AES-256 database & file storage encryption', status: 'Active' },
  { icon: Gauge, title: 'Rate Limiting', desc: '100 req/min per IP, exponential backoff', status: 'Active' },
  { icon: ShieldAlert, title: 'CSRF / XSS Protection', desc: 'Token-validated forms & CSP headers enforced', status: 'Active' },
  { icon: ShieldCheck, title: 'Audit Logging', desc: 'All write operations logged & immutable', status: 'Active' },
]

export function AdminView({ onNavigate }: { onNavigate: (v: View) => void }) {
  void onNavigate
  const [q, setQ] = useState('')
  const [notifEmail, setNotifEmail] = useState(true)
  const [notifSlack, setNotifSlack] = useState(true)
  const [notifSms, setNotifSms] = useState(false)
  const [autoBackup, setAutoBackup] = useState(true)
  const [maintenance, setMaintenance] = useState(false)
  const [currency, setCurrency] = useState('USD')
  const [tz, setTz] = useState('UTC')

  const filteredUsers = USERS.filter(u => !q || `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="space-y-4">
      <Tabs defaultValue="users">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="users" className="text-xs"><Users className="h-3.5 w-3.5 mr-1.5" />Users & Roles</TabsTrigger>
          <TabsTrigger value="audit" className="text-xs"><ScrollText className="h-3.5 w-3.5 mr-1.5" />Audit Log</TabsTrigger>
          <TabsTrigger value="security" className="text-xs"><ShieldCheck className="h-3.5 w-3.5 mr-1.5" />Security</TabsTrigger>
          <TabsTrigger value="config" className="text-xs"><Settings2 className="h-3.5 w-3.5 mr-1.5" />Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-3 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-sm flex items-center gap-2"><UserCog className="h-4 w-4 text-violet-600" />User Management</CardTitle>
                  <CardDescription className="text-xs">{filteredUsers.length} users · {USERS.filter(u => u.status === 'Active').length} active</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative"><Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search users…" className="pl-8 h-9 w-56" /></div>
                  <Button size="sm" className="h-9"><Users className="h-3.5 w-3.5 mr-1.5" />Invite User</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-auto scroll-thin">
                <Table>
                  <TableHeader className="sticky top-0 bg-card"><TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead className="min-w-[180px]">Name</TableHead>
                    <TableHead className="min-w-[200px]">Email</TableHead>
                    <TableHead className="w-[180px]">Role</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[140px]">Last Active</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {filteredUsers.map(u => (
                      <TableRow key={u.id} className="hover:bg-muted/40">
                        <TableCell className="font-mono text-[10px] text-muted-foreground">{u.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">
                              {u.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                            </div>
                            <span className="text-xs font-medium">{u.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-[11px] text-muted-foreground">{u.email}</TableCell>
                        <TableCell><Badge variant="secondary" className="text-[10px]">{u.role}</Badge></TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn('text-[9px]', u.status === 'Active' ? 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900' : 'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/50 dark:border-rose-900')}>{u.status}</Badge>
                        </TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{fmtDate(u.lastActive)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Role Permission Matrix</CardTitle>
              <CardDescription className="text-xs">Module access by role · {ROLES.length} roles × {MODULES.length} modules</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-auto scroll-thin">
                <Table>
                  <TableHeader className="sticky top-0 bg-card"><TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="sticky left-0 bg-card min-w-[180px] z-10">Role</TableHead>
                    {MODULES.map(m => <TableHead key={m} className="w-[80px] text-center text-[10px]">{m}</TableHead>)}
                  </TableRow></TableHeader>
                  <TableBody>
                    {ROLES.map(r => (
                      <TableRow key={r} className="hover:bg-muted/40">
                        <TableCell className="sticky left-0 bg-card z-10 text-xs font-medium">{r}</TableCell>
                        {MODULES.map(m => {
                          const has = PERMISSIONS[r][m]
                          return (
                            <TableCell key={m} className="text-center p-2">
                              {has ? <CheckCircle2 className="h-4 w-4 text-emerald-600 inline" /> : <XCircle className="h-4 w-4 text-muted-foreground/30 inline" />}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><ScrollText className="h-4 w-4 text-violet-600" />Audit Log</CardTitle>
              <CardDescription className="text-xs">Immutable record of all user & system actions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-auto scroll-thin">
                <Table>
                  <TableHeader className="sticky top-0 bg-card"><TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead className="w-[160px]">Timestamp</TableHead>
                    <TableHead className="w-[120px]">User</TableHead>
                    <TableHead className="w-[100px]">Action</TableHead>
                    <TableHead className="w-[120px]">Module</TableHead>
                    <TableHead className="min-w-[280px]">Details</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {AUDIT.map(a => (
                      <TableRow key={a.id} className="hover:bg-muted/40">
                        <TableCell className="font-mono text-[10px] text-muted-foreground">{a.id}</TableCell>
                        <TableCell className="text-[10px] tabular-nums">{new Date(a.ts).toLocaleString('en-GB', { timeZone: 'UTC' })}</TableCell>
                        <TableCell className="font-mono text-[10px]">{a.user}</TableCell>
                        <TableCell><Badge variant="outline" className={cn('text-[9px]', actionColor(a.action))}>{a.action}</Badge></TableCell>
                        <TableCell className="text-[11px]">{a.module}</TableCell>
                        <TableCell className="text-[11px] text-muted-foreground">{a.details}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-3 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SECURITY_CARDS.map(s => {
              const Icon = s.icon
              return (
                <Card key={s.title}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 shrink-0"><Icon className="h-4 w-4" /></div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold truncate">{s.title}</div>
                          <div className="text-[10px] text-muted-foreground line-clamp-2">{s.desc}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[9px] text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900 shrink-0">{s.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-rose-600" />Failed Login Attempts</CardTitle>
                <CardDescription className="text-xs">Last 7 days · auto-locked after 5 attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={FAILED_LOGINS} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" width={28} allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Bar dataKey="attempts" name="Failed Attempts" fill={CHART.rose} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Security Posture</CardTitle></CardHeader>
              <CardContent className="space-y-2.5">
                <div className="flex items-center justify-between rounded-md border p-2.5">
                  <span className="text-xs">Password Policy</span>
                  <Badge variant="outline" className="text-[9px] text-emerald-600 bg-emerald-50 border-emerald-200">Strong</Badge>
                </div>
                <div className="flex items-center justify-between rounded-md border p-2.5">
                  <span className="text-xs">Session Timeout</span>
                  <span className="text-[11px] font-medium">30 min</span>
                </div>
                <div className="flex items-center justify-between rounded-md border p-2.5">
                  <span className="text-xs">Active Sessions</span>
                  <span className="text-[11px] font-medium tabular-nums">14</span>
                </div>
                <div className="flex items-center justify-between rounded-md border p-2.5">
                  <span className="text-xs">Blocked IPs</span>
                  <span className="text-[11px] font-medium tabular-nums">3</span>
                </div>
                <div className="flex items-center justify-between rounded-md border p-2.5">
                  <span className="text-xs">Last Security Scan</span>
                  <span className="text-[11px] text-muted-foreground">2h ago</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="config" className="mt-3 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Calendar className="h-4 w-4 text-sky-600" />Calendar Defaults</CardTitle><CardDescription className="text-xs">Standard project calendar & work week</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-[11px] text-muted-foreground">Working Hours</Label><Input defaultValue="08:00 – 17:00" className="h-8 text-xs mt-0.5" readOnly /></div>
                  <div><Label className="text-[11px] text-muted-foreground">Hours / Day</Label><Input defaultValue="8" className="h-8 text-xs mt-0.5" readOnly /></div>
                  <div><Label className="text-[11px] text-muted-foreground">Days / Week</Label><Input defaultValue="5 (Mon–Fri)" className="h-8 text-xs mt-0.5" readOnly /></div>
                  <div><Label className="text-[11px] text-muted-foreground">Default Calendar</Label><Input defaultValue="Standard" className="h-8 text-xs mt-0.5" readOnly /></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Coins className="h-4 w-4 text-amber-600" />Currency & Locale</CardTitle><CardDescription className="text-xs">Default display & formatting</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                <div><Label className="text-[11px] text-muted-foreground">Base Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}><SelectTrigger className="h-8 text-xs mt-0.5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USD">USD ($)</SelectItem><SelectItem value="EUR">EUR (€)</SelectItem><SelectItem value="GBP">GBP (£)</SelectItem><SelectItem value="AED">AED (د.إ)</SelectItem></SelectContent></Select>
                </div>
                <div><Label className="text-[11px] text-muted-foreground">Timezone</Label>
                  <Select value={tz} onValueChange={setTz}><SelectTrigger className="h-8 text-xs mt-0.5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="UTC">UTC</SelectItem><SelectItem value="Europe/London">Europe/London</SelectItem><SelectItem value="Asia/Dubai">Asia/Dubai</SelectItem><SelectItem value="America/New_York">America/New_York</SelectItem></SelectContent></Select>
                </div>
                <div><Label className="text-[11px] text-muted-foreground">Date Format</Label><Input defaultValue="DD MMM YYYY" className="h-8 text-xs mt-0.5" readOnly /></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><BellRing className="h-4 w-4 text-violet-600" />Notification Rules</CardTitle><CardDescription className="text-xs">Channels & triggers</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between"><Label htmlFor="ne" className="text-xs">Email notifications</Label><Switch id="ne" checked={notifEmail} onCheckedChange={setNotifEmail} /></div>
                <div className="flex items-center justify-between"><Label htmlFor="ns" className="text-xs">Slack integration</Label><Switch id="ns" checked={notifSlack} onCheckedChange={setNotifSlack} /></div>
                <div className="flex items-center justify-between"><Label htmlFor="nsms" className="text-xs">SMS alerts (critical only)</Label><Switch id="nsms" checked={notifSms} onCheckedChange={setNotifSms} /></div>
                <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/30 p-2.5 text-[10px] text-amber-700 dark:text-amber-400">
                  Triggers: Risk score ≥ 15 · Activity delay ≥ 5d · Cost variance &gt; 10% · RFI open &gt; 7d
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4 text-emerald-600" />System</CardTitle><CardDescription className="text-xs">Maintenance & backup</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between"><Label htmlFor="ab" className="text-xs">Auto-backup (daily)</Label><Switch id="ab" checked={autoBackup} onCheckedChange={setAutoBackup} /></div>
                <div className="flex items-center justify-between"><Label htmlFor="mt" className="text-xs">Maintenance mode</Label><Switch id="mt" checked={maintenance} onCheckedChange={setMaintenance} /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-[11px] text-muted-foreground">Version</Label><Input defaultValue="v4.2.1" className="h-8 text-xs mt-0.5" readOnly /></div>
                  <div><Label className="text-[11px] text-muted-foreground">Last Backup</Label><Input defaultValue="2h ago" className="h-8 text-xs mt-0.5" readOnly /></div>
                </div>
                <Button size="sm" variant="outline" className="w-full h-8 text-xs"><ActivityIcon className="h-3 w-3 mr-1.5" />Run Health Check</Button>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm">Reset Defaults</Button>
            <Button size="sm">Save Configuration</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
