import { create } from 'zustand'

// ============ NAVIGATION / ROUTING STORE ============
export type AppPage = 
  | 'dashboard'
  | 'projects'
  | 'project-detail'
  | 'project-tasks'
  | 'project-finance'
  | 'project-documents'
  | 'project-daily-notes'
  | 'invoices'
  | 'payments'
  | 'boq'
  | 'daybook'
  | 'cashflow'
  | 'purchase-requests'
  | 'purchase-orders'
  | 'suppliers'
  | 'inventory'
  | 'stock-ledger'
  | 'labour-groups'
  | 'attendance'
  | 'payroll'
  | 'employees'
  | 'leave'
  | 'loans'
  | 'subcontractors'
  | 'work-orders'
  | 'assets'
  | 'scheduling'
  | 'product-catalog'
  | 'customers'
  | 'sales-orders'
  | 'sales-invoices'
  | 'reports'
  | 'notifications'
  | 'audit-log'
  | 'settings'
  | 'users'
  | 'resource-dashboard'
  | 'resource-planning'
  | 'labour-resources'
  | 'equipment-resources'
  | 'vehicle-resources'
  | 'tool-resources'
  | 'crew-management'
  | 'resource-requests'
  | 'resource-productivity'
  | 'resource-forecasting'
  | 'landing'

interface AppState {
  // Auth
  user: any | null
  token: string | null
  isAuthenticated: boolean
  
  // Navigation
  currentPage: AppPage
  pageParams: Record<string, string>
  breadcrumbs: { label: string; page?: AppPage; params?: Record<string, string> }[]
  sidebarOpen: boolean
  
  // Theme
  theme: 'light' | 'dark' | 'system'
  
  // Actions - Auth
  setUser: (user: any) => void
  setToken: (token: string | null) => void
  logout: () => void
  
  // Actions - Navigation
  navigate: (page: AppPage, params?: Record<string, string>) => void
  setSidebarOpen: (open: boolean) => void
  setBreadcrumbs: (items: { label: string; page?: AppPage; params?: Record<string, string> }[]) => void
  
  // Actions - Theme
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

export const useAppStore = create<AppState>((set) => ({
  // Auth
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('sb_token') : null,
  isAuthenticated: false,
  
  // Navigation
  currentPage: 'dashboard',
  pageParams: {},
  breadcrumbs: [{ label: 'Dashboard' }],
  sidebarOpen: true,
  
  // Theme
  theme: 'light',
  
  // Auth actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('sb_token', token)
      else localStorage.removeItem('sb_token')
    }
    set({ token })
  },
  logout: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('sb_token')
    set({ user: null, token: null, isAuthenticated: false, currentPage: 'dashboard', pageParams: {} })
  },
  
  // Navigation actions
  navigate: (page, params = {}) => {
    const pageLabels: Record<string, string> = {
      'dashboard': 'Dashboard',
      'projects': 'Projects',
      'project-detail': 'Project Details',
      'project-tasks': 'Tasks',
      'project-finance': 'Finance',
      'project-documents': 'Documents',
      'project-daily-notes': 'Daily Notes',
      'invoices': 'Invoices',
      'payments': 'Payments',
      'boq': 'Bill of Quantities',
      'daybook': 'Day Book',
      'cashflow': 'Cashflow',
      'purchase-requests': 'Purchase Requests',
      'purchase-orders': 'Purchase Orders',
      'suppliers': 'Suppliers',
      'inventory': 'Inventory',
      'stock-ledger': 'Stock Ledger',
      'labour-groups': 'Labour Groups',
      'attendance': 'Attendance',
      'payroll': 'Payroll',
      'employees': 'Employees',
      'leave': 'Leave Management',
      'loans': 'Loan Management',
      'subcontractors': 'Sub Contractors',
      'work-orders': 'Work Orders',
      'assets': 'Asset Management',
      'scheduling': 'Scheduling',
      'product-catalog': 'Product Catalog',
      'customers': 'Customers',
      'sales-orders': 'Sales Orders',
      'sales-invoices': 'Sales Invoices',
      'reports': 'Reports',
      'notifications': 'Notifications',
      'audit-log': 'Audit Log',
      'settings': 'Settings',
      'users': 'User Management',
      'resource-dashboard': 'Resource Dashboard',
      'resource-planning': 'Resource Planning',
      'labour-resources': 'Labour Resources',
      'equipment-resources': 'Equipment Resources',
      'vehicle-resources': 'Vehicle Resources',
      'tool-resources': 'Tool Resources',
      'crew-management': 'Crew Management',
      'resource-requests': 'Resource Requests',
      'resource-productivity': 'Productivity Tracking',
      'resource-forecasting': 'Resource Forecasting',
      'landing': 'Welcome',
    }
    set({ 
      currentPage: page, 
      pageParams: params,
      breadcrumbs: [{ label: pageLabels[page] || page, page, params }]
    })
  },
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setBreadcrumbs: (items) => set({ breadcrumbs: items }),
  
  // Theme actions
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sb_theme', theme)
      if (theme === 'dark') document.documentElement.classList.add('dark')
      else if (theme === 'light') document.documentElement.classList.remove('dark')
    }
    set({ theme })
  },
}))

// ============ API HELPER ============
export const api = {
  async request<T = any>(method: string, url: string, body?: any): Promise<{ success: boolean; data?: T; error?: string }> {
    const { token } = useAppStore.getState()
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    
    try {
      const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      })
      return await res.json()
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' }
    }
  },
  
  get: <T = any>(url: string) => api.request<T>('GET', url),
  post: <T = any>(url: string, body?: any) => api.request<T>('POST', url, body),
  put: <T = any>(url: string, body?: any) => api.request<T>('PUT', url, body),
  del: <T = any>(url: string) => api.request<T>('DELETE', url),
}

// ============ QUERY KEY FACTORY ============
export const queryKeys = {
  dashboard: ['dashboard'] as const,
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  invoices: ['invoices'] as const,
  payments: ['payments'] as const,
  suppliers: ['suppliers'] as const,
  materials: ['materials'] as const,
  purchaseRequests: ['purchase-requests'] as const,
  purchaseOrders: ['purchase-orders'] as const,
  labourGroups: ['labour-groups'] as const,
  attendance: ['attendance'] as const,
  employees: ['employees'] as const,
  leaveRequests: ['leave-requests'] as const,
  assets: ['assets'] as const,
  products: ['products'] as const,
  customers: ['customers'] as const,
  notifications: ['notifications'] as const,
  users: ['users'] as const,
  reports: ['reports'] as const,
  boq: (projectId: string) => ['boq', projectId] as const,
  daybook: ['daybook'] as const,
  cashflow: (month?: number, year?: number) => ['cashflow', month, year] as const,
}
