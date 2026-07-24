import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/** Milliseconds before we give up on the realtime bridge */
const REALTIME_TIMEOUT_MS = 2_000
const REALTIME_URL = process.env.REALTIME_BRIDGE_URL ?? 'http://localhost:3096'

type CheckResult = {
  status: 'ok' | 'fail'
  latencyMs: number
  error?: string
}

async function checkDatabase(): Promise<CheckResult> {
  const start = Date.now()
  try {
    await db.$queryRaw`SELECT 1`
    return { status: 'ok', latencyMs: Date.now() - start }
  } catch (err) {
    return {
      status: 'fail',
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : 'unknown db error',
    }
  }
}

async function checkRealtime(): Promise<CheckResult> {
  const start = Date.now()
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), REALTIME_TIMEOUT_MS)

    const res = await fetch(REALTIME_URL, {
      method: 'GET',
      signal: controller.signal,
    }).finally(() => clearTimeout(timer))

    if (!res.ok) {
      return {
        status: 'fail',
        latencyMs: Date.now() - start,
        error: `HTTP ${res.status}`,
      }
    }

    return { status: 'ok', latencyMs: Date.now() - start }
  } catch (err) {
    return {
      status: 'fail',
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : 'unknown realtime error',
    }
  }
}

/**
 * GET /api/ready
 * Readiness probe. Checks critical dependencies and returns:
 *   200  { status: 'ready',    checks: { database, realtime } }
 *   503  { status: 'degraded', checks: { database, realtime } }
 *
 * The database check is critical (503 on failure).
 * The realtime bridge is best-effort (degrades but does NOT 503 on its own).
 */
export async function GET() {
  const [database, realtime] = await Promise.all([checkDatabase(), checkRealtime()])

  const checks = { database, realtime }

  // Only the database is a hard dependency for readiness
  const isCriticalDown = database.status === 'fail'
  const status = isCriticalDown ? 'degraded' : 'ready'
  const httpStatus = isCriticalDown ? 503 : 200

  return NextResponse.json({ status, checks }, { status: httpStatus })
}
