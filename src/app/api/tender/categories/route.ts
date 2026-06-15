import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')

    const where: Record<string, unknown> = {}
    if (isActive !== null && isActive !== '') {
      where.isActive = isActive === 'true'
    }

    const categories = await db.tenderCategory.findMany({
      where,
      include: {
        _count: {
          select: {
            bidPackages: true,
            vendors: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(categories)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load categories'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, code, description, sortOrder, isActive } = body

    if (!name || !code) {
      return NextResponse.json({ success: false, error: 'name and code are required' }, { status: 400 })
    }

    const category = await db.tenderCategory.create({
      data: {
        name,
        code,
        description: description || null,
        sortOrder: sortOrder || 0,
        isActive: isActive !== false,
      },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(category)) }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create category'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}