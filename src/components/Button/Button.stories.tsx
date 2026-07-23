import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ArrowRight, Plus } from 'lucide-react';
import { fn } from 'storybook/test';

import Button from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'text'],
    },
    iconSize: {
      control: { type: 'number', min: 12, max: 32, step: 1 },
    },
    startIcon: { control: false },
    endIcon: { control: false },
  },
  args: {
    children: 'Save changes',
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Cancel',
  },
};

export const Text: Story = {
  args: {
    variant: 'text',
    children: 'View all employees',
  },
};

export const WithIcons: Story = {
  args: {
    children: 'Add employee',
    startIcon: Plus,
    endIcon: ArrowRight,
    iconSize: 18,
  },
};

export const Loading: Story = {
  args: {
    children: 'Saving changes',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Save changes',
    disabled: true,
  },
};
