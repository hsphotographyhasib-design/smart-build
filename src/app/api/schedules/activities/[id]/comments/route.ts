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
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const activity = await db.scheduleActivity.findUnique({ where: { id } })
    if (!activity) {
      return NextResponse.json({ success: false, error: 'Activity not found' }, { status: 404 })
    }

    const where: Record<string, unknown> = { activityId: id }
    const [comments, total] = await Promise.all([
      db.scheduleComment.findMany({
        where,
        include: {
          createdBy: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.scheduleComment.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(comments)),
      total,
      page,
      limit,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch comments'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const activity = await db.scheduleActivity.findUnique({ where: { id } })
    if (!activity) {
      return NextResponse.json({ success: false, error: 'Activity not found' }, { status: 404 })
    }

    const body = await request.json()
    const { content, mentions, attachments } = body

    if (!content || !content.trim()) {
      return NextResponse.json({ success: false, error: 'Comment content is required' }, { status: 400 })
    }

    const comment = await db.scheduleComment.create({
      data: {
        scheduleId: activity.scheduleId,
        activityId: id,
        content: content.trim(),
        mentions: mentions ? JSON.stringify(mentions) : null,
        attachments: attachments ? JSON.stringify(attachments) : null,
        createdById: authUser.id,
      },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'CREATE',
      entity: 'ScheduleComment',
      entityId: comment.id,
      newValues: { activityId: id, contentPreview: content.slice(0, 100) },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(comment)) }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create comment'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}