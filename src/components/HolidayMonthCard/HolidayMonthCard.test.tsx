import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import HolidayMonthCard from './HolidayMonthCard';
import { STRINGS } from '@/src/constants/strings';

const holidays = [
  { id: '1', name: 'Republic Day', date: 'Jan 26', day: 'Monday' },
  { id: '2', name: 'Independence Day', date: 'Aug 15', day: 'Saturday' },
];

describe('HolidayMonthCard', () => {
  it('renders the month name and holiday count', () => {
    render(<HolidayMonthCard month="January" holidays={holidays} onDelete={vi.fn()} />);

    expect(screen.getByText('January')).toBeInTheDocument();
    expect(screen.getByText(`2 ${STRINGS.HOLIDAYS}`, { selector: 'p' })).toBeInTheDocument();
  });

  it('renders each holiday with its name, day, and date', () => {
    render(<HolidayMonthCard month="January" holidays={holidays} onDelete={vi.fn()} />);

    expect(screen.getByText('Republic Day')).toBeInTheDocument();
    expect(screen.getByText('Monday')).toBeInTheDocument();
    expect(screen.getByText('Jan 26')).toBeInTheDocument();
    expect(screen.getByText('Independence Day')).toBeInTheDocument();
    expect(screen.getByText('Saturday')).toBeInTheDocument();
    expect(screen.getByText('Aug 15')).toBeInTheDocument();
  });

  it('renders an empty state when there are no holidays', () => {
    render(<HolidayMonthCard month="February" holidays={[]} onDelete={vi.fn()} />);

    expect(screen.getByText(STRINGS.NO_HOLIDAYS_ADDED)).toBeInTheDocument();
    expect(screen.getByText(`0 ${STRINGS.HOLIDAYS}`, { selector: 'p' })).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onDelete with the holiday id when its delete button is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<HolidayMonthCard month="January" holidays={holidays} onDelete={onDelete} />);

    const [firstDeleteButton] = screen.getAllByRole('button');
    await user.click(firstDeleteButton);

    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('shows a spinner on the holiday being deleted and disables every delete button', () => {
    const { container } = render(
      <HolidayMonthCard month="January" holidays={holidays} onDelete={vi.fn()} deletingId="2" />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    buttons.forEach((button) => expect(button).toBeDisabled());

    expect(container.querySelectorAll('.lucide-loader-circle')).toHaveLength(1);
    expect(container.querySelectorAll('.lucide-trash-2')).toHaveLength(1);
  });

  it('leaves delete buttons enabled when nothing is being deleted', () => {
    render(<HolidayMonthCard month="January" holidays={holidays} onDelete={vi.fn()} deletingId={null} />);

    screen.getAllByRole('button').forEach((button) => expect(button).not.toBeDisabled());
  });
});
