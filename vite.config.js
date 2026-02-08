import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/api/users': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
      },
      '/api/orders': {
        target: 'http://localhost:8086',
        changeOrigin: true,
        secure: false,
      },
      '/api/items': {
        target: 'http://localhost:8086',
        changeOrigin: true,
        secure: false,
      },
      '/api/payments': {
        target: 'http://localhost:8087',
        changeOrigin: true,
        secure: false,
      },
    }
  }
})
