import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, createAuditLog } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const priority = searchParams.get('priority')

    const now = new Date()
    const where: Record<string, unknown> = {
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: now } },
      ],
    }
    if (category && category !== 'all') where.category = category
    if (priority && priority !== 'all') where.priority = priority

    const announcements = await db.announcement.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(announcements)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { title, content, category, priority, targetScope, projectId, expiresAt } = body

    if (!title || !content) {
      return NextResponse.json({ success: false, error: 'Title and content are required' }, { status: 400 })
    }

    const announcement = await db.announcement.create({
      data: {
        title,
        content,
        category: category || 'general',
        priority: priority || 'normal',
        targetScope: targetScope || 'all',
        projectId: targetScope === 'specific_project' ? (projectId || null) : null,
        createdById: user.id,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
    })

    await createAuditLog({ userId: user.id, action: 'CREATE', entity: 'Announcement', entityId: announcement.id })
    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(announcement)) }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create announcement' }, { status: 500 })
  }
}