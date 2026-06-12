import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import crypto from 'crypto'

export type AuthUser = {
  id: string
  email: string
  name: string
  phone: string | null
  avatar: string | null
  role: string
  isActive: boolean
}

/**
 * Verify authentication from request headers.
 * Looks for Authorization: Bearer <token> header,
 * validates the session, and returns the user or null.
 */
export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.slice(7)
    if (!token) {
      return null
    }

    const session = await db.session.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!session) {
      return null
    }

    // Check if session is revoked
    if (session.revokedAt) {
      return null
    }

    // Check if session is expired
    if (new Date() > session.expiresAt) {
      return null
    }

    // Check if user is active
    if (!session.user.isActive) {
      return null
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      phone: session.user.phone,
      avatar: session.user.avatar,
      role: session.user.role,
      isActive: session.user.isActive,
    }
  } catch {
    return null
  }
}

/**
 * Check if user has one of the required roles.
 * Returns true if the user's role matches any in the roles array.
 */
export function requireRole(user: AuthUser | null, roles: string[]): boolean {
  if (!user) return false
  return roles.includes(user.role)
}

/**
 * Create a new session in the database.
 * Generates a UUID token and sets expiry to 7 days from now.
 */
export async function createSession(
  userId: string,
  meta?: {
    device?: string
    ipAddress?: string
    userAgent?: string
  }
): Promise<{ token: string; expiresAt: Date }> {
  const token = crypto.randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

  await db.session.create({
    data: {
      userId,
      token,
      expiresAt,
      device: meta?.device,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    },
  })

  // Update last login
  await db.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  })

  return { token, expiresAt }
}

/**
 * Revoke a session by token.
 * Sets the revokedAt timestamp.
 */
export async function revokeSession(token: string): Promise<boolean> {
  try {
    const session = await db.session.findUnique({
      where: { token },
    })

    if (!session || session.revokedAt) {
      return false
    }

    await db.session.update({
      where: { token },
      data: { revokedAt: new Date() },
    })

    return true
  } catch {
    return false
  }
}

/**
 * Create an audit log entry.
 */
export async function createAuditLog(params: {
  userId?: string
  action: string
  entity: string
  entityId?: string
  oldValues?: unknown
  newValues?: unknown
  ipAddress?: string
}): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        oldValues: params.oldValues ? JSON.stringify(params.oldValues) : null,
        newValues: params.newValues ? JSON.stringify(params.newValues) : null,
        ipAddress: params.ipAddress,
      },
    })
  } catch {
    // Audit log creation should not fail the main operation
  }
}

/**
 * Rate limiter - simple in-memory counter per IP.
 * Returns true if the request is rate-limited (should be blocked).
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 20 // 20 requests per minute

export function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  record.count++
  return record.count > RATE_LIMIT_MAX
}

// Clean up stale rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(ip)
    }
  }
}, 5 * 60 * 1000)