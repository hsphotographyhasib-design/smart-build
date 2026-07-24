'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/eppm/app-shell'
import { DashboardView } from '@/components/eppm/views/dashboard-view'
import { ProjectsView } from '@/components/eppm/views/projects-view'
import { CompareView } from '@/components/eppm/views/compare-view'
import { WhatIfView } from '@/components/eppm/views/whatif-view'
import { PortfoliosView } from '@/components/eppm/views/portfolios-view'
import { ProgramsView } from '@/components/eppm/views/programs-view'
import { GanttView } from '@/components/eppm/views/gantt-view'
import { ActivitiesView } from '@/components/eppm/views/activities-view'
import { CriticalPathView } from '@/components/eppm/views/critical-path-view'
import { MilestonesView } from '@/components/eppm/views/milestones-view'
import { ResourcesView } from '@/components/eppm/views/resources-view'
import { EquipmentView } from '@/components/eppm/views/equipment-view'
import { WorkforceView } from '@/components/eppm/views/workforce-view'
import { CostsView } from '@/components/eppm/views/costs-view'
import { EvmView } from '@/components/eppm/views/evm-view'
import { RisksView } from '@/components/eppm/views/risks-view'
import { BaselinesView } from '@/components/eppm/views/baselines-view'
import { CashflowView } from '@/components/eppm/views/cashflow-view'
import { ChangesView } from '@/components/eppm/views/changes-view'
import { ClaimsView } from '@/components/eppm/views/claims-view'
import { LookaheadView } from '@/components/eppm/views/lookahead-view'
import { ProcurementView } from '@/components/eppm/views/procurement-view'
import { DocumentsView } from '@/components/eppm/views/documents-view'
import { SubmittalsView } from '@/components/eppm/views/submittals-view'
import { QualityView } from '@/components/eppm/views/quality-view'
import { HseView } from '@/components/eppm/views/hse-view'
import { CommissioningView } from '@/components/eppm/views/commissioning-view'
import { CloseoutView } from '@/components/eppm/views/closeout-view'
import { SiteProgressView } from '@/components/eppm/views/site-progress-view'
import { ReportsView } from '@/components/eppm/views/reports-view'
import { AiPlannerView } from '@/components/eppm/views/ai-planner-view'
import { IntegrationsView } from '@/components/eppm/views/integrations-view'
import { AdminView } from '@/components/eppm/views/admin-view'
import { WbsView } from '@/components/eppm/views/wbs-view'
import MaintenanceView, { type MaintenanceFocus } from '@/components/eppm/views/maintenance-view'
import TenderView, { type TenderFocus } from '@/components/eppm/views/tender-view'
import HrView from '@/components/eppm/views/hr-view'
import FleetAssetsView, { type FleetFocus } from '@/components/eppm/views/fleet-assets-view'
import InventoryView, { type InventoryFocus } from '@/components/eppm/views/inventory-view'
import ProcurementOpsView, { type ProcureFocus } from '@/components/eppm/views/procurement-ops-view'
import AccountsView, { type AccountsFocus } from '@/components/eppm/views/accounts-view'
import ExecReportsView, { type ExecReportsFocus } from '@/components/eppm/views/exec-reports-view'
import SecurityView, { type SecurityFocus } from '@/components/eppm/views/security-view'
import SupportView, { type SupportFocus } from '@/components/eppm/views/support-view'
import PortalsView, { type PortalsFocus } from '@/components/eppm/views/portals-view'
import WorkflowEngineView from '@/components/eppm/views/workflow-engine-view'
import MobileHome from '@/components/eppm/views/mobile-home'
import MobileWorkOrders from '@/components/eppm/views/mobile-work-orders'
import MobileCreateComplaint from '@/components/eppm/views/mobile-create-complaint'
import NotificationsView from '@/components/eppm/views/notifications-view'
import { FadeIn } from '@/components/eppm/motion'
import { useNav } from '@/components/eppm/nav/nav-context'
import type { View } from '@/lib/eppm'

export default function Home() {
  const [view, setView] = useState<View>('dashboard')
  const [projectId, setProjectId] = useState<string | null>(null)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('eppm:view')) as View | null
    if (saved) setView(saved)
  }, [])
  const { pushRecent } = useNav()
  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('eppm:view', view)
    pushRecent(view)
  }, [view, pushRecent])

  const navigate = (v: View) => {
    setView(v)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const render = () => {
    switch (view) {
      case 'dashboard': return (
        <>
          <div className="lg:hidden">
            <MobileHome onNavigate={navigate} onOpenDrawer={() => setMobileDrawerOpen(true)} />
          </div>
          <div className="hidden lg:block">
            <DashboardView onNavigate={navigate} />
          </div>
        </>
      )
      case 'portfolios': return <PortfoliosView onNavigate={navigate} />
      case 'programs': return <ProgramsView onNavigate={navigate} />
      case 'projects': return <ProjectsView onNavigate={navigate} onOpenProject={(id) => { setProjectId(id); navigate('gantt') }} />
      case 'compare': return <CompareView onNavigate={navigate} />
      case 'whatif': return <WhatIfView onNavigate={navigate} />
      case 'wbs': return <WbsView projectId={projectId} onNavigate={navigate} />
      case 'activities': return <ActivitiesView onNavigate={navigate} />
      case 'gantt': return <GanttView projectId={projectId} setProjectId={setProjectId} onNavigate={navigate} />
      case 'critical-path': return <CriticalPathView onNavigate={navigate} />
      case 'milestones': return <MilestonesView onNavigate={navigate} />
      case 'resources': return <ResourcesView onNavigate={navigate} />
      case 'equipment': return <EquipmentView onNavigate={navigate} />
      case 'workforce': return <WorkforceView onNavigate={navigate} />
      case 'costs': return <CostsView onNavigate={navigate} />
      case 'evm': return <EvmView onNavigate={navigate} />
      case 'cashflow': return <CashflowView onNavigate={navigate} />
      case 'baselines': return <BaselinesView onNavigate={navigate} />
      case 'risks': return <RisksView onNavigate={navigate} />
      case 'changes': return <ChangesView onNavigate={navigate} />
      case 'claims': return <ClaimsView onNavigate={navigate} />
      case 'lookahead': return <LookaheadView onNavigate={navigate} />
      case 'procurement': return <ProcurementView onNavigate={navigate} />
      case 'documents': return <DocumentsView onNavigate={navigate} />
      case 'submittals': return <SubmittalsView onNavigate={navigate} />
      case 'quality': return <QualityView onNavigate={navigate} />
      case 'hse': return <HseView onNavigate={navigate} />
      case 'commissioning': return <CommissioningView onNavigate={navigate} />
      case 'closeout': return <CloseoutView onNavigate={navigate} />
      case 'site-progress': return <SiteProgressView onNavigate={navigate} />
      case 'reports': return <ReportsView onNavigate={navigate} />
      case 'ai-planner': return <AiPlannerView onNavigate={navigate} />
      case 'integrations': return <IntegrationsView onNavigate={navigate} />
      case 'admin': return <AdminView onNavigate={navigate} />
      case 'work-orders': return (
        <>
          <div className="lg:hidden"><MobileWorkOrders onNavigate={navigate} /></div>
          <div className="hidden lg:block"><MaintenanceView onNavigate={navigate} focus="work-orders" /></div>
        </>
      )
      case 'complaints': return (
        <>
          <div className="lg:hidden"><MobileCreateComplaint onNavigate={navigate} /></div>
          <div className="hidden lg:block"><MaintenanceView onNavigate={navigate} focus="complaints" /></div>
        </>
      )
      case 'notifications': return <NotificationsView onNavigate={navigate} />
      case 'maintenance':
      case 'service-requests':
      case 'preventive':
      case 'corrective':
      case 'predictive':
      case 'dispatch':
      case 'technicians':
      case 'amc':
        return <MaintenanceView onNavigate={navigate} focus={view as MaintenanceFocus} />
      case 'tender-packages':
      case 'bid-comparison':
      case 'award-management':
      case 'vendor-prequal':
        return <TenderView onNavigate={navigate} focus={view as TenderFocus} />
      case 'employees': return <HrView onNavigate={navigate} />
      case 'vehicles':
      case 'assets':
        return <FleetAssetsView onNavigate={navigate} focus={view as FleetFocus} />
      case 'stock':
      case 'warehouses':
      case 'stock-movements':
        return <InventoryView onNavigate={navigate} focus={view as InventoryFocus} />
      case 'purchase-requests':
      case 'purchase-orders':
      case 'suppliers':
      case 'goods-receipt':
        return <ProcurementOpsView onNavigate={navigate} focus={view as ProcureFocus} />
      case 'invoices':
      case 'payments':
        return <AccountsView onNavigate={navigate} focus={view as AccountsFocus} />
      case 'exec-reports':
      case 'financial-reports':
        return <ExecReportsView onNavigate={navigate} focus={view as ExecReportsFocus} />
      case 'sso':
      case 'audit':
        return <SecurityView onNavigate={navigate} focus={view as SecurityFocus} />
      case 'docs':
      case 'tickets':
        return <SupportView onNavigate={navigate} focus={view as SupportFocus} />
      case 'customer-portal':
      case 'technician-portal':
        return <PortalsView onNavigate={navigate} focus={view as PortalsFocus} />
      case 'workflow-engine': return <WorkflowEngineView onNavigate={navigate} />
      default: return <DashboardView onNavigate={navigate} />
    }
  }

  return (
    <AppShell
      view={view}
      onNavigate={navigate}
      onOpenProject={(id) => { setProjectId(id); navigate('gantt') }}
      mobileDrawerOpen={mobileDrawerOpen}
      setMobileDrawerOpen={setMobileDrawerOpen}
    >
      <FadeIn key={view}>{render()}</FadeIn>
    </AppShell>
  )
}
