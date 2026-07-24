import { NextResponse } from 'next/server'

/**
 * GET /api/health
 * Liveness probe — always returns 200.
 * Does NOT touch the database so it stays fast even under load.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? '0.2.0',
    },
    { status: 200 }
  )
}
