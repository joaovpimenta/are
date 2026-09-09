import react from '@vitejs/plugin-react';
import stylex from '@stylexjs/unplugin';
import { defineConfig } from 'vite';

const stylexOptions = {
  externalPackages: ['@are/engine'],
  devMode: 'full',
} as const;

export default defineConfig({
  base: './',
  define: {
    __ARE_INTERACTION_DEBUG__: 'false',
  },
  plugins: [
    stylex.vite(stylexOptions as Parameters<typeof stylex.vite>[0]),
    react(),
  ],
  build: {
    outDir: '../../build/adventures/echo-station',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/engine/src/')) return 'are-engine';
          return undefined;
        },
      },
    },
  },
});
