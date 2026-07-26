import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Calendar, Search, X } from 'lucide-react';
import TextInput from './TextInput';

const meta = {
  title: 'components/TextInput',
  component: TextInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '24rem' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    label: 'Email Address',
    placeholder: 'Enter email address',
  },
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Required: Story = {
  args: {
    label: 'Holiday Name',
    placeholder: 'Enter Holiday Name',
    required: true,
  },
};

export const Password: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter password',
    type: 'password',
  },
};

export const WithLeftIcon: Story = {
  args: {
    label: undefined,
    placeholder: 'Search',
    leftIcon: <Search height={24} width={24} />,
    rightIcon: <X height={24} width={24} onClick={() => {}} />,
  },
};

export const WithRightIcon: Story = {
  args: {
    label: 'Select Date',
    placeholder: 'Select date',
    readOnly: true,
    rightIcon: <Calendar size={24} />,
  },
};

export const Error: Story = {
  args: {
    label: 'Email Address',
    defaultValue: 'invalid-email',
    error: 'Please enter a valid email address',
  },
};
