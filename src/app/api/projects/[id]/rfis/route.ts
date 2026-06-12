import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, createAuditLog } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id: projectId } = await params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = { projectId }
    if (status && status !== 'all') where.status = status

    const rfis = await db.rFI.findMany({
      where,
      include: {
        comments: { orderBy: { createdAt: 'asc' }, take: 50 },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(rfis)) })
  } catch (error: any) {
    console.error('RFI GET error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id: projectId } = await params
    const body = await request.json()
    const { title, description, category, priority, dueDate } = body

    if (!title || !description) return NextResponse.json({ success: false, error: 'Title and description are required' }, { status: 400 })

    const count = await db.rFI.count({ where: { projectId } })
    const rfiNo = `RFI-${String(count + 1).padStart(3, '0')}`

    const rfi = await db.rFI.create({
      data: {
        projectId, rfiNo, title, description,
        category: category || 'general',
        priority: priority || 'medium',
        status: 'draft',
        submittedById: user.id,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    })

    await createAuditLog({ userId: user.id, action: 'CREATE', entity: 'RFI', entityId: rfi.id })
    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(rfi)) }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}