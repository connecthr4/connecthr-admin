import type { Meta, StoryObj } from '@storybook/nextjs-vite';
/**
import { fn } from 'storybook/test';
*/
import EmployeesDashboard from './EmployeesDashboard'

const meta = {
  title: 'components/EmployeesDashboard',
  component: EmployeesDashboard,
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
} satisfies Meta<typeof EmployeesDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;