'use client';

import { motion } from 'framer-motion';
import {
  Building2,
  Home,
  Hospital,
  GraduationCap,
  Landmark,
  Factory,
  Plane,
  Hotel,
  Store,
  Warehouse,
  type LucideIcon,
} from 'lucide-react';
import { fadeInUp, staggerContainer, staggerItem, viewportConfig } from './motion';

interface IndustriesSectionProps {
  config: Record<string, any>;
}

interface IndustryCard {
  icon: LucideIcon;
  name: string;
  description: string;
}

const iconMap: Record<string, LucideIcon> = {
  Building2,
  Home,
  Hospital,
  GraduationCap,
  Landmark,
  Factory,
  Plane,
  Hotel,
  Store,
  Warehouse,
};

const DEFAULT_INDUSTRIES: IndustryCard[] = [
  { icon: Building2, name: 'Commercial', description: 'Office towers, retail complexes, and mixed-use developments.' },
  { icon: Home, name: 'Residential', description: 'Single-family homes, apartments, and large-scale housing projects.' },
  { icon: Hospital, name: 'Healthcare', description: 'Hospitals, clinics, and specialized medical facilities.' },
  { icon: GraduationCap, name: 'Education', description: 'Schools, universities, and research campus construction.' },
  { icon: Landmark, name: 'Government', description: 'Public infrastructure, civic buildings, and government facilities.' },
  { icon: Factory, name: 'Industrial', description: 'Manufacturing plants, warehouses, and processing facilities.' },
  { icon: Plane, name: 'Transportation', description: 'Airports, railways, ports, and highway infrastructure.' },
  { icon: Hotel, name: 'Hospitality', description: 'Hotels, resorts, restaurants, and entertainment venues.' },
  { icon: Store, name: 'Retail', description: 'Shopping centers, storefronts, and commercial fit-outs.' },
  { icon: Warehouse, name: 'Logistics', description: 'Distribution centers, cold storage, and supply chain facilities.' },
];

function resolveItems(config: Record<string, any>): IndustryCard[] {
  if (config.items?.length) {
    return config.items.map((item: Record<string, any>) => ({
      icon: iconMap[item.icon] || Building2,
      name: item.name || 'Industry',
      description: item.description || '',
    }));
  }
  return DEFAULT_INDUSTRIES;
}

export function IndustriesSection({ config }: IndustriesSectionProps) {
  const headline = config.headline || 'Built for Every Industry';
  const subheadline =
    config.subheadline ||
    'From commercial skyscrapers to industrial plants — our platform adapts to your sector.';

  const items = resolveItems(config);

  return (
    <section className="relative bg-navy-gradient py-16 lg:py-24 overflow-hidden" aria-label="Industries">
      {/* Subtle decorative elements */}
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(rgba(245,166,35,0.8) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="container-brand relative z-10">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="text-center mb-12 lg:mb-16"
        >
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            {headline}
          </h2>
          {subheadline && (
            <p className="mt-3 text-base text-white/60 font-body max-w-2xl mx-auto">
              {subheadline}
            </p>
          )}
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-5"
        >
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                variants={staggerItem}
                className="group glass-dark rounded-xl p-5 hover:border-[#F5A623]/50 border border-white/[0.06] transition-all duration-300 cursor-default"
              >
                <div className="w-11 h-11 rounded-lg bg-white/[0.08] flex items-center justify-center mb-3 group-hover:bg-[#F5A623]/20 transition-colors duration-300">
                  <Icon className="w-5 h-5 text-[#F5A623]" />
                </div>
                <h3 className="font-heading text-base font-semibold text-white mb-1.5">
                  {item.name}
                </h3>
                <p className="text-sm text-white/50 font-body leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
