import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

// GET — Search and list WhatsApp contacts from Prisma with pagination
export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const isBusiness = searchParams.get('isBusiness')
    const isBlocked = searchParams.get('isBlocked')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100)
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (isBusiness === 'true') where.isBusiness = true
    else if (isBusiness === 'false') where.isBusiness = false

    if (isBlocked === 'true') where.isBlocked = true
    else if (isBlocked === 'false') where.isBlocked = false

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { pushName: { contains: search } },
        { phoneNumber: { contains: search } },
        { waId: { contains: search } },
        { notes: { contains: search } },
      ]
    }

    const [contacts, total] = await Promise.all([
      db.whatsAppContact.findMany({
        where,
        include: {
          _count: {
            select: { conversations: true, messages: true },
          },
        },
        orderBy: { lastSeenAt: 'desc' },
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