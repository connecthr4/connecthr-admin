import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import HolidaysDashboard from './HolidaysDashboard';
import { HolidaysClient } from '@/src/lib/api/holidaysClient';
import { NOTIFICATION_TYPES, STRINGS } from '@/src/constants/strings';
import type { CreateHolidayRequest, Holiday, HolidayMonthGroup } from '@/src/lib/types/holidays';

vi.mock('@/src/lib/logger', () => ({
  logger: {
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  },
}));

const showNotificationMock = vi.fn();

vi.mock('@/src/providers/NotificationProvider', () => ({
  useNotification: () => ({ showNotification: showNotificationMock }),
}));

vi.mock('@/src/lib/api/holidaysClient', () => ({
  HolidaysClient: {
    createHoliday: vi.fn(),
    getHolidaysList: vi.fn(),
    deleteHoliday: vi.fn(),
  },
}));

vi.mock('../AddHolidayModal', () => ({
  default: ({
    isOpen,
    onclose,
    onSubmit,
    isSubmitting,
  }: {
    isOpen: boolean;
    onclose: () => void;
    onSubmit: (data: CreateHolidayRequest) => void;
    isSubmitting?: boolean;
  }) =>
    isOpen ? (
      <div>
        <span>{isSubmitting ? 'submitting' : 'idle'}</span>
        <button onClick={() => onSubmit({ name: 'Diwali', date: '2026-08-15' })}>mock-submit</button>
        <button onClick={onclose}>mock-close</button>
      </div>
    ) : null,
}));

vi.mock('../HolidayMonthCard', () => ({
  default: ({
    month,
    holidays,
    onDelete,
    deletingId,
  }: {
    month: string;
    holidays: Holiday[];
    onDelete: (id: string) => void;
    deletingId?: string | null;
  }) => (
    <div>
      <span>{month}</span>
      <span>{`deleting:${deletingId ?? 'none'}`}</span>
      {holidays.map((holiday) => (
        <button key={holiday.id} onClick={() => onDelete(holiday.id)}>
          {`delete-${holiday.name}`}
        </button>
      ))}
    </div>
  ),
}));

const initialHolidaysList: HolidayMonthGroup[] = [
  { month: 'January', holidays: [{ id: '1', name: 'Republic Day', date: 'Jan 26', day: 'Monday' }] },
  { month: 'February', holidays: [] },
];

describe('HolidaysDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a card for every month in the initial list', () => {
    render(<HolidaysDashboard initialHolidaysList={initialHolidaysList} />);

    expect(screen.getByText('January')).toBeInTheDocument();
    expect(screen.getByText('February')).toBeInTheDocument();
    expect(screen.getByText('delete-Republic Day')).toBeInTheDocument();
  });

  it('opens the add holiday modal when clicking "Add New Holiday"', async () => {
    const user = userEvent.setup();
    render(<HolidaysDashboard initialHolidaysList={initialHolidaysList} />);

    expect(screen.queryByText('mock-submit')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: STRINGS.ADD_NEW_HOLIDAY }));

    expect(screen.getByText('mock-submit')).toBeInTheDocument();
  });

  it('closes the modal via its onclose callback', async () => {
    const user = userEvent.setup();
    render(<HolidaysDashboard initialHolidaysList={initialHolidaysList} />);

    await user.click(screen.getByRole('button', { name: STRINGS.ADD_NEW_HOLIDAY }));
    await user.click(screen.getByText('mock-close'));

    expect(screen.queryByText('mock-submit')).not.toBeInTheDocument();
  });

  it('creates a holiday, refreshes the list, closes the modal, and shows a success notification', async () => {
    const user = userEvent.setup();
    const updatedList: HolidayMonthGroup[] = [
      { month: 'January', holidays: [{ id: '1', name: 'Republic Day', date: 'Jan 26', day: 'Monday' }] },
      { month: 'February', holidays: [{ id: '2', name: 'Valentine Day', date: 'Feb 14', day: 'Saturday' }] },
    ];
    vi.mocked(HolidaysClient.createHoliday).mockResolvedValue({ success: true, message: 'ok' });
    vi.mocked(HolidaysClient.getHolidaysList).mockResolvedValue({ success: true, message: 'ok', data: updatedList });

    render(<HolidaysDashboard initialHolidaysList={initialHolidaysList} />);
    await user.click(screen.getByRole('button', { name: STRINGS.ADD_NEW_HOLIDAY }));
    await user.click(screen.getByText('mock-submit'));

    expect(HolidaysClient.createHoliday).toHaveBeenCalledWith({ name: 'Diwali', date: '2026-08-15' });
    expect(await screen.findByText('delete-Valentine Day')).toBeInTheDocument();
    expect(screen.queryByText('mock-submit')).not.toBeInTheDocument();
    expect(showNotificationMock).toHaveBeenCalledWith(
      STRINGS.HOLIDAY_CREATED_SUCCESSFULLY,
      '',
      NOTIFICATION_TYPES.SUCCESS,
      5000,
      'top-right',
      false
    );
  });

  it('shows the submitting state on the modal while a create request is in flight', async () => {
    const user = userEvent.setup();
    let resolveCreate!: (value: { success: boolean; message: string }) => void;
    vi.mocked(HolidaysClient.createHoliday).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCreate = resolve;
        })
    );
    vi.mocked(HolidaysClient.getHolidaysList).mockResolvedValue({
      success: true,
      message: 'ok',
      data: initialHolidaysList,
    });

    render(<HolidaysDashboard initialHolidaysList={initialHolidaysList} />);
    await user.click(screen.getByRole('button', { name: STRINGS.ADD_NEW_HOLIDAY }));
    expect(screen.getByText('idle')).toBeInTheDocument();

    await user.click(screen.getByText('mock-submit'));
    expect(await screen.findByText('submitting')).toBeInTheDocument();

    resolveCreate({ success: true, message: 'ok' });
    await waitFor(() => expect(screen.queryByText('mock-submit')).not.toBeInTheDocument());
  });

  it('shows an error notification and keeps the modal open when creating a holiday fails', async () => {
    const user = userEvent.setup();
    const error = new Error('failed') as Error & { details?: unknown };
    error.details = { message: 'Name already exists', success: false };
    vi.mocked(HolidaysClient.createHoliday).mockRejectedValue(error);

    render(<HolidaysDashboard initialHolidaysList={initialHolidaysList} />);
    await user.click(screen.getByRole('button', { name: STRINGS.ADD_NEW_HOLIDAY }));
    await user.click(screen.getByText('mock-submit'));

    await waitFor(() =>
      expect(showNotificationMock).toHaveBeenCalledWith(
        STRINGS.HOLIDAY_CREATION_FAILED,
        'Name already exists',
        NOTIFICATION_TYPES.ERROR,
        5000,
        'top-right',
        false
      )
    );
    expect(screen.getByText('mock-submit')).toBeInTheDocument();
    expect(HolidaysClient.getHolidaysList).not.toHaveBeenCalled();
  });

  it('deletes a holiday, refreshes the list, and shows a success notification', async () => {
    const user = userEvent.setup();
    const updatedList: HolidayMonthGroup[] = [
      { month: 'January', holidays: [] },
      { month: 'February', holidays: [] },
    ];
    vi.mocked(HolidaysClient.deleteHoliday).mockResolvedValue({ success: true, message: 'ok' });
    vi.mocked(HolidaysClient.getHolidaysList).mockResolvedValue({ success: true, message: 'ok', data: updatedList });

    render(<HolidaysDashboard initialHolidaysList={initialHolidaysList} />);
    await user.click(screen.getByText('delete-Republic Day'));

    expect(HolidaysClient.deleteHoliday).toHaveBeenCalledWith({ id: '1' });
    await waitFor(() => expect(screen.queryByText('delete-Republic Day')).not.toBeInTheDocument());
    expect(showNotificationMock).toHaveBeenCalledWith(
      STRINGS.HOLIDAY_DELETED_SUCCESSFULLY,
      '',
      NOTIFICATION_TYPES.SUCCESS,
      5000,
      'top-right',
      false
    );
  });

  it('tracks the deleting id while a delete request is in flight and clears it after', async () => {
    const user = userEvent.setup();
    let resolveDelete!: (value: { success: boolean; message: string }) => void;
    vi.mocked(HolidaysClient.deleteHoliday).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveDelete = resolve;
        })
    );
    vi.mocked(HolidaysClient.getHolidaysList).mockResolvedValue({
      success: true,
      message: 'ok',
      data: initialHolidaysList,
    });

    render(<HolidaysDashboard initialHolidaysList={initialHolidaysList} />);
    expect(screen.getAllByText('deleting:none')).toHaveLength(2);

    await user.click(screen.getByText('delete-Republic Day'));
    expect(await screen.findAllByText('deleting:1')).toHaveLength(2);

    resolveDelete({ success: true, message: 'ok' });
    await waitFor(() => expect(screen.queryByText('deleting:1')).not.toBeInTheDocument());
  });

  it('shows an error notification and resets the deleting id when deletion fails', async () => {
    const user = userEvent.setup();
    const error = new Error('failed') as Error & { details?: unknown };
    error.details = { message: 'Cannot delete', success: false };
    vi.mocked(HolidaysClient.deleteHoliday).mockRejectedValue(error);

    render(<HolidaysDashboard initialHolidaysList={initialHolidaysList} />);
    await user.click(screen.getByText('delete-Republic Day'));

    await waitFor(() =>
      expect(showNotificationMock).toHaveBeenCalledWith(
        STRINGS.HOLIDAY_DELETION_FAILED,
        'Cannot delete',
        NOTIFICATION_TYPES.ERROR,
        5000,
        'top-right',
        false
      )
    );
    expect(HolidaysClient.getHolidaysList).not.toHaveBeenCalled();
    expect(await screen.findAllByText('deleting:none')).toHaveLength(2);
  });
});
