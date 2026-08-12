import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import UpcomingHolidaysCard from './UpcomingHolidaysCard';

const meta = {
  title: 'components/UpcomingHolidaysCard',
  component: UpcomingHolidaysCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    holidays: [
      { id: '1', day: '15', month: 'AUG', weekday: 'Saturday', title: 'Independence Day' },
      { id: '2', day: '07', month: 'SEP', weekday: 'Monday', title: 'Janmashtami' },
      { id: '3', day: '02', month: 'OCT', weekday: 'Friday', title: 'Gandhi Jayanti' },
    ],
  },
} satisfies Meta<typeof UpcomingHolidaysCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    holidays: [],
  },
};
