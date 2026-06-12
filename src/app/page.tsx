'use client'

import React, { useEffect, useState } from 'react'
import { useAppStore, api } from '@/lib/store'
import { AppLayout } from '@/components/layout/app-layout'
import { LoginPage } from '@/components/auth/login-page'
import { DashboardPage } from '@/components/dashboard/dashboard-page'
import { ProjectsPage } from '@/components/projects/projects-page'
import { ProjectDetailPage } from '@/components/projects/project-detail-page'
import { SchedulingPage } from '@/components/scheduling/scheduling-page'
import { InvoicesPage } from '@/components/finance/invoices-page'
import { PaymentsPage } from '@/components/finance/payments-page'
import { BoqPage } from '@/components/finance/boq-page'
import { DaybookPage } from '@/components/finance/daybook-page'
import { CashflowPage } from '@/components/finance/cashflow-page'
import { PurchaseRequestsPage } from '@/components/procurement/purchase-requests-page'
import { PurchaseOrdersPage } from '@/components/procurement/purchase-orders-page'
import { SuppliersPage } from '@/components/procurement/suppliers-page'
import { InventoryPage } from '@/components/procurement/inventory-page'
import { LabourGroupsPage } from '@/components/labour/labour-groups-page'
import { AttendancePage } from '@/components/labour/attendance-page'
import { PayrollPage } from '@/components/labour/payroll-page'
import { EmployeesPage } from '@/components/hr/employees-page'
import { LeavePage } from '@/components/hr/leave-page'
import { SubContractorsPage } from '@/components/subcontractors/subcontractors-page'
import { WorkOrdersPage } from '@/components/subcontractors/work-orders-page'
import { AssetsPage } from '@/components/assets/assets-page'
import { ProductCatalogPage } from '@/components/sales/product-catalog-page'
import { CustomersPage } from '@/components/sales/customers-page'
import { SalesInvoicesPage } from '@/components/sales/sales-invoices-page'
import { ReportsPage } from '@/components/reports/reports-page'
import { NotificationsPage } from '@/components/notifications/notifications-page'
import { AuditLogPage } from '@/components/common/audit-log-page'
import { UsersPage } from '@/components/common/users-page'
import { SettingsPage } from '@/components/common/settings-page'
import { ResourceDashboard } from '@/components/resources/resource-dashboard'
import { ResourcePlanning } from '@/components/resources/resource-planning'
import { LabourResources } from '@/components/resources/labour-resources'
import { EquipmentResources } from '@/components/resources/equipment-resources'
import { VehicleResources } from '@/components/resources/vehicle-resources'
import { ToolResources } from '@/components/resources/tool-resources'
import { CrewManagement } from '@/components/resources/crew-management'
import { ResourceRequests } from '@/components/resources/resource-requests'
import { ResourceProductivity } from '@/components/resources/resource-productivity'
import { ResourceForecasting } from '@/components/resources/resource-forecasting'
import { LandingPage } from '@/components/landing/landing-page'
import { Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

function PageLoader() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-lg" />
    </div>
  )
}

function PageContent() {
  const { currentPage, pageParams } = useAppStore()

  switch (currentPage) {
    case 'landing': return <LandingPage />
    case 'dashboard': return <DashboardPage />
    case 'projects': return <ProjectsPage />
    case 'project-detail': return <ProjectDetailPage projectId={pageParams.id} />
    case 'project-tasks': return <ProjectDetailPage projectId={pageParams.id} activeTab="tasks" />
    case 'project-finance': return <ProjectDetailPage projectId={pageParams.id} activeTab="finance" />
    case 'project-documents': return <ProjectDetailPage projectId={pageParams.id} activeTab="documents" />
    case 'project-daily-notes': return <ProjectDetailPage projectId={pageParams.id} activeTab="daily-notes" />
    case 'scheduling': return <SchedulingPage />
    case 'invoices': return <InvoicesPage />
    case 'payments': return <PaymentsPage />
    case 'boq': return <BoqPage />
    case 'daybook': return <DaybookPage />
    case 'cashflow': return <CashflowPage />
    case 'purchase-requests': return <PurchaseRequestsPage />
    case 'purchase-orders': return <PurchaseOrdersPage />
    case 'suppliers': return <SuppliersPage />
    case 'inventory': return <InventoryPage />
    case 'labour-groups': return <LabourGroupsPage />
    case 'attendance': return <AttendancePage />
    case 'payroll': return <PayrollPage />
    case 'employees': return <EmployeesPage />
    case 'leave': return <LeavePage />
    case 'subcontractors': return <SubContractorsPage />
    case 'work-orders': return <WorkOrdersPage />
    case 'assets': return <AssetsPage />
    case 'product-catalog': return <ProductCatalogPage />
    case 'customers': return <CustomersPage />
    case 'sales-invoices': return <SalesInvoicesPage />
    case 'reports': return <ReportsPage />
    case 'notifications': return <NotificationsPage />
    case 'audit-log': return <AuditLogPage />
    case 'users': return <UsersPage />
    case 'settings': return <SettingsPage />
    case 'resource-dashboard': return <ResourceDashboard />
    case 'resource-planning': return <ResourcePlanning />
    case 'labour-resources': return <LabourResources />
    case 'equipment-resources': return <EquipmentResources />
    case 'vehicle-resources': return <VehicleResources />
    case 'tool-resources': return <ToolResources />
    case 'crew-management': return <CrewManagement />
    case 'resource-requests': return <ResourceRequests />
    case 'resource-productivity': return <ResourceProductivity />
    case 'resource-forecasting': return <ResourceForecasting />
    default: return <DashboardPage />
  }
}

export default function HomePage() {
  const { token, isAuthenticated, setUser, setToken, logout, currentPage, navigate: nav } = useAppStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      if (token) {
        const res = await api.get('/api/auth/me')
        if (res.success && res.data) {
          setUser(res.data)
        } else {
          setToken(null)
          logout()
        }
      }
      // Set initial page for unauthenticated users
      if (!useAppStore.getState().isAuthenticated && useAppStore.getState().currentPage === 'dashboard') {
        nav('landing')
      }
      setLoading(false)
    }
    init()
  }, [token, setUser, setToken, logout, nav])

  // If authenticated and on landing page, redirect to dashboard
  if (isAuthenticated && currentPage === 'landing') {
    nav('dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-amber-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <React.Suspense fallback={<PageLoader />}>
        <PageContent />
      </React.Suspense>
    )
  }

  return (
    <AppLayout>
      <React.Suspense fallback={<PageLoader />}>
        <PageContent />
      </React.Suspense>
    </AppLayout>
  )
}
