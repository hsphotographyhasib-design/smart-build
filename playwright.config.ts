import { defineConfig } from '@playwright/test'

// The QA container ships a pinned Chromium build; firefox/webkit downloads are
// blocked by the egress policy, so all three viewports run on Chromium.
// Set CHROMIUM_PATH to override; unset it on machines with matching browsers.
const executablePath = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium'

const AUTH_STATE = 'qa-artifacts/.auth/admin.json'

const viewports = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
}

const baseUse = {
  baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
  trace: 'on-first-retry' as const,
  screenshot: 'only-on-failure' as const,
  video: 'retain-on-failure' as const,
  launchOptions: { executablePath },
  storageState: AUTH_STATE,
}

export default defineConfig({
  testDir: './tests',
  outputDir: './qa-artifacts/test-results',
  fullyParallel: true,
  retries: 1,
  workers: 4,
  timeout: 45_000,
  reporter: [
    ['list'],
    ['json', { outputFile: 'qa-artifacts/last-run.json' }],
    ['html', { outputFolder: 'qa-artifacts/html-report', open: 'never' }],
  ],
  use: baseUse,
  webServer: {
    command: process.env.PW_PROD ? 'bun run start' : 'bun run dev',
    url: 'http://localhost:3000/login',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/, use: { ...baseUse, storageState: { cookies: [], origins: [] } } },
    { name: 'desktop', use: { ...baseUse, viewport: viewports.desktop }, dependencies: ['setup'] },
    { name: 'tablet', use: { ...baseUse, viewport: viewports.tablet }, dependencies: ['setup'] },
    { name: 'mobile', use: { ...baseUse, viewport: viewports.mobile, isMobile: true, hasTouch: true }, dependencies: ['setup'] },
  ],
})

export { AUTH_STATE, viewports }
