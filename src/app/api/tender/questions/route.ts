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

    const [questions, total] = await Promise.all([
      db.tenderQuestion.findMany({
        where,
        include: {
          package: { select: { id: true, packageNo: true, name: true } },
          vendor: { select: { id: true, companyName: true } },
          askedBy: { select: { id: true, name: true } },
          answeredBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.tenderQuestion.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(questions)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load questions'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { packageId, vendorId, question } = body

    if (!packageId || !question) {
      return NextResponse.json({ success: false, error: 'packageId and question are required' }, { status: 400 })
    }

    const pkg = await db.tenderBidPackage.findUnique({ where: { id: packageId } })
    if (!pkg) {
      return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 })
    }

    const q = await db.tenderQuestion.create({
      data: {
        packageId,
        vendorId: vendorId || null,
        askedById: authUser.id,
        question,
        status: 'open',
      },
      include: {
        package: { select: { id: true, packageNo: true, name: true } },
        askedBy: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(q)) }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create question'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}