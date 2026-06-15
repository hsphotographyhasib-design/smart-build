// src/config/index.ts
// Configuration - Barrel Export
// Central access point for all app configuration

export { navSections } from './navigation'
export type { NavItem, NavSection } from './navigation'

export {
  ROLES,
  ROLE_LABELS,
  ROUTE_PERMISSIONS,
  hasMinRoleLevel,
  canAccessPage,
  filterNavForRole,
  canAccessRoute,
  checkRoutePermission,
} from './permissions'

export type { Role, RoutePermission } from './permissions'