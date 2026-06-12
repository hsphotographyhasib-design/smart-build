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

    const crew = await db.crew.findUnique({
      where: { id },
      include: {
        members: true,
      },
    })

    if (!crew) {
      return NextResponse.json({ success: false, error: 'Crew not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(crew)) })
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

    const existing = await db.crew.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Crew not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, type, leaderName, leaderId, leaderType, description, isActive } = body

    const result = await db.crew.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(leaderName !== undefined && { leaderName }),
        ...(leaderId !== undefined && { leaderId }),
        ...(leaderType !== undefined && { leaderType }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        members: true,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'update',
      entity: 'Crew',
      entityId: id,
      oldValues: { name: existing.name, type: existing.type },
      newValues: { name: result.name, type: result.type },
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

    const existing = await db.crew.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Crew not found' }, { status: 404 })
    }

    await db.crew.delete({ where: { id } })

    await createAuditLog({
      userId: user.id,
      action: 'delete',
      entity: 'Crew',
      entityId: id,
      oldValues: { name: existing.name, type: existing.type },
    })

    return NextResponse.json({ success: true, data: { id } })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}