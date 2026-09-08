import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'engine/**/*.test.ts',
      'engine/**/*.test.tsx',
      'lab/**/*.test.ts',
      'lab/**/*.test.tsx',
    ],
    passWithNoTests: true,
  },
});
