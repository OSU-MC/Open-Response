// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
  // added to specify client side port so that CORS will work
  // ../core/.env CLIENT_URL should be specified as
  // CLIENT_URL='http://localhost:3000'
  server: {
    port: 3000,
  },

  preview: {
    port:3000,
  },
});
