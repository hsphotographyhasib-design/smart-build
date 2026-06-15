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

const TYPE_MAP: Record<string, string> = {
  complaint: 'complaint',
  service_request: 'work_request',
  work_order: 'work_request',
  quotation: 'quotation',
  amc_opportunity: 'inspection',
}

async function generateTicketNo(): Promise<string> {
  const year = new Date().getFullYear()
  const lastTicket = await db.maintenanceTicket.findFirst({
    where: { ticketNo: { startsWith: `CMP-${year}` } },
    orderBy: { ticketNo: 'desc' },
  })
  let nextNum = 1
  if (lastTicket) {
    const parts = lastTicket.ticketNo.split('-')
    nextNum = (parseInt(parts[2] || '0', 10) || 0) + 1
  }
  return `CMP-${year}-${String(nextNum).padStart(6, '0')}`
}

// POST — Convert conversation to ticket
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { convertTo = 'complaint', category, subject, description, priority } = body

    const validTypes = ['complaint', 'service_request', 'work_order', 'quotation', 'amc_opportunity']
    if (!validTypes.includes(convertTo)) {
      return NextResponse.json({ success: false, error: 'Invalid conversion type' }, { status: 400 })
    }

    const conversation = await db.whatsAppConversation.findUnique({
      where: { id },
      include: {
        contact: { include: { customer: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    })
    if (!conversation) {
      return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 })
    }

    // Check if already linked to a ticket
    const existingLink = await db.complaintWhatsAppLink.findFirst({
      where: { conversationId: id },
    })
    if (existingLink) {
      return NextResponse.json(
        { success: false, error: 'Conversation already linked to a ticket' },
        { status: 400 }
      )
    }

    const ticketNo = await generateTicketNo()
    const ticketType = TYPE_MAP[convertTo] || 'complaint'

    // Build description from conversation messages if not provided
    const messageHistory = conversation.messages
      .filter(m => m.content)
      .map(m => `[${m.direction === 'incoming' ? 'Customer' : 'Agent'}]: ${m.content}`)
      .join('\n')

    const ticketSubject = subject || `WhatsApp ${convertTo.replace('_', ' ')} - ${conversation.contact.name || conversation.contact.phone}`
    const ticketDescription = description || messageHistory || 'Created from WhatsApp conversation'

    // Find a system user for createdById
    let systemUser = await db.user.findFirst({ where: { email: 'system@smartbuild.com' } })
    if (!systemUser) {
      systemUser = await db.user.findFirst()
    }
    if (!systemUser) {
      return NextResponse.json({ success: false, error: 'No user available to create ticket' }, { status: 500 })
    }

    const ticket = await db.maintenanceTicket.create({
      data: {
        ticketNo,
        type: ticketType,
        category: category || 'general_maintenance',
        priority: priority || conversation.priority || 'medium',
        status: 'new',
        subject: ticketSubject,
        description: ticketDescription,
        customerId: conversation.contact.customerId,
        contactPhone: conversation.contact.phone,
        contactPerson: conversation.contact.name || undefined,
        createdById: systemUser.id,
      },
    })

    // Create the link
    const link = await db.complaintWhatsAppLink.create({
      data: {
        ticketId: ticket.id,
        conversationId: id,
        linkedById: authUser.id,
        autoCreated: false,
      },
    })

    // Update conversation
    await db.whatsAppConversation.update({
      where: { id },
      data: { ticketId: ticket.id },
    })

    // Send WhatsApp confirmation to customer
    const account = await db.whatsAppAccount.findFirst({ where: { isEnabled: true } })
    if (account?.accessToken) {
      try {
        const confirmMsg = `✅ *Ticket Created*\n\n🎫 Ticket: ${ticketNo}\n📌 Subject: ${ticketSubject}\n📊 Priority: ${priority || 'medium'}\n\nOur team will review and get back to you shortly. You can check status anytime by replying "STATUS".\n\n_Thank you for contacting SmartBuild._`
        await fetch(`https://graph.facebook.com/v21.0/${account.phoneNumberId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${account.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: conversation.contact.phone,
            type: 'text',
            text: { body: confirmMsg },
          }),
        })

        // Store outgoing message
        await db.whatsAppMessage.create({
          data: {
            conversationId: id,
            direction: 'outgoing',
            messageType: 'text',
            content: confirmMsg,
            senderType: 'system',
            sentById: authUser.id,
            isDelivered: true,
          },
        })
      } catch {
        // Confirmation send failed silently
      }
    }

    await createAuditLog({
      userId: authUser.id,
      action: 'convert_to_ticket',
      entity: 'WhatsAppConversation',
      entityId: id,
      newValues: { ticketId: ticket.id, ticketNo, convertTo },
    })

    await emitEvent('conversation_converted', {
      conversationId: id,
      ticketId: ticket.id,
      ticketNo,
      convertTo,
    })

    return NextResponse.json({
      success: true,
      data: { ticket, link },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to convert conversation'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}