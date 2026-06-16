/**
 * Menu Seed Script — run: bun run scripts/seed-menus.ts
 */
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

interface ItemDef {
  label: string; page: string; icon: string; sortOrder: number; children?: ItemDef[]
}
interface GroupDef {
  code: string; label: string; icon: string; sortOrder: number; items: ItemDef[]
}

const menuData: GroupDef[] = [
  { code: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', sortOrder: 0, items: [
    { label: 'Overview', page: 'dashboard', icon: 'LayoutDashboard', sortOrder: 0 },
  ]},
  { code: 'project-management', label: 'Project Management', icon: 'FolderKanban', sortOrder: 1, items: [
    { label: 'Dashboard', page: 'pm-dashboard', icon: 'LayoutDashboard', sortOrder: 0 },
    { label: 'Projects', page: 'projects', icon: 'FolderKanban', sortOrder: 1 },
    { label: 'Project Teams', page: 'pm-teams', icon: 'UsersRound', sortOrder: 2 },
    { label: 'Daily Reports', page: 'pm-daily-reports', icon: 'FileText', sortOrder: 3 },
    { label: 'Site Photos', page: 'pm-site-photos', icon: 'Camera', sortOrder: 4 },
    { label: 'Documents', page: 'pm-documents', icon: 'File', sortOrder: 5 },
    { label: 'Tasks', page: 'pm-tasks', icon: 'CheckSquare', sortOrder: 6 },
    { label: 'Milestones', page: 'pm-milestones', icon: 'Flag', sortOrder: 7 },
    { label: 'Project Calendar', page: 'pm-calendar', icon: 'CalendarDays', sortOrder: 8 },
    { label: 'Project Reports', page: 'pm-reports', icon: 'BarChart3', sortOrder: 9 },
  ]},
  { code: 'tender-management', label: 'Tender & Bid Management', icon: 'Gavel', sortOrder: 2, items: [
    { label: 'Dashboard', page: 'tender-dashboard', icon: 'LayoutDashboard', sortOrder: 0 },
    { label: 'Tender Packages', page: 'tender-packages', icon: 'FileText', sortOrder: 1 },
    { label: 'Bid Invitations', page: 'tender-invitations', icon: 'Mail', sortOrder: 2 },
    { label: 'Vendor Management', page: 'tender-vendors', icon: 'Building2', sortOrder: 3 },
    { label: 'Bid Submissions', page: 'tender-bids', icon: 'Send', sortOrder: 4 },
    { label: 'Bid Comparison', page: 'tender-comparison', icon: 'BarChart3', sortOrder: 5 },
    { label: 'Technical Evaluation', page: 'tender-evaluation', icon: 'ClipboardCheck', sortOrder: 6 },
    { label: 'Commercial Evaluation', page: 'tender-commercial-eval', icon: 'DollarSign', sortOrder: 7 },
    { label: 'Award Management', page: 'tender-award', icon: 'Trophy', sortOrder: 8 },
    { label: 'Contracts', page: 'tender-contracts', icon: 'FileCheck', sortOrder: 9 },
    { label: 'Tender Reports', page: 'tender-reports', icon: 'FileBarChart', sortOrder: 10 },
  ]},
  { code: 'scheduling-gantt', label: 'Scheduling & Gantt', icon: 'CalendarClock', sortOrder: 3, items: [
    { label: 'Dashboard', page: 'schedule-dashboard', icon: 'LayoutDashboard', sortOrder: 0 },
    { label: 'Project Schedules', page: 'schedule-list', icon: 'GanttChart', sortOrder: 1 },
    { label: 'Gantt Charts', page: 'schedule-gantt', icon: 'ChartBar', sortOrder: 2 },
    { label: 'Lookahead Planning', page: 'schedule-lookahead', icon: 'Binoculars', sortOrder: 3 },
    { label: 'Milestones', page: 'schedule-milestones', icon: 'Flag', sortOrder: 4 },
    { label: 'Dependencies', page: 'schedule-dependencies', icon: 'GitBranch', sortOrder: 5 },
    { label: 'Critical Path', page: 'schedule-critical-path', icon: 'Route', sortOrder: 6 },
    { label: 'Resource Scheduling', page: 'schedule-resources', icon: 'Users', sortOrder: 7 },
    { label: 'Baselines', page: 'schedule-baselines', icon: 'GitCompare', sortOrder: 8 },
    { label: 'Progress Tracking', page: 'schedule-progress', icon: 'TrendingUp', sortOrder: 9 },
    { label: 'Schedule Reports', page: 'schedule-reports', icon: 'FileBarChart', sortOrder: 10 },
  ]},
  { code: 'resource-management', label: 'Resource Management', icon: 'Activity', sortOrder: 4, items: [
    { label: 'Dashboard', page: 'resource-dashboard', icon: 'Activity', sortOrder: 0 },
    { label: 'Planning', page: 'resource-planning', icon: 'Gauge', sortOrder: 1 },
    { label: 'Labour', page: 'labour-resources', icon: 'HardHat', sortOrder: 2 },
    { label: 'Equipment', page: 'equipment-resources', icon: 'Hammer', sortOrder: 3 },
    { label: 'Vehicles', page: 'vehicle-resources', icon: 'Car', sortOrder: 4 },
    { label: 'Tools', page: 'tool-resources', icon: 'Ruler', sortOrder: 5 },
    { label: 'Crew Management', page: 'crew-management', icon: 'UsersRound', sortOrder: 6 },
    { label: 'Requests', page: 'resource-requests', icon: 'ClipboardCheck', sortOrder: 7 },
    { label: 'Productivity', page: 'resource-productivity', icon: 'TrendingUp', sortOrder: 8 },
    { label: 'Forecasting', page: 'resource-forecasting', icon: 'LineChart', sortOrder: 9 },
  ]},
  { code: 'maintenance-management', label: 'Maintenance Management', icon: 'Shield', sortOrder: 5, items: [
    { label: 'Dashboard', page: 'maintenance-dashboard', icon: 'Shield', sortOrder: 0 },
    { label: 'Service Requests', page: 'maintenance-service-requests', icon: 'Clipboard', sortOrder: 1 },
    { label: 'Complaints', page: 'maintenance-complaints', icon: 'AlertTriangle', sortOrder: 2 },
    { label: 'Work Orders', page: 'maintenance-work-orders-maintenance', icon: 'Wrench', sortOrder: 3 },
    { label: 'Preventive Maintenance', page: 'maintenance-pm-schedules', icon: 'Calendar', sortOrder: 4 },
    { label: 'AMC Contracts', page: 'maintenance-amc', icon: 'FileCheck', sortOrder: 5 },
    { label: 'Dispatch Center', page: 'maintenance-dispatch', icon: 'MapPin', sortOrder: 6 },
    { label: 'Technicians', page: 'maintenance-technicians', icon: 'Users', sortOrder: 7 },
    { label: 'Material Requests', page: 'maintenance-materials', icon: 'Package', sortOrder: 8 },
    { label: 'Maintenance Sites', page: 'maintenance-sites', icon: 'Building2', sortOrder: 9 },
    { label: 'SLA Management', page: 'maintenance-sla', icon: 'ShieldCheck', sortOrder: 10 },
    { label: 'Service Reports', page: 'maintenance-reports', icon: 'ClipboardCheck', sortOrder: 11 },
    { label: 'Maintenance Invoices', page: 'maintenance-invoices-maintenance', icon: 'Receipt', sortOrder: 12 },
  ]},
  { code: 'procurement', label: 'Procurement', icon: 'ShoppingCart', sortOrder: 6, items: [
    { label: 'Purchase Requests', page: 'purchase-requests', icon: 'ShoppingCart', sortOrder: 0 },
    { label: 'Purchase Orders', page: 'purchase-orders', icon: 'ClipboardList', sortOrder: 1 },
    { label: 'Suppliers', page: 'suppliers', icon: 'Users', sortOrder: 2 },
  ]},
  { code: 'inventory', label: 'Inventory', icon: 'Package', sortOrder: 7, items: [
    { label: 'Inventory', page: 'inventory', icon: 'Package', sortOrder: 0 },
    { label: 'Stock Ledger', page: 'stock-ledger', icon: 'ScrollText', sortOrder: 1 },
  ]},
  { code: 'finance', label: 'Finance', icon: 'DollarSign', sortOrder: 8, items: [
    { label: 'Invoice Management', page: 'invoice-management', icon: 'FileText', sortOrder: 0 },
    { label: 'Invoicing', page: '', icon: 'FileText', sortOrder: 1, children: [
      { label: 'Customer Invoices', page: 'invoices', icon: 'FileText', sortOrder: 0 },
      { label: 'Sales Invoices', page: 'sales-invoices', icon: 'Receipt', sortOrder: 1 },
      { label: 'Maintenance Invoices', page: 'maintenance-invoices', icon: 'FileCheck', sortOrder: 2 },
    ]},
    { label: 'Approval Workflows', page: 'invoice-workflows', icon: 'GitBranch', sortOrder: 2 },
    { label: 'Invoice Payments', page: 'invoice-payments', icon: 'Receipt', sortOrder: 3 },
    { label: 'Retention', page: 'invoice-retention', icon: 'Shield', sortOrder: 4 },
    { label: 'Payments', page: 'payments', icon: 'Receipt', sortOrder: 5 },
    { label: 'BOQ', page: 'boq', icon: 'Calculator', sortOrder: 6 },
    { label: 'Day Book', page: 'daybook', icon: 'FileSpreadsheet', sortOrder: 7 },
    { label: 'Cashflow', page: 'cashflow', icon: 'DollarSign', sortOrder: 8 },
    { label: 'Cost Control', page: '', icon: 'Wallet', sortOrder: 9, children: [
      { label: 'Dashboard', page: 'cost-control-dashboard', icon: 'Wallet', sortOrder: 0 },
      { label: 'Budgets', page: 'budget-management', icon: 'FileSpreadsheet', sortOrder: 1 },
      { label: 'Cost Codes', page: 'cost-codes', icon: 'Tags', sortOrder: 2 },
      { label: 'Change Orders', page: 'budget-change-orders', icon: 'GitBranch', sortOrder: 3 },
      { label: 'Forecasting', page: 'cost-forecasting', icon: 'Target', sortOrder: 4 },
    ]},
  ]},
  { code: 'hr-payroll', label: 'HR & Payroll', icon: 'Users', sortOrder: 9, items: [
    { label: 'Employees', page: 'employees', icon: 'Users', sortOrder: 0 },
    { label: 'Labour Groups', page: 'labour-groups', icon: 'UserCheck', sortOrder: 1 },
    { label: 'Attendance', page: 'attendance', icon: 'Clock', sortOrder: 2 },
    { label: 'Payroll', page: 'payroll', icon: 'DollarSign', sortOrder: 3 },
    { label: 'Leave Management', page: 'leave', icon: 'ScrollText', sortOrder: 4 },
    { label: 'Loans', page: 'loans', icon: 'Wallet', sortOrder: 5 },
  ]},
  { code: 'asset-management', label: 'Asset Management', icon: 'Wrench', sortOrder: 10, items: [
    { label: 'Assets', page: 'assets', icon: 'Wrench', sortOrder: 0 },
    { label: 'Work Orders', page: 'work-orders', icon: 'ClipboardList', sortOrder: 1 },
    { label: 'Sub Contractors', page: 'subcontractors', icon: 'Truck', sortOrder: 2 },
  ]},
  { code: 'collaboration', label: 'Collaboration', icon: 'MessageSquare', sortOrder: 11, items: [
    { label: 'Hub', page: 'collaboration-dashboard', icon: 'MessageSquare', sortOrder: 0 },
    { label: 'RFI Management', page: 'collaboration-rfis', icon: 'ClipboardList', sortOrder: 1 },
    { label: 'Submittals', page: 'collaboration-submittals', icon: 'FileText', sortOrder: 2 },
    { label: 'Discussions', page: 'collaboration-discussions', icon: 'MessageSquare', sortOrder: 3 },
    { label: 'Approvals', page: 'collaboration-approvals', icon: 'ClipboardCheck', sortOrder: 4 },
    { label: 'Announcements', page: 'collaboration-announcements', icon: 'Megaphone', sortOrder: 5 },
  ]},
  { code: 'client-portal', label: 'Client Portal', icon: 'Users', sortOrder: 12, items: [
    { label: 'Dashboard', page: 'client-dashboard', icon: 'Users', sortOrder: 0 },
    { label: 'Progress', page: 'client-progress', icon: 'TrendingUp', sortOrder: 1 },
    { label: 'Invoices', page: 'client-invoices', icon: 'Receipt', sortOrder: 2 },
    { label: 'Documents', page: 'client-documents', icon: 'FileText', sortOrder: 3 },
    { label: 'Complaints', page: 'client-complaints', icon: 'MessageSquare', sortOrder: 4 },
    { label: 'Service Requests', page: 'client-service-requests', icon: 'Headphones', sortOrder: 5 },
  ]},
  { code: 'sales', label: 'Sales', icon: 'Store', sortOrder: 13, items: [
    { label: 'Product Catalog', page: 'product-catalog', icon: 'Store', sortOrder: 0 },
    { label: 'Customers', page: 'customers', icon: 'Users', sortOrder: 1 },
  ]},
  { code: 'reports', label: 'Reports', icon: 'BarChart3', sortOrder: 14, items: [
    { label: 'Reports', page: 'reports', icon: 'BarChart3', sortOrder: 0 },
    { label: 'AI & Analytics', page: '', icon: 'Brain', sortOrder: 1, children: [
      { label: 'AI Dashboard', page: 'ai-dashboard', icon: 'Brain', sortOrder: 0 },
      { label: 'AI Insights', page: 'ai-insights', icon: 'Sparkles', sortOrder: 1 },
      { label: 'AI Forecasting', page: 'ai-forecast', icon: 'LineChart', sortOrder: 2 },
      { label: 'Project Analytics', page: 'project-analytics', icon: 'Eye', sortOrder: 3 },
      { label: 'Advanced Reports', page: 'advanced-reports', icon: 'FileBarChart', sortOrder: 4 },
    ]},
    { label: 'Audit Log', page: 'audit-log', icon: 'ShieldCheck', sortOrder: 2 },
    { label: 'Notifications', page: 'notifications', icon: 'Bell', sortOrder: 3 },
  ]},
  { code: 'whatsapp', label: 'WhatsApp', icon: 'MessageCircle', sortOrder: 14, items: [
    { label: 'Complaints Dashboard', page: 'whatsapp-complaints', icon: 'Smartphone', sortOrder: 0 },
    { label: 'Inbox', page: 'whatsapp-inbox', icon: 'MessageCircle', sortOrder: 1 },
    { label: 'Dispatch', page: 'whatsapp-dispatch', icon: 'MapPin', sortOrder: 2 },
    { label: 'Technician Portal', page: 'whatsapp-technician', icon: 'Users', sortOrder: 3 },
    { label: 'Admin Settings', page: 'whatsapp-admin', icon: 'Settings', sortOrder: 4 },
  ]},
  { code: 'settings', label: 'Settings', icon: 'Settings', sortOrder: 15, items: [
    { label: 'Users', page: 'users', icon: 'UserCog', sortOrder: 0 },
    { label: 'Roles & Permissions', page: 'roles-permissions', icon: 'ShieldCheck', sortOrder: 1 },
    { label: 'Settings', page: 'settings', icon: 'Settings', sortOrder: 2 },
    { label: 'Login Activity', page: 'login-activity', icon: 'Shield', sortOrder: 3 },
  ]},
]

const rolePermissions: Record<string, string[]> = {
  admin: [],
  project_manager: ['dashboard','project-management','tender-management','scheduling-gantt','resource-management','procurement','finance','hr-payroll','collaboration','client-portal','reports'],
  supervisor: ['dashboard','project-management','scheduling-gantt','resource-management','maintenance-management','procurement','inventory','finance','hr-payroll','asset-management','collaboration','reports','whatsapp'],
  accountant: ['dashboard','finance','reports'],
  site_engineer: ['dashboard','project-management','scheduling-gantt','procurement','hr-payroll','resource-management','maintenance-management','inventory'],
  qs: ['dashboard','project-management','scheduling-gantt','procurement','inventory','resource-management','finance'],
  hr_manager: ['dashboard','hr-payroll','reports','settings'],
  store_manager: ['dashboard','procurement','inventory','resource-management','reports'],
  client: ['dashboard','client-portal','reports'],
  technician: ['dashboard','maintenance-management','whatsapp','hr-payroll'],
  dispatcher: ['dashboard','maintenance-management','whatsapp'],
  labour: ['dashboard','hr-payroll'],
}

async function seed() {
  console.log('Seeding menu configuration...')
  await prisma.roleAccess.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.menuGroup.deleteMany()
  console.log('Cleared existing menu data')

  for (const gDef of menuData) {
    const group = await prisma.menuGroup.create({
      data: { code: gDef.code, label: gDef.label, icon: gDef.icon, sortOrder: gDef.sortOrder },
    })
    for (const iDef of gDef.items) {
      const page = iDef.page || `__cat__${gDef.code}__${iDef.label.toLowerCase().replace(/\s+/g, '-')}`
      const item = await prisma.menuItem.create({
        data: { groupId: group.id, label: iDef.label, page, icon: iDef.icon, sortOrder: iDef.sortOrder },
      })
      if (iDef.children) {
        for (const cDef of iDef.children) {
          await prisma.menuItem.create({
            data: { groupId: group.id, parentId: item.id, label: cDef.label, page: cDef.page, icon: cDef.icon, sortOrder: cDef.sortOrder },
          })
        }
      }
    }
  }
  console.log(`Created ${menuData.length} menu groups with items`)

  let permCount = 0
  for (const [role, codes] of Object.entries(rolePermissions)) {
    const allGroups = await prisma.menuGroup.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } })
    const groups = codes.length === 0 ? allGroups : allGroups.filter(g => codes.includes(g.code))
    for (const g of groups) {
      await prisma.roleAccess.upsert({
        where: { groupId_roleId: { groupId: g.id, roleId: role } },
        create: { roleId: role, groupId: g.id, canView: true },
        update: { canView: true },
      })
      permCount++
    }
  }
  console.log(`Created ${permCount} role-menu permissions`)

  const tg = await prisma.menuGroup.count()
  const ti = await prisma.menuItem.count()
  const ts = await prisma.menuItem.count({ where: { parentId: { not: null } } })
  console.log(`Summary: ${tg} groups, ${ti} items (${ts} sub-children), ${permCount} permissions`)
  console.log('Menu seeding complete!')
}

seed().catch(console.error).finally(() => prisma.$disconnect())