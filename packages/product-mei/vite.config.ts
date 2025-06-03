import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@finmanage/core': path.resolve(__dirname, '../core'),
    },
  },
  optimizeDeps: {
    include: ['@finmanage/core'],
  },
  server: {
    port: 3002
  }
}) 