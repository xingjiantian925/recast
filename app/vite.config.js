import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Plain SPA on purpose — no SSR, no server. Tauri will host the built output later.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/recast/' : '/',
  plugins: [vue()],
  server: { port: 5273, open: false },
  build: { outDir: 'dist', emptyOutDir: true },
}))