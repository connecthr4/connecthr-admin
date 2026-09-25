import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import Button from '@/src/components/Button';
import { STRINGS } from '@/src/constants/strings';
import SeparationDecisionModal from './SeparationDecisionModal';

import type { PendingSeparationDecision, SeparationDecisionOutcome } from './SeparationDecisionModal';
import type { SeparationListItem } from '@/src/lib/types/separation';

const separation: SeparationListItem = {
  id: 'sep-1',
  employee: {
    id: 'emp-1',
    employeeId: 'EMP1042',
    name: 'Priya Sharma',
    avatar: 'https://i.pravatar.cc/150?img=1',
    department: 'Engineering',
    designation: 'Senior Engineer',
  },
  status: 'PENDING',
  statusLabel: 'Pending Approval',
  separationType: 'RESIGNATION',
  separationTypeLabel: 'Resignation',
  resignationDate: '2026-09-20',
  lastWorkingDate: '2026-10-20',
  noticePeriodDays: 30,
  raisedAt: '2026-09-20T09:30:00.000Z',
  decidedAt: null,
  permissions: { canDecide: true, canWithdraw: false },
};

const meta = {
  title: 'Components/SeparationDecisionModal',
  component: SeparationDecisionModal,
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
    decision: null,
    onClose: fn(),
    onConfirm: fn(),
    isSubmitting: false,
  },
} satisfies Meta<typeof SeparationDecisionModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Wraps the modal in the pair of buttons the drawer's footer offers, so both outcomes can be
 * opened and dismissed from the canvas.
 */
function SeparationDecisionModalWithTrigger(args: React.ComponentProps<typeof SeparationDecisionModal>) {
  const [decision, setDecision] = useState<PendingSeparationDecision | null>(args.decision);

  const open = (outcome: SeparationDecisionOutcome) => setDecision({ separation, outcome });

  return (
    <div style={{ display: 'flex', gap: '0.75rem' }}>
      <Button onClick={() => open('REJECTED')}>{STRINGS.REJECT}</Button>

      <Button onClick={() => open('APPROVED')}>{STRINGS.APPROVE}</Button>

      <SeparationDecisionModal
        {...args}
        decision={decision}
        onClose={() => {
          setDecision(null);
          args.onClose();
        }}
        onConfirm={(remarks) => {
          setDecision(null);
          args.onConfirm(remarks);
        }}
      />
    </div>
  );
}

/**
 * Closed. Either button opens it on the outcome it names, which is the whole of the
 * component's state — there is no open modal without a decision behind it.
 */
export const Default: Story = {
  render: (args) => <SeparationDecisionModalWithTrigger {...args} />,
};

/**
 * Green, and worded around the exit going ahead — the colour the row's badge takes once the
 * decision lands.
 */
export const Approve: Story = {
  render: (args) => <SeparationDecisionModalWithTrigger {...args} />,
  args: {
    decision: { separation, outcome: 'APPROVED' },
  },
};

/**
 * The same panel in red, and the one place the two outcomes genuinely differ: the reject
 * endpoint requires `remarks`, so this one carries a field for them and will not confirm
 * without it. The error appears on the first attempt, not before — a required field that
 * reads as wrong on open is telling the approver off for having just got there.
 */
export const Reject: Story = {
  render: (args) => <SeparationDecisionModalWithTrigger {...args} />,
  args: {
    decision: { separation, outcome: 'REJECTED' },
  },
};

/**
 * Nothing is clickable and no dismiss path works while the decision is being recorded — it
 * cannot be taken back, so a second click must not land.
 */
export const Submitting: Story = {
  render: (args) => <SeparationDecisionModalWithTrigger {...args} />,
  args: {
    decision: { separation, outcome: 'APPROVED' },
    isSubmitting: true,
  },
};
