// Node-only auth helpers (bcrypt, prisma, cookie read/write). Never import from middleware.
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  verifySession,
  signSession,
  isAdminRole,
  type SessionPayload,
} from '@/lib/auth'

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10)
}
export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_MAX_AGE,
}

/** Issue a session cookie for a user (call from route handlers / server actions). */
export async function issueSession(user: {
  id: string
  email: string
  name: string
  role: string
  provider: string
}): Promise<void> {
  const token = await signSession({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    provider: user.provider,
  })
  const store = await cookies()
  store.set(SESSION_COOKIE, token, cookieOptions)
}

export async function clearSession(): Promise<void> {
  const store = await cookies()
  store.set(SESSION_COOKIE, '', { ...cookieOptions, maxAge: 0 })
}

/** Decode-only session payload from the cookie (no DB hit). */
export async function getSessionPayload(): Promise<SessionPayload | null> {
  const store = await cookies()
  return verifySession(store.get(SESSION_COOKIE)?.value)
}

/** Fresh user from DB (reflects role/active changes since the token was issued). */
export async function getSessionUser() {
  const payload = await getSessionPayload()
  if (!payload?.sub) return null
  const user = await db.appUser.findUnique({ where: { id: payload.sub } })
  if (!user || !user.active) return null
  return user
}

/** Returns the current admin/super-admin user, or null if not authorized. */
export async function getAdminUser() {
  const user = await getSessionUser()
  if (!user || !isAdminRole(user.role)) return null
  return user
}
