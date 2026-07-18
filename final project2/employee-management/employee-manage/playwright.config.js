// playwright.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // ── Test directory ──────────────────────────────────────────
  testDir: './tests',

  // ── Global timeout ──────────────────────────────────────────
  timeout: 60_000,
  expect: { timeout: 15_000 },

  // ── Retry failed tests once ─────────────────────────────────
  retries: 1,

  // ── Parallel execution ──────────────────────────────────────
  fullyParallel: false,       // sequential within a file for data deps
  workers: 1,                 // single worker — MockAPI rate-limit safe

  // ── Reporter ────────────────────────────────────────────────
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  // ── Global settings ─────────────────────────────────────────
  use: {
    baseURL: 'http://localhost:5173',

    // Capture artefacts on failure
    screenshot: 'only-on-failure',
    video:      'retain-on-failure',
    trace:      'retain-on-failure',

    // Browser context
    viewport:       { width: 1280, height: 720 },
    actionTimeout:  15_000,
    navigationTimeout: 20_000,

    // Ignore HTTPS errors (local dev)
    ignoreHTTPSErrors: true,
  },

  // ── Projects ─────────────────────────────────────────────────
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'msedge', // Use Microsoft Edge which is pre-installed on Windows systems
      },
    },
  ],

  // ── Output directory for artefacts ──────────────────────────
  outputDir: 'test-results/',

  // ── Auto-start dev server if not already running ─────────────
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,   // reuse if already running (manual npm run dev)
    timeout: 30_000,
  },
});
