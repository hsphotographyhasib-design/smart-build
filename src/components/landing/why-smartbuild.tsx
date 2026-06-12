'use client'

import { motion } from 'framer-motion'
import { CheckCircle, XCircle, MinusCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Status = 'full' | 'partial' | 'none'

interface ComparisonRow {
  feature: string
  smartbuild: Status
  spreadsheets: Status
  genericErp: Status
}

const rows: ComparisonRow[] = [
  { feature: 'Real-time Project Tracking', smartbuild: 'full', spreadsheets: 'none', genericErp: 'none' },
  { feature: 'Integrated Financial Management', smartbuild: 'full', spreadsheets: 'partial', genericErp: 'partial' },
  { feature: 'Mobile App Access', smartbuild: 'full', spreadsheets: 'none', genericErp: 'none' },
  { feature: 'Resource Planning & Allocation', smartbuild: 'full', spreadsheets: 'none', genericErp: 'partial' },
  { feature: 'Automated Reporting', smartbuild: 'full', spreadsheets: 'partial', genericErp: 'partial' },
  { feature: 'Client Portal', smartbuild: 'full', spreadsheets: 'none', genericErp: 'none' },
  { feature: 'Construction-Specific Workflows', smartbuild: 'full', spreadsheets: 'partial', genericErp: 'partial' },
  { feature: 'Cloud-Based Access', smartbuild: 'full', spreadsheets: 'partial', genericErp: 'partial' },
  { feature: 'GPS & Field Tracking', smartbuild: 'full', spreadsheets: 'none', genericErp: 'none' },
  { feature: 'Subcontractor Management', smartbuild: 'full', spreadsheets: 'none', genericErp: 'partial' },
]

function StatusIcon({ status }: { status: Status }) {
  switch (status) {
    case 'full':
      return <CheckCircle className="w-5 h-5 text-green-500" />
    case 'partial':
      return <MinusCircle className="w-5 h-5 text-yellow-500" />
    case 'none':
      return <XCircle className="w-5 h-5 text-red-400" />
  }
}

const headerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const tableVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 } },
}

export function WhySmartBuild() {
  return (
    <section className="py-20 md:py-28 bg-white" id="why-smartbuild">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why SmartBuild?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See how we compare to traditional methods
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          variants={tableVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="w-full"
        >
          {/* Desktop Table */}
          <div className="hidden md:block rounded-2xl overflow-hidden shadow-lg border border-gray-200">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left py-4 px-6 bg-gray-50 text-gray-600 font-semibold text-sm w-[40%]">
                    Feature
                  </th>
                  <th className="py-4 px-6 bg-blue-600 text-white font-bold text-sm text-center">
                    SmartBuild
                  </th>
                  <th className="py-4 px-6 bg-gray-100 text-gray-600 font-semibold text-sm text-center">
                    Spreadsheets
                  </th>
                  <th className="py-4 px-6 bg-gray-100 text-gray-600 font-semibold text-sm text-center">
                    Generic ERP
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <motion.tr
                    key={row.feature}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.05 * index, duration: 0.3 }}
                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="py-4 px-6 text-gray-800 font-medium text-sm">
                      {row.feature}
                    </td>
                    <td className="py-4 px-6 bg-blue-50/50 flex justify-center">
                      <StatusIcon status={row.smartbuild} />
                    </td>
                    <td className="py-4 px-6 flex justify-center">
                      <StatusIcon status={row.spreadsheets} />
                    </td>
                    <td className="py-4 px-6 flex justify-center">
                      <StatusIcon status={row.genericErp} />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {rows.map((row, index) => (
              <motion.div
                key={row.feature}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * index, duration: 0.3 }}
                className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
              >
                <div className="font-semibold text-gray-800 text-sm mb-3">{row.feature}</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center gap-1 bg-blue-50 rounded-lg py-2 px-1">
                    <span className="text-[10px] font-semibold text-blue-700">SmartBuild</span>
                    <StatusIcon status={row.smartbuild} />
                  </div>
                  <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-lg py-2 px-1">
                    <span className="text-[10px] font-semibold text-gray-500">Spreadsheets</span>
                    <StatusIcon status={row.spreadsheets} />
                  </div>
                  <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-lg py-2 px-1">
                    <span className="text-[10px] font-semibold text-gray-500">Generic ERP</span>
                    <StatusIcon status={row.genericErp} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Full Support</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MinusCircle className="w-4 h-4 text-yellow-500" />
              <span>Partial / Limited</span>
            </div>
            <div className="flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-red-400" />
              <span>Not Available</span>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Button
            variant="outline"
            size="lg"
            className="group text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 gap-2"
          >
            See All Features
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}