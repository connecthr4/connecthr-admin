import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import UpcomingHolidaysCard from './UpcomingHolidaysCard';
import { ROUTES, STRINGS } from '@/src/constants/strings';

import type { UpcomingHoliday } from '@/src/lib/types/dashboard';

const holidays: UpcomingHoliday[] = [
  { id: '1', day: '15', month: 'Aug', weekday: 'Saturday', title: 'Independence Day' },
  { id: '2', day: '02', month: 'Oct', weekday: 'Friday', title: 'Gandhi Jayanti' },
];

describe('UpcomingHolidaysCard', () => {
  it('renders the heading and a "View all" link to the holidays page', () => {
    render(<UpcomingHolidaysCard holidays={holidays} />);

    expect(screen.getByText(STRINGS.UPCOMING_HOLIDAYS)).toBeInTheDocument();

    const link = screen.getByRole('link', { name: STRINGS.VIEW_ALL });
    expect(link).toHaveAttribute('href', ROUTES.HOLIDAYS);
  });

  it('renders one item per holiday with its date, weekday and title', () => {
    render(<UpcomingHolidaysCard holidays={holidays} />);

    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('Aug')).toBeInTheDocument();
    expect(screen.getByText('Saturday')).toBeInTheDocument();
    expect(screen.getByText('Independence Day')).toBeInTheDocument();

    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText('Oct')).toBeInTheDocument();
    expect(screen.getByText('Friday')).toBeInTheDocument();
    expect(screen.getByText('Gandhi Jayanti')).toBeInTheDocument();
  });

  it('shows the empty state when there are no holidays', () => {
    render(<UpcomingHolidaysCard holidays={[]} />);

    expect(screen.getByText(STRINGS.NO_UPCOMING_HOLIDAYS)).toBeInTheDocument();
  });

  it('defaults to the empty state when the prop is omitted', () => {
    render(<UpcomingHolidaysCard />);

    expect(screen.getByText(STRINGS.NO_UPCOMING_HOLIDAYS)).toBeInTheDocument();
  });

  it('does not show the empty state once there is at least one holiday', () => {
    render(<UpcomingHolidaysCard holidays={holidays} />);

    expect(screen.queryByText(STRINGS.NO_UPCOMING_HOLIDAYS)).not.toBeInTheDocument();
  });
});
