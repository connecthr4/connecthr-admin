import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CirclePlus } from 'lucide-react';
import Button from '../Button';
import TableToolbar from './TableToolbar';

const meta = {
  title: 'components/TableToolbar',
  component: TableToolbar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    searchPlaceholder: 'Search employee...',
  },
} satisfies Meta<typeof TableToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <Button startIcon={CirclePlus}>Add New Employee</Button>,
  },
};
