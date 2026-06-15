import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { answer } = body

    if (!answer) {
      return NextResponse.json({ success: false, error: 'answer is required' }, { status: 400 })
    }

    const question = await db.tenderQuestion.findUnique({ where: { id } })
    if (!question) {
      return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 })
    }

    if (question.status === 'answered' || question.status === 'closed') {
      return NextResponse.json({ success: false, error: 'Question has already been answered' }, { status: 400 })
    }

    const updated = await db.tenderQuestion.update({
      where: { id },
      data: {
        answer,
        answeredById: authUser.id,
        answeredAt: new Date(),
        status: 'answered',
      },
      include: {
        package: { select: { id: true, packageNo: true, name: true } },
        vendor: { select: { id: true, companyName: true } },
        askedBy: { select: { id: true, name: true } },
        answeredBy: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(updated)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to answer question'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}