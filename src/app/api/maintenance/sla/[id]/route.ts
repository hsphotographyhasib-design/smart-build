import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const template = await db.sLATemplate.findUnique({ where: { id } })
    if (!template) {
      return NextResponse.json({ success: false, error: 'SLA template not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(template)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch SLA template'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()

    const existing = await db.sLATemplate.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'SLA template not found' }, { status: 404 })
    }

    const { name, priority, responseTimeMinutes, resolutionTimeMinutes, description, isActive } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (priority !== undefined) {
      // অগ্রাধিকার পরিবর্তন করলে অনন্যতা যাচাই করা হচ্ছে
      if (priority !== existing.priority) {
        const conflict = await db.sLATemplate.findUnique({ where: { priority } })
        if (conflict) {
          return NextResponse.json({ success: false, error: `SLA template for priority '${priority}' already exists` }, { status: 400 })
        }
      }
      updateData.priority = priority
    }
    if (responseTimeMinutes !== undefined) updateData.responseTimeMinutes = responseTimeMinutes
    if (resolutionTimeMinutes !== undefined) updateData.resolutionTimeMinutes = resolutionTimeMinutes
    if (description !== undefined) updateData.description = description
    if (isActive !== undefined) updateData.isActive = isActive

    const template = await db.sLATemplate.update({
      where: { id },
      data: updateData as any,
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'UPDATE',
      entity: 'SLATemplate',
      entityId: id,
      newValues: updateData,
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(template)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update SLA template'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const existing = await db.sLATemplate.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'SLA template not found' }, { status: 404 })
    }

    await db.sLATemplate.delete({ where: { id } })

    await createAuditLog({
      userId: authUser.id,
      action: 'DELETE',
      entity: 'SLATemplate',
      entityId: id,
    })

    return NextResponse.json({ success: true, data: { id } })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete SLA template'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}