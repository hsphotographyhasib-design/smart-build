import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const versions = await db.systemVersion.findMany({ orderBy: { releasedAt: 'desc' } })
  return NextResponse.json({ success: true, data: versions })
}