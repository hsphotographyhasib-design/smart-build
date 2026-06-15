'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, XCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type Status = 'full' | 'partial' | 'none';

interface ComparisonFeature {
  feature: string;
  smartbuild: Status;
  spreadsheets: Status;
  genericErp: Status;
}

const comparisons: ComparisonFeature[] = [
  { feature: 'Real-time Project Dashboard', smartbuild: 'full', spreadsheets: 'none', genericErp: 'partial' },
  { feature: 'Construction-Specific Workflows', smartbuild: 'full', spreadsheets: 'none', genericErp: 'none' },
  { feature: 'Mobile Field Access', smartbuild: 'full', spreadsheets: 'none', genericErp: 'partial' },
  { feature: 'Automated Cost Tracking', smartbuild: 'full', spreadsheets: 'none', genericErp: 'partial' },
  { feature: 'Resource & Workforce Planning', smartbuild: 'full', spreadsheets: 'partial', genericErp: 'partial' },
  { feature: 'Document Management', smartbuild: 'full', spreadsheets: 'partial', genericErp: 'full' },
  { feature: 'Built-in Communication', smartbuild: 'full', spreadsheets: 'none', genericErp: 'partial' },
  { feature: 'Safety & Compliance Tracking', smartbuild: 'full', spreadsheets: 'none', genericErp: 'none' },
  { feature: 'Multi-Project Portfolio View', smartbuild: 'full', spreadsheets: 'none', genericErp: 'partial' },
  { feature: 'AI-Powered Insights', smartbuild: 'full', spreadsheets: 'none', genericErp: 'none' },
];

function StatusIcon({ status }: { status: Status }) {
  if (status === 'full') {
    return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
  }
  if (status === 'partial') {
    return <AlertCircle className="w-5 h-5 text-amber-500" />;
  }
  return <XCircle className="w-5 h-5 text-red-400" />;
}

function StatusBadge({ status }: { status: Status }) {
  if (status === 'full') {
    return <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Full</span>;
  }
  if (status === 'partial') {
    return <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Partial</span>;
  }
  return <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">None</span>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export function WhySmartBuild() {
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
            Why SmartBuild?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-black/50 max-w-2xl mx-auto">
            See how we compare to traditional methods and generic tools.
          </p>
        </motion.div>

        {/* Desktop Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="hidden md:block rounded-2xl border border-[#e2e8f0] overflow-hidden shadow-sm"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e2e8f0]">
                <th className="text-left px-6 py-4 text-xs font-semibold text-black/40 uppercase tracking-wider w-[40%]">
                  Feature
                </th>
                <th className="text-center px-6 py-4 w-[20%]">
                  <div className="inline-flex items-center gap-2 bg-[#ff5201] text-white text-xs font-bold px-4 py-1.5 rounded-full">
                    SmartBuild
                  </div>
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-black/40 uppercase tracking-wider w-[20%]">
                  Spreadsheets
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-black/40 uppercase tracking-wider w-[20%]">
                  Generic ERP
                </th>
              </tr>
            </thead>
            <motion.tbody
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {comparisons.map((row, index) => (
                <motion.tr
                  key={row.feature}
                  variants={rowVariants}
                  className={cn(
                    'border-b border-[#e2e8f0]/60 last:border-b-0',
                    index % 2 === 0 ? 'bg-white' : 'bg-black/[0.01]'
                  )}
                >
                  <td className="px-6 py-3.5 text-sm text-black/80 font-medium">
                    {row.feature}
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <div className="flex justify-center">
                      <StatusIcon status={row.smartbuild} />
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <div className="flex justify-center">
                      <StatusIcon status={row.spreadsheets} />
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <div className="flex justify-center">
                      <StatusIcon status={row.genericErp} />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </motion.div>

        {/* Mobile: Stacked Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="md:hidden space-y-3"
        >
          {comparisons.map((row) => (
            <motion.div
              key={row.feature}
              variants={rowVariants}
              className="rounded-xl border border-[#e2e8f0] bg-white p-4"
            >
              <p className="text-sm font-semibold text-black mb-3">{row.feature}</p>
              <div className="grid grid-cols-3 gap-2">
                <div className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-lg',
                  'bg-[#ff5201]/5 border border-[#ff5201]/10'
                )}>
                  <StatusIcon status={row.smartbuild} />
                  <span className="text-[10px] font-semibold text-[#ff5201]">SmartBuild</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-black/[0.02]">
                  <StatusIcon status={row.spreadsheets} />
                  <span className="text-[10px] text-black/40">Sheets</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-black/[0.02]">
                  <StatusIcon status={row.genericErp} />
                  <span className="text-[10px] text-black/40">ERP</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-black/40"
        >
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Full Support</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>Partial / Limited</span>
          </div>
          <div className="flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-red-400" />
            <span>Not Available</span>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 text-center"
        >
          <Button className="bg-[#ff5201] hover:bg-[#e04a01] text-white rounded-lg px-6 py-2.5 text-sm transition-colors duration-300">
            See All Features
            <ArrowRight className="ml-1.5 w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}