'use client'

// HR — employee master records, today's attendance and leave approvals.
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Users, UserCheck, CalendarOff, CheckCircle2, XCircle, Contact, Phone, Mail } from 'lucide-react'
import { fmtDate, type View } from '@/lib/eppm'
import { cn } from '@/lib/utils'
import { FadeIn } from '../motion'

interface Employee {
  id: string; name: string; role: string; department: string; site: string
  phone: string; email: string; joined: string; status: 'Active' | 'On Leave' | 'Inactive'
}
interface LeaveRequest {
  id: string; employee: string; type: 'Annual' | 'Medical' | 'Unpaid' | 'Compassionate'
  from: string; to: string; days: number; status: 'Pending' | 'Approved' | 'Rejected'
}

const EMPLOYEES: Employee[] = [
  { id: 'EMP-001', name: 'Haji Hassan', role: 'Managing Director', department: 'Executive', site: 'Head Office', phone: '+673 872 0001', email: 'hassan@hjsb.com', joined: '1995-03-01', status: 'Active' },
  { id: 'EMP-014', name: 'Ahmad Jaya', role: 'Technical Director', department: 'Engineering', site: 'Head Office', phone: '+673 872 0014', email: 'ahmad@hjsb.com', joined: '2002-06-15', status: 'Active' },
  { id: 'EMP-032', name: 'Lim Wei Ming', role: 'Senior Project Manager', department: 'Projects', site: 'Gadong Residences', phone: '+673 872 0032', email: 'wm.lim@hjsb.com', joined: '2011-02-20', status: 'Active' },
  { id: 'EMP-047', name: 'Siti Aminah', role: 'Fire Systems Lead', department: 'Maintenance', site: 'Field — Gadong', phone: '+673 871 2203', email: 'aminah@hjsb.com', joined: '2015-09-01', status: 'Active' },
  { id: 'EMP-058', name: 'Kumar Selvam', role: 'Plumbing Technician', department: 'Maintenance', site: 'Field — KB', phone: '+673 871 2204', email: 'kumar@hjsb.com', joined: '2018-04-11', status: 'Active' },
  { id: 'EMP-063', name: 'Nurul Huda', role: 'HVAC Technician', department: 'Maintenance', site: 'Field — Gadong', phone: '+673 871 2207', email: 'nurul@hjsb.com', joined: '2019-08-23', status: 'On Leave' },
  { id: 'EMP-071', name: 'Jane Smith', role: 'Safety Officer', department: 'HSE', site: 'Muara Warehouse', phone: '+673 872 0071', email: 'jane@hjsb.com', joined: '2021-01-05', status: 'Active' },
  { id: 'EMP-076', name: 'Mohammad Ali', role: 'Quantity Surveyor', department: 'Commercial', site: 'Head Office', phone: '+673 872 0076', email: 'ali.qs@hjsb.com', joined: '2022-07-18', status: 'Active' },
]

const ATTENDANCE = [
  { site: 'Head Office', present: 34, absent: 2, leave: 1 },
  { site: 'Gadong Residences', present: 58, absent: 4, leave: 2 },
  { site: 'Muara Warehouse', present: 41, absent: 1, leave: 0 },
  { site: 'Seria Road Works', present: 27, absent: 3, leave: 1 },
  { site: 'Field Maintenance Crews', present: 18, absent: 0, leave: 1 },
]

const SEED_LEAVE: LeaveRequest[] = [
  { id: 'LV-208', employee: 'Kumar Selvam', type: 'Annual', from: '2026-07-13', to: '2026-07-17', days: 5, status: 'Pending' },
  { id: 'LV-207', employee: 'Jane Smith', type: 'Medical', from: '2026-07-06', to: '2026-07-07', days: 2, status: 'Pending' },
  { id: 'LV-206', employee: 'Mohammad Ali', type: 'Compassionate', from: '2026-07-01', to: '2026-07-03', days: 3, status: 'Approved' },
  { id: 'LV-204', employee: 'Nurul Huda', type: 'Annual', from: '2026-06-29', to: '2026-07-08', days: 8, status: 'Approved' },
  { id: 'LV-201', employee: 'Lim Wei Ming', type: 'Unpaid', from: '2026-06-15', to: '2026-06-16', days: 2, status: 'Rejected' },
]

export default function HrView({}: { onNavigate?: (v: View) => void }) {
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('All')
  const [leave, setLeave] = useState(SEED_LEAVE)

  const q = search.toLowerCase()
  const departments = ['All', ...Array.from(new Set(EMPLOYEES.map((e) => e.department)))]
  const filtered = EMPLOYEES.filter((e) =>
    (dept === 'All' || e.department === dept) &&
    (!q || [e.name, e.role, e.id, e.site].join(' ').toLowerCase().includes(q)))

  const decideLeave = (id: string, status: 'Approved' | 'Rejected') =>
    setLeave((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))

  const totalPresent = ATTENDANCE.reduce((a, s) => a + s.present, 0)
  const totalAbsent = ATTENDANCE.reduce((a, s) => a + s.absent, 0)
  const pendingLeave = leave.filter((l) => l.status === 'Pending').length

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Contact className="h-6 w-6 text-primary" /> Human Resources</h1>
            <p className="text-sm text-muted-foreground">Employee master records, attendance and leave management</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total Employees', value: 214, icon: Users, tone: 'text-sky-600' },
            { label: 'Present Today', value: totalPresent, icon: UserCheck, tone: 'text-emerald-600' },
            { label: 'Absent Today', value: totalAbsent, icon: XCircle, tone: 'text-rose-600' },
            { label: 'Pending Leave', value: pendingLeave, icon: CalendarOff, tone: 'text-amber-600' },
          ].map((k) => (
            <Card key={k.label}><CardContent className="flex items-center gap-3 p-4">
              <k.icon className={cn('h-8 w-8 shrink-0 rounded-lg bg-muted p-1.5', k.tone)} />
              <div><div className="text-xl font-bold leading-none">{k.value}</div><div className="mt-1 text-[11px] text-muted-foreground">{k.label}</div></div>
            </CardContent></Card>
          ))}
        </div>
      </FadeIn>

      <Tabs defaultValue="directory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="directory"><Users className="mr-1.5 h-3.5 w-3.5" />Directory</TabsTrigger>
          <TabsTrigger value="attendance"><UserCheck className="mr-1.5 h-3.5 w-3.5" />Attendance</TabsTrigger>
          <TabsTrigger value="leave"><CalendarOff className="mr-1.5 h-3.5 w-3.5" />Leave
            {pendingLeave > 0 && <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">{pendingLeave}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="directory">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <div><CardTitle className="text-base">Employee Directory</CardTitle><CardDescription>HR master records</CardDescription></div>
              <Select value={dept} onValueChange={setDept}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>{departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Employee</TableHead><TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">Department</TableHead>
                  <TableHead className="hidden lg:table-cell">Site</TableHead>
                  <TableHead className="hidden sm:table-cell">Contact</TableHead>
                  <TableHead className="hidden lg:table-cell">Joined</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filtered.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{e.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}</div>
                          <div><div className="font-medium">{e.name}</div><div className="font-mono text-xs text-muted-foreground">{e.id}</div></div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{e.role}</TableCell>
                      <TableCell className="hidden md:table-cell"><Badge variant="outline" className="font-normal">{e.department}</Badge></TableCell>
                      <TableCell className="hidden text-sm lg:table-cell">{e.site}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{e.phone.slice(-7)}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="h-3 w-3" />{e.email}</div>
                      </TableCell>
                      <TableCell className="hidden text-xs lg:table-cell">{fmtDate(e.joined)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          e.status === 'Active' ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400'
                          : e.status === 'On Leave' ? 'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-400'
                          : 'border-border bg-muted text-muted-foreground'
                        }>{e.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Today&apos;s Attendance by Site</CardTitle><CardDescription>Muster roll summary — 3 July 2026</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Site</TableHead><TableHead>Present</TableHead><TableHead>Absent</TableHead><TableHead>On Leave</TableHead><TableHead>Attendance</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {ATTENDANCE.map((s) => {
                    const total = s.present + s.absent + s.leave
                    const pct = Math.round((s.present / total) * 100)
                    return (
                      <TableRow key={s.site}>
                        <TableCell className="font-medium">{s.site}</TableCell>
                        <TableCell className="text-emerald-600 font-semibold">{s.present}</TableCell>
                        <TableCell className={cn(s.absent > 0 && 'text-rose-600 font-semibold')}>{s.absent}</TableCell>
                        <TableCell>{s.leave}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-24 rounded-full bg-muted"><div className={cn('h-1.5 rounded-full', pct >= 95 ? 'bg-emerald-500' : pct >= 90 ? 'bg-amber-500' : 'bg-rose-500')} style={{ width: `${pct}%` }} /></div>
                            <span className="text-xs text-muted-foreground">{pct}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Leave Requests</CardTitle><CardDescription>Approve or reject pending applications</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Ref</TableHead><TableHead>Employee</TableHead><TableHead>Type</TableHead>
                  <TableHead className="hidden sm:table-cell">Period</TableHead><TableHead>Days</TableHead>
                  <TableHead>Status</TableHead><TableHead className="text-right">Decision</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {leave.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-mono text-xs">{l.id}</TableCell>
                      <TableCell className="font-medium">{l.employee}</TableCell>
                      <TableCell><Badge variant="outline" className="font-normal">{l.type}</Badge></TableCell>
                      <TableCell className="hidden text-xs sm:table-cell">{fmtDate(l.from)} → {fmtDate(l.to)}</TableCell>
                      <TableCell className="text-sm font-semibold">{l.days}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          l.status === 'Approved' ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400'
                          : l.status === 'Rejected' ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-400'
                          : 'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-400'
                        }>{l.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {l.status === 'Pending' && (
                          <div className="flex justify-end gap-1.5">
                            <Button size="sm" onClick={() => decideLeave(l.id, 'Approved')}><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Approve</Button>
                            <Button size="sm" variant="ghost" onClick={() => decideLeave(l.id, 'Rejected')}><XCircle className="h-3.5 w-3.5" /></Button>
                          </div>
                        )}
                      </TableCell>
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
