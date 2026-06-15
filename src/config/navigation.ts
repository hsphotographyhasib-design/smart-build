// src/config/navigation.ts
// নেভিগেশন কনফিগারেশন
// app-layout.tsx থেকে বহিরত স্থায় স্থায়ের জন্য় কেন্ট্রাল

import React from 'react'
import {
  LayoutDashboard, FolderKanban, FileText, Receipt, Calculator,
  ShoppingCart, Package, Users, UserCheck, Clock, DollarSign,
  ClipboardList, Wrench, Truck, CalendarRange, Store,
  Bell, ShieldCheck, UserCog, BarChart3, ScrollText, FileSpreadsheet,
  Activity, Gauge, Hammer, Car, Ruler, UsersRound, ClipboardCheck, TrendingUp, LineChart,
  Wallet, Tags, GitBranch, Target, Megaphone, MessageSquare,
  Brain, Sparkles, FileBarChart, Eye,
} from 'lucide-react'
import type { AppPage } from '@/shared/types'

export interface NavItem {
  label: string
  page: AppPage
  icon: React.ElementType
  badge?: number
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const navSections: NavSection[] = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', page: 'dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Project Management',
    items: [
      { label: 'Projects', page: 'projects', icon: FolderKanban },
      { label: 'Scheduling', page: 'scheduling', icon: CalendarRange },
    ],
  },
  {
    title: 'Finance',
    items: [
      { label: 'Invoices', page: 'invoices', icon: FileText },
      { label: 'Payments', page: 'payments', icon: Receipt },
      { label: 'BOQ', page: 'boq', icon: Calculator },
      { label: 'Day Book', page: 'daybook', icon: FileSpreadsheet },
      { label: 'Cashflow', page: 'cashflow', icon: DollarSign },
    ],
  },
  {
    title: 'Procurement',
    items: [
      { label: 'Purchase Requests', page: 'purchase-requests', icon: ShoppingCart },
      { label: 'Purchase Orders', page: 'purchase-orders', icon: ClipboardList },
      { label: 'Suppliers', page: 'suppliers', icon: Users },
      { label: 'Inventory', page: 'inventory', icon: Package },
    ],
  },
  {
    title: 'Labour & HR',
    items: [
      { label: 'Labour Groups', page: 'labour-groups', icon: UserCheck },
      { label: 'Attendance', page: 'attendance', icon: Clock },
      { label: 'Payroll', page: 'payroll', icon: DollarSign },
      { label: 'Employees', page: 'employees', icon: Users },
      { label: 'Leave Mgmt', page: 'leave', icon: ScrollText },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Sub Contractors', page: 'subcontractors', icon: Truck },
      { label: 'Assets', page: 'assets', icon: Wrench },
    ],
  },
  {
    title: 'Resource Management',
    items: [
      { label: 'Resource Dashboard', page: 'resource-dashboard', icon: Activity },
      { label: 'Resource Planning', page: 'resource-planning', icon: Gauge },
      { label: 'Labour Resources', page: 'labour-resources', icon: Hammer },
      { label: 'Equipment', page: 'equipment-resources', icon: Cog },
      { label: 'Vehicles', page: 'vehicle-resources', icon: Car },
      { label: 'Tools', page: 'tool-resources', icon: Ruler },
      { label: 'Crew Management', page: 'crew-management', icon: UsersRound },
      { label: 'Resource Requests', page: 'resource-requests', icon: ClipboardCheck },
      { label: 'Productivity', page: 'resource-productivity', icon: TrendingUp },
      { label: 'Forecasting', page: 'resource-forecasting', icon: LineChart },
    ],
  },
  {
    title: 'Cost Control',
    items: [
      { label: 'Cost Dashboard', page: 'cost-control-dashboard', icon: Wallet },
      { label: 'Budgets', page: 'budget-management', icon: FileSpreadsheet },
      { label: 'Cost Codes', page: 'cost-codes', icon: Tags },
      { label: 'Change Orders', page: 'budget-change-orders', icon: GitBranch },
      { label: 'Cost Forecasting', page: 'cost-forecasting', icon: Target },
    ],
  },
  {
    title: 'Collaboration',
    items: [
      { label: 'Collab Hub', page: 'collaboration-dashboard', icon: MessageSquare },
      { label: 'RFI Management', page: 'collaboration-rfis', icon: ClipboardList },
      { label: 'Submittals', page: 'collaboration-submittals', icon: FileText },
      { label: 'Discussions', page: 'collaboration-discussions', icon: MessageSquare },
      { label: 'Approvals', page: 'collaboration-approvals', icon: ClipboardCheck },
      { label: 'Announcements', page: 'collaboration-announcements', icon: Megaphone },
    ],
  },
  {
    title: 'Client Portal',
    items: [
      { label: 'Portal Dashboard', page: 'client-dashboard', icon: Users },
      { label: 'Progress', page: 'client-progress', icon: TrendingUp },
      { label: 'Invoices', page: 'client-invoices', icon: Receipt },
      { label: 'Documents', page: 'client-documents', icon: FileText },
      { label: 'Complaints', page: 'client-complaints', icon: MessageSquare },
    ],
  },
  {
    title: 'AI & Analytics',
    items: [
      { label: 'AI Dashboard', page: 'ai-dashboard', icon: Brain },
      { label: 'AI Insights', page: 'ai-insights', icon: Sparkles },
      { label: 'AI Forecasting', page: 'ai-forecast', icon: LineChart },
      { label: 'Project Analytics', page: 'project-analytics', icon: Eye },
      { label: 'Advanced Reports', page: 'advanced-reports', icon: FileBarChart },
    ],
  },
  {
    title: 'Sales',
    items: [
      { label: 'Product Catalog', page: 'product-catalog', icon: Store },
      { label: 'Customers', page: 'customers', icon: Users },
      { label: 'Sales Invoices', page: 'sales-invoices', icon: FileText },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Reports', page: 'reports', icon: BarChart3 },
      { label: 'Audit Log', page: 'audit-log', icon: ShieldCheck },
      { label: 'Notifications', page: 'notifications', icon: Bell },
      { label: 'Users', page: 'users', icon: UserCog },
      { label: 'Settings', page: 'settings', icon: UserCog },
    ],
  },
]