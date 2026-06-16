/**
 * SmartBuild ERP - ভূমিকা-ভিত্তিক অ্যাক্সেস নিয়ন্ত্রণ (RBAC) কনফিগারেশন
 *
 * সাইডবার মেনুতে প্রতিটি ভূমিকা কোন পৃষ্ঠাগুলোতে অ্যাক্সেস করতে পারে
 * এবং কোন ভূমিকাগুলো কোন API কার্যকলাপ সম্পাদন করতে পারে তা নির্ধারণ করে।
 *
 * ভূমিকা স্তরবিন্যাস: super_admin > admin > {supervisor, hr_manager, accountant, store_manager, auditor} > client, labour, vendor
 */

// ============ ভূমিকা সংজ্ঞায়িত করা হচ্ছে ============
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  HR_MANAGER: 'hr_manager',
  ACCOUNTANT: 'accountant',
  STORE_MANAGER: 'store_manager',
  CLIENT: 'client',
  LABOUR: 'labour',
  VENDOR: 'vendor',
  AUDITOR: 'auditor',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

// ============ ভূমিকা লেবেল ============
export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  supervisor: 'Supervisor',
  hr_manager: 'HR Manager',
  accountant: 'Accountant',
  store_manager: 'Store Manager',
  client: 'Client',
  labour: 'Labour',
  vendor: 'Vendor',
  auditor: 'Auditor',
}

// ============ ভূমিকা স্তরবিন্যাস (উচ্চতর সংখ্যা = বেশি অনুমতি) ============
const ROLE_LEVEL: Record<string, number> = {
  super_admin: 100,
  admin: 90,
  supervisor: 70,
  auditor: 65,
  hr_manager: 60,
  accountant: 60,
  store_manager: 60,
  client: 30,
  vendor: 30,
  labour: 20,
}

/**
 * ব্যবহারকারীর ভূমিকার ন্যূনতম প্রয়োজনীয় স্তর আছে কিনা পরীক্ষা করা হচ্ছে।
 */
export function hasMinRoleLevel(userRole: string, minRole: string): boolean {
  const userLevel = ROLE_LEVEL[userRole] ?? 0
  const minLevel = ROLE_LEVEL[minRole] ?? 0
  return userLevel >= minLevel
}

// ============ MENU PAGE ACCESS BY ROLE ============
// Each role maps to a set of pages they can see in the sidebar.
// Use '*' to grant access to all pages.

const PAGE_ACCESS: Record<string, string[] | '*'> = {
  [ROLES.SUPER_ADMIN]: '*',
  [ROLES.ADMIN]: '*',

  [ROLES.SUPERVISOR]: [
    // Main
    'dashboard',
    // Project Management
    'projects', 'project-detail', 'project-tasks', 'project-finance',
    'project-documents', 'project-daily-notes', 'scheduling',
    // Operations
    'subcontractors', 'work-orders', 'assets',
    // Collaboration
    'collaboration-dashboard', 'collaboration-rfis', 'collaboration-submittals',
    'collaboration-discussions', 'collaboration-approvals', 'collaboration-announcements',
    // Client Portal
    'client-dashboard', 'client-progress', 'client-invoices', 'client-documents', 'client-complaints',
    // AI & Analytics
    'ai-dashboard', 'ai-insights', 'ai-forecast', 'project-analytics', 'advanced-reports',
    // Resource (read-only)
    'resource-dashboard', 'resource-planning', 'labour-resources', 'equipment-resources',
    'vehicle-resources', 'tool-resources', 'crew-management', 'resource-requests',
    'resource-productivity', 'resource-forecasting',
    // Cost Control
    'cost-control-dashboard', 'budget-management', 'cost-codes', 'budget-change-orders', 'cost-forecasting',
    // Reports
    'reports',
    // Notifications
    'notifications', 'audit-log',
    // Settings
    'settings',
  ],

  [ROLES.HR_MANAGER]: [
    // Main
    'dashboard',
    // Labour & HR
    'labour-groups', 'attendance', 'payroll', 'employees', 'leave',
    // Project (read-only)
    'projects', 'project-detail', 'scheduling',
    // Operations
    'subcontractors', 'work-orders',
    // Notifications
    'notifications', 'audit-log',
    // Settings
    'settings',
    // Reports
    'reports',
  ],

  [ROLES.ACCOUNTANT]: [
    // Main
    'dashboard',
    // Finance
    'invoices', 'payments', 'boq', 'daybook', 'cashflow',
    // Procurement
    'purchase-requests', 'purchase-orders', 'suppliers',
    // Cost Control
    'cost-control-dashboard', 'budget-management', 'cost-codes', 'budget-change-orders', 'cost-forecasting',
    // Project (finance view)
    'projects', 'project-detail', 'project-finance',
    // Reports
    'reports', 'advanced-reports',
    // Notifications
    'notifications', 'audit-log',
    // Settings
    'settings',
  ],

  [ROLES.STORE_MANAGER]: [
    // Main
    'dashboard',
    // Procurement
    'purchase-requests', 'purchase-orders', 'suppliers', 'inventory',
    // Operations
    'assets',
    // Resources
    'resource-dashboard', 'resource-planning', 'labour-resources', 'equipment-resources',
    'vehicle-resources', 'tool-resources', 'crew-management', 'resource-requests',
    'resource-productivity', 'resource-forecasting',
    // Notifications
    'notifications', 'audit-log',
    // Settings
    'settings',
    // Reports
    'reports',
  ],

  [ROLES.AUDITOR]: [
    // Main
    'dashboard',
    // Audit & Reports
    'audit-log', 'reports', 'advanced-reports',
    // Finance (read-only)
    'invoices', 'payments', 'boq', 'daybook', 'cashflow',
    // Project (read-only)
    'projects', 'project-detail', 'project-finance',
    // Cost Control (read-only)
    'cost-control-dashboard', 'budget-management', 'cost-codes', 'budget-change-orders', 'cost-forecasting',
    // AI
    'ai-dashboard', 'ai-insights', 'project-analytics',
    // Settings
    'settings',
    // Notifications
    'notifications',
  ],

  [ROLES.CLIENT]: [
    // Client Portal
    'dashboard',
    'client-dashboard', 'client-progress', 'client-invoices', 'client-documents', 'client-complaints',
    // Notifications
    'notifications',
    // Settings
    'settings',
  ],

  [ROLES.LABOUR]: [
    // Minimal
    'dashboard',
    'attendance',
    'notifications',
    'settings',
  ],

  [ROLES.VENDOR]: [
    // Vendor Portal
    'dashboard',
    'purchase-orders',
    'suppliers',
    'notifications',
    'settings',
  ],
}

/**
 * Check if a specific role can access a specific page.
 */
export function canAccessPage(role: string, page: string): boolean {
  const access = PAGE_ACCESS[role]
  if (!access) return false
  if (access === '*') return true
  return access.includes(page)
}

/**
 * Get filtered nav items for a given role.
 * Returns only the sections and items the role is allowed to see.
 */
export function filterNavForRole<T extends { page: string }>(
  sections: { title: string; items: T[] }[],
  role: string
): { title: string; items: T[] }[] {
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => canAccessPage(role, item.page)),
    }))
    .filter((section) => section.items.length > 0)
}

// ============ API ROUTE PERMISSIONS ============
// Maps API route patterns to allowed roles for each HTTP method.
// Pattern format: "/api/module" or "/api/module/action"
// "*" means all authenticated users, "admin+" means admin and super_admin only.

export interface RoutePermission {
  pattern: string
  methods: {
    GET?: string[]    // Roles that can read
    POST?: string[]   // Roles that can create
    PUT?: string[]    // Roles that can update
    DELETE?: string[]  // Roles that can delete
  }
  description?: string
}

export const ROUTE_PERMISSIONS: RoutePermission[] = [
  // ============ AUTH ============
  { pattern: '/api/auth/login', methods: { POST: ['*'] }, description: 'Login (public)' },
  { pattern: '/api/auth/register', methods: { POST: ['super_admin', 'admin'] }, description: 'Register user' },
  { pattern: '/api/auth/me', methods: { GET: ['*'] }, description: 'Current user profile' },
  { pattern: '/api/auth/logout', methods: { POST: ['*'] }, description: 'Logout' },
  { pattern: '/api/menus', methods: { GET: ['*'] }, description: 'Menu navigation' },
  { pattern: '/api/auth/users', methods: {
    GET: ['super_admin', 'admin', 'hr_manager'],
    POST: ['super_admin', 'admin'],
    PUT: ['super_admin', 'admin'],
    DELETE: ['super_admin', 'admin'],
  }, description: 'User management' },

  // ============ DASHBOARD ============
  { pattern: '/api/dashboard/stats', methods: { GET: ['super_admin', 'admin', 'supervisor', 'accountant', 'hr_manager', 'store_manager', 'auditor'] }, description: 'Dashboard stats' },
  { pattern: '/api/dashboard/notifications', methods: { GET: ['*'] } },
  { pattern: '/api/dashboard/notifications/mark-all-read', methods: { POST: ['*'] } },

  // ============ SEARCH ============
  { pattern: '/api/search', methods: { GET: ['*'] }, description: 'Global search' },
  { pattern: '/api/search/history', methods: { GET: ['*'], DELETE: ['*'] }, description: 'Search history' },
  { pattern: '/api/search/history/', methods: { POST: ['*'] }, description: 'Add search history' },

  // ============ PROJECTS ============
  { pattern: '/api/projects', methods: {
    GET: ['super_admin', 'admin', 'supervisor', 'hr_manager', 'accountant', 'store_manager', 'auditor', 'client'],
    POST: ['super_admin', 'admin', 'supervisor'],
  }, description: 'Project CRUD' },
  { pattern: '/api/projects/[id]', methods: {
    GET: ['*'],
    PUT: ['super_admin', 'admin', 'supervisor'],
    DELETE: ['super_admin', 'admin'],
  }},
  { pattern: '/api/projects/[id]/tasks', methods: {
    GET: ['*'],
    POST: ['super_admin', 'admin', 'supervisor', 'hr_manager'],
  }},
  { pattern: '/api/projects/[id]/tasks/[taskId]', methods: {
    PUT: ['super_admin', 'admin', 'supervisor', 'hr_manager'],
    DELETE: ['super_admin', 'admin', 'supervisor'],
  }},
  { pattern: '/api/projects/[id]/team', methods: {
    GET: ['*'],
    POST: ['super_admin', 'admin', 'supervisor'],
  }},
  { pattern: '/api/projects/[id]/team/[memberId]', methods: {
    PUT: ['super_admin', 'admin', 'supervisor'],
    DELETE: ['super_admin', 'admin'],
  }},
  { pattern: '/api/projects/[id]/documents', methods: {
    GET: ['*'],
    POST: ['super_admin', 'admin', 'supervisor'],
    DELETE: ['super_admin', 'admin', 'supervisor'],
  }},
  { pattern: '/api/projects/[id]/daily-notes', methods: {
    GET: ['*'],
    POST: ['super_admin', 'admin', 'supervisor'],
  }},
  { pattern: '/api/projects/[id]/finance', methods: {
    GET: ['super_admin', 'admin', 'supervisor', 'accountant', 'auditor'],
  }},
  { pattern: '/api/projects/[id]/comments', methods: {
    GET: ['*'],
    POST: ['*'],
  }},
  { pattern: '/api/projects/[id]/open-items', methods: {
    GET: ['*'],
    POST: ['super_admin', 'admin', 'supervisor'],
  }},
  { pattern: '/api/projects/[id]/open-items/[itemId]', methods: {
    PUT: ['super_admin', 'admin', 'supervisor'],
    DELETE: ['super_admin', 'admin', 'supervisor'],
  }},
  { pattern: '/api/projects/[id]/prime-contract', methods: {
    GET: ['super_admin', 'admin', 'supervisor', 'accountant'],
    PUT: ['super_admin', 'admin'],
  }},
  { pattern: '/api/projects/[id]/commitments', methods: {
    GET: ['super_admin', 'admin', 'supervisor', 'accountant', 'auditor'],
  }},
  { pattern: '/api/projects/[id]/commitments/[commitmentId]', methods: {
    PUT: ['super_admin', 'admin', 'accountant'],
    DELETE: ['super_admin', 'admin'],
  }},
  { pattern: '/api/projects/[id]/direct-costs', methods: {
    GET: ['super_admin', 'admin', 'supervisor', 'accountant', 'auditor'],
    POST: ['super_admin', 'admin', 'accountant'],
  }},
  { pattern: '/api/projects/[id]/direct-costs/[costId]', methods: {
    PUT: ['super_admin', 'admin', 'accountant'],
    DELETE: ['super_admin', 'admin', 'accountant'],
  }},
  { pattern: '/api/projects/[id]/insights', methods: {
    GET: ['super_admin', 'admin', 'supervisor', 'auditor'],
  }},
  { pattern: '/api/projects/[id]/rfis', methods: {
    GET: ['*'],
    POST: ['super_admin', 'admin', 'supervisor'],
  }},
  { pattern: '/api/projects/[id]/rfis/[rfiId]', methods: {
    GET: ['*'],
    PUT: ['super_admin', 'admin', 'supervisor'],
    DELETE: ['super_admin', 'admin'],
  }},
  { pattern: '/api/projects/[id]/rfis/[rfiId]/comments', methods: {
    GET: ['*'],
    POST: ['*'],
  }},
  { pattern: '/api/projects/[id]/change-orders', methods: {
    GET: ['super_admin', 'admin', 'supervisor', 'accountant', 'auditor'],
    POST: ['super_admin', 'admin', 'supervisor'],
  }},
  { pattern: '/api/projects/[id]/change-orders/[coId]', methods: {
    GET: ['super_admin', 'admin', 'supervisor', 'accountant', 'auditor'],
    PUT: ['super_admin', 'admin', 'supervisor'],
    DELETE: ['super_admin', 'admin'],
  }},
  { pattern: '/api/projects/[id]/change-orders/[coId]/approve', methods: {
    POST: ['super_admin', 'admin'],
  }},
  { pattern: '/api/projects/[id]/change-events', methods: {
    GET: ['super_admin', 'admin', 'supervisor', 'auditor'],
    POST: ['super_admin', 'admin', 'supervisor'],
  }},
  { pattern: '/api/projects/[id]/change-events/[eventId]', methods: {
    GET: ['*'],
    PUT: ['super_admin', 'admin', 'supervisor'],
    DELETE: ['super_admin', 'admin'],
  }},
  { pattern: '/api/projects/[id]/change-events/[eventId]/approve', methods: {
    POST: ['super_admin', 'admin'],
  }},
  { pattern: '/api/projects/[id]/change-events/[eventId]/reject', methods: {
    POST: ['super_admin', 'admin'],
  }},

  // ============ FINANCE ============
  { pattern: '/api/invoices', methods: {
    GET: ['super_admin', 'admin', 'supervisor', 'accountant', 'auditor'],
    POST: ['super_admin', 'admin', 'accountant'],
  }, description: 'Project invoices' },
  { pattern: '/api/invoices/[id]', methods: {
    GET: ['super_admin', 'admin', 'supervisor', 'accountant', 'auditor', 'client'],
    PUT: ['super_admin', 'admin', 'accountant'],
    DELETE: ['super_admin', 'admin', 'accountant'],
  }},
  { pattern: '/api/payments', methods: {
    GET: ['super_admin', 'admin', 'supervisor', 'accountant', 'auditor'],
    POST: ['super_admin', 'admin', 'accountant'],
  }},
  { pattern: '/api/payments/[id]', methods: {
    GET: ['*'],
    PUT: ['super_admin', 'admin', 'accountant'],
    DELETE: ['super_admin', 'admin', 'accountant'],
  }},
  { pattern: '/api/boq', methods: {
    GET: ['super_admin', 'admin', 'supervisor', 'accountant', 'store_manager', 'auditor'],
    POST: ['super_admin', 'admin', 'supervisor', 'store_manager'],
  }},
  { pattern: '/api/daybook', methods: {
    GET: ['super_admin', 'admin', 'accountant', 'auditor'],
    POST: ['super_admin', 'admin', 'accountant'],
  }},
  { pattern: '/api/daybook/[id]', methods: {
    PUT: ['super_admin', 'admin', 'accountant'],
    DELETE: ['super_admin', 'admin', 'accountant'],
  }},
  { pattern: '/api/cashflow', methods: {
    GET: ['super_admin', 'admin', 'accountant', 'auditor'],
  }},
  { pattern: '/api/loans', methods: {
    GET: ['super_admin', 'admin', 'hr_manager', 'accountant'],
    POST: ['super_admin', 'admin', 'hr_manager'],
  }},
  { pattern: '/api/reports', methods: {
    GET: ['super_admin', 'admin', 'supervisor', 'accountant', 'hr_manager', 'auditor'],
  }},

  // ============ PROCUREMENT ============
  { pattern: '/api/purchase-requests', methods: {
    GET: ['super_admin', 'admin', 'supervisor', 'store_manager', 'accountant', 'auditor'],
    POST: ['super_admin', 'admin', 'supervisor', 'store_manager'],
  }},
  { pattern: '/api/purchase-requests/[id]', methods: {
    GET: ['*'],
    PUT: ['super_admin', 'admin', 'supervisor', 'store_manager'],
    DELETE: ['super_admin', 'admin'],
  }},
  { pattern: '/api/purchase-requests/[id]/approve', methods: {
    POST: ['super_admin', 'admin'],
  }},
  { pattern: '/api/purchase-requests/[id]/reject', methods: {
    POST: ['super_admin', 'admin'],
  }},
  { pattern: '/api/purchase-orders', methods: {
    GET: ['super_admin', 'admin', 'supervisor', 'store_manager', 'accountant', 'auditor', 'vendor'],
    POST: ['super_admin', 'admin', 'store_manager'],
  }},
  { pattern: '/api/purchase-orders/[id]', methods: {
    GET: ['*'],
    PUT: ['super_admin', 'admin', 'store_manager'],
    DELETE: ['super_admin', 'admin'],
  }},
  { pattern: '/api/suppliers', methods: {
    GET: ['super_admin', 'admin', 'store_manager', 'accountant', 'auditor'],
    POST: ['super_admin', 'admin', 'store_manager'],
  }},
  { pattern: '/api/suppliers/[id]', methods: {
    GET: ['*'],
    PUT: ['super_admin', 'admin', 'store_manager'],
    DELETE: ['super_admin', 'admin'],
  }},
  { pattern: '/api/materials', methods: {
    GET: ['super_admin', 'admin', 'store_manager', 'auditor'],
    POST: ['super_admin', 'admin', 'store_manager'],
  }},
  { pattern: '/api/materials/[id]', methods: {
    GET: ['*'],
    PUT: ['super_admin', 'admin', 'store_manager'],
    DELETE: ['super_admin', 'admin', 'store_manager'],
  }},
  { pattern: '/api/materials/[id]/adjust-stock', methods: {
    POST: ['super_admin', 'admin', 'store_manager'],
  }},

  // ============ LABOUR & HR ============
  { pattern: '/api/labour-groups', methods: {
    GET: ['super_admin', 'admin', 'hr_manager', 'supervisor', 'store_manager'],
    POST: ['super_admin', 'admin', 'hr_manager'],
  }},
  { pattern: '/api/labour-groups/[id]', methods: {
    GET: ['*'],
    PUT: ['super_admin', 'admin', 'hr_manager'],
    DELETE: ['super_admin', 'admin'],
  }},
  { pattern: '/api/labour-groups/[id]/members', methods: {
    GET: ['*'],
    POST: ['super_admin', 'admin', 'hr_manager'],
    DELETE: ['super_admin', 'admin', 'hr_manager'],
  }},
  { pattern: '/api/labour/[id]', methods: {
    GET: ['*'],
    PUT: ['super_admin', 'admin', 'hr_manager'],
    DELETE: ['super_admin', 'admin', 'hr_manager'],
  }},
  { pattern: '/api/attendance', methods: {
    GET: ['super_admin', 'admin', 'hr_manager', 'supervisor', 'labour'],
    POST: ['super_admin', 'admin', 'hr_manager', 'supervisor'],
  }},
  { pattern: '/api/payroll', methods: {
    GET: ['super_admin', 'admin', 'hr_manager', 'accountant', 'auditor'],
  }},
  { pattern: '/api/payroll/generate', methods: {
    POST: ['super_admin', 'admin', 'hr_manager'],
  }},
  { pattern: '/api/payroll/[id]/pay', methods: {
    POST: ['super_admin', 'admin', 'accountant'],
  }},
  { pattern: '/api/employees', methods: {
    GET: ['super_admin', 'admin', 'hr_manager'],
    POST: ['super_admin', 'admin', 'hr_manager'],
  }},
  { pattern: '/api/employees/[id]', methods: {
    GET: ['*'],
    PUT: ['super_admin', 'admin', 'hr_manager'],
    DELETE: ['super_admin', 'admin', 'hr_manager'],
  }},
  { pattern: '/api/leave-requests', methods: {
    GET: ['super_admin', 'admin', 'hr_manager', 'supervisor'],
    POST: ['*'],
  }},
  { pattern: '/api/leave-requests/[id]/approve', methods: {
    POST: ['super_admin', 'admin', 'hr_manager'],
  }},
  { pattern: '/api/leave-requests/[id]/reject', methods: {
    POST: ['super_admin', 'admin', 'hr_manager'],
  }},

  // ============ OPERATIONS ============
  { pattern: '/api/subcontractors', methods: {
    GET: ['super_admin', 'admin', 'supervisor', 'store_manager'],
    POST: ['super_admin', 'admin', 'supervisor'],
  }},
  { pattern: '/api/subcontractors/[id]', methods: {
    GET: ['*'],
    PUT: ['super_admin', 'admin', 'supervisor'],
    DELETE: ['super_admin', 'admin'],
  }},
  { pattern: '/api/work-orders', methods: {
    GET: ['super_admin', 'admin', 'supervisor', 'store_manager'],
    POST: ['super_admin', 'admin', 'supervisor'],
  }},
  { pattern: '/api/work-orders/[id]', methods: {
    GET: ['*'],
    PUT: ['super_admin', 'admin', 'supervisor'],
    DELETE: ['super_admin', 'admin'],
  }},
  { pattern: '/api/assets', methods: {
    GET: ['super_admin', 'admin', 'store_manager', 'supervisor'],
    POST: ['super_admin', 'admin', 'store_manager'],
  }},
  { pattern: '/api/assets/[id]', methods: {
    GET: ['*'],
    PUT: ['super_admin', 'admin', 'store_manager'],
    DELETE: ['super_admin', 'admin', 'store_manager'],
  }},
  { pattern: '/api/scheduling', methods: {
    GET: ['super_admin', 'admin', 'supervisor', 'hr_manager'],
    POST: ['super_admin', 'admin', 'supervisor'],
  }},

  // ============ RESOURCES ============
  { pattern: '/api/resources', methods: { GET: ['super_admin', 'admin', 'store_manager', 'supervisor', 'auditor'] }},
  { pattern: '/api/resources/dashboard', methods: { GET: ['super_admin', 'admin', 'store_manager', 'supervisor'] }},
  { pattern: '/api/resources/skills', methods: {
    GET: ['*'],
    POST: ['super_admin', 'admin', 'hr_manager', 'store_manager'],
  }},
  { pattern: '/api/resources/skills/[id]', methods: {
    PUT: ['super_admin', 'admin', 'hr_manager', 'store_manager'],
    DELETE: ['super_admin', 'admin'],
  }},
  { pattern: '/api/resources/worker-skills', methods: {
    GET: ['*'],
    POST: ['super_admin', 'admin', 'hr_manager'],
    DELETE: ['super_admin', 'admin', 'hr_manager'],
  }},
  { pattern: '/api/resources/assignments', methods: {
    GET: ['super_admin', 'admin', 'store_manager', 'supervisor'],
    POST: ['super_admin', 'admin', 'store_manager', 'supervisor'],
  }},
  { pattern: '/api/resources/assignments/[id]', methods: {
    PUT: ['super_admin', 'admin', 'store_manager'],
    DELETE: ['super_admin', 'admin', 'store_manager'],
  }},
  { pattern: '/api/resources/crews', methods: {
    GET: ['super_admin', 'admin', 'store_manager', 'supervisor', 'hr_manager'],
    POST: ['super_admin', 'admin', 'store_manager'],
  }},
  { pattern: '/api/resources/crews/[id]', methods: {
    PUT: ['super_admin', 'admin', 'store_manager'],
    DELETE: ['super_admin', 'admin', 'store_manager'],
  }},
  { pattern: '/api/resources/requests', methods: {
    GET: ['super_admin', 'admin', 'store_manager', 'supervisor'],
    POST: ['*'],
  }},
  { pattern: '/api/resources/requests/[id]', methods: {
    GET: ['*'],
    PUT: ['super_admin', 'admin', 'store_manager'],
  }},
  { pattern: '/api/resources/requests/[id]/approve', methods: {
    POST: ['super_admin', 'admin', 'store_manager'],
  }},
  { pattern: '/api/resources/requests/[id]/reject', methods: {
    POST: ['super_admin', 'admin', 'store_manager'],
  }},
  { pattern: '/api/resources/productivity', methods: {
    GET: ['super_admin', 'admin', 'store_manager', 'supervisor', 'auditor'],
    POST: ['super_admin', 'admin', 'supervisor'],
  }},
  { pattern: '/api/resources/productivity/[id]', methods: {
    PUT: ['super_admin', 'admin', 'supervisor'],
  }},

  // ============ COST CONTROL ============
  { pattern: '/api/cost-control', methods: { GET: ['super_admin', 'admin', 'supervisor', 'accountant', 'auditor'] }},
  { pattern: '/api/cost-control/dashboard', methods: { GET: ['super_admin', 'admin', 'supervisor', 'accountant', 'auditor'] }},
  { pattern: '/api/cost-control/forecast', methods: { GET: ['super_admin', 'admin', 'accountant', 'auditor'] }},
  { pattern: '/api/cost-control/cost-codes', methods: {
    GET: ['super_admin', 'admin', 'supervisor', 'accountant', 'auditor'],
    POST: ['super_admin', 'admin', 'accountant'],
  }},
  { pattern: '/api/cost-control/cost-codes/[id]', methods: {
    PUT: ['super_admin', 'admin', 'accountant'],
    DELETE: ['super_admin', 'admin'],
  }},
  { pattern: '/api/cost-control/budgets', methods: {
    GET: ['super_admin', 'admin', 'supervisor', 'accountant', 'auditor'],
    POST: ['super_admin', 'admin', 'accountant'],
  }},
  { pattern: '/api/cost-control/budgets/[id]', methods: {
    GET: ['*'],
    PUT: ['super_admin', 'admin', 'accountant'],
    DELETE: ['super_admin', 'admin'],
  }},
  { pattern: '/api/cost-control/budgets/[id]/line-items', methods: {
    GET: ['*'],
    POST: ['super_admin', 'admin', 'accountant'],
  }},
  { pattern: '/api/cost-control/budgets/[id]/line-items/[itemId]', methods: {
    PUT: ['super_admin', 'admin', 'accountant'],
    DELETE: ['super_admin', 'admin', 'accountant'],
  }},
  { pattern: '/api/cost-control/budgets/[id]/snapshots', methods: {
    GET: ['super_admin', 'admin', 'accountant'],
    POST: ['super_admin', 'admin', 'accountant'],
  }},
  { pattern: '/api/cost-control/budgets/[id]/change-orders', methods: {
    GET: ['*'],
    POST: ['super_admin', 'admin', 'supervisor', 'accountant'],
  }},
  { pattern: '/api/cost-control/budgets/[id]/change-orders/[coId]', methods: {
    GET: ['*'],
    PUT: ['super_admin', 'admin', 'accountant'],
    DELETE: ['super_admin', 'admin'],
  }},

  // ============ COLLABORATION ============
  { pattern: '/api/collaboration', methods: { GET: ['*'] }},
  { pattern: '/api/collaboration/dashboard', methods: { GET: ['*'] }},
  { pattern: '/api/collaboration/rfis', methods: {
    GET: ['*'],
    POST: ['super_admin', 'admin', 'supervisor'],
  }},
  { pattern: '/api/collaboration/submittals', methods: {
    GET: ['*'],
    POST: ['super_admin', 'admin', 'supervisor'],
  }},
  { pattern: '/api/collaboration/submittals/[id]', methods: {
    GET: ['*'],
    PUT: ['super_admin', 'admin', 'supervisor'],
    DELETE: ['super_admin', 'admin'],
  }},
  { pattern: '/api/collaboration/discussions', methods: {
    GET: ['*'],
    POST: ['*'],
  }},
  { pattern: '/api/collaboration/discussions/[id]', methods: {
    GET: ['*'],
    PUT: ['super_admin', 'admin'],
    DELETE: ['super_admin', 'admin'],
  }},
  { pattern: '/api/collaboration/discussions/[id]/comments', methods: {
    GET: ['*'],
    POST: ['*'],
  }},
  { pattern: '/api/collaboration/announcements', methods: {
    GET: ['*'],
    POST: ['super_admin', 'admin', 'supervisor'],
  }},
  { pattern: '/api/collaboration/announcements/[id]', methods: {
    PUT: ['super_admin', 'admin'],
    DELETE: ['super_admin', 'admin'],
  }},

  // ============ SALES ============
  { pattern: '/api/products', methods: {
    GET: ['super_admin', 'admin', 'store_manager'],
    POST: ['super_admin', 'admin', 'store_manager'],
  }},
  { pattern: '/api/products/[id]', methods: {
    GET: ['*'],
    PUT: ['super_admin', 'admin', 'store_manager'],
    DELETE: ['super_admin', 'admin', 'store_manager'],
  }},
  { pattern: '/api/product-categories', methods: {
    GET: ['*'],
    POST: ['super_admin', 'admin', 'store_manager'],
  }},
  { pattern: '/api/customers', methods: {
    GET: ['super_admin', 'admin', 'accountant'],
    POST: ['super_admin', 'admin', 'accountant'],
  }},
  { pattern: '/api/customers/[id]', methods: {
    GET: ['*'],
    PUT: ['super_admin', 'admin', 'accountant'],
    DELETE: ['super_admin', 'admin', 'accountant'],
  }},
  { pattern: '/api/sales-invoices', methods: {
    GET: ['super_admin', 'admin', 'accountant', 'auditor'],
    POST: ['super_admin', 'admin', 'accountant'],
  }},
  { pattern: '/api/sales-invoices/[id]', methods: {
    GET: ['*'],
    PUT: ['super_admin', 'admin', 'accountant'],
    DELETE: ['super_admin', 'admin', 'accountant'],
  }},

  // ============ AI & ANALYTICS ============
  { pattern: '/api/ai', methods: { GET: ['super_admin', 'admin', 'supervisor', 'auditor'] }},
  { pattern: '/api/ai/forecast', methods: { GET: ['super_admin', 'admin', 'supervisor', 'accountant', 'auditor'] }},
  { pattern: '/api/ai/insights', methods: { GET: ['super_admin', 'admin', 'supervisor', 'auditor'] }},
  { pattern: '/api/ai/insights/[id]', methods: { GET: ['*'] }},
  { pattern: '/api/analytics', methods: { GET: ['super_admin', 'admin', 'supervisor', 'accountant', 'auditor'] }},
  { pattern: '/api/analytics/dashboard', methods: { GET: ['super_admin', 'admin', 'supervisor', 'auditor'] }},
  { pattern: '/api/analytics/project', methods: { GET: ['super_admin', 'admin', 'supervisor', 'auditor'] }},
  { pattern: '/api/analytics/reports', methods: { GET: ['super_admin', 'admin', 'supervisor', 'accountant', 'auditor'] }},

  // ============ CLIENT PORTAL ============
  { pattern: '/api/client-portal', methods: { GET: ['super_admin', 'admin', 'client'] }},
  { pattern: '/api/client-portal/dashboard', methods: { GET: ['super_admin', 'admin', 'client'] }},
  { pattern: '/api/client-portal/projects', methods: { GET: ['super_admin', 'admin', 'client'] }},
  { pattern: '/api/client-portal/projects/[id]', methods: { GET: ['super_admin', 'admin', 'client'] }},
  { pattern: '/api/client-portal/complaints', methods: {
    GET: ['super_admin', 'admin', 'client'],
    POST: ['super_admin', 'admin', 'client'],
  }},
  { pattern: '/api/client-portal/complaints/[id]', methods: {
    GET: ['super_admin', 'admin', 'client'],
    PUT: ['super_admin', 'admin', 'client'],
    DELETE: ['super_admin', 'admin'],
  }},

  // ============ AUDIT ============
  { pattern: '/api/audit-log', methods: {
    GET: ['super_admin', 'admin', 'auditor'],
  }},

  // ============ NOTIFICATIONS ============
  { pattern: '/api/notifications', methods: { GET: ['*'] }},
]

/**
 * Check if a user with the given role can access a specific API route with the given method.
 * Returns true if access is allowed.
 */
export function canAccessRoute(role: string, pathname: string, method: string): boolean {
  // Super admin has access to everything
  if (role === ROLES.SUPER_ADMIN) return true

  // Find the most specific matching permission
  let matched = false
  for (const perm of ROUTE_PERMISSIONS) {
    if (!matchRoutePattern(pathname, perm.pattern)) continue

    const methodKey = method.toUpperCase() as keyof RoutePermission['methods']
    const allowedRoles = perm.methods[methodKey]
    if (!allowedRoles) continue

    // '*' means any authenticated user
    if (allowedRoles.includes('*')) {
      matched = true
      break
    }

    // Check if the user's role is in the allowed list
    if (allowedRoles.includes(role)) {
      matched = true
      break
    }
  }

  return matched
}

/**
 * Match a URL pathname against a route pattern like "/api/projects/[id]"
 */
function matchRoutePattern(pathname: string, pattern: string): boolean {
  // Exact match
  if (pathname === pattern) return true

  // Pattern match: replace [id] segments with regex
  const patternParts = pattern.split('/')
  const pathParts = pathname.split('/')

  if (patternParts.length !== pathParts.length) return false

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i]
    const pathPart = pathParts[i]

    // [param] matches any value
    if (patternPart.startsWith('[') && patternPart.endsWith(']')) {
      continue
    }

    // Literal match
    if (patternPart !== pathPart) {
      return false
    }
  }

  return true
}

/**
 * Helper to create a middleware-compatible route checker.
 * Returns 403 if the user doesn't have permission.
 */
export function checkRoutePermission(role: string, pathname: string, method: string): { allowed: boolean; statusCode?: number } {
  if (canAccessRoute(role, pathname, method)) {
    return { allowed: true }
  }
  return { allowed: false, statusCode: 403 }
}
