import type { Meta, StoryObj } from '@storybook/nextjs-vite';
/**
import { fn } from 'storybook/test';
*/
import EmployeeDetails from './EmployeeDetails';

const meta = {
  title: 'components/EmployeeDetails',
  component: EmployeeDetails,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    /** onClick: fn() **/
  },
} satisfies Meta<typeof EmployeeDetails>;

export default meta;
type Story = StoryObj<typeof meta>;
