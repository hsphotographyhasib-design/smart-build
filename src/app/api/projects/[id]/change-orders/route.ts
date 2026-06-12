import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id: projectId } = await params

    const orders = await db.changeOrder.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify()) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id: projectId } = await params
    const body = await request.json()
    const { title, description, costAdjustment, originalBudget, adjustedBudget } = body

    if (!title) return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 })

    const count = await db.changeOrder.count({ where: { projectId } })
    const coNo = `CO-${String(count + 1).padStart(3, '0')}`

    const co = await db.changeOrder.create({
      data: {
        projectId, coNo, title,
        description: description || null,
        costAdjustment: Number(costAdjustment) || 0,
        originalBudget: Number(originalBudget) || 0,
        adjustedBudget: Number(adjustedBudget) || 0,
        status: 'draft',
        submittedById: user.id,
      },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify()) }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}