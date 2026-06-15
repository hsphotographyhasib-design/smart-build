'use client';

import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  Banknote,
  BarChart3,
  FileEdit,
  LineChart,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: DollarSign,
    title: 'Budget Tracking',
    description: 'Set project budgets and monitor spending in real time across all cost categories.',
  },
  {
    icon: TrendingUp,
    title: 'Profitability Analysis',
    description: 'Instant margin calculations per project, phase, and trade with drill-down capability.',
  },
  {
    icon: Banknote,
    title: 'Cash Flow Management',
    description: 'Forecast cash needs, track invoicing, and manage payment schedules proactively.',
  },
  {
    icon: BarChart3,
    title: 'Cost Codes',
    description: 'Standardized cost coding aligned with industry formats for precise categorization.',
  },
  {
    icon: FileEdit,
    title: 'Change Orders',
    description: 'Manage scope changes with full audit trails, approvals, and budget impact analysis.',
  },
  {
    icon: LineChart,
    title: 'Forecasting',
    description: 'AI-driven cost projections to identify overruns before they happen.',
  },
];

const budgetData = [
  { label: 'Foundation', budget: 120000, actual: 115000, color: '#ff5201' },
  { label: 'Structure', budget: 340000, actual: 355000, color: '#ff7a3d' },
  { label: 'MEP', budget: 280000, actual: 248000, color: '#ff9966' },
  { label: 'Finishing', budget: 190000, actual: 165000, color: '#ffb399' },
  { label: 'Landscaping', budget: 70000, actual: 52000, color: '#ffcc99' },
];

const pieSlices = [
  { label: 'Labor', pct: 35, color: '#ff5201' },
  { label: 'Material', pct: 28, color: '#ff7a3d' },
  { label: 'Equipment', pct: 18, color: '#ff9966' },
  { label: 'Subcontract', pct: 12, color: '#ffb399' },
  { label: 'Other', pct: 7, color: '#ffcc99' },
];

function formatCurrency(value: number) {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
}

function PieChart() {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const gap = 2;

  const slicesWithOffsets = pieSlices.reduce<Array<{ label: string; pct: number; color: string; dashArray: string; dashOffset: number }>>((acc, slice) => {
    const sliceLength = (slice.pct / 100) * circumference;
    const prevAccumulated = acc.reduce((sum, s) => sum + (s.pct / 100) * circumference, 0);
    acc.push({
      ...slice,
      dashArray: `${sliceLength - gap} ${circumference - sliceLength + gap}`,
      dashOffset: -prevAccumulated,
    });
    return acc;
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-44 h-44">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          {slicesWithOffsets.map((slice) => (
            <motion.circle
              key={slice.label}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth="18"
              strokeDasharray={slice.dashArray}
              strokeDashoffset={slice.dashOffset}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-black">$1.0M</span>
          <span className="text-[10px] text-black/40 uppercase tracking-wider">Total Budget</span>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {pieSlices.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-[11px] text-black/50">{s.label} {s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
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

export function CostControl() {
  const maxBudget = Math.max(...budgetData.map((d) => d.budget));

  return (
    <section className="bg-white py-20 md:py-28 overflow-hidden">
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
            Complete <span className="text-[#ff5201]">Cost Control</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-black/50 max-w-2xl mx-auto">
            Track every dollar from budget to completion with granular visibility and intelligent forecasting.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-14 md:mb-20"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
              className="rounded-xl border border-[#e2e8f0] bg-white p-5 transition-colors duration-300 hover:border-[#ff5201]/20"
            >
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-black mb-1.5">{feature.title}</h3>
              <p className="text-xs text-black/45 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Budget vs Actual Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-2xl border border-[#e2e8f0] bg-white p-6 sm:p-8 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
            <div>
              <h3 className="text-base font-bold text-black">Budget vs Actual</h3>
              <p className="text-xs text-black/40 mt-0.5">Riverside Tower — Phase 1 Breakdown</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-2 rounded-sm bg-[#ff5201]/20" />
                <span className="text-black/50">Budget</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-2 rounded-sm bg-[#ff5201]" />
                <span className="text-black/50">Actual</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Horizontal Bars */}
            <div className="lg:col-span-2 space-y-4">
              {budgetData.map((item, index) => {
                const budgetPct = (item.budget / maxBudget) * 100;
                const actualPct = (item.actual / maxBudget) * 100;
                const overBudget = item.actual > item.budget;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 + index * 0.08 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-black/70">{item.label}</span>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-black/35">{formatCurrency(item.budget)}</span>
                        <span className={cn('font-semibold', overBudget ? 'text-red-500' : 'text-black')}>
                          {formatCurrency(item.actual)}
                        </span>
                      </div>
                    </div>
                    <div className="relative w-full h-3 bg-black/[0.04] rounded-full overflow-hidden">
                      <motion.div
                        className="absolute top-0 left-0 h-full rounded-full bg-[#ff5201]/15"
                        style={{ width: `${budgetPct}%` }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${budgetPct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 + index * 0.08 }}
                      />
                      <motion.div
                        className="absolute top-0 left-0 h-full rounded-full"
                        style={{ backgroundColor: overBudget ? '#ef4444' : item.color, width: `${actualPct}%` }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${actualPct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 + index * 0.08 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pie Chart */}
            <PieChart />
          </div>

          {/* Green Banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-6 rounded-lg bg-emerald-50 border border-emerald-100 px-5 py-3.5 flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="text-sm font-semibold text-emerald-800">
              23% Cost Reduction Average
            </span>
            <span className="text-xs text-emerald-600/70 hidden sm:inline">
              — across 1,200+ completed projects
            </span>
          </motion.div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 text-center"
        >
          <Button className="bg-[#ff5201] hover:bg-[#e04a01] text-white rounded-lg px-6 py-2.5 text-sm transition-colors duration-300">
            View Cost Features
            <ArrowRight className="ml-1.5 w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}