import react from '@vitejs/plugin-react';
import stylex from '@stylexjs/unplugin';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  plugins: [
    stylex.vite({
      externalPackages: ['@are/engine'],
      devMode: 'full',
    }),
    react(),
  ],
  build: {
    outDir: '../dist/lab',
    emptyOutDir: false,
    sourcemap: true,
  },
});
