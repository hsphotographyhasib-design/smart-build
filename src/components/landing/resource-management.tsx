'use client';

import { motion } from 'framer-motion';
import {
  Users,
  Wrench,
  TrendingUp,
  Activity,
  Truck,
  Target,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Users,
    title: 'Labour Planning',
    description: 'Plan and allocate workforce across projects with skill-based matching and availability tracking.',
  },
  {
    icon: Wrench,
    title: 'Equipment Tracking',
    description: 'Monitor equipment location, usage hours, and maintenance schedules in real time.',
  },
  {
    icon: TrendingUp,
    title: 'Resource Forecasting',
    description: 'AI-powered forecasting predicts resource needs based on project timelines and historical data.',
  },
  {
    icon: Activity,
    title: 'Productivity Monitoring',
    description: 'Track output per worker and crew with automated KPI dashboards and benchmarks.',
  },
  {
    icon: Truck,
    title: 'Vehicle Management',
    description: 'Fleet tracking, fuel logs, and driver assignments consolidated in one place.',
  },
  {
    icon: Target,
    title: 'Skill Matching',
    description: 'Match the right workers to the right tasks based on certifications, experience, and availability.',
  },
];

const utilizationData = [
  { label: 'Electricians', value: 92, color: '#ff5201' },
  { label: 'Carpenters', value: 78, color: '#ff7a3d' },
  { label: 'Plumbers', value: 85, color: '#ff9966' },
  { label: 'Welders', value: 65, color: '#ffb399' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

function DonutChart({ percentage }: { percentage: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="12"
          />
          <motion.circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="#ff5201"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset: offset }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{percentage}%</span>
          <span className="text-[10px] text-white/50 uppercase tracking-wider">Avg Utilization</span>
        </div>
      </div>
    </div>
  );
}

export function ResourceManagement() {
  return (
    <section className="bg-[#000000] py-20 md:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 md:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Smart Resource Management
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/60 max-w-2xl mx-auto">
            Optimize workforce, equipment, and materials across every job site with data-driven insights.
          </p>
        </motion.div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Left: Feature Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col gap-3"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className={cn(
                  'group relative rounded-lg border border-white/10 bg-white/[0.03] p-4 transition-all duration-300 cursor-default',
                  'hover:bg-white/[0.06] hover:border-white/15'
                )}
              >
                {/* Orange left border on hover */}
                <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg bg-[#ff5201] scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />
                <div className="flex items-start gap-4 pl-2">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center group-hover:bg-[#ff5201]/10 transition-colors duration-300">
                    <feature.icon className="w-5 h-5 text-white/60 group-hover:text-[#ff5201] transition-colors duration-300" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white group-hover:text-white transition-colors">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-xs text-white/40 leading-relaxed group-hover:text-white/55 transition-colors">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Right: Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col gap-6"
          >
            {/* Utilization Bars Card */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-semibold text-white">Team Utilization</h3>
                  <p className="text-xs text-white/40 mt-0.5">Current sprint — this week</p>
                </div>
                <span className="text-xs text-white/30 bg-white/[0.06] px-2.5 py-1 rounded-md">
                  Live
                </span>
              </div>

              <div className="space-y-4">
                {utilizationData.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-white/70">{item.label}</span>
                      <span className="text-xs font-semibold text-white">{item.value}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.color }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.4 + index * 0.1 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Donut Chart Card */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 flex items-center gap-6">
              <DonutChart percentage={87} />
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-2 h-2 rounded-full bg-[#ff5201]" />
                    <span className="text-xs text-white/60">On-Site</span>
                  </div>
                  <span className="text-lg font-bold text-white">312</span>
                  <span className="text-xs text-white/40 ml-1">workers</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-2 h-2 rounded-full bg-white/20" />
                    <span className="text-xs text-white/60">Available</span>
                  </div>
                  <span className="text-lg font-bold text-white">47</span>
                  <span className="text-xs text-white/40 ml-1">workers</span>
                </div>
                <div className="text-[11px] text-white/30 pt-1 border-t border-white/5">
                  Updated 5 min ago
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-14 md:mt-20 text-center"
        >
          <Button
            variant="outline"
            className="border-[#ff5201] text-[#ff5201] hover:bg-[#ff5201] hover:text-white transition-all duration-300 rounded-lg px-6 py-2.5 text-sm"
          >
            Explore Resources
            <ChevronRight className="ml-1.5 w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}