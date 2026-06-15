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

    const [invitations, total] = await Promise.all([
      db.tenderInvitation.findMany({
        where,
        include: {
          package: { select: { id: true, packageNo: true, name: true, status: true } },
          vendor: { select: { id: true, companyName: true, email: true, phone: true } },
          bid: { select: { id: true, status: true, totalAmount: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.tenderInvitation.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(invitations)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load invitations'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { packageId, vendorIds, method } = body

    if (!packageId || !vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
      return NextResponse.json({ success: false, error: 'packageId and vendorIds array are required' }, { status: 400 })
    }

    const pkg = await db.tenderBidPackage.findUnique({ where: { id: packageId } })
    if (!pkg) {
      return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 })
    }

    // Create invitations, skipping duplicates
    const created: typeof import('@prisma/client').TenderInvitation.prototype[] = []
    for (const vendorId of vendorIds) {
      const existing = await db.tenderInvitation.findUnique({
        where: { packageId_vendorId: { packageId, vendorId } },
      })
      if (!existing) {
        const invitation = await db.tenderInvitation.create({
          data: {
            packageId,
            vendorId,
            method: method || 'email',
            sentAt: new Date(),
          },
          include: {
            vendor: { select: { id: true, companyName: true, email: true } },
          },
        })
        created.push(invitation)
      }
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(created)) }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send invitations'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}