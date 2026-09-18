import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import InitiateSeparationForm from './InitiateSeparationForm';
import { NOTIFICATION_TYPES, ROUTES, STRINGS } from '@/src/constants/strings';
import { ROLES } from '@/src/lib/auth/roles';

import type { User } from '@/src/lib/types/auth';
import type { SeparationEmployee } from '@/src/lib/types/separation';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('@/src/lib/logger', () => ({
  logger: { trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn(), fatal: vi.fn() },
}));

const showNotificationMock = vi.fn();

vi.mock('@/src/providers/NotificationProvider', () => ({
  useNotification: () => ({ showNotification: showNotificationMock }),
}));

/*
The header chip renders `UserMenu` for real; only its Server Action dependency is stubbed,
since `src/lib/actions/auth` pulls in `server-only` and `next/headers`, neither of which
resolve under jsdom.
*/
vi.mock('@/src/lib/actions/auth', () => ({
  logoutAction: vi.fn(),
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

const employee: SeparationEmployee = {
  id: 'clx-employee-1',
  employeeId: 'EMP0007',
  name: 'Ada Lovelace',
  avatar: '',
  department: 'Engineering',
  designation: 'Senior Engineer',
  dateOfJoining: '2021-04-12',
};

const currentUser: User = {
  id: 'clx-current',
  name: 'Jane Doe',
  email: 'jane@example.com',
  role: ROLES.ADMIN,
  status: 'ACTIVE',
  mustChangePassword: false,
};

const letter = new File(['resignation'], 'resignation-letter.pdf', { type: 'application/pdf' });

/**
 * Fills every field the form requires, leaving the optional notes empty. Individual tests
 * override what they are about after calling this.
 */
async function fillTheForm(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: STRINGS.SELECT_SEPARATION_TYPE }));
  await user.click(screen.getByRole('button', { name: 'Resignation' }));

  await user.type(screen.getByLabelText(STRINGS.RESIGNATION_DATE), '2026-09-01');
  await user.type(screen.getByPlaceholderText(STRINGS.NOTICE_PERIOD_PLACEHOLDER), '30');
  await user.type(screen.getByLabelText(STRINGS.LAST_WORKING_DATE), '2026-09-30');
  await user.type(screen.getByLabelText(new RegExp(STRINGS.REASON_FOR_LEAVING, 'i')), 'Relocating abroad');
  await user.upload(screen.getByLabelText(STRINGS.UPLOAD_RESIGNATION_LETTER), letter);
}

describe('InitiateSeparationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('names the employee the separation is being filed against', () => {
    render(<InitiateSeparationForm employee={employee} currentUser={currentUser} />);

    // Once in the breadcrumb trail, and once on the summary card above the form.
    expect(screen.getByRole('link', { name: employee.name })).toHaveAttribute(
      'href',
      `${ROUTES.EMPLOYEES}/${employee.id}`
    );
    expect(screen.getAllByText(employee.name)).toHaveLength(2);

    expect(screen.getByText(/EMP0007/)).toBeInTheDocument();
    expect(screen.getByText(/Senior Engineer/)).toBeInTheDocument();
    expect(screen.getByText(/Engineering/)).toBeInTheDocument();

    // The stored "2021-04-12" read back the way the rest of the app shows a date.
    expect(screen.getByText(/12 Apr 2021/)).toBeInTheDocument();
  });

  it('asks for an employee when the screen is opened without one', async () => {
    const user = userEvent.setup();

    render(<InitiateSeparationForm employee={null} currentUser={currentUser} />);

    expect(screen.getByText(STRINGS.NO_EMPLOYEE_CHOSEN)).toBeInTheDocument();
    expect(screen.queryByText(STRINGS.SEPARATION_DETAILS)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: STRINGS.ALL_EMPLOYEES }));

    expect(pushMock).toHaveBeenCalledWith(ROUTES.EMPLOYEES);
  });

  it('refuses an empty form, naming every field it needs', async () => {
    const user = userEvent.setup();

    render(<InitiateSeparationForm employee={employee} currentUser={currentUser} />);

    await user.click(screen.getByRole('button', { name: STRINGS.INITIATE_SEPARATION }));

    await waitFor(() => {
      expect(screen.getByText('Separation Type is required')).toBeInTheDocument();
    });

    expect(screen.getByText('Resignation Date is required')).toBeInTheDocument();
    expect(screen.getByText('Notice Period is required')).toBeInTheDocument();
    expect(screen.getByText('Last Working Date is required')).toBeInTheDocument();
    expect(screen.getByText('Reason for Leaving is required')).toBeInTheDocument();
    expect(screen.getByText('Resignation Letter is required')).toBeInTheDocument();
    expect(showNotificationMock).not.toHaveBeenCalled();
  });

  it('refuses a notice period that is not a whole number of days', async () => {
    const user = userEvent.setup();

    render(<InitiateSeparationForm employee={employee} currentUser={currentUser} />);

    await user.type(screen.getByPlaceholderText(STRINGS.NOTICE_PERIOD_PLACEHOLDER), '1.5');

    await waitFor(() => {
      expect(screen.getByText('Notice Period must be a whole number of days')).toBeInTheDocument();
    });
  });

  it('refuses a last working date that falls before the resignation date', async () => {
    const user = userEvent.setup();

    render(<InitiateSeparationForm employee={employee} currentUser={currentUser} />);

    await fillTheForm(user);
    await user.clear(screen.getByLabelText(STRINGS.LAST_WORKING_DATE));
    await user.type(screen.getByLabelText(STRINGS.LAST_WORKING_DATE), '2026-08-01');

    await user.click(screen.getByRole('button', { name: STRINGS.INITIATE_SEPARATION }));

    await waitFor(() => {
      expect(screen.getByText('Last Working Date cannot be before the Resignation Date')).toBeInTheDocument();
    });

    expect(showNotificationMock).not.toHaveBeenCalled();
  });

  /*
  Until the separation endpoint exists, a complete form is answered with a notice saying so
  rather than a success the user did not get.
  */
  it('tells the user nothing was saved once the form is complete', async () => {
    const user = userEvent.setup();

    render(<InitiateSeparationForm employee={employee} currentUser={currentUser} />);

    await fillTheForm(user);
    await user.click(screen.getByRole('button', { name: STRINGS.INITIATE_SEPARATION }));

    await waitFor(() => {
      expect(showNotificationMock).toHaveBeenCalledWith(
        STRINGS.SEPARATION_SAVE_UNAVAILABLE,
        STRINGS.SEPARATION_SAVE_UNAVAILABLE_MESSAGE,
        NOTIFICATION_TYPES.WARNING,
        5000,
        'top-right',
        false
      );
    });
  });

  it('leaves the screen for the employee list on cancel', async () => {
    const user = userEvent.setup();

    render(<InitiateSeparationForm employee={employee} currentUser={currentUser} />);

    await user.click(screen.getByRole('button', { name: STRINGS.CANCEL }));

    expect(pushMock).toHaveBeenCalledWith(ROUTES.EMPLOYEES);
  });
});
