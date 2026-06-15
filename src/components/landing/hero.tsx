'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Play, ArrowRight, TrendingUp, Users, FolderOpen, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Count-Up Hook                                                      */
/* ------------------------------------------------------------------ */

function useCountUp(target: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const started = useRef(false);

  useEffect(() => {
    if (!startOnView || inView) {
      if (started.current) return;
      started.current = true;

      const startTime = performance.now();
      const step = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * target));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  }, [inView, target, duration, startOnView]);

  return { count, ref };
}

/* ------------------------------------------------------------------ */
/*  Stat Counter                                                       */
/* ------------------------------------------------------------------ */

function StatCounter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { count, ref } = useCountUp(value);

  return (
    <div className="flex flex-col items-start" ref={ref}>
      <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums leading-none">
        {count.toLocaleString()}
        {suffix && <span className="text-[#ff5201]">{suffix}</span>}
      </span>
      <span className="text-xs sm:text-sm text-white/50 font-medium mt-1">{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard Mockup                                                   */
/* ------------------------------------------------------------------ */

function DashboardMockup() {
  const statCards = [
    { label: 'Active Projects', value: '24', icon: <FolderOpen className="size-4 text-[#ff5201]" />, color: '#ff5201' },
    { label: 'Budget Health', value: '78%', icon: <TrendingUp className="size-4 text-green-500" />, color: '#22c55e' },
    { label: 'Team Members', value: '156', icon: <Users className="size-4 text-blue-500" />, color: '#3b82f6' },
    { label: 'Completed', value: '892', icon: <CheckCircle2 className="size-4 text-purple-500" />, color: '#a855f7' },
  ];

  const barData = [
    { label: 'Mon', value: 65 },
    { label: 'Tue', value: 80 },
    { label: 'Wed', value: 45 },
    { label: 'Thu', value: 90 },
    { label: 'Fri', value: 70 },
    { label: 'Sat', value: 55 },
    { label: 'Sun', value: 35 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
      className="relative"
    >
      {/* Floating animation wrapper */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="w-full max-w-md mx-auto lg:max-w-none"
      >
        <div className="bg-white rounded-lg border border-white/10 shadow-2xl overflow-hidden">
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-3 bg-[#f5f1ed] border-b border-[#e2e8f0]">
            <div className="flex gap-1.5">
              <div className="size-3 rounded-full bg-red-400" aria-hidden="true" />
              <div className="size-3 rounded-full bg-yellow-400" aria-hidden="true" />
              <div className="size-3 rounded-full bg-green-400" aria-hidden="true" />
            </div>
            <div className="flex-1 text-center">
              <div className="inline-block px-4 py-1 bg-white rounded-md text-xs text-[#595552] font-medium border border-[#e2e8f0]">
                SmartBuild Dashboard
              </div>
            </div>
            <div className="w-14" aria-hidden="true" />
          </div>

          {/* Dashboard content */}
          <div className="p-4 space-y-4">
            {/* 2x2 stat cards */}
            <div className="grid grid-cols-2 gap-3">
              {statCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-lg border border-[#e2e8f0] p-3 bg-white hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-medium text-[#595552] uppercase tracking-wider">
                      {card.label}
                    </span>
                    {card.icon}
                  </div>
                  <span className="text-xl font-bold text-[#000] tabular-nums leading-none">
                    {card.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Mini bar chart */}
            <div className="rounded-lg border border-[#e2e8f0] p-3 bg-white">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-medium text-[#595552] uppercase tracking-wider">
                  Weekly Progress
                </span>
                <span className="text-xs font-medium text-[#ff5201]">+12.5%</span>
              </div>
              <div className="flex items-end gap-2 h-20">
                {barData.map((bar) => (
                  <div key={bar.label} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${bar.value}%` }}
                      transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
                      className="w-full rounded-t-sm"
                      style={{ backgroundColor: bar.value > 70 ? '#ff5201' : '#cbbaab' }}
                    />
                    <span className="text-[9px] text-[#595552] font-medium">{bar.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Subtle glow behind card */}
      <div
        className="absolute -inset-4 -z-10 rounded-2xl blur-2xl opacity-20"
        style={{ background: 'radial-gradient(ellipse at center, #ff5201 0%, transparent 70%)' }}
        aria-hidden="true"
      />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero Section                                                       */
/* ------------------------------------------------------------------ */

export function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ backgroundColor: '#000000' }}
      aria-label="Hero"
    >
      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div className="flex flex-col gap-8">
            {/* Pill badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: '#ff5201' }}
              >
                <span className="size-1.5 rounded-full bg-white animate-pulse" aria-hidden="true" />
                AI-Powered Construction Platform
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]"
            >
              Manage Every Construction Project From One Platform
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
              className="text-base sm:text-lg text-white/60 max-w-xl leading-relaxed"
            >
              Streamline project management, financials, procurement, and workforce coordination
              with SmartBuild&apos;s unified construction ERP. Built for teams that build the world.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
              className="flex flex-wrap items-center gap-4"
            >
              <Button
                size="lg"
                className="text-white font-semibold px-6 py-3 text-base rounded-lg hover:brightness-110 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#ff5201]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                style={{ backgroundColor: '#ff5201' }}
                asChild
              >
                <a href="#demo" className="gap-2">
                  Request Demo
                  <ArrowRight className="size-4" />
                </a>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="font-semibold px-6 py-3 text-base rounded-lg border-white/20 text-white hover:bg-white/10 hover:text-white transition-all duration-200 focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                asChild
              >
                <a href="#video" className="gap-2">
                  <Play className="size-4" />
                  Watch Video
                </a>
              </Button>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
              className="flex flex-wrap items-center gap-8 sm:gap-12 pt-4 border-t border-white/10"
            >
              <StatCounter value={15000} suffix="+" label="Projects" />
              <StatCounter value={500} suffix="+" label="Companies" />
              <StatCounter value={99} suffix=".9%" label="Uptime" />
            </motion.div>
          </div>

          {/* Right – Dashboard mockup */}
          <div className="hidden lg:block">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
}