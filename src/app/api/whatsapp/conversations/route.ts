import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

// GET — List conversations with search/pagination/filters
export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const tab = searchParams.get('tab') || 'all'
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const assignedTo = searchParams.get('assignedTo')
    const search = searchParams.get('search')
    const unread = searchParams.get('unread')
    const isGroup = searchParams.get('isGroup')
    const isArchived = searchParams.get('isArchived')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100)
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    // Tab filtering
    if (tab === 'unread') {
      where.unreadCount = { gt: 0 }
    } else if (tab === 'open') {
      where.status = 'open'
    } else if (tab === 'assigned_to_me') {
      where.assignedToId = authUser.id
    } else if (tab === 'archived') {
      where.isArchived = true
    }

    // Individual filters override tab
    if (status) where.status = status
    if (priority) where.priority = priority
    if (assignedTo) where.assignedToId = assignedTo
    if (unread === 'true') {
      where.unreadCount = { gt: 0 }
    }
    if (isGroup === 'true') where.isGroup = true
    else if (isGroup === 'false') where.isGroup = false
    if (isArchived === 'true') where.isArchived = true
    else if (isArchived === 'false') where.isArchived = false

    // Search
    if (search) {
      where.OR = [
        { lastMessageText: { contains: search } },
        { contact: { name: { contains: search } } },
        { contact: { pushName: { contains: search } } },
        { contact: { phoneNumber: { contains: search } } },
        { groupName: { contains: search } },
      ]
    }

    const [conversations, total] = await Promise.all([
      db.whatsAppConversation.findMany({
        where,
        include: {
          contact: {
            select: {
              id: true,
              waId: true,
              phoneNumber: true,
              name: true,
              pushName: true,
              profilePicUrl: true,
              isBusiness: true,
              tags: true,
            },
          },
          assignedTo: { select: { id: true, name: true, avatar: true, role: true } },
          complaintLink: { select: { id: true, complaintId: true, linkedAt: true } },
          _count: { select: { messages: true } },
        },
        orderBy: { lastMessageAt: 'desc' },
        skip,
        take: limit,
      }),
      db.whatsAppConversation.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: conversations,
      total,
      page,
      limit,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get conversations'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}