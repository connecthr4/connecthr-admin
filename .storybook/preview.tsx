import type { Preview } from '@storybook/nextjs-vite';
import { Lexend } from 'next/font/google';
import '../src/app/globals.css';
import '../src/app/styleguide.css';

const lexend = Lexend({
  variable: '--font-lexend',
  subsets: ['latin'],
});

const preview: Preview = {
  parameters: {
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
    (Story) => (
      <div className={lexend.variable}>
        <Story />
      </div>
    ),
  ],
};

export default preview;
