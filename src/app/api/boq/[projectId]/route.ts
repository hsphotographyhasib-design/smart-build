import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, createAuditLog } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { projectId } = await params

    let boq = await db.bOQ.findUnique({
      where: { projectId },
      include: {
        items: { orderBy: { itemNo: 'asc' } },
        project: { select: { id: true, name: true, code: true } },
      },
    })

    // Create BOQ if not exists
    if (!boq) {
      boq = await db.bOQ.create({
        data: { projectId, total: 0 },
        include: { items: true, project: { select: { id: true, name: true, code: true } } },
      })
    }

    return NextResponse.json({ success: true, data: boq })
  } catch (error) {
    console.error('BOQ GET error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch BOQ' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { projectId } = await params
    const body = await request.json()
    const { items } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one item is required' }, { status: 400 })
    }

    // Upsert BOQ
    let boq = await db.bOQ.findUnique({ where: { projectId } })

    if (!boq) {
      boq = await db.bOQ.create({
        data: { projectId, total: 0 },
      })
    }

    // Delete existing items
    await db.bOQItem.deleteMany({ where: { boqId: boq.id } })

    // Create new items
    const total = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitRate), 0)

    const boqItems = items.map((item: any, index: number) => ({
      boqId: boq!.id,
      itemNo: item.itemNo || String(index + 1).padStart(3, '0'),
      description: item.description,
      unit: item.unit,
      quantity: item.quantity,
      unitRate: item.unitRate,
      amount: item.quantity * item.unitRate,
    }))

    await db.bOQItem.createMany({ data: boqItems })

    const updated = await db.bOQ.update({
      where: { id: boq.id },
      data: { total, version: { increment: 1 } },
      include: {
        items: { orderBy: { itemNo: 'asc' } },
        project: { select: { id: true, name: true, code: true } },
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'UPDATE',
      entity: 'BOQ',
      entityId: boq.id,
      newValues: { total, itemCount: items.length },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('BOQ POST error:', error)
    return NextResponse.json({ success: false, error: 'Failed to save BOQ' }, { status: 500 })
  }
}