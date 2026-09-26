import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import ErrorScreen from './ErrorScreen';

const meta = {
  title: 'components/ErrorScreen',
  component: ErrorScreen,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  args: {
    onRetry: fn(),
  },
} satisfies Meta<typeof ErrorScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The layout below the tablet breakpoint: no ornaments, and the two actions stacked. */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
