// src/config/permissions.ts
// অনুমতি কনফিগারেশন
// RBAC সহায়ি লাইব্য় utils lib/rbac থেকে কেন্ট্রাল অ্যাস
// পুনঃয় অ্যাডমস্টোগায় ফল

export {
  ROLES,
  ROLE_LABELS,
  hasMinRoleLevel,
  canAccessPage,
  filterNavForRole,
  canAccessRoute,
  checkRoutePermission,
} from '@/lib/rbac'

export type { Role, RoutePermission } from '@/lib/rbac'
export { ROUTE_PERMISSIONS } from '@/lib/rbac'