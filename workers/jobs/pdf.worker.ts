/**
 * PDF Worker
 *
 * Consumes the `pdf` queue.
 *
 * Processor responsibilities:
 *   1. Accept either an HTML string or a URL.
 *   2. Render it to PDF using Puppeteer (or Playwright — see TODO).
 *   3. Save to disk or upload to object storage.
 *   4. Notify the requesting user via the `notifications` queue.
 *
 * Recommended packages:
 *   npm install puppeteer-core @sparticuz/chromium
 *   (or: npm install playwright-core)
 *
 * Job data shape: PdfJobData (see src/lib/queue.ts)
 */

import path from 'path'
import fs from 'fs/promises'
import type { Job } from 'bullmq'
import type { PdfJobData } from '../../src/lib/queue'
import { createWorker, type ManagedWorker } from '../lib/worker-factory'
import type Redis from 'ioredis'

// ---------------------------------------------------------------------------
// Output directory
// ---------------------------------------------------------------------------

const PDF_OUTPUT_DIR = process.env.PDF_OUTPUT_DIR ?? '/tmp/smartbuild/pdf'

async function ensureOutputDir(): Promise<void> {
  await fs.mkdir(PDF_OUTPUT_DIR, { recursive: true })
}

// ---------------------------------------------------------------------------
// Processor
// ---------------------------------------------------------------------------

async function processPdf(job: Job<PdfJobData>): Promise<void> {
  const {
    html,
    url,
    pdfOptions,
    entityType,
    entityId,
    requestedByUserId,
    filename: requestedFilename,
  } = job.data

  if (!html && !url) {
    throw new Error('PDF job requires either html or url')
  }

  await ensureOutputDir()

  const safeFilename =
    (requestedFilename ?? `${entityType ?? 'doc'}-${entityId ?? Date.now()}`)
      .replace(/[^a-zA-Z0-9_-]/g, '-')

  const outputPath = path.join(PDF_OUTPUT_DIR, `${safeFilename}.pdf`)

  await job.updateProgress(10)

  // ---------------------------------------------------------------------------
  // TODO: Replace stub with Puppeteer rendering:
  //
  //   import puppeteer from 'puppeteer-core'
  //   import chromium from '@sparticuz/chromium'
  //
  //   const browser = await puppeteer.launch({
  //     args: chromium.args,
  //     defaultViewport: chromium.defaultViewport,
  //     executablePath: await chromium.executablePath(),
  //     headless: chromium.headless,
  //   })
  //
  //   const page = await browser.newPage()
  //
  //   if (url) {
  //     await page.goto(url, { waitUntil: 'networkidle0', timeout: 30_000 })
  //   } else {
  //     await page.setContent(html!, { waitUntil: 'networkidle0' })
  //   }
  //
  //   await page.pdf({
  //     path: outputPath,
  //     format: (pdfOptions?.format as puppeteer.PaperFormat) ?? 'A4',
  //     landscape: pdfOptions?.landscape ?? false,
  //     margin: pdfOptions?.margin ?? { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
  //     printBackground: true,
  //   })
  //
  //   await browser.close()
  // ---------------------------------------------------------------------------

  // Stub: write placeholder
  const source = url ? `URL:${url}` : `HTML(${(html ?? '').length} chars)`
  await fs.writeFile(outputPath, `PDF_STUB:${source}`, 'utf-8')

  console.log(`[worker:pdf] Generated PDF stub: ${outputPath}`)

  await job.updateProgress(90)

  // ---------------------------------------------------------------------------
  // Notify requesting user (best-effort)
  // ---------------------------------------------------------------------------
  if (requestedByUserId) {
    const { enqueue } = await import('../../src/lib/queue')
    await enqueue('notifications', 'pdf-ready', {
      userId: requestedByUserId,
      type: 'pdf_ready',
      title: 'PDF ready',
      message: `${safeFilename}.pdf has been generated.`,
      data: {
        filename: `${safeFilename}.pdf`,
        outputPath,
        entityType,
        entityId,
      },
    })
  }

  await job.updateProgress(100)
}

// ---------------------------------------------------------------------------
// Factory export
// ---------------------------------------------------------------------------

export function startPdfWorker(connection: Redis): ManagedWorker {
  return createWorker<PdfJobData>({
    queueName: 'pdf',
    processor: processPdf,
    concurrency: 2, // Puppeteer is memory-heavy; keep low
    connection,
  })
}
