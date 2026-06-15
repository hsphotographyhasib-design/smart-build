import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const workOrderId = searchParams.get('workOrderId')
    const ticketId = searchParams.get('ticketId')
    const requestedById = searchParams.get('requestedById')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (workOrderId) where.workOrderId = workOrderId
    if (ticketId) where.ticketId = ticketId
    if (requestedById) where.requestedById = requestedById
    if (search) {
      where.OR = [
        { requestNo: { contains: search } },
        { notes: { contains: search } },
      ]
    }

    const [requests, total] = await Promise.all([
      db.materialRequest.findMany({
        where,
        include: {
          workOrder: { select: { id: true, workOrderNo: true } },
          ticket: { select: { id: true, ticketNo: true, subject: true } },
          requestedBy: { select: { id: true, name: true } },
          supervisorApprovedBy: { select: { id: true, name: true } },
          issuedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.materialRequest.count({ where }),
    ])

    const data = requests.map((r) => JSON.parse(JSON.stringify(r)))

    return NextResponse.json({ success: true, data, total, page, limit })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch material requests'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { workOrderId, ticketId, items, totalCost, notes } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Items array is required' }, { status: 400 })
    }

    // স্বয়ংক্রিয়ভাবে রিকোয়েস্ট নম্বর তৈরি করা হচ্ছে
    const year = new Date().getFullYear()
    const prefix = 'MR'
    const count = await db.materialRequest.count({
      where: { requestNo: { startsWith: `${prefix}-${year}` } },
    })
    const requestNo = `${prefix}-${year}-${String(count + 1).padStart(6, '0')}`

    const materialRequest = await db.materialRequest.create({
      data: {
        requestNo,
        workOrderId: workOrderId || null,
        ticketId: ticketId || null,
        requestedById: authUser.id,
        items: JSON.stringify(items),
        totalCost: totalCost || 0,
        notes: notes || null,
      },
      include: {
        requestedBy: { select: { name: true } },
        ticket: { select: { ticketNo: true, subject: true } },
      },
    })

    // টিকেটের সাথে লিংক থাকলে টাইমলাইন এন্ট্রি তৈরি করা হচ্ছে
    if (ticketId) {
      await db.maintenanceTimeline.create({
        data: {
          ticketId,
          action: 'material_request',
          description: `Material request ${requestNo} created`,
          performedById: authUser.id,
          metadata: JSON.stringify({ requestNo, itemCount: items.length }),
        },
      })
    }

    await createAuditLog({
      userId: authUser.id,
      action: 'CREATE',
      entity: 'MaterialRequest',
      entityId: materialRequest.id,
      newValues: { requestNo },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(materialRequest)) }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create material request'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}