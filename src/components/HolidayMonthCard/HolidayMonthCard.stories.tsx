import type { Meta, StoryObj } from '@storybook/nextjs-vite';
/**
import { fn } from 'storybook/test';
*/
import HolidayMonthCard from './HolidayMonthCard'

const meta = {
  title: 'components/HolidayMonthCard',
  component: HolidayMonthCard,
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
} satisfies Meta<typeof HolidayMonthCard>;

export default meta;
type Story = StoryObj<typeof meta>;