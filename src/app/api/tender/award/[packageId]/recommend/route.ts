import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ packageId: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { packageId } = await params
    const body = await request.json()
    const { bidId, notes } = body

    if (!bidId) {
      return NextResponse.json({ success: false, error: 'bidId is required' }, { status: 400 })
    }

    const pkg = await db.tenderBidPackage.findUnique({ where: { id: packageId } })
    if (!pkg) {
      return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 })
    }

    // Check if award already exists for this package
    const existingAward = await db.tenderAward.findUnique({
      where: { packageId },
    })
    if (existingAward) {
      return NextResponse.json({ success: false, error: 'Award already exists for this package' }, { status: 400 })
    }

    const bid = await db.tenderBid.findUnique({
      where: { id: bidId },
    })
    if (!bid) {
      return NextResponse.json({ success: false, error: 'Bid not found' }, { status: 404 })
    }

    if (bid.packageId !== packageId) {
      return NextResponse.json({ success: false, error: 'Bid does not belong to this package' }, { status: 400 })
    }

    const award = await db.tenderAward.create({
      data: {
        packageId,
        bidId,
        vendorId: bid.vendorId,
        awardAmount: bid.totalAmount,
        awardDate: new Date(),
        status: 'recommended',
        notes: notes || null,
      },
      include: {
        bid: {
          include: { vendor: { select: { id: true, companyName: true, email: true } } },
        },
      },
    })

    // Update approval step
    await db.tenderApprovalStep.updateMany({
      where: { packageId, stepType: 'award_recommendation', status: 'pending' },
      data: { status: 'completed', completedById: authUser.id, completedAt: new Date() },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(award)) }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to recommend award'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}