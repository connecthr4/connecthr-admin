import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import Button from '@/src/components/Button';
import Drawer from './Drawer';

const meta = {
  title: 'Components/Drawer',
  component: Drawer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placement: {
      control: 'inline-radio',
      options: ['right', 'left', 'top', 'bottom'],
    },
    size: {
      control: 'text',
    },
    closeOnOverlayClick: {
      control: 'boolean',
    },
    closeOnEsc: {
      control: 'boolean',
    },
    showCloseButton: {
      control: 'boolean',
    },
    lockScroll: {
      control: 'boolean',
    },
    unmountOnClose: {
      control: 'boolean',
    },
    transitionDuration: {
      control: { type: 'number', min: 0, max: 1000, step: 50 },
    },
  },
  args: {
    isOpen: false,
    onClose: fn(),
    title: 'Filter employees',
    children: 'Drawer content',
    placement: 'right',
    size: '26rem',
    closeOnOverlayClick: true,
    closeOnEsc: true,
    showCloseButton: true,
    lockScroll: true,
    unmountOnClose: true,
    transitionDuration: 300,
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Wraps the drawer with a trigger button so the open/close behavior, the slide animation
 * and the focus restoration can be exercised interactively from the canvas.
 */
function DrawerWithTrigger(args: React.ComponentProps<typeof Drawer>) {
  const [open, setOpen] = useState(args.isOpen);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Drawer</Button>

      <Drawer
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
  render: (args) => <DrawerWithTrigger {...args} />,
};

export const LeftPlacement: Story = {
  render: (args) => <DrawerWithTrigger {...args} />,
  args: {
    placement: 'left',
    title: 'Navigation',
  },
};

export const BottomSheet: Story = {
  render: (args) => <DrawerWithTrigger {...args} />,
  args: {
    placement: 'bottom',
    size: '20rem',
    title: 'Quick actions',
  },
};

/**
 * The footer sits outside the scroll area, so the actions stay reachable no matter how
 * long the body gets.
 */
export const WithFooter: Story = {
  render: (args) => <DrawerWithTrigger {...args} />,
  args: {
    children: (
      <>
        {Array.from({ length: 20 }, (_, index) => (
          <p key={index}>Scrollable row {index + 1}</p>
        ))}
      </>
    ),
    footer: (
      <>
        <Button variant="secondary">Reset</Button>
        <Button>Apply filters</Button>
      </>
    ),
  },
};

export const WithoutCloseButton: Story = {
  render: (args) => <DrawerWithTrigger {...args} />,
  args: {
    showCloseButton: false,
  },
};

/**
 * Dismissal is disabled entirely, so the drawer can only be closed from its own controls.
 * Useful for a form that must not be abandoned by a stray click.
 */
export const NonDismissable: Story = {
  render: (args) => <DrawerWithTrigger {...args} />,
  args: {
    closeOnOverlayClick: false,
    closeOnEsc: false,
  },
};

export const WideDrawer: Story = {
  render: (args) => <DrawerWithTrigger {...args} />,
  args: {
    size: '45rem',
    title: 'Employee details',
  },
};
