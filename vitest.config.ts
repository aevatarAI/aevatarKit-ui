import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['packages/**/*.test.ts', 'packages/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/examples/**'],
    },
  },
  resolve: {
    alias: {
      '@aevatar/kit': './packages/kit/src',
      '@aevatar/kit-types': './packages/kit-types/src',
      '@aevatar/kit-protocol': './packages/kit-protocol/src',
      '@aevatar/kit-core': './packages/kit-core/src',
      '@aevatar/kit-react': './packages/kit-react/src',
    },
  },
});

