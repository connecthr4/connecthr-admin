import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import DocumentUpload from './DocumentUpload';

const meta = {
  title: 'components/DocumentUpload',
  component: DocumentUpload,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    submitLabel: {
      control: 'text',
      description: 'Label rendered on the submit button',
    },
    isSubmitting: {
      control: 'boolean',
      description: 'Locks both actions and the upload fields while the employee is saved',
    },
  },
  args: {
    onSubmit: fn(),
    onBack: fn(),
  },
} satisfies Meta<typeof DocumentUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Submitting: Story = {
  args: {
    isSubmitting: true,
  },
};
