import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')

    const where: Record<string, unknown> = {}
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    const items = await db.productCategory.findMany({
      where,
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ success: true, data: items })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 })
    }

    const item = await db.productCategory.create({
      data: { name },
    })

    return NextResponse.json({ success: true, data: item })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create' }, { status: 500 })
  }
}