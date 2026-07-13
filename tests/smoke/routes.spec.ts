import { test, expect } from '@playwright/test'
import { trackConsoleErrors } from '../helpers'

test.describe('public routing & auth gate', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('root redirects unauthenticated visitors to /login', async ({ page }) => {
    const res = await page.goto('/')
    expect(res?.status()).toBe(200)
    await expect(page).toHaveURL(/\/login$/)
  })

  test('/login renders without console errors', async ({ page }) => {
    const errors = trackConsoleErrors(page)
    const res = await page.goto('/login')
    expect(res?.status()).toBe(200)
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
    expect(errors).toEqual([])
  })

  test('/app redirects unauthenticated visitors to /login?from=', async ({ page }) => {
    await page.goto('/app')
    await expect(page).toHaveURL(/\/login\?from=%2Fapp/)
  })

  test('API routes return JSON 401 when unauthenticated', async ({ request }) => {
    for (const path of ['/api/dashboard', '/api/resources', '/api/admin/users']) {
      const res = await request.get(path)
      expect(res.status(), path).toBe(401)
      expect((await res.json()).error, path).toBe('Unauthorized')
    }
  })

  test('robots.txt is served', async ({ request }) => {
    const res = await request.get('/robots.txt')
    expect(res.status()).toBe(200)
  })
})

test.describe('authenticated shell', () => {
  test('/app loads for a signed-in user without console errors', async ({ page }) => {
    const errors = trackConsoleErrors(page)
    await page.goto('/app')
    await expect(page).toHaveURL(/\/app$/)
    await expect(page.locator('main')).toBeVisible()
    expect(errors).toEqual([])
  })

  test('/login bounces signed-in users into the app', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL(/\/app$/)
  })
})
