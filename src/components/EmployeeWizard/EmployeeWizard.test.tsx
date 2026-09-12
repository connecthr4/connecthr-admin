import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import EmployeeWizard from './EmployeeWizard';
import { createEmployee, updateEmployee } from '@/src/lib/actions/employees';
import { fromEmployeeDetail, useEmployeeStore } from '@/src/store/employeeStore';
import { logger } from '@/src/lib/logger';
import { NOTIFICATION_TYPES, ROUTES, STEPS, STRINGS } from '@/src/constants/strings';

import type { CreatedEmployee, EmployeeDetail } from '@/src/lib/types/employees';

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

vi.mock('@/src/lib/actions/employees', () => ({
  createEmployee: vi.fn(),
  updateEmployee: vi.fn(),
}));

/*
The header chip renders `UserMenu` for real; only its Server Action dependency
is stubbed, since `src/lib/actions/auth` pulls in `server-only` and
`next/headers`, neither of which resolve under jsdom.
*/
vi.mock('@/src/lib/actions/auth', () => ({
  logoutAction: vi.fn(),
}));

/**
 * Each form step is stubbed to what the wizard drives it with: it submits a
 * fixed patch, and renders the wizard's footer inside a form context so the
 * real `StepBackButton` can read the step's values when going back.
 */
function stepStub(name: string, values: Record<string, string>) {
  return function StepStub({
    onSubmit,
    footer,
  }: {
    onSubmit: (values: Record<string, string>) => void;
    footer?: React.ReactNode;
  }) {
    const methods = useForm({ defaultValues: values });

    return (
      <FormProvider {...methods}>
        <form
          data-testid={`${name}-form`}
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(values);
          }}
        >
          <span>{`step:${name}`}</span>
          {footer}
        </form>
      </FormProvider>
    );
  };
}

vi.mock('../PersonalInformationForm', () => ({
  default: stepStub('personal', { firstName: 'Jane', lastName: 'Doe' }),
}));

vi.mock('../ProfessionalInformationForm', () => ({
  default: stepStub('professional', { employeeType: 'Full Time', department: 'Design' }),
}));

vi.mock('../PayrollInformationForm', () => ({
  default: stepStub('payroll', { bankName: 'Axis Bank' }),
}));

vi.mock('../DocumentUpload', () => ({
  default: ({
    onSubmit,
    onBack,
    submitLabel,
    isSubmitting,
  }: {
    onSubmit: () => void;
    onBack: () => void;
    submitLabel?: string;
    isSubmitting?: boolean;
  }) => (
    <div>
      <span>step:documents</span>
      <span>{isSubmitting ? 'submitting' : 'idle'}</span>
      <button onClick={onBack}>documents-back</button>
      <button onClick={onSubmit}>{submitLabel}</button>
    </div>
  ),
}));

const employee: EmployeeDetail = {
  id: 'clx-1',
  employeeId: 'EMP1001',
  avatar: 'https://i.pravatar.cc/150?img=1',
  name: 'Katrina Flores',
  personalInformation: {
    firstName: 'Katrina',
    lastName: 'Flores',
    mobileNumber: '9100000000',
    email: 'katrina.flores@example.com',
    dateOfBirth: '1985-06-01',
    gender: 'Other',
    nationality: 'Indian',
    maritalStatus: 'Widowed',
    aadhaarNumber: '200000000000',
    currentAddress: '277 Park Avenue',
    currentCity: 'Bengaluru',
    currentState: 'Karnataka',
    currentDistrictCode: '525',
    currentDistrict: 'Bengaluru Urban',
    currentPinCode: '560001',
    permanentAddress: '57 MG Road',
    permanentCity: 'Gurugram',
    permanentState: 'Haryana',
    permanentDistrictCode: '62',
    permanentDistrict: 'Gurugram',
    permanentPinCode: '122001',
    emergencyContactName: 'Darrell Flores',
    emergencyRelationship: 'Sibling',
    emergencyPhoneNumber: '8100000000',
    emergencyAddress: '114 Brigade Road, Bengaluru',
  },
  professionalInformation: {
    employeeType: 'Full Time',
    employmentStatus: 'On Notice',
    dateOfJoining: '2017-01-11',
    department: 'PM',
    shiftCode: 'GENERAL',
    shift: 'General',
    designation: 'Associate Project Manager',
    workMode: 'Hybrid',
  },
  payrollInformation: {
    accountHolderName: 'Katrina Flores',
    bankName: 'Axis Bank',
    accountNumber: '5000000000000000',
    ifscCode: 'UTIB0133800',
    branchName: 'Bengaluru Branch',
    panNumber: 'ABCDE1000F',
    uanNumber: '100000000000',
    esicNumber: '3000000000',
  },
  createdAt: '2026-08-05T03:37:38.795Z',
  updatedAt: '2026-08-05T03:37:38.795Z',
};

const createdEmployee: CreatedEmployee = {
  id: 'clx-new',
  avatar: 'https://i.pravatar.cc/150?img=2',
  name: 'Jane Doe',
  employeeId: 'EMP2001',
  department: 'Design',
  designation: 'Designer',
  employeeType: 'Full Time',
  employmentStatus: 'Active',
};

const submitStep = async (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: 'Next' }));

/** Walks the three form steps so the document step is on screen. */
async function reachDocuments(user: ReturnType<typeof userEvent.setup>) {
  await submitStep(user);
  await submitStep(user);
  await submitStep(user);
  expect(screen.getByText('step:documents')).toBeInTheDocument();
}

describe('EmployeeWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useEmployeeStore.getState().resetEmployeeData();
  });

  describe('creating', () => {
    it('renders the "Add New Employee" header with its breadcrumb trail', () => {
      render(<EmployeeWizard mode="create" />);

      expect(screen.getByRole('heading', { name: STRINGS.ADD_NEW_EMPLOYEE })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: STRINGS.ALL_EMPLOYEES })).toHaveAttribute('href', ROUTES.EMPLOYEES);
    });

    it('opens on the first step with every step listed and no Back button', () => {
      render(<EmployeeWizard mode="create" />);

      expect(screen.getByText('step:personal')).toBeInTheDocument();
      for (const step of STEPS) {
        expect(screen.getByText(step.label)).toBeInTheDocument();
      }
      expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    });

    it('stores each step’s values and advances through the wizard', async () => {
      const user = userEvent.setup();
      render(<EmployeeWizard mode="create" />);

      await submitStep(user);
      expect(screen.getByText('step:professional')).toBeInTheDocument();
      expect(useEmployeeStore.getState().personalInformation).toMatchObject({ firstName: 'Jane', lastName: 'Doe' });

      await submitStep(user);
      expect(screen.getByText('step:payroll')).toBeInTheDocument();
      expect(useEmployeeStore.getState().professionalInformation).toMatchObject({ department: 'Design' });

      await submitStep(user);
      expect(screen.getByText('step:documents')).toBeInTheDocument();
      expect(useEmployeeStore.getState().payrollInformation).toMatchObject({ bankName: 'Axis Bank' });
      expect(screen.getByRole('button', { name: STRINGS.CREATE_EMPLOYEE })).toBeInTheDocument();
    });

    it('goes back a step, keeping the values typed on the step being left', async () => {
      const user = userEvent.setup();
      render(<EmployeeWizard mode="create" />);

      await submitStep(user);
      expect(screen.getByText('step:professional')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Back' }));

      expect(screen.getByText('step:personal')).toBeInTheDocument();
      /* The Back button read the professional step's current values before leaving it. */
      expect(useEmployeeStore.getState().professionalInformation).toMatchObject({ employeeType: 'Full Time' });
    });

    it('goes back from the document step to payroll', async () => {
      const user = userEvent.setup();
      render(<EmployeeWizard mode="create" />);
      await reachDocuments(user);

      await user.click(screen.getByText('documents-back'));

      expect(screen.getByText('step:payroll')).toBeInTheDocument();
    });

    it('creates the employee from the draft and shows the saved modal', async () => {
      const user = userEvent.setup();
      vi.mocked(createEmployee).mockResolvedValue({
        success: true,
        message: 'Employee created successfully.',
        data: createdEmployee,
      });
      render(<EmployeeWizard mode="create" />);
      await reachDocuments(user);

      await user.click(screen.getByRole('button', { name: STRINGS.CREATE_EMPLOYEE }));

      expect(createEmployee).toHaveBeenCalledWith(
        expect.objectContaining({
          personalInformation: expect.objectContaining({ firstName: 'Jane' }),
          professionalInformation: expect.objectContaining({ department: 'Design' }),
          payrollInformation: expect.objectContaining({ bankName: 'Axis Bank' }),
        })
      );

      const dialog = await screen.findByRole('dialog', { name: 'Employee created successfully.' });
      expect(within(dialog).getByText('Jane Doe')).toBeInTheDocument();
      expect(within(dialog).getByText('EMP2001')).toBeInTheDocument();
      expect(within(dialog).getByText('Design')).toBeInTheDocument();
      expect(within(dialog).getByText('Full Time')).toBeInTheDocument();
      expect(within(dialog).getByText('Active')).toBeInTheDocument();

      /* The modal is the confirmation — no toast on top of it. */
      expect(showNotificationMock).not.toHaveBeenCalled();
    });

    it('clears the draft and returns to the list when the saved modal is dismissed', async () => {
      const user = userEvent.setup();
      vi.mocked(createEmployee).mockResolvedValue({ success: true, message: 'Created', data: createdEmployee });
      render(<EmployeeWizard mode="create" />);
      await reachDocuments(user);
      await user.click(screen.getByRole('button', { name: STRINGS.CREATE_EMPLOYEE }));
      await screen.findByRole('dialog');

      await user.click(screen.getByRole('button', { name: STRINGS.BACK_TO_ALL_EMPLOYEES }));

      expect(pushMock).toHaveBeenCalledWith(ROUTES.EMPLOYEES);
      expect(useEmployeeStore.getState().personalInformation.firstName).toBe('');
    });

    it('holds the submit button while the request is in flight', async () => {
      const user = userEvent.setup();
      let resolveCreate!: (value: Awaited<ReturnType<typeof createEmployee>>) => void;
      vi.mocked(createEmployee).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveCreate = resolve;
          })
      );
      render(<EmployeeWizard mode="create" />);
      await reachDocuments(user);
      expect(screen.getByText('idle')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: STRINGS.CREATE_EMPLOYEE }));
      expect(await screen.findByText('submitting')).toBeInTheDocument();

      resolveCreate({ success: true, message: 'Created', data: createdEmployee });
      expect(await screen.findByText('idle')).toBeInTheDocument();
    });

    it('reports a refused creation with the backend’s wording and stays on the step', async () => {
      const user = userEvent.setup();
      vi.mocked(createEmployee).mockResolvedValue({ success: false, message: 'Email already exists' });
      render(<EmployeeWizard mode="create" />);
      await reachDocuments(user);

      await user.click(screen.getByRole('button', { name: STRINGS.CREATE_EMPLOYEE }));

      await waitFor(() =>
        expect(showNotificationMock).toHaveBeenCalledWith(
          STRINGS.EMPLOYEE_CREATION_FAILED,
          'Email already exists',
          NOTIFICATION_TYPES.ERROR,
          5000,
          'top-right',
          false
        )
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByText('step:documents')).toBeInTheDocument();
    });

    it('logs and reports an unexpected error while creating', async () => {
      const user = userEvent.setup();
      vi.mocked(createEmployee).mockRejectedValue(new Error('boom'));
      render(<EmployeeWizard mode="create" />);
      await reachDocuments(user);

      await user.click(screen.getByRole('button', { name: STRINGS.CREATE_EMPLOYEE }));

      await waitFor(() =>
        expect(showNotificationMock).toHaveBeenCalledWith(
          STRINGS.EMPLOYEE_CREATION_FAILED,
          '',
          NOTIFICATION_TYPES.ERROR,
          5000,
          'top-right',
          false
        )
      );
      expect(logger.error).toHaveBeenCalled();
      expect(await screen.findByText('idle')).toBeInTheDocument();
    });

    it('discards the draft when the wizard unmounts', async () => {
      const user = userEvent.setup();
      const { unmount } = render(<EmployeeWizard mode="create" />);
      await submitStep(user);
      expect(useEmployeeStore.getState().personalInformation.firstName).toBe('Jane');

      unmount();

      expect(useEmployeeStore.getState().personalInformation.firstName).toBe('');
    });
  });

  describe('editing', () => {
    it('renders the "Edit Employee" header with the employee in the breadcrumb trail', () => {
      render(<EmployeeWizard mode="edit" employee={employee} />);

      expect(screen.getByRole('heading', { name: STRINGS.EDIT_EMPLOYEE })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Katrina Flores' })).toHaveAttribute('href', `${ROUTES.EMPLOYEES}/clx-1`);
    });

    it('seeds the draft from the employee record', () => {
      render(<EmployeeWizard mode="edit" employee={employee} />);

      const state = useEmployeeStore.getState();
      expect(state.personalInformation).toMatchObject({ firstName: 'Katrina', lastName: 'Flores' });
      expect(state.professionalInformation).toMatchObject({ department: 'PM', shiftCode: 'GENERAL' });
      expect(state.payrollInformation).toMatchObject({ bankName: 'Axis Bank' });
    });

    it('labels the final action "Update Employee"', async () => {
      const user = userEvent.setup();
      render(<EmployeeWizard mode="edit" employee={employee} />);
      await reachDocuments(user);

      expect(screen.getByRole('button', { name: STRINGS.UPDATE_EMPLOYEE })).toBeInTheDocument();
    });

    it('sends only what changed and shows the saved modal', async () => {
      const user = userEvent.setup();
      vi.mocked(updateEmployee).mockResolvedValue({
        success: true,
        message: 'Employee updated successfully.',
        data: { ...employee, name: 'Jane Doe' },
      });
      render(<EmployeeWizard mode="edit" employee={employee} />);
      await reachDocuments(user);

      await user.click(screen.getByRole('button', { name: STRINGS.UPDATE_EMPLOYEE }));

      expect(updateEmployee).toHaveBeenCalledWith(
        'clx-1',
        expect.objectContaining({
          personalInformation: expect.objectContaining({ firstName: 'Jane', lastName: 'Doe' }),
        })
      );

      const dialog = await screen.findByRole('dialog', { name: 'Employee updated successfully.' });
      expect(within(dialog).getByText('Jane Doe')).toBeInTheDocument();
      expect(within(dialog).getByText('EMP1001')).toBeInTheDocument();
      expect(within(dialog).getByText('PM')).toBeInTheDocument();
    });

    it('tells the user when nothing was changed instead of calling the backend', async () => {
      const user = userEvent.setup();
      render(<EmployeeWizard mode="edit" employee={employee} />);

      /*
      The stubbed forms each submit a patch that differs from the record, so
      the draft is put back to exactly what the wizard seeded it with — through
      the same mapper — before the final step is submitted.
      */
      await reachDocuments(user);
      useEmployeeStore.getState().setEmployeeData(fromEmployeeDetail(employee));

      await user.click(screen.getByRole('button', { name: STRINGS.UPDATE_EMPLOYEE }));

      await waitFor(() =>
        expect(showNotificationMock).toHaveBeenCalledWith(
          STRINGS.NO_CHANGES_TO_UPDATE,
          STRINGS.NOTHING_WAS_CHANGED,
          NOTIFICATION_TYPES.INFO,
          5000,
          'top-right',
          false
        )
      );
      expect(updateEmployee).not.toHaveBeenCalled();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('relays the backend’s own "nothing changed" verdict without raising the saved modal', async () => {
      const user = userEvent.setup();
      vi.mocked(updateEmployee).mockResolvedValue({
        success: true,
        message: 'No changes detected.',
        data: employee,
        meta: { changed: false },
      });
      render(<EmployeeWizard mode="edit" employee={employee} />);
      await reachDocuments(user);

      await user.click(screen.getByRole('button', { name: STRINGS.UPDATE_EMPLOYEE }));

      await waitFor(() =>
        expect(showNotificationMock).toHaveBeenCalledWith(
          STRINGS.NO_CHANGES_TO_UPDATE,
          'No changes detected.',
          NOTIFICATION_TYPES.INFO,
          5000,
          'top-right',
          false
        )
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('reports a refused update with the backend’s wording', async () => {
      const user = userEvent.setup();
      vi.mocked(updateEmployee).mockResolvedValue({ success: false, message: 'Record locked' });
      render(<EmployeeWizard mode="edit" employee={employee} />);
      await reachDocuments(user);

      await user.click(screen.getByRole('button', { name: STRINGS.UPDATE_EMPLOYEE }));

      await waitFor(() =>
        expect(showNotificationMock).toHaveBeenCalledWith(
          STRINGS.EMPLOYEE_UPDATE_FAILED,
          'Record locked',
          NOTIFICATION_TYPES.ERROR,
          5000,
          'top-right',
          false
        )
      );
    });
  });
});
