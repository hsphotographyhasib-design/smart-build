import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

const WA_SOCKET_PORT = 3096

async function emitEvent(event: string, data: unknown) {
  try {
    await fetch(`http://localhost:${WA_SOCKET_PORT}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, data }),
    })
  } catch {
    // Socket সার্ভিস চলছে না হতে পারে
  }
}

// GET — মেসেজ, পরিচিতি এবং সংযুক্ত টিকেট সহ সম্পূর্ণ কথোপকথন
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const conversation = await db.whatsAppConversation.findUnique({
      where: { id },
      include: {
        contact: true,
        assignedTo: { select: { id: true, name: true, avatar: true, role: true, phone: true } },
        ticket: {
          include: {
            assignedTechnician: {
              include: { user: { select: { id: true, name: true, avatar: true } } },
            },
            timeline: { orderBy: { createdAt: 'desc' }, take: 5 },
          },
        },
        complaintLinks: {
          include: {
            ticket: { select: { id: true, ticketNo: true, status: true, subject: true, category: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sentBy: { select: { id: true, name: true, avatar: true } },
            contactSender: { select: { id: true, name: true, pushName: true, profilePicUrl: true } },
            attachments: true,
          },
        },
        attachments: true,
        _count: { select: { messages: true, attachments: true } },
      },
    })

    if (!conversation) {
      return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: conversation })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get conversation'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// PUT — কথোপকথন আপডেট করা হচ্ছে (assign, priority, status, tags, internal note)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { assignedToId, priority, status, tags, internalNote } = body

    const conversation = await db.whatsAppConversation.findUnique({ where: { id } })
    if (!conversation) {
      return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}

    if (assignedToId !== undefined) updateData.assignedToId = assignedToId || null
    if (priority) updateData.priority = priority
    if (status) {
      updateData.status = status
      if (status === 'closed' || status === 'archived') {
        updateData.resolvedAt = new Date()
        updateData.unreadCount = 0
      }
    }
    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) ? JSON.stringify(tags) : tags
    }

    // অভ্যন্তরীণ নোট যোগ করা হচ্ছে
    if (internalNote) {
      const existingNotes: Array<{ note: string; agentId: string; agentName: string; createdAt: string }> =
        conversation.internalNotes ? JSON.parse(conversation.internalNotes) : []
      existingNotes.push({
        note: internalNote,
        agentId: authUser.id,
        agentName: authUser.name,
        createdAt: new Date().toISOString(),
      })
      updateData.internalNotes = JSON.stringify(existingNotes)
    }

    const updated = await db.whatsAppConversation.update({
      where: { id },
      data: updateData,
      include: {
        contact: true,
        assignedTo: { select: { id: true, name: true, avatar: true } },
        ticket: { select: { id: true, ticketNo: true, status: true } },
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'update',
      entity: 'WhatsAppConversation',
      entityId: id,
      newValues: updateData,
    })

    await emitEvent('conversation_updated', { conversationId: id, changes: Object.keys(updateData) })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update conversation'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// DELETE — কথোপকথন আর্কাইভ করা হচ্ছে
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const conversation = await db.whatsAppConversation.findUnique({ where: { id } })
    if (!conversation) {
      return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 })
    }

    const archived = await db.whatsAppConversation.update({
      where: { id },
      data: {
        status: 'archived',
        resolvedAt: new Date(),
        unreadCount: 0,
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'archive',
      entity: 'WhatsAppConversation',
      entityId: id,
    })

    await emitEvent('conversation_archived', { conversationId: id })

    return NextResponse.json({ success: true, data: archived })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to archive conversation'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}