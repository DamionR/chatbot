import { defineConfig } from 'vite';

export default defineConfig({
  base: '/chatbot/',
  root: 'frontend',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  server: {
    port: 7777
  },
  resolve: {
    alias: {
      // Mock Node.js modules for browser compatibility
      'fs': '/frontend/utils/empty.js',
      'path': '/frontend/utils/empty.js',
      'child_process': '/frontend/utils/empty.js',
      'node:process': '/frontend/utils/empty.js'
    }
  },
  optimizeDeps: {
    exclude: ['fs', 'path', 'child_process', 'node:process']
  }
});