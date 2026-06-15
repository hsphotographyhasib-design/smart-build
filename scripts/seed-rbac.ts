/**
 * RBAC Seed Script — run: bun run scripts/seed-rbac.ts
 * Creates all 16 roles, 80+ permissions (module → feature → action), and role-permission mappings.
 */
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

// ─────────────────────────────────────────────────────────────────
// ROLE DEFINITIONS
// ─────────────────────────────────────────────────────────────────
interface RoleDef {
  name: string
  code: string
  description: string
  level: number    // 0 = highest
  isSystem: boolean
}

const roles: RoleDef[] = [
  { name: 'Super Admin', code: 'super_admin', description: 'Full system access. Bypasses ALL permission checks.', level: 0, isSystem: true },
  { name: 'Admin', code: 'admin', description: 'Administrative access to all modules except role management.', level: 1, isSystem: true },
  { name: 'Project Manager', code: 'project_manager', description: 'Full project lifecycle management.', level: 2, isSystem: false },
  { name: 'Planning Engineer', code: 'planning_engineer', description: 'Schedule planning and Gantt management.', level: 3, isSystem: false },
  { name: 'Tender Manager', code: 'tender_manager', description: 'Tender and bid management.', level: 3, isSystem: false },
  { name: 'Procurement Manager', code: 'procurement_manager', description: 'Procurement, purchasing, and supplier management.', level: 3, isSystem: false },
  { name: 'Store Manager', code: 'store_manager', description: 'Inventory and warehouse management.', level: 3, isSystem: false },
  { name: 'Finance Manager', code: 'finance_manager', description: 'Finance, invoicing, payments, and cost control.', level: 2, isSystem: false },
  { name: 'HR Manager', code: 'hr_manager', description: 'HR, payroll, employees, and leave management.', level: 2, isSystem: false },
  { name: 'Maintenance Manager', code: 'maintenance_manager', description: 'Maintenance operations, work orders, and SLA.', level: 2, isSystem: false },
  { name: 'Supervisor', code: 'supervisor', description: 'On-site supervision of workers and tasks.', level: 4, isSystem: false },
  { name: 'Technician', code: 'technician', description: 'Maintenance technician. Assigned work orders only.', level: 5, isSystem: false },
  { name: 'Employee', code: 'employee', description: 'General employee with basic access.', level: 6, isSystem: false },
  { name: 'Customer Service', code: 'customer_service', description: 'Client-facing support for complaints and service requests.', level: 4, isSystem: false },
  { name: 'Client', code: 'client', description: 'External client with own-data-only access.', level: 7, isSystem: false },
  { name: 'Vendor', code: 'vendor', description: 'Vendor/supplier portal access.', level: 7, isSystem: false },
  { name: 'Auditor', code: 'auditor', description: 'Read-only access to reports, audit logs, and financial data.', level: 3, isSystem: false },
]

// ─────────────────────────────────────────────────────────────────
// PERMISSION DEFINITIONS  (module → feature → action[])
// ─────────────────────────────────────────────────────────────────
const MODULES: Record<string, Record<string, string[]>> = {
  // Dashboard
  dashboard: {
    overview: ['view'],
  },

  // Project Management
  projects: {
    projects: ['view', 'create', 'edit', 'delete', 'export'],
    project_teams: ['view', 'create', 'edit', 'delete'],
    daily_reports: ['view', 'create', 'edit', 'delete', 'export'],
    site_photos: ['view', 'upload', 'delete'],
    documents: ['view', 'upload', 'delete'],
    tasks: ['view', 'create', 'edit', 'delete', 'assign', 'export'],
    milestones: ['view', 'create', 'edit', 'delete'],
    project_calendar: ['view'],
    project_reports: ['view', 'export'],
  },

  // Tender Management
  tender: {
    tender_packages: ['view', 'create', 'edit', 'delete', 'export'],
    bid_invitations: ['view', 'create', 'edit', 'delete'],
    vendor_management: ['view', 'create', 'edit', 'delete'],
    bid_submissions: ['view', 'create', 'edit', 'delete'],
    bid_comparison: ['view', 'export'],
    technical_evaluation: ['view', 'create', 'edit', 'delete'],
    commercial_evaluation: ['view', 'create', 'edit', 'delete'],
    award_management: ['view', 'create', 'edit', 'approve', 'delete'],
    contracts: ['view', 'create', 'edit', 'delete', 'export'],
    tender_reports: ['view', 'export'],
  },

  // Scheduling
  scheduling: {
    schedules: ['view', 'create', 'edit', 'delete', 'export'],
    gantt_charts: ['view', 'edit', 'export'],
    lookahead_planning: ['view', 'create', 'edit'],
    schedule_milestones: ['view', 'create', 'edit', 'delete'],
    dependencies: ['view', 'create', 'edit', 'delete'],
    critical_path: ['view', 'export'],
    resource_scheduling: ['view', 'create', 'edit'],
    baselines: ['view', 'create', 'delete'],
    progress_tracking: ['view', 'edit', 'export'],
    schedule_reports: ['view', 'export'],
  },

  // Resource Management
  resources: {
    resource_dashboard: ['view'],
    planning: ['view', 'create', 'edit', 'delete'],
    labour: ['view', 'create', 'edit', 'delete', 'export'],
    equipment: ['view', 'create', 'edit', 'delete', 'export'],
    vehicles: ['view', 'create', 'edit', 'delete', 'export'],
    tools: ['view', 'create', 'edit', 'delete', 'export'],
    crew_management: ['view', 'create', 'edit', 'delete'],
    requests: ['view', 'create', 'edit', 'approve', 'delete'],
    productivity: ['view', 'create', 'edit', 'export'],
    forecasting: ['view', 'export'],
  },

  // Maintenance
  maintenance: {
    service_requests: ['view', 'create', 'edit', 'delete', 'assign'],
    complaints: ['view', 'create', 'edit', 'delete', 'assign'],
    whatsapp_complaints: ['view', 'create', 'edit', 'delete'],
    work_orders: ['view', 'create', 'edit', 'delete', 'assign', 'close'],
    preventive_maintenance: ['view', 'create', 'edit', 'delete'],
    amc_contracts: ['view', 'create', 'edit', 'delete'],
    dispatch_center: ['view', 'create', 'edit', 'delete'],
    technicians: ['view', 'create', 'edit', 'delete'],
    service_reports: ['view', 'create', 'edit', 'delete', 'export'],
    maintenance_reports: ['view', 'export'],
    maintenance_sites: ['view', 'create', 'edit', 'delete'],
    sla_management: ['view', 'create', 'edit', 'delete'],
    maintenance_invoices: ['view', 'create', 'edit', 'delete', 'approve'],
    material_requests: ['view', 'create', 'edit', 'delete', 'approve'],
  },

  // Procurement
  procurement: {
    purchase_requests: ['view', 'create', 'edit', 'delete', 'approve'],
    purchase_orders: ['view', 'create', 'edit', 'delete', 'approve'],
    suppliers: ['view', 'create', 'edit', 'delete', 'export'],
  },

  // Inventory
  inventory: {
    inventory: ['view', 'create', 'edit', 'delete', 'export'],
  },

  // Finance
  finance: {
    invoice_management: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    customer_invoices: ['view', 'create', 'edit', 'delete', 'approve'],
    sales_invoices: ['view', 'create', 'edit', 'delete'],
    maintenance_invoices: ['view', 'create', 'edit', 'delete', 'approve'],
    approval_workflows: ['view', 'create', 'edit', 'delete'],
    invoice_payments: ['view', 'create', 'edit', 'delete', 'approve'],
    retention: ['view', 'create', 'edit', 'delete'],
    payments: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    boq: ['view', 'create', 'edit', 'delete', 'export'],
    daybook: ['view', 'create', 'edit', 'export'],
    cashflow: ['view', 'export'],
    cost_control: ['view', 'create', 'edit', 'export'],
    budgets: ['view', 'create', 'edit', 'delete', 'approve'],
    cost_codes: ['view', 'create', 'edit', 'delete'],
    change_orders: ['view', 'create', 'edit', 'delete', 'approve'],
    cost_forecasting: ['view', 'export'],
  },

  // HR & Payroll
  hr: {
    employees: ['view', 'create', 'edit', 'delete', 'export'],
    labour_groups: ['view', 'create', 'edit', 'delete'],
    attendance: ['view', 'create', 'edit', 'export'],
    payroll: ['view', 'create', 'edit', 'approve', 'export'],
    leave_management: ['view', 'create', 'edit', 'approve', 'delete'],
    loans: ['view', 'create', 'edit', 'delete', 'approve'],
  },

  // Assets
  assets: {
    assets: ['view', 'create', 'edit', 'delete', 'export'],
    work_orders: ['view', 'create', 'edit', 'delete', 'assign', 'close'],
    subcontractors: ['view', 'create', 'edit', 'delete'],
  },

  // Collaboration
  collaboration: {
    collaboration_hub: ['view'],
    rfi_management: ['view', 'create', 'edit', 'delete'],
    submittals: ['view', 'create', 'edit', 'delete', 'approve'],
    discussions: ['view', 'create', 'edit', 'delete'],
    approvals: ['view', 'approve', 'reject'],
    announcements: ['view', 'create', 'edit', 'delete'],
  },

  // Client Portal
  client_portal: {
    client_dashboard: ['view'],
    project_progress: ['view'],
    client_invoices: ['view'],
    client_documents: ['view', 'download'],
    client_complaints: ['view', 'create'],
    service_requests: ['view', 'create'],
  },

  // Sales
  sales: {
    product_catalog: ['view', 'create', 'edit', 'delete'],
    customers: ['view', 'create', 'edit', 'delete', 'export'],
  },

  // Reports
  reports: {
    reports: ['view', 'export'],
    ai_dashboard: ['view'],
    ai_insights: ['view'],
    ai_forecasting: ['view'],
    project_analytics: ['view', 'export'],
    advanced_reports: ['view', 'export'],
    audit_log: ['view', 'export'],
  },

  // Settings
  settings: {
    users: ['view', 'create', 'edit', 'delete', 'force_logout'],
    settings: ['view', 'edit'],
    login_activity: ['view'],
    roles_permissions: ['view', 'create', 'edit', 'delete'],
  },
}

// ─────────────────────────────────────────────────────────────────
// ROLE → PERMISSION MAPPING
// Format: { module_feature: { action: true/false }, ... }
// true = allowed, false = denied
// If a module:feature is not listed, the role has no access
// ─────────────────────────────────────────────────────────────────
type PermMap = Record<string, Record<string, boolean>>

// Helper: shorthand for "all actions in this feature are allowed"
function all(...actions: string[]): Record<string, boolean> {
  const m: Record<string, boolean> = {}
  for (const a of actions) m[a] = true
  return m
}

// Helper: shorthand for "all standard actions"
function std(): Record<string, boolean> {
  return all('view', 'create', 'edit', 'delete', 'export')
}

// Helper: shorthand for "read-only"
function ro(): Record<string, boolean> {
  return { view: true }
}

// Helper: shorthand for "view and export only"
function roExport(): Record<string, boolean> {
  return { view: true, export: true }
}

function buildPermissionMap(roleCode: string): PermMap {
  const pm: PermMap = {}

  // SUPER ADMIN: everything
  if (roleCode === 'super_admin') {
    for (const [mod, features] of Object.entries(MODULES)) {
      for (const [feat, actions] of Object.entries(features)) {
        pm[`${mod}_${feat}`] = all(...actions)
      }
    }
    return pm
  }

  // ADMIN: everything except roles_permissions management
  if (roleCode === 'admin') {
    for (const [mod, features] of Object.entries(MODULES)) {
      for (const [feat, actions] of Object.entries(features)) {
        pm[`${mod}_${feat}`] = all(...actions)
      }
    }
    // Admin can view roles but not manage them (only super_admin can)
    pm['settings_roles_permissions'] = { view: true }
    return pm
  }

  // PROJECT MANAGER
  if (roleCode === 'project_manager') {
    Object.assign(pm, {
      dashboard_overview: all('view'),
      projects_projects: std(),
      projects_project_teams: std(),
      projects_daily_reports: std(),
      projects_site_photos: all('view', 'upload', 'delete'),
      projects_documents: all('view', 'upload', 'delete'),
      projects_tasks: all('view', 'create', 'edit', 'delete', 'assign', 'export'),
      projects_milestones: std(),
      projects_project_calendar: ro(),
      projects_project_reports: roExport(),
      tender_tender_packages: std(),
      tender_bid_invitations: std(),
      tender_vendor_management: all('view', 'create', 'edit'),
      tender_bid_submissions: std(),
      tender_bid_comparison: roExport(),
      tender_technical_evaluation: std(),
      tender_commercial_evaluation: std(),
      tender_award_management: all('view', 'create', 'edit'),
      tender_contracts: std(),
      tender_tender_reports: roExport(),
      scheduling_schedules: std(),
      scheduling_gantt_charts: all('view', 'edit', 'export'),
      scheduling_lookahead_planning: std(),
      scheduling_schedule_milestones: std(),
      scheduling_dependencies: std(),
      scheduling_critical_path: roExport(),
      scheduling_resource_scheduling: std(),
      scheduling_baselines: std(),
      scheduling_progress_tracking: all('view', 'edit', 'export'),
      scheduling_schedule_reports: roExport(),
      resources_resource_dashboard: ro(),
      resources_planning: std(),
      resources_labour: std(),
      resources_equipment: std(),
      resources_vehicles: std(),
      resources_tools: std(),
      resources_crew_management: std(),
      resources_requests: all('view', 'create', 'edit', 'approve'),
      resources_productivity: all('view', 'create', 'edit', 'export'),
      resources_forecasting: roExport(),
      procurement_purchase_requests: std(),
      procurement_purchase_orders: std(),
      procurement_suppliers: all('view', 'create', 'edit', 'export'),
      inventory_inventory: std(),
      finance_invoice_management: std(),
      finance_payments: all('view', 'create', 'edit', 'export'),
      finance_boq: std(),
      finance_daybook: all('view', 'create', 'edit', 'export'),
      finance_cashflow: roExport(),
      finance_cost_control: std(),
      finance_budgets: std(),
      finance_cost_codes: std(),
      finance_change_orders: std(),
      finance_cost_forecasting: roExport(),
      hr_employees: roExport(),
      hr_labour_groups: ro(),
      hr_attendance: roExport(),
      hr_payroll: roExport(),
      hr_leave_management: ro(),
      hr_loans: ro(),
      assets_assets: std(),
      assets_work_orders: std(),
      assets_subcontractors: std(),
      collaboration_collaboration_hub: ro(),
      collaboration_rfi_management: std(),
      collaboration_submittals: std(),
      collaboration_discussions: std(),
      collaboration_approvals: all('view', 'approve'),
      collaboration_announcements: all('view', 'create', 'edit'),
      client_portal_client_dashboard: ro(),
      client_portal_project_progress: ro(),
      client_portal_client_invoices: ro(),
      client_portal_client_documents: ro(),
      client_portal_client_complaints: ro(),
      client_portal_service_requests: ro(),
      reports_reports: roExport(),
      reports_ai_dashboard: ro(),
      reports_ai_insights: ro(),
      reports_ai_forecasting: ro(),
      reports_project_analytics: roExport(),
      reports_advanced_reports: roExport(),
      reports_audit_log: roExport(),
    })
    return pm
  }

  // PLANNING ENGINEER
  if (roleCode === 'planning_engineer') {
    Object.assign(pm, {
      dashboard_overview: ro(),
      projects_projects: all('view', 'export'),
      projects_tasks: all('view', 'create', 'edit', 'export'),
      projects_milestones: std(),
      projects_project_calendar: ro(),
      projects_project_reports: roExport(),
      scheduling_schedules: std(),
      scheduling_gantt_charts: all('view', 'edit', 'export'),
      scheduling_lookahead_planning: std(),
      scheduling_schedule_milestones: std(),
      scheduling_dependencies: std(),
      scheduling_critical_path: roExport(),
      scheduling_resource_scheduling: std(),
      scheduling_baselines: std(),
      scheduling_progress_tracking: all('view', 'edit', 'export'),
      scheduling_schedule_reports: roExport(),
      resources_resource_dashboard: ro(),
      resources_labour: all('view', 'export'),
      resources_equipment: all('view', 'export'),
      resources_vehicles: all('view', 'export'),
      resources_tools: all('view', 'export'),
      reports_reports: roExport(),
      reports_project_analytics: roExport(),
    })
    return pm
  }

  // TENDER MANAGER
  if (roleCode === 'tender_manager') {
    Object.assign(pm, {
      dashboard_overview: ro(),
      projects_projects: all('view', 'export'),
      tender_tender_packages: std(),
      tender_bid_invitations: std(),
      tender_vendor_management: std(),
      tender_bid_submissions: std(),
      tender_bid_comparison: roExport(),
      tender_technical_evaluation: std(),
      tender_commercial_evaluation: std(),
      tender_award_management: std(),
      tender_contracts: std(),
      tender_tender_reports: roExport(),
      procurement_suppliers: all('view', 'export'),
      reports_reports: roExport(),
      reports_advanced_reports: roExport(),
    })
    return pm
  }

  // PROCUREMENT MANAGER
  if (roleCode === 'procurement_manager') {
    Object.assign(pm, {
      dashboard_overview: ro(),
      procurement_purchase_requests: std(),
      procurement_purchase_orders: std(),
      procurement_suppliers: std(),
      inventory_inventory: std(),
      resources_requests: all('view', 'create', 'edit', 'approve'),
      reports_reports: roExport(),
    })
    return pm
  }

  // STORE MANAGER
  if (roleCode === 'store_manager') {
    Object.assign(pm, {
      dashboard_overview: ro(),
      inventory_inventory: std(),
      procurement_purchase_requests: all('view', 'edit', 'approve'),
      procurement_purchase_orders: all('view', 'edit'),
      procurement_suppliers: roExport(),
      resources_equipment: std(),
      resources_vehicles: std(),
      resources_tools: std(),
      maintenance_material_requests: all('view', 'edit', 'approve'),
      reports_reports: roExport(),
    })
    return pm
  }

  // FINANCE MANAGER
  if (roleCode === 'finance_manager') {
    Object.assign(pm, {
      dashboard_overview: ro(),
      finance_invoice_management: std(),
      finance_customer_invoices: std(),
      finance_sales_invoices: std(),
      finance_maintenance_invoices: std(),
      finance_approval_workflows: std(),
      finance_invoice_payments: std(),
      finance_retention: std(),
      finance_payments: std(),
      finance_boq: std(),
      finance_daybook: std(),
      finance_cashflow: roExport(),
      finance_cost_control: std(),
      finance_budgets: std(),
      finance_cost_codes: std(),
      finance_change_orders: std(),
      finance_cost_forecasting: roExport(),
      hr_payroll: all('view', 'approve', 'export'),
      hr_loans: all('view', 'approve'),
      reports_reports: roExport(),
      reports_advanced_reports: roExport(),
      reports_audit_log: roExport(),
      client_portal_client_invoices: ro(),
    })
    return pm
  }

  // HR MANAGER
  if (roleCode === 'hr_manager') {
    Object.assign(pm, {
      dashboard_overview: ro(),
      hr_employees: std(),
      hr_labour_groups: std(),
      hr_attendance: std(),
      hr_payroll: std(),
      hr_leave_management: std(),
      hr_loans: std(),
      reports_reports: roExport(),
      reports_audit_log: roExport(),
    })
    return pm
  }

  // MAINTENANCE MANAGER
  if (roleCode === 'maintenance_manager') {
    Object.assign(pm, {
      dashboard_overview: ro(),
      maintenance_service_requests: std(),
      maintenance_complaints: std(),
      maintenance_whatsapp_complaints: std(),
      maintenance_work_orders: std(),
      maintenance_preventive_maintenance: std(),
      maintenance_amc_contracts: std(),
      maintenance_dispatch_center: std(),
      maintenance_technicians: std(),
      maintenance_service_reports: std(),
      maintenance_maintenance_reports: roExport(),
      maintenance_maintenance_sites: std(),
      maintenance_sla_management: std(),
      maintenance_maintenance_invoices: std(),
      maintenance_material_requests: std(),
      resources_labour: all('view', 'export'),
      reports_reports: roExport(),
      collaboration_announcements: all('view', 'create', 'edit'),
    })
    return pm
  }

  // SUPERVISOR
  if (roleCode === 'supervisor') {
    Object.assign(pm, {
      dashboard_overview: ro(),
      projects_projects: all('view', 'export'),
      projects_project_teams: ro(),
      projects_daily_reports: all('view', 'create', 'edit'),
      projects_site_photos: all('view', 'upload'),
      projects_documents: all('view', 'upload'),
      projects_tasks: all('view', 'create', 'edit'),
      projects_milestones: ro(),
      projects_project_calendar: ro(),
      scheduling_schedules: all('view', 'export'),
      scheduling_gantt_charts: roExport(),
      scheduling_progress_tracking: roExport(),
      resources_labour: all('view', 'export'),
      resources_crew_management: ro(),
      procurement_purchase_requests: all('view', 'create'),
      procurement_purchase_orders: all('view'),
      procurement_suppliers: roExport(),
      inventory_inventory: all('view', 'export'),
      hr_attendance: all('view', 'create', 'edit'),
      hr_labour_groups: ro(),
      hr_leave_management: all('view', 'create'),
      hr_loans: ro(),
      maintenance_service_requests: all('view', 'create'),
      maintenance_work_orders: all('view', 'create', 'edit', 'close'),
      maintenance_dispatch_center: ro(),
      maintenance_technicians: ro(),
      assets_work_orders: all('view', 'create', 'edit', 'close'),
      collaboration_collaboration_hub: ro(),
      collaboration_discussions: all('view', 'create'),
      collaboration_announcements: ro(),
      reports_reports: roExport(),
    })
    return pm
  }

  // TECHNICIAN
  if (roleCode === 'technician') {
    Object.assign(pm, {
      dashboard_overview: ro(),
      maintenance_service_requests: all('view'),
      maintenance_work_orders: all('view', 'edit', 'close'),
      maintenance_dispatch_center: ro(),
      maintenance_technicians: ro(),
      maintenance_service_reports: all('view', 'create', 'edit'),
      maintenance_material_requests: all('view', 'create'),
      hr_attendance: all('view', 'create'),
      hr_leave_management: all('view', 'create'),
      collaboration_announcements: ro(),
    })
    return pm
  }

  // EMPLOYEE
  if (roleCode === 'employee') {
    Object.assign(pm, {
      dashboard_overview: ro(),
      hr_attendance: all('view', 'create'),
      hr_leave_management: all('view', 'create'),
      hr_loans: ro(),
      hr_payroll: ro(),
      collaboration_announcements: ro(),
    })
    return pm
  }

  // CUSTOMER SERVICE
  if (roleCode === 'customer_service') {
    Object.assign(pm, {
      dashboard_overview: ro(),
      client_portal_client_dashboard: ro(),
      client_portal_project_progress: ro(),
      client_portal_client_invoices: ro(),
      client_portal_client_documents: all('view', 'download'),
      client_portal_client_complaints: all('view', 'create'),
      client_portal_service_requests: all('view', 'create'),
      maintenance_complaints: all('view', 'create', 'edit'),
      maintenance_service_requests: all('view', 'create'),
      reports_reports: roExport(),
    })
    return pm
  }

  // CLIENT
  if (roleCode === 'client') {
    Object.assign(pm, {
      dashboard_overview: ro(),
      client_portal_client_dashboard: ro(),
      client_portal_project_progress: ro(),
      client_portal_client_invoices: ro(),
      client_portal_client_documents: all('view', 'download'),
      client_portal_client_complaints: all('view', 'create'),
      client_portal_service_requests: all('view', 'create'),
    })
    return pm
  }

  // VENDOR
  if (roleCode === 'vendor') {
    Object.assign(pm, {
      dashboard_overview: ro(),
      tender_bid_invitations: all('view'),
      tender_bid_submissions: all('view', 'create', 'edit'),
      tender_tender_packages: all('view'),
    })
    return pm
  }

  // AUDITOR
  if (roleCode === 'auditor') {
    Object.assign(pm, {
      dashboard_overview: ro(),
      projects_projects: roExport(),
      projects_project_reports: roExport(),
      finance_invoice_management: roExport(),
      finance_customer_invoices: roExport(),
      finance_sales_invoices: roExport(),
      finance_payments: roExport(),
      finance_boq: roExport(),
      finance_daybook: roExport(),
      finance_cashflow: roExport(),
      finance_cost_control: roExport(),
      finance_budgets: roExport(),
      finance_cost_codes: roExport(),
      finance_change_orders: roExport(),
      finance_cost_forecasting: roExport(),
      hr_employees: roExport(),
      hr_payroll: roExport(),
      hr_attendance: roExport(),
      hr_leave_management: roExport(),
      hr_loans: roExport(),
      procurement_purchase_requests: roExport(),
      procurement_purchase_orders: roExport(),
      procurement_suppliers: roExport(),
      inventory_inventory: roExport(),
      reports_reports: roExport(),
      reports_advanced_reports: roExport(),
      reports_audit_log: all('view', 'export'),
      maintenance_service_requests: roExport(),
      maintenance_work_orders: roExport(),
      maintenance_maintenance_reports: roExport(),
      tender_tender_packages: roExport(),
      tender_contracts: roExport(),
      tender_tender_reports: roExport(),
    })
    return pm
  }

  return pm
}

// ─────────────────────────────────────────────────────────────────
// ROLE → MENU GROUP MAPPING (which menu groups each role can see)
// ─────────────────────────────────────────────────────────────────
const roleMenuGroups: Record<string, string[]> = {
  super_admin: [],  // empty = all groups (handled in logic)
  admin: [],        // empty = all groups
  project_manager: [
    'dashboard', 'project-management', 'tender-management', 'scheduling-gantt',
    'resource-management', 'procurement', 'inventory', 'finance',
    'hr-payroll', 'asset-management', 'collaboration', 'client-portal',
    'reports',
  ],
  planning_engineer: [
    'dashboard', 'project-management', 'scheduling-gantt', 'resource-management', 'reports',
  ],
  tender_manager: [
    'dashboard', 'project-management', 'tender-management', 'procurement', 'reports',
  ],
  procurement_manager: [
    'dashboard', 'procurement', 'inventory', 'resource-management', 'reports',
  ],
  store_manager: [
    'dashboard', 'inventory', 'procurement', 'resource-management', 'maintenance-management', 'reports',
  ],
  finance_manager: [
    'dashboard', 'finance', 'hr-payroll', 'client-portal', 'reports',
  ],
  hr_manager: [
    'dashboard', 'hr-payroll', 'reports',
  ],
  maintenance_manager: [
    'dashboard', 'maintenance-management', 'resource-management', 'reports', 'collaboration',
  ],
  supervisor: [
    'dashboard', 'project-management', 'scheduling-gantt', 'resource-management',
    'procurement', 'inventory', 'hr-payroll', 'maintenance-management',
    'asset-management', 'collaboration', 'reports',
  ],
  technician: [
    'dashboard', 'maintenance-management', 'hr-payroll', 'collaboration',
  ],
  employee: [
    'dashboard', 'hr-payroll', 'collaboration',
  ],
  customer_service: [
    'dashboard', 'client-portal', 'maintenance-management', 'reports',
  ],
  client: [
    'dashboard', 'client-portal',
  ],
  vendor: [
    'dashboard', 'tender-management',
  ],
  auditor: [
    'dashboard', 'project-management', 'finance', 'hr-payroll', 'procurement',
    'inventory', 'maintenance-management', 'tender-management', 'reports',
  ],
}

// ─────────────────────────────────────────────────────────────────
// SEED FUNCTION
// ─────────────────────────────────────────────────────────────────
async function seed() {
  console.log('🚀 Seeding RBAC system...\n')

  // 1. Clear existing RBAC data
  await db.rolePermission.deleteMany()
  await db.permission.deleteMany()
  await db.role.deleteMany()
  console.log('✅ Cleared existing RBAC data')

  // 2. Create Permissions (module → feature → action)
  let permCount = 0
  for (const [module, features] of Object.entries(MODULES)) {
    for (const [feature, actions] of Object.entries(features)) {
      for (const action of actions) {
        await db.permission.upsert({
          where: { module_feature_action: { module, feature, action } },
          create: { module, feature, action, description: `${module} > ${feature} > ${action}` },
          update: {},
        })
        permCount++
      }
    }
  }
  console.log(`✅ Created ${permCount} permissions across ${Object.keys(MODULES).length} modules`)

  // 3. Create Roles
  for (const roleDef of roles) {
    await db.role.upsert({
      where: { code: roleDef.code },
      create: {
        name: roleDef.name,
        code: roleDef.code,
        description: roleDef.description,
        level: roleDef.level,
        isSystem: roleDef.isSystem,
      },
      update: {},
    })
  }
  console.log(`✅ Created ${roles.length} roles`)

  // 4. Create Role-Permission mappings
  let rpCount = 0
  for (const roleDef of roles) {
    const role = await db.role.findUniqueOrThrow({ where: { code: roleDef.code } })
    const permMap = buildPermissionMap(roleDef.code)

    for (const [key, actions] of Object.entries(permMap)) {
      const [module, feature] = key.split('_', 2)

      for (const [action, isAllowed] of Object.entries(actions)) {
        if (!isAllowed) continue // skip denied actions (default is no access)

        const perm = await db.permission.findUnique({
          where: { module_feature_action: { module, feature, action } },
        })
        if (!perm) continue

        await db.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
          create: { roleId: role.id, permissionId: perm.id, isAllowed: true },
          update: {},
        })
        rpCount++
      }
    }
  }
  console.log(`✅ Created ${rpCount} role-permission mappings`)

  // 5. Update menu group permissions for all roles
  let menuPermCount = 0
  await db.roleMenuPermission.deleteMany()
  console.log('  Cleared existing menu permissions')

  const allGroups = await db.menuGroup.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } })

  for (const roleDef of roles) {
    const codes = roleMenuGroups[roleDef.code] || []
    const visibleGroups = codes.length === 0 ? allGroups : allGroups.filter(g => codes.includes(g.code))

    for (const g of visibleGroups) {
      await db.roleMenuPermission.upsert({
        where: { roleId_groupId: { roleId: roleDef.code, groupId: g.id } },
        create: { roleId: roleDef.code, groupId: g.id, canView: true },
        update: { canView: true },
      })
      menuPermCount++
    }
  }
  console.log(`✅ Created ${menuPermCount} role-menu permissions for ${roles.length} roles`)

  // 6. Summary
  const totalRoles = await db.role.count()
  const totalPerms = await db.permission.count()
  const totalRP = await db.rolePermission.count()
  const totalMenuPerms = await db.roleMenuPermission.count()

  console.log('\n📊 RBAC Seed Summary:')
  console.log(`   Roles:              ${totalRoles}`)
  console.log(`   Permissions:        ${totalPerms}`)
  console.log(`   Role-Permissions:   ${totalRP}`)
  console.log(`   Menu Permissions:   ${totalMenuPerms}`)
  console.log('\n✅ RBAC seeding complete!')
}

seed().catch(console.error).finally(() => db.$disconnect())
