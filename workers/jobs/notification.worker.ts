/**
 * Notification Worker
 *
 * Consumes the `notifications` queue.
 *
 * Processor responsibilities:
 *   1. Write a Notification row to the database via Prisma.
 *   2. (TODO) Push a real-time socket.io event via the maintenance-notify
 *      bridge so connected clients see the badge counter update instantly.
 *
 * Job data shape: NotificationJobData (see src/lib/queue.ts)
 */

import type { Job } from 'bullmq'
import { db } from '../../src/lib/db'
import type { NotificationJobData } from '../../src/lib/queue'
import { createWorker, type ManagedWorker } from '../lib/worker-factory'
import type Redis from 'ioredis'

// ---------------------------------------------------------------------------
// Processor
// ---------------------------------------------------------------------------

async function processNotification(
  job: Job<NotificationJobData>,
): Promise<void> {
  const { userId, type, title, message, data } = job.data

  if (!userId) throw new Error('Notification job missing required field: userId')
  if (!type)   throw new Error('Notification job missing required field: type')
  if (!title)  throw new Error('Notification job missing required field: title')

  // 1. Persist notification in the database
  const notification = await db.notification.create({
    data: {
      userId,
      type,
      title,
      message: message ?? '',
      data: data ? JSON.stringify(data) : null,
      isRead: false,
    },
  })

  // 2. Real-time push via maintenance-notify HTTP bridge
  //    Bridge is at MAINTENANCE_NOTIFY_BRIDGE_URL (default: http://localhost:3095)
  const bridgeUrl =
    process.env.MAINTENANCE_NOTIFY_BRIDGE_URL || 'http://localhost:3095'

  try {
    const res = await fetch(`${bridgeUrl}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room: `client-${userId}`,
        event: 'notification:new',
        data: {
          id: notification.id,
          type,
          title,
          message: message ?? '',
          createdAt: notification.createdAt,
        },
      }),
      signal: AbortSignal.timeout(5_000),
    })

    if (!res.ok) {
      console.warn(
        `[worker:notifications] Real-time bridge responded ${res.status} — notification persisted but not pushed live`,
      )
    }
  } catch (bridgeErr) {
    // Non-fatal: the row is already written; real-time delivery is best-effort
    console.warn(
      `[worker:notifications] Could not reach real-time bridge: ${(bridgeErr as Error).message}`,
    )
  }
}

// ---------------------------------------------------------------------------
// Factory export
// ---------------------------------------------------------------------------

export function startNotificationWorker(connection: Redis): ManagedWorker {
  return createWorker<NotificationJobData>({
    queueName: 'notifications',
    processor: processNotification,
    concurrency: 5,
    connection,
  })
}
