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

    const dailyNotes = await db.dailyNote.findMany({
      where: { projectId: id },
      orderBy: { date: 'desc' },
      take: 100,
      include: {
        supervisor: { select: { id: true, name: true, avatar: true } },
      },
    })

    const data = dailyNotes.map((d) => ({
      id: d.id,
      date: d.date.toISOString(),
      weather: d.weather,
      temperature: d.temperature,
      workDone: d.workDone,
      issues: d.issues,
      labourCount: d.labourCount,
      supervisor: d.supervisor,
      createdAt: d.createdAt.toISOString(),
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Project daily notes error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}