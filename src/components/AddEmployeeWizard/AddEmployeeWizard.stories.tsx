import type { Meta, StoryObj } from '@storybook/nextjs-vite';
/**
import { fn } from 'storybook/test';
*/
import AddEmployeeWizard from './AddEmployeeWizard'

const meta = {
  title: 'components/AddEmployeeWizard',
  component: AddEmployeeWizard,
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
} satisfies Meta<typeof AddEmployeeWizard>;

export default meta;
type Story = StoryObj<typeof meta>;