import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

/**
 * GET /api/permissions — List all permissions grouped by module > feature > [actions]
 * Admin and super_admin can access.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    const permissions = await db.permission.findMany({
      orderBy: [{ module: 'asc' }, { feature: 'asc' }, { action: 'asc' }],
    })

    // Group: module → feature → action[]
    const grouped: Record<string, Record<string, string[]>> = {}

    for (const p of permissions) {
      if (!grouped[p.module]) grouped[p.module] = {}
      if (!grouped[p.module][p.feature]) grouped[p.module][p.feature] = []
      grouped[p.module][p.feature].push(p.action)
    }

    // Convert to the desired format: module → feature → { action: description }
    const data: Record<string, Record<string, Record<string, string | null>>> = {}

    for (const p of permissions) {
      if (!data[p.module]) data[p.module] = {}
      if (!data[p.module][p.feature]) data[p.module][p.feature] = {}
      data[p.module][p.feature][p.action] = p.description
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[GET /api/permissions]', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}