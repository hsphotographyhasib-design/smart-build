import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const project = await db.project.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const where: Record<string, unknown> = { projectId: id }
    if (type && type !== 'all') {
      where.type = type
    }

    const documents = await db.projectDocument.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        type: true,
        filePath: true,
        fileSize: true,
        mimeType: true,
        uploadedBy: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    const data = documents.map((d) => ({
      ...d,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Project documents error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}