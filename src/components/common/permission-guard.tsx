'use client'

import React from 'react'
import { useAppStore } from '@/lib/store'
import { usePermission } from '@/hooks/use-permissions'

// ──────────────────────────────────────────────
// PermissionGuard — Reusable wrapper component
// ──────────────────────────────────────────────

interface PermissionGuardProps {
  /** RBAC module name, e.g. "finance" */
  module: string
  /** RBAC feature name, e.g. "invoices" */
  feature: string
  /** RBAC action name, e.g. "create", "edit", "delete" */
  action: string
  /** Content to render when permission is granted */
  children: React.ReactNode
  /** Optional content to render when permission is denied (defaults to null) */
  fallback?: React.ReactNode
}

/**
 * <PermissionGuard module="finance" feature="invoices" action="create">
 *   <Button>Create Invoice</Button>
 * </PermissionGuard>
 *
 * Renders children only if the current user has the specified permission.
 * Super admin always passes.
 * Returns null (or fallback) if permission is denied or not yet loaded.
 */
export function PermissionGuard({
  module,
  feature,
  action,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const allowed = usePermission(module, feature, action)

  if (!allowed) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// ──────────────────────────────────────────────
// ModuleGuard — Hide entire module sections
// ──────────────────────────────────────────────

interface ModuleGuardProps {
  /** RBAC module name, e.g. "finance" */
  module: string
  /** Content to render when user has ANY permission in this module */
  children: React.ReactNode
  /** Optional content to render when user has no access (defaults to null) */
  fallback?: React.ReactNode
}

/**
 * <ModuleGuard module="finance">
 *   <FinanceSection />
 * </ModuleGuard>
 *
 * Renders children only if the user has ANY permission in the given module.
 * Super admin always passes. Shows content while permissions are loading.
 */
export function ModuleGuard({
  module,
  children,
  fallback = null,
}: ModuleGuardProps) {
  const { permissions, user, permissionsLoaded } = useAppStore()

  if (!user) return <>{fallback}</>
  if (user.role === 'super_admin') return <>{children}</>
  if (!permissionsLoaded) return <>{children}</> // Show while loading

  const prefix = `${module}.`
  const hasAny = Object.keys(permissions).some(
    (key) => key.startsWith(prefix) && permissions[key] === true
  )

  if (!hasAny) return <>{fallback}</>
  return <>{children}</>
}
