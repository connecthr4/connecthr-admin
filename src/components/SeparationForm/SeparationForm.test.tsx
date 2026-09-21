import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import SeparationForm from './SeparationForm';
import { initiateSeparation } from '@/src/lib/actions/separation';
import { SeparationOptionsClient } from '@/src/lib/api/separationClient';
import { NOTIFICATION_TYPES, STRINGS } from '@/src/constants/strings';
import { toSeparationEmployee } from '@/src/lib/types/separation';

import type { Employee } from '@/src/lib/types/employees';
import type { SeparationEmployee } from '@/src/lib/types/separation';

vi.mock('@/src/lib/logger', () => ({
  logger: { trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn(), fatal: vi.fn() },
}));

vi.mock('@/src/lib/actions/separation', () => ({
  initiateSeparation: vi.fn(),
}));

vi.mock('@/src/lib/api/separationClient', () => ({
  SeparationOptionsClient: { getSeparationTypes: vi.fn() },
}));

const showNotificationMock = vi.fn();

vi.mock('@/src/providers/NotificationProvider', () => ({
  useNotification: () => ({ showNotification: showNotificationMock }),
}));

/*
The real date field is a calendar in a modal, which would make every date in these tests a
sequence of clicks on whatever month happens to be showing. The stub keeps the part that
matters — the "YYYY-MM-DD" string the field reports — and lets a test write one directly.
*/
vi.mock('@/src/components/DatePicker', () => ({
  default: ({
    label,
    value,
    error,
    onChange,
  }: {
    label?: string;
    value?: string;
    error?: string;
    onChange?: (value: string) => void;
  }) => (
    <div>
      <label>
        {label}

        <input value={value ?? ''} onChange={(event) => onChange?.(event.target.value)} />
      </label>

      {error && <span>{error}</span>}
    </div>
  ),
}));

/** As `/separations/options` serves them: the backend's codes, not the labels beside them. */
const separationTypes = [
  { label: 'Resignation', value: 'RESIGNATION' },
  { label: 'Termination', value: 'TERMINATION' },
];

const employee: SeparationEmployee = {
  id: 'clx-employee-1',
  employeeId: 'EMP0007',
  name: 'Ada Lovelace',
  avatar: '',
};

/** As the employee list hands them over: a row of the table, narrowed by the mapper. */
const row: Employee = {
  id: 'clx-employee-2',
  employeeId: 'EMP0002',
  name: 'Floyd Miles',
  avatar: '',
  department: 'Design',
  designation: 'Designer',
  type: 'Office',
  status: 'Permanent',
};

/**
 * Fills every field the form requires, leaving the optional notes empty.
 */
async function fillTheForm(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('button', { name: STRINGS.SELECT_SEPARATION_TYPE }));
  await user.click(screen.getByRole('button', { name: 'Resignation' }));

  await user.type(screen.getByLabelText(STRINGS.RESIGNATION_DATE), '2026-09-20');
  await user.type(screen.getByPlaceholderText(STRINGS.NOTICE_PERIOD_PLACEHOLDER), '30');
  await user.type(screen.getByLabelText(STRINGS.LAST_WORKING_DATE), '2026-10-20');
  await user.type(screen.getByLabelText(new RegExp(STRINGS.REASON_FOR_LEAVING, 'i')), 'Relocating to another city.');
}

describe('SeparationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(SeparationOptionsClient.getSeparationTypes).mockResolvedValue(separationTypes);
    vi.mocked(initiateSeparation).mockResolvedValue({ success: true, message: 'Separation initiated successfully.' });
  });

  it('names the employee the separation is being filed against', () => {
    render(<SeparationForm employee={employee} onCancel={vi.fn()} />);

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('EMP0007')).toBeInTheDocument();
  });

  /**
   * The row the drawer was opened from is still on screen behind it, so the panel names the
   * employee and their id and leaves the rest of the row to the row.
   */
  it('introduces an employee taken straight off a table row', () => {
    render(<SeparationForm employee={toSeparationEmployee(row)} onCancel={vi.fn()} />);

    expect(screen.getByText('Floyd Miles')).toBeInTheDocument();
    expect(screen.getByText('EMP0002')).toBeInTheDocument();

    expect(screen.queryByText(/Designer/)).not.toBeInTheDocument();
    expect(screen.queryByText(new RegExp(STRINGS.DATE_OF_JOINING))).not.toBeInTheDocument();
  });

  it('hands cancelling back to whatever opened the form', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(<SeparationForm employee={employee} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: STRINGS.CANCEL }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('refuses an empty form, naming every field it needs', async () => {
    const user = userEvent.setup();

    render(<SeparationForm employee={employee} onCancel={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: STRINGS.INITIATE_SEPARATION }));

    await waitFor(() => {
      expect(screen.getByText(/Separation Type is required/i)).toBeInTheDocument();
    });

    expect(initiateSeparation).not.toHaveBeenCalled();
  });

  /** The list is the backend's, so the form must not be offering codes of its own. */
  it('offers the separation types the backend serves', async () => {
    const user = userEvent.setup();

    render(<SeparationForm employee={employee} onCancel={vi.fn()} />);

    await user.click(await screen.findByRole('button', { name: STRINGS.SELECT_SEPARATION_TYPE }));

    expect(screen.getByRole('button', { name: 'Resignation' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Termination' })).toBeInTheDocument();
  });

  it('files the separation as the endpoint takes it', async () => {
    const user = userEvent.setup();

    render(<SeparationForm employee={employee} onCancel={vi.fn()} />);

    await fillTheForm(user);
    await user.click(screen.getByRole('button', { name: STRINGS.INITIATE_SEPARATION }));

    await waitFor(() => {
      expect(initiateSeparation).toHaveBeenCalledWith({
        // The "EMP0007" code, not the record id the row is keyed on.
        employeeId: 'EMP0007',
        separationType: 'RESIGNATION',
        resignationDate: '2026-09-20',
        noticePeriodDays: 30,
        lastWorkingDate: '2026-10-20',
        reason: 'Relocating to another city.',
      });
    });
  });

  it('sends the optional notes only when they were filled in', async () => {
    const user = userEvent.setup();

    render(<SeparationForm employee={employee} onCancel={vi.fn()} />);

    await fillTheForm(user);
    await user.type(
      screen.getByPlaceholderText(STRINGS.ADDITIONAL_NOTES_PLACEHOLDER),
      'Knowledge transfer to be completed by 10 Oct.'
    );
    await user.click(screen.getByRole('button', { name: STRINGS.INITIATE_SEPARATION }));

    await waitFor(() => {
      expect(initiateSeparation).toHaveBeenCalledWith(
        expect.objectContaining({ notes: 'Knowledge transfer to be completed by 10 Oct.' })
      );
    });
  });

  it("reports the backend's own wording once the separation is recorded", async () => {
    const onSuccess = vi.fn();
    const user = userEvent.setup();

    render(<SeparationForm employee={employee} onCancel={vi.fn()} onSuccess={onSuccess} />);

    await fillTheForm(user);
    await user.click(screen.getByRole('button', { name: STRINGS.INITIATE_SEPARATION }));

    await waitFor(() => {
      expect(showNotificationMock).toHaveBeenCalledWith(
        STRINGS.SEPARATION_INITIATED,
        'Separation initiated successfully.',
        NOTIFICATION_TYPES.SUCCESS,
        5000,
        'top-right',
        false
      );
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  /** A refused separation leaves the form open, so the user can correct what was objected to. */
  it('keeps the form open when the backend refuses the separation', async () => {
    const onSuccess = vi.fn();
    const user = userEvent.setup();

    vi.mocked(initiateSeparation).mockResolvedValue({
      success: false,
      message: 'This employee already has an open separation.',
    });

    render(<SeparationForm employee={employee} onCancel={vi.fn()} onSuccess={onSuccess} />);

    await fillTheForm(user);
    await user.click(screen.getByRole('button', { name: STRINGS.INITIATE_SEPARATION }));

    await waitFor(() => {
      expect(showNotificationMock).toHaveBeenCalledWith(
        STRINGS.SEPARATION_FAILED,
        'This employee already has an open separation.',
        NOTIFICATION_TYPES.ERROR,
        5000,
        'top-right',
        false
      );
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('reports a request that never reached the backend', async () => {
    const user = userEvent.setup();

    vi.mocked(initiateSeparation).mockRejectedValue(new Error('boom'));

    render(<SeparationForm employee={employee} onCancel={vi.fn()} />);

    await fillTheForm(user);
    await user.click(screen.getByRole('button', { name: STRINGS.INITIATE_SEPARATION }));

    await waitFor(() => {
      expect(showNotificationMock).toHaveBeenCalledWith(
        STRINGS.SEPARATION_FAILED,
        '',
        NOTIFICATION_TYPES.ERROR,
        5000,
        'top-right',
        false
      );
    });
  });
});
