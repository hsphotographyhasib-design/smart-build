import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const packageId = searchParams.get('packageId')
    const vendorId = searchParams.get('vendorId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (packageId) where.packageId = packageId
    if (vendorId) where.vendorId = vendorId
    if (status) where.status = status

    const [bids, total] = await Promise.all([
      db.tenderBid.findMany({
        where,
        include: {
          package: { select: { id: true, packageNo: true, name: true, status: true } },
          vendor: { select: { id: true, companyName: true, email: true } },
          invitation: { select: { id: true, status: true } },
          evaluation: { select: { id: true, technicalScore: true, commercialScore: true, combinedScore: true, ranking: true } },
          award: { select: { id: true, awardAmount: true, status: true } },
          _count: { select: { itemPrices: true, documents: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.tenderBid.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(bids)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load bids'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { invitationId, technicalProposal, commercialProposal, leadTime, warranty, notes } = body

    if (!invitationId) {
      return NextResponse.json({ success: false, error: 'invitationId is required' }, { status: 400 })
    }

    const invitation = await db.tenderInvitation.findUnique({
      where: { id: invitationId },
      include: {
        package: { select: { id: true, currency: true } },
        vendor: { select: { id: true } },
      },
    })

    if (!invitation) {
      return NextResponse.json({ success: false, error: 'Invitation not found' }, { status: 404 })
    }

    if (!['accepted', 'opened', 'sent'].includes(invitation.status)) {
      return NextResponse.json({ success: false, error: 'Invitation must be accepted before creating a bid' }, { status: 400 })
    }

    // Check if bid already exists for this invitation
    const existingBid = await db.tenderBid.findUnique({
      where: { invitationId },
    })
    if (existingBid) {
      return NextResponse.json({ success: false, error: 'Bid already exists for this invitation' }, { status: 400 })
    }

    const bid = await db.tenderBid.create({
      data: {
        packageId: invitation.packageId,
        vendorId: invitation.vendorId,
        invitationId,
        technicalProposal: technicalProposal ? JSON.stringify(technicalProposal) : null,
        commercialProposal: commercialProposal ? JSON.stringify(commercialProposal) : null,
        currency: invitation.package.currency,
        leadTime: leadTime || null,
        warranty: warranty || null,
        notes: notes || null,
      },
      include: {
        package: { select: { id: true, packageNo: true, name: true } },
        vendor: { select: { id: true, companyName: true } },
      },
    })

    // Update invitation status to accepted if it was sent/opened
    if (invitation.status === 'sent' || invitation.status === 'opened') {
      await db.tenderInvitation.update({
        where: { id: invitationId },
        data: { status: 'accepted' },
      })
    }

    // Update vendor stats
    await db.tenderVendor.update({
      where: { id: invitation.vendorId },
      data: { totalBids: { increment: 1 } },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(bid)) }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create bid'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}