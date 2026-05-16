import type { Meta, StoryObj } from '@storybook/nextjs-vite';
/**
import { fn } from 'storybook/test';
*/
import BasePieChart from './BasePieChart'

const meta = {
  title: 'components/BasePieChart',
  component: BasePieChart,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { 
        control: 'text', 
        description: 'Sample label for the component' 
        },
  },
  args: { 
    /** onClick: fn() **/
    },
} satisfies Meta<typeof BasePieChart>;

export default meta;
type Story = StoryObj<typeof meta>;