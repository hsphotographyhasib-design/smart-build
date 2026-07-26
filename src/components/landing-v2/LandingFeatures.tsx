'use client'

import { motion } from 'framer-motion'
import {
  LayoutDashboard, FolderKanban, GanttChart, DollarSign, Users,
  ShieldCheck, FileText, Truck, Wrench, HardHat, BarChart3,
  Building2, CalendarClock, AlertTriangle, CheckCircle2, ClipboardList, Cpu
} from 'lucide-react'

type ModuleItem = {
  icon: React.ElementType
  title: string
  description: string
  color: string
}

const MODULES: ModuleItem[] = [
  { icon: LayoutDashboard, title: 'Executive Dashboard', description: 'Real-time KPIs, portfolio health scores, and decision-ready insights across all projects.', color: 'text-brand-orange bg-brand-orange/10' },
  { icon: FolderKanban, title: 'Project Management', description: 'Full lifecycle management from initiation through closeout with milestone tracking.', color: 'text-brand-blue bg-brand-blue/10' },
  { icon: GanttChart, title: 'Scheduling & CPM', description: 'Critical Path Method analysis with resource-loaded schedules and what-if scenarios.', color: 'text-emerald-600 bg-emerald-500/10' },
  { icon: DollarSign, title: 'Cost Management', description: 'Budget tracking, earned value analysis, cost forecasting, and change order management.', color: 'text-amber-600 bg-amber-500/10' },
  { icon: Users, title: 'Workforce Management', description: 'Labor planning, timesheet tracking, competency mapping, and productivity analytics.', color: 'text-violet-600 bg-violet-500/10' },
  { icon: ShieldCheck, title: 'HSE Management', description: 'Safety observations, incident tracking, permit-to-work, and compliance reporting.', color: 'text-red-600 bg-red-500/10' },
  { icon: FileText, title: 'Document Control', description: 'Centralized document management with version control, approvals, and transmittals.', color: 'text-brand-orange bg-brand-orange/10' },
  { icon: Truck, title: 'Procurement', description: 'End-to-end procurement from RFQ to PO, vendor management, and material tracking.', color: 'text-brand-blue bg-brand-blue/10' },
  { icon: Wrench, title: 'Equipment & Assets', description: 'Fleet management, preventive maintenance scheduling, and asset lifecycle tracking.', color: 'text-emerald-600 bg-emerald-500/10' },
  { icon: HardHat, title: 'Quality Management', description: 'Inspection checklists, NCR management, quality audits, and punch list tracking.', color: 'text-amber-600 bg-amber-500/10' },
  { icon: BarChart3, title: 'Reporting & Analytics', description: 'Custom report builder, real-time dashboards, and automated scheduled reports.', color: 'text-violet-600 bg-violet-500/10' },
  { icon: Building2, title: 'Facility Management', description: 'Post-construction maintenance, work orders, space planning, and asset registers.', color: 'text-red-600 bg-red-500/10' },
  { icon: CalendarClock, title: 'Lookahead Planning', description: '4-week and 12-week lookahead scheduling with constraint analysis and drag planning.', color: 'text-brand-orange bg-brand-orange/10' },
  { icon: AlertTriangle, title: 'Risk Management', description: 'Risk registers, probability-impact matrices, mitigation plans, and risk heatmaps.', color: 'text-brand-blue bg-brand-blue/10' },
  { icon: CheckCircle2, title: 'Commissioning', description: 'Systematic commissioning workflows, checklists, and handover documentation.', color: 'text-emerald-600 bg-emerald-500/10' },
  { icon: ClipboardList, title: 'Claims & Variations', description: 'Variation tracking, claim documentation, quantum analysis, and dispute management.', color: 'text-amber-600 bg-amber-500/10' },
  { icon: Cpu, title: 'AI-Powered Insights', description: 'Predictive schedule analysis, cost forecasting, and intelligent document processing.', color: 'text-violet-600 bg-violet-500/10' },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export function LandingFeatures() {
  return (
    <section id="features" className="section-landing bg-bg-dot-pattern" aria-label="Platform Features">
      <div className="container-landing">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-14 lg:mb-20">
          <motion.span
            className="inline-block text-sm font-semibold text-brand-orange uppercase tracking-widest mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            17 Integrated Modules
          </motion.span>
          <motion.h2
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
          >
            Everything you need.{' '}
            <span className="text-gradient">Nothing you don&apos;t.</span>
          </motion.h2>
          <motion.p
            className="mt-4 text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            One platform replaces dozens of disconnected tools. Every module
            works together, sharing data in real-time for seamless project delivery.
          </motion.p>
        </div>

        {/* Module grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {MODULES.map((mod) => (
            <motion.article
              key={mod.title}
              variants={itemVariants}
              className="group relative rounded-xl border border-border bg-card p-5 card-lift"
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${mod.color} mb-4`}>
                <mod.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-display text-base font-semibold mb-2">{mod.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{mod.description}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
