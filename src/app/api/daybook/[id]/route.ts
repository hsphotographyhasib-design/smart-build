import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, createAuditLog } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const entry = await db.dayBookEntry.findUnique({ where: { id } })

    if (!entry) {
      return NextResponse.json({ success: false, error: 'Entry not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: entry })
  } catch (error) {
    console.error('Daybook GET by ID error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch entry' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { date, description, category, type, amount, reference } = body

    const existing = await db.dayBookEntry.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Entry not found' }, { status: 404 })
    }

    const updated = await db.dayBookEntry.update({
      where: { id },
      data: {
        date: date ? new Date(date) : existing.date,
        description: description || existing.description,
        category: category || existing.category,
        type: type || existing.type,
        amount: amount !== undefined ? parseFloat(amount) : existing.amount,
        reference: reference !== undefined ? reference : existing.reference,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'UPDATE',
      entity: 'DayBookEntry',
      entityId: id,
      oldValues: { amount: existing.amount },
      newValues: { amount: updated.amount },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Daybook PUT error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update entry' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const existing = await db.dayBookEntry.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Entry not found' }, { status: 404 })
    }

    await db.dayBookEntry.delete({ where: { id } })

    await createAuditLog({
      userId: user.id,
      action: 'DELETE',
      entity: 'DayBookEntry',
      entityId: id,
      oldValues: { description: existing.description },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({ success: true, data: { id } })
  } catch (error) {
    console.error('Daybook DELETE error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete entry' }, { status: 500 })
  }
}