import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const skill = await db.skill.findUnique({
      where: { id },
      include: {
        workers: true,
      },
    })

    if (!skill) {
      return NextResponse.json({ success: false, error: 'Skill not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(skill)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const existing = await db.skill.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Skill not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, category, description } = body

    // ডুপ্লিকেট যাচাই করা হচ্ছে name if changing
    if (name && name !== existing.name) {
      const duplicate = await db.skill.findUnique({ where: { name } })
      if (duplicate) {
        return NextResponse.json({ success: false, error: 'Skill with this name already exists' }, { status: 400 })
      }
    }

    const result = await db.skill.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(category !== undefined && { category }),
        ...(description !== undefined && { description }),
      },
      include: {
        workers: true,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'update',
      entity: 'Skill',
      entityId: id,
      oldValues: { name: existing.name, category: existing.category },
      newValues: { name: result.name, category: result.category },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(result)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const existing = await db.skill.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Skill not found' }, { status: 404 })
    }

    await db.skill.delete({ where: { id } })

    await createAuditLog({
      userId: user.id,
      action: 'delete',
      entity: 'Skill',
      entityId: id,
      oldValues: { name: existing.name },
    })

    return NextResponse.json({ success: true, data: { id } })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}