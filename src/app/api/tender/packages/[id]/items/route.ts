import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const items = await db.tenderBidItem.findMany({
      where: { packageId: id },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(items)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load bid items'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { boqId, items } = body

    const pkg = await db.tenderBidPackage.findUnique({ where: { id } })
    if (!pkg) {
      return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 })
    }

    let createdItems

    if (boqId) {
      // Import items from BOQ
      const boqItems = await db.bOQItem.findMany({
        where: { boqId },
        orderBy: { itemNo: 'asc' },
      })

      if (boqItems.length === 0) {
        return NextResponse.json({ success: false, error: 'No BOQ items found' }, { status: 400 })
      }

      createdItems = await db.tenderBidItem.createMany({
        data: boqItems.map((item, index) => ({
          packageId: id,
          itemNo: item.itemNo,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitRate: item.unitRate,
          amount: item.amount,
          sortOrder: index,
        })),
      })

      const allItems = await db.tenderBidItem.findMany({
        where: { packageId: id },
        orderBy: { sortOrder: 'asc' },
      })

      return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(allItems)) }, { status: 201 })
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'boqId or items array is required' }, { status: 400 })
    }

    createdItems = await db.tenderBidItem.createMany({
      data: items.map((item: Record<string, unknown>, index: number) => ({
        packageId: id,
        itemNo: String(item.itemNo || `ITEM-${String(index + 1).padStart(4, '0')}`),
        description: String(item.description),
        quantity: Number(item.quantity) || 0,
        unit: String(item.unit || 'unit'),
        unitRate: Number(item.unitRate) || 0,
        amount: (Number(item.quantity) || 0) * (Number(item.unitRate) || 0),
        sortOrder: Number(item.sortOrder ?? index),
      })),
    })

    const allItems = await db.tenderBidItem.findMany({
      where: { packageId: id },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(allItems)) }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add bid items'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}