'use client';

import { motion } from 'framer-motion';
import { BarChart3, Shield, Zap, Globe, type LucideIcon } from 'lucide-react';
import { fadeInUp, staggerContainer, staggerItem, viewportConfig } from './motion';

interface PlatformOverviewSectionProps {
  config: Record<string, any>;
}

interface OverviewCard {
  icon: LucideIcon;
  title: string;
  description: string;
}

const DEFAULT_CARDS: OverviewCard[] = [
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description:
      'Get instant visibility into project KPIs, resource utilization, and financial health with live dashboards and custom reports.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description:
      'Protect sensitive project data with role-based access controls, audit trails, and SOC 2 compliant infrastructure.',
  },
  {
    icon: Zap,
    title: 'Smart Automation',
    description:
      'Eliminate repetitive tasks with automated workflows, notifications, and approval chains that keep projects moving.',
  },
  {
    icon: Globe,
    title: 'Multi-Site Management',
    description:
      'Coordinate operations across unlimited project sites from a single unified dashboard with real-time sync.',
  },
];

function resolveCards(config: Record<string, any>): OverviewCard[] {
  if (config.cards?.length) {
    const iconMap: Record<string, LucideIcon> = {
      BarChart3,
      Shield,
      Zap,
      Globe,
    };
    return config.cards.map((card: Record<string, any>) => ({
      icon: iconMap[card.icon] || BarChart3,
      title: card.title || '',
      description: card.description || '',
    }));
  }
  return DEFAULT_CARDS;
}

export function PlatformOverviewSection({ config }: PlatformOverviewSectionProps) {
  const headline = config.headline || 'Why Teams Choose Us';
  const subheadline =
    config.subheadline ||
    'A unified platform built for the complexity of modern construction projects.';

  const cards = resolveCards(config);

  return (
    <section className="relative bg-[#F8FAFC] py-16 lg:py-20" aria-label="Platform Overview">
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={index}
                variants={staggerItem}
                className="group bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-[#F5A623]/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-[#F5A623]" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-[#0B2345] mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-500 font-body leading-relaxed">
                  {card.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
