'use client'

import { useState, useEffect } from 'react'
import { FloatingNavbar } from '@/components/eppm/floating-nav/floating-navbar'
import { BottomNav } from '@/components/eppm/floating-nav/bottom-nav'
import { GlobalSearch } from '@/components/eppm/global-search'
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
import { FadeIn } from '@/components/eppm/motion'
import type { View } from '@/lib/eppm'

export default function Home() {
  const [view, setView] = useState<View>('dashboard')
  const [projectId, setProjectId] = useState<string | null>(null)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [bottomSearchOpen, setBottomSearchOpen] = useState(false)

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('eppm:view')) as View | null
    if (saved) setView(saved)
  }, [])
  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('eppm:view', view)
  }, [view])

  const navigate = (v: View) => {
    setView(v)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const render = () => {
    switch (view) {
      case 'dashboard': return <DashboardView onNavigate={navigate} />
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
      default: return <DashboardView onNavigate={navigate} />
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/20 pb-16 lg:pb-0">
      <FloatingNavbar
        view={view}
        onNavigate={navigate}
        onOpenProject={(id) => { setProjectId(id); navigate('gantt') }}
        mobileDrawerOpen={mobileDrawerOpen}
        setMobileDrawerOpen={setMobileDrawerOpen}
      />
      <main className="flex-1 p-4 lg:p-6 pt-2 lg:pt-3">
        <div className="mx-auto max-w-[1600px]">
          <FadeIn key={view}>{render()}</FadeIn>
        </div>
      </main>
      <footer className="mt-auto border-t bg-background/95 px-4 py-2.5 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-1 text-[11px] text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-3">
            <span>© 2025 SmartBuild Enterprise · EPPM v4.2.1</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Primavera P6-class engine</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> All systems operational</span>
            <span className="hidden sm:inline">API &lt;300ms</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Last sync {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </footer>
      <BottomNav
        currentView={view}
        onNavigate={navigate}
        onOpenDrawer={() => setMobileDrawerOpen(true)}
        onTriggerSearch={() => setBottomSearchOpen(true)}
      />
      <GlobalSearch
        open={bottomSearchOpen}
        onOpenChange={setBottomSearchOpen}
        onNavigate={navigate}
        onOpenProject={(id) => { setProjectId(id); navigate('gantt') }}
      />
    </div>
  )
}
