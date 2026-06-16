import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, createAuditLog } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id } = await params

    const discussion = await db.discussion.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, code: true } },
        discussionComment: { orderBy: { createdAt: 'asc' } },
      },
    })

    if (!discussion) return NextResponse.json({ success: false, error: 'Discussion not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(discussion)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id } = await params

    const existing = await db.discussion.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ success: false, error: 'Discussion not found' }, { status: 404 })

    const body = await request.json()
    const { title, description, category, priority, assignedTo, dueDate, status } = body

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (priority !== undefined) updateData.priority = priority
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo || null
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
    if (status !== undefined) {
      updateData.status = status
      if (status === 'resolved') updateData.resolvedAt = new Date()
    }

    const discussion = await db.discussion.update({
      where: { id },
      data: updateData,
      include: { project: { select: { id: true, name: true, code: true } } },
    })

    await createAuditLog({ userId: user.id, action: 'UPDATE', entity: 'Discussion', entityId: id, newValues: updateData })
    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(discussion)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to update discussion' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id } = await params

    const existing = await db.discussion.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ success: false, error: 'Discussion not found' }, { status: 404 })

    await db.discussion.delete({ where: { id } })
    await createAuditLog({ userId: user.id, action: 'DELETE', entity: 'Discussion', entityId: id })
    return NextResponse.json({ success: true, data: { id } })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete discussion' }, { status: 500 })
  }
}