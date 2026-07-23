import type { Meta, StoryObj } from '@storybook/nextjs-vite';
/**
import { fn } from 'storybook/test';
*/
import EmployeeWizard from './EmployeeWizard';

const meta = {
  title: 'components/EmployeeWizard',
  component: EmployeeWizard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    /** onClick: fn() **/
  },
} satisfies Meta<typeof EmployeeWizard>;

export default meta;
type Story = StoryObj<typeof meta>;
