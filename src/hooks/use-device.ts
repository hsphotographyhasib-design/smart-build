"use client"

import { useSyncExternalStore, useCallback, useRef } from "react"

// ── Breakpoint constants ──
export const MOBILE_BREAKPOINT = 768
export const TABLET_BREAKPOINT = 1024
export const LAPTOP_BREAKPOINT = 1280

// ── Types ──
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

// ── Helper functions ──

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

/** SSR-safe default (assumed desktop) */
const SSR_DEFAULT: DeviceInfo = buildDeviceInfo(1280, 800)

// ── External store (module-level) ──
// We keep a cached snapshot so useSyncExternalStore returns a stable reference
// when the viewport hasn't changed.

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

/** Device hook - provides full device information */
export function useDevice(): DeviceInfo {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const subscribe = useCallback((onStoreChange: () => void) => {
    const mediaQueryLists = BREAKPOINT_QUERIES.map((q) => window.matchMedia(q))

    // Debounced resize listener for accurate resize detection
    const handleResize = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(onStoreChange, 200)
    }

    // matchMedia listener only fires on breakpoint cross
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

/** Convenience hook - returns only isMobile boolean */
export function useIsMobile(): boolean {
  const { isMobile } = useDevice()
  return isMobile
}
