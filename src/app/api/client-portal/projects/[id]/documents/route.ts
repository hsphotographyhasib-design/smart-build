import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    // ক্লায়েন্ট পোর্টাল অ্যাক্সেস নিয়ন্ত্রণ
    if (!['client', 'super_admin', 'admin'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Access denied. Client portal only.' }, { status: 403 })
    }

    const { id } = await params

    // ক্লায়েন্ট ভূমিকার জন্য, প্রজেক্টটি তাদের নিজের কিনা যাচাই করা হচ্ছে
    if (user.role === 'client') {
      const project = await db.project.findUnique({
        where: { id },
        select: { clientId: true },
      })
      if (!project || project.clientId !== user.id) {
        return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
      }
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const where: any = { projectId: id }
    // শুধুমাত্র ক্লায়েন্ট-অ্যাক্সেসযোগ্য ধরন দেখানো হচ্ছে
    where.type = { in: ['drawing', 'contract', 'report', 'photo'] }
    if (type) where.type = type

    const documents = await db.projectDocument.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    // ধরন অনুযায়ী গ্রুপ করা হচ্ছে
    const grouped: Record<string, typeof documents> = {}
    for (const doc of documents) {
      if (!grouped[doc.type]) grouped[doc.type] = []
      grouped[doc.type].push(JSON.parse(JSON.stringify(doc)))
    }

    return NextResponse.json({
      success: true,
      data: {
        documents: JSON.parse(JSON.stringify(documents)),
        grouped,
        counts: Object.fromEntries(Object.entries(grouped).map(([k, v]) => [k, v.length])),
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed' }, { status: 500 })
  }
}
