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
    // Socket service may not be running
  }
}

// POST — Assign conversation to agent
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { assignedToId } = body

    if (!assignedToId) {
      return NextResponse.json({ success: false, error: 'assignedToId is required' }, { status: 400 })
    }

    // Verify assignee exists
    const assignee = await db.user.findUnique({
      where: { id: assignedToId },
      select: { id: true, name: true, isActive: true },
    })
    if (!assignee || !assignee.isActive) {
      return NextResponse.json({ success: false, error: 'Invalid agent' }, { status: 400 })
    }

    const conversation = await db.whatsAppConversation.findUnique({ where: { id } })
    if (!conversation) {
      return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 })
    }

    const updated = await db.whatsAppConversation.update({
      where: { id },
      data: { assignedToId },
      include: {
        contact: true,
        assignedTo: { select: { id: true, name: true, avatar: true } },
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'assign',
      entity: 'WhatsAppConversation',
      entityId: id,
      newValues: { assignedToId, assignedToName: assignee.name },
    })

    await emitEvent('conversation_assigned', {
      conversationId: id,
      assignedToId,
      assignedToName: assignee.name,
      assignedBy: authUser.name,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to assign conversation'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}