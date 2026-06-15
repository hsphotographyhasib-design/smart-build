import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

// GET — List WhatsApp contacts with search and filters
export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const hasCustomer = searchParams.get('hasCustomer')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (status) where.status = status
    if (hasCustomer === 'true') {
      where.customerId = { not: null }
    } else if (hasCustomer === 'false') {
      where.customerId = null
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { pushName: { contains: search } },
        { phone: { contains: search } },
        { waId: { contains: search } },
      ]
    }

    const [contacts, total] = await Promise.all([
      db.whatsAppContact.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, phone: true, email: true } },
          _count: { select: { conversations: true, sentMessages: true, receivedMessages: true } },
        },
        orderBy: { lastMessageAt: 'desc' },
        skip,
        take: limit,
      }),
      db.whatsAppContact.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: contacts,
      total,
      page,
      limit,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get contacts'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}