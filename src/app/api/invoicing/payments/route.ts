import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const projectId = searchParams.get('projectId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = { status: { not: 'cancelled' } }
    if (status) where.paymentStatus = status
    if (projectId) where.projectId = projectId

    const [invoices, total] = await Promise.all([
      db.invoice.findMany({
        where,
        include: {
          project: { select: { id: true, name: true, code: true } },
          vendor: { select: { id: true, name: true } },
          payment: { orderBy: { date: 'desc' } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.invoice.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        invoices,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    })
  } catch (error) {
    console.error('Payment list error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch payment data' }, { status: 500 })
  }
}