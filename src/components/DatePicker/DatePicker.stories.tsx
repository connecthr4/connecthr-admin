import type { Meta, StoryObj } from '@storybook/nextjs-vite';
/**
import { fn } from 'storybook/test';
*/
import DatePicker from './DatePicker';

const meta = {
  title: 'components/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    /** onClick: fn() **/
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Click the caption ("March 2026") to pick a month, then the year to pick a year. */
export const Default: Story = {
  args: { label: 'Date', value: '2026-03-15' },
};

export const Inline: Story = {
  args: { label: 'Date', value: '2026-03-15', displayMode: 'inline' },
};

/** Months and years outside minDate/maxDate are disabled in the grids. */
export const WithBounds: Story = {
  args: { label: 'Date', value: '2026-03-15', minDate: new Date(2025, 5, 10), maxDate: new Date(2026, 3, 20) },
};

export const Range: Story = {
  args: { label: 'Date range', mode: 'range' },
};
