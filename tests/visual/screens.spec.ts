import { test, expect } from '@playwright/test'
import { gotoView } from '../helpers'

// Full-page captures for the visual-regression gallery. Written to
// qa-artifacts/screenshots/<project>/<name>.png on every run; the QA loop
// diffs consecutive runs out-of-band.
const SCREENS = ['dashboard', 'projects', 'gantt', 'work-orders'] as const

test.describe('visual captures', () => {
  for (const view of SCREENS) {
    test(`capture ${view}`, async ({ page }, testInfo) => {
      await gotoView(page, view)
      // Let charts/motion settle before capturing.
      await page.waitForTimeout(1200)
      await page.screenshot({
        path: `qa-artifacts/screenshots/${testInfo.project.name}/${view}.png`,
        fullPage: true,
        animations: 'disabled',
      })
      await expect(page.locator('main')).toBeVisible()
    })
  }

  test('capture login', async ({ page }, testInfo) => {
    await page.context().clearCookies()
    await page.goto('/login')
    await page.getByRole('heading', { name: 'Welcome back' }).waitFor()
    await page.waitForTimeout(600)
    await page.screenshot({
      path: `qa-artifacts/screenshots/${testInfo.project.name}/login.png`,
      fullPage: true,
      animations: 'disabled',
    })
  })
})
