import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Users, UserPlus, CalendarCheck } from 'lucide-react';
/**
import { fn } from 'storybook/test';
*/
import StatsSummaryCard from './StatsSummaryCard';

const meta = {
  title: 'components/StatsSummaryCard',
  component: StatsSummaryCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Title displayed in the stats card',
    },
    value: {
      control: 'text',
      description: 'Main stats value',
    },
    updatedDate: {
      control: 'text',
      description: 'Last updated date text',
    },
  },
  args: {
    title: 'Total Employee',
    value: 560,
    updatedDate: 'July 16, 2023',
    icon: <Users height={20} width={20} color="#7152F3" />,
  },
} satisfies Meta<typeof StatsSummaryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TotalApplicant: Story = {
  args: {
    title: 'Total Employee',
    value: 1050,
    updatedDate: 'July 14, 2023',
    icon: <Users height={20} width={20} color="#7152F3" />,
  },
};

export const Attendance: Story = {
  args: {
    title: 'Today Attendance',
    value: 470,
    updatedDate: 'July 15, 2023',
    icon: <CalendarCheck height={20} width={20} color="#7152F3" />,
  },
};
