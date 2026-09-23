import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import SeparationStatusBadge from './SeparationStatusBadge';

const meta = {
  title: 'components/SeparationStatusBadge',
  component: SeparationStatusBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'radio',
      options: ['PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN'],
    },
  },
  args: {
    status: 'PENDING',
    label: 'Pending Approval',
  },
} satisfies Meta<typeof SeparationStatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A separation still waiting on a decision. The wording is the backend's `statusLabel` —
 * "Pending Approval", not the code.
 */
export const Pending: Story = {};

/**
 * A separation that has been signed off.
 */
export const Approved: Story = {
  args: {
    status: 'APPROVED',
    label: 'Approved',
  },
};

/**
 * A separation that was refused.
 */
export const Rejected: Story = {
  args: {
    status: 'REJECTED',
    label: 'Rejected',
  },
};

/**
 * Taken back rather than decided, so it reads as closed but not as a refusal.
 */
export const Withdrawn: Story = {
  args: {
    status: 'WITHDRAWN',
    label: 'Withdrawn',
  },
};

/**
 * If a response ever omits the label, the code shows through rather than an empty pill.
 */
export const WithoutLabel: Story = {
  args: {
    label: undefined,
  },
};
