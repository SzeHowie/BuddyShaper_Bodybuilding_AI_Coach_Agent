import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Browser cannot call open.bigmodel.cn directly (CORS).
    // Dev requests go to /api/glm/* → proxied to Zhipu.
    proxy: {
      '/api/glm': {
        target: 'https://open.bigmodel.cn',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/glm/, '/api/paas/v4'),
      },
    },
  },
})
