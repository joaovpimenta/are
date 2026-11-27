import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'engine/**/*.test.ts',
      'engine/**/*.test.tsx',
      'lab/**/*.test.ts',
      'lab/**/*.test.tsx',
      'scripts/**/*.test.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
      exclude: [
        '**/*.test.*',
        '**/*.spec.*',
        '**/*.d.ts',
        'tests/**',
        'dist/**',
        'coverage/**',
        'playwright-report/**',
        'test-results/**',
        'scripts/**',
      ],
    },
  },
});
