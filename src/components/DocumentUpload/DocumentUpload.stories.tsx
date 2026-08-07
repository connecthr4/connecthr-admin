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
  argTypes: {},
  args: {
    onSubmit: fn(),
    onBack: fn(),
  },
} satisfies Meta<typeof DocumentUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
