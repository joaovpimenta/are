import react from '@vitejs/plugin-react';
import stylex from '@stylexjs/unplugin';
import { defineConfig } from 'vite';

const catalog = JSON.parse(process.env.ARE_ADVENTURE_CATALOG ?? '[]');

export default defineConfig({
  base: './',
  define: {
    __ARE_ADVENTURES__: JSON.stringify(catalog),
  },
  plugins: [
    stylex.vite({ devMode: 'full' } as Parameters<typeof stylex.vite>[0]),
    react(),
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: false,
    sourcemap: true,
  },
});
