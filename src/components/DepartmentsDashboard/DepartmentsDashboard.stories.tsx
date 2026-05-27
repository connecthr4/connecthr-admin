import type { Meta, StoryObj } from '@storybook/nextjs-vite';
/**
import { fn } from 'storybook/test';
*/
import DepartmentsDashboard from './DepartmentsDashboard'

const meta = {
  title: 'components/DepartmentsDashboard',
  component: DepartmentsDashboard,
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
} satisfies Meta<typeof DepartmentsDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;