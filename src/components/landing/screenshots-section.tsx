/**
 * Screenshots Section
 * CSS-only device mockups (Desktop, Tablet, Mobile) with tab switching.
 */
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ScreenshotsSectionProps {
  config: Record<string, any>;
}

type DeviceKey = 'desktop' | 'tablet' | 'mobile';

const devices: { key: DeviceKey; label: string; icon: LucideIcon; width: string; frameH: string }[] = [
  { key: 'desktop', label: 'Desktop', icon: Monitor, width: 'w-full max-w-3xl', frameH: 'h-[340px] sm:h-[380px]' },
  { key: 'tablet', label: 'Tablet', icon: Tablet, width: 'w-full max-w-md', frameH: 'h-[420px]' },
  { key: 'mobile', label: 'Mobile', icon: Smartphone, width: 'w-full max-w-[280px]', frameH: 'h-[480px]' },
];

/* ---- Tiny CSS-only dashboard layout ---- */
function DashboardMockup() {
  return (
    <div className="flex h-full w-full overflow-hidden rounded-b-xl bg-[#0B2345]/5">
      {/* Sidebar */}
      <div className="hidden w-[18%] min-w-[40px] flex-shrink-0 flex-col gap-2 border-r border-[#0B2345]/10 bg-[#0B2345] p-2 sm:flex">
        <div className="mb-3 h-5 w-3/4 rounded bg-[#F5A623]/30" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-4 rounded ${i === 0 ? 'w-full bg-[#F5A623]/25' : 'w-5/6 bg-white/10'}`}
          />
        ))}
      </div>
      {/* Main area */}
      <div className="flex flex-1 flex-col">
        {/* Top header bar */}
        <div className="flex h-10 flex-shrink-0 items-center gap-3 border-b border-[#0B2345]/10 bg-white px-4">
          <div className="h-3.5 w-24 rounded bg-[#0B2345]/10" />
          <div className="ml-auto h-7 w-7 rounded-full bg-[#F5A623]/20" />
          <div className="h-7 w-7 rounded-full bg-[#0B2345]/10" />
        </div>
        {/* Content grid */}
        <div className="flex-1 overflow-hidden p-3">
          <div className="mb-3 grid grid-cols-3 gap-2">
            {['bg-[#0B2345]', 'bg-[#F5A623]', 'bg-[#0B2345]/60'].map((bg, i) => (
              <div key={i} className={`flex h-14 flex-col justify-between rounded-lg ${bg} p-2`}>
                <div className="h-2 w-8 rounded bg-white/30" />
                <div className="h-3 w-12 rounded bg-white/20" />
              </div>
            ))}
          </div>
          {/* Chart placeholder */}
          <div className="h-[55%] rounded-lg border border-[#0B2345]/10 bg-white p-3">
            <div className="mb-2 h-3 w-20 rounded bg-[#0B2345]/10" />
            <div className="flex h-[calc(100%-20px)] items-end gap-1.5">
              {[40, 65, 45, 80, 55, 90, 70, 50, 85, 60, 75, 95].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-[#F5A623]/40 transition-all"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Browser / device frame ---- */
function DeviceFrame({ deviceKey, width, frameH }: { deviceKey: DeviceKey; width: string; frameH: string }) {
  const isMobile = deviceKey === 'mobile';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35 }}
      className={`mx-auto flex flex-col items-center ${width}`}
    >
      {/* Frame */}
      <div
        className={`w-full overflow-hidden border border-[#0B2345]/10 bg-[#0B2345] shadow-2xl
          ${isMobile ? 'rounded-[1.5rem]' : 'rounded-xl'}`}
      >
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
          {/* 3 dots */}
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
          </div>
          {/* Address bar */}
          {!isMobile && (
            <div className="ml-2 flex-1 rounded-md bg-white/10 px-3 py-1">
              <div className="h-2 w-48 rounded bg-white/20" />
            </div>
          )}
          {isMobile && <div className="flex-1" />}
        </div>
        {/* Dashboard content */}
        <div className={`${frameH} overflow-hidden`}>
          <DashboardMockup />
        </div>
      </div>
    </motion.div>
  );
}

export default function ScreenshotsSection({ config }: ScreenshotsSectionProps) {
  const [active, setActive] = useState<DeviceKey>('desktop');

  const activeDevice = devices.find((d) => d.key === active)!;

  return (
    <section className="section-padding bg-white">
      <div className="container-brand">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="font-heading text-3xl font-bold text-[#0B2345] sm:text-4xl lg:text-5xl">
            Beautiful on Every <span className="text-gradient">Device</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-[#0B2345]/60">
            A responsive experience that looks and performs great on desktops, tablets, and mobile phones.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="mb-10 flex items-center justify-center gap-2">
          {devices.map((d) => {
            const Icon = d.icon;
            const isActive = d.key === active;
            return (
              <button
                key={d.key}
                onClick={() => setActive(d.key)}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300
                  ${
                    isActive
                      ? 'bg-[#0B2345] text-white shadow-lg shadow-[#0B2345]/25'
                      : 'bg-[#0B2345]/5 text-[#0B2345]/60 hover:bg-[#0B2345]/10 hover:text-[#0B2345]'
                  }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{d.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mockup */}
        <AnimatePresence mode="wait">
          <DeviceFrame
            key={active}
            deviceKey={active}
            width={activeDevice.width}
            frameH={activeDevice.frameH}
          />
        </AnimatePresence>
      </div>
    </section>
  );
}
