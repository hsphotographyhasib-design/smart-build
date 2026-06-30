'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/eppm/sidebar'
import { TopBar } from '@/components/eppm/topbar'
import { DashboardView } from '@/components/eppm/views/dashboard-view'
import { ProjectsView } from '@/components/eppm/views/projects-view'
import { PortfoliosView } from '@/components/eppm/views/portfolios-view'
import { ProgramsView } from '@/components/eppm/views/programs-view'
import { GanttView } from '@/components/eppm/views/gantt-view'
import { ActivitiesView } from '@/components/eppm/views/activities-view'
import { CriticalPathView } from '@/components/eppm/views/critical-path-view'
import { ResourcesView } from '@/components/eppm/views/resources-view'
import { CostsView } from '@/components/eppm/views/costs-view'
import { EvmView } from '@/components/eppm/views/evm-view'
import { RisksView } from '@/components/eppm/views/risks-view'
import { BaselinesView } from '@/components/eppm/views/baselines-view'
import { ChangesView } from '@/components/eppm/views/changes-view'
import { LookaheadView } from '@/components/eppm/views/lookahead-view'
import { DocumentsView } from '@/components/eppm/views/documents-view'
import { ReportsView } from '@/components/eppm/views/reports-view'
import { AiPlannerView } from '@/components/eppm/views/ai-planner-view'
import { AdminView } from '@/components/eppm/views/admin-view'
import { WbsView } from '@/components/eppm/views/wbs-view'
import type { View } from '@/lib/eppm'

export default function Home() {
  const [view, setView] = useState<View>('dashboard')
  const [collapsed, setCollapsed] = useState(false)
  const [projectId, setProjectId] = useState<string | null>(null)

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
      case 'wbs': return <WbsView projectId={projectId} onNavigate={navigate} />
      case 'activities': return <ActivitiesView onNavigate={navigate} />
      case 'gantt': return <GanttView projectId={projectId} setProjectId={setProjectId} onNavigate={navigate} />
      case 'critical-path': return <CriticalPathView onNavigate={navigate} />
      case 'resources': return <ResourcesView onNavigate={navigate} />
      case 'costs': return <CostsView onNavigate={navigate} />
      case 'evm': return <EvmView onNavigate={navigate} />
      case 'baselines': return <BaselinesView onNavigate={navigate} />
      case 'risks': return <RisksView onNavigate={navigate} />
      case 'changes': return <ChangesView onNavigate={navigate} />
      case 'lookahead': return <LookaheadView onNavigate={navigate} />
      case 'documents': return <DocumentsView onNavigate={navigate} />
      case 'reports': return <ReportsView onNavigate={navigate} />
      case 'ai-planner': return <AiPlannerView onNavigate={navigate} />
      case 'admin': return <AdminView onNavigate={navigate} />
      default: return <DashboardView onNavigate={navigate} />
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/20">
      <Sidebar view={view} onNavigate={navigate} collapsed={collapsed} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar view={view} onToggleSidebar={() => setCollapsed(c => !c)} />
        <main className="flex-1 p-4 lg:p-6">
          <div className="mx-auto max-w-[1600px]">{render()}</div>
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
      </div>
    </div>
  )
}
