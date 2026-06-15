'use client'

import { motion } from 'framer-motion'
import {
  FolderKanban,
  DollarSign,
  ShoppingCart,
  Users,
  HardHat,
  Package,
  CalendarDays,
  Globe,
  BookOpen,
  PieChart,
  TrendingUp,
  FileBarChart,
} from 'lucide-react'
import { type LucideIcon } from 'lucide-react'

interface ProductCard {
  icon: LucideIcon
  title: string
  description: string
  color: string
}

const products: ProductCard[] = [
  {
    icon: FolderKanban,
    title: 'Project Management',
    description:
      'Plan, track, and deliver projects on time with full visibility across all stages.',
    color: 'bg-orange-50 text-[#ff5201]',
  },
  {
    icon: DollarSign,
    title: 'Finance',
    description:
      'Manage budgets, invoices, payments, and financial reporting in one place.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: ShoppingCart,
    title: 'Procurement',
    description:
      'Streamline purchasing, vendor management, and material procurement workflows.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Users,
    title: 'HR',
    description:
      'Handle hiring, onboarding, attendance, and employee lifecycle management.',
    color: 'bg-sky-50 text-sky-600',
  },
  {
    icon: HardHat,
    title: 'Labour',
    description:
      'Track labour deployment, productivity, and workforce allocation across sites.',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    icon: Package,
    title: 'Assets',
    description:
      'Manage equipment, tools, and vehicles with full maintenance tracking.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: CalendarDays,
    title: 'Scheduling',
    description:
      'Create Gantt charts, milestones, and critical path schedules with ease.',
    color: 'bg-teal-50 text-teal-600',
  },
  {
    icon: Globe,
    title: 'Client Portal',
    description:
      'Give clients real-time project visibility with branded dashboards.',
    color: 'bg-pink-50 text-pink-600',
  },
  {
    icon: BookOpen,
    title: 'Resources',
    description:
      'Manage materials, inventory, and resource allocation efficiently.',
    color: 'bg-lime-50 text-lime-600',
  },
  {
    icon: PieChart,
    title: 'Cost Control',
    description:
      'Monitor spending, forecast costs, and prevent budget overruns in real time.',
    color: 'bg-cyan-50 text-cyan-600',
  },
  {
    icon: TrendingUp,
    title: 'Sales',
    description:
      'Track leads, proposals, and contracts with a built-in CRM pipeline.',
    color: 'bg-fuchsia-50 text-fuchsia-600',
  },
  {
    icon: FileBarChart,
    title: 'Reports',
    description:
      'Generate detailed reports and dashboards for data-driven decisions.',
    color: 'bg-indigo-50 text-indigo-600',
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
}

export function ProductShowcase() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
            Complete Construction Platform
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
            Every tool you need in one integrated system
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="mt-16 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          {products.map((product, i) => {
            const Icon = product.icon
            return (
              <motion.div
                key={i}
                variants={cardVariants}
                className="group rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#ff5201]/30 hover:shadow-lg"
              >
                <div
                  className={`mb-4 flex h-11 w-11 items-center justify-center rounded-full ${product.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-black">
                  {product.title}
                </h3>
                <p className="text-xs leading-relaxed text-gray-500">
                  {product.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}