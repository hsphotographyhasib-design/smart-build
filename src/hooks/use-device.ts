'use client'

import { useState, useEffect, useCallback } from 'react'

// ═══════════════════════════════════════════════════════════════════
// Device Detection Hook — comprehensive breakpoint & device info
// ═══════════════════════════════════════════════════════════════════

export type DeviceType = 'mobile' | 'tablet' | 'laptop' | 'desktop'
export type Orientation = 'portrait' | 'landscape'

export interface DeviceInfo {
  /** Device type based on width */
  type: DeviceType
  /** Width < 768px */
  isMobile: boolean
  /** Width 768-1023px */
  isTablet: boolean
  /** Width 1024-1439px */
  isLaptop: boolean
  /** Width >= 1440px */
  isDesktop: boolean
  /** Width < 1024px (mobile or tablet) */
  isMobileOrTablet: boolean
  /** Width >= 768px (tablet, laptop, or desktop) */
  isTabletAndUp: boolean
  /** Width >= 1024px (laptop or desktop) */
  isLaptopAndUp: boolean
  /** Current viewport width in px */
  screenWidth: number
  /** Current viewport height in px */
  screenHeight: number
  /** Device orientation */
  orientation: Orientation
  /** Whether viewport is taller than wide */
  isPortrait: boolean
  /** Whether viewport is wider than tall */
  isLandscape: boolean
  /** CSS pixel ratio (for retina displays) */
  pixelRatio: number
  /** Viewport height in CSS vh units (accounts for mobile browser chrome) */
  vh: number
}

const BREAKPOINTS = {
  mobile: 768,    // < 768px
  tablet: 1024,   // 768-1023px
  laptop: 1440,    // 1024-1439px
  desktop: 1440,   // >= 1440px
} as const

export function useDevice(): DeviceInfo {
  const [info, setInfo] = useState<DeviceInfo>(() => getDeviceInfo())

  const update = useCallback(() => {
    setInfo(getDeviceInfo())
  }, [])

  useEffect(() => {
    // Listen to resize events (debounced by browser)
    window.addEventListener('resize', update)
    // Also listen to orientation change
    const mqlOrientation = window.matchMedia('(orientation: portrait)')
    mqlOrientation.addEventListener('change', update)

    return () => {
      window.removeEventListener('resize', update)
      mqlOrientation.removeEventListener('change', update)
    }
  }, [update])

  return info
}

function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      type: 'desktop',
      isMobile: false,
      isTablet: false,
      isLaptop: false,
      isDesktop: true,
      isMobileOrTablet: false,
      isTabletAndUp: true,
      isLaptopAndUp: true,
      screenWidth: 1440,
      screenHeight: 900,
      orientation: 'landscape',
      isPortrait: false,
      isLandscape: true,
      pixelRatio: 1,
      vh: 900,
    }
  }

  const w = window.innerWidth
  const h = window.innerHeight
  const type: DeviceType =
    w < BREAKPOINTS.mobile ? 'mobile'
    : w < BREAKPOINTS.tablet ? 'tablet'
    : w < BREAKPOINTS.desktop ? 'laptop'
    : 'desktop'

  return {
    type,
    isMobile: type === 'mobile',
    isTablet: type === 'tablet',
    isLaptop: type === 'laptop',
    isDesktop: type === 'desktop',
    isMobileOrTablet: type === 'mobile' || type === 'tablet',
    isTabletAndUp: type !== 'mobile',
    isLaptopAndUp: type === 'laptop' || type === 'desktop',
    screenWidth: w,
    screenHeight: h,
    orientation: w < h ? 'portrait' : 'landscape',
    isPortrait: w < h,
    isLandscape: w >= h,
    pixelRatio: window.devicePixelRatio || 1,
    vh: h,
  }
}
