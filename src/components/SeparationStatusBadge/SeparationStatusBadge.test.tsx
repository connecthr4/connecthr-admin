import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import SeparationStatusBadge from './SeparationStatusBadge';

describe('SeparationStatusBadge', () => {
  it("renders the backend's own wording rather than one of its own", () => {
    render(<SeparationStatusBadge status="PENDING" label="Pending Approval" />);

    expect(screen.getByText('Pending Approval')).toBeInTheDocument();
    expect(screen.queryByText('Pending')).not.toBeInTheDocument();
  });

  it('falls back to the raw code when a response omits the label', () => {
    render(<SeparationStatusBadge status="APPROVED" />);

    expect(screen.getByText('APPROVED')).toBeInTheDocument();
  });

  it('gives every status its own class, so they are told apart by more than wording', () => {
    const classNames = (['PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN'] as const).map((status) => {
      const { unmount } = render(<SeparationStatusBadge status={status} label={status} />);
      const className = screen.getByTestId('SeparationStatusBadgeTest').className;

      unmount();

      return className;
    });

    expect(new Set(classNames).size).toBe(classNames.length);
  });

  it('applies a caller-supplied class alongside its own', () => {
    render(<SeparationStatusBadge status="APPROVED" label="Approved" className="custom" />);

    expect(screen.getByTestId('SeparationStatusBadgeTest')).toHaveClass('custom');
  });
});
