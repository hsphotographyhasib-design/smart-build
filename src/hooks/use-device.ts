"use client"

import { useSyncExternalStore, useCallback, useRef, useEffect } from "react"

// ── ব্রেকপয়েন্ট ধ্রুক ══════════════════════════════════════════────────────────
export const MOBILE_BREAKPOINT = 768
export const TABLET_BREAKPOINT = 1024
export const LAPTOP_BREAKPOINT = 1280

// ── ধরন ════════════════════════════════════════════════───────────────────────────────
type DeviceType = "mobile" | "tablet" | "laptop" | "desktop"
type Orientation = "portrait" | "landscape"

export interface DeviceInfo {
  deviceType: DeviceType
  screenSize: { width: number; height: number }
  orientation: Orientation
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isLaptop: boolean
}

// ── সহায়ক ফাংশন করা হচ্ছে ══════════════════════════════════─────────────────────────────

function getDeviceType(width: number): DeviceType {
  if (width < MOBILE_BREAKPOINT) return "mobile"
  if (width < TABLET_BREAKPOINT) return "tablet"
  if (width < LAPTOP_BREAKPOINT) return "laptop"
  return "desktop"
}

function getOrientation(width: number, height: number): Orientation {
  return width >= height ? "landscape" : "portrait"
}

function buildDeviceInfo(width: number, height: number): DeviceInfo {
  const deviceType = getDeviceType(width)
  const orientation = getOrientation(width, height)

  return {
    deviceType,
    screenSize: { width, height },
    orientation,
    isMobile: deviceType === "mobile",
    isTablet: deviceType === "tablet",
    isLaptop: deviceType === "laptop",
    isDesktop: deviceType === "desktop",
  }
}

/** SSR-নিরাপদের ডিফল্ট (ডেস্কটপ অনুমানিত) */
const SSR_DEFAULT: DeviceInfo = buildDeviceInfo(1280, 800)

// ── বাহ্যার-স্টোর (মডিউল-স্তর) ════════════════════════════────────
// আমরা শেষ স্ন্যাপশট রাখা হচ্ছে যাতে useSyncExternalStore স্থিতিউ রেফারেন্স প্রদান করে
// ভিউপোর্ট পরিবর্তন না পরিবর্তন হলে ক্যাশে স্থিতিউ স্থিতিজ থাকে।

let cachedSnapshot: DeviceInfo = SSR_DEFAULT
let cachedWidth = 1280
let cachedHeight = 800

const BREAKPOINT_QUERIES = [
  `(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
  `(min-width: ${MOBILE_BREAKPOINT}px) and (max-width: ${TABLET_BREAKPOINT - 1}px)`,
  `(min-width: ${TABLET_BREAKPOINT}px) and (max-width: ${LAPTOP_BREAKPOINT - 1}px)`,
  `(min-width: ${LAPTOP_BREAKPOINT}px)`,
]

function getSnapshot(): DeviceInfo {
  const width = window.innerWidth
  const height = window.innerHeight
  if (width === cachedWidth && height === cachedHeight) {
    return cachedSnapshot
  }
  cachedSnapshot = buildDeviceInfo(width, height)
  cachedWidth = width
  cachedHeight = height
  return cachedSnapshot
}

function getServerSnapshot(): DeviceInfo {
  return SSR_DEFAULT
}

/** ডিভাইস হুক ════════════════════════════════════════════════
// সুবিধায় ডিভাইসের জন্য সুবিধিতান হুক। */────────────────────────

export function useDevice(): DeviceInfo {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const subscribe = useCallback((onStoreChange: () => void) => {
    const mediaQueryLists = BREAKPOINT_QUERIES.map((q) => window.matchMedia(q))

  // সঠিক রিসাইজে ডিবাউন্স শ্রোতার জন্য ডিবাউন্স
  const handleResize = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(onStoreChange, 200)
    }

    // matchMedia শ্রোতা কেবল ক্রস অতিক্রম শুধুমাত্র ব্রেকপয়েন্ট অতিক্রম হয়
    const handleMediaChange = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(onStoreChange, 200)
    }

    mediaQueryLists.forEach((mql) => {
      mql.addEventListener("change", handleMediaChange)
    })
    window.addEventListener("resize", handleResize)

    return () => {
      mediaQueryLists.forEach((mql) => {
        mql.removeEventListener("change", handleMediaChange)
      })
      window.removeEventListener("resize", handleResize)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

  // সুবিধিতান হুক ════════════════════════════════════════════

export function useIsMobile(): boolean {────────────────

export function useIsMobile(): boolean {
  const { isMobile } = useDevice()
  return isMobile
}