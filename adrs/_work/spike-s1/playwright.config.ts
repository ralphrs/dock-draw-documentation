import { defineConfig } from '@playwright/test'

// Cada subagente usa a própria porta (SPIKE_PORT) para rodar em paralelo sem colidir.
const port = Number(process.env.SPIKE_PORT ?? 5310)

export default defineConfig({
  testDir: 'tests',
  timeout: 60_000,
  workers: 1,
  reporter: [['list']],
  use: { baseURL: `http://localhost:${port}`, browserName: 'chromium', headless: true },
  webServer: {
    command: `npx vite dev --port ${port} --strictPort`,
    url: `http://localhost:${port}/`,
    reuseExistingServer: true,
    timeout: 120_000,
    env: { VITE_CACHE_DIR: `node_modules/.vite-${port}` },
  },
})
