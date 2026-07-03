'use client'

// Security — identity providers, access policies, active sessions and the
// full system audit trail.
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, ShieldCheck, ScrollText, KeyRound, Fingerprint, Smartphone, Globe, LogOut, AlertTriangle } from 'lucide-react'
import { type View } from '@/lib/eppm'
import { cn } from '@/lib/utils'
import { FadeIn } from '../motion'

interface AuditEntry {
  id: string; time: string; user: string; action: string; target: string
  category: 'Auth' | 'Data' | 'Admin' | 'Security'; ip: string
}

const AUDIT: AuditEntry[] = [
  { id: 'AUD-99120', time: '03 Jul 2026 09:41', user: 'admin@hjsb.com', action: 'Login success', target: 'Session', category: 'Auth', ip: '10.0.4.18' },
  { id: 'AUD-99119', time: '03 Jul 2026 09:38', user: 'admin@hjsb.com', action: 'Work order status changed → Completed', target: 'WO-5122', category: 'Data', ip: '10.0.4.18' },
  { id: 'AUD-99117', time: '03 Jul 2026 08:55', user: 'wm.lim@hjsb.com', action: 'Purchase request approved', target: 'PR-0910', category: 'Data', ip: '10.0.7.42' },
  { id: 'AUD-99114', time: '02 Jul 2026 17:20', user: 'admin@hjsb.com', action: 'User role updated → Project Manager', target: 'EMP-076', category: 'Admin', ip: '10.0.4.18' },
  { id: 'AUD-99110', time: '02 Jul 2026 16:03', user: 'unknown', action: 'Login failed (bad password ×3)', target: 'kumar@hjsb.com', category: 'Security', ip: '203.82.91.7' },
  { id: 'AUD-99106', time: '02 Jul 2026 14:47', user: 'aminah@hjsb.com', action: 'Report exported (PDF)', target: 'HSE Executive Summary', category: 'Data', ip: '10.0.9.11' },
  { id: 'AUD-99101', time: '02 Jul 2026 09:12', user: 'admin@hjsb.com', action: 'OAuth provider enabled', target: 'Google Workspace', category: 'Security', ip: '10.0.4.18' },
  { id: 'AUD-99095', time: '01 Jul 2026 15:30', user: 'jane@hjsb.com', action: 'Document uploaded', target: 'Method Statement — Piling', category: 'Data', ip: '10.0.11.6' },
]

const SESSIONS = [
  { user: 'admin@hjsb.com', device: 'Chrome · Windows 11', ip: '10.0.4.18', started: '09:41 today', current: true },
  { user: 'wm.lim@hjsb.com', device: 'Safari · iPhone 16', ip: '10.0.7.42', started: '08:52 today', current: false },
  { user: 'aminah@hjsb.com', device: 'Chrome · Android', ip: '10.0.9.11', started: 'Yesterday 14:40', current: false },
]

export type SecurityFocus = 'sso' | 'audit'
const FOCUS_TAB: Record<SecurityFocus, string> = { sso: 'identity', audit: 'audit' }

export default function SecurityView({ focus = 'sso' }: { onNavigate?: (v: View) => void; focus?: SecurityFocus }) {
  const [tab, setTab] = useState(FOCUS_TAB[focus])
  const [providers, setProviders] = useState([
    { id: 'password', name: 'Email & Password', desc: 'bcrypt-hashed credentials with lockout after 5 failures', icon: KeyRound, enabled: true, locked: true },
    { id: 'google', name: 'Google Workspace SSO', desc: 'OAuth 2.0 — restricted to @hjsb.com domain', icon: Globe, enabled: true, locked: false },
    { id: 'otp', name: 'WhatsApp OTP', desc: 'One-time passcodes for field technicians', icon: Smartphone, enabled: false, locked: false },
    { id: 'mfa', name: 'Enforce MFA for Admins', desc: 'TOTP second factor required for Admin & Super Admin', icon: Fingerprint, enabled: false, locked: false },
  ])
  const [catFilter, setCatFilter] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => { setTab(FOCUS_TAB[focus]) }, [focus])

  const toggle = (id: string) =>
    setProviders((prev) => prev.map((p) => (p.id === id && !p.locked ? { ...p, enabled: !p.enabled } : p)))

  const q = search.toLowerCase()
  const filteredAudit = AUDIT.filter((a) =>
    (catFilter === 'All' || a.category === catFilter) &&
    (!q || [a.user, a.action, a.target, a.ip].join(' ').toLowerCase().includes(q)))

  const catColor = (c: AuditEntry['category']) =>
    c === 'Security' ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-400'
    : c === 'Admin' ? 'border-violet-200 bg-violet-50 text-violet-600 dark:border-violet-900 dark:bg-violet-950/50 dark:text-violet-400'
    : c === 'Auth' ? 'border-sky-200 bg-sky-50 text-sky-600 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-400'
    : 'border-border bg-muted text-muted-foreground'

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-primary" /> SSO & Security</h1>
            <p className="text-sm text-muted-foreground">Identity providers, access policies and the audit trail</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search audit log..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Sign-in Methods', value: providers.filter((p) => p.enabled).length, icon: KeyRound, tone: 'text-sky-600' },
            { label: 'Active Sessions', value: SESSIONS.length, icon: Fingerprint, tone: 'text-emerald-600' },
            { label: 'Security Events (7d)', value: AUDIT.filter((a) => a.category === 'Security').length, icon: AlertTriangle, tone: 'text-rose-600' },
            { label: 'Audit Entries (7d)', value: AUDIT.length, icon: ScrollText, tone: 'text-violet-600' },
          ].map((k) => (
            <Card key={k.label}><CardContent className="flex items-center gap-3 p-4">
              <k.icon className={cn('h-8 w-8 shrink-0 rounded-lg bg-muted p-1.5', k.tone)} />
              <div><div className="text-xl font-bold leading-none">{k.value}</div><div className="mt-1 text-[11px] text-muted-foreground">{k.label}</div></div>
            </CardContent></Card>
          ))}
        </div>
      </FadeIn>

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="identity"><KeyRound className="mr-1.5 h-3.5 w-3.5" />Identity & Policies</TabsTrigger>
          <TabsTrigger value="audit"><ScrollText className="mr-1.5 h-3.5 w-3.5" />Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="identity" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Sign-in Methods</CardTitle><CardDescription>Providers wired to the EPPM authentication system</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {providers.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <p.icon className="h-8 w-8 rounded-lg bg-muted p-1.5 text-primary" />
                    <div>
                      <div className="text-sm font-medium">{p.name}{p.locked && <Badge variant="secondary" className="ml-2 text-[10px]">Required</Badge>}</div>
                      <div className="text-xs text-muted-foreground">{p.desc}</div>
                    </div>
                  </div>
                  <Switch checked={p.enabled} disabled={p.locked} onCheckedChange={() => toggle(p.id)} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Active Sessions</CardTitle><CardDescription>Signed-in devices across the platform</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>User</TableHead><TableHead>Device</TableHead>
                  <TableHead className="hidden sm:table-cell">IP</TableHead>
                  <TableHead className="hidden md:table-cell">Started</TableHead><TableHead className="text-right">Action</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {SESSIONS.map((s) => (
                    <TableRow key={s.user + s.ip}>
                      <TableCell className="text-sm font-medium">{s.user}{s.current && <Badge variant="secondary" className="ml-2 text-[10px]">This device</Badge>}</TableCell>
                      <TableCell className="text-sm">{s.device}</TableCell>
                      <TableCell className="hidden font-mono text-xs sm:table-cell">{s.ip}</TableCell>
                      <TableCell className="hidden text-xs md:table-cell">{s.started}</TableCell>
                      <TableCell className="text-right">
                        {!s.current && <Button size="sm" variant="ghost"><LogOut className="mr-1 h-3.5 w-3.5" />Revoke</Button>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <div><CardTitle className="text-base">System Audit Trail</CardTitle><CardDescription>Every material action, immutably logged</CardDescription></div>
              <Select value={catFilter} onValueChange={setCatFilter}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>{['All', 'Auth', 'Data', 'Admin', 'Security'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Time</TableHead><TableHead>User</TableHead><TableHead>Action</TableHead>
                  <TableHead className="hidden md:table-cell">Target</TableHead>
                  <TableHead>Category</TableHead><TableHead className="hidden sm:table-cell">IP</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filteredAudit.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="whitespace-nowrap text-xs">{a.time}</TableCell>
                      <TableCell className="text-sm">{a.user}</TableCell>
                      <TableCell className="text-sm font-medium">{a.action}</TableCell>
                      <TableCell className="hidden text-xs text-muted-foreground md:table-cell">{a.target}</TableCell>
                      <TableCell><Badge variant="outline" className={catColor(a.category)}>{a.category}</Badge></TableCell>
                      <TableCell className="hidden font-mono text-xs sm:table-cell">{a.ip}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
