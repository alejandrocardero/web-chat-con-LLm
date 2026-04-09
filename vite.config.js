import path from "path"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: true,
    proxy: {
      '/hf-api': {
        target: 'https://router.huggingface.co/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/hf-api/, ''),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      },
      '/hf-embed': {
        target: 'https://router.huggingface.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/hf-embed/, ''),
        secure: true,
      },
      '/stt-api': {
        target: 'https://8001-01kms9d0rn13706v4vr53qr2vq.cloudspaces.litng.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/stt-api/, ''),
        secure: true,
      },
    },
  },
});