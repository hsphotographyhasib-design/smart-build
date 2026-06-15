// src/config/permissions.ts
// Permissions Configuration
// Re-exports RBAC utilities from lib/rbac for centralized access

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