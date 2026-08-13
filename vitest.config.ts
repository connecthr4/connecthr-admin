import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

import { playwright } from '@vitest/browser-playwright';

import react from '@vitejs/plugin-react';

import tsconfigPaths from 'vite-tsconfig-paths';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
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
       * Storybook Tests
       */
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            // provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
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
