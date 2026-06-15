'use client'

import React from 'react'
import { useAppStore } from '@/lib/store'
import { usePermission } from '@/hooks/use-permissions'

// ──────────────────────────────────────────────
// PermissionGuard — পুনরায় ব্যবহারযোগ্য র‍্যাপার কম্পোনেন্ট
// ──────────────────────────────────────────────

interface PermissionGuardProps {
  /** RBAC মডিউলের নাম, যেমন "finance" */
  module: string
  /** RBAC ফিচারের নাম, যেমন "invoices" */
  feature: string
  /** RBAC অ্যাকশনের নাম, যেমন "create", "edit", "delete" */
  action: string
  /** অনুমতি দেওয়া হলে রেন্ডার করার বিষয়বস্তু */
  children: React.ReactNode
  /** অনুমতি অস্বীকৃত হলে রেন্ডার করার ঐচ্ছিক বিষয়বস্তু (ডিফল্ট null) */
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
// ModuleGuard — সম্পূর্ণ মডিউল সেকশন লুকান
// ──────────────────────────────────────────────

interface ModuleGuardProps {
  /** RBAC module name, e.g. "finance" */
  module: string
  /** Content to render when user has ANY permission in this module */
  children: React.ReactNode
  /** ব্যবহারকারীর অ্যাক্সেস না থাকলে রেন্ডার করার ঐচ্ছিক বিষয়বস্তু (ডিফল্ট null) */
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
