// Edge-safe auth primitives (JWT sign/verify, session constants, role helpers).
// IMPORTANT: keep this file free of Node-only imports (bcrypt, prisma) so it can
// be imported from middleware (edge runtime). Node-only helpers live in auth-server.ts.
import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

export const SESSION_COOKIE = 'hjsb_session'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days (seconds)

// Role tiers. New sign-ups always start as "Customer".
export const ROLES = {
  CUSTOMER: 'Customer',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
} as const

export const ADMIN_ROLES = [ROLES.ADMIN, ROLES.SUPER_ADMIN] as string[]

export function isAdminRole(role: string | undefined | null): boolean {
  return !!role && ADMIN_ROLES.includes(role)
}
export function isSuperAdminRole(role: string | undefined | null): boolean {
  return role === ROLES.SUPER_ADMIN
}

export interface SessionPayload extends JWTPayload {
  sub: string // user id
  email: string
  name: string
  role: string
  provider: string
}

function getSecret(): Uint8Array {
  const secret =
    process.env.AUTH_SECRET ||
    // dev fallback so the app runs without configuration; override in .env for production
    'dev-insecure-secret-change-me-hjsb-eppm'
  return new TextEncoder().encode(secret)
}

export async function signSession(
  payload: Omit<SessionPayload, keyof JWTPayload> & Partial<JWTPayload>,
): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret())
}

export async function verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as SessionPayload
  } catch {
    return null
  }
}
