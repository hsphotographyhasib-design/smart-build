/**
 * SmartBuild ERP - API রুট গার্ড
 *
 * সকল API রুট হ্যান্ডলারের জন্য কেন্দ্রীভূত প্রমাণীকরণ ও RBAC প্রয়োগ।
 * এই হ্যান্ডলার র‍্যাপার প্রতিটি API অনুরোধে:
 * 1. Bearer টোকেন যাচাই করে (verifyAuth)
 * 2. রুট পারমিশন পরীক্ষা করে (canAccessRoute)
 * 3. ব্যবহারকারী তথ্য সংযুক্ত করে হ্যান্ডলার চালায়
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, type AuthUser } from '@/lib/auth'
import { canAccessRoute } from '@/lib/rbac'

type HandlerFunction = (req: NextRequest, context?: any) => Promise<NextResponse>

/**
 * API হ্যান্ডলারকে প্রমাণীকরণ ও RBAC দিয়ে মোড়ানোর ফাংশন।
 * প্রমাণীকরণ ব্যর্থ হলে 401, অনুমতি না থাকলে 403 প্রদান করে।
 *
 * ব্যবহার:
 *   export async function GET(req: NextRequest) {
 *     return withAuth(req, async (req, { user }) => {
 *       // user এখানে AuthUser টাইপের এবং নিশ্চিতভাবে বৈধ
 *       return NextResponse.json({ success: true })
 *     })
 *   }
 */
export async function withAuth(
  req: NextRequest,
  handler: HandlerFunction,
  context?: any
): Promise<NextResponse> {
  // ১. প্রমাণীকরণ যাচাই
  const user = await verifyAuth(req)
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // ২. রুট পারমিশন পরীক্ষা
  const pathname = new URL(req.url).pathname
  const method = req.method

  if (!canAccessRoute(user.role, pathname, method)) {
    return NextResponse.json(
      { success: false, error: 'Forbidden' },
      { status: 403 }
    )
  }

  // ৩. ব্যবহারকারী তথ্য সংযুক্ত করে হ্যান্ডলার চালানো
  return handler(req, { ...context, user })
}

/**
 * হালকা সংস্করণ - শুধু প্রমাণীকরণ যাচাই করে, RBAC পরীক্ষা করে না।
 * সকল প্রমাণীকৃত ব্যবহারকারীর জন্য উপযুক্ত রুটে ব্যবহার করুন (যেমন /api/auth/me)।
 */
export async function withAuthOnly(
  req: NextRequest,
  handler: HandlerFunction,
  context?: any
): Promise<NextResponse> {
  const user = await verifyAuth(req)
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return handler(req, { ...context, user })
}