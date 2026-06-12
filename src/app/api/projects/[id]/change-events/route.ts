import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id: projectId } = await params

    const events = await db.changeEvent.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(events)) })
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
    const { title, description, category, impactType, potentialCostImpact, potentialScheduleImpact } = body

    if (!title) return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 })

    const count = await db.changeEvent.count({ where: { projectId } })
    const eventNo = `CE-${String(count + 1).padStart(3, '0')}`

    const event = await db.changeEvent.create({
      data: {
        projectId, eventNo, title,
        description: description || null,
        category: category || 'scope',
        impactType: impactType || 'cost',
        potentialCostImpact: Number(potentialCostImpact) || 0,
        potentialScheduleImpact: potentialScheduleImpact || null,
        status: 'open',
        submittedById: user.id,
      },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(event)) }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}