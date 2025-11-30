import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar react y react-dom en su propio chunk
          'react-vendor': ['react', 'react-dom', 'react-router'],
          // Separar react-icons en chunks por familia
          'icons-fa': ['react-icons/fa'],
          'icons-io': ['react-icons/io5'],
          'icons-cg': ['react-icons/cg'],
          'icons-gi': ['react-icons/gi'],
        }
      }
    },
    // Optimizar el tamaño de los chunks
    chunkSizeWarningLimit: 1000,
  },
  // Optimización de dependencias
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router'],
  }
})
