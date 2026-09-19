// Mesmo wrapper do app (insumos/package.json): @lovable.dev/vite-tanstack-config.
// nitro: false porque o spike não publica; dev e build SSR continuam pelo TanStack Start.
import { defineConfig } from '@lovable.dev/vite-tanstack-config'

export default defineConfig({
  nitro: false,
  vite: {
    // Cache separado por porta: os dois subagentes rodam o dev server em paralelo.
    cacheDir: process.env.VITE_CACHE_DIR ?? 'node_modules/.vite',
    server: { fs: { allow: ['..', '../../ADR-002-anexos'] } },
  },
})
