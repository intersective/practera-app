import { resolve } from 'node:path';
import { defineConfig, devices } from '@playwright/test';
const live = process.env.E2E_SANDBOX === '1';
const privacyProbe = process.env.E2E_PRIVACY_PROBE === '1';
if (live) process.env.PLAYWRIGHT_NO_COPY_PROMPT = '1';
const run = process.env.E2E_RUN || 'latest';
export default defineConfig({
  testDir: live ? './sandbox' : './mocked',
  testMatch: live ? (privacyProbe ? 'privacy.spec.ts' : 'smoke.spec.ts') : '**/*.spec.ts',
  fullyParallel: false, workers: 1, retries: 0, forbidOnly: true,
  timeout: 45000, expect: { timeout: 10000 },
  outputDir: resolve(__dirname, `../output/test-results/${live ? (privacyProbe ? 'privacy' : 'sandbox') : run}`),
  reporter: live ? [['line']] : [['list'], ['html', { outputFolder: resolve(__dirname, '../output/playwright-report'), open: 'never' }], ['json', { outputFile: resolve(__dirname, `../output/evidence/e2e-${run}.json`) }]],
  use: { baseURL: 'http://localhost:4300', serviceWorkers: 'block',
    trace: live ? 'off' : 'retain-on-failure', screenshot: live ? 'off' : 'only-on-failure',
    video: 'off' },
  projects: live ? [{ name: 'sandbox-chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } }] : [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    { name: 'android-chromium', use: { ...devices['Pixel 7'] } },
    { name: 'iphone-webkit', use: { ...devices['iPhone 13'] } },
  ],
  webServer: privacyProbe ? undefined : { cwd: resolve(__dirname, '..'), command: 'node e2e/support/launcher.mjs serve',
    url: 'http://localhost:4300', reuseExistingServer: false, timeout: 180000,
    stdout: 'pipe', stderr: 'pipe' },
});
