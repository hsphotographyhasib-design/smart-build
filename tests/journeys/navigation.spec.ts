import { test, expect } from '@playwright/test'
import { gotoView, trackConsoleErrors } from '../helpers'

test.describe('in-app navigation', () => {
  test('opening a project from the projects table shows its drawer', async ({ page }, testInfo) => {
    testInfo.skip(testInfo.project.name !== 'desktop', 'desktop-only journey')
    const errors = trackConsoleErrors(page)
    await gotoView(page, 'projects')
    const firstRow = page.locator('main tbody tr').first()
    await expect(firstRow).toBeVisible()
    await firstRow.click()
    // Row click opens the project drawer.
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10_000 })
    expect(errors).toEqual([])
  })

  test('selected view persists across a reload', async ({ page }, testInfo) => {
    testInfo.skip(testInfo.project.name !== 'desktop', 'desktop-only journey')
    await gotoView(page, 'risks')
    await page.reload()
    await expect(page.locator('main')).toBeVisible()
    const saved = await page.evaluate(() => localStorage.getItem('eppm:view'))
    expect(saved).toBe('risks')
  })

  test('authenticated API surface responds 200 with data', async ({ request }) => {
    const dashboard = await request.get('/api/dashboard')
    expect(dashboard.status()).toBe(200)
    const d = await dashboard.json()
    expect(Array.isArray(d.projects)).toBeTruthy()
    expect(d.projects.length).toBeGreaterThan(0)

    const project = await request.get(`/api/projects/${d.projects[0].id}`)
    expect(project.status()).toBe(200)
    const p = await project.json()
    expect(p.project?.id).toBe(d.projects[0].id)

    const resources = await request.get('/api/resources')
    expect(resources.status()).toBe(200)

    const csv = await request.get('/api/export?type=projects')
    expect(csv.status()).toBe(200)
  })
})
