import type { Meta, StoryObj } from '@storybook/nextjs-vite';
/**
import { fn } from 'storybook/test';
*/
import Dashboard from './Dashboard'

const meta = {
  title: 'components/Dashboard',
  component: Dashboard,
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
} satisfies Meta<typeof Dashboard>;

export default meta;
type Story = StoryObj<typeof meta>;