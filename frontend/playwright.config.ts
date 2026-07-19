import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: 'http://localhost:5177',
    headless: true,
    viewport: { width: 1280, height: 800 },
  },
  timeout: 60000,
});
