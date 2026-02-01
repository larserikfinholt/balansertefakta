import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Run local dev servers before starting the tests
  webServer: [
    {
      command: 'pnpm --filter @balansertefakta/api dev',
      url: 'http://localhost:4000',
      reuseExistingServer: !process.env.CI,
      cwd: '../..',
    },
    {
      command: 'pnpm --filter @balansertefakta/web dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      cwd: '../..',
    },
  ],
});
