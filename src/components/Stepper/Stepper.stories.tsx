import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CheckCircle, FileText, User } from 'lucide-react';
import { fn } from 'storybook/test';

import Stepper from './Stepper';

const steps = [
  { id: 'details', label: 'Personal details', icon: User },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'review', label: 'Review & submit', icon: CheckCircle },
] as const;

const meta = {
  title: 'Components/Stepper',
  component: Stepper,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    currentStep: {
      control: { type: 'number', min: 0, max: steps.length - 1, step: 1 },
    },
    steps: { control: false },
  },
  args: {
    steps,
    currentStep: 0,
    onStepChange: fn(),
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstStep: Story = {};

export const MiddleStep: Story = {
  args: {
    currentStep: 1,
  },
};

export const LastStep: Story = {
  args: {
    currentStep: 2,
  },
};
