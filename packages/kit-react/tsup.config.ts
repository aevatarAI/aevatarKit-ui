import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: [
    'react',
    'react-dom',
    '@aevatar/kit-types',
    '@aevatar/kit-protocol',
    '@aevatar/kit-core',
    '@aevatar/kit-a2ui',
  ],
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});

