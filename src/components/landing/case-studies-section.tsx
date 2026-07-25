/**
 * Case Studies Section
 * Industry case study cards with results and read-more links.
 */
'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export interface CaseStudy {
  industry: string;
  clientName: string;
  title: string;
  summary: string;
  results: string;
  accentColor?: string;
}

const defaultCaseStudies: CaseStudy[] = [
  {
    industry: 'Healthcare',
    clientName: 'MediCore Systems',
    title: 'Streamlining Patient Data Management',
    summary: 'How MediCore reduced data processing time by 70% and improved patient record accuracy across 12 facilities using our AI-powered platform.',
    results: '70% faster processing, 99.2% data accuracy',
    accentColor: '#F5A623',
  },
  {
    industry: 'Finance',
    clientName: 'Greenfield Capital',
    title: 'Real-Time Risk Assessment at Scale',
    summary: 'Greenfield Capital deployed our analytics engine to monitor 50K+ transactions per second, achieving real-time fraud detection with minimal false positives.',
    results: '50K+ txns/sec, 94% fraud detection rate',
    accentColor: '#0B2345',
  },
  {
    industry: 'Manufacturing',
    clientName: 'Atlas Industrial',
    title: 'Predictive Maintenance Revolution',
    summary: 'Atlas Industrial implemented AI-driven predictive maintenance across 8 plants, reducing unplanned downtime by 85% and saving $2.4M annually.',
    results: '85% less downtime, $2.4M annual savings',
    accentColor: '#F5A623',
  },
];

interface CaseStudiesSectionProps {
  config: Record<string, any>;
  caseStudies?: CaseStudy[];
}

export default function CaseStudiesSection({ config, caseStudies }: CaseStudiesSectionProps) {
  const items = caseStudies?.length ? caseStudies : defaultCaseStudies;

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
            Real <span className="text-gradient">Results</span>, Real Impact
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-[#0B2345]/60">
            See how organizations across industries are transforming their operations with our platform.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
          {items.map((cs, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#0B2345]/8 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-[#0B2345]/10"
            >
              {/* Colored header bar */}
              <div
                className="relative flex items-center gap-3 px-6 py-5"
                style={{ backgroundColor: cs.accentColor || '#0B2345' }}
              >
                <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
                  {cs.industry}
                </span>
                <span className="font-heading text-sm font-medium text-white/80">
                  {cs.clientName}
                </span>
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-heading mb-3 text-lg font-semibold text-[#0B2345]">
                  {cs.title}
                </h3>
                <p className="font-body mb-5 flex-1 text-sm leading-relaxed text-[#0B2345]/60">
                  {cs.summary}
                </p>

                {/* Results badge */}
                <div className="mb-5 rounded-lg bg-[#F5A623]/8 px-4 py-3">
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-[#0B2345]/40">
                    Key Results
                  </p>
                  <p className="mt-1 font-heading text-sm font-semibold text-[#0B2345]">
                    {cs.results}
                  </p>
                </div>

                {/* Read More */}
                <button className="group/btn inline-flex items-center gap-2 font-body text-sm font-medium text-[#F5A623] transition-colors duration-200 hover:text-[#0B2345]">
                  Read More
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
