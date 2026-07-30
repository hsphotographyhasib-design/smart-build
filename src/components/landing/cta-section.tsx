'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Calendar, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CtaSectionProps {
  config: Record<string, any>;
}

export function CtaSection({ config }: CtaSectionProps) {
  const headline = config?.headline || 'Ready to Transform Your Construction Operations?';
  const subheadline =
    config?.subheadline ||
    'Join over 2,000 construction firms already using SmartBuild to deliver projects faster, safer, and under budget.';

  return (
    <section className="relative overflow-hidden bg-navy-gradient section-padding">
      {/* Subtle gold decorative elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-1/4 h-64 w-64 rounded-full bg-[#F5A623]/5 blur-3xl" />
        <div className="absolute -right-20 bottom-1/4 h-80 w-80 rounded-full bg-[#F5A623]/5 blur-3xl" />
        <div className="absolute left-1/2 top-0 h-px w-1/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#F5A623]/20 to-transparent" />
        <div className="absolute left-1/2 bottom-0 h-px w-1/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#F5A623]/20 to-transparent" />
      </div>

      <div className="container-brand relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            {headline}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl font-body text-lg leading-relaxed text-white/70">
            {subheadline}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="bg-[#F5A623] font-body text-base font-semibold text-white shadow-lg shadow-[#F5A623]/25 transition-all duration-300 hover:bg-[#F5A623]/90 hover:shadow-xl hover:shadow-[#F5A623]/30"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-white/30 font-body text-base font-semibold text-white transition-all duration-300 hover:border-white/60 hover:bg-white/10"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Book a Demo
            </Button>

            <Button
              size="lg"
              variant="ghost"
              className="font-body text-base font-semibold text-white/70 transition-all duration-300 hover:text-white hover:bg-white/10"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Contact Sales
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
