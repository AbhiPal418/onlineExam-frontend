import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api':'https://online-exam-backend-delta.vercel.app',
      // '/api':'http://localhost:3000',
    },
  },
})
