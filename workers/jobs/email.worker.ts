/**
 * Email Worker
 *
 * Consumes the `email` queue.
 *
 * Integration points (marked TODO below):
 *   - Choose a transport: Nodemailer (SMTP via SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS)
 *     or an HTTP provider SDK (Resend, SendGrid, Postmark).
 *   - Template rendering: Handlebars / Nunjucks if `data.template` is set.
 *
 * Job data shape: EmailJobData (see src/lib/queue.ts)
 */

import type { Job } from 'bullmq'
import type { EmailJobData } from '../../src/lib/queue'
import { createWorker, type ManagedWorker } from '../lib/worker-factory'
import type Redis from 'ioredis'

// ---------------------------------------------------------------------------
// Processor
// ---------------------------------------------------------------------------

async function processEmail(job: Job<EmailJobData>): Promise<void> {
  const {
    to,
    subject,
    text,
    html,
    template,
    templateVars,
    from,
    attachments,
  } = job.data

  const recipients = Array.isArray(to) ? to : [to]

  if (!recipients.length || !subject) {
    throw new Error('Email job missing required fields: to, subject')
  }

  const fromAddress =
    from ??
    process.env.DEFAULT_FROM_EMAIL ??
    'noreply@smartbuild.app'

  // ---------------------------------------------------------------------------
  // TODO: Replace this stub with your chosen email transport.
  //
  // Option A — Nodemailer (SMTP):
  //
  //   import nodemailer from 'nodemailer'
  //   const transporter = nodemailer.createTransport({
  //     host: process.env.SMTP_HOST,
  //     port: Number(process.env.SMTP_PORT ?? 587),
  //     secure: process.env.SMTP_SECURE === 'true',
  //     auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  //   })
  //   let bodyHtml = html
  //   let bodyText = text
  //   if (template) {
  //     // Render Handlebars / Nunjucks template here
  //     bodyHtml = await renderTemplate(template, templateVars ?? {})
  //   }
  //   await transporter.sendMail({
  //     from: fromAddress, to: recipients.join(','), subject,
  //     text: bodyText, html: bodyHtml,
  //     attachments: attachments?.map(a => ({ filename: a.filename, path: a.path, contentType: a.contentType })),
  //   })
  //
  // Option B — Resend SDK:
  //
  //   import { Resend } from 'resend'
  //   const resend = new Resend(process.env.RESEND_API_KEY)
  //   await resend.emails.send({ from: fromAddress, to: recipients, subject, html, text })
  //
  // ---------------------------------------------------------------------------

  console.log('[worker:email] Sending email', {
    from: fromAddress,
    to: recipients,
    subject,
    template: template ?? null,
    attachmentCount: attachments?.length ?? 0,
  })

  // Simulate async work
  await new Promise((r) => setTimeout(r, 50))

  console.log('[worker:email] Email sent (stub) — wire up a real transport above')
}

// ---------------------------------------------------------------------------
// Factory export
// ---------------------------------------------------------------------------

export function startEmailWorker(connection: Redis): ManagedWorker {
  return createWorker<EmailJobData>({
    queueName: 'email',
    processor: processEmail,
    concurrency: 4,
    connection,
  })
}
