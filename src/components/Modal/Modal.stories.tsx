import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import Button from '@/src/components/Button';
import Modal from './Modal';

const meta = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    centered: {
      control: 'boolean',
    },
    closeOnOverlayClick: {
      control: 'boolean',
    },
    showCloseButton: {
      control: 'boolean',
    },
    zIndex: {
      control: { type: 'number', min: 0, max: 2000, step: 100 },
    },
    maxWidth: {
      control: 'text',
    },
  },
  args: {
    isOpen: false,
    onClose: fn(),
    title: 'Delete User',
    children: 'Are you sure you want to delete this user?',
    closeOnOverlayClick: true,
    showCloseButton: true,
    centered: true,
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Wraps the modal with a trigger button so the open/close behavior
 * can be exercised interactively from the canvas.
 */
function ModalWithTrigger(args: React.ComponentProps<typeof Modal>) {
  const [open, setOpen] = useState(args.isOpen);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>

      <Modal
        {...args}
        isOpen={open}
        onClose={() => {
          setOpen(false);
          args.onClose();
        }}
      />
    </>
  );
}

export const Default: Story = {
  render: (args) => <ModalWithTrigger {...args} />,
};

export const WithoutCloseButton: Story = {
  render: (args) => <ModalWithTrigger {...args} />,
  args: {
    showCloseButton: false,
  },
};

export const TopAligned: Story = {
  render: (args) => <ModalWithTrigger {...args} />,
  args: {
    centered: false,
  },
};

export const DisableOverlayClose: Story = {
  render: (args) => <ModalWithTrigger {...args} />,
  args: {
    closeOnOverlayClick: false,
  },
};

export const CustomMaxWidth: Story = {
  render: (args) => <ModalWithTrigger {...args} />,
  args: {
    maxWidth: '20rem',
    children: 'A narrower modal for compact confirmations.',
  },
};
