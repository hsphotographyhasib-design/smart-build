import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

// GET — Get internal notes for conversation
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
      select: { internalNotes: true },
    })
    if (!conversation) {
      return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 })
    }

    const notes: Array<Record<string, string>> = conversation.internalNotes
      ? JSON.parse(conversation.internalNotes)
      : []

    return NextResponse.json({ success: true, data: notes })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get notes'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// POST — Add internal note
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { note } = body

    if (!note || typeof note !== 'string' || !note.trim()) {
      return NextResponse.json({ success: false, error: 'Note content is required' }, { status: 400 })
    }

    const conversation = await db.whatsAppConversation.findUnique({ where: { id } })
    if (!conversation) {
      return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 })
    }

    const existingNotes: Array<{ note: string; agentId: string; agentName: string; createdAt: string }> =
      conversation.internalNotes ? JSON.parse(conversation.internalNotes) : []

    const newNote = {
      note: note.trim(),
      agentId: authUser.id,
      agentName: authUser.name,
      createdAt: new Date().toISOString(),
    }
    existingNotes.push(newNote)

    await db.whatsAppConversation.update({
      where: { id },
      data: { internalNotes: JSON.stringify(existingNotes) },
    })

    return NextResponse.json({ success: true, data: newNote })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add note'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}