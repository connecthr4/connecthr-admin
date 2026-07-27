import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import Button from '@/src/components/Button';
import AddHolidayModal from './AddHolidayModal';

const meta = {
  title: 'Components/AddHolidayModal',
  component: AddHolidayModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isSubmitting: {
      control: 'boolean',
    },
  },
  args: {
    isOpen: false,
    onclose: fn(),
    onSubmit: fn(),
    isSubmitting: false,
  },
} satisfies Meta<typeof AddHolidayModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Wraps the modal with a trigger button so the open/close behavior
 * can be exercised interactively from the canvas.
 */
function AddHolidayModalWithTrigger(args: React.ComponentProps<typeof AddHolidayModal>) {
  const [open, setOpen] = useState(args.isOpen);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add Holiday</Button>

      <AddHolidayModal
        {...args}
        isOpen={open}
        onclose={() => {
          setOpen(false);
          args.onclose();
        }}
        onSubmit={(data) => {
          setOpen(false);
          args.onSubmit(data);
        }}
      />
    </>
  );
}

export const Default: Story = {
  render: (args) => <AddHolidayModalWithTrigger {...args} />,
};

export const Submitting: Story = {
  render: (args) => <AddHolidayModalWithTrigger {...args} />,
  args: {
    isOpen: true,
    isSubmitting: true,
  },
};
