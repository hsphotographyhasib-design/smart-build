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

    const vendor = await db.tenderVendor.findUnique({
      where: { id },
      include: {
        category: true,
        invitations: {
          include: {
            package: { select: { id: true, packageNo: true, name: true, status: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        bids: {
          include: {
            package: { select: { id: true, packageNo: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        awards: {
          include: {
            package: { select: { id: true, packageNo: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { invitations: true, bids: true, awards: true, questions: true },
        },
      },
    })

    if (!vendor) {
      return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(vendor)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load vendor'
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

    const existing = await db.tenderVendor.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = [
      'companyName', 'registrationNo', 'contactPerson', 'email', 'phone',
      'address', 'country', 'tradeSpecialization', 'categoryId', 'website',
      'taxRegistration', 'rating', 'totalBids', 'totalAwarded', 'successRate',
      'notes', 'isActive',
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Handle JSON fields
    if (body.pastPerformance !== undefined) {
      updateData.pastPerformance = typeof body.pastPerformance === 'string'
        ? body.pastPerformance
        : JSON.stringify(body.pastPerformance)
    }
    if (body.certifications !== undefined) {
      updateData.certifications = typeof body.certifications === 'string'
        ? body.certifications
        : JSON.stringify(body.certifications)
    }
    if (body.insuranceInfo !== undefined) {
      updateData.insuranceInfo = typeof body.insuranceInfo === 'string'
        ? body.insuranceInfo
        : JSON.stringify(body.insuranceInfo)
    }
    if (body.licenses !== undefined) {
      updateData.licenses = typeof body.licenses === 'string'
        ? body.licenses
        : JSON.stringify(body.licenses)
    }

    // Handle isApproved toggle
    if (body.isApproved !== undefined) {
      updateData.isApproved = body.isApproved
    }

    const vendor = await db.tenderVendor.update({
      where: { id },
      data: updateData,
      include: { category: true },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(vendor)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update vendor'
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

    const existing = await db.tenderVendor.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 })
    }

    const vendor = await db.tenderVendor.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(vendor)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete vendor'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}