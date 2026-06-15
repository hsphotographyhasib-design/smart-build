import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const isActive = searchParams.get('isActive')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (customerId) where.customerId = customerId
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { address: { contains: search } },
      ]
    }

    const [sites, total] = await Promise.all([
      db.maintenanceSite.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true } },
          _count: { select: { tickets: true, pmSchedules: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.maintenanceSite.count({ where }),
    ])

    const data = sites.map((s) => JSON.parse(JSON.stringify(s)))

    return NextResponse.json({ success: true, data, total, page, limit })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch sites'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { customerId, name, address, latitude, longitude, contactPerson, contactPhone, description } = body

    if (!customerId || !name) {
      return NextResponse.json({ success: false, error: 'Customer ID and name are required' }, { status: 400 })
    }

    // Auto-generate site code
    const customer = await db.customer.findUnique({ where: { id: customerId } })
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 })
    }

    const siteCount = await db.maintenanceSite.count({ where: { customerId } })
    const code = `SITE-${customer.name.substring(0, 3).toUpperCase()}-${String(siteCount + 1).padStart(3, '0')}`

    const site = await db.maintenanceSite.create({
      data: {
        customerId,
        name,
        code,
        address: address || null,
        latitude: latitude || null,
        longitude: longitude || null,
        contactPerson: contactPerson || null,
        contactPhone: contactPhone || null,
        description: description || null,
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'CREATE',
      entity: 'MaintenanceSite',
      entityId: site.id,
      newValues: { code, name, customerId },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(site)) }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create site'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}