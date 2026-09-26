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

    // The supported range, one preset per side of each breakpoint in `_mixins.scss`.
    // Below 768px is out of scope, so the phone presets are left out on purpose.
    viewport: {
      options: {
        tabletPortrait: { name: 'Tablet portrait (768)', styles: { width: '768px', height: '1024px' }, type: 'tablet' },
        tabletLandscape: {
          name: 'Tablet landscape (1024)',
          styles: { width: '1024px', height: '768px' },
          type: 'tablet',
        },
        laptopSmall: {
          name: 'Laptop, Windows 150% (1280)',
          styles: { width: '1280px', height: '720px' },
          type: 'desktop',
        },
        laptop: { name: 'Laptop (1440)', styles: { width: '1440px', height: '900px' }, type: 'desktop' },
        desktop: { name: 'Desktop (1920)', styles: { width: '1920px', height: '1080px' }, type: 'desktop' },
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
