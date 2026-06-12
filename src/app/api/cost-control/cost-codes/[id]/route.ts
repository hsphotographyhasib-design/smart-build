import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const costCode = await db.costCode.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, code: true, name: true } },
        children: {
          orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }],
        },
        _count: { select: { budgetItems: true, children: true } },
      },
    })

    if (!costCode) {
      return NextResponse.json({ success: false, error: 'Cost code not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(costCode)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { code, name, description, unitType, isActive, sortOrder } = body

    const existing = await db.costCode.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Cost code not found' }, { status: 404 })
    }

    if (code && code !== existing.code) {
      const codeExists = await db.costCode.findUnique({ where: { code } })
      if (codeExists) {
        return NextResponse.json({ success: false, error: 'Code already in use' }, { status: 400 })
      }
    }

    const updateData: Record<string, unknown> = {}
    if (code !== undefined) updateData.code = code
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (unitType !== undefined) updateData.unitType = unitType
    if (isActive !== undefined) updateData.isActive = isActive
    if (sortOrder !== undefined) updateData.sortOrder = Number(sortOrder)

    const updated = await db.costCode.update({
      where: { id },
      data: updateData,
      include: { parent: { select: { id: true, code: true, name: true } } },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(updated)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const costCode = await db.costCode.findUnique({
      where: { id },
      include: { _count: { select: { budgetItems: true, children: true } } },
    })

    if (!costCode) {
      return NextResponse.json({ success: false, error: 'Cost code not found' }, { status: 404 })
    }

    if (costCode._count.budgetItems > 0) {
      return NextResponse.json({ success: false, error: 'Cannot delete cost code with budget items' }, { status: 400 })
    }
    if (costCode._count.children > 0) {
      return NextResponse.json({ success: false, error: 'Cannot delete cost code with children' }, { status: 400 })
    }

    await db.costCode.delete({ where: { id } })
    return NextResponse.json({ success: true, data: { id } })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}