'use client';

import { motion } from 'framer-motion';
import {
  Bell,
  MapPin,
  Camera,
  ClipboardList,
  Receipt,
  WifiOff,
  Smartphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Instant alerts for task updates, approvals, and safety warnings.',
  },
  {
    icon: MapPin,
    title: 'GPS Attendance',
    description: 'Geofenced clock-in/out with automated timesheet generation.',
  },
  {
    icon: Camera,
    title: 'Photo Docs',
    description: 'Capture, annotate, and attach photos directly to project records.',
  },
  {
    icon: ClipboardList,
    title: 'Daily Reports',
    description: 'Complete daily logs from the field with offline sync.',
  },
  {
    icon: Receipt,
    title: 'Expense Tracking',
    description: 'Submit receipts and track project expenses on the go.',
  },
  {
    icon: WifiOff,
    title: 'Offline Mode',
    description: 'Full functionality without connectivity. Auto-syncs when back online.',
  },
];

const phoneProjects = [
  { name: 'Riverside Tower', progress: 72 },
  { name: 'Marina Complex', progress: 45 },
  { name: 'Green Park Res.', progress: 88 },
];

function IPhoneMockup() {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      className="relative mx-auto w-[280px] sm:w-[300px]"
    >
      {/* Phone Frame */}
      <div className="relative bg-black rounded-[40px] p-[10px] shadow-2xl shadow-black/30">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-black rounded-b-[18px] z-20" />

        {/* Screen */}
        <div className="relative bg-white rounded-[32px] overflow-hidden">
          {/* Status Bar */}
          <div className="bg-[#ff5201] px-6 pt-10 pb-4">
            <div className="flex items-center justify-between text-white text-[10px] font-medium mb-3">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-3.5 h-2 border border-white/60 rounded-sm relative">
                  <div className="absolute inset-0.5 bg-white/80 rounded-[1px]" style={{ width: '70%' }} />
                </div>
              </div>
            </div>
            <p className="text-white/70 text-[10px]">Good morning,</p>
            <p className="text-white font-bold text-sm">Alex Chen</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-4 -mt-3">
            {[
              { label: 'Active', value: '12', bg: 'bg-[#ff5201]/10', text: 'text-[#ff5201]' },
              { label: 'On Track', value: '9', bg: 'bg-emerald-50', text: 'text-emerald-600' },
              { label: 'Alerts', value: '3', bg: 'bg-amber-50', text: 'text-amber-600' },
            ].map((stat) => (
              <div key={stat.label} className={cn('rounded-lg p-2 text-center', stat.bg)}>
                <p className={cn('text-base font-bold', stat.text)}>{stat.value}</p>
                <p className="text-[9px] text-black/40">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Projects */}
          <div className="px-4 py-3">
            <p className="text-[10px] font-semibold text-black/50 uppercase tracking-wider mb-2">
              My Projects
            </p>
            <div className="space-y-2.5">
              {phoneProjects.map((project) => (
                <div key={project.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium text-black/80">{project.name}</span>
                    <span className="text-[10px] font-semibold text-[#ff5201]">{project.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#ff5201]"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Nav */}
          <div className="border-t border-black/[0.06] px-4 py-2.5 flex items-center justify-around">
            {['Home', 'Projects', 'Tasks', 'More'].map((tab, i) => (
              <div key={tab} className="flex flex-col items-center gap-0.5">
                <div
                  className={cn(
                    'w-4 h-4 rounded-sm',
                    i === 0 ? 'bg-[#ff5201]' : 'bg-black/15'
                  )}
                />
                <span
                  className={cn(
                    'text-[8px]',
                    i === 0 ? 'text-[#ff5201] font-semibold' : 'text-black/30'
                  )}
                >
                  {tab}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subtle glow */}
      <div className="absolute -inset-4 bg-[#ff5201]/5 rounded-[50px] blur-xl -z-10" />
    </motion.div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export function MobileApp() {
  return (
    <section className="bg-[#f5f1ed] py-20 md:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 md:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black tracking-tight">
            Manage Projects From Anywhere
          </h2>
          <p className="mt-4 text-base sm:text-lg text-black/50 max-w-2xl mx-auto">
            Powerful mobile apps for iOS and Android that keep your entire team connected on the go.
          </p>
        </motion.div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex justify-center lg:justify-end order-2 lg:order-1"
          >
            <IPhoneMockup />
          </motion.div>

          {/* Right: Feature Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature) => (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  className="rounded-xl bg-white border border-black/[0.06] p-4 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="w-9 h-9 rounded-lg bg-black flex items-center justify-center mb-3">
                    <feature.icon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-black mb-1">{feature.title}</h3>
                  <p className="text-xs text-black/40 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>

            {/* App Store Badges */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-8 flex items-center gap-4"
            >
              {/* App Store Badge */}
              <div className="flex items-center gap-2 bg-black rounded-lg px-4 py-2.5 cursor-pointer hover:bg-black/90 transition-colors">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div>
                  <p className="text-[9px] text-white/60 leading-none">Download on the</p>
                  <p className="text-xs text-white font-semibold leading-tight">App Store</p>
                </div>
              </div>

              {/* Google Play Badge */}
              <div className="flex items-center gap-2 bg-black rounded-lg px-4 py-2.5 cursor-pointer hover:bg-black/90 transition-colors">
                <Smartphone className="w-6 h-6 text-white" />
                <div>
                  <p className="text-[9px] text-white/60 leading-none">Get it on</p>
                  <p className="text-xs text-white font-semibold leading-tight">Google Play</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}