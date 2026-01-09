import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  // 只发布 ESM 格式 - 现代前端工具链（Vite, Next.js, Remix）都原生支持 ESM
  // CJS 版本会导致 require("react") 与 Vite ESM 模式不兼容
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    '@aevatar/kit-react',
    '@aevatar/kit-a2ui',
  ],
  noExternal: [
    '@aevatar/kit-types',
    '@aevatar/kit-protocol',
    '@aevatar/kit-core',
  ],
});

