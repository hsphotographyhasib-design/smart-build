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

    const bid = await db.tenderBid.findUnique({
      where: { id },
      include: {
        package: {
          include: {
            project: { select: { id: true, name: true, code: true } },
            category: { select: { id: true, name: true } },
          },
        },
        vendor: true,
        invitation: true,
        itemPrices: {
          include: {
            item: true,
          },
        },
        documents: { orderBy: { createdAt: 'desc' } },
        evaluation: {
          include: {
            evaluator: { select: { id: true, name: true } },
            reviewedBy: { select: { id: true, name: true } },
            scores: { include: { criteria: true } },
          },
        },
        submittedBy: { select: { id: true, name: true, email: true } },
        award: {
          include: {
            approvedBy: { select: { id: true, name: true } },
          },
        },
      },
    })

    if (!bid) {
      return NextResponse.json({ success: false, error: 'Bid not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(bid)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load bid'
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

    const bid = await db.tenderBid.findUnique({
      where: { id },
      include: { package: { select: { tenderClosingDate: true } } },
    })

    if (!bid) {
      return NextResponse.json({ success: false, error: 'Bid not found' }, { status: 404 })
    }

    if (bid.status === 'submitted') {
      return NextResponse.json({ success: false, error: 'Submitted bids cannot be modified' }, { status: 400 })
    }

    // Check deadline if bid is being submitted
    if (bid.package.tenderClosingDate && new Date() > bid.package.tenderClosingDate && bid.status === 'draft') {
      return NextResponse.json({ success: false, error: 'Tender closing date has passed' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = ['totalAmount', 'currency', 'leadTime', 'warranty', 'notes']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (body.technicalProposal !== undefined) {
      updateData.technicalProposal = typeof body.technicalProposal === 'string'
        ? body.technicalProposal
        : JSON.stringify(body.technicalProposal)
    }
    if (body.commercialProposal !== undefined) {
      updateData.commercialProposal = typeof body.commercialProposal === 'string'
        ? body.commercialProposal
        : JSON.stringify(body.commercialProposal)
    }
    if (body.status !== undefined) {
      updateData.status = body.status
    }

    const updated = await db.tenderBid.update({
      where: { id },
      data: updateData,
      include: {
        package: { select: { id: true, packageNo: true, name: true } },
        vendor: { select: { id: true, companyName: true } },
      },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(updated)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update bid'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const bid = await db.tenderBid.findUnique({ where: { id } })
    if (!bid) {
      return NextResponse.json({ success: false, error: 'Bid not found' }, { status: 404 })
    }

    if (bid.status === 'submitted') {
      return NextResponse.json({ success: false, error: 'Submitted bids cannot be withdrawn via DELETE. Use the withdraw endpoint.' }, { status: 400 })
    }

    // Withdraw the bid
    const updated = await db.tenderBid.update({
      where: { id },
      data: { status: 'withdrawn' },
    })

    // Update invitation status back to accepted
    await db.tenderInvitation.update({
      where: { id: bid.invitationId },
      data: { status: 'accepted' },
    })

    // ভেন্ডর আপডেট করা হচ্ছে stats
    await db.tenderVendor.update({
      where: { id: bid.vendorId },
      data: { totalBids: { decrement: 1 } },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(updated)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to withdraw bid'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}