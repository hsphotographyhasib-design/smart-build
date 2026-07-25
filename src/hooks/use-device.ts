'use client'

// Device detection for auto layout switching. SSR-safe: returns desktop-ish
// defaults on the server, then live values after mount, kept in sync through
// matchMedia listeners (no resize polling, no layout thrash).
//
// Tiers follow the platform breakpoints (mobile-first):
//   mobile <640 · tablet 640–1023 · laptop 1024–1279 · desktop 1280–1535 · wide ≥1536

import { useEffect, useState } from 'react'

export type DeviceTier = 'mobile' | 'tablet' | 'laptop' | 'desktop' | 'wide'

export interface DeviceInfo {
  tier: DeviceTier
  orientation: 'portrait' | 'landscape'
  /** Primary pointer is coarse (finger) — enlarge touch targets. */
  isTouch: boolean
  /** No hover capability (true touch device, not a touch-capable laptop). */
  noHover: boolean
  prefersReducedMotion: boolean
  /** True once client media queries have been evaluated. */
  ready: boolean
}

const QUERIES = {
  tablet: '(min-width: 640px)',
  laptop: '(min-width: 1024px)',
  desktop: '(min-width: 1280px)',
  wide: '(min-width: 1536px)',
  landscape: '(orientation: landscape)',
  coarse: '(pointer: coarse)',
  noHover: '(hover: none)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
} as const

function read(): DeviceInfo {
  const m = (q: string) => window.matchMedia(q).matches
  const tier: DeviceTier = m(QUERIES.wide) ? 'wide'
    : m(QUERIES.desktop) ? 'desktop'
    : m(QUERIES.laptop) ? 'laptop'
    : m(QUERIES.tablet) ? 'tablet'
    : 'mobile'
  return {
    tier,
    orientation: m(QUERIES.landscape) ? 'landscape' : 'portrait',
    isTouch: m(QUERIES.coarse),
    noHover: m(QUERIES.noHover),
    prefersReducedMotion: m(QUERIES.reducedMotion),
    ready: true,
  }
}

const SSR_DEFAULT: DeviceInfo = {
  tier: 'desktop', orientation: 'landscape', isTouch: false,
  noHover: false, prefersReducedMotion: false, ready: false,
}

export function useDevice(): DeviceInfo {
  const [info, setInfo] = useState<DeviceInfo>(SSR_DEFAULT)

  useEffect(() => {
    const update = () => setInfo(read())
    update()
    const mqls = Object.values(QUERIES).map((q) => window.matchMedia(q))
    mqls.forEach((mql) => mql.addEventListener('change', update))
    return () => mqls.forEach((mql) => mql.removeEventListener('change', update))
  }, [])

  return info
}
