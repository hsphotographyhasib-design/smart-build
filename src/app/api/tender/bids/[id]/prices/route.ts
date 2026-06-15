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

    const prices = await db.tenderBidItemPrice.findMany({
      where: { bidId: id },
      include: {
        item: true,
      },
      orderBy: { item: { sortOrder: 'asc' } },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(prices)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load bid prices'
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
    const { prices } = body

    if (!prices || !Array.isArray(prices) || prices.length === 0) {
      return NextResponse.json({ success: false, error: 'prices array is required' }, { status: 400 })
    }

    const bid = await db.tenderBid.findUnique({ where: { id } })
    if (!bid) {
      return NextResponse.json({ success: false, error: 'Bid not found' }, { status: 404 })
    }

    if (bid.status === 'submitted') {
      return NextResponse.json({ success: false, error: 'Cannot modify prices for submitted bids' }, { status: 400 })
    }

    // Bulk upsert prices
    const results = []
    let totalAmount = 0

    for (const price of prices) {
      if (!price.itemId) continue

      const unitPrice = Number(price.unitPrice) || 0
      const item = await db.tenderBidItem.findUnique({ where: { id: price.itemId } })
      const quantity = item ? item.quantity : 1
      const totalPrice = unitPrice * quantity
      totalAmount += totalPrice

      const upserted = await db.tenderBidItemPrice.upsert({
        where: { bidId_itemId: { bidId: id, itemId: price.itemId } },
        update: {
          unitPrice,
          totalPrice,
          notes: price.notes || null,
        },
        create: {
          bidId: id,
          itemId: price.itemId,
          unitPrice,
          totalPrice,
          notes: price.notes || null,
        },
        include: { item: true },
      })
      results.push(upserted)
    }

    // Update bid total
    await db.tenderBid.update({
      where: { id },
      data: { totalAmount },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(results)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to set bid prices'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { itemId, unitPrice, notes } = body

    if (!itemId) {
      return NextResponse.json({ success: false, error: 'itemId is required' }, { status: 400 })
    }

    const bid = await db.tenderBid.findUnique({ where: { id } })
    if (!bid) {
      return NextResponse.json({ success: false, error: 'Bid not found' }, { status: 404 })
    }

    if (bid.status === 'submitted') {
      return NextResponse.json({ success: false, error: 'Cannot modify prices for submitted bids' }, { status: 400 })
    }

    const item = await db.tenderBidItem.findUnique({ where: { id: itemId } })
    const quantity = item ? item.quantity : 1
    const price = Number(unitPrice) || 0
    const totalPrice = price * quantity

    const updated = await db.tenderBidItemPrice.upsert({
      where: { bidId_itemId: { bidId: id, itemId } },
      update: { unitPrice: price, totalPrice, notes: notes || null },
      create: { bidId: id, itemId, unitPrice: price, totalPrice, notes: notes || null },
      include: { item: true },
    })

    // Recalculate bid total
    const allPrices = await db.tenderBidItemPrice.findMany({ where: { bidId: id } })
    const totalAmount = allPrices.reduce((sum, p) => sum + p.totalPrice, 0)
    await db.tenderBid.update({
      where: { id },
      data: { totalAmount },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(updated)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update bid price'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}