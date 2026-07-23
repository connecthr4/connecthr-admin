import type { Meta, StoryObj } from '@storybook/nextjs-vite';
/**
import { fn } from 'storybook/test';
*/
import DepartmentEmployeeCard from './DepartmentEmployeeCard';

const meta = {
  title: 'components/DepartmentEmployeeCard',
  component: DepartmentEmployeeCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    /** onClick: fn() **/
  },
} satisfies Meta<typeof DepartmentEmployeeCard>;

export default meta;
type Story = StoryObj<typeof meta>;
