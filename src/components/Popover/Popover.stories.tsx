import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Button from '@/src/components/Button';
import Popover from './Popover';

const meta = {
  title: 'Components/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
    },
    offset: {
      control: { type: 'number', min: 0, max: 32, step: 1 },
    },
  },
  args: {
    trigger: <Button>Open popover</Button>,
    children: <p>Popover content goes here.</p>,
    placement: 'bottom',
    align: 'center',
    offset: 8,
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TopPlacement: Story = {
  args: {
    placement: 'top',
  },
};

export const BottomStart: Story = {
  args: {
    placement: 'bottom',
    align: 'start',
  },
};

export const BottomEnd: Story = {
  args: {
    placement: 'bottom',
    align: 'end',
  },
};
