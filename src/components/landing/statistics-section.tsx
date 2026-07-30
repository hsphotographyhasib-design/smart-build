/**
 * Statistics Section
 * Animated counter numbers with requestAnimationFrame.
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface StatItem {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
}

const defaultStats: StatItem[] = [
  { value: 2400, suffix: '+', label: 'Projects Delivered' },
  { value: 850, suffix: '+', label: 'Companies Trust Us' },
  { value: 150, suffix: 'K+', label: 'Active Users' },
  { value: 25, suffix: '+', label: 'Countries Served' },
  { value: 98, suffix: '%', label: 'Uptime Guarantee' },
];

interface StatisticsSectionProps {
  config: Record<string, any>;
}

function AnimatedCounter({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    const duration = 2000; // ms
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {prefix}{display.toLocaleString()}{suffix}
    </span>
  );
}

export default function StatisticsSection({ config }: StatisticsSectionProps) {
  const stats: StatItem[] = config.stats?.length ? config.stats : defaultStats;

  return (
    <section className="bg-navy-gradient section-padding relative overflow-hidden">
      {/* Subtle background decorations */}
      <div className="pointer-events-none absolute -top-32 left-1/3 h-64 w-64 rounded-full bg-[#F5A623]/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-1/3 h-64 w-64 rounded-full bg-[#F5A623]/5 blur-3xl" />

      <div className="container-brand relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Numbers That <span className="text-gradient">Speak</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-white/60">
            Our track record of excellence across the globe.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              className="text-center"
            >
              <p className="font-heading text-4xl font-bold text-[#F5A623] md:text-5xl">
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                />
              </p>
              <p className="mt-2 font-body text-sm text-white/60">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
