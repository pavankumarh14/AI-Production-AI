import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4173,
    proxy: {
      '/generate': 'http://localhost:4174',
      '/download': 'http://localhost:4174',
    },
  },
});
