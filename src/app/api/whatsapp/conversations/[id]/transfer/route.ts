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

// POST — Transfer conversation to another agent
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { targetAgentId, note } = body

    if (!targetAgentId) {
      return NextResponse.json({ success: false, error: 'targetAgentId is required' }, { status: 400 })
    }

    const conversation = await db.whatsAppConversation.findUnique({ where: { id } })
    if (!conversation) {
      return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 })
    }

    // Verify target agent
    const targetAgent = await db.user.findUnique({
      where: { id: targetAgentId },
      select: { id: true, name: true, isActive: true },
    })
    if (!targetAgent || !targetAgent.isActive) {
      return NextResponse.json({ success: false, error: 'Invalid target agent' }, { status: 400 })
    }

    // Build internal notes with transfer info
    const existingNotes: Array<{ note: string; agentId: string; agentName: string; createdAt: string }> =
      conversation.internalNotes ? JSON.parse(conversation.internalNotes) : []

    const transferNote = note
      ? `Transfer from ${authUser.name} to ${targetAgent.name}: ${note}`
      : `Transfer from ${authUser.name} to ${targetAgent.name}`

    existingNotes.push({
      note: transferNote,
      agentId: authUser.id,
      agentName: authUser.name,
      createdAt: new Date().toISOString(),
    })

    const updated = await db.whatsAppConversation.update({
      where: { id },
      data: {
        assignedToId: targetAgentId,
        internalNotes: JSON.stringify(existingNotes),
      },
      include: {
        contact: true,
        assignedTo: { select: { id: true, name: true, avatar: true } },
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'transfer',
      entity: 'WhatsAppConversation',
      entityId: id,
      newValues: { fromAgentId: authUser.id, toAgentId: targetAgentId, note },
    })

    await emitEvent('conversation_transferred', {
      conversationId: id,
      fromAgentId: authUser.id,
      fromAgentName: authUser.name,
      toAgentId: targetAgentId,
      toAgentName: targetAgent.name,
      note,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to transfer conversation'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}