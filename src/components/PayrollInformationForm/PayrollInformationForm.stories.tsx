import type { Meta, StoryObj } from '@storybook/nextjs-vite';
/**
import { fn } from 'storybook/test';
*/
import PayrollInformationForm from './PayrollInformationForm'

const meta = {
  title: 'components/PayrollInformationForm',
  component: PayrollInformationForm,
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
} satisfies Meta<typeof PayrollInformationForm>;

export default meta;
type Story = StoryObj<typeof meta>;