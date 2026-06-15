import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; coId: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { coId } = await params
    const co = await db.budgetChangeOrder.findUnique({
      where: { id: coId },
      include: {
        lineItemUpdates: { include: { budgetLineItem: { include: { costCode: true } } } },
        budget: { include: { project: { select: { id: true, name: true, code: true } } } },
      },
    })

    if (!co) {
      return NextResponse.json({ success: false, error: 'Change order not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(co)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; coId: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id, coId } = await params
    const body = await request.json()
    const { title, description, reason, status } = body

    const co = await db.budgetChangeOrder.findUnique({ where: { id: coId, budgetId: id } })
    if (!co) {
      return NextResponse.json({ success: false, error: 'Change order not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (reason !== undefined) updateData.reason = reason

    if (status !== undefined) {
      updateData.status = status
      if (status === 'submitted') {
        // তৈরির সময় ডিফল্টভাবে ইতিমধ্যে জমা দেওয়া হয়েছে
      } else if (status === 'reviewed') {
        updateData.reviewedById = user.id
        updateData.reviewedAt = new Date()
      } else if (status === 'approved') {
        updateData.approvedById = user.id
        updateData.approvedAt = new Date()

        // পরিবর্তন প্রয়োগ করা হচ্ছে: লাইন আইটেম এবং বাজেট আপডেট করা হচ্ছে
        const updates = await db.budgetLineItemUpdate.findMany({ where: { budgetChangeOrderId: coId } })
        for (const u of updates) {
          await db.budgetLineItem.update({
            where: { id: u.budgetLineItemId },
            data: { revisedBudget: u.newAmount },
          })
        }
        // বাজেট আপডেট করা হচ্ছে totals
        const allItems = await db.budgetLineItem.findMany({ where: { budgetId: id } })
        const newRevised = allItems.reduce((s, li) => s + li.revisedBudget, 0)
        const budget = await db.budget.findUnique({ where: { id } })
        await db.budget.update({
          where: { id },
          data: {
            revisedValue: newRevised,
            approvedChanges: { increment: co.changeAmount },
            pendingChanges: { decrement: co.changeAmount },
          },
        })
      } else if (status === 'rejected') {
        // মুলত্বী পরিবর্তন প্রত্যাহার করা হচ্ছে
        const budget = await db.budget.findUnique({ where: { id } })
        if (budget) {
          await db.budget.update({
            where: { id },
            data: { pendingChanges: { decrement: co.changeAmount } },
          })
        }
      } else if (status === 'applied') {
        updateData.appliedAt = new Date()
      }
    }

    const updated = await db.budgetChangeOrder.update({
      where: { id: coId },
      data: updateData,
      include: { lineItemUpdates: true },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(updated)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; coId: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id, coId } = await params
    const co = await db.budgetChangeOrder.findUnique({ where: { id: coId, budgetId: id } })
    if (!co) {
      return NextResponse.json({ success: false, error: 'Change order not found' }, { status: 404 })
    }
    if (!['draft', 'rejected'].includes(co.status)) {
      return NextResponse.json({ success: false, error: 'Only draft or rejected change orders can be deleted' }, { status: 400 })
    }

    // মুলত্বী পরিবর্তন প্রত্যাহার করা হচ্ছে if any
    if (co.status === 'draft') {
      await db.budget.update({
        where: { id },
        data: { pendingChanges: { decrement: co.changeAmount } },
      })
    }

    await db.budgetChangeOrder.delete({ where: { id: coId } })
    return NextResponse.json({ success: true, data: { id: coId } })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}