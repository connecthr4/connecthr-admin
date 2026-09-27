import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import DatePicker from './DatePicker';
import styles from './DatePicker.module.scss';

const getField = () => screen.getByPlaceholderText('Select date') as HTMLInputElement;

/** The day cell's button for `day` in the month on screen. */
const getDayButton = (day: number) =>
  screen.getAllByRole('button').find((button) => button.textContent?.trim() === String(day) && button.closest('td'))!;

describe('DatePicker', () => {
  it('renders a read-only field with the label and calendar icon', () => {
    const { container } = render(<DatePicker label="Date" />);

    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(getField()).toHaveAttribute('readonly');
    expect(container.querySelector(`.${styles.calendarIcon}`)).toBeInTheDocument();
  });

  it('starts closed with an empty field', () => {
    render(<DatePicker />);

    expect(getField()).toHaveValue('');
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('shows an ISO string value in its long form', () => {
    render(<DatePicker value="2026-03-15" />);

    expect(getField()).toHaveValue('15 Mar 2026');
  });

  it('shows a Date value in its long form', () => {
    render(<DatePicker value={new Date(2026, 2, 15)} />);

    expect(getField()).toHaveValue('15 Mar 2026');
  });

  it('shows a date range as "from - to"', () => {
    render(<DatePicker mode="range" value={{ from: new Date(2026, 2, 1), to: new Date(2026, 2, 7) }} />);

    expect(getField()).toHaveValue('01 Mar 2026 - 07 Mar 2026');
  });

  it('shows multiple dates as a comma-separated list', () => {
    render(<DatePicker mode="multiple" value={[new Date(2026, 2, 1), new Date(2026, 2, 7)]} />);

    expect(getField()).toHaveValue('01 Mar 2026, 07 Mar 2026');
  });

  it('falls back to initialSelectedDate when no value is given', () => {
    render(<DatePicker initialSelectedDate={new Date(2026, 0, 5)} />);

    expect(getField()).toHaveValue('05 Jan 2026');
  });

  it('opens the calendar when the field is clicked and closes it on a second click', async () => {
    const user = userEvent.setup();
    render(<DatePicker value="2026-03-15" />);

    await user.click(getField());
    expect(screen.getByRole('grid')).toBeInTheDocument();

    await user.click(getField());
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('opens on the month of the current value', async () => {
    const user = userEvent.setup();
    render(<DatePicker value="2026-03-15" />);

    await user.click(getField());

    expect(screen.getByRole('grid')).toHaveAccessibleName(/March 2026/);
  });

  it('reports a picked day as "YYYY-MM-DD" and closes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker value="2026-03-15" onChange={onChange} />);

    await user.click(getField());
    await user.click(getDayButton(10));

    expect(onChange).toHaveBeenCalledWith('2026-03-10');
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('renders the calendar inline rather than in a modal when displayMode is inline', async () => {
    const user = userEvent.setup();
    const { container } = render(<DatePicker displayMode="inline" value="2026-03-15" />);

    await user.click(getField());

    expect(container.querySelector(`.${styles.inlineContainer}`)).toBeInTheDocument();
    expect(container.querySelector(`.${styles.modalOverlay}`)).not.toBeInTheDocument();
  });

  it('closes the modal when the overlay is clicked but not when the calendar itself is', async () => {
    const user = userEvent.setup();
    const { container } = render(<DatePicker value="2026-03-15" />);

    await user.click(getField());
    await user.click(container.querySelector(`.${styles.modalContainer}`) as HTMLElement);
    expect(screen.getByRole('grid')).toBeInTheDocument();

    await user.click(container.querySelector(`.${styles.modalOverlay}`) as HTMLElement);
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('disables days after maxDate', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker value="2026-03-15" maxDate={new Date(2026, 2, 15)} onChange={onChange} />);

    await user.click(getField());

    expect(getDayButton(16)).toBeDisabled();
    expect(getDayButton(15)).toBeEnabled();
  });

  it('disables days before minDate', async () => {
    const user = userEvent.setup();
    render(<DatePicker value="2026-03-15" minDate={new Date(2026, 2, 15)} />);

    await user.click(getField());

    expect(getDayButton(14)).toBeDisabled();
    expect(getDayButton(15)).toBeEnabled();
  });

  describe('month and year grids', () => {
    it('opens the month grid from the caption and jumps the calendar to the picked month', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<DatePicker value="2026-03-15" onChange={onChange} />);

      await user.click(getField());
      await user.click(screen.getByRole('button', { name: 'March 2026' }));

      expect(screen.queryByRole('grid')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Mar' })).toHaveAttribute('aria-pressed', 'true');

      await user.click(screen.getByRole('button', { name: 'Aug' }));

      expect(screen.getByRole('grid')).toHaveAccessibleName(/August 2026/);

      await user.click(getDayButton(10));
      expect(onChange).toHaveBeenCalledWith('2026-08-10');
    });

    it('picks a year from the year grid, then a month', async () => {
      const user = userEvent.setup();
      render(<DatePicker value="2026-03-15" />);

      await user.click(getField());
      await user.click(screen.getByRole('button', { name: 'March 2026' }));
      await user.click(screen.getByRole('button', { name: '2026' }));

      // Default bounds are 2024–2035, which fit on one page.
      expect(screen.getByText('2024 – 2035')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Previous years' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Next years' })).toBeDisabled();

      await user.click(screen.getByRole('button', { name: '2030' }));
      await user.click(screen.getByRole('button', { name: 'Jan' }));

      expect(screen.getByRole('grid')).toHaveAccessibleName(/January 2030/);
    });

    it('browses years with the arrows in the month grid without moving the calendar', async () => {
      const user = userEvent.setup();
      render(<DatePicker value="2026-03-15" />);

      await user.click(getField());
      await user.click(screen.getByRole('button', { name: 'March 2026' }));
      await user.click(screen.getByRole('button', { name: 'Next year' }));

      expect(screen.getByRole('button', { name: '2027' })).toBeInTheDocument();
      // Only the month the calendar is on is highlighted, and that is still in 2026.
      expect(screen.getByRole('button', { name: 'Mar' })).toHaveAttribute('aria-pressed', 'false');
    });

    it('disables months and years outside minDate and maxDate', async () => {
      const user = userEvent.setup();
      render(<DatePicker value="2026-03-15" minDate={new Date(2025, 5, 10)} maxDate={new Date(2026, 3, 20)} />);

      await user.click(getField());
      await user.click(screen.getByRole('button', { name: 'March 2026' }));

      expect(screen.getByRole('button', { name: 'Apr' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'May' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Next year' })).toBeDisabled();

      await user.click(screen.getByRole('button', { name: 'Previous year' }));

      expect(screen.getByRole('button', { name: 'May' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Jun' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Previous year' })).toBeDisabled();

      await user.click(screen.getByRole('button', { name: '2025' }));

      // Pages start on the first allowed year.
      expect(screen.getByText('2025 – 2036')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '2026' })).toBeEnabled();
      expect(screen.getByRole('button', { name: '2027' })).toBeDisabled();
    });

    it('reopens on the day calendar after being closed on a grid', async () => {
      const user = userEvent.setup();
      render(<DatePicker value="2026-03-15" />);

      await user.click(getField());
      await user.click(screen.getByRole('button', { name: 'March 2026' }));
      await user.click(getField());
      await user.click(getField());

      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('keeps the caption as plain text when navigation is disabled', async () => {
      const user = userEvent.setup();
      render(<DatePicker value="2026-03-15" disableNavigation />);

      await user.click(getField());

      expect(screen.queryByRole('button', { name: 'March 2026' })).not.toBeInTheDocument();
      expect(screen.getByText('March 2026')).toBeInTheDocument();
    });
  });

  it('surfaces an error message and required mark through the field', () => {
    render(<DatePicker label="Date" required error="Date is required" />);

    expect(screen.getByText('Date is required')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});
