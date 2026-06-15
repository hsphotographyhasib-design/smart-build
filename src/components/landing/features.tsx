'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderKanban,
  DollarSign,
  ShoppingCart,
  Users,
  Wrench,
  UserCheck,
  Check,
  ArrowRight,
  BarChart3,
  CalendarDays,
  FileText,
  Clock,
  Bell,
  Layers,
  PieChart,
  Shield,
  Eye,
  RefreshCw,
  Package,
  CreditCard,
  ClipboardList,
  Building2,
  UserPlus,
  Lock,
  MessageSquare,
  Upload,
  Settings,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface TabData {
  id: string
  label: string
  icon: React.ElementType
  title: string
  description: string
  features: string[]
  mockupType: 'project' | 'finance' | 'procurement' | 'workforce' | 'assets' | 'portal'
}

const tabs: TabData[] = [
  {
    id: 'project',
    label: 'Project Management',
    icon: FolderKanban,
    title: 'Project Management',
    description:
      'Plan, execute, and track construction projects from groundbreaking to handover with full visibility and control.',
    features: [
      'Gantt charts & critical path scheduling',
      'Milestone tracking with automated alerts',
      'Document management & version control',
      'Multi-project portfolio dashboard',
      'RFI & submittal workflow automation',
    ],
    mockupType: 'project',
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: DollarSign,
    title: 'Financial Management',
    description:
      'Complete financial oversight with real-time budgeting, invoicing, and payment tracking across every project.',
    features: [
      'Real-time budget vs. actual tracking',
      'Automated invoicing & payment processing',
      'Multi-currency support & tax management',
      'Financial reporting & analytics',
      'Retention & progress billing',
    ],
    mockupType: 'finance',
  },
  {
    id: 'procurement',
    label: 'Procurement',
    icon: ShoppingCart,
    title: 'Procurement & Supply Chain',
    description:
      'Streamline purchasing from requisition to delivery with vendor management and inventory optimization.',
    features: [
      'Purchase order lifecycle management',
      'Vendor evaluation & scorecards',
      'Inventory tracking & reorder points',
      'Material requisition workflows',
      'Price comparison & bid analysis',
    ],
    mockupType: 'procurement',
  },
  {
    id: 'workforce',
    label: 'Workforce',
    icon: Users,
    title: 'Workforce Management',
    description:
      'Manage your entire workforce with attendance tracking, payroll integration, and compliance management.',
    features: [
      'Time & attendance with GPS verification',
      'Certification & compliance tracking',
      'Payroll processing & integration',
      'Shift scheduling & overtime management',
      'Employee self-service portal',
    ],
    mockupType: 'workforce',
  },
  {
    id: 'assets',
    label: 'Assets',
    icon: Wrench,
    title: 'Asset & Equipment Management',
    description:
      'Track and maintain all construction assets with preventive maintenance scheduling and utilization analytics.',
    features: [
      'Equipment maintenance scheduling',
      'GPS-based asset tracking',
      'Depreciation & lifecycle costing',
      'Tool & small equipment checkouts',
      'Fuel & consumption monitoring',
    ],
    mockupType: 'assets',
  },
  {
    id: 'portal',
    label: 'Client Portal',
    icon: UserCheck,
    title: 'Client Portal',
    description:
      'Provide clients with transparent project visibility, document sharing, and communication tools.',
    features: [
      'Real-time project progress dashboard',
      'Document sharing & approvals',
      'Communication & messaging hub',
      'Change order review & sign-off',
      'Invoice & payment tracking',
    ],
    mockupType: 'portal',
  },
]

function ProjectMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full"
    >
      <div className="rounded-xl border border-blue-100 bg-white p-4 shadow-xl shadow-blue-100/50">
        {/* Header bar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <div className="h-5 w-48 rounded bg-gray-100" />
          <div className="h-5 w-5 rounded bg-gray-100" />
        </div>
        {/* Gantt chart simulation */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-4 w-24 shrink-0 rounded bg-gray-200" />
            <div className="relative h-5 flex-1 rounded bg-gray-50">
              <div className="absolute left-[5%] top-0 h-5 w-[35%] rounded bg-blue-500/80" />
              <div className="absolute left-[45%] top-0 h-5 w-[25%] rounded bg-orange-400/80" />
              <div className="absolute left-[75%] top-0 h-5 w-[20%] rounded bg-blue-300/80" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-4 w-28 shrink-0 rounded bg-gray-200" />
            <div className="relative h-5 flex-1 rounded bg-gray-50">
              <div className="absolute left-[10%] top-0 h-5 w-[50%] rounded bg-blue-600/80" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-4 w-20 shrink-0 rounded bg-gray-200" />
            <div className="relative h-5 flex-1 rounded bg-gray-50">
              <div className="absolute left-[25%] top-0 h-5 w-[30%] rounded bg-green-500/80" />
              <div className="absolute left-[60%] top-0 h-5 w-[35%] rounded bg-orange-500/80" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-4 w-32 shrink-0 rounded bg-gray-200" />
            <div className="relative h-5 flex-1 rounded bg-gray-50">
              <div className="absolute left-[0%] top-0 h-5 w-[60%] rounded bg-blue-400/80" />
            </div>
          </div>
        </div>
        {/* Stats row */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-blue-50 p-2 text-center">
            <div className="text-xs text-blue-600">On Track</div>
            <div className="text-lg font-bold text-blue-700">12</div>
          </div>
          <div className="rounded-lg bg-orange-50 p-2 text-center">
            <div className="text-xs text-orange-600">At Risk</div>
            <div className="text-lg font-bold text-orange-700">3</div>
          </div>
          <div className="rounded-lg bg-green-50 p-2 text-center">
            <div className="text-xs text-green-600">Complete</div>
            <div className="text-lg font-bold text-green-700">8</div>
          </div>
        </div>
      </div>
      {/* Floating element */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -right-4 -top-4 rounded-lg border border-blue-100 bg-white p-3 shadow-lg"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
            <Check className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-800">Milestone Hit</div>
            <div className="text-[10px] text-gray-500">Foundation Complete</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function FinanceMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full"
    >
      <div className="rounded-xl border border-blue-100 bg-white p-4 shadow-xl shadow-blue-100/50">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <div className="h-5 w-48 rounded bg-gray-100" />
          <div className="h-5 w-5 rounded bg-gray-100" />
        </div>
        {/* Budget vs Actual bars */}
        <div className="space-y-3">
          {[
            { label: 'Site Prep', budget: 85, actual: 72, color: 'bg-blue-500' },
            { label: 'Structural', budget: 65, actual: 70, color: 'bg-orange-500' },
            { label: 'Electrical', budget: 50, actual: 38, color: 'bg-blue-500' },
            { label: 'Plumbing', budget: 40, actual: 42, color: 'bg-orange-500' },
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>{item.label}</span>
                <span>${item.actual}k / ${item.budget}k</span>
              </div>
              <div className="relative h-3 w-full rounded-full bg-gray-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.budget}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className={`absolute left-0 top-0 h-3 rounded-full ${item.color}/20`}
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.actual}%` }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className={`absolute left-0 top-0 h-3 rounded-full ${item.color}`}
                />
              </div>
            </div>
          ))}
        </div>
        {/* Revenue card */}
        <div className="mt-4 flex gap-2">
          <div className="flex-1 rounded-lg bg-green-50 p-3">
            <div className="text-[10px] text-green-600">Revenue YTD</div>
            <div className="text-lg font-bold text-green-700">$2.4M</div>
            <div className="flex items-center gap-1 text-[10px] text-green-600">
              <TrendingUp className="h-3 w-3" />
              +12.5%
            </div>
          </div>
          <div className="flex-1 rounded-lg bg-blue-50 p-3">
            <div className="text-[10px] text-blue-600">Outstanding</div>
            <div className="text-lg font-bold text-blue-700">$340k</div>
            <div className="text-[10px] text-blue-500">7 invoices</div>
          </div>
        </div>
      </div>
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -left-4 bottom-8 rounded-lg border border-blue-100 bg-white p-3 shadow-lg"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <DollarSign className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-800">Payment Received</div>
            <div className="text-[10px] text-gray-500">$45,000 from ABC Corp</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function ProcurementMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full"
    >
      <div className="rounded-xl border border-blue-100 bg-white p-4 shadow-xl shadow-blue-100/50">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <div className="h-5 w-48 rounded bg-gray-100" />
          <div className="h-5 w-5 rounded bg-gray-100" />
        </div>
        {/* PO list */}
        <div className="space-y-2">
          {[
            { id: 'PO-2024-001', vendor: 'SteelCorp', amount: '$12,500', status: 'Approved', color: 'bg-green-500' },
            { id: 'PO-2024-002', vendor: 'ConcreteMix', amount: '$8,200', status: 'Pending', color: 'bg-yellow-500' },
            { id: 'PO-2024-003', vendor: 'WireTech', amount: '$3,750', status: 'In Transit', color: 'bg-blue-500' },
            { id: 'PO-2024-004', vendor: 'PipeWorks', amount: '$15,800', status: 'Approved', color: 'bg-green-500' },
          ].map((po) => (
            <div key={po.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-2.5">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${po.color}`} />
                <div>
                  <div className="text-[11px] font-semibold text-gray-700">{po.id}</div>
                  <div className="text-[10px] text-gray-400">{po.vendor}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-semibold text-gray-700">{po.amount}</div>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                  {po.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        {/* Inventory summary */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-orange-50 p-2 text-center">
            <div className="text-xs text-orange-600">Low Stock</div>
            <div className="text-lg font-bold text-orange-700">5</div>
          </div>
          <div className="rounded-lg bg-blue-50 p-2 text-center">
            <div className="text-xs text-blue-600">Pending</div>
            <div className="text-lg font-bold text-blue-700">12</div>
          </div>
          <div className="rounded-lg bg-green-50 p-2 text-center">
            <div className="text-xs text-green-600">Delivered</div>
            <div className="text-lg font-bold text-green-700">48</div>
          </div>
        </div>
      </div>
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -right-4 bottom-12 rounded-lg border border-blue-100 bg-white p-3 shadow-lg"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
            <Package className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-800">Shipment Arrived</div>
            <div className="text-[10px] text-gray-500">PO-2024-003 delivered</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function WorkforceMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full"
    >
      <div className="rounded-xl border border-blue-100 bg-white p-4 shadow-xl shadow-blue-100/50">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <div className="h-5 w-48 rounded bg-gray-100" />
          <div className="h-5 w-5 rounded bg-gray-100" />
        </div>
        {/* Team rows */}
        <div className="space-y-2">
          {[
            { team: 'Electricians', count: 12, present: 10, color: 'bg-blue-500' },
            { team: 'Plumbers', count: 8, present: 7, color: 'bg-orange-500' },
            { team: 'Carpenters', count: 15, present: 15, color: 'bg-green-500' },
            { team: 'Welders', count: 6, present: 4, color: 'bg-blue-500' },
          ].map((team) => (
            <div key={team.team} className="flex items-center gap-3">
              <div className="w-20 shrink-0 text-[11px] font-medium text-gray-600">{team.team}</div>
              <div className="flex flex-1 gap-0.5">
                {Array.from({ length: team.count }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-5 w-5 rounded-full ${
                      i < team.present
                        ? `${team.color}`
                        : 'bg-gray-200'
                    } flex items-center justify-center`}
                  >
                    {i < team.present && (
                      <span className="text-[7px] font-bold text-white">✓</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="w-12 text-right text-[11px] font-semibold text-gray-600">
                {team.present}/{team.count}
              </div>
            </div>
          ))}
        </div>
        {/* Stats */}
        <div className="mt-4 flex gap-2">
          <div className="flex-1 rounded-lg bg-green-50 p-3">
            <div className="text-[10px] text-green-600">On Site Today</div>
            <div className="text-lg font-bold text-green-700">36</div>
          </div>
          <div className="flex-1 rounded-lg bg-orange-50 p-3">
            <div className="text-[10px] text-orange-600">Overtime Hours</div>
            <div className="text-lg font-bold text-orange-700">24.5</div>
          </div>
          <div className="flex-1 rounded-lg bg-blue-50 p-3">
            <div className="text-[10px] text-blue-600">Compliance</div>
            <div className="text-lg font-bold text-blue-700">98%</div>
          </div>
        </div>
      </div>
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -left-4 -top-4 rounded-lg border border-blue-100 bg-white p-3 shadow-lg"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
            <UserPlus className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-800">Clock-In</div>
            <div className="text-[10px] text-gray-500">2 workers arrived</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function AssetsMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full"
    >
      <div className="rounded-xl border border-blue-100 bg-white p-4 shadow-xl shadow-blue-100/50">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <div className="h-5 w-48 rounded bg-gray-100" />
          <div className="h-5 w-5 rounded bg-gray-100" />
        </div>
        {/* Equipment cards */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: 'Excavator A', status: 'Active', util: 92, color: 'bg-green-500' },
            { name: 'Crane B', status: 'Maintenance', util: 0, color: 'bg-yellow-500' },
            { name: 'Bulldozer C', status: 'Active', util: 78, color: 'bg-green-500' },
            { name: 'Generator D', status: 'Idle', util: 15, color: 'bg-gray-400' },
          ].map((eq) => (
            <div key={eq.name} className="rounded-lg border border-gray-100 bg-gray-50 p-2.5">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold text-gray-700">{eq.name}</div>
                <div className={`h-2 w-2 rounded-full ${eq.color}`} />
              </div>
              <div className="mt-1.5 text-[10px] text-gray-400">{eq.status}</div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200">
                <div
                  className={`h-1.5 rounded-full ${
                    eq.util > 80 ? 'bg-green-500' : eq.util > 40 ? 'bg-blue-500' : 'bg-gray-400'
                  }`}
                  style={{ width: `${eq.util}%` }}
                />
              </div>
              <div className="mt-0.5 text-right text-[9px] text-gray-400">{eq.util}% util</div>
            </div>
          ))}
        </div>
        {/* Maintenance alert */}
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-orange-50 p-2.5">
          <Bell className="h-4 w-4 shrink-0 text-orange-500" />
          <div>
            <div className="text-[11px] font-medium text-orange-700">Maintenance Due</div>
            <div className="text-[10px] text-orange-500">Crane B — 500hr service in 2 days</div>
          </div>
        </div>
      </div>
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -right-4 -top-4 rounded-lg border border-blue-100 bg-white p-3 shadow-lg"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
            <Wrench className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-800">Inspection</div>
            <div className="text-[10px] text-gray-500">Excavator A passed</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function PortalMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full"
    >
      <div className="rounded-xl border border-blue-100 bg-white p-4 shadow-xl shadow-blue-100/50">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <div className="h-5 w-48 rounded bg-gray-100" />
          <div className="h-5 w-5 rounded bg-gray-100" />
        </div>
        {/* Client project view */}
        <div className="mb-3 rounded-lg bg-blue-50 p-3">
          <div className="text-[11px] font-semibold text-blue-700">Riverside Tower — Phase 2</div>
          <div className="mt-1 text-[10px] text-blue-500">Overall Progress</div>
          <div className="mt-1.5 h-2.5 w-full rounded-full bg-blue-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '68%' }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-2.5 rounded-full bg-blue-600"
            />
          </div>
          <div className="mt-1 text-right text-[10px] font-semibold text-blue-700">68%</div>
        </div>
        {/* Recent updates */}
        <div className="space-y-2">
          {[
            { icon: Upload, text: 'Floor Plan v3 uploaded', time: '2h ago', color: 'text-blue-600 bg-blue-100' },
            { icon: MessageSquare, text: 'New comment on electrical specs', time: '5h ago', color: 'text-orange-600 bg-orange-100' },
            { icon: FileText, text: 'Change Order #12 approved', time: '1d ago', color: 'text-green-600 bg-green-100' },
          ].map((update, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg bg-gray-50 p-2">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${update.color}`}>
                <update.icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1">
                <div className="text-[11px] text-gray-700">{update.text}</div>
                <div className="text-[9px] text-gray-400">{update.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -left-4 bottom-12 rounded-lg border border-blue-100 bg-white p-3 shadow-lg"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <UserCheck className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-800">Client Approved</div>
            <div className="text-[10px] text-gray-500">Floor Plan v3 signed off</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

const mockupComponents: Record<string, React.FC> = {
  project: ProjectMockup,
  finance: FinanceMockup,
  procurement: ProcurementMockup,
  workforce: WorkforceMockup,
  assets: AssetsMockup,
  portal: PortalMockup,
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.15 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export function Features() {
  const [activeTab, setActiveTab] = useState('project')
  const activeData = tabs.find((t) => t.id === activeTab)!

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything You Need to{' '}
            <span className="text-blue-600">Build Smarter</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
            Comprehensive tools designed for the construction industry
          </p>
        </motion.div>

        {/* Tab buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1.5 no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid items-center gap-12 lg:grid-cols-2"
          >
            {/* Left content */}
            <motion.div variants={itemVariants} className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                {activeData.title}
              </h3>
              <p className="text-gray-500 leading-relaxed">{activeData.description}</p>
              <ul className="space-y-3">
                {activeData.features.map((feature, i) => (
                  <motion.li
                    key={i}
                    variants={itemVariants}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <Check className="h-3 w-3 text-blue-600" />
                    </div>
                    <span className="text-gray-600">{feature}</span>
                  </motion.li>
                ))}
              </ul>
              <motion.div variants={itemVariants}>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Learn More
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Right mockup */}
            <motion.div variants={itemVariants} className="relative">
              {mockupComponents[activeData.mockupType] &&
                (() => {
                  const MockupComponent = mockupComponents[activeData.mockupType]
                  return <MockupComponent />
                })()}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}