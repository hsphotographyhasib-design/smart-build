import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const bid = await db.tenderBid.findUnique({
      where: { id },
      include: {
        package: { select: { tenderClosingDate: true, requireBoqPricing: true } },
      },
    })

    if (!bid) {
      return NextResponse.json({ success: false, error: 'Bid not found' }, { status: 404 })
    }

    if (bid.status !== 'draft') {
      return NextResponse.json({ success: false, error: 'Only draft bids can be submitted' }, { status: 400 })
    }

    // Check deadline
    if (bid.package.tenderClosingDate && new Date() > bid.package.tenderClosingDate) {
      return NextResponse.json({ success: false, error: 'Tender closing date has passed' }, { status: 400 })
    }

    // If BOQ pricing is required, ensure prices exist
    if (bid.package.requireBoqPricing) {
      const priceCount = await db.tenderBidItemPrice.count({
        where: { bidId: id },
      })
      const itemCount = await db.tenderBidItem.count({
        where: { packageId: bid.packageId },
      })
      if (itemCount > 0 && priceCount === 0) {
        return NextResponse.json({ success: false, error: 'BOQ pricing is required but no prices have been set' }, { status: 400 })
      }
    }

    // Calculate total from item prices
    const prices = await db.tenderBidItemPrice.findMany({
      where: { bidId: id },
    })
    const totalFromPrices = prices.reduce((sum, p) => sum + p.totalPrice, 0)

    const updated = await db.tenderBid.update({
      where: { id },
      data: {
        status: 'submitted',
        submittedAt: new Date(),
        submittedById: authUser.id,
        totalAmount: totalFromPrices > 0 ? totalFromPrices : bid.totalAmount,
      },
      include: {
        package: { select: { id: true, packageNo: true, name: true } },
        vendor: { select: { id: true, companyName: true } },
      },
    })

    // Update invitation status
    await db.tenderInvitation.update({
      where: { id: bid.invitationId },
      data: { status: 'submitted' },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(updated)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit bid'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}