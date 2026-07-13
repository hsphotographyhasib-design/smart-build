import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { gotoView } from '../helpers'

const IMPACTS = ['serious', 'critical']

function seriousViolations(results: Awaited<ReturnType<AxeBuilder['analyze']>>) {
  return results.violations
    .filter((v) => IMPACTS.includes(v.impact ?? ''))
    .map((v) => `${v.impact}: ${v.id} — ${v.help} (${v.nodes.length} node(s), e.g. ${v.nodes[0]?.target})`)
}

test.describe('accessibility (axe, serious/critical)', () => {
  test('login page', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto('/login')
    await page.getByRole('heading', { name: 'Welcome back' }).waitFor()
    const results = await new AxeBuilder({ page }).analyze()
    expect(seriousViolations(results)).toEqual([])
  })

  for (const view of ['dashboard', 'projects', 'work-orders', 'admin']) {
    test(`app view: ${view}`, async ({ page }) => {
      await gotoView(page, view)
      const results = await new AxeBuilder({ page }).analyze()
      expect(seriousViolations(results)).toEqual([])
    })
  }
})
