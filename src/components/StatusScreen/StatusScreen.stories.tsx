import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ChevronLeft, LayoutGrid, RefreshCw, RotateCw } from 'lucide-react';
import { fn } from 'storybook/test';
import StatusScreen from './StatusScreen';

const meta = {
  title: 'components/StatusScreen',
  component: StatusScreen,
  parameters: {
    /*
    The screen fills whatever it is given, so it is shown at full size rather than centred in
    a box — the ornaments are placed against its edges and only read correctly that way.
    */
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    code: {
      control: 'text',
      description: 'Shown above the heading; steps the heading down a size when present',
    },
    description: {
      control: 'object',
      description: 'One string, or one per paragraph',
    },
  },
  args: {
    illustration: { src: '/not-found-illustration.svg', width: 348, height: 266 },
    title: 'This page took an unplanned exit',
    description: "The page you're looking for doesn't exist, was moved, or the link is broken.",
    actions: [
      { label: 'Go Back', icon: ChevronLeft, onClick: fn() },
      { label: 'Back to Dashboard', icon: LayoutGrid, onClick: fn(), variant: 'primary' },
    ],
  },
} satisfies Meta<typeof StatusScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

/** How the 404 uses it: a code carries the screen, so the heading sits a size below. */
export const WithCode: Story = {
  args: {
    code: '404',
    description: [
      "The page you're looking for doesn't exist, was moved, or the link is broken.",
      'Double-check the URL, or head back to somewhere familiar.',
    ],
    note: 'Error code: 404 · If this keeps happening, contact your HR administrator',
  },
};

/** How the error boundary uses it: no code, so the heading is the screen's mark. */
export const WithoutCode: Story = {
  args: {
    illustration: { src: '/error-illustration.svg', width: 209, height: 198 },
    title: 'Something went wrong',
    description:
      'An unexpected error stopped this page from loading. Nothing you did caused this, and no data has been lost — please try again.',
    actions: [
      { label: 'Reload Page', icon: RefreshCw, onClick: fn() },
      { label: 'Try Again', icon: RotateCw, onClick: fn(), variant: 'primary' },
    ],
  },
};
