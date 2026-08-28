import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import SuccessBadge from './SuccessBadge';

const meta = {
  title: 'components/SuccessBadge',
  component: SuccessBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'number',
      description: 'Diameter of the disc, in pixels',
    },
  },
  args: {},
} satisfies Meta<typeof SuccessBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = {
  args: {
    size: 32,
  },
};
