import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import EmployeeDetailsSkeleton from './EmployeeDetailsSkeleton';
import { PROFILE_ITEMS, STEPS, STRINGS } from '@/src/constants/strings';

describe('EmployeeDetailsSkeleton', () => {
  it('renders the chrome the loaded screen shows, so the layout does not shift', () => {
    render(<EmployeeDetailsSkeleton />);

    expect(screen.getByRole('navigation', { name: 'breadcrumb' })).toHaveTextContent(STRINGS.ALL_EMPLOYEES);

    STEPS.forEach(({ label }) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });

    PROFILE_ITEMS.forEach(({ label }) => {
      expect(screen.queryByText(label)).not.toBeInTheDocument();
    });
  });
});
