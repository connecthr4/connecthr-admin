import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import TextArea from './TextArea';

const meta = {
  title: 'components/TextArea',
  component: TextArea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '32rem' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    rows: {
      control: 'number',
      description: 'Lines of text the field shows before it starts to scroll',
    },
    disabled: {
      control: 'boolean',
    },
  },
  args: {
    label: 'Reason for Leaving',
    placeholder: 'Enter the reason for leaving',
  },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Required: Story = {
  args: {
    required: true,
  },
};

export const WithCharacterLimit: Story = {
  args: {
    label: 'Additional Notes',
    placeholder: 'Anything else the HR team should know',
    maxLength: 1000,
    rows: 6,
  },
};

export const Error: Story = {
  args: {
    defaultValue: 'Left',
    error: 'Reason for Leaving must be at least 10 characters',
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: 'Relocating to another city.',
    disabled: true,
  },
};
