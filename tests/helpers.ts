import type { Page } from '@playwright/test'

export const ADMIN = {
  email: process.env.QA_ADMIN_EMAIL ?? 'admin@hjsb.com',
  // Demo credential seeded by prisma/create-admin.ts — not a secret.
  password: process.env.QA_ADMIN_PASSWORD ?? 'admin123',
}

/** Console errors + uncaught page errors, filtered of known benign noise. */
export function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return
    errors.push(msg.text())
  })
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`))
  return errors
}

/** Network responses with status >= 400 (same-origin only). */
export function trackBadResponses(page: Page): string[] {
  const bad: string[] = []
  page.on('response', (res) => {
    if (res.status() < 400) return
    const url = new URL(res.url())
    if (url.hostname !== 'localhost') return
    bad.push(`${res.status()} ${res.request().method()} ${url.pathname}`)
  })
  return bad
}

/** Open /app with a specific client-side view pre-selected. */
export async function gotoView(page: Page, view: string) {
  await page.addInitScript((v) => {
    try { window.localStorage.setItem('eppm:view', v) } catch {}
  }, view)
  await page.goto('/app')
  await page.locator('main').waitFor({ state: 'visible' })
  // Client views fetch /api/dashboard on mount; let the initial burst settle.
  await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})
}
