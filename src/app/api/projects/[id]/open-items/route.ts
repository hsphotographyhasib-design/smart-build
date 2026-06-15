import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, createAuditLog } from '@/lib/auth'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id: projectId } = await params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: Prisma.OpenItemWhereInput = { projectId }
    if (status) where.status = status
    if (category) where.category = category
    if (priority) where.priority = priority
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { itemNo: { contains: search } },
      ]
    }

    const [items, total] = await Promise.all([
      db.openItem.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.openItem.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(items)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
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
    const { title, description, category, priority, assignedTo, dueDate } = body

    if (!title || !category) {
      return NextResponse.json({ success: false, error: 'title and category are required' }, { status: 400 })
    }

    // স্বয়ংক্রিয়ভাবে আইটেম নম্বর তৈরি করা হচ্ছে
    const count = await db.openItem.count({ where: { projectId } })
    const itemNo = `OI-${String(count + 1).padStart(3, '0')}`

    const item = await db.openItem.create({
      data: {
        projectId,
        itemNo,
        title,
        description: description || null,
        category,
        priority: priority || 'medium',
        status: 'open',
        assignedTo: assignedTo || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        createdById: user.id,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'CREATE',
      entity: 'OpenItem',
      entityId: item.id,
      newValues: item,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(item)) }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}