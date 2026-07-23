import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import AppLink from './AppLink';

const meta = {
  title: 'Components/AppLink',
  component: AppLink,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    href: {
      control: 'text',
      description: 'Destination URL of the link',
    },
    children: {
      control: 'text',
      description: 'Content rendered inside the link',
    },
    replace: {
      control: 'boolean',
      description: 'Replace the current history entry instead of pushing a new one',
    },
    isExternal: {
      control: 'boolean',
      description: 'Whether the link points to an external resource',
    },
  },
  args: {
    href: '/about',
    children: 'About us',
  },
} satisfies Meta<typeof AppLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Internal: Story = {
  args: {
    href: '/dashboard',
    children: 'Go to dashboard',
  },
};

export const Replace: Story = {
  args: {
    href: '/login',
    children: 'Log in',
    replace: true,
  },
};

export const External: Story = {
  args: {
    href: 'https://example.com',
    children: 'Visit example.com',
    isExternal: true,
  },
};

export const WithCustomClassName: Story = {
  args: {
    href: '/settings',
    children: 'Settings',
    className: 'custom-link',
  },
};
