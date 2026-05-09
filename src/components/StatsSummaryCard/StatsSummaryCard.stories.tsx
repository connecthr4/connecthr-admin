import type { Meta, StoryObj } from '@storybook/nextjs-vite';
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
    label: {
      control: 'text',
      description: 'Sample label for the component',
    },
  },
  args: {
    /** onClick: fn() **/
  },
} satisfies Meta<typeof StatsSummaryCard>;

export default meta;
type Story = StoryObj<typeof meta>;
