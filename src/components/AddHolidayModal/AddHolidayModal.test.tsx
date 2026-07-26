import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AddHolidayModal from './AddHolidayModal';
import { STRINGS } from '@/src/constants/strings';

vi.mock('../DatePicker', () => ({
  default: ({ label, error, onChange }: { label?: string; error?: string; onChange?: (value: string) => void }) => (
    <div>
      <button type="button" onClick={() => onChange?.('2026-08-15')}>
        {label}
      </button>
      <button type="button" onClick={() => onChange?.('')}>
        {`clear-${label}`}
      </button>
      {error && <span>{error}</span>}
    </div>
  ),
}));

describe('AddHolidayModal', () => {
  const onclose = vi.fn();
  const onSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when closed', () => {
    render(<AddHolidayModal isOpen={false} onclose={onclose} onSubmit={onSubmit} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the form fields and actions when open', () => {
    render(<AddHolidayModal isOpen onclose={onclose} onSubmit={onSubmit} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(STRINGS.ADD_NEW_HOLIDAY)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(STRINGS.HOLIDAY_NAME_PLACEHOLDER)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: STRINGS.SELECT_DATE })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: STRINGS.CANCEL })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: STRINGS.ADD })).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty fields', async () => {
    const user = userEvent.setup();
    render(<AddHolidayModal isOpen onclose={onclose} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: STRINGS.ADD }));

    expect(await screen.findByText(STRINGS.HOLIDAY_NAME_IS_REQUIRED)).toBeInTheDocument();
    expect(screen.getByText(STRINGS.HOLIDAY_DATE_IS_REQUIRED)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('clears the name error once the user starts typing', async () => {
    const user = userEvent.setup();
    render(<AddHolidayModal isOpen onclose={onclose} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: STRINGS.ADD }));
    expect(await screen.findByText(STRINGS.HOLIDAY_NAME_IS_REQUIRED)).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(STRINGS.HOLIDAY_NAME_PLACEHOLDER), 'D');

    expect(screen.queryByText(STRINGS.HOLIDAY_NAME_IS_REQUIRED)).not.toBeInTheDocument();
    expect(screen.getByText(STRINGS.HOLIDAY_DATE_IS_REQUIRED)).toBeInTheDocument();
  });

  it('clears the date error once a date is selected', async () => {
    const user = userEvent.setup();
    render(<AddHolidayModal isOpen onclose={onclose} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: STRINGS.ADD }));
    expect(await screen.findByText(STRINGS.HOLIDAY_DATE_IS_REQUIRED)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: STRINGS.SELECT_DATE }));

    expect(screen.queryByText(STRINGS.HOLIDAY_DATE_IS_REQUIRED)).not.toBeInTheDocument();
    expect(screen.getByText(STRINGS.HOLIDAY_NAME_IS_REQUIRED)).toBeInTheDocument();
  });

  it('submits the entered name and date', async () => {
    const user = userEvent.setup();
    render(<AddHolidayModal isOpen onclose={onclose} onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText(STRINGS.HOLIDAY_NAME_PLACEHOLDER), 'Diwali');
    await user.click(screen.getByRole('button', { name: STRINGS.SELECT_DATE }));
    await user.click(screen.getByRole('button', { name: STRINGS.ADD }));

    expect(onSubmit).toHaveBeenCalledWith({ name: 'Diwali', date: '2026-08-15' });
  });

  it('treats a cleared date selection as unset', async () => {
    const user = userEvent.setup();
    render(<AddHolidayModal isOpen onclose={onclose} onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText(STRINGS.HOLIDAY_NAME_PLACEHOLDER), 'Diwali');
    await user.click(screen.getByRole('button', { name: STRINGS.SELECT_DATE }));
    await user.click(screen.getByRole('button', { name: `clear-${STRINGS.SELECT_DATE}` }));
    await user.click(screen.getByRole('button', { name: STRINGS.ADD }));

    expect(await screen.findByText(STRINGS.HOLIDAY_DATE_IS_REQUIRED)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onclose when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<AddHolidayModal isOpen onclose={onclose} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: STRINGS.CANCEL }));

    expect(onclose).toHaveBeenCalledTimes(1);
  });

  it('disables both actions and shows a loading state on Add while submitting', () => {
    render(<AddHolidayModal isOpen onclose={onclose} onSubmit={onSubmit} isSubmitting />);

    expect(screen.getByRole('button', { name: STRINGS.CANCEL })).toBeDisabled();
    expect(screen.getByRole('button', { name: STRINGS.ADD })).toBeDisabled();
  });

  it('closes on Escape when idle', () => {
    render(<AddHolidayModal isOpen onclose={onclose} onSubmit={onSubmit} />);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onclose).toHaveBeenCalledTimes(1);
  });

  it('ignores Escape while submitting', () => {
    render(<AddHolidayModal isOpen onclose={onclose} onSubmit={onSubmit} isSubmitting />);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onclose).not.toHaveBeenCalled();
  });
});
