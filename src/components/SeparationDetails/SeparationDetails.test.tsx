import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import SeparationDetails from './SeparationDetails';

import type { SeparationDetail, SeparationListItem } from '@/src/lib/types/separation';

const summary: SeparationListItem = {
  id: 'cmex7z9c00000ab12cd34efgh',
  employee: {
    id: 'cmeq1a2b30000zz98yy76xxww',
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

const detail: SeparationDetail = {
  ...summary,
  employee: { ...summary.employee, employmentStatus: 'ACTIVE' },
  reason: 'Relocating to another city.',
  notes: 'Knowledge transfer to be completed by 10 Oct.',
  raisedBy: { id: 'cmus1111', name: 'Anita Rao', role: 'ADMIN' },
  decision: null,
};

/**
 * The value rendered under a given label, which is what a `dl` lets us look up directly
 * rather than by poking at the DOM around the label.
 */
function valueFor(label: string) {
  return screen.getByText(label).closest('div')?.querySelector('dd');
}

describe('SeparationDetails', () => {
  describe('what the row already carries', () => {
    it('renders the employee and the status before the detail read has landed', () => {
      render(<SeparationDetails summary={summary} detail={null} isLoading />);

      expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
      expect(screen.getByText(/EMP1042/)).toBeInTheDocument();
      expect(screen.getByText('Pending Approval')).toBeInTheDocument();
    });

    it('renders the dates and the type before the detail read has landed', () => {
      render(<SeparationDetails summary={summary} detail={null} isLoading />);

      expect(valueFor('Separation Type')).toHaveTextContent('Resignation');
      expect(valueFor('Resignation Date')).toHaveTextContent('20 Sept 2026');
      expect(valueFor('Last Working Date')).toHaveTextContent('20 Oct 2026');
      expect(valueFor('Notice Period')).toHaveTextContent('30 days');
      expect(valueFor('Raised On')).toHaveTextContent('September 20, 2026');
    });

    it('lists the employee facts, skipping a designation that was never recorded', () => {
      render(
        <SeparationDetails
          summary={{ ...summary, employee: { ...summary.employee, designation: null } }}
          detail={null}
        />
      );

      /* No dangling separator where the designation would have been. */
      expect(screen.getByText('EMP1042 · Engineering')).toBeInTheDocument();
    });

    it('renders the photo when the employee has one', () => {
      render(<SeparationDetails summary={summary} detail={null} />);

      expect(screen.getByAltText('Priya Sharma')).toBeInTheDocument();
      expect(screen.queryByTestId('SeparationAvatarFallbackTest')).not.toBeInTheDocument();
    });

    it('falls back to an icon for an employee with no photo on file', () => {
      render(
        <SeparationDetails summary={{ ...summary, employee: { ...summary.employee, avatar: null } }} detail={null} />
      );

      expect(screen.getByTestId('SeparationAvatarFallbackTest')).toBeInTheDocument();

      /* No <img> at all, so there is no broken-image glyph to render. */
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('falls back to the same icon when a photo URL fails to load', () => {
      render(<SeparationDetails summary={summary} detail={null} />);

      fireEvent.error(screen.getByAltText('Priya Sharma'));

      expect(screen.getByTestId('SeparationAvatarFallbackTest')).toBeInTheDocument();
    });
  });

  describe('what the detail read adds', () => {
    it('shows the reason and the notes once they arrive', () => {
      render(<SeparationDetails summary={summary} detail={detail} />);

      expect(screen.getByText('Relocating to another city.')).toBeInTheDocument();
      expect(screen.getByText('Knowledge transfer to be completed by 10 Oct.')).toBeInTheDocument();
    });

    it('names who raised the separation', () => {
      render(<SeparationDetails summary={summary} detail={detail} />);

      expect(valueFor('Raised By')).toHaveTextContent('Anita Rao');
    });

    it('drops the notes row entirely when none were filed', () => {
      render(<SeparationDetails summary={summary} detail={{ ...detail, notes: null }} />);

      expect(screen.queryByText('Additional Notes')).not.toBeInTheDocument();
      expect(screen.getByText('Reason for Leaving')).toBeInTheDocument();
    });

    it('renders no form controls — the panel is for reading, not editing', () => {
      render(<SeparationDetails summary={summary} detail={detail} />);

      expect(screen.queryAllByRole('textbox')).toHaveLength(0);
      expect(screen.queryAllByRole('button')).toHaveLength(0);
    });
  });

  describe('notice period wording', () => {
    it('uses the singular for a one-day notice period', () => {
      render(<SeparationDetails summary={{ ...summary, noticePeriodDays: 1 }} detail={null} />);

      expect(valueFor('Notice Period')).toHaveTextContent('1 day');
    });

    it('renders an immediate exit as "0 days" rather than as missing', () => {
      render(<SeparationDetails summary={{ ...summary, noticePeriodDays: 0 }} detail={null} />);

      expect(valueFor('Notice Period')).toHaveTextContent('0 days');
    });
  });

  describe('while the detail read is in flight', () => {
    it('shows a placeholder for the reason rather than an empty field', () => {
      const { container } = render(<SeparationDetails summary={summary} detail={null} isLoading />);

      expect(screen.getByText('Reason for Leaving')).toBeInTheDocument();
      expect(container.querySelectorAll('[class*="bone"]').length).toBeGreaterThan(0);
    });

    it('still shows everything the row supplied, so the panel is never blank', () => {
      render(<SeparationDetails summary={summary} detail={null} isLoading />);

      expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
      expect(valueFor('Separation Type')).toHaveTextContent('Resignation');
    });
  });

  describe('when the detail read fails', () => {
    it("shows the backend's message in place of the fields it could not load", () => {
      render(<SeparationDetails summary={summary} detail={null} error="Separation not found." />);

      expect(screen.getByText('Separation not found.')).toBeInTheDocument();
      expect(screen.queryByText('Reason for Leaving')).not.toBeInTheDocument();
    });

    it('keeps what the row supplied on screen', () => {
      render(<SeparationDetails summary={summary} detail={null} error="Separation not found." />);

      expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
      expect(valueFor('Last Working Date')).toHaveTextContent('20 Oct 2026');
    });

    it('offers a retry that calls back', async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();

      render(<SeparationDetails summary={summary} detail={null} error="Network error." onRetry={onRetry} />);

      await user.click(screen.getByRole('button', { name: /Try again/i }));

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('offers no retry when the caller gave nothing to retry with', () => {
      render(<SeparationDetails summary={summary} detail={null} error="Network error." />);

      expect(screen.queryByRole('button', { name: /Try again/i })).not.toBeInTheDocument();
    });
  });

  describe('what the panel deliberately leaves out', () => {
    it('says nothing about the decision, even when the record carries one', () => {
      render(
        <SeparationDetails
          summary={{ ...summary, status: 'APPROVED', statusLabel: 'Approved' }}
          detail={{
            ...detail,
            status: 'APPROVED',
            statusLabel: 'Approved',
            decision: {
              statusLabel: 'Approved',
              decidedBy: { id: 'cmus2222', name: 'Vikram Rao', role: 'ADMIN' },
              decidedAt: '2026-09-22T11:05:00.000Z',
              comment: 'Handover plan accepted.',
            },
          }}
        />
      );

      expect(screen.queryByText('Vikram Rao')).not.toBeInTheDocument();
      expect(screen.queryByText('Handover plan accepted.')).not.toBeInTheDocument();
      expect(screen.queryByText(/Decided/)).not.toBeInTheDocument();

      /* The badge is still the whole of where the separation stands. */
      expect(screen.getByText('Approved')).toBeInTheDocument();
    });

    it("says nothing about the employee's employment status", () => {
      render(<SeparationDetails summary={summary} detail={detail} />);

      expect(screen.queryByText('Employment Status')).not.toBeInTheDocument();
      expect(screen.queryByText('ACTIVE')).not.toBeInTheDocument();
    });
  });
});
