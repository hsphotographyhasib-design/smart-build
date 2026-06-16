import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ query: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { query: queryParam } = await params
    const query = decodeURIComponent(queryParam).trim()

    if (!query) {
      return NextResponse.json({ success: false, error: 'Query parameter is required' }, { status: 400 })
    }

    let body: { category?: string; resultCount?: number } = {}
    try {
      body = await request.json()
    } catch {
      // No body or invalid JSON, that's fine
    }

    // Find existing entry for this user+query and update its timestamp
    const existing = await db.searchHistory.findFirst({
      where: {
        userId: user.id,
        query,
      },
    })

    if (existing) {
      await db.searchHistory.update({
        where: { id: existing.id },
        data: {
          createdAt: new Date(),
          category: body.category ?? existing.category,
          resultCount: body.resultCount ?? existing.resultCount,
        },
      })

      return NextResponse.json({ success: true, data: existing })
    }

    const entry = await db.searchHistory.create({
      data: {
        userId: user.id,
        query,
        category: body.category || null,
        resultCount: body.resultCount || 0,
      },
    })

    return NextResponse.json({ success: true, data: entry })
  } catch (error) {
    console.error('Search history POST error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}