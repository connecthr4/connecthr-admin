import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

import react from '@vitejs/plugin-react';

import tsconfigPaths from 'vite-tsconfig-paths';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      '@': path.resolve(dirname, '.'),
      // See the stub's own comment for why this alias is needed.
      'server-only': path.resolve(dirname, 'test/serverOnly.stub.ts'),
    },
  },
  test: {
    projects: [
      /**
       * Unit Tests
       */
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.{test,spec}.{ts,tsx}'],
          globals: true,
          environment: 'jsdom',
          setupFiles: './test/setup.ts',
          css: true,
        },
      },
    ],
  },
});
