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
    const { notes } = body

    const award = await db.tenderAward.findUnique({ where: { packageId } })
    if (!award) {
      return NextResponse.json({ success: false, error: 'No award found for this package' }, { status: 404 })
    }

    if (award.status !== 'recommended') {
      return NextResponse.json({ success: false, error: `Award cannot be approved in status: ${award.status}` }, { status: 400 })
    }

    const updated = await db.tenderAward.update({
      where: { id: award.id },
      data: {
        status: 'approved',
        approvedById: authUser.id,
        approvedAt: new Date(),
        notes: notes || undefined,
      },
      include: {
        bid: {
          include: { vendor: { select: { id: true, companyName: true, email: true } } },
        },
        package: { select: { id: true, packageNo: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
    })

    // প্যাকেজ আপডেট করা হচ্ছে status to awarded
    await db.tenderBidPackage.update({
      where: { id: packageId },
      data: { status: 'awarded' },
    })

    // ভেন্ডর আপডেট করা হচ্ছে stats
    await db.tenderVendor.update({
      where: { id: award.vendorId },
      data: {
        totalAwarded: { increment: 1 },
      },
    })
    // Recalculate success rate
    const vendor = await db.tenderVendor.findUnique({ where: { id: award.vendorId } })
    if (vendor && vendor.totalBids > 0) {
      await db.tenderVendor.update({
        where: { id: award.vendorId },
        data: {
          successRate: Math.round((vendor.totalAwarded / vendor.totalBids) * 100 * 10) / 10,
        },
      })
    }

    // Update remaining approval steps
    await db.tenderApprovalStep.updateMany({
      where: { packageId, status: 'pending' },
      data: { status: 'completed', completedById: authUser.id, completedAt: new Date() },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(updated)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to approve award'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}