'use client';

import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileSpreadsheet,
  PieChart,
  UserCog,
  BellRing,
  Lock,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { fadeInUp, staggerContainer, staggerItem, viewportConfig } from './motion';

interface EnterpriseModulesSectionProps {
  config: Record<string, any>;
}

interface EnterpriseModule {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
}

const iconRegistry: Record<string, LucideIcon> = {
  LayoutDashboard,
  FileSpreadsheet,
  PieChart,
  UserCog,
  BellRing,
  Lock,
};

const DEFAULT_MODULES: EnterpriseModule[] = [
  {
    icon: LayoutDashboard,
    title: 'Executive Dashboard',
    description:
      'High-level portfolio visibility with real-time KPIs, project health indicators, and financial summaries for leadership teams.',
    href: '#',
  },
  {
    icon: FileSpreadsheet,
    title: 'Project Accounting',
    description:
      'Full-cycle financial management including budgeting, invoicing, change orders, and certified payroll processing.',
    href: '#',
  },
  {
    icon: PieChart,
    title: 'Business Intelligence',
    description:
      'Advanced analytics engine with custom report builder, trend analysis, and predictive insights across all projects.',
    href: '#',
  },
  {
    icon: UserCog,
    title: 'Workforce Management',
    description:
      'End-to-end HR tools for onboarding, certifications, labor forecasting, and union compliance tracking.',
    href: '#',
  },
  {
    icon: BellRing,
    title: 'Notifications Hub',
    description:
      'Configurable alert rules and escalation workflows that keep every stakeholder informed and accountable.',
    href: '#',
  },
  {
    icon: Lock,
    title: 'Access Control',
    description:
      'Granular permission management with SSO integration, IP restrictions, and comprehensive audit logging.',
    href: '#',
  },
];

function resolveModules(config: Record<string, any>): EnterpriseModule[] {
  if (config.cards?.length) {
    return config.cards.map((card: Record<string, any>) => ({
      icon: iconRegistry[card.icon] || LayoutDashboard,
      title: card.title || 'Module',
      description: card.description || '',
      href: card.href || '#',
    }));
  }
  return DEFAULT_MODULES;
}

export function EnterpriseModulesSection({ config }: EnterpriseModulesSectionProps) {
  const headline = config.headline || 'Enterprise Power Modules';
  const subheadline =
    config.subheadline ||
    'Advanced capabilities for organizations that demand more from their project management platform.';

  const modules = resolveModules(config);

  return (
    <section
      className="relative bg-white py-16 lg:py-24"
      aria-label="Enterprise Modules"
    >
      <div className="container-brand">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="text-center mb-12 lg:mb-16"
        >
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0B2345]">
            {headline}
          </h2>
          {subheadline && (
            <p className="mt-3 text-base text-gray-500 font-body max-w-2xl mx-auto">
              {subheadline}
            </p>
          )}
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {modules.map((mod, index) => {
            const Icon = mod.icon;
            return (
              <motion.a
                key={index}
                href={mod.href || '#'}
                variants={staggerItem}
                className="group relative block bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-l-4 border-l-[#F5A623]"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-lg bg-[#0B2345] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#F5A623]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-lg font-semibold text-[#0B2345] mb-2">
                      {mod.title}
                    </h3>
                    <p className="text-sm text-gray-500 font-body leading-relaxed mb-3">
                      {mod.description}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#F5A623] group-hover:gap-2.5 transition-all duration-300">
                      Learn more
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </motion.a>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
