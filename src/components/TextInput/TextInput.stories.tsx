import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Mail, Search } from 'lucide-react';
import TextInput from './TextInput';

const meta = {
  title: 'Components/Form/TextInput',
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
    label: 'Email address',
    placeholder: 'you@example.com',
  },
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Required: Story = {
  args: {
    label: 'Full name',
    placeholder: 'Enter your full name',
    required: true,
  },
};

export const Password: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    type: 'password',
  },
};

export const WithIcons: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search employees',
    leftIcon: <Search aria-hidden="true" />,
    rightIcon: <Mail aria-label="Email action" />,
  },
};

export const Error: Story = {
  args: {
    label: 'Work email',
    value: 'invalid-email',
    error: 'Enter a valid email address.',
  },
};
