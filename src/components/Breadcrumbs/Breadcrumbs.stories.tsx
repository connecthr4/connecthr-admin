import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Breadcrumbs from './Breadcrumbs';

const meta = {
  title: 'Components/Breadcrumbs',
  component: Breadcrumbs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    items: {
      control: 'object',
      description: 'Ordered breadcrumb items. Only non-final items with an href are links.',
    },
  },
} satisfies Meta<typeof Breadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      { label: 'Dashboard', href: '/' },
      { label: 'Employees', href: '/employees' },
      { label: 'Add new employee' },
    ],
  },
};

export const SingleItem: Story = {
  args: {
    items: [{ label: 'Dashboard' }],
  },
};

export const NonLinkedParent: Story = {
  args: {
    items: [{ label: 'Employees', href: '/employees' }, { label: 'Archived employees' }, { label: 'Employee details' }],
  },
};
