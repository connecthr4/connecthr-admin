import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import EmployeeDetails from './EmployeeDetails';
import { getEmployeeSeparation } from '@/src/lib/actions/separation';
import { getEmployeeAttendance } from '@/src/lib/actions/attendance';
import { STRINGS } from '@/src/constants/strings';

import type { EmployeeDetail } from '@/src/lib/types/employees';
import type { SeparationDetail } from '@/src/lib/types/separation';

const pushMock = vi.fn();
const prefetchMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, prefetch: prefetchMock }),
}));

/*
The header chip renders `UserMenu` for real; only its Server Action dependency is stubbed,
since `src/lib/actions/auth` pulls in `server-only` and `next/headers`, neither of which
resolve under jsdom.
*/
vi.mock('@/src/lib/actions/auth', () => ({
  logoutAction: vi.fn(),
}));

vi.mock('@/src/lib/actions/separation', () => ({
  getEmployeeSeparation: vi.fn(),
}));

vi.mock('@/src/lib/actions/attendance', () => ({
  getEmployeeAttendance: vi.fn(),
}));

vi.mock('@/src/lib/logger', () => ({
  logger: { trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn(), fatal: vi.fn() },
}));

const employee = {
  id: 'cmeq1a2b30000zz98yy76xxww',
  employeeId: 'EMP1042',
  avatar: 'https://i.pravatar.cc/150?img=1',
  name: 'Priya Sharma',
  personalInformation: {
    firstName: 'Priya',
    lastName: 'Sharma',
    mobileNumber: '9876543210',
  },
  professionalInformation: {
    department: 'Engineering',
  },
  payrollInformation: {},
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as unknown as EmployeeDetail;

const separation: SeparationDetail = {
  id: 'cmex7z9c00000ab12cd34efgh',
  employee: {
    id: employee.id,
    employeeId: 'EMP1042',
    name: 'Priya Sharma',
    avatar: null,
    department: 'Engineering',
    designation: 'Senior Engineer',
    employmentStatus: 'ON_NOTICE',
  },
  status: 'PENDING',
  statusLabel: 'Pending Approval',
  separationType: 'RESIGNATION',
  separationTypeLabel: 'Resignation',
  resignationDate: '2026-09-20',
  noticePeriodDays: 30,
  lastWorkingDate: '2026-10-20',
  reason: 'Relocating to another city.',
  notes: null,
  raisedBy: { id: 'cmus1111', name: 'Anita Rao', role: 'ADMIN' },
  raisedAt: '2026-09-20T09:30:00.000Z',
  decision: null,
  permissions: { canDecide: true, canWithdraw: false },
};

/** Opens the sidebar's Separation section, which is what triggers the read. */
async function openSeparation(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: STRINGS.SEPARATION }));
}

describe('EmployeeDetails — separation section', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getEmployeeSeparation).mockResolvedValue({ success: true, data: separation });
    /* Stubbed only so the sibling section stays inert — none of these tests open it. */
    vi.mocked(getEmployeeAttendance).mockResolvedValue({
      success: true,
      data: {
        employee: { id: employee.id, employeeCode: 'EMP1042', name: 'Priya Sharma', shiftCode: null, shift: null },
        rows: [],
      },
    });
  });

  it('offers the section in the sidebar for every employee', () => {
    render(<EmployeeDetails employee={employee} />);

    expect(screen.getByRole('button', { name: STRINGS.SEPARATION })).toBeInTheDocument();
  });

  it('reads nothing until the section is opened', () => {
    render(<EmployeeDetails employee={employee} />);

    expect(getEmployeeSeparation).not.toHaveBeenCalled();
  });

  it("asks by the employee's code, which is what the endpoint is keyed on", async () => {
    const user = userEvent.setup();

    render(<EmployeeDetails employee={employee} />);
    await openSeparation(user);

    await waitFor(() => expect(getEmployeeSeparation).toHaveBeenCalledWith('EMP1042'));
  });

  it('shows the filed separation once the read lands', async () => {
    const user = userEvent.setup();

    render(<EmployeeDetails employee={employee} />);
    await openSeparation(user);

    expect(await screen.findByText('Relocating to another city.')).toBeInTheDocument();
    expect(screen.getByText('Pending Approval')).toBeInTheDocument();
    expect(screen.getByText(STRINGS.LAST_WORKING_DATE)).toBeInTheDocument();
  });

  it('reads once however often the section is left and reopened', async () => {
    const user = userEvent.setup();

    render(<EmployeeDetails employee={employee} />);
    await openSeparation(user);
    await screen.findByText('Relocating to another city.');

    await user.click(screen.getByRole('button', { name: STRINGS.PROFILE }));
    await openSeparation(user);

    expect(await screen.findByText('Relocating to another city.')).toBeInTheDocument();
    expect(getEmployeeSeparation).toHaveBeenCalledTimes(1);
  });

  it('says so plainly when the employee has never had one filed', async () => {
    const user = userEvent.setup();
    vi.mocked(getEmployeeSeparation).mockResolvedValue({ success: true, data: null });

    render(<EmployeeDetails employee={employee} />);
    await openSeparation(user);

    expect(await screen.findByText(STRINGS.NO_SEPARATION_FILED)).toBeInTheDocument();

    /* Not a failure, so nothing to retry. */
    expect(screen.queryByRole('button', { name: /Try again/i })).not.toBeInTheDocument();
  });

  it('offers a retry when the read actually failed', async () => {
    const user = userEvent.setup();
    vi.mocked(getEmployeeSeparation).mockResolvedValue({ success: false, message: 'Service unavailable.' });

    render(<EmployeeDetails employee={employee} />);
    await openSeparation(user);

    expect(await screen.findByText('Service unavailable.')).toBeInTheDocument();
    expect(screen.queryByText(STRINGS.NO_SEPARATION_FILED)).not.toBeInTheDocument();

    vi.mocked(getEmployeeSeparation).mockResolvedValue({ success: true, data: separation });
    await user.click(screen.getByRole('button', { name: /Try again/i }));

    expect(await screen.findByText('Relocating to another city.')).toBeInTheDocument();
  });

  it('leaves the profile and attendance sections alone', async () => {
    const user = userEvent.setup();

    render(<EmployeeDetails employee={employee} />);
    await openSeparation(user);
    await screen.findByText('Relocating to another city.');

    /* The stepper belongs to the profile, so it is not drawn over the separation. */
    expect(screen.queryByText('Personal Information')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: STRINGS.PROFILE }));

    expect(screen.getByText('Personal Details')).toBeInTheDocument();
    expect(screen.queryByText('Relocating to another city.')).not.toBeInTheDocument();
  });
});
