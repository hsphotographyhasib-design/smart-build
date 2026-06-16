/**
 * Menu Seed Script — Populates MenuGroup, MenuItem, and RoleAccess tables
 * with the full SmartBuild ERP hierarchical menu structure.
 *
 * Usage: bun run prisma/seed-menus.ts
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

// ─────────────────────────────────────────────────────────────────────
// Menu Group Definitions (12 groups in order)
// ─────────────────────────────────────────────────────────────────────

interface GroupDef {
  code: string
  label: string
  icon: string
  items: { label: string; page: string; icon: string; children?: { label: string; page: string; icon: string }[] }[]
}

const MENU_GROUPS: GroupDef[] = [
  {
    code: 'main',
    label: 'Main',
    icon: 'LayoutDashboard',
    items: [
      { label: 'Dashboard', page: 'dashboard', icon: 'LayoutDashboard' },
    ],
  },
  {
    code: 'project-management',
    label: 'Project Management',
    icon: 'FolderKanban',
    items: [
      { label: 'Projects', page: 'projects', icon: 'FolderKanban' },
      { label: 'Scheduling', page: 'scheduling', icon: 'CalendarRange' },
      { label: 'Tasks', page: 'project-tasks', icon: 'ClipboardCheck' },
      { label: 'Milestones', page: '__cat__milestones', icon: 'Flag', children: [
        { label: 'Project Milestones', page: 'project-tasks', icon: 'Flag' },
      ]},
      { label: 'Daily Reports', page: '__cat__daily-reports', icon: 'FileText', children: [
        { label: 'Daily Notes', page: 'project-daily-notes', icon: 'FileText' },
      ]},
      { label: 'Documents', page: 'project-documents', icon: 'FileText' },
      { label: 'Site Photos', page: '__cat__photos', icon: 'Camera', children: [
        { label: 'Project Documents', page: 'project-documents', icon: 'FileText' },
      ]},
      { label: 'Project Teams', page: '__cat__teams', icon: 'UsersRound', children: [
        { label: 'Employees', page: 'employees', icon: 'Users' },
      ]},
      { label: 'Project Calendar', page: '__cat__calendar', icon: 'CalendarRange', children: [
        { label: 'Scheduling', page: 'scheduling', icon: 'CalendarRange' },
      ]},
    ],
  },
  {
    code: 'resource-management',
    label: 'Resource Management',
    icon: 'Activity',
    items: [
      { label: 'Resource Dashboard', page: 'resource-dashboard', icon: 'Activity' },
      { label: 'Resource Planning', page: 'resource-planning', icon: 'Gauge' },
      { label: 'Labour', page: 'labour-resources', icon: 'HardHat' },
      { label: 'Attendance', page: 'attendance', icon: 'Clock' },
      { label: 'Allocation', page: 'crew-management', icon: 'UsersRound' },
      { label: 'Forecasting', page: 'resource-forecasting', icon: 'LineChart' },
      { label: 'Productivity', page: 'resource-productivity', icon: 'TrendingUp' },
      { label: 'Equipment', page: 'equipment-resources', icon: 'Hammer' },
      { label: 'Vehicles', page: 'vehicle-resources', icon: 'Car' },
      { label: 'Tools', page: 'tool-resources', icon: 'Ruler' },
      { label: 'Resource Requests', page: 'resource-requests', icon: 'ClipboardCheck' },
    ],
  },
  {
    code: 'maintenance',
    label: 'Maintenance Management',
    icon: 'Wrench',
    items: [
      { label: 'Complaints', page: '__cat__complaints', icon: 'AlertTriangle', children: [
        { label: 'Client Complaints', page: 'client-complaints', icon: 'AlertTriangle' },
      ]},
      { label: 'Work Orders', page: 'work-orders', icon: 'ClipboardList' },
      { label: 'Preventive Maintenance', page: '__cat__pm', icon: 'ShieldCheck', children: [
        { label: 'Assets', page: 'assets', icon: 'Wrench' },
      ]},
      { label: 'Service Requests', page: '__cat__service-requests', icon: 'Headphones', children: [
        { label: 'Sub Contractors', page: 'subcontractors', icon: 'Truck' },
      ]},
      { label: 'AMC Contracts', page: '__cat__amc', icon: 'FileCheck', children: [
        { label: 'Sub Contractors', page: 'subcontractors', icon: 'Truck' },
      ]},
      { label: 'Dispatch Center', page: '__cat__dispatch', icon: 'Truck', children: [
        { label: 'Sub Contractors', page: 'subcontractors', icon: 'Truck' },
      ]},
      { label: 'Technicians', page: '__cat__technicians', icon: 'UserCog', children: [
        { label: 'Employees', page: 'employees', icon: 'Users' },
      ]},
    ],
  },
  {
    code: 'procurement',
    label: 'Procurement',
    icon: 'ShoppingCart',
    items: [
      { label: 'Purchase Requests', page: 'purchase-requests', icon: 'ShoppingCart' },
      { label: 'Purchase Orders', page: 'purchase-orders', icon: 'ClipboardList' },
      { label: 'Suppliers', page: 'suppliers', icon: 'Users' },
      { label: 'Approvals', page: '__cat__procurement-approvals', icon: 'FileCheck', children: [
        { label: 'Purchase Orders', page: 'purchase-orders', icon: 'ClipboardList' },
      ]},
    ],
  },
  {
    code: 'inventory',
    label: 'Inventory',
    icon: 'Package',
    items: [
      { label: 'Stock Items', page: 'inventory', icon: 'Package' },
      { label: 'Warehouses', page: '__cat__warehouses', icon: 'Warehouse', children: [
        { label: 'Inventory', page: 'inventory', icon: 'Package' },
      ]},
      { label: 'Material Allocation', page: '__cat__material-allocation', icon: 'GitBranch', children: [
        { label: 'Resource Requests', page: 'resource-requests', icon: 'ClipboardCheck' },
      ]},
    ],
  },
  {
    code: 'finance',
    label: 'Finance',
    icon: 'DollarSign',
    items: [
      { label: 'Invoices', page: 'invoices', icon: 'FileText' },
      { label: 'Payments', page: 'payments', icon: 'Receipt' },
      { label: 'BOQ', page: 'boq', icon: 'Calculator' },
      { label: 'Day Book', page: 'daybook', icon: 'FileSpreadsheet' },
      { label: 'Cashflow', page: 'cashflow', icon: 'DollarSign' },
      { label: 'Budget Management', page: 'budget-management', icon: 'Wallet' },
      { label: 'Cost Control', page: 'cost-control-dashboard', icon: 'Target' },
      { label: 'Forecasting', page: 'cost-forecasting', icon: 'LineChart' },
    ],
  },
  {
    code: 'cost-control',
    label: 'Cost Control',
    icon: 'Wallet',
    items: [
      { label: 'Cost Dashboard', page: 'cost-control-dashboard', icon: 'Wallet' },
      { label: 'Budgets', page: 'budget-management', icon: 'FileSpreadsheet' },
      { label: 'Cost Codes', page: 'cost-codes', icon: 'Tags' },
      { label: 'Change Orders', page: 'budget-change-orders', icon: 'GitBranch' },
      { label: 'Cost Forecasting', page: 'cost-forecasting', icon: 'Target' },
    ],
  },
  {
    code: 'hr-payroll',
    label: 'HR & Payroll',
    icon: 'Users',
    items: [
      { label: 'Employees', page: 'employees', icon: 'Users' },
      { label: 'Leave Management', page: 'leave', icon: 'ScrollText' },
      { label: 'Payroll', page: 'payroll', icon: 'DollarSign' },
      { label: 'Labour Groups', page: 'labour-groups', icon: 'UserCheck' },
    ],
  },
  {
    code: 'collaboration',
    label: 'Collaboration',
    icon: 'MessageSquare',
    items: [
      { label: 'Collab Hub', page: 'collaboration-dashboard', icon: 'MessageSquare' },
      { label: 'RFI Management', page: 'collaboration-rfis', icon: 'ClipboardList' },
      { label: 'Submittals', page: 'collaboration-submittals', icon: 'FileText' },
      { label: 'Discussions', page: 'collaboration-discussions', icon: 'MessageSquare' },
      { label: 'Approvals', page: 'collaboration-approvals', icon: 'ClipboardCheck' },
      { label: 'Announcements', page: 'collaboration-announcements', icon: 'Megaphone' },
    ],
  },
  {
    code: 'client-portal',
    label: 'Client Portal',
    icon: 'Users',
    items: [
      { label: 'Portal Dashboard', page: 'client-dashboard', icon: 'Users' },
      { label: 'Progress', page: 'client-progress', icon: 'TrendingUp' },
      { label: 'Invoices', page: 'client-invoices', icon: 'Receipt' },
      { label: 'Documents', page: 'client-documents', icon: 'FileText' },
      { label: 'Complaints', page: 'client-complaints', icon: 'MessageSquare' },
    ],
  },
  {
    code: 'ai-analytics',
    label: 'AI & Analytics',
    icon: 'Brain',
    items: [
      { label: 'AI Dashboard', page: 'ai-dashboard', icon: 'Brain' },
      { label: 'AI Insights', page: 'ai-insights', icon: 'Sparkles' },
      { label: 'AI Forecasting', page: 'ai-forecast', icon: 'LineChart' },
      { label: 'Project Analytics', page: 'project-analytics', icon: 'Eye' },
      { label: 'Advanced Reports', page: 'advanced-reports', icon: 'FileBarChart' },
    ],
  },
  {
    code: 'sales',
    label: 'Sales',
    icon: 'Store',
    items: [
      { label: 'Product Catalog', page: 'product-catalog', icon: 'Store' },
      { label: 'Customers', page: 'customers', icon: 'Users' },
      { label: 'Sales Invoices', page: 'sales-invoices', icon: 'FileText' },
    ],
  },
  {
    code: 'asset-management',
    label: 'Asset Management',
    icon: 'Wrench',
    items: [
      { label: 'Equipment', page: 'equipment-resources', icon: 'Hammer' },
      { label: 'Vehicles', page: 'vehicle-resources', icon: 'Car' },
      { label: 'Tools', page: 'tool-resources', icon: 'Ruler' },
      { label: 'Assets', page: 'assets', icon: 'Wrench' },
    ],
  },
  {
    code: 'reports',
    label: 'Reports',
    icon: 'BarChart3',
    items: [
      { label: 'Project Reports', page: '__cat__project-reports', icon: 'FolderKanban', children: [
        { label: 'Projects', page: 'projects', icon: 'FolderKanban' },
      ]},
      { label: 'Financial Reports', page: '__cat__financial-reports', icon: 'DollarSign', children: [
        { label: 'Cashflow', page: 'cashflow', icon: 'DollarSign' },
      ]},
      { label: 'Labour Reports', page: '__cat__labour-reports', icon: 'HardHat', children: [
        { label: 'Attendance', page: 'attendance', icon: 'Clock' },
      ]},
      { label: 'Inventory Reports', page: '__cat__inventory-reports', icon: 'Package', children: [
        { label: 'Inventory', page: 'inventory', icon: 'Package' },
      ]},
      { label: 'Audit Log', page: 'audit-log', icon: 'ShieldCheck' },
      { label: 'Executive Dashboard', page: '__cat__executive', icon: 'Gauge', children: [
        { label: 'AI Dashboard', page: 'ai-dashboard', icon: 'Brain' },
      ]},
    ],
  },
  {
    code: 'settings',
    label: 'Settings',
    icon: 'Settings',
    items: [
      { label: 'Users', page: 'users', icon: 'UserCog' },
      { label: 'Notifications', page: 'notifications', icon: 'Bell' },
      { label: 'System Settings', page: 'settings', icon: 'Settings' },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────
// Role Access Matrix — which roles can see which groups
// ─────────────────────────────────────────────────────────────────────

const ROLE_ACCESS: Record<string, string[]> = {
  // Admin sees everything
  admin: '*',
  super_admin: '*',

  // Supervisor: project-focused + collaboration
  supervisor: [
    'main', 'project-management', 'resource-management', 'maintenance',
    'procurement', 'inventory', 'finance', 'hr-payroll', 'collaboration',
    'ai-analytics', 'asset-management', 'reports', 'settings',
  ],

  // Project Manager: project + resource + finance
  project_manager: [
    'main', 'project-management', 'resource-management', 'procurement',
    'finance', 'cost-control', 'collaboration', 'ai-analytics',
    'asset-management', 'reports', 'settings',
  ],

  // Site Engineer: project + resources
  site_engineer: [
    'main', 'project-management', 'resource-management', 'maintenance',
    'asset-management',
  ],

  // QS: project + procurement + cost
  qs: [
    'main', 'project-management', 'procurement', 'finance', 'cost-control', 'reports',
  ],

  // Accountant: finance-focused
  accountant: [
    'main', 'procurement', 'inventory', 'finance', 'cost-control',
    'hr-payroll', 'sales', 'reports', 'settings',
  ],

  // HR Manager: HR-focused
  hr_manager: [
    'main', 'project-management', 'hr-payroll', 'ai-analytics', 'reports', 'settings',
  ],

  // Store Manager: procurement + inventory
  store_manager: [
    'main', 'procurement', 'inventory', 'asset-management', 'reports', 'settings',
  ],

  // Client: client portal only
  client: [
    'main', 'client-portal',
  ],

  // Labour: minimal
  labour: [
    'main',
  ],

  // Technician: maintenance-focused
  technician: [
    'main', 'maintenance', 'asset-management',
  ],

  // Vendor/Dispatcher
  vendor: [
    'main', 'procurement',
  ],

  // Auditor: reports + finance
  auditor: [
    'main', 'finance', 'cost-control', 'reports', 'ai-analytics',
  ],
}

// ─────────────────────────────────────────────────────────────────────
// Seed Function
// ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🔄 Seeding menu system...')

  // Clean existing data
  await db.roleAccess.deleteMany()
  await db.menuItem.deleteMany()
  await db.menuGroup.deleteMany()
  console.log('  ✅ Cleared existing menu data')

  // Create groups and items
  const groupMap = new Map<string, string>() // code → id

  for (let gIdx = 0; gIdx < MENU_GROUPS.length; gIdx++) {
    const g = MENU_GROUPS[gIdx]

    const group = await db.menuGroup.create({
      data: {
        code: g.code,
        label: g.label,
        icon: g.icon,
        sortOrder: gIdx,
      },
    })
    groupMap.set(g.code, group.id)

    // Create items with children
    for (let iIdx = 0; iIdx < g.items.length; iIdx++) {
      const item = g.items[iIdx]

      const menuItem = await db.menuItem.create({
        data: {
          groupId: group.id,
          label: item.label,
          page: item.page,
          icon: item.icon,
          sortOrder: iIdx,
        },
      })

      // Create children for category items
      if (item.children && item.children.length > 0) {
        for (let cIdx = 0; cIdx < item.children.length; cIdx++) {
          const child = item.children[cIdx]
          await db.menuItem.create({
            data: {
              groupId: group.id,
              parentId: menuItem.id,
              label: child.label,
              page: child.page,
              icon: child.icon,
              sortOrder: cIdx,
            },
          })
        }
      }
    }
  }

  console.log(`  ✅ Created ${MENU_GROUPS.length} menu groups`)

  // Create role access entries
  let accessCount = 0
  const allRoles = Object.keys(ROLE_ACCESS)

  for (const role of allRoles) {
    const allowedGroups = ROLE_ACCESS[role]
    const groupCodes = allowedGroups === '*' ? Object.keys(ROLE_ACCESS) : allowedGroups

    for (const code of groupCodes) {
      const groupId = groupMap.get(code)
      if (!groupId) continue

      await db.roleAccess.create({
        data: { groupId, roleId: role, canView: true },
      })
      accessCount++
    }
  }

  console.log(`  ✅ Created ${accessCount} role access entries`)
  console.log('🎉 Menu seed complete!')
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
