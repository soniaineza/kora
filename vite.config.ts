import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        notFound: resolve(__dirname, '404.html'),
      },
    },
  },
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


