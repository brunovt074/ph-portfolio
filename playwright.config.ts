import { defineConfig, devices } from '@playwright/test';

const chrome = { channel: 'chrome' as const };

export default defineConfig({
  timeout: 60000,
  testDir: 'tests/e2e',
  outputDir: 'test-results',
  reporter: 'list',
  use: { baseURL: 'http://localhost:4321', ...chrome },
  webServer: {
    command: 'npm run build && node dist/server/entry.mjs',
    url: 'http://localhost:4321',
    env: { HOST: 'localhost', PORT: '4321', CONTACT_DELIVERY_MODE: 'console' },
    reuseExistingServer: true,
    timeout: 180000,
  },
  projects: [
    { name: 'mobile-375', use: { ...devices['Pixel 7'], ...chrome, viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true } },
    { name: 'tablet-768', use: { ...chrome, viewport: { width: 768, height: 1024 } } },
    { name: 'desktop-1280', use: { ...chrome, viewport: { width: 1280, height: 800 } } },
    { name: 'desktop-1440', use: { ...chrome, viewport: { width: 1440, height: 900 } } },
  ],
});
