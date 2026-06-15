import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, requireRole, type AuthUser } from '@/lib/auth'
import { canAccessRoute } from '@/lib/rbac'

export type AuthResult =
  | { user: AuthUser; forbidden?: false }
  | { forbidden: true; response: NextResponse }

/**
 * Authenticate and authorize a request.
 * Returns { user } on success, or { forbidden: true, response } on failure.
 */
export async function authAndAuthorize(
  request: NextRequest,
  method: string,
  allowedRoles?: string[]
): Promise<AuthResult> {
  const user = await verifyAuth(request)
  if (!user) {
    return {
      forbidden: true,
      response: NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      ),
    }
  }

  // If explicit roles provided, use requireRole
  if (allowedRoles && allowedRoles.length > 0) {
    if (!requireRole(user, allowedRoles)) {
      return {
        forbidden: true,
        response: NextResponse.json(
          { success: false, error: 'Access denied. Insufficient permissions.' },
          { status: 403 }
        ),
      }
    }
  }

  return { user }
}

/**
 * Shorthand: check auth only (no role check).
 */
export async function authenticate(request: NextRequest): Promise<AuthResult> {
  return authAndAuthorize(request, 'GET', [])
}