import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, createAuditLog } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; commitmentId: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id: projectId, commitmentId } = await params

    const item = await db.projectCommitment.findFirst({ where: { id: commitmentId, projectId } })
    if (!item) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify()) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; commitmentId: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id: projectId, commitmentId } = await params
    const body = await request.json()

    const existing = await db.projectCommitment.findFirst({ where: { id: commitmentId, projectId } })
    if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    const anyJSON.parse(JSON.stringify(1454)) = {}
    if (body.type !== undefined) data.type = body.type
    if (body.vendor !== undefined) data.vendor = body.vendor
    if (body.description !== undefined) data.description = body.description
    if (body.contractValue !== undefined) data.contractValue = body.contractValue
    if (body.committedCost !== undefined) data.committedCost = body.committedCost
    if (body.remainingCost !== undefined) data.remainingCost = body.remainingCost
    if (body.status !== undefined) data.status = body.status
    if (body.startDate !== undefined) data.startDate = body.startDate ? new Date(body.startDate) : null
    if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null

    const item = await db.projectCommitment.update({ where: { id: commitmentId }, data })
    await createAuditLog({ userId: user.id, action: 'UPDATE', entity: 'ProjectCommitment', entityId: commitmentId, oldValues: existing, newValues: item, ipAddress: request.headers.get('x-forwarded-for') || undefined })
    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify()) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; commitmentId: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id: projectId, commitmentId } = await params

    const existing = await db.projectCommitment.findFirst({ where: { id: commitmentId, projectId } })
    if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    await db.projectCommitment.delete({ where: { id: commitmentId } })
    await createAuditLog({ userId: user.id, action: 'DELETE', entity: 'ProjectCommitment', entityId: commitmentId, oldValues: existing, ipAddress: request.headers.get('x-forwarded-for') || undefined })
    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify()) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}