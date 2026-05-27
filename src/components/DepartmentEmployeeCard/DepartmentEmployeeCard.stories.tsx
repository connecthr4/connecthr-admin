import type { Meta, StoryObj } from '@storybook/nextjs-vite';
/**
import { fn } from 'storybook/test';
*/
import DepartmentEmployeeCard from './DepartmentEmployeeCard'

const meta = {
  title: 'components/DepartmentEmployeeCard',
  component: DepartmentEmployeeCard,
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
} satisfies Meta<typeof DepartmentEmployeeCard>;

export default meta;
type Story = StoryObj<typeof meta>;