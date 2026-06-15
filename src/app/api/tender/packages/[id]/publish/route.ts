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

    const pkg = await db.tenderBidPackage.findUnique({
      where: { id },
      include: { approvalSteps: true },
    })

    if (!pkg) {
      return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 })
    }

    if (pkg.status !== 'draft') {
      return NextResponse.json({ success: false, error: 'Only draft packages can be published' }, { status: 400 })
    }

    // Check if approval steps already exist
    if (pkg.approvalSteps.length === 0) {
      await db.tenderApprovalStep.createMany({
        data: [
          { packageId: id, stepOrder: 1, stepType: 'vendor_invitation', status: 'pending' },
          { packageId: id, stepOrder: 2, stepType: 'bid_submission', status: 'pending' },
          { packageId: id, stepOrder: 3, stepType: 'technical_review', status: 'pending' },
          { packageId: id, stepOrder: 4, stepType: 'commercial_review', status: 'pending' },
          { packageId: id, stepOrder: 5, stepType: 'management_approval', status: 'pending' },
          { packageId: id, stepOrder: 6, stepType: 'award_recommendation', status: 'pending' },
        ],
      })
    }

    const updated = await db.tenderBidPackage.update({
      where: { id },
      data: { status: 'published' },
      include: {
        project: { select: { id: true, name: true } },
        approvalSteps: { orderBy: { stepOrder: 'asc' } },
      },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(updated)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to publish package'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}