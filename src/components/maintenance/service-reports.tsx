'use client'

import React from 'react'
import { ClipboardCheck, Search, Filter, Plus, Download, FileBarChart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const reports = [
  { id: 'SR-001', title: 'Monthly HVAC Maintenance - January', site: 'Meridian Tower', technician: 'Ahmad bin Ali', status: 'Completed', date: '2025-01-15', type: 'Preventive' },
  { id: 'SR-002', title: 'Emergency Plumbing Repair Report', site: 'Sunrise Residences', technician: 'Raj Kumar', status: 'Pending Review', date: '2025-01-14', type: 'Corrective' },
  { id: 'SR-003', title: 'Elevator Annual Inspection', site: 'Greenview Condo', technician: 'Tan Wei Ming', status: 'Approved', date: '2025-01-13', type: 'Inspection' },
  { id: 'SR-004', title: 'Fire System Compliance Check', site: 'Harbour Point', technician: 'Siti Fatimah', status: 'Draft', date: '2025-01-12', type: 'Compliance' },
  { id: 'SR-005', title: 'Electrical Panel Assessment', site: 'East Coast Villas', technician: 'Lim Jia Hao', status: 'Completed', date: '2025-01-11', type: 'Assessment' },
]

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-700',
    'Pending Review': 'bg-amber-50 text-amber-700',
    Approved: 'bg-emerald-50 text-emerald-700',
    Completed: 'bg-blue-100 text-blue-700',
    Rejected: 'bg-red-100 text-red-700',
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}

function getTypeBadge(type: string) {
  const map: Record<string, string> = {
    Preventive: 'bg-teal-50 text-teal-700',
    Corrective: 'bg-amber-50 text-amber-700',
    Inspection: 'bg-purple-50 text-purple-700',
    Compliance: 'bg-rose-50 text-rose-700',
    Assessment: 'bg-sky-50 text-sky-700',
  }
  return map[type] || 'bg-gray-100 text-gray-700'
}

export function ServiceReports() {
  return (
    <div className="space-y-6">
      {/* পৃষ্ঠা হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Service Reports</h1>
          <p className="text-muted-foreground text-sm mt-1">View and manage technician service reports</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Report
          </Button>
        </div>
      </div>

      {/* সারসংক্ষেপ কার্ড */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Reports', value: '48', color: 'text-foreground' },
          { label: 'Pending Review', value: '7', color: 'text-amber-600' },
          { label: 'Approved', value: '32', color: 'text-emerald-600' },
          { label: 'Draft', value: '9', color: 'text-stone-600' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* প্রতিবেদন টেবিল */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base font-semibold">All Service Reports</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search reports..." className="pl-9 h-9 w-full sm:w-[200px]" />
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Site</TableHead>
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Technician</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((r) => (
                <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-mono text-xs">{r.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileBarChart className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium text-sm">{r.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{r.site}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="secondary" className={getTypeBadge(r.type)}>{r.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusBadge(r.status)}>{r.status}</Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">{r.technician}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{r.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
