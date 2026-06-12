import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, createAuditLog } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; costId: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id: projectId, costId } = await params

    const item = await db.directCost.findFirst({ where: { id: costId, projectId } })
    if (!item) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify()) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; costId: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id: projectId, costId } = await params
    const body = await request.json()

    const existing = await db.directCost.findFirst({ where: { id: costId, projectId } })
    if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    const anyJSON.parse(JSON.stringify(1404)) = {}
    if (body.category !== undefined) data.category = body.category
    if (body.description !== undefined) data.description = body.description
    if (body.amount !== undefined) data.amount = body.amount
    if (body.date !== undefined) data.date = new Date(body.date)
    if (body.receipt !== undefined) data.receipt = body.receipt
    if (body.status !== undefined) {
      data.status = body.status
      if (body.status === 'approved') data.approvedById = user.id
    }

    const item = await db.directCost.update({ where: { id: costId }, data })
    await createAuditLog({ userId: user.id, action: 'UPDATE', entity: 'DirectCost', entityId: costId, oldValues: existing, newValues: item, ipAddress: request.headers.get('x-forwarded-for') || undefined })
    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify()) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; costId: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id: projectId, costId } = await params

    const existing = await db.directCost.findFirst({ where: { id: costId, projectId } })
    if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    await db.directCost.delete({ where: { id: costId } })
    await createAuditLog({ userId: user.id, action: 'DELETE', entity: 'DirectCost', entityId: costId, oldValues: existing, ipAddress: request.headers.get('x-forwarded-for') || undefined })
    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify()) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}