import react from '@vitejs/plugin-react';
import stylex from '@stylexjs/unplugin';
import { defineConfig } from 'vite';

const stylexOptions = {
  externalPackages: ['@are/engine'],
  devMode: 'full',
} as const;

export default defineConfig({
  base: './',
  plugins: [
    stylex.vite(stylexOptions as Parameters<typeof stylex.vite>[0]),
    react(),
  ],
  build: {
    outDir: '../dist/lab',
    emptyOutDir: false,
    sourcemap: true,
  },
});
