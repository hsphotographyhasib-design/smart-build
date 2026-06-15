import { db } from '@/lib/db'

const featureFlags = [
  // Project Management
  { key: 'projects.enabled', name: 'Project Management', module: 'projects', description: 'Full project lifecycle management', enabled: true, isBeta: false },
  { key: 'projects.scheduling', name: 'Project Scheduling', module: 'projects', description: 'Gantt chart and timeline scheduling', enabled: true, isBeta: false },
  { key: 'projects.tasks', name: 'Task Management', module: 'projects', description: 'Project tasks and milestones', enabled: true, isBeta: false },
  { key: 'projects.daily-notes', name: 'Daily Site Notes', module: 'projects', description: 'Daily construction site reports', enabled: true, isBeta: false },
  
  // Finance
  { key: 'finance.enabled', name: 'Finance Module', module: 'finance', description: 'Financial management suite', enabled: true, isBeta: false },
  { key: 'finance.invoices', name: 'Invoice Management', module: 'finance', description: 'Create and track invoices', enabled: true, isBeta: false },
  { key: 'finance.payments', name: 'Payment Tracking', module: 'finance', description: 'Track all payments', enabled: true, isBeta: false },
  { key: 'finance.boq', name: 'Bill of Quantities', module: 'finance', description: 'BOQ management', enabled: true, isBeta: false },
  { key: 'finance.daybook', name: 'Day Book', module: 'finance', description: 'Daily financial journal', enabled: true, isBeta: false },
  { key: 'finance.cashflow', name: 'Cashflow Management', module: 'finance', description: 'Cashflow forecasting', enabled: true, isBeta: false },
  { key: 'finance.payroll', name: 'Payroll Processing', module: 'finance', description: 'Payroll generation and payment', enabled: true, isBeta: false },
  
  // Procurement
  { key: 'procurement.enabled', name: 'Procurement Module', module: 'procurement', description: 'Procurement management', enabled: true, isBeta: false },
  { key: 'procurement.purchase-requests', name: 'Purchase Requests', module: 'procurement', description: 'Material purchase requests', enabled: true, isBeta: false },
  { key: 'procurement.purchase-orders', name: 'Purchase Orders', module: 'procurement', description: 'PO management', enabled: true, isBeta: false },
  { key: 'procurement.inventory', name: 'Inventory Management', module: 'procurement', description: 'Stock and inventory tracking', enabled: true, isBeta: false },
  
  // HR
  { key: 'hr.enabled', name: 'HR Module', module: 'hr', description: 'Human resources management', enabled: true, isBeta: false },
  { key: 'hr.employees', name: 'Employee Management', module: 'hr', description: 'Employee records', enabled: true, isBeta: false },
  { key: 'hr.attendance', name: 'Attendance Tracking', module: 'hr', description: 'Labour attendance', enabled: true, isBeta: false },
  { key: 'hr.leave', name: 'Leave Management', module: 'hr', description: 'Leave requests and approval', enabled: true, isBeta: false },
  { key: 'hr.labour-groups', name: 'Labour Groups', module: 'hr', description: 'Labour group management', enabled: true, isBeta: false },
  
  // Resources
  { key: 'resources.enabled', name: 'Resource Management', module: 'resources', description: 'Resource planning and allocation', enabled: true, isBeta: false },
  { key: 'resources.equipment', name: 'Equipment Tracking', module: 'resources', description: 'Equipment management', enabled: true, isBeta: false },
  { key: 'resources.vehicles', name: 'Vehicle Tracking', module: 'resources', description: 'Vehicle fleet management', enabled: true, isBeta: false },
  { key: 'resources.tools', name: 'Tool Management', module: 'resources', description: 'Tool inventory', enabled: true, isBeta: false },
  { key: 'resources.crews', name: 'Crew Management', module: 'resources', description: 'Work crew management', enabled: true, isBeta: false },
  
  // Cost Control
  { key: 'cost-control.enabled', name: 'Cost Control', module: 'cost-control', description: 'Budget tracking and cost management', enabled: true, isBeta: false },
  { key: 'cost-control.budgets', name: 'Budget Management', module: 'cost-control', description: 'Project budgets', enabled: true, isBeta: false },
  { key: 'cost-control.forecasting', name: 'Cost Forecasting', module: 'cost-control', description: 'AI-powered cost prediction', enabled: true, isBeta: false },
  
  // Collaboration
  { key: 'collaboration.enabled', name: 'Collaboration Hub', module: 'collaboration', description: 'Team collaboration tools', enabled: true, isBeta: false },
  { key: 'collaboration.rfis', name: 'RFI Management', module: 'collaboration', description: 'Requests for Information', enabled: true, isBeta: false },
  { key: 'collaboration.submittals', name: 'Submittals', module: 'collaboration', description: 'Document submittals', enabled: true, isBeta: false },
  { key: 'collaboration.discussions', name: 'Discussions', module: 'collaboration', description: 'Project discussions', enabled: true, isBeta: false },
  
  // Client Portal
  { key: 'client-portal.enabled', name: 'Client Portal', module: 'client-portal', description: 'External client access portal', enabled: true, isBeta: false },
  
  // AI
  { key: 'ai.enabled', name: 'AI & Analytics', module: 'ai', description: 'AI-powered analytics', enabled: true, isBeta: false },
  { key: 'ai.forecast', name: 'AI Forecasting', module: 'ai', description: 'AI-powered forecasting', enabled: true, isBeta: true },
  { key: 'ai.insights', name: 'AI Insights', module: 'ai', description: 'Automated insights', enabled: true, isBeta: true },
  
  // Sales
  { key: 'sales.enabled', name: 'Sales Module', module: 'sales', description: 'Product sales management', enabled: true, isBeta: false },
  
  // Operations
  { key: 'operations.enabled', name: 'Operations Module', module: 'operations', description: 'Subcontractors and work orders', enabled: true, isBeta: false },
  { key: 'operations.subcontractors', name: 'Subcontractors', module: 'operations', description: 'Subcontractor management', enabled: true, isBeta: false },
  { key: 'operations.work-orders', name: 'Work Orders', module: 'operations', description: 'Work order management', enabled: true, isBeta: false },
  { key: 'operations.assets', name: 'Asset Management', module: 'operations', description: 'Company asset tracking', enabled: true, isBeta: false },
]

const systemVersions = [
  { version: '1.0.0', title: 'SmartBuild ERP - Initial Release', releaseNotes: 'Core modules: Projects, Finance, Procurement, HR, Resources, Cost Control, Collaboration, Client Portal, AI Analytics. Role-based access control with 10 roles.' },
]

export async function seedFeatureFlags() {
  console.log('Seeding feature flags...')
  
  for (const flag of featureFlags) {
    await db.featureFlag.upsert({
      where: { key: flag.key },
      update: {},
      create: flag,
    })
  }
  
  for (const ver of systemVersions) {
    await db.systemVersion.upsert({
      where: { version: ver.version },
      update: {},
      create: ver,
    })
  }
  
  console.log(`Seeded ${featureFlags.length} feature flags and ${systemVersions.length} versions`)
}