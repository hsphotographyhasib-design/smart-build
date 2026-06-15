import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (customerId) where.customerId = customerId
    if (status) where.status = status
    if (search) {
      where.OR = [
        { contractNo: { contains: search } },
        { name: { contains: search } },
      ]
    }

    const [contracts, total] = await Promise.all([
      db.aMCContract.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.aMCContract.count({ where }),
    ])

    const data = contracts.map((c) => JSON.parse(JSON.stringify(c)))

    return NextResponse.json({ success: true, data, total, page, limit })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch AMC contracts'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const {
      customerId, name, description,
      startDate, endDate,
      totalVisits, visitFrequency,
      coveredEquipment, annualValue,
      slaPriority, status, renewalDate,
      autoRenew, notes,
    } = body

    if (!customerId || !name || !startDate || !endDate) {
      return NextResponse.json({ success: false, error: 'Customer, name, start date and end date are required' }, { status: 400 })
    }

    // স্বয়ংক্রিয়ভাবে চুক্তি নম্বর তৈরি করা হচ্ছে
    const year = new Date().getFullYear()
    const prefix = 'AMC'
    const count = await db.aMCContract.count({
      where: { contractNo: { startsWith: `${prefix}-${year}` } },
    })
    const contractNo = `${prefix}-${year}-${String(count + 1).padStart(6, '0')}`

    const contract = await db.aMCContract.create({
      data: {
        contractNo,
        customerId,
        name,
        description: description || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalVisits: totalVisits || 12,
        visitFrequency: visitFrequency || 'monthly',
        coveredEquipment: JSON.stringify(coveredEquipment || []),
        annualValue: annualValue || 0,
        slaPriority: slaPriority || 'medium',
        status: status || 'active',
        renewalDate: renewalDate ? new Date(renewalDate) : null,
        autoRenew: autoRenew || false,
        notes: notes || null,
        createdById: authUser.id,
      },
      include: {
        customer: { select: { name: true } },
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'CREATE',
      entity: 'AMCContract',
      entityId: contract.id,
      newValues: { contractNo, name, customerId },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(contract)) }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create AMC contract'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}