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

  it('surfaces an error message and required mark through the field', () => {
    render(<DatePicker label="Date" required error="Date is required" />);

    expect(screen.getByText('Date is required')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});
