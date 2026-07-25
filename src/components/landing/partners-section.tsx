'use client';

import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import type { Partner } from './types';

const defaultPartners: Partner[] = [
  { id: '1', name: 'Turner Construction', logoUrl: null, website: null },
  { id: '2', name: 'Bechtel Group', logoUrl: null, website: null },
  { id: '3', name: 'Skanska USA', logoUrl: null, website: null },
  { id: '4', name: 'Hensel Phelps', logoUrl: null, website: null },
  { id: '5', name: 'McCarthy Building', logoUrl: null, website: null },
  { id: '6', name: 'Clark Construction', logoUrl: null, website: null },
  { id: '7', name: 'Whiting-Turner', logoUrl: null, website: null },
  { id: '8', name: 'PCL Construction', logoUrl: null, website: null },
  { id: '9', name: 'Suffolk Construction', logoUrl: null, website: null },
  { id: '10', name: 'DPR Construction', logoUrl: null, website: null },
];

interface PartnersSectionProps {
  config: Record<string, any>;
  partners?: Partner[];
}

export function PartnersSection({ config, partners }: PartnersSectionProps) {
  const items: Partner[] = partners?.length ? partners : defaultPartners;

  const headline = config?.headline || 'Trusted by Industry Leaders';
  const subheadline = config?.subheadline || 'Join hundreds of construction firms that rely on SmartBuild to deliver projects on time and on budget.';

  return (
    <section className="section-padding bg-white">
      <div className="container-brand">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <h2 className="font-heading text-3xl font-bold text-[#0B2345] sm:text-4xl lg:text-5xl">
            {headline}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-[#0B2345]/60">
            {subheadline}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {items.map((partner, index) => (
            <motion.div
              key={partner.id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-[#0B2345]/5 bg-white p-5 transition-all duration-300 hover:border-[#F5A623]/30 hover:shadow-md hover:shadow-[#0B2345]/5"
            >
              {partner.logoUrl ? (
                <img
                  src={partner.logoUrl}
                  alt={partner.name}
                  className="h-10 w-auto object-contain opacity-60 transition-opacity duration-300 group-hover:opacity-100"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#0B2345]/5 transition-colors duration-300 group-hover:bg-[#F5A623]/10">
                  <Building2 className="h-6 w-6 text-[#0B2345]/30 transition-colors duration-300 group-hover:text-[#F5A623]" />
                </div>
              )}
              <span className="font-body text-center text-sm font-medium text-[#0B2345]/60 transition-colors duration-300 group-hover:text-[#0B2345]">
                {partner.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
