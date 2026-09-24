import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import Button from '@/src/components/Button';
import { STRINGS } from '@/src/constants/strings';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const meta = {
  title: 'Components/DeleteConfirmationModal',
  component: DeleteConfirmationModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isDeleting: {
      control: 'boolean',
    },
    description: {
      control: 'text',
    },
    title: {
      control: 'text',
    },
    confirmLabel: {
      control: 'text',
    },
  },
  args: {
    isOpen: false,
    onClose: fn(),
    onConfirm: fn(),
    description: STRINGS.DELETE_USER_CONFIRMATION,
    isDeleting: false,
  },
} satisfies Meta<typeof DeleteConfirmationModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Wraps the modal with a trigger button so the open/close behavior
 * can be exercised interactively from the canvas.
 */
function DeleteConfirmationModalWithTrigger(args: React.ComponentProps<typeof DeleteConfirmationModal>) {
  const [open, setOpen] = useState(args.isOpen);

  return (
    <>
      <Button onClick={() => setOpen(true)}>{STRINGS.DELETE}</Button>

      <DeleteConfirmationModal
        {...args}
        isOpen={open}
        onClose={() => {
          setOpen(false);
          args.onClose();
        }}
        onConfirm={() => {
          setOpen(false);
          args.onConfirm();
        }}
      />
    </>
  );
}

export const Default: Story = {
  render: (args) => <DeleteConfirmationModalWithTrigger {...args} />,
};

/**
 * The users module's wording, with the row named under the warning so the
 * reader confirms against the account rather than against their memory of
 * which bin they clicked.
 */
export const WithNamedRecord: Story = {
  render: (args) => <DeleteConfirmationModalWithTrigger {...args} />,
  args: {
    isOpen: true,
    title: STRINGS.DELETE_USER,
    children: (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 600 }}>Priya Nair</div>
        <div>priya@example.com · Admin</div>
      </div>
    ),
  },
};

/**
 * Nothing is clickable and no dismiss path works while the delete is in
 * flight — there is no undo, so a second click must not land.
 */
export const Deleting: Story = {
  render: (args) => <DeleteConfirmationModalWithTrigger {...args} />,
  args: {
    isOpen: true,
    title: STRINGS.DELETE_USER,
    isDeleting: true,
  },
};
