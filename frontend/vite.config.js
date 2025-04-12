import { defineConfig } from 'vite';

export default defineConfig({
  base: '/chatbot/',
  root: 'frontend',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      external: ['dotenv', 'node-fetch', 'fs', 'nodemailer', 'whois-json'],
      input: 'frontend/index.html'
    }
  },
  server: {
    port: 7777
  },
  optimizeDeps: {
    exclude: ['backend/*']
  }
});