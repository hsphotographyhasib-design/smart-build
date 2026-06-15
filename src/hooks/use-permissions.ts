'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useAppStore, api } from '@/lib/store'
import { PAGE_MODULE_MAP, isSuperAdmin } from '@/lib/rbac'

// ──────────────────────────────────────────────
// Permission Loader Hook
// ──────────────────────────────────────────────

/**
 * usePermissionsLoader
 *
 * Call this once at the app root (e.g. inside AppLayout or HomePage).
 * On mount, it fetches the authenticated user's permission map from
 * /api/roles/my-permissions and stores it in Zustand.
 * Subsequent calls are no-ops (permissionsLoaded = true).
 */
export function usePermissionsLoader(): { loading: boolean; error: string | null } {
  const { user, isAuthenticated, permissionsLoaded, setPermissions } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPermissions = useCallback(async () => {
    if (!isAuthenticated || !user || permissionsLoaded) return

    // Super admin doesn't need to load — they bypass all checks
    if (user.role === 'super_admin') {
      setPermissions({})
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await api.get<Record<string, boolean>>('/api/roles/my-permissions')
      if (res.success && res.data !== undefined) {
        setPermissions(res.data)
      } else {
        // Still mark as loaded to prevent infinite retries
        setPermissions({})
        if (res.error) setError(res.error)
      }
    } catch (err: any) {
      console.error('Failed to load permissions:', err)
      setError(err.message || 'Failed to load permissions')
      setPermissions({})
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user, permissionsLoaded, setPermissions])

  useEffect(() => {
    loadPermissions()
  }, [loadPermissions])

  return { loading, error }
}

// ──────────────────────────────────────────────
// Basic Permission Check
// ──────────────────────────────────────────────

/**
 * usePermission(module, feature, action)
 *
 * Returns true if the current user has the specific permission.
 * Super admin always returns true.
 * Returns false if user is not authenticated or permissions haven't loaded yet.
 *
 * @example
 * const canCreate = usePermission('finance', 'invoices', 'create')
 */
export function usePermission(module: string, feature: string, action: string): boolean {
  const { permissions, user, permissionsLoaded } = useAppStore()

  if (!user) return false
  if (user.role === 'super_admin') return true
  if (!permissionsLoaded) return false // Graceful: don't grant until loaded

  return permissions[`${module}.${feature}.${action}`] === true
}

// ──────────────────────────────────────────────
// Module-Level Access Check
// ──────────────────────────────────────────────

/**
 * useModuleAccess(module)
 *
 * Returns true if the user has ANY permission within a module.
 * Useful for showing/hiding entire sections in the sidebar.
 *
 * @example
 * const hasFinance = useModuleAccess('finance')
 */
export function useModuleAccess(module: string): boolean {
  const { permissions, user, permissionsLoaded } = useAppStore()

  if (!user) return false
  if (user.role === 'super_admin') return true
  if (!permissionsLoaded) return true // Graceful: show while loading

  // Check if ANY key starting with "module." exists
  const prefix = `${module}.`
  for (const key of Object.keys(permissions)) {
    if (key.startsWith(prefix) && permissions[key] === true) {
      return true
    }
  }
  return false
}

// ──────────────────────────────────────────────
// Page-Level Access Check
// ──────────────────────────────────────────────

/**
 * usePageAccess(page)
 *
 * Returns true if the user has "view" permission for the given page.
 * Uses PAGE_MODULE_MAP from rbac.ts to resolve page → module/feature.
 * Returns true if the page is NOT in the map (unknown pages are allowed).
 * Returns true for super_admin.
 *
 * @example
 * const canSeeInvoices = usePageAccess('invoices')
 */
export function usePageAccess(page: string): boolean {
  const { permissions, user, permissionsLoaded } = useAppStore()

  if (!user) return false
  if (user.role === 'super_admin') return true
  if (!permissionsLoaded) return true // Graceful: allow while loading

  const mapping = PAGE_MODULE_MAP[page]
  if (!mapping) return true // Unknown page — allow

  return permissions[`${mapping.module}.${mapping.feature}.view`] === true
}

// ──────────────────────────────────────────────
// Action Guard Bundle
// ──────────────────────────────────────────────

export interface ActionGuardResult {
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canApprove: boolean
  canExport: boolean
}

/**
 * useActionGuard(module, feature)
 *
 * Returns a bundle of permission booleans for a given module+feature.
 * Super admin always gets all true.
 *
 * @example
 * const guard = useActionGuard('finance', 'invoices')
 * if (guard.canCreate) { ... }
 */
export function useActionGuard(module: string, feature: string): ActionGuardResult {
  const { permissions, user, permissionsLoaded } = useAppStore()

  if (!user || !permissionsLoaded) {
    return {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canApprove: false,
      canExport: false,
    }
  }

  if (user.role === 'super_admin') {
    return {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canApprove: true,
      canExport: true,
    }
  }

  const prefix = `${module}.${feature}.`
  return {
    canView: permissions[`${prefix}view`] === true,
    canCreate: permissions[`${prefix}create`] === true,
    canEdit: permissions[`${prefix}edit`] === true,
    canDelete: permissions[`${prefix}delete`] === true,
    canApprove: permissions[`${prefix}approve`] === true,
    canExport: permissions[`${prefix}export`] === true,
  }
}

// ──────────────────────────────────────────────
// Static Helper (non-hook, for use outside components)
// ──────────────────────────────────────────────

/**
 * checkPermission(permissions, userRole, module, feature, action)
 *
 * A pure function version of usePermission for use in callbacks,
 * event handlers, or utility functions (not React components).
 */
export function checkPermission(
  permissions: Record<string, boolean>,
  userRole: string | undefined,
  permissionsLoaded: boolean,
  module: string,
  feature: string,
  action: string
): boolean {
  if (!userRole) return false
  if (isSuperAdmin(userRole)) return true
  if (!permissionsLoaded) return false
  return permissions[`${module}.${feature}.${action}`] === true
}

/**
 * checkPageAccess(permissions, userRole, permissionsLoaded, page)
 *
 * A pure function version of usePageAccess for use outside components.
 */
export function checkPageAccess(
  permissions: Record<string, boolean>,
  userRole: string | undefined,
  permissionsLoaded: boolean,
  page: string
): boolean {
  if (!userRole) return false
  if (isSuperAdmin(userRole)) return true
  if (!permissionsLoaded) return true
  const mapping = PAGE_MODULE_MAP[page]
  if (!mapping) return true
  return permissions[`${mapping.module}.${mapping.feature}.view`] === true
}
