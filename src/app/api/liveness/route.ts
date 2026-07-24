import { NextResponse } from 'next/server'

/**
 * GET /api/liveness
 * Kubernetes / load-balancer liveness probe.
 * Returns 200 immediately — no external checks.
 */
export async function GET() {
  return NextResponse.json({ alive: true }, { status: 200 })
}
