import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import Pagination from './Pagination';

const meta = {
  title: 'components/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    currentPage: 1,
    totalPages: 6,
    onPageChange: fn(),
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MiddlePage: Story = {
  args: {
    currentPage: 4,
    totalPages: 9,
  },
};

export const LastPage: Story = {
  args: {
    currentPage: 6,
    totalPages: 6,
  },
};
