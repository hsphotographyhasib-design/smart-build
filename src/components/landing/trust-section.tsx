'use client';

import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import { fadeInUp, viewportConfig } from './motion';
import type { Partner } from './types';

interface TrustSectionProps {
  config: Record<string, any>;
  partners: Partner[];
}

const FALLBACK_PARTNERS: Partner[] = [
  { id: '1', name: 'Turner Construction', logoUrl: null, website: null },
  { id: '2', name: 'Skanska USA', logoUrl: null, website: null },
  { id: '3', name: 'Bechtel Group', logoUrl: null, website: null },
  { id: '4', name: 'AECOM Technology', logoUrl: null, website: null },
  { id: '5', name: 'Kiewit Corporation', logoUrl: null, website: null },
  { id: '6', name: 'Fluor Corporation', logoUrl: null, website: null },
  { id: '7', name: 'PCL Construction', logoUrl: null, website: null },
  { id: '8', name: 'McDermott International', logoUrl: null, website: null },
  { id: '9', name: 'Jacobs Engineering', logoUrl: null, website: null },
  { id: '10', name: 'Stantec Inc', logoUrl: null, website: null },
  { id: '11', name: 'Hensel Phelps', logoUrl: null, website: null },
  { id: '12', name: 'Clark Construction', logoUrl: null, website: null },
  { id: '13', name: 'Whiting-Turner', logoUrl: null, website: null },
  { id: '14', name: 'Gilbane Building', logoUrl: null, website: null },
];

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

function PartnerBadge({ name }: { name: string }) {
  const initial = getInitial(name);
  return (
    <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-[#F5A623]/40 transition-all duration-300 shrink-0 mx-2">
      <div className="w-7 h-7 rounded-full bg-[#0B2345] flex items-center justify-center shrink-0">
        <span className="text-[#F5A623] text-xs font-bold">{initial}</span>
      </div>
      <span className="text-sm font-body font-medium text-gray-700 whitespace-nowrap">
        {name}
      </span>
    </div>
  );
}

export function TrustSection({ config, partners }: TrustSectionProps) {
  const headline = config.headline || 'Trusted by Industry Leaders Worldwide';
  const subheadline =
    config.subheadline ||
    'Over 2,000 companies rely on our platform to deliver projects on time and on budget.';

  const partnerList = partners.length > 0 ? partners : FALLBACK_PARTNERS;

  // Split into two rows for the marquee
  const mid = Math.ceil(partnerList.length / 2);
  const row1 = partnerList.slice(0, mid);
  const row2 = partnerList.slice(mid);

  return (
    <section className="relative bg-white py-16 lg:py-20 overflow-hidden" aria-label="Trusted Partners">
      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .marquee-track-left {
          display: flex;
          width: max-content;
          animation: marquee-left 40s linear infinite;
        }
        .marquee-track-right {
          display: flex;
          width: max-content;
          animation: marquee-right 40s linear infinite;
        }
        .marquee-track-left:hover,
        .marquee-track-right:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="container-brand text-center relative z-10">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="mb-10 lg:mb-14"
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
      </div>

      {/* Row 1 — scrolls left */}
      <div className="overflow-hidden mb-4" aria-hidden="true">
        <div className="marquee-track-left">
          {[...row1, ...row1, ...row1, ...row1].map((p, i) => (
            <PartnerBadge key={`r1-${p.id}-${i}`} name={p.name} />
          ))}
        </div>
      </div>

      {/* Row 2 — scrolls right */}
      <div className="overflow-hidden" aria-hidden="true">
        <div className="marquee-track-right">
          {[...row2, ...row2, ...row2, ...row2].map((p, i) => (
            <PartnerBadge key={`r2-${p.id}-${i}`} name={p.name} />
          ))}
        </div>
      </div>

      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
    </section>
  );
}
