import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { STRINGS } from '@/src/constants/strings';
import ExportScopeOptions, { type ExportScope } from './ExportScopeOptions';

const meta = {
  title: 'Components/ExportScopeOptions',
  component: ExportScopeOptions,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'inline-radio',
      options: ['all', 'filtered'],
    },
    disabled: {
      control: 'boolean',
    },
  },
  args: {
    value: 'all',
    onChange: fn(),
    disabled: false,
  },
} satisfies Meta<typeof ExportScopeOptions>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Holds the picked scope locally so the radios can be exercised from the canvas.
 */
function ExportScopeOptionsControlled(args: React.ComponentProps<typeof ExportScopeOptions>) {
  const [scope, setScope] = useState<ExportScope>(args.value);

  return (
    <ExportScopeOptions
      {...args}
      value={scope}
      onChange={(next) => {
        setScope(next);
        args.onChange(next);
      }}
    />
  );
}

export const Default: Story = {
  render: (args) => <ExportScopeOptionsControlled {...args} />,
};

/**
 * Modules name their own records rather than settling for "All records".
 */
export const CustomLabels: Story = {
  render: (args) => <ExportScopeOptionsControlled {...args} />,
  args: {
    allLabel: STRINGS.EXPORT_SCOPE_ALL_EMPLOYEES,
  },
};

export const Disabled: Story = {
  render: (args) => <ExportScopeOptionsControlled {...args} />,
  args: {
    disabled: true,
  },
};
