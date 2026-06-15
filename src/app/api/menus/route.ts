import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') || user.role

    // Fetch groups with items and sub-children, filtered by role
    const groups = await db.menuGroup.findMany({
      where: {
        isActive: true,
        // If not admin, filter by role permissions
        ...(role !== 'admin'
          ? {
              roleAccess: {
                some: {
                  roleId: role,
                  canView: true,
                },
              },
            }
          : {}),
      },
      include: {
        items: {
          where: { isHidden: false },
          orderBy: { sortOrder: 'asc' },
          include: {
            children: {
              where: { isHidden: false },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })

    // Transform to tree structure
    const tree = groups.map((group) => ({
      id: group.id,
      code: group.code,
      label: group.label,
      icon: group.icon,
      sortOrder: group.sortOrder,
      items: group.items.map((item) => ({
        id: item.id,
        label: item.label,
        page: item.page,
        icon: item.icon,
        sortOrder: item.sortOrder,
        isCategory: item.page.startsWith('__cat__'),
        hasChildren: item.children.length > 0,
        children: item.children.map((child) => ({
          id: child.id,
          label: child.label,
          page: child.page,
          icon: child.icon,
          sortOrder: child.sortOrder,
        })),
      })),
    }))

    return NextResponse.json({ success: true, data: tree })
  } catch (error: any) {
    console.error('Menu API error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
