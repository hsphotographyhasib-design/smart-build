// Edge-safe auth primitives (JWT sign/verify, session constants, role helpers).
// IMPORTANT: keep this file free of Node-only imports (bcrypt, prisma).
import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

export const SESSION_COOKIE = 'sb_session'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

// Platform role tiers
export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  TENANT_ADMIN: 'Tenant Admin',
  MANAGER: 'Manager',
  SUPERVISOR: 'Supervisor',
  EMPLOYEE: 'Employee',
  CUSTOMER: 'Customer',
  VENDOR: 'Vendor',
} as const

export const ROLE_LEVELS: Record<string, number> = {
  [ROLES.SUPER_ADMIN]: 100,
  [ROLES.TENANT_ADMIN]: 80,
  [ROLES.MANAGER]: 60,
  [ROLES.SUPERVISOR]: 40,
  [ROLES.EMPLOYEE]: 20,
  [ROLES.CUSTOMER]: 10,
  [ROLES.VENDOR]: 5,
}

export function isAdminRole(role: string | undefined | null): boolean {
  return role === ROLES.SUPER_ADMIN || role === ROLES.TENANT_ADMIN
}

export function isSuperAdminRole(role: string | undefined | null): boolean {
  return role === ROLES.SUPER_ADMIN
}

export function isTenantAdminRole(role: string | undefined | null): boolean {
  return role === ROLES.TENANT_ADMIN
}

export function isPlatformRole(role: string | undefined | null): boolean {
  return role === ROLES.SUPER_ADMIN
}

export interface SessionPayload extends JWTPayload {
  sub: string         // user id
  email: string
  name: string
  role: string        // role name from Role model
  roleLevel: number   // numeric level for quick comparison
  provider: string
  tenantId?: string   // set for tenant users
  tenantSlug?: string
  branchId?: string
}

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || 'dev-insecure-secret-change-me-smartbuild'
  return new TextEncoder().encode(secret)
}

export async function signSession(
  payload: Omit<SessionPayload, keyof JWTPayload> & Partial<JWTPayload>,
): Promise<string> {
  return await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret())
}

export async function verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

// Permission check helper (used in API routes)
export function hasPermission(roleLevel: number, requiredLevel: number): boolean {
  return roleLevel >= requiredLevel
}

// Build a permission string like 'project.create'
export function perm(resource: string, action: string): string {
  return `${resource}.${action}`
}
