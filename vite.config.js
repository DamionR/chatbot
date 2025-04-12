import { defineConfig } from 'vite';

export default defineConfig({
  base: '/chatbot-project/',
  root: 'frontend',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  server: {
    port: 7777
  }
});