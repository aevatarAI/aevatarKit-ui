import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['packages/**/*.test.ts', 'packages/**/*.test.tsx'],
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/examples/**',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/index.ts',
      ],
      include: ['packages/*/src/**/*.ts', 'packages/*/src/**/*.tsx'],
    },
  },
  resolve: {
    alias: {
      '@aevatar/kit': path.resolve(__dirname, 'packages/kit/src'),
      '@aevatar/kit-types': path.resolve(__dirname, 'packages/kit-types/src'),
      '@aevatar/kit-protocol': path.resolve(__dirname, 'packages/kit-protocol/src'),
      '@aevatar/kit-core': path.resolve(__dirname, 'packages/kit-core/src'),
      '@aevatar/kit-a2ui': path.resolve(__dirname, 'packages/kit-a2ui/src'),
      '@aevatar/kit-react': path.resolve(__dirname, 'packages/kit-react/src'),
    },
  },
});

