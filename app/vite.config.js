import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Plain SPA on purpose — no SSR, no server. Tauri will host the built output later.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/recast/' : '/',
  plugins: [vue()],
  server: { port: 5273, open: false },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // 框架依赖单独成 chunk：业务代码更新后用户不必重新下载 vendor
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor'
        },
      },
    },
  },
}))