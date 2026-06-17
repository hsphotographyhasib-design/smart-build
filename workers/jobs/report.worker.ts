/**
 * Report Worker
 *
 * Consumes the `reports` queue.
 *
 * Processor responsibilities:
 *   1. Fetch the required data from the database via Prisma based on
 *      reportType + entityId + date range + filters.
 *   2. Render the report into the requested format (pdf / xlsx / csv).
 *      The `pdf` queue handles Puppeteer rendering; for quick tabular data
 *      a direct xlsx library call is made here.
 *   3. Persist or upload the generated file (local FS / S3 / Cloudflare R2).
 *   4. Notify the requesting user via the `notifications` queue.
 *
 * Job data shape: ReportJobData (see src/lib/queue.ts)
 */

import type { Job } from 'bullmq'
import { db } from '../../src/lib/db'
import type { ReportJobData } from '../../src/lib/queue'
import { createWorker, type ManagedWorker } from '../lib/worker-factory'
import type Redis from 'ioredis'

// ---------------------------------------------------------------------------
// Processor
// ---------------------------------------------------------------------------

async function processReport(job: Job<ReportJobData>): Promise<void> {
  const {
    reportType,
    entityId,
    dateFrom,
    dateTo,
    format,
    requestedByUserId,
    filters,
  } = job.data

  if (!reportType) throw new Error('Report job missing required field: reportType')
  if (!format)     throw new Error('Report job missing required field: format')

  await job.updateProgress(5)

  // ---------------------------------------------------------------------------
  // Step 1: Fetch data from the database
  // ---------------------------------------------------------------------------
  // TODO: Replace each case with a real Prisma query appropriate to the report.
  // The structure below shows where each query goes.

  let rows: Record<string, unknown>[] = []

  switch (reportType) {
    case 'project-summary': {
      const projects = await db.project.findMany({
        where: entityId ? { id: entityId } : {},
        select: {
          id: true,
          name: true,
          code: true,
          status: true,
          startDate: true,
          endDate: true,
          budget: true,
          progress: true,
          clientId: true,
        },
        take: 500,
      })
      rows = projects.map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        status: p.status,
        startDate: p.startDate,
        endDate: p.endDate,
        budget: p.budget,
        progress: p.progress,
        clientId: p.clientId ?? '',
      }))
      break
    }

    case 'invoice': {
      // TODO: query invoices with filters (dateFrom/dateTo/entityId)
      console.log('[worker:reports] invoice report — TODO: implement Prisma query', {
        entityId, dateFrom, dateTo, filters,
      })
      rows = []
      break
    }

    case 'maintenance': {
      // TODO: query MaintenanceTicket with filters
      console.log('[worker:reports] maintenance report — TODO: implement Prisma query', {
        entityId, dateFrom, dateTo, filters,
      })
      rows = []
      break
    }

    case 'financial':
    case 'sla':
    case 'labour':
    case 'custom':
    default: {
      console.log(`[worker:reports] ${reportType} report — TODO: implement Prisma query`, {
        entityId, dateFrom, dateTo, filters,
      })
      rows = []
      break
    }
  }

  await job.updateProgress(50)

  // ---------------------------------------------------------------------------
  // Step 2: Render
  // ---------------------------------------------------------------------------
  // TODO: Hook up a real renderer per format:
  //   - format === 'xlsx' → use `exceljs` or `xlsx` npm package
  //   - format === 'csv'  → JSON → CSV via `papaparse` / `csv-stringify`
  //   - format === 'pdf'  → enqueue a `pdf` job with the rendered HTML, or
  //                         call Puppeteer directly here
  //
  // Example (exceljs):
  //   import ExcelJS from 'exceljs'
  //   const wb = new ExcelJS.Workbook()
  //   const ws = wb.addWorksheet(reportType)
  //   if (rows.length) ws.addRow(Object.keys(rows[0]))
  //   rows.forEach(r => ws.addRow(Object.values(r)))
  //   const buffer = await wb.xlsx.writeBuffer()
  //   const filename = `${reportType}-${Date.now()}.xlsx`
  //   fs.writeFileSync(path.join(process.env.REPORTS_OUTPUT_DIR ?? '/tmp', filename), buffer)

  const filename = `${reportType}-${Date.now()}.${format}`

  console.log(`[worker:reports] Generated report stub: ${filename} (${rows.length} rows)`)

  await job.updateProgress(90)

  // ---------------------------------------------------------------------------
  // Step 3: Notify the user
  // ---------------------------------------------------------------------------
  // Re-use the notifications queue so the user sees an in-app banner.
  // We import enqueue dynamically to avoid a circular module dep at startup.
  const { enqueue } = await import('../../src/lib/queue')
  await enqueue('notifications', 'report-ready', {
    userId: requestedByUserId,
    type: 'report_ready',
    title: 'Your report is ready',
    message: `${reportType} report (${format.toUpperCase()}) has been generated.`,
    data: { filename, reportType, format },
  })

  await job.updateProgress(100)
}

// ---------------------------------------------------------------------------
// Factory export
// ---------------------------------------------------------------------------

export function startReportWorker(connection: Redis): ManagedWorker {
  return createWorker<ReportJobData>({
    queueName: 'reports',
    processor: processReport,
    concurrency: 2, // CPU-ish; keep low
    connection,
  })
}
