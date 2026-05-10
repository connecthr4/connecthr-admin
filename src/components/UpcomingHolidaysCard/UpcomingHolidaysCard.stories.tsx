import type { Meta, StoryObj } from '@storybook/nextjs-vite';
/**
import { fn } from 'storybook/test';
*/
import UpcomingHolidaysCard from './UpcomingHolidaysCard';

const meta = {
  title: 'components/UpcomingHolidaysCard',
  component: UpcomingHolidaysCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Sample label for the component',
    },
  },
  args: {
    /** onClick: fn() **/
  },
} satisfies Meta<typeof UpcomingHolidaysCard>;

export default meta;
type Story = StoryObj<typeof meta>;
