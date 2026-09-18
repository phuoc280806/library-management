import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite = công cụ chạy dev server (hot reload) và build ra file tĩnh khi deploy
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
