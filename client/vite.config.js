// vite.config.js — Vite dev server + build config.
// The proxy lets the React dev server forward /api requests to Express
// during development, so you don't fight CORS in dev.

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});
