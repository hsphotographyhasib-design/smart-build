import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

/**
 * GET /api/roles/my-permissions — বর্তমান ব্যবহারকারীর অনুমতি ফ্ল্যাট অবজেক্ট হিসেবে সংগ্রহ করা হচ্ছে
 * যেকোনো প্রমাণীকৃত ব্যবহারকারী অ্যাক্সেস করতে পারবেন।
 * Super admin { _super_admin: true } প্রদান করে।
 * অন্যরা { "finance.invoice_management.view": true, ... } প্রদান করে
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Super admin এর সকল অনুমতি আছে
    if (user.role === 'super_admin') {
      return NextResponse.json({ success: true, data: { _super_admin: true } })
    }

    // ভূমিকা খোঁজা হচ্ছে
    const role = await db.role.findUnique({
      where: { code: user.role },
    })

    if (!role) {
      // অজানা ভূমিকা — খালি প্রদান করা হচ্ছে
      return NextResponse.json({ success: true, data: {} })
    }

    // সকল অনুমোদিত অনুমতি সংগ্রহ করা হচ্ছে
    const rolePermissions = await db.rolePermission.findMany({
      where: {
        roleId: role.id,
        isAllowed: true,
      },
      include: {
        permission: true,
      },
    })

    const data: Record<string, boolean> = {}
    for (const rp of rolePermissions) {
      const key = `${rp.permission.module}.${rp.permission.feature}.${rp.permission.action}`
      data[key] = true
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[GET /api/roles/my-permissions]', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}