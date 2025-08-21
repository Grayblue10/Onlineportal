import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
    },
    hmr: {
      // Disable HMR overlay completely
      overlay: false,
    },
  },
  // Disable source maps in development for better performance
  build: {
    sourcemap: false,
  },
  // Disable CSS source maps
  css: {
    devSourcemap: false,
  },
  // Suppress React Router deprecation warnings
  define: {
    'process.env': {},
  },
  // Custom logger to suppress specific messages
  customLogger: {
    info: (msg, options) => {
      // Filter out HMR update messages
      if (typeof msg === 'string' && (
        msg.includes('[vite]') || 
        msg.includes('hmr update') || 
        msg.includes('hot updated')
      )) return
      console.log(msg, options)
    },
    warn: (msg, options) => {
      // Filter out common warnings
      if (typeof msg === 'string' && (
        msg.includes('Sourcemap for') || 
        msg.includes('React Router Future Flag Warning')
      )) return
      console.warn(msg, options)
    },
    error: (msg, options) => {
      // Filter out WebSocket connection errors
      if (typeof msg === 'string' && (
        msg.includes('WebSocket connection to') ||
        msg.includes('server connection lost')
      )) return
      console.error(msg, options)
    },
  },
})