import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const packageId = searchParams.get('packageId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!packageId) {
      return NextResponse.json({ success: false, error: 'packageId is required' }, { status: 400 })
    }

    const where = { packageId }

    const [addenda, total] = await Promise.all([
      db.tenderAddendum.findMany({
        where,
        include: {
          issuedBy: { select: { id: true, name: true } },
        },
        orderBy: { version: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.tenderAddendum.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(addenda)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load addenda'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { packageId, title, description } = body

    if (!packageId || !title || !description) {
      return NextResponse.json({ success: false, error: 'packageId, title, and description are required' }, { status: 400 })
    }

    const pkg = await db.tenderBidPackage.findUnique({ where: { id: packageId } })
    if (!pkg) {
      return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 })
    }

    // Get next version number
    const lastAddendum = await db.tenderAddendum.findFirst({
      where: { packageId },
      orderBy: { version: 'desc' },
      select: { version: true },
    })
    const nextVersion = (lastAddendum?.version || 0) + 1

    const addendum = await db.tenderAddendum.create({
      data: {
        packageId,
        title,
        description,
        version: nextVersion,
        issuedById: authUser.id,
      },
      include: {
        issuedBy: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(addendum)) }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create addendum'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}