'use client';

import { motion } from 'framer-motion';
import {
  CalendarDays,
  FileText,
  DollarSign,
  Users,
  Truck,
  HardHat,
  ClipboardCheck,
  BarChart3,
  AlertTriangle,
  Wrench,
  MessageSquare,
  Target,
  Layers,
  Shield,
  Clock,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { fadeInUp, staggerContainer, staggerItem, viewportConfig } from './motion';

interface FeaturesSectionProps {
  config: Record<string, any>;
}

interface ModuleCard {
  icon: LucideIcon;
  name: string;
  description: string;
}

const iconRegistry: Record<string, LucideIcon> = {
  CalendarDays,
  FileText,
  DollarSign,
  Users,
  Truck,
  HardHat,
  ClipboardCheck,
  BarChart3,
  AlertTriangle,
  Wrench,
  MessageSquare,
  Target,
  Layers,
  Shield,
  Clock,
  Settings,
};

const DEFAULT_MODULES: ModuleCard[] = [
  { icon: CalendarDays, name: 'Scheduling', description: 'Interactive Gantt charts and critical path analysis for every project phase.' },
  { icon: FileText, name: 'Document Control', description: 'Centralized repository for drawings, specs, RFIs, and submittals with version tracking.' },
  { icon: DollarSign, name: 'Cost Management', description: 'Track budgets, forecasts, change orders, and payment applications in real time.' },
  { icon: Users, name: 'Resource Planning', description: 'Optimize labor, equipment, and material allocation across all active projects.' },
  { icon: Truck, name: 'Logistics', description: 'Manage material deliveries, site logistics, and supply chain coordination.' },
  { icon: HardHat, name: 'Safety Management', description: 'Incident tracking, safety inspections, and compliance reporting tools.' },
  { icon: ClipboardCheck, name: 'Quality Assurance', description: 'Checklists, punch lists, and inspection workflows to maintain standards.' },
  { icon: BarChart3, name: 'Reporting & BI', description: 'Customizable dashboards, pivot tables, and executive summary reports.' },
  { icon: AlertTriangle, name: 'Risk Management', description: 'Identify, assess, and mitigate project risks with scoring matrices.' },
  { icon: Wrench, name: 'Maintenance', description: 'Track equipment maintenance schedules, work orders, and asset lifecycles.' },
  { icon: MessageSquare, name: 'Communication', description: 'Built-in messaging, announcements, and stakeholder collaboration tools.' },
  { icon: Target, name: 'Goal Tracking', description: 'Set project milestones, KPIs, and OKRs with progress visualization.' },
  { icon: Layers, name: 'BIM Integration', description: 'Connect BIM models directly to project data for clash detection and coordination.' },
  { icon: Shield, name: 'Compliance', description: 'Regulatory compliance tracking, permits management, and audit trails.' },
  { icon: Clock, name: 'Time Tracking', description: 'Labor hours logging, timesheet approval, and productivity analytics.' },
  { icon: Settings, name: 'Administration', description: 'User management, permissions, custom fields, and system configuration.' },
];

function resolveModules(config: Record<string, any>): ModuleCard[] {
  if (config.modules?.length) {
    return config.modules.map((mod: Record<string, any>) => ({
      icon: iconRegistry[mod.icon] || Settings,
      name: mod.name || 'Module',
      description: mod.description || '',
    }));
  }
  return DEFAULT_MODULES;
}

export function FeaturesSection({ config }: FeaturesSectionProps) {
  const headline = config.headline || 'Comprehensive Module Suite';
  const subheadline =
    config.subheadline ||
    '16 integrated modules covering every aspect of construction project management.';

  const modules = resolveModules(config);

  return (
    <section className="relative bg-white py-16 lg:py-24" aria-label="Features">
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {modules.map((mod, index) => {
            const Icon = mod.icon;
            return (
              <motion.div
                key={index}
                variants={staggerItem}
                className="group relative bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:border-l-4 hover:border-l-[#F5A623] hover:shadow-md transition-all duration-300 cursor-default"
              >
                <div className="w-10 h-10 rounded-lg bg-[#0B2345] flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-heading text-base font-semibold text-[#0B2345] mb-1.5">
                  {mod.name}
                </h3>
                <p className="text-sm text-gray-500 font-body leading-relaxed">
                  {mod.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
