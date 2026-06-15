'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface ModuleData {
  overline: string
  title: string
  description: string
  bullets: string[]
  mockup: React.ReactNode
}

/* ------------------------------------------------------------------ */
/*  UI Mockups (pure CSS/HTML inside a dark container)                */
/* ------------------------------------------------------------------ */

function MaintenanceMockup() {
  return (
    <div className="w-full h-full bg-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col gap-3 overflow-hidden">
      {/* Window bar */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-3 text-[10px] text-slate-400 font-medium tracking-wide">Maintenance Dashboard</span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 shrink-0">
        {[
          { label: 'Open', value: '24', color: 'bg-amber-500' },
          { label: 'In Progress', value: '12', color: 'bg-emerald-500' },
          { label: 'Resolved', value: '89', color: 'bg-slate-500' },
          { label: 'SLA Breach', value: '3', color: 'bg-red-500' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-700/60 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${s.color}`} />
              <span className="text-[9px] text-slate-400 uppercase tracking-wider">{s.label}</span>
            </div>
            <span className="text-sm font-bold text-white">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="flex-1 grid grid-cols-5 gap-2 min-h-0">
        {/* Left: Ticket list */}
        <div className="col-span-2 bg-slate-700/40 rounded-lg p-2 flex flex-col gap-1.5 overflow-hidden">
          <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Recent Tickets</span>
          {[
            { id: 'MT-1042', title: 'HVAC Compressor Failure', status: 'High', color: 'bg-red-500' },
            { id: 'MT-1041', title: 'Elevator Door Stuck', status: 'Medium', color: 'bg-amber-500' },
            { id: 'MT-1040', title: 'Water Leak Floor 3', status: 'Low', color: 'bg-emerald-500' },
            { id: 'MT-1039', title: 'Lighting Flicker Bldg B', status: 'Medium', color: 'bg-amber-500' },
            { id: 'MT-1038', title: 'Fire Alarm Test Due', status: 'High', color: 'bg-red-500' },
          ].map((t) => (
            <div key={t.id} className="bg-slate-800/60 rounded-md p-1.5 flex items-start gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${t.color} mt-0.5 shrink-0`} />
              <div className="min-w-0">
                <div className="text-[9px] text-slate-400">{t.id}</div>
                <div className="text-[10px] text-slate-200 truncate">{t.title}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Map placeholder + work order */}
        <div className="col-span-3 flex flex-col gap-2 min-h-0">
          {/* Dispatch map */}
          <div className="flex-1 bg-slate-700/40 rounded-lg p-2 relative overflow-hidden">
            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Dispatch Map</span>
            <div className="absolute inset-4 top-6">
              {/* Simulated map grid */}
              <div className="w-full h-full grid grid-cols-4 grid-rows-3 gap-0.5 opacity-30">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="bg-slate-500/30 rounded-sm" />
                ))}
              </div>
              {/* Technician pins */}
              <div className="absolute top-[20%] left-[30%] w-2 h-2 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50" />
              <div className="absolute top-[50%] left-[60%] w-2 h-2 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50" />
              <div className="absolute top-[35%] left-[75%] w-2 h-2 bg-amber-400 rounded-full shadow-lg shadow-amber-400/50" />
              <div className="absolute top-[70%] left-[25%] w-2 h-2 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50" />
            </div>
          </div>

          {/* Work order card */}
          <div className="bg-slate-700/40 rounded-lg p-2 flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-amber-400">WO</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] text-slate-200 font-medium">Work Order #WO-0891</div>
              <div className="text-[8px] text-slate-400">Assigned: Rajesh K. • ETA: 45 min</div>
            </div>
            <div className="px-1.5 py-0.5 bg-emerald-500/20 rounded text-[8px] text-emerald-400 font-semibold shrink-0">Dispatched</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TenderMockup() {
  return (
    <div className="w-full h-full bg-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col gap-3 overflow-hidden">
      {/* Window bar */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-3 text-[10px] text-slate-400 font-medium tracking-wide">Tender & Bid Management</span>
      </div>

      {/* Bid package header */}
      <div className="bg-slate-700/50 rounded-lg p-2 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-amber-400">B</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] text-white font-semibold">Commercial Tower HVAC Installation</div>
          <div className="text-[9px] text-slate-400">Bid Package #BP-2024-037 • Closing: Dec 15, 2024</div>
        </div>
        <div className="px-2 py-0.5 bg-amber-500/20 rounded text-[9px] text-amber-400 font-semibold shrink-0">Evaluation</div>
      </div>

      {/* Vendor comparison table */}
      <div className="flex-1 bg-slate-700/40 rounded-lg p-2 overflow-hidden flex flex-col">
        <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Vendor Comparison</span>
        <div className="flex-1 min-h-0">
          {/* Table header */}
          <div className="grid grid-cols-5 gap-1 mb-1">
            {['Vendor', 'Technical', 'Commercial', 'Experience', 'Total'].map((h) => (
              <span key={h} className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider text-center">{h}</span>
            ))}
          </div>
          {/* Table rows */}
          {[
            { name: 'CoolAir Systems', tech: 92, comm: 85, exp: 88, total: 88 },
            { name: 'ClimatePro Ltd', tech: 88, comm: 90, exp: 82, total: 87 },
            { name: 'AirFlow Solutions', tech: 85, comm: 88, exp: 91, total: 88 },
            { name: 'HVAC Masters', tech: 90, comm: 82, exp: 85, total: 86 },
          ].map((v) => (
            <div key={v.name} className={`grid grid-cols-5 gap-1 py-1 border-t border-slate-600/30 ${v.total >= 88 ? 'bg-emerald-500/5' : ''}`}>
              <span className="text-[9px] text-slate-200 font-medium truncate">{v.name}</span>
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-full max-w-[40px] h-1.5 bg-slate-600/50 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${v.tech}%` }} />
                </div>
                <span className="text-[8px] text-slate-300">{v.tech}</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-full max-w-[40px] h-1.5 bg-slate-600/50 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${v.comm}%` }} />
                </div>
                <span className="text-[8px] text-slate-300">{v.comm}</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-full max-w-[40px] h-1.5 bg-slate-600/50 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-400 rounded-full" style={{ width: `${v.exp}%` }} />
                </div>
                <span className="text-[8px] text-slate-300">{v.exp}</span>
              </div>
              <span className={`text-[10px] font-bold text-center ${v.total >= 88 ? 'text-emerald-400' : 'text-slate-300'}`}>{v.total}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Award status bar */}
      <div className="bg-slate-700/40 rounded-lg p-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] text-slate-300">Recommended: CoolAir Systems (Score: 88)</span>
        </div>
        <div className="px-2 py-0.5 bg-emerald-500 rounded text-[9px] text-white font-semibold">Approve Award</div>
      </div>
    </div>
  )
}

function GanttMockup() {
  return (
    <div className="w-full h-full bg-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col gap-3 overflow-hidden">
      {/* Window bar */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-3 text-[10px] text-slate-400 font-medium tracking-wide">Project Schedule — Gantt View</span>
      </div>

      {/* Timeline header */}
      <div className="flex gap-0 shrink-0">
        <div className="w-[35%] border-b border-slate-600/40 pb-1">
          <span className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider">Task</span>
        </div>
        <div className="flex-1 flex border-b border-slate-600/40 pb-1">
          {['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'].map((w) => (
            <div key={w} className="flex-1 text-center text-[8px] text-slate-500">{w}</div>
          ))}
        </div>
      </div>

      {/* Gantt bars */}
      <div className="flex-1 flex flex-col gap-1 min-h-0">
        {[
          { name: 'Foundation', start: 0, width: 25, color: 'bg-emerald-500', critical: true },
          { name: 'Structural Work', start: 20, width: 35, color: 'bg-red-400', critical: true },
          { name: 'MEP Rough-In', start: 40, width: 30, color: 'bg-amber-500', critical: false },
          { name: 'Finishing', start: 60, width: 25, color: 'bg-slate-400', critical: false },
          { name: 'Landscaping', start: 75, width: 20, color: 'bg-emerald-400/60', critical: false },
          { name: 'Inspection', start: 88, width: 12, color: 'bg-amber-400', critical: true },
        ].map((task) => (
          <div key={task.name} className="flex items-center gap-0 h-5">
            <div className="w-[35%] flex items-center gap-1">
              {task.critical && <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />}
              <span className="text-[9px] text-slate-300 truncate">{task.name}</span>
            </div>
            <div className="flex-1 relative h-full">
              {/* Grid lines */}
              <div className="absolute inset-0 flex">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex-1 border-l border-slate-600/20" />
                ))}
              </div>
              {/* Bar */}
              <div
                className={`absolute top-1 h-3 rounded-sm ${task.color} ${task.critical ? 'shadow-sm' : 'opacity-80'}`}
                style={{ left: `${task.start}%`, width: `${task.width}%` }}
              >
                {/* Progress fill inside bar */}
                <div className="h-full bg-white/20 rounded-sm" style={{ width: `${task.critical ? '40' : '70'}%` }} />
              </div>
              {/* Milestone diamond for inspection */}
              {task.name === 'Inspection' && (
                <div
                  className="absolute top-1.5 w-2 h-2 bg-amber-400 rotate-45"
                  style={{ left: `${task.start + task.width}%` }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2 h-1 rounded-sm bg-red-400" />
            <span className="text-[8px] text-slate-400">Critical Path</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-1 rounded-sm bg-amber-500" />
            <span className="text-[8px] text-slate-400">In Progress</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-amber-400 rotate-45" />
            <span className="text-[8px] text-slate-400">Milestone</span>
          </div>
        </div>
        <span className="text-[8px] text-slate-500">Overall: 62% Complete</span>
      </div>
    </div>
  )
}

function ResourceMockup() {
  return (
    <div className="w-full h-full bg-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col gap-3 overflow-hidden">
      {/* Window bar */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-3 text-[10px] text-slate-400 font-medium tracking-wide">Resource & Workforce</span>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-2 min-h-0">
        {/* Crew allocation grid */}
        <div className="bg-slate-700/40 rounded-lg p-2 flex flex-col overflow-hidden">
          <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Crew Allocation</span>
          <div className="flex-1 flex flex-col gap-1 overflow-hidden">
            {[
              { crew: 'Team Alpha', proj: 'Tower A', utilization: 92, color: 'bg-emerald-500' },
              { crew: 'Team Bravo', proj: 'Tower B', utilization: 78, color: 'bg-emerald-400' },
              { crew: 'Team Charlie', proj: 'Tower A', utilization: 65, color: 'bg-amber-500' },
              { crew: 'Team Delta', proj: 'Parking', utilization: 45, color: 'bg-slate-400' },
              { crew: 'Team Echo', proj: 'Tower C', utilization: 88, color: 'bg-emerald-500' },
            ].map((c) => (
              <div key={c.crew} className="bg-slate-800/50 rounded p-1.5">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[8px] text-slate-300 font-medium">{c.crew}</span>
                  <span className={`text-[8px] font-bold ${c.utilization > 85 ? 'text-emerald-400' : c.utilization > 60 ? 'text-amber-400' : 'text-slate-400'}`}>{c.utilization}%</span>
                </div>
                <div className="w-full h-1 bg-slate-600/50 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${c.color}`} style={{ width: `${c.utilization}%` }} />
                </div>
                <span className="text-[7px] text-slate-500">{c.proj}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Equipment status */}
        <div className="bg-slate-700/40 rounded-lg p-2 flex flex-col overflow-hidden">
          <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Equipment</span>
          <div className="flex-1 grid grid-cols-2 gap-1.5 content-start overflow-hidden">
            {[
              { name: 'Crane 01', status: 'Active', icon: '🏗', color: 'bg-emerald-500/20 text-emerald-400' },
              { name: 'Crane 02', status: 'Maintenance', icon: '🔧', color: 'bg-amber-500/20 text-amber-400' },
              { name: 'Excavator', status: 'Active', icon: '⛏', color: 'bg-emerald-500/20 text-emerald-400' },
              { name: 'Mixer Truck', status: 'Standby', icon: '🚛', color: 'bg-slate-500/20 text-slate-400' },
              { name: 'Generator', status: 'Active', icon: '⚡', color: 'bg-emerald-500/20 text-emerald-400' },
              { name: 'Compactor', status: 'Active', icon: '⚙', color: 'bg-emerald-500/20 text-emerald-400' },
            ].map((eq) => (
              <div key={eq.name} className={`${eq.color} rounded-lg p-1.5 text-center`}>
                <span className="text-sm">{eq.icon}</span>
                <div className="text-[8px] font-medium mt-0.5">{eq.name}</div>
                <div className="text-[7px] opacity-70">{eq.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Labour chart */}
        <div className="bg-slate-700/40 rounded-lg p-2 flex flex-col overflow-hidden">
          <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Labour Utilization</span>
          <div className="flex-1 flex items-end gap-1.5 pb-3">
            {[
              { label: 'Mon', value: 88 },
              { label: 'Tue', value: 95 },
              { label: 'Wed', value: 72 },
              { label: 'Thu', value: 90 },
              { label: 'Fri', value: 85 },
              { label: 'Sat', value: 40 },
            ].map((d) => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="w-full bg-slate-600/30 rounded-sm relative" style={{ height: '100%' }}>
                  <div
                    className={`absolute bottom-0 w-full rounded-sm ${d.value > 85 ? 'bg-emerald-500' : d.value > 60 ? 'bg-amber-500' : 'bg-slate-500'}`}
                    style={{ height: `${d.value}%` }}
                  />
                </div>
                <span className="text-[7px] text-slate-500">{d.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-auto flex items-center justify-between pt-1 border-t border-slate-600/30">
            <span className="text-[8px] text-slate-400">Avg: 78%</span>
            <span className="text-[8px] text-emerald-400 font-semibold">+5% vs last week</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Module Block                                                       */
/* ------------------------------------------------------------------ */

function ModuleBlock({
  module,
  index,
}: {
  module: ModuleData
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const isReversed = index % 2 === 1
  const bgClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50'

  const imageVariants = {
    hidden: { opacity: 0, x: isReversed ? 60 : -60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } },
  }

  const textVariants = {
    hidden: { opacity: 0, x: isReversed ? -60 : 60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut', delay: 0.15 } },
  }

  return (
    <div className={`${bgClass}`}>
      <div
        ref={ref}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28"
      >
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center overflow-hidden ${isReversed ? 'lg:[direction:rtl]' : ''}`}>
          {/* Image Side */}
          <motion.div
            className={isReversed ? 'lg:order-2' : ''}
            variants={imageVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <div className="aspect-video lg:aspect-[16/10] w-full">
              {module.mockup}
            </div>
          </motion.div>

          {/* Text Side */}
          <motion.div
            className={isReversed ? 'lg:order-1' : ''}
            variants={textVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600 mb-4">
              {module.overline}
            </p>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
              {module.title}
            </h3>
            <p className="text-gray-500 text-base leading-relaxed mb-6">
              {module.description}
            </p>
            <ul className="space-y-3 mb-8">
              {module.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              className="rounded-lg text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 group gap-2"
            >
              Learn More
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Export                                                        */
/* ------------------------------------------------------------------ */

const modules: ModuleData[] = [
  {
    overline: 'Maintenance Management',
    title: 'Maintenance Management Made Simple',
    description:
      'Handle every maintenance operation from complaint intake to resolution. Manage work orders, AMC contracts, preventive maintenance schedules, and technician dispatch from one powerful platform.',
    bullets: [
      'Complaint & ticket management with WhatsApp integration',
      'Smart dispatch with real-time technician tracking',
      'Automated preventive maintenance scheduling',
      'SLA monitoring and escalation workflows',
    ],
    mockup: <MaintenanceMockup />,
  },
  {
    overline: 'Tender & Bid Management',
    title: 'Win More Projects with Smarter Bidding',
    description:
      'Streamline your entire tender lifecycle. Create bid packages, invite vendors, evaluate submissions, and award contracts — all with full transparency and audit trails.',
    bullets: [
      'Automated bid package creation and distribution',
      'Multi-criteria technical and commercial evaluation',
      'Side-by-side vendor comparison and ranking',
      'Integrated contract award and approval workflows',
    ],
    mockup: <TenderMockup />,
  },
  {
    overline: 'Scheduling & Gantt',
    title: 'Master Your Project Schedule',
    description:
      'Build comprehensive project schedules with interactive Gantt charts, critical path analysis, lookahead planning, and real-time progress tracking. Never miss a milestone again.',
    bullets: [
      'Interactive Gantt charts with drag-and-drop',
      'Critical path analysis and float calculation',
      'Lookahead planning for next 2-4 weeks',
      'Baseline comparison and variance tracking',
    ],
    mockup: <GanttMockup />,
  },
  {
    overline: 'Resource & Workforce',
    title: 'Optimize Every Resource',
    description:
      'Allocate crews, track equipment, plan materials, and forecast resource needs. SmartBuild gives you complete visibility into your workforce and asset utilization.',
    bullets: [
      'Real-time crew and equipment allocation',
      'Labour utilization and productivity tracking',
      'Resource forecasting and demand planning',
      'Equipment maintenance scheduling integration',
    ],
    mockup: <ResourceMockup />,
  },
]

export function ModuleShowcase() {
  return (
    <section className="py-0" id="modules">
      {modules.map((module, index) => (
        <ModuleBlock key={module.overline} module={module} index={index} />
      ))}
    </section>
  )
}