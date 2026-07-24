/**
 * WhatsApp Worker
 *
 * Consumes the `whatsapp` queue.
 *
 * Processor responsibilities:
 *   1. Send a text or media message via the OpenWA REST API
 *      (wraps the same openwa-client pattern used elsewhere in the app).
 *   2. After a successful send, emit a real-time update to the
 *      whatsapp-realtime Socket.IO bridge so the inbox UI reflects delivery.
 *
 * Job data shape: WhatsAppJobData (see src/lib/queue.ts)
 */

import type { Job } from 'bullmq'
import type { WhatsAppJobData } from '../../src/lib/queue'
import { createWorker, type ManagedWorker } from '../lib/worker-factory'
import type Redis from 'ioredis'

// ---------------------------------------------------------------------------
// Internal OpenWA helpers (mirrors src/lib/openwa-client.ts patterns)
// ---------------------------------------------------------------------------

const OPENWA_BASE_URL = process.env.OPENWA_URL    || 'http://localhost:2785'
const OPENWA_API_KEY  = process.env.OPENWA_API_KEY || 'dev-admin-key'

async function openwaPost(path: string, body: unknown): Promise<unknown> {
  const res = await fetch(`${OPENWA_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': OPENWA_API_KEY,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText })) as { message: string }
    throw new Error(`OpenWA API Error (${res.status}): ${err.message}`)
  }

  return res.status === 204 ? null : res.json()
}

// ---------------------------------------------------------------------------
// Processor
// ---------------------------------------------------------------------------

async function processWhatsApp(job: Job<WhatsAppJobData>): Promise<void> {
  const {
    sessionId,
    chatId,
    text,
    mediaUrl,
    mediaType,
    mimetype,
    caption,
    filename,
    referenceId,
  } = job.data

  if (!sessionId) throw new Error('WhatsApp job missing required field: sessionId')
  if (!chatId)    throw new Error('WhatsApp job missing required field: chatId')
  if (!text && !mediaUrl) throw new Error('WhatsApp job: either text or mediaUrl must be provided')

  let result: unknown

  if (mediaUrl && mediaType) {
    // --- Media message ---
    if (mediaType === 'document') {
      result = await openwaPost(
        `/api/sessions/${sessionId}/messages/document`,
        {
          chatId,
          document: { url: mediaUrl, mimetype: mimetype ?? 'application/octet-stream' },
          filename: filename ?? 'document',
          caption,
        },
      )
    } else {
      result = await openwaPost(
        `/api/sessions/${sessionId}/messages/${mediaType}`,
        {
          chatId,
          [mediaType]: { url: mediaUrl, mimetype: mimetype ?? 'application/octet-stream' },
          caption,
        },
      )
    }
  } else {
    // --- Text message ---
    result = await openwaPost(`/api/sessions/${sessionId}/messages/text`, {
      chatId,
      text: text!,
    })
  }

  // Emit to whatsapp-realtime bridge (best-effort)
  const bridgeUrl =
    process.env.WHATSAPP_REALTIME_BRIDGE_URL || 'http://localhost:3096'

  try {
    const room = referenceId ? `conversation-${referenceId}` : 'whatsapp'
    await fetch(`${bridgeUrl}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room,
        event: 'message:sent',
        data: { chatId, referenceId, result },
      }),
      signal: AbortSignal.timeout(5_000),
    })
  } catch {
    // Non-fatal
  }
}

// ---------------------------------------------------------------------------
// Factory export
// ---------------------------------------------------------------------------

export function startWhatsAppWorker(connection: Redis): ManagedWorker {
  return createWorker<WhatsAppJobData>({
    queueName: 'whatsapp',
    processor: processWhatsApp,
    concurrency: 3, // conservative — respect OpenWA rate limits
    connection,
  })
}
