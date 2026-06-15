import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

// GET — Dashboard stats
export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [
      totalMessages,
      messagesToday,
      openConversations,
      unresolvedCount,
      complaintLinksCreatedToday,
    ] = await Promise.all([
      db.whatsAppMessage.count(),
      db.whatsAppMessage.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
      db.whatsAppConversation.count({ where: { status: 'open' } }),
      db.whatsAppConversation.count({
        where: {
          status: 'open',
          OR: [
            { ticketId: null },
            { ticket: { status: { notIn: ['completed', 'closed', 'customer_verification'] } } },
          ],
        },
      }),
      db.complaintWhatsAppLink.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
    ])

    // Average response time (time between first incoming and first outgoing message per conversation)
    const recentConversations = await db.whatsAppConversation.findMany({
      where: { status: { in: ['open', 'closed'] } },
      include: {
        messages: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'asc' },
          select: { direction: true, createdAt: true },
        },
      },
      take: 100,
    })

    let totalResponseTime = 0
    let responseCount = 0
    for (const conv of recentConversations) {
      const incoming = conv.messages.find(m => m.direction === 'incoming')
      const outgoing = conv.messages.find(m => m.direction === 'outgoing')
      if (incoming && outgoing && outgoing.createdAt > incoming.createdAt) {
        const diffMs = outgoing.createdAt.getTime() - incoming.createdAt.getTime()
        totalResponseTime += diffMs / (1000 * 60) // minutes
        responseCount++
      }
    }
    const avgResponseTime = responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0

    // By category stats (from conversation tags)
    const conversations = await db.whatsAppConversation.findMany({
      select: { tags: true, priority: true, status: true },
    })

    const categoryStats: Record<string, number> = {}
    const priorityBreakdown: Record<string, number> = { emergency: 0, high: 0, medium: 0, low: 0 }

    for (const conv of conversations) {
      const tags: string[] = conv.tags ? JSON.parse(conv.tags) : []
      for (const tag of tags) {
        categoryStats[tag] = (categoryStats[tag] || 0) + 1
      }
      priorityBreakdown[conv.priority] = (priorityBreakdown[conv.priority] || 0) + 1
    }

    return NextResponse.json({
      success: true,
      data: {
        totalMessages,
        messagesToday,
        openConversations,
        unresolvedCount,
        avgResponseTime,
        complaintsCreatedToday: complaintLinksCreatedToday,
        byCategory: categoryStats,
        byPriority: priorityBreakdown,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get dashboard stats'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}