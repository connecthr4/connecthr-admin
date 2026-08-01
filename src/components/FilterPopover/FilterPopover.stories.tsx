import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import FilterPopover from './FilterPopover';

const meta = {
  title: 'Components/FilterPopover',
  component: FilterPopover,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    filterOptions: [
      {
        id: 'department',
        label: 'Department',
        isMulti: true,
        options: [
          { label: 'Business Analysis', value: 'Business Analysis' },
          { label: 'Design', value: 'Design' },
          { label: 'Development', value: 'Development' },
        ],
      },
      {
        id: 'status',
        label: 'Status',
        isMulti: true,
        options: [
          { label: 'Permanent', value: 'PERMANENT' },
          { label: 'Contract', value: 'CONTRACT' },
          { label: 'Probation', value: 'PROBATION' },
        ],
      },
    ],
    onFilterChange: fn(),
  },
} satisfies Meta<typeof FilterPopover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * The backend decides which fields are filterable, so a module with extra
 * filters renders extra accordion sections with no code change here.
 */
export const AdditionalFields: Story = {
  args: {
    filterOptions: [
      {
        id: 'department',
        label: 'Department',
        isMulti: true,
        options: [
          { label: 'Design', value: 'Design' },
          { label: 'Development', value: 'Development' },
        ],
      },
      {
        id: 'location',
        label: 'Location',
        isMulti: true,
        options: [
          { label: 'Chennai', value: 'CHENNAI' },
          { label: 'Bengaluru', value: 'BENGALURU' },
        ],
      },
    ],
  },
};

/**
 * A group with `isMulti: false` behaves like a radio set — picking an option
 * replaces whatever was selected in that section.
 */
export const SingleSelectGroup: Story = {
  args: {
    filterOptions: [
      {
        id: 'status',
        label: 'Status',
        isMulti: false,
        options: [
          { label: 'Permanent', value: 'PERMANENT' },
          { label: 'Contract', value: 'CONTRACT' },
          { label: 'Probation', value: 'PROBATION' },
        ],
      },
    ],
  },
};

/**
 * Nothing to filter by — the panel renders with just its footer actions.
 */
export const NoFilters: Story = {
  args: {
    filterOptions: [],
  },
};
