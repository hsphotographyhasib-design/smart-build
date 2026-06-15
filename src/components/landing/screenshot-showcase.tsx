'use client'

import { motion } from 'framer-motion'

function DesktopMockup() {
  return (
    <div className="rounded-2xl border-8 border-gray-800 bg-gray-900 overflow-hidden shadow-2xl">
      {/* Top bar / browser chrome */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 border-b border-gray-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
        </div>
        <div className="flex-1 mx-8">
          <div className="bg-gray-700 rounded-md px-3 py-1 text-xs text-gray-400 text-center">
            app.smartbuild.com/dashboard
          </div>
        </div>
      </div>

      {/* Dashboard content */}
      <div className="flex min-h-[420px]">
        {/* Sidebar */}
        <div className="w-48 bg-gray-800 border-r border-gray-700 p-4 flex flex-col gap-5 shrink-0">
          {/* Logo */}
          <div className="flex items-center gap-2 px-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
            <span className="text-white font-bold text-sm tracking-tight">SMARTBUILD</span>
          </div>

          {/* Nav items */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-amber-500/10 text-amber-400">
              <div className="w-4 h-4 rounded bg-amber-500/30" />
              <span className="text-xs font-medium">Dashboard</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-gray-300">
              <div className="w-4 h-4 rounded bg-gray-600" />
              <span className="text-xs font-medium">Projects</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400">
              <div className="w-4 h-4 rounded bg-gray-600" />
              <span className="text-xs font-medium">Resources</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400">
              <div className="w-4 h-4 rounded bg-gray-600" />
              <span className="text-xs font-medium">Maintenance</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400">
              <div className="w-4 h-4 rounded bg-gray-600" />
              <span className="text-xs font-medium">Tenders</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400">
              <div className="w-4 h-4 rounded bg-gray-600" />
              <span className="text-xs font-medium">Reports</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400">
              <div className="w-4 h-4 rounded bg-gray-600" />
              <span className="text-xs font-medium">Team</span>
            </div>
          </div>

          {/* Bottom section */}
          <div className="mt-auto">
            <div className="border-t border-gray-700 pt-4">
              <div className="flex items-center gap-2 px-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[10px] font-bold text-white">
                  AR
                </div>
                <div>
                  <div className="text-[10px] text-white font-medium">Ahmad R.</div>
                  <div className="text-[9px] text-gray-500">Admin</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 bg-gray-50 p-6 overflow-hidden">
          {/* Top header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-gray-900 font-semibold text-sm">Project Dashboard</div>
              <div className="text-gray-500 text-[10px] mt-0.5">Welcome back, Ahmad. Here&apos;s your overview.</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-[10px] text-gray-500">
                Last 30 days ▾
              </div>
              <div className="px-3 py-1.5 bg-amber-500 rounded-lg text-[10px] text-white font-medium">
                + New Project
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-[10px] text-gray-500 font-medium">Active Projects</div>
                <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
                  <div className="w-3 h-3 rounded bg-amber-500" />
                </div>
              </div>
              <div className="text-xl font-bold text-gray-900 mt-2">24</div>
              <div className="text-[10px] text-emerald-600 font-medium mt-1">↑ 12% vs last month</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-[10px] text-gray-500 font-medium">On-Time Delivery</div>
                <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <div className="w-3 h-3 rounded bg-emerald-500" />
                </div>
              </div>
              <div className="text-xl font-bold text-gray-900 mt-2">94.2%</div>
              <div className="text-[10px] text-emerald-600 font-medium mt-1">↑ 5.3% vs last month</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-[10px] text-gray-500 font-medium">Budget Utilization</div>
                <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                  <div className="w-3 h-3 rounded bg-blue-500" />
                </div>
              </div>
              <div className="text-xl font-bold text-gray-900 mt-2">78.5%</div>
              <div className="text-[10px] text-amber-600 font-medium mt-1">→ On track</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-[10px] text-gray-500 font-medium">Open Work Orders</div>
                <div className="w-6 h-6 rounded-lg bg-rose-100 flex items-center justify-center">
                  <div className="w-3 h-3 rounded bg-rose-500" />
                </div>
              </div>
              <div className="text-xl font-bold text-gray-900 mt-2">17</div>
              <div className="text-[10px] text-rose-600 font-medium mt-1">↓ 8 new today</div>
            </div>
          </div>

          {/* Chart + Table row */}
          <div className="grid grid-cols-5 gap-3">
            {/* Chart area */}
            <div className="col-span-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-semibold text-gray-900">Project Progress</div>
                <div className="flex gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-[9px] text-gray-500">Planned</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[9px] text-gray-500">Actual</span>
                  </div>
                </div>
              </div>
              {/* Fake bar chart */}
              <div className="flex items-end gap-2 h-28">
                {[65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95, 70].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col gap-0.5 items-center">
                    <div className="w-full rounded-t-sm bg-amber-400/80" style={{ height: `${h * 0.9}px` }} />
                    <div className="w-full rounded-t-sm bg-emerald-500/80" style={{ height: `${h * 0.7}px` }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[8px] text-gray-400">Jan</span>
                <span className="text-[8px] text-gray-400">Mar</span>
                <span className="text-[8px] text-gray-400">Jun</span>
                <span className="text-[8px] text-gray-400">Sep</span>
                <span className="text-[8px] text-gray-400">Dec</span>
              </div>
            </div>

            {/* Table */}
            <div className="col-span-2 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="text-xs font-semibold text-gray-900 mb-3">Recent Activity</div>
              <div className="flex flex-col gap-2">
                {[
                  { dot: 'bg-emerald-500', label: 'Tower A - Phase 2 completed', time: '2h ago' },
                  { dot: 'bg-amber-500', label: 'PO-4521 approved', time: '4h ago' },
                  { dot: 'bg-blue-500', label: 'New tender submitted', time: '6h ago' },
                  { dot: 'bg-rose-500', label: 'WO-882 escalated', time: '8h ago' },
                  { dot: 'bg-emerald-500', label: 'Inspection passed - Bldg 3', time: '1d ago' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${item.dot} shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-gray-700 truncate">{item.label}</div>
                    </div>
                    <div className="text-[9px] text-gray-400 shrink-0">{item.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PhoneMockup({ variant }: { variant: 'dashboard' | 'workorders' }) {
  return (
    <div className="rounded-[2rem] border-4 border-gray-800 bg-gray-900 overflow-hidden shadow-2xl aspect-[9/19] flex flex-col">
      {/* Notch */}
      <div className="flex justify-center pt-2 pb-1 bg-gray-900 shrink-0">
        <div className="w-16 h-4 rounded-full bg-gray-700" />
      </div>

      {variant === 'dashboard' ? (
        /* Mobile Dashboard */
        <div className="flex-1 bg-gray-50 p-3 flex flex-col gap-2.5 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-gray-900">Dashboard</div>
              <div className="text-[8px] text-gray-500">Good morning, Ahmad</div>
            </div>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[8px] font-bold text-white">
              AR
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white rounded-lg p-2.5 border border-gray-100">
              <div className="text-[8px] text-gray-500">Projects</div>
              <div className="text-base font-bold text-gray-900">24</div>
              <div className="mt-1 w-full bg-gray-100 rounded-full h-1">
                <div className="bg-amber-500 h-1 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
            <div className="bg-white rounded-lg p-2.5 border border-gray-100">
              <div className="text-[8px] text-gray-500">On-Time</div>
              <div className="text-base font-bold text-emerald-600">94%</div>
              <div className="mt-1 w-full bg-gray-100 rounded-full h-1">
                <div className="bg-emerald-500 h-1 rounded-full" style={{ width: '94%' }} />
              </div>
            </div>
            <div className="bg-white rounded-lg p-2.5 border border-gray-100">
              <div className="text-[8px] text-gray-500">Budget</div>
              <div className="text-base font-bold text-gray-900">78%</div>
              <div className="mt-1 w-full bg-gray-100 rounded-full h-1">
                <div className="bg-blue-500 h-1 rounded-full" style={{ width: '78%' }} />
              </div>
            </div>
            <div className="bg-white rounded-lg p-2.5 border border-gray-100">
              <div className="text-[8px] text-gray-500">Work Orders</div>
              <div className="text-base font-bold text-gray-900">17</div>
              <div className="mt-1 w-full bg-gray-100 rounded-full h-1">
                <div className="bg-rose-500 h-1 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>
          </div>

          {/* Mini chart */}
          <div className="bg-white rounded-lg p-2.5 border border-gray-100 flex-1">
            <div className="text-[9px] font-semibold text-gray-700 mb-2">Weekly Progress</div>
            <div className="flex items-end gap-1 h-16">
              {[40, 60, 35, 80, 55, 90, 70].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col gap-0.5">
                  <div className="w-full rounded-sm bg-amber-400/80" style={{ height: `${h * 0.7}px` }} />
                  <div className="w-full rounded-sm bg-emerald-400/60" style={{ height: `${h * 0.5}px` }} />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-1.5">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <span key={i} className="text-[7px] text-gray-400 w-1 text-center">{d}</span>
              ))}
            </div>
          </div>

          {/* Bottom nav */}
          <div className="flex items-center justify-around bg-white border-t border-gray-200 py-2 -mx-3 mt-auto shrink-0">
            {['home', 'projects', 'plus', 'tasks', 'profile'].map((icon, i) => (
              <div key={i} className="w-5 h-5 rounded bg-gray-300" />
            ))}
          </div>
        </div>
      ) : (
        /* Work Orders List */
        <div className="flex-1 bg-gray-50 p-3 flex flex-col gap-2.5 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold text-gray-900">Work Orders</div>
            <div className="px-2 py-1 bg-amber-500 rounded-md text-[8px] text-white font-medium">+ New</div>
          </div>

          {/* Filter pills */}
          <div className="flex gap-1.5">
            {['All', 'Open', 'In Progress', 'Done'].map((filter, i) => (
              <div key={filter} className={`px-2 py-1 rounded-full text-[8px] font-medium ${
                i === 0 ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 border border-gray-200'
              }`}>
                {filter}
              </div>
            ))}
          </div>

          {/* Work order cards */}
          <div className="flex flex-col gap-2 flex-1">
            {[
              { id: 'WO-882', title: 'HVAC Repair - Floor 12', priority: 'High', status: 'In Progress', color: 'bg-amber-500' },
              { id: 'WO-881', title: 'Elevator Maintenance B', priority: 'Medium', status: 'Open', color: 'bg-blue-500' },
              { id: 'WO-880', title: 'Plumbing Fix - Block C', priority: 'High', status: 'Open', color: 'bg-amber-500' },
              { id: 'WO-879', title: 'Fire Alarm Inspection', priority: 'Low', status: 'Completed', color: 'bg-emerald-500' },
              { id: 'WO-878', title: 'Parking Lot Lighting', priority: 'Medium', status: 'In Progress', color: 'bg-blue-500' },
            ].map((wo) => (
              <div key={wo.id} className="bg-white rounded-lg p-2.5 border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${wo.color}`} />
                    <span className="text-[9px] font-semibold text-gray-900">{wo.id}</span>
                  </div>
                  <span className={`text-[7px] px-1.5 py-0.5 rounded-full font-medium ${
                    wo.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                    wo.status === 'In Progress' ? 'bg-amber-50 text-amber-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {wo.status}
                  </span>
                </div>
                <div className="text-[10px] text-gray-700">{wo.title}</div>
                <div className="text-[8px] text-gray-400 mt-1">{wo.priority} Priority</div>
              </div>
            ))}
          </div>

          {/* Bottom nav */}
          <div className="flex items-center justify-around bg-white border-t border-gray-200 py-2 -mx-3 mt-auto shrink-0">
            {['home', 'projects', 'plus', 'tasks', 'profile'].map((icon, i) => (
              <div key={i} className="w-5 h-5 rounded bg-gray-300" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function ScreenshotShowcase() {
  return (
    <section className="bg-white py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            See SmartBuild in Action
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
            A powerful platform that works beautifully across all your devices.
          </p>
        </motion.div>

        {/* Desktop Mockup */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 50, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <DesktopMockup />
        </motion.div>

        {/* Mobile Mockups */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-lg mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="flex flex-col items-center">
            <div className="w-full max-w-[220px]">
              <PhoneMockup variant="dashboard" />
            </div>
            <p className="mt-4 text-sm font-medium text-gray-500">Dashboard</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-full max-w-[220px]">
              <PhoneMockup variant="workorders" />
            </div>
            <p className="mt-4 text-sm font-medium text-gray-500">Work Orders</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}