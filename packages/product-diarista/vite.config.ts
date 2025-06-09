import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true,
    port: 5173,
    host: true
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  esbuild: {
    target: 'es2020'
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020'
    }
  }
})