import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ packageId: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { packageId } = await params

    const criteria = await db.tenderEvaluationCriteria.findMany({
      where: { packageId },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { scores: true } },
      },
    })

    // মোট ওজন হিসাব করা হচ্ছে
    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0)

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(criteria)),
      meta: { totalWeight, count: criteria.length },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load evaluation criteria'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ packageId: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { packageId } = await params
    const body = await request.json()
    const { criteria } = body

    if (!criteria || !Array.isArray(criteria) || criteria.length === 0) {
      return NextResponse.json({ success: false, error: 'criteria array is required' }, { status: 400 })
    }

    const pkg = await db.tenderBidPackage.findUnique({ where: { id: packageId } })
    if (!pkg) {
      return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 })
    }

    // মোট ওজন ১০০ অতিক্রম করছে কিনা যাচাই করা হচ্ছে
    const totalWeight = criteria.reduce((sum: number, c: Record<string, unknown>) => sum + (Number(c.weight) || 0), 0)
    if (totalWeight > 100) {
      return NextResponse.json({ success: false, error: 'Total weight cannot exceed 100%' }, { status: 400 })
    }

    const created = await db.tenderEvaluationCriteria.createMany({
      data: criteria.map((c: Record<string, unknown>, index: number) => ({
        packageId,
        name: String(c.name),
        type: String(c.type || 'technical'),
        weight: Number(c.weight) || 10,
        sortOrder: Number(c.sortOrder ?? index),
      })),
    })

    const allCriteria = await db.tenderEvaluationCriteria.findMany({
      where: { packageId },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(allCriteria)) }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create evaluation criteria'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}