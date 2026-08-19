import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import Button from '@/src/components/Button';
import { STRINGS } from '@/src/constants/strings';
import ExportConfirmationModal from './ExportConfirmationModal';

const meta = {
  title: 'Components/ExportConfirmationModal',
  component: ExportConfirmationModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isExporting: {
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
    description: STRINGS.EXPORT_HOLIDAYS_CONFIRMATION,
    isExporting: false,
  },
} satisfies Meta<typeof ExportConfirmationModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Wraps the modal with a trigger button so the open/close behavior
 * can be exercised interactively from the canvas.
 */
function ExportConfirmationModalWithTrigger(args: React.ComponentProps<typeof ExportConfirmationModal>) {
  const [open, setOpen] = useState(args.isOpen);

  return (
    <>
      <Button onClick={() => setOpen(true)}>{STRINGS.EXPORT}</Button>

      <ExportConfirmationModal
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
  render: (args) => <ExportConfirmationModalWithTrigger {...args} />,
};

/**
 * Any module can restate the heading and the confirming action in its own
 * wording when the shared defaults do not fit.
 */
export const CustomWording: Story = {
  render: (args) => <ExportConfirmationModalWithTrigger {...args} />,
  args: {
    isOpen: true,
    title: 'Export Employees',
    confirmLabel: STRINGS.EXPORT,
    description: 'The employee list will be downloaded as an Excel file. Do you want to continue?',
  },
};

export const Exporting: Story = {
  render: (args) => <ExportConfirmationModalWithTrigger {...args} />,
  args: {
    isOpen: true,
    isExporting: true,
  },
};
