import { test, expect } from '@playwright/test'
import { ADMIN } from '../helpers'

// All auth-journey tests start signed out.
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('email/password sign-in', () => {
  test('rejects wrong credentials with a visible error', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('admin@hjsb.com')
    await page.getByLabel('Password').fill('definitely-wrong')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByText('Invalid email or password')).toBeVisible()
    await expect(page).toHaveURL(/\/login/)
  })

  test('signs in and lands on /app', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(ADMIN.email)
    await page.getByLabel('Password').fill(ADMIN.password)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/app$/, { timeout: 15_000 })
    await expect(page.locator('main')).toBeVisible()
  })

  test('honours the ?from= redirect after sign-in', async ({ page }) => {
    await page.goto('/app')
    await expect(page).toHaveURL(/\/login\?from=%2Fapp/)
    await page.getByLabel('Email').fill(ADMIN.email)
    await page.getByLabel('Password').fill(ADMIN.password)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/app$/, { timeout: 15_000 })
  })
})

test.describe('registration', () => {
  test('creates a new account via the sign-up form and signs it in', async ({ page }) => {
    const email = `qa-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`
    await page.goto('/login')
    await page.getByRole('button', { name: 'Create one' }).click()
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()
    await page.getByLabel('Full name').fill('QA Robot')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill('qa-passw0rd!')
    await page.getByRole('button', { name: 'Create account' }).click()
    await expect(page).toHaveURL(/\/app$/, { timeout: 15_000 })
  })

  test('rejects duplicate registration for an existing email', async ({ request }) => {
    const res = await request.post('/api/auth/register', {
      data: { name: 'Dup', email: ADMIN.email, password: 'whatever123' },
    })
    expect(res.status()).toBeGreaterThanOrEqual(400)
    expect(res.status()).toBeLessThan(500)
  })
})

test.describe('session lifecycle', () => {
  test('logout clears the session and re-gates /app', async ({ page, request }) => {
    // Sign in via API to keep this test focused on logout.
    const login = await request.post('/api/auth/login', {
      data: { email: ADMIN.email, password: ADMIN.password },
    })
    expect(login.ok()).toBeTruthy()
    const state = await request.storageState()
    await page.context().addCookies(state.cookies)

    await page.goto('/app')
    await expect(page).toHaveURL(/\/app$/)

    const logout = await page.request.post('/api/auth/logout')
    expect(logout.ok()).toBeTruthy()

    await page.goto('/app')
    await expect(page).toHaveURL(/\/login\?from=%2Fapp/)
  })
})
