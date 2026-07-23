import type { Meta, StoryObj } from '@storybook/nextjs-vite';
/**
import { fn } from 'storybook/test';
*/
import HolidaysDashboard from './HolidaysDashboard';

const meta = {
  title: 'components/HolidaysDashboard',
  component: HolidaysDashboard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    /** onClick: fn() **/
  },
} satisfies Meta<typeof HolidaysDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;
