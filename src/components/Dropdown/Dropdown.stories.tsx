import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import Dropdown from './Dropdown';

const departmentOptions = [
  { label: 'Engineering', value: 'engineering' },
  { label: 'Finance', value: 'finance' },
  { label: 'Human Resources', value: 'human_resources' },
  { label: 'Quality Assurance', value: 'quality_assurance' },
  { label: 'Sales', value: 'sales' },
];

const meta = {
  title: 'components/Dropdown',
  component: Dropdown,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    options: { control: false },
    value: { control: 'text' },
    onChange: { control: false },
  },
  args: {
    label: 'Department',
    placeholder: 'Select Department',
    options: departmentOptions,
    onChange: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Required: Story = {
  args: {
    required: true,
  },
};

export const WithSelectedValue: Story = {
  args: {
    value: 'finance',
  },
};

export const WithError: Story = {
  args: {
    required: true,
    error: 'Department is required',
  },
};

export const Searchable: Story = {
  args: {
    searchable: true,
    placeholder: 'Search Department',
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: 'engineering',
  },
};

export const NoOptions: Story = {
  args: {
    options: [],
    placeholder: 'No departments available',
  },
};
