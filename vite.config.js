import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'info',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./scr', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
})
