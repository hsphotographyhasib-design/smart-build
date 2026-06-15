import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

const REALTIME_BRIDGE_URL = 'http://localhost:3096/api/events'

async function emitEvent(room: string, event: string, data: unknown) {
  try {
    await fetch(REALTIME_BRIDGE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room, event, data }),
    })
  } catch {
    // Realtime service not available, non-blocking
  }
}

// GET — Full conversation with messages, contact, and linked complaint
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
        account: { select: { id: true, name: true, phoneNumber: true, status: true } },
        assignedTo: { select: { id: true, name: true, avatar: true, role: true, phone: true } },
        complaintLink: { select: { id: true, complaintId: true, linkedAt: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            contact: { select: { id: true, name: true, pushName: true, profilePicUrl: true } },
          },
        },
        _count: { select: { messages: true } },
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

// PUT — Update conversation (status, priority, isArchived, assignedTo)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { assignedToId, priority, status, isArchived, groupName } = body

    const conversation = await db.whatsAppConversation.findUnique({ where: { id } })
    if (!conversation) {
      return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() }

    if (assignedToId !== undefined) {
      updateData.assignedToId = assignedToId || null
      updateData.assignedAt = assignedToId ? new Date() : null
    }
    if (priority) updateData.priority = priority
    if (status) {
      updateData.status = status
      if (status === 'closed' || status === 'pending') {
        updateData.unreadCount = 0
      }
    }
    if (isArchived !== undefined) updateData.isArchived = isArchived
    if (groupName !== undefined) updateData.groupName = groupName

    const updated = await db.whatsAppConversation.update({
      where: { id },
      data: updateData,
      include: {
        contact: true,
        assignedTo: { select: { id: true, name: true, avatar: true } },
        complaintLink: { select: { id: true, complaintId: true, linkedAt: true } },
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'update',
      entity: 'WhatsAppConversation',
      entityId: id,
      newValues: updateData,
    })

    await emitEvent(`conversation:${id}`, 'conversation_updated', {
      conversationId: id,
      changes: Object.keys(updateData),
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update conversation'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// DELETE — Archive conversation
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
        isArchived: true,
        status: 'closed',
        unreadCount: 0,
        updatedAt: new Date(),
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'archive',
      entity: 'WhatsAppConversation',
      entityId: id,
    })

    await emitEvent('whatsapp', 'conversation_archived', { conversationId: id })

    return NextResponse.json({ success: true, data: archived })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to archive conversation'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}