import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const comments = await db.invoiceComment.findMany({
      where: { invoiceId: id, parentId: null },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        replies: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: comments })
  } catch (error) {
    console.error('Invoice comments GET error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch comments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { content, parentId } = body

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Comment content is required' }, { status: 400 })
    }

    // ইনভয়েস বিদ্যমান কিনা যাচাই করা হচ্ছে
    const invoice = await db.invoice.findUnique({ where: { id } })
    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 })
    }

    // প্রদান করা হলে প্যারেন্ট মন্তব্য বিদ্যমান কিনা যাচাই করা হচ্ছে
    if (parentId) {
      const parent = await db.invoiceComment.findUnique({
        where: { id: parentId },
      })
      if (!parent || parent.invoiceId !== id) {
        return NextResponse.json({ success: false, error: 'Parent comment not found' }, { status: 404 })
      }
    }

    const comment = await db.invoiceComment.create({
      data: {
        invoiceId: id,
        userId: user.id,
        content: content.trim(),
        parentId: parentId || null,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    })

    return NextResponse.json({ success: true, data: comment }, { status: 201 })
  } catch (error) {
    console.error('Invoice comments POST error:', error)
    return NextResponse.json({ success: false, error: 'Failed to add comment' }, { status: 500 })
  }
}