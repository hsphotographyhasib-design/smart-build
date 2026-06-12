import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, createAuditLog } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id } = await params

    const announcement = await db.announcement.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
    })

    if (!announcement) return NextResponse.json({ success: false, error: 'Announcement not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(announcement)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id } = await params

    const existing = await db.announcement.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ success: false, error: 'Announcement not found' }, { status: 404 })

    const body = await request.json()
    const { title, content, category, priority, targetScope, projectId, expiresAt } = body

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (category !== undefined) updateData.category = category
    if (priority !== undefined) updateData.priority = priority
    if (targetScope !== undefined) updateData.targetScope = targetScope
    if (projectId !== undefined) updateData.projectId = targetScope === 'specific_project' ? (projectId || null) : null
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null

    const announcement = await db.announcement.update({
      where: { id },
      data: updateData,
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
    })

    await createAuditLog({ userId: user.id, action: 'UPDATE', entity: 'Announcement', entityId: id, newValues: updateData })
    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(announcement)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to update announcement' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id } = await params

    const existing = await db.announcement.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ success: false, error: 'Announcement not found' }, { status: 404 })

    await db.announcement.delete({ where: { id } })
    await createAuditLog({ userId: user.id, action: 'DELETE', entity: 'Announcement', entityId: id })
    return NextResponse.json({ success: true, data: { id } })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete announcement' }, { status: 500 })
  }
}