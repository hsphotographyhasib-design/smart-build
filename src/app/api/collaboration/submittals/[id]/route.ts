import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, createAuditLog } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id } = await params

    const submittal = await db.submittal.findUnique({
      where: { id },
      include: { project: { select: { id: true, name: true, code: true } } },
    })

    if (!submittal) return NextResponse.json({ success: false, error: 'Submittal not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(submittal)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id } = await params

    const existing = await db.submittal.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ success: false, error: 'Submittal not found' }, { status: 404 })

    const body = await request.json()
    const { title, specification, category, priority, dueDate, notes, status: statusUpdate, action } = body

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (specification !== undefined) updateData.specification = specification
    if (category !== undefined) updateData.category = category
    if (priority !== undefined) updateData.priority = priority
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
    if (notes !== undefined) updateData.notes = notes

    // অবস্থা রূপান্তর পরিচালনা করা হচ্ছে
    if (action === 'submit' && existing.status === 'draft') {
      updateData.status = 'submitted'
    } else if (action === 'review' && existing.status === 'submitted') {
      updateData.status = 'under_review'
      updateData.reviewedById = user.id
      updateData.reviewedAt = new Date()
    } else if (action === 'approve' && (existing.status === 'under_review' || existing.status === 'submitted')) {
      updateData.status = 'approved'
      updateData.reviewedById = user.id
      updateData.reviewedAt = new Date()
      updateData.approvedAt = new Date()
    } else if (action === 'reject' && (existing.status === 'under_review' || existing.status === 'submitted')) {
      updateData.status = 'rejected'
      updateData.reviewedById = user.id
      updateData.reviewedAt = new Date()
    } else if (action === 'return' && (existing.status === 'under_review' || existing.status === 'submitted')) {
      updateData.status = 'returned'
      updateData.reviewedById = user.id
      updateData.reviewedAt = new Date()
      const currentRev = parseInt(existing.revision) || 0
      updateData.revision = String(currentRev + 1)
    } else if (action === 'for_info') {
      updateData.status = 'for_info'
    } else if (statusUpdate && !action) {
      updateData.status = statusUpdate
    }

    const submittal = await db.submittal.update({
      where: { id },
      data: updateData,
      include: { project: { select: { id: true, name: true, code: true } } },
    })

    await createAuditLog({ userId: user.id, action: 'UPDATE', entity: 'Submittal', entityId: id, newValues: updateData })
    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(submittal)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to update submittal' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id } = await params

    const existing = await db.submittal.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ success: false, error: 'Submittal not found' }, { status: 404 })

    await db.submittal.delete({ where: { id } })
    await createAuditLog({ userId: user.id, action: 'DELETE', entity: 'Submittal', entityId: id })
    return NextResponse.json({ success: true, data: { id } })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete submittal' }, { status: 500 })
  }
}