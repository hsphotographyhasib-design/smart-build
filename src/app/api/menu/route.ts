import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/menu — Return menu configuration for the authenticated user's role
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const role = user.role || 'labour'

    // Fetch all active menu groups with their visible items
    const groups = await db.menuGroup.findMany({
      where: { isActive: true },
      include: {
        items: {
          where: { isHidden: false },
          orderBy: { sortOrder: 'asc' },
        },
        roleAccess: {
          where: { roleId: role, canView: true },
          select: { groupId: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })

    // If no role-based permissions are configured yet, return all groups
    // (backward compatible with the hardcoded roleGroupAccess map)
    const hasPermissions = groups.some((g) => g.roleAccess.length > 0)

    const visibleGroups = hasPermissions
      ? groups.filter((g) => g.roleAccess.length > 0)
      : groups

    const menu = visibleGroups.map((g) => ({
      id: g.code,
      label: g.label,
      icon: g.icon,
      items: g.items.map((item) => ({
        label: item.label,
        page: item.page,
        icon: item.icon,
      })),
    }))

    return NextResponse.json({
      success: true,
      data: menu,
      role,
    })
  } catch (error) {
    console.error('Menu GET error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch menu' }, { status: 500 })
  }
}
