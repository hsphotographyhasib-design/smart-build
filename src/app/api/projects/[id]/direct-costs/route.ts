import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id: projectId } = await params

    const costs = await db.directCost.findMany({
      where: { projectId },
      orderBy: { date: 'desc' },
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
    const { category, description, amount, date } = body

    if (!description) return NextResponse.json({ success: false, error: 'Description is required' }, { status: 400 })

    const cost = await db.directCost.create({
      data: {
        projectId,
        category: category || 'labour',
        description,
        amount: Number(amount) || 0,
        date: date ? new Date(date) : new Date(),
        status: 'pending',
        createdById: user.id,
      },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify()) }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}