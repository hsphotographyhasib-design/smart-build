import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, requireRole, type AuthUser } from '@/lib/auth'
import { canAccessRoute } from '@/lib/rbac'

export type AuthResult =
  | { user: AuthUser; forbidden?: false }
  | { forbidden: true; response: NextResponse }

/**
 * একটি অনুরোধ প্রমাণীকরণ ও অনুমোদন করা হচ্ছে।
 * সফল হলে { user } প্রদান করে, ব্যর্থ হলে { forbidden: true, response } প্রদান করে।
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

  // সুনির্দিষ্ট ভূমিকা প্রদান করা হলে, requireRole ব্যবহার করা হচ্ছে
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
 * সংক্ষিপ্ত রূপ: শুধুমাত্র প্রমাণীকরণ পরীক্ষা (কোনো ভূমিকা পরীক্ষা নেই)।
 */
export async function authenticate(request: NextRequest): Promise<AuthResult> {
  return authAndAuthorize(request, 'GET', [])
}