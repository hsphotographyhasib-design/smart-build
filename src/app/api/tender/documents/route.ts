import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const packageId = searchParams.get('packageId')
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!packageId) {
      return NextResponse.json({ success: false, error: 'packageId is required' }, { status: 400 })
    }

    const where: Record<string, unknown> = { packageId }
    if (category) where.category = category

    const [documents, total] = await Promise.all([
      db.tenderDocument.findMany({
        where,
        include: {
          uploadedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.tenderDocument.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(documents)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load documents'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { packageId, fileName, fileType, fileSize, fileUrl, category, version } = body

    if (!packageId || !fileName || !fileType || !fileUrl) {
      return NextResponse.json({ success: false, error: 'packageId, fileName, fileType, and fileUrl are required' }, { status: 400 })
    }

    const pkg = await db.tenderBidPackage.findUnique({ where: { id: packageId } })
    if (!pkg) {
      return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 })
    }

    const doc = await db.tenderDocument.create({
      data: {
        packageId,
        fileName,
        fileType,
        fileSize: fileSize || 0,
        fileUrl,
        category: category || 'specification',
        version: version || 1,
        uploadedById: authUser.id,
      },
      include: {
        uploadedBy: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(doc)) }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to upload document'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}