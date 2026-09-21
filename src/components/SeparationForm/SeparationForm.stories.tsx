import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import Button from '@/src/components/Button';
import Drawer from '@/src/components/Drawer';
import SeparationForm from './SeparationForm';
import { STRINGS } from '@/src/constants/strings';

import type { SeparationEmployee } from '@/src/lib/types/separation';

const employee: SeparationEmployee = {
  id: 'clx-employee-1',
  employeeId: 'EMP0007',
  name: 'Ada Lovelace',
  avatar: '',
};

const meta = {
  title: 'components/SeparationForm',
  component: SeparationForm,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    employee,
    onCancel: fn(),
  },
} satisfies Meta<typeof SeparationForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The form on its own, without the drawer around it.
 */
export const Default: Story = {};

/**
 * Where it is actually reached: the drawer the employee list opens from its exit action.
 */
export const InDrawer: Story = {
  render: (args) => {
    const [open, setOpen] = useState(true);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Initiate separation</Button>

        <Drawer isOpen={open} onClose={() => setOpen(false)} title={STRINGS.INITIATE_SEPARATION} size="44rem">
          <SeparationForm {...args} onCancel={() => setOpen(false)} />
        </Drawer>
      </>
    );
  },
};
