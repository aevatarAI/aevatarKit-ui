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
  ],
  noExternal: [
    '@aevatar/kit-types',
    '@aevatar/kit-protocol',
    '@aevatar/kit-core',
    '@aevatar/kit-react',
    '@aevatar/kit-a2ui',
  ],
});

