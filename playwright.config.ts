import { defineConfig, devices } from '@playwright/test';

const chrome = { channel: 'chrome' as const };

export default defineConfig({
  testDir: 'tests/e2e',
  outputDir: 'test-results',
  reporter: 'list',
  use: { baseURL: 'http://localhost:4321', ...chrome },
  webServer: {
    command: 'npm run build && npm run preview',
    port: 4321,
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
