import { defineConfig } from '@playwright/test';

const browser = (process.env.ARE_BROWSER ?? 'chromium') as 'chromium' | 'webkit' | 'firefox';
const profile = process.env.ARE_PROFILE ?? 'desktop';
const width = Number(process.env.ARE_VIEWPORT_WIDTH ?? 1280);
const height = Number(process.env.ARE_VIEWPORT_HEIGHT ?? 720);
const dpr = Number(process.env.ARE_DEVICE_SCALE_FACTOR ?? 1);
const hasTouch = process.env.ARE_HAS_TOUCH === '1';
const mobileRequested = process.env.ARE_IS_MOBILE === '1';
const reportDir = 'playwright-report';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 30_000,
  expect: { timeout: 7_500 },
  outputDir: `test-results/${browser}-${profile}`,
  reporter: process.env.CI
    ? [
        ['github'],
        ['html', { open: 'never', outputFolder: reportDir }],
        ['json', { outputFile: `${reportDir}/results.json` }],
      ]
    : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName: browser,
    viewport: { width, height },
    deviceScaleFactor: dpr,
    hasTouch,
    isMobile: mobileRequested && browser !== 'firefox',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    reducedMotion: 'no-preference',
  },
  projects: [
    {
      name: `${browser}-${profile}`,
      use: { browserName: browser },
    },
  ],
  webServer: {
    command: 'pnpm serve:dist',
    url: 'http://127.0.0.1:4173/',
    reuseExistingServer: !process.env.CI,
    timeout: 15_000,
  },
});
