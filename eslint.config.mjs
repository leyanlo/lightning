import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier/flat';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  prettier,
  globalIgnores([
    '.next/**',
    '.vercel/**',
    'coverage/**',
    'out/**',
    'public/sw.js',
    'public/swe-worker-*.js',
    'public/workbox-*.js',
  ]),
]);
