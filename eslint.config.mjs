import js from '@eslint/js';
import tseslint from 'typescript-eslint';

const browserGlobals = {
  console: 'readonly',
  document: 'readonly',
  Element: 'readonly',
  HTMLElement: 'readonly',
  KeyboardEvent: 'readonly',
  matchMedia: 'readonly',
  MouseEvent: 'readonly',
  performance: 'readonly',
  requestAnimationFrame: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  window: 'readonly',
};

export default tseslint.config(
  {
    ignores: ['build/**', 'coverage/**', 'dist/**', 'node_modules/**', 'playwright-report/**', 'test-results/**'],
  },
  {
    files: ['**/*.{js,mjs}'],
    ...js.configs.recommended,
    languageOptions: {
      globals: { console: 'readonly', process: 'readonly' },
    },
  },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['**/*.{ts,tsx}'],
  })),
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: browserGlobals,
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
);
