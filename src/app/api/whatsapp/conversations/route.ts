import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

// GET — ফিল্টার সহ কথোপকথনের তালিকা
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
    const hasTicket = searchParams.get('hasTicket')
    const unread = searchParams.get('unread')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    // ট্যাব ফিল্টারিং
    if (tab === 'unread') {
      where.unreadCount = { gt: 0 }
    } else if (tab === 'open') {
      where.status = 'open'
    } else if (tab === 'assigned_to_me') {
      where.assignedToId = authUser.id
    } else if (tab === 'has_ticket') {
      where.ticketId = { not: null }
    }

    // পৃথক ফিল্টার ট্যাব ওভাররাইড করছে
    if (status) where.status = status
    if (priority) where.priority = priority
    if (assignedTo) where.assignedToId = assignedTo
    if (hasTicket === 'true') {
      where.ticketId = { not: null }
    } else if (hasTicket === 'false') {
      where.ticketId = null
    }
    if (unread === 'true') {
      where.unreadCount = { gt: 0 }
    }

    // সার্চ
    if (search) {
      where.OR = [
        { lastMessageText: { contains: search } },
        { contact: { name: { contains: search } } },
        { contact: { pushName: { contains: search } } },
        { contact: { phone: { contains: search } } },
        { tags: { contains: search } },
      ]
    }

    const [conversations, total] = await Promise.all([
      db.whatsAppConversation.findMany({
        where,
        include: {
          contact: {
            include: {
              customer: { select: { id: true, name: true, phone: true, email: true } },
            },
          },
          assignedTo: { select: { id: true, name: true, avatar: true, role: true } },
          ticket: { select: { id: true, ticketNo: true, status: true, subject: true } },
          _count: { select: { messages: true, attachments: true } },
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