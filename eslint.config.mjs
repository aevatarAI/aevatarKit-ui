// @ts-check
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/*.js',
      '**/*.mjs',
      '**/*.cjs',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Node.js
        console: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        structuredClone: 'readonly',
        __dirname: 'readonly',
        // Fetch API
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        EventSource: 'readonly',
        AbortController: 'readonly',
        FormData: 'readonly',
        Headers: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        RequestInit: 'readonly',
        // DOM
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLSpanElement: 'readonly',
        HTMLHeadingElement: 'readonly',
        HTMLParagraphElement: 'readonly',
        HTMLAnchorElement: 'readonly',
        HTMLImageElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        HTMLTableElement: 'readonly',
        HTMLUListElement: 'readonly',
        SVGElement: 'readonly',
        FileList: 'readonly',
        ResizeObserver: 'readonly',
        Element: 'readonly',
        Node: 'readonly',
        Event: 'readonly',
        MouseEvent: 'readonly',
        KeyboardEvent: 'readonly',
        CustomEvent: 'readonly',
        // React
        React: 'readonly',
        JSX: 'readonly',
        // Test globals (vitest)
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
        test: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'no-console': 'off',
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-redeclare': 'off',
      '@typescript-eslint/no-redeclare': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'warn',
      'react-hooks/exhaustive-deps': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
