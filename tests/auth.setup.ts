import { test as setup, expect } from '@playwright/test'
import { ADMIN } from './helpers'

const AUTH_STATE = 'qa-artifacts/.auth/admin.json'

setup('authenticate as admin', async ({ request }) => {
  const res = await request.post('/api/auth/login', {
    data: { email: ADMIN.email, password: ADMIN.password },
  })
  expect(res.ok(), `login failed: ${res.status()} ${await res.text()}`).toBeTruthy()
  await request.storageState({ path: AUTH_STATE })
})
