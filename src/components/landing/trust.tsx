'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { FolderKanban, Globe, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const companyLogos = [
  'AC', 'BK', 'CF', 'DL', 'EG', 'FH', 'GI', 'HJ', 'KL', 'MN',
];

const stats = [
  {
    icon: <FolderKanban className="size-6" />,
    iconColor: '#3b82f6',
    value: '15,000+',
    label: 'Projects Managed',
  },
  {
    icon: <Globe className="size-6" />,
    iconColor: '#ff5201',
    value: '500+',
    label: 'Companies Worldwide',
  },
  {
    icon: <ShieldCheck className="size-6" />,
    iconColor: '#22c55e',
    value: '99.9%',
    label: 'Platform Uptime',
  },
];

/* ------------------------------------------------------------------ */
/*  Variants                                                           */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function Trust() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });

  return (
    <section
      ref={sectionRef}
      className="py-20 sm:py-24 bg-white"
      aria-label="Trusted by leading companies"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#000]">
            Trusted by Leading{' '}
            <span style={{ color: '#ff5201' }}>Construction Companies</span>
          </h2>
          <p className="mt-3 text-[#595552] text-base sm:text-lg max-w-2xl mx-auto">
            From general contractors to specialty trades, thousands of construction
            professionals rely on SmartBuild every day.
          </p>
        </motion.div>

        {/* Logo row */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-16"
          role="list"
          aria-label="Trusted companies"
        >
          {companyLogos.map((initials) => (
            <motion.div
              key={initials}
              variants={itemVariants}
              className="flex items-center justify-center size-16 sm:size-20 rounded-lg bg-[#f5f1ed] border border-[#e2e8f0] hover:border-[#cbbaab] hover:shadow-sm transition-all duration-200"
              role="listitem"
            >
              <span className="text-sm sm:text-base font-bold text-[#595552] tracking-wider">
                {initials}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Stat cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="flex items-center gap-4 p-6 rounded-lg bg-white border border-[#e2e8f0] shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              {/* Icon container */}
              <div
                className="flex items-center justify-center size-12 rounded-lg shrink-0"
                style={{ backgroundColor: `${stat.iconColor}10` }}
              >
                <span style={{ color: stat.iconColor }}>{stat.icon}</span>
              </div>

              {/* Text */}
              <div className="min-w-0">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#000] tabular-nums leading-none">
                  {stat.value}
                </div>
                <div className="text-sm text-[#595552] font-medium mt-1">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}