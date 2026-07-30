import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const start = Date.now()
    const count = await db.appUser.count()
    const ms = Date.now() - start
    return NextResponse.json({ status: 'ok', db: 'connected', users: count, latencyMs: ms })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ status: 'error', db: 'failed', error: msg }, { status: 500 })
  }
}
