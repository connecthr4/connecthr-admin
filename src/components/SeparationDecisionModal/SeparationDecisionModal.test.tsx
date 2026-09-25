import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import SeparationDecisionModal from './SeparationDecisionModal';
import { STRINGS } from '@/src/constants/strings';

import type { SeparationListItem } from '@/src/lib/types/separation';

const separation: SeparationListItem = {
  id: 'sep-1',
  employee: {
    id: 'emp-1',
    employeeId: 'EMP1042',
    name: 'Priya Sharma',
    avatar: null,
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

describe('SeparationDecisionModal', () => {
  const onClose = vi.fn();
  const onConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing without a decision', () => {
    render(<SeparationDecisionModal decision={null} onClose={onClose} onConfirm={onConfirm} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the approve wording and the row being decided', () => {
    render(
      <SeparationDecisionModal decision={{ separation, outcome: 'APPROVED' }} onClose={onClose} onConfirm={onConfirm} />
    );

    expect(screen.getByRole('heading', { name: STRINGS.APPROVE_SEPARATION })).toBeInTheDocument();
    expect(screen.getByText(STRINGS.APPROVE_SEPARATION_CONFIRMATION)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: STRINGS.APPROVE })).toBeInTheDocument();

    /* The drawer is behind the overlay, so the record is restated here to confirm against. */
    expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
    expect(screen.getByText(/EMP1042/)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(STRINGS.LAST_WORKING_DATE))).toBeInTheDocument();
  });

  it('renders the reject wording for the same row', () => {
    render(
      <SeparationDecisionModal decision={{ separation, outcome: 'REJECTED' }} onClose={onClose} onConfirm={onConfirm} />
    );

    expect(screen.getByRole('heading', { name: STRINGS.REJECT_SEPARATION })).toBeInTheDocument();
    expect(screen.getByText(STRINGS.REJECT_SEPARATION_CONFIRMATION)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: STRINGS.REJECT })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: STRINGS.APPROVE })).not.toBeInTheDocument();
  });

  /* Remarks are optional on the approve endpoint, so this panel asks for nothing. */
  it('confirms an approval in a single click, with no remarks', async () => {
    const user = userEvent.setup();

    render(
      <SeparationDecisionModal decision={{ separation, outcome: 'APPROVED' }} onClose={onClose} onConfirm={onConfirm} />
    );

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: STRINGS.APPROVE }));

    expect(onConfirm).toHaveBeenCalledWith('');

    /* It does not close itself, so a failure keeps the context it happened in. */
    expect(onClose).not.toHaveBeenCalled();
  });

  /*
  `PATCH /separations/:id/reject` requires between 1 and 1000 characters of `remarks`, so a
  refusal always says on what grounds.
  */
  it('will not confirm a rejection until a reason has been given', async () => {
    const user = userEvent.setup();

    render(
      <SeparationDecisionModal decision={{ separation, outcome: 'REJECTED' }} onClose={onClose} onConfirm={onConfirm} />
    );

    /* Nothing is wrong yet — the approver has only just opened the panel. */
    expect(screen.queryByText(STRINGS.REJECTION_REMARKS_REQUIRED)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: STRINGS.REJECT }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByText(STRINGS.REJECTION_REMARKS_REQUIRED)).toBeInTheDocument();
  });

  it('treats whitespace as no reason at all', async () => {
    const user = userEvent.setup();

    render(
      <SeparationDecisionModal decision={{ separation, outcome: 'REJECTED' }} onClose={onClose} onConfirm={onConfirm} />
    );

    await user.type(screen.getByRole('textbox'), '   ');
    await user.click(screen.getByRole('button', { name: STRINGS.REJECT }));

    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('passes the reason on, trimmed', async () => {
    const user = userEvent.setup();

    render(
      <SeparationDecisionModal decision={{ separation, outcome: 'REJECTED' }} onClose={onClose} onConfirm={onConfirm} />
    );

    await user.type(screen.getByRole('textbox'), '  Notice period is too short.  ');
    await user.click(screen.getByRole('button', { name: STRINGS.REJECT }));

    expect(onConfirm).toHaveBeenCalledWith('Notice period is too short.');
  });

  /* The endpoint caps `remarks` at 1000, so the field will not take a 1001st character. */
  it('caps the reason at the length the endpoint accepts', () => {
    render(
      <SeparationDecisionModal decision={{ separation, outcome: 'REJECTED' }} onClose={onClose} onConfirm={onConfirm} />
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('maxlength', '1000');
  });

  /*
  The component stays mounted when the decision clears — hooks cannot be skipped — so without
  a reset the next rejection would open on the last one's reason.
  */
  it('forgets the reason when the panel is reopened', async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <SeparationDecisionModal decision={{ separation, outcome: 'REJECTED' }} onClose={onClose} onConfirm={onConfirm} />
    );

    await user.type(screen.getByRole('textbox'), 'Filed in error.');

    rerender(<SeparationDecisionModal decision={null} onClose={onClose} onConfirm={onConfirm} />);
    rerender(
      <SeparationDecisionModal decision={{ separation, outcome: 'REJECTED' }} onClose={onClose} onConfirm={onConfirm} />
    );

    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('calls onClose when cancelled', async () => {
    const user = userEvent.setup();

    render(
      <SeparationDecisionModal decision={{ separation, outcome: 'REJECTED' }} onClose={onClose} onConfirm={onConfirm} />
    );

    await user.click(screen.getByRole('button', { name: STRINGS.CANCEL }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  /*
  A decision cannot be taken back, so a second click on one already in flight must not land —
  nor must any of the ways out, which would leave the approver unsure whether it went through.
  */
  it('disables both actions while the decision is being recorded', async () => {
    const user = userEvent.setup();

    render(
      <SeparationDecisionModal
        decision={{ separation, outcome: 'APPROVED' }}
        onClose={onClose}
        onConfirm={onConfirm}
        isSubmitting
      />
    );

    const cancelButton = screen.getByRole('button', { name: STRINGS.CANCEL });
    const confirmButton = screen.getByRole('button', { name: STRINGS.APPROVE });

    expect(cancelButton).toBeDisabled();
    expect(confirmButton).toBeDisabled();

    await user.click(confirmButton);

    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('locks the reason field too while the rejection is being recorded', () => {
    render(
      <SeparationDecisionModal
        decision={{ separation, outcome: 'REJECTED' }}
        onClose={onClose}
        onConfirm={onConfirm}
        isSubmitting
      />
    );

    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('does not close on escape while the decision is being recorded', async () => {
    const user = userEvent.setup();

    render(
      <SeparationDecisionModal
        decision={{ separation, outcome: 'APPROVED' }}
        onClose={onClose}
        onConfirm={onConfirm}
        isSubmitting
      />
    );

    await user.keyboard('{Escape}');

    expect(onClose).not.toHaveBeenCalled();
  });
});
