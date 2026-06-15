import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level')
    const parentId = searchParams.get('parentId')
    const isActive = searchParams.get('isActive')
    const includeUsage = searchParams.get('includeUsage') === 'true'

    const where: Record<string, unknown> = {}
    if (level) where.level = Number(level)
    if (parentId) where.parentId = parentId
    if (isActive !== null && isActive !== undefined && isActive !== 'all') {
      where.isActive = isActive === 'true'
    }

    const costCodes = await db.costCode.findMany({
      where,
      include: {
        parent: { select: { id: true, code: true, name: true } },
        children: {
          select: { id: true, code: true, name: true, level: true, isActive: true, sortOrder: true },
          orderBy: { sortOrder: 'asc' },
        },
        ...(includeUsage ? {
          _count: { select: { budgetItems: true } },
        } : {}),
      },
      orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }, { code: 'asc' }],
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(costCodes)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { code, name, level = 1, parentId, description, unitType, sortOrder = 0 } = body

    if (!code || !name) {
      return NextResponse.json({ success: false, error: 'Code and name are required' }, { status: 400 })
    }

    const existing = await db.costCode.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Cost code already exists' }, { status: 400 })
    }

    const costCode = await db.costCode.create({
      data: {
        code,
        name,
        level: Number(level),
        parentId: parentId || null,
        description: description || null,
        unitType: unitType || null,
        sortOrder: Number(sortOrder),
      },
      include: { parent: { select: { id: true, code: true, name: true } } },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(costCode)) }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}