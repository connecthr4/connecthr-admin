import type { Meta, StoryObj } from '@storybook/nextjs-vite';
/**
import { fn } from 'storybook/test';
*/
import BasePieChart from './BasePieChart';

const meta = {
  title: 'components/BasePieChart',
  component: BasePieChart,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    /** onClick: fn() **/
  },
} satisfies Meta<typeof BasePieChart>;

export default meta;
type Story = StoryObj<typeof meta>;
