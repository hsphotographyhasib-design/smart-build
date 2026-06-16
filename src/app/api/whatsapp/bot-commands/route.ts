import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendTextMessage } from '@/lib/openwa-client'

// ─────────────────────────────────────────────────────────────────
// Bot command types
// ─────────────────────────────────────────────────────────────────

interface BotCommandInput {
  sessionId: string
  conversationId: string
  contactId: string
  contactWaId: string
  contactPhone: string
  message: string
}

// ─────────────────────────────────────────────────────────────────
// POST — API endpoint (optional direct invocation)
// ─────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BotCommandInput
    const result = await processBotCommand(body)
    if (!result) {
      return NextResponse.json({ success: true, handled: false })
    }
    return NextResponse.json({ success: true, handled: true, reply: result })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Bot command processing failed'
    console.error('Bot command error:', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// ─────────────────────────────────────────────────────────────────
// Main exported function — called from webhook via dynamic import
// ─────────────────────────────────────────────────────────────────

export async function processBotCommand(input: BotCommandInput): Promise<string | null> {
  const { sessionId, conversationId, contactId, contactWaId, contactPhone, message } = input
  const trimmed = message.trim().toUpperCase()
  const startTime = Date.now()

  let command = ''
  let reply: string | null = null

  // ── STATUS command ─────────────────────────────────────────────
  if (trimmed.startsWith('STATUS')) {
    command = 'STATUS'
    reply = await handleStatusCommand(trimmed)
  }
  // ── MY REQUESTS command ────────────────────────────────────────
  else if (trimmed.startsWith('MY REQUESTS') || trimmed === 'MYREQUESTS') {
    command = 'MY_REQUESTS'
    reply = await handleMyRequestsCommand(contactPhone)
  }
  // ── HELP command ──────────────────────────────────────────────
  else if (trimmed === 'HELP' || trimmed === 'HELP ') {
    command = 'HELP'
    reply = buildHelpReply()
  }
  // ── AMC command ──────────────────────────────────────────────
  else if (trimmed === 'AMC' || trimmed === 'AMC ') {
    command = 'AMC'
    reply = await handleAmcCommand(contactPhone)
  }
  // ── SCHEDULE command ─────────────────────────────────────────
  else if (trimmed === 'SCHEDULE' || trimmed === 'SCHEDULE ') {
    command = 'SCHEDULE'
    reply = await handleScheduleCommand(contactPhone)
  }

  // If no command matched, return null so webhook processes normally
  if (!command || !reply) return null

  // Send the reply via WhatsApp
  try {
    await sendTextMessage(sessionId, contactWaId, reply)
  } catch {
    // Send failed — still save the log and outgoing message
  }

  // Save the response as an outgoing WhatsApp message
  try {
    await db.whatsAppMessage.create({
      data: {
        conversationId,
        contactId,
        direction: 'outgoing',
        messageType: 'text',
        content: reply,
        senderName: 'Bot',
      },
    })
  } catch {
    // DB save failed — non-blocking
  }

  // Save bot log entry
  const processingTime = Date.now() - startTime
  try {
    await db.whatsAppBotLog.create({
      data: {
        sessionId,
        conversationId,
        contactId,
        command,
        inputMessage: message.trim(),
        responseMessage: reply,
        processingTimeMs: processingTime,
      },
    })
  } catch {
    // DB save failed — non-blocking
  }

  return reply
}

// ─────────────────────────────────────────────────────────────────
// Command: STATUS CMP-XXXX-XXXXXX
// ─────────────────────────────────────────────────────────────────

async function handleStatusCommand(trimmed: string): Promise<string> {
  // Extract ticket number after STATUS keyword
  const ticketNoMatch = trimmed.match(/STATUS\s+(CMP-\d{4}-\d{6})/)
  if (!ticketNoMatch) {
    return '❌ *Invalid Format*\n\nUsage: STATUS CMP-XXXX-XXXXXX\n\nExample: STATUS CMP-2026-000001'
  }
  const ticketNo = ticketNoMatch[1]

  const ticket = await db.maintenanceTicket.findUnique({
    where: { ticketNo },
    include: {
      assignedTechnician: {
        include: { user: { select: { name: true } } },
      },
      timeline: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  if (!ticket) {
    return `🔍 *Ticket Not Found*\n\nTicket: ${ticketNo}\n\n_This ticket number does not exist in our system._`
  }

  const priorityEmoji =
    ticket.priority === 'emergency' ? '🚨'
      : ticket.priority === 'high' ? '🔴'
        : ticket.priority === 'medium' ? '🟡'
          : '🟢'
  const statusFormatted = ticket.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const categoryFormatted = ticket.category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const slaDeadline = ticket.resolutionDeadline
    ? formatDate(ticket.resolutionDeadline)
    : 'Not set'
  const lastUpdate = ticket.timeline.length > 0 ? ticket.timeline[0].description : 'No updates yet'

  return [
    `📋 *Ticket Status*`,
    `🔖 Ticket: ${ticket.ticketNo}`,
    `📊 Status: ${statusFormatted}`,
    `${priorityEmoji} Priority: ${ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}`,
    `🔧 Category: ${categoryFormatted}`,
    `👷 Technician: ${ticket.assignedTechnician ? ticket.assignedTechnician.user.name : 'Not assigned'}`,
    `⏰ SLA Deadline: ${slaDeadline}`,
    `📝 Last Update: ${lastUpdate}`,
  ].join('\n')
}

// ─────────────────────────────────────────────────────────────────
// Command: MY REQUESTS
// ─────────────────────────────────────────────────────────────────

async function handleMyRequestsCommand(contactPhone: string): Promise<string> {
  // Find tickets linked to this contact by phone number
  const tickets = await db.maintenanceTicket.findMany({
    where: {
      contactPhone,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      ticketNo: true,
      subject: true,
      status: true,
      createdAt: true,
    },
  })

  // Also check whatsappContact-linked tickets
  if (tickets.length === 0) {
    const waContact = await db.whatsAppContact.findFirst({
      where: { phoneNumber: contactPhone },
    })
    if (waContact) {
      const linkedTickets = await db.maintenanceTicket.findMany({
        where: { whatsappContactId: waContact.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          ticketNo: true,
          subject: true,
          status: true,
          createdAt: true,
        },
      })
      tickets.push(...linkedTickets)
    }
  }

  if (tickets.length === 0) {
    return `📋 *Your Recent Requests*\n\n_No tickets found linked to your number._\n\n_Or describe your issue and we'll create a ticket!_`
  }

  const lines = ['📋 *Your Recent Requests*']
  tickets.forEach((t, i) => {
    const statusFormatted = t.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    const truncatedSubject = t.subject.length > 35 ? t.subject.substring(0, 32) + '...' : t.subject
    lines.push(`${i + 1}. ${t.ticketNo} - ${truncatedSubject} (${statusFormatted})`)
  })
  lines.push('')
  lines.push('_Reply STATUS CMP-XXXX-XXXXXX for details_')

  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────
// Command: HELP
// ─────────────────────────────────────────────────────────────────

function buildHelpReply(): string {
  return [
    `🤖 *SmartBuild Assistant*`,
    `Available commands:`,
    `📌 STATUS CMP-XXXX-XXXXXX - Check ticket status`,
    `📋 MY REQUESTS - View your complaints`,
    `📄 AMC - Check AMC contract details`,
    `📅 SCHEDULE - Upcoming visits`,
    `❓ HELP - Show this menu`,
    ``,
    `_Or just describe your issue and we'll create a ticket!_`,
  ].join('\n')
}

// ─────────────────────────────────────────────────────────────────
// Command: AMC
// ─────────────────────────────────────────────────────────────────

async function handleAmcCommand(contactPhone: string): Promise<string> {
  // Look up customer by phone
  const customer = await db.customer.findFirst({
    where: {
      phone: contactPhone,
      isActive: true,
    },
  })

  if (!customer) {
    return `📄 *AMC Contract*\n\n_No AMC contract found linked to your number._\n\n_Contact our office to subscribe to an AMC plan._`
  }

  // Find active AMC contracts for this customer
  const now = new Date()
  const contracts = await db.aMCContract.findMany({
    where: {
      customerId: customer.id,
      status: 'active',
      endDate: { gte: now },
    },
    orderBy: { endDate: 'asc' },
  })

  if (contracts.length === 0) {
    // Check for expired contracts too
    const expiredContracts = await db.aMCContract.findMany({
      where: {
        customerId: customer.id,
        status: 'expired',
      },
      orderBy: { endDate: 'desc' },
      take: 1,
    })

    if (expiredContracts.length > 0) {
      const c = expiredContracts[0]
      return [
        `📄 *AMC Contract*`,
        ``,
        `❌ *Expired*`,
        `🔖 Contract: ${c.contractNo}`,
        `📅 Expired: ${formatDate(c.endDate)}`,
        ``,
        `_Your AMC contract has expired. Contact us to renew._`,
      ].join('\n')
    }

    return `📄 *AMC Contract*\n\n_No AMC contract found for ${customer.name}._\n\n_Contact our office to subscribe to an AMC plan._`
  }

  const lines = [`📄 *AMC Contract*`]
  contracts.forEach((c) => {
    const services = JSON.parse(c.coveredServices || '[]') as string[]
    const servicesFormatted = services.length > 0 ? services.join(', ') : 'All maintenance'
    lines.push('')
    lines.push(`🔖 Contract: ${c.contractNo}`)
    lines.push(`✅ Status: Active`)
    lines.push(`📅 Valid Until: ${formatDate(c.endDate)}`)
    lines.push(`🔄 Visit Frequency: ${c.visitFrequency}`)
    lines.push(`📊 Visits Used: ${c.usedVisits}/${c.totalVisits}`)
    lines.push(`🔧 Covered: ${servicesFormatted}`)
  })

  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────
// Command: SCHEDULE
// ─────────────────────────────────────────────────────────────────

async function handleScheduleCommand(contactPhone: string): Promise<string> {
  // Find tickets linked to this contact by phone number
  const tickets = await db.maintenanceTicket.findMany({
    where: {
      contactPhone,
    },
    select: { id: true, ticketNo: true, subject: true },
  })

  let ticketIds = tickets.map((t) => t.id)

  // Also check whatsappContact-linked tickets
  if (ticketIds.length === 0) {
    const waContact = await db.whatsAppContact.findFirst({
      where: { phoneNumber: contactPhone },
    })
    if (waContact) {
      const linkedTickets = await db.maintenanceTicket.findMany({
        where: { whatsappContactId: waContact.id },
        select: { id: true, ticketNo: true, subject: true },
      })
      ticketIds = linkedTickets.map((t) => t.id)
      tickets.push(...linkedTickets)
    }
  }

  if (ticketIds.length === 0) {
    return `📅 *Upcoming Visits*\n\n_No scheduled visits found._\n\n_Contact us to schedule a maintenance visit._`
  }

  const now = new Date()
  const workOrders = await db.maintenanceWorkOrder.findMany({
    where: {
      ticketId: { in: ticketIds },
      status: { in: ['pending', 'in_progress'] },
      startDate: { gte: now },
    },
    include: {
      ticket: {
        select: { ticketNo: true, subject: true },
      },
      assignedTechnician: {
        include: { user: { select: { name: true, phone: true } } },
      },
    },
    orderBy: { startDate: 'asc' },
    take: 5,
  })

  if (workOrders.length === 0) {
    return `📅 *Upcoming Visits*\n\n_No upcoming scheduled visits found._\n\n_Contact us to schedule a maintenance visit._`
  }

  const lines = [`📅 *Upcoming Visits*`]
  workOrders.forEach((wo, i) => {
    const dateStr = wo.startDate ? formatDateTime(wo.startDate) : 'TBD'
    const techName = wo.assignedTechnician ? wo.assignedTechnician.user.name : 'To be assigned'
    const truncatedSubject = wo.ticket.subject.length > 40
      ? wo.ticket.subject.substring(0, 37) + '...'
      : wo.ticket.subject

    lines.push('')
    lines.push(`${i + 1}. ${wo.ticket.ticketNo}`)
    lines.push(`   📝 ${truncatedSubject}`)
    lines.push(`   📅 ${dateStr}`)
    lines.push(`   👷 ${techName}`)
  })

  lines.push('')
  lines.push(`_Total: ${workOrders.length} upcoming visit(s)_`)

  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatDateTime(date: Date): string {
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
