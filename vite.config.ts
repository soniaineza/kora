import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Dev-only: proxy API + webhooks to the Express server to avoid CORS.
      '^/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '^/webhooks': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
})


