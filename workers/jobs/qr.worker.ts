/**
 * QR Code Worker
 *
 * Consumes the `qr` queue.
 *
 * Processor responsibilities:
 *   1. Generate a QR code image (PNG or SVG) from the job payload.
 *   2. Save it to disk (REPORTS_OUTPUT_DIR / QR_OUTPUT_DIR) or upload to
 *      object storage (S3 / R2).
 *   3. If the QR code belongs to an Asset, update Asset.qrCode in the DB.
 *   4. Notify the requesting user via the `notifications` queue.
 *
 * Recommended npm package: `qrcode` (pure JS, no native deps)
 *   npm install qrcode @types/qrcode
 *
 * Job data shape: QrJobData (see src/lib/queue.ts)
 */

import path from 'path'
import fs from 'fs/promises'
import type { Job } from 'bullmq'
import { db } from '../../src/lib/db'
import type { QrJobData } from '../../src/lib/queue'
import { createWorker, type ManagedWorker } from '../lib/worker-factory'
import type Redis from 'ioredis'

// ---------------------------------------------------------------------------
// Output directory
// ---------------------------------------------------------------------------

const QR_OUTPUT_DIR = process.env.QR_OUTPUT_DIR ?? '/tmp/smartbuild/qr'

async function ensureOutputDir(): Promise<void> {
  await fs.mkdir(QR_OUTPUT_DIR, { recursive: true })
}

// ---------------------------------------------------------------------------
// Processor
// ---------------------------------------------------------------------------

async function processQr(job: Job<QrJobData>): Promise<void> {
  const {
    content,
    size = 256,
    format = 'png',
    entityType,
    entityId,
    requestedByUserId,
  } = job.data

  if (!content) throw new Error('QR job missing required field: content')

  await ensureOutputDir()

  const filename = `qr-${entityType ?? 'misc'}-${entityId ?? Date.now()}.${format}`
  const outputPath = path.join(QR_OUTPUT_DIR, filename)

  // ---------------------------------------------------------------------------
  // TODO: Replace stub with real qrcode library call:
  //
  //   import QRCode from 'qrcode'
  //
  //   if (format === 'svg') {
  //     const svgString = await QRCode.toString(content, { type: 'svg', width: size })
  //     await fs.writeFile(outputPath, svgString, 'utf-8')
  //   } else {
  //     await QRCode.toFile(outputPath, content, { type: 'png', width: size })
  //   }
  // ---------------------------------------------------------------------------

  // Stub: write a placeholder file so the rest of the pipeline can be tested
  await fs.writeFile(
    outputPath,
    `QR_STUB:${content}:${size}:${format}`,
    'utf-8',
  )

  console.log(`[worker:qr] Generated QR code: ${outputPath}`)

  // ---------------------------------------------------------------------------
  // Update Asset.qrCode if this QR belongs to an asset
  // ---------------------------------------------------------------------------
  if (entityType === 'asset' && entityId) {
    try {
      await db.asset.update({
        where: { id: entityId },
        data: { qrCode: outputPath },
      })
      console.log(`[worker:qr] Updated asset ${entityId} qrCode path`)
    } catch (dbErr) {
      console.warn(`[worker:qr] Could not update asset ${entityId}:`, (dbErr as Error).message)
    }
  }

  // ---------------------------------------------------------------------------
  // Notify requesting user (best-effort)
  // ---------------------------------------------------------------------------
  if (requestedByUserId) {
    const { enqueue } = await import('../../src/lib/queue')
    await enqueue('notifications', 'qr-ready', {
      userId: requestedByUserId,
      type: 'qr_ready',
      title: 'QR code ready',
      message: `QR code for ${entityType ?? 'item'} ${entityId ?? ''} has been generated.`,
      data: { filename, outputPath, entityType, entityId },
    })
  }
}

// ---------------------------------------------------------------------------
// Factory export
// ---------------------------------------------------------------------------

export function startQrWorker(connection: Redis): ManagedWorker {
  return createWorker<QrJobData>({
    queueName: 'qr',
    processor: processQr,
    concurrency: 4,
    connection,
  })
}
