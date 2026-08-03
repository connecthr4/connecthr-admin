import type { Preview } from '@storybook/nextjs-vite';
import { Lexend } from 'next/font/google';
import { NotificationProvider } from '../src/providers/NotificationProvider';
import '../src/app/globals.css';
import '../src/app/styleguide.css';

const lexend = Lexend({
  variable: '--font-lexend',
  subsets: ['latin'],
});

const preview: Preview = {
  parameters: {
    // This app is App Router only. Without `appDirectory`, the framework mounts the
    // Pages Router context instead, so any component calling a `next/navigation` hook
    // throws while rendering (which fails Chromatic snapshots as "component errors").
    nextjs: {
      appDirectory: true,
    },

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
  decorators: [
    // Components that call `useNotification` throw without a provider above them,
    // so mount it globally rather than per story.
    (Story) => (
      <NotificationProvider>
        <div className={lexend.variable}>
          <Story />
        </div>
      </NotificationProvider>
    ),
  ],
};

export default preview;
