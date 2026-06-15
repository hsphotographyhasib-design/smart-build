import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const isActive = searchParams.get('isActive')

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ]
    }
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    const suppliers = await db.supplier.findMany({
      where,
      include: {
        _count: { select: { purchaseOrders: true } },
      },
      orderBy: { name: 'asc' },
    })

    const data = suppliers.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      contact: s.contact,
      email: s.email,
      phone: s.phone,
      address: s.address,
      gstNo: s.gstNo,
      balance: s.balance,
      isActive: s.isActive,
      orderCount: s._count.purchaseOrders,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }))

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, code, contact, email, phone, address, gstNo } = body

    if (!name || !code) {
      return NextResponse.json({ success: false, error: 'Name and code are required' }, { status: 400 })
    }

    const existing = await db.supplier.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Supplier code already exists' }, { status: 400 })
    }

    const supplier = await db.supplier.create({
      data: {
        name,
        code,
        contact: contact || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
        gstNo: gstNo || null,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'create',
      entity: 'Supplier',
      entityId: supplier.id,
      newValues: { name, code },
    })

    return NextResponse.json({ success: true, data: supplier })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create supplier' }, { status: 500 })
  }
}
