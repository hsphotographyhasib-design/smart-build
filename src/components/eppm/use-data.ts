'use client'

import { useEffect, useState } from 'react'

export interface DashboardData {
  kpis: any
  health: { Green: number; Yellow: number; Red: number }
  portfolios: any[]; programs: any[]; projects: any[]
  risks: any[]; activities: any[]
  criticalActivities: any[]; delayedActivities: any[]
  cashFlow: { label: string; planned: number; actual: number; forecast: number }[]
  resourceByType: Record<string, number>; resourceCount: Record<string, number>
  changes: any[]; baselines: any[]
}

let cache: DashboardData | null = null
const listeners = new Set<(d: DashboardData) => void>()

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(cache)

  useEffect(() => {
    if (cache) { setData(cache); return }
    listeners.add(setData)
    if (listeners.size === 1) {
      fetch('/api/dashboard').then(r => r.json()).then(d => {
        cache = d
        listeners.forEach(l => l(d))
      })
    }
    return () => { listeners.delete(setData) }
  }, [])

  return data
}

export function refreshDashboard() {
  cache = null
  fetch('/api/dashboard').then(r => r.json()).then(d => {
    cache = d
    listeners.forEach(l => l(d))
  })
}

export interface ProjectDetail {
  project: any; wbsTree: any[]; activities: any[]
  dependencies: any[]; evm: any; sCurve: any[]; resourceHistogram: any[]
}

const projCache = new Map<string, ProjectDetail>()
const projListeners = new Map<string, Set<(d: ProjectDetail) => void>>()

export function useProjectDetail(projectId: string | null) {
  const [data, setData] = useState<ProjectDetail | null>(projectId ? projCache.get(projectId) ?? null : null)

  useEffect(() => {
    if (!projectId) { setData(null); return }
    const cached = projCache.get(projectId)
    if (cached) { setData(cached); return }
    let set = projListeners.get(projectId)
    if (!set) { set = new Set(); projListeners.set(projectId, set) }
    set.add(setData)
    setData(null)
    if (set.size === 1) {
      fetch(`/api/projects/${projectId}`).then(r => r.json()).then(d => {
        projCache.set(projectId, d)
        projListeners.get(projectId)?.forEach(l => l(d))
      })
    }
    return () => { projListeners.get(projectId)?.delete(setData) }
  }, [projectId])

  return data
}
