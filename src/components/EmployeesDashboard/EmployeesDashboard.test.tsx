import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import EmployeesDashboard, { DEFAULT_SORT_BY, DEFAULT_SORT_ORDER } from './EmployeesDashboard';
import { getEmployees } from '@/src/lib/actions/employees';
import { EmployeesClient } from '@/src/lib/api/employeesClient';
import { logger } from '@/src/lib/logger';
import { NOTIFICATION_TYPES, ROUTES, STRINGS } from '@/src/constants/strings';

import type { Employee, EmployeeColumn, EmployeeListMeta } from '@/src/lib/types/employees';
import type { FilterOptions } from '@/src/lib/types/filters';
import type { ExportScope } from '../ExportScopeOptions';

const pushMock = vi.fn();
const prefetchMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, prefetch: prefetchMock }),
}));

vi.mock('@/src/lib/logger', () => ({
  logger: { trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn(), fatal: vi.fn() },
}));

const showNotificationMock = vi.fn();

vi.mock('@/src/providers/NotificationProvider', () => ({
  useNotification: () => ({ showNotification: showNotificationMock }),
}));

vi.mock('@/src/lib/actions/employees', () => ({
  getEmployees: vi.fn(),
}));

vi.mock('@/src/lib/api/employeesClient', () => ({
  EmployeesClient: { exportEmployees: vi.fn() },
}));

/*
The header chip renders `UserMenu` for real; only its Server Action dependency
is stubbed, since `src/lib/actions/auth` pulls in `server-only` and
`next/headers`, neither of which resolve under jsdom.
*/
vi.mock('@/src/lib/actions/auth', () => ({
  logoutAction: vi.fn(),
}));

vi.mock('../ExportConfirmationModal', () => ({
  default: ({
    isOpen,
    onClose,
    onConfirm,
    description,
    isExporting,
    children,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    description: string;
    isExporting?: boolean;
    children?: React.ReactNode;
  }) =>
    isOpen ? (
      <div>
        <span>{description}</span>
        <span>{isExporting ? 'exporting' : 'export-idle'}</span>
        {children}
        <button onClick={onConfirm}>mock-confirm-export</button>
        <button onClick={onClose}>mock-cancel-export</button>
      </div>
    ) : null,
}));

vi.mock('../ExportScopeOptions', () => ({
  default: ({ value, onChange }: { value: ExportScope; onChange: (scope: ExportScope) => void }) => (
    <div>
      <span>{`scope:${value}`}</span>
      <button onClick={() => onChange('filtered')}>choose-filtered</button>
    </div>
  ),
}));

const columns: EmployeeColumn[] = [
  { accessorKey: 'employeeId', header: 'Employee ID' },
  { accessorKey: 'department', header: 'Department' },
  /* Excluded from the dynamic set — the table owns these. */
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'designation', header: 'Designation' },
  { accessorKey: 'status', header: 'Status' },
];

const employee = (id: string, name: string): Employee => ({
  id,
  avatar: `https://i.pravatar.cc/150?u=${id}`,
  name,
  employeeId: `EMP${id}`,
  department: 'Design',
  designation: 'Designer',
  type: 'Office',
  status: 'Permanent',
});

const employees = [employee('1', 'Darlene Robertson'), employee('2', 'Floyd Miles')];

const meta = (overrides: Partial<EmployeeListMeta> = {}): EmployeeListMeta => ({
  currentPage: 1,
  pageSize: 10,
  totalItems: 2,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
  ...overrides,
});

const filterOptions: FilterOptions = [
  {
    id: 'department',
    label: 'Department',
    isMulti: true,
    options: [{ label: 'Design', value: 'Design' }],
  },
];

const baseRequest = {
  page: 1,
  limit: 10,
  sortBy: DEFAULT_SORT_BY,
  sortOrder: DEFAULT_SORT_ORDER,
};

const errorNotification = (title: string, message: string) => [
  title,
  message,
  NOTIFICATION_TYPES.ERROR,
  5000,
  'top-right',
  false,
];

/** The body row for the employee named `name`. */
const getRow = (name: string) => screen.getByText(name).closest('tr') as HTMLTableRowElement;

function renderDashboard(initialMeta = meta()) {
  return render(
    <EmployeesDashboard
      initialColumns={columns}
      initialEmployees={employees}
      initialMeta={initialMeta}
      filterOptions={filterOptions}
    />
  );
}

describe('EmployeesDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the header and the server-rendered page without fetching again', () => {
    renderDashboard();

    expect(screen.getByText(STRINGS.ALL_EMPLOYEES)).toBeInTheDocument();
    expect(screen.getByText(STRINGS.ALL_EMPLOYEE_INFORMATION)).toBeInTheDocument();
    expect(screen.getByText('Darlene Robertson')).toBeInTheDocument();
    expect(screen.getByText('Floyd Miles')).toBeInTheDocument();
    expect(screen.getByText(`${STRINGS.SHOWING} 1 to 2 out of 2 records`)).toBeInTheDocument();

    expect(getEmployees).not.toHaveBeenCalled();
  });

  it('builds the columns as name, the API’s own columns, status and actions', () => {
    renderDashboard();

    const headers = screen.getAllByRole('columnheader').map((header) => header.textContent);
    expect(headers).toEqual(['Employee Name', 'Employee ID', 'Department', 'Status', 'Action']);
  });

  it('renders each employee’s avatar beside their name', () => {
    renderDashboard();

    expect(within(getRow('Darlene Robertson')).getByRole('img', { name: 'Darlene Robertson' })).toBeInTheDocument();
  });

  it('navigates to the employee when the view icon is clicked, prefetching on hover', async () => {
    const user = userEvent.setup();
    renderDashboard();

    const eye = getRow('Darlene Robertson').querySelector('.lucide-eye') as SVGElement;
    await user.hover(eye);
    expect(prefetchMock).toHaveBeenCalledWith(`${ROUTES.EMPLOYEES}/1`);

    await user.click(eye);
    expect(pushMock).toHaveBeenCalledWith(`${ROUTES.EMPLOYEES}/1`);
  });

  it('navigates to the edit page when the pencil icon is clicked', async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(getRow('Floyd Miles').querySelector('.lucide-pencil') as SVGElement);

    expect(pushMock).toHaveBeenCalledWith(`${ROUTES.EMPLOYEES}/2/edit`);
  });

  it('navigates to the new-employee wizard from "Add New Employee"', async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(screen.getByRole('button', { name: STRINGS.ADD_NEW_EMPLOYEE }));

    expect(pushMock).toHaveBeenCalledWith('/employees/new');
  });

  it('reads the next page from the server and swaps the rows in', async () => {
    const user = userEvent.setup();
    vi.mocked(getEmployees).mockResolvedValue({
      success: true,
      data: [employee('11', 'Page Two')],
      meta: meta({ currentPage: 2, totalItems: 12, totalPages: 2 }),
    });
    renderDashboard(meta({ totalItems: 12, totalPages: 2, hasNextPage: true }));

    await user.click(screen.getByRole('button', { name: 'Next page' }));

    expect(getEmployees).toHaveBeenCalledWith({ ...baseRequest, page: 2 });
    expect(await screen.findByText('Page Two')).toBeInTheDocument();
    expect(screen.queryByText('Darlene Robertson')).not.toBeInTheDocument();
    expect(screen.getByText(`${STRINGS.SHOWING} 11 to 12 out of 12 records`)).toBeInTheDocument();
  });

  it('searches once typing settles, from the first page', async () => {
    const user = userEvent.setup();
    vi.mocked(getEmployees).mockResolvedValue({ success: true, data: employees, meta: meta() });
    renderDashboard(meta({ totalItems: 12, totalPages: 2, hasNextPage: true }));

    await user.click(screen.getByRole('button', { name: 'Next page' }));
    await waitFor(() => expect(getEmployees).toHaveBeenCalledWith({ ...baseRequest, page: 2 }));

    await user.type(screen.getByPlaceholderText(STRINGS.SEARCH_EMPLOYEE), 'Dar');

    await waitFor(() => expect(getEmployees).toHaveBeenLastCalledWith({ ...baseRequest, search: 'Dar' }));
  });

  it('narrows the read to the applied filters, from the first page', async () => {
    const user = userEvent.setup();
    vi.mocked(getEmployees).mockResolvedValue({ success: true, data: employees, meta: meta() });
    renderDashboard();

    await user.click(screen.getByLabelText('Design'));
    /* The panel is a native popover, which jsdom never shows — hence `hidden`. */
    await user.click(screen.getByRole('button', { name: STRINGS.APPLY_FILTER, hidden: true }));

    await waitFor(() =>
      expect(getEmployees).toHaveBeenCalledWith({
        ...baseRequest,
        filters: [{ key: 'department', values: ['Design'] }],
      })
    );
  });

  it('reports a failed read and keeps the rows it had', async () => {
    const user = userEvent.setup();
    vi.mocked(getEmployees).mockResolvedValue({ success: false, message: 'Employees unavailable' });
    renderDashboard(meta({ totalItems: 12, totalPages: 2, hasNextPage: true }));

    await user.click(screen.getByRole('button', { name: 'Next page' }));

    await waitFor(() =>
      expect(showNotificationMock).toHaveBeenCalledWith(
        ...errorNotification(STRINGS.EMPLOYEES_FETCH_FAILED, 'Employees unavailable')
      )
    );
    expect(screen.getByText('Darlene Robertson')).toBeInTheDocument();
  });

  it('logs and reports an unexpected error from the read', async () => {
    const user = userEvent.setup();
    vi.mocked(getEmployees).mockRejectedValue(new Error('boom'));
    renderDashboard(meta({ totalItems: 12, totalPages: 2, hasNextPage: true }));

    await user.click(screen.getByRole('button', { name: 'Next page' }));

    await waitFor(() =>
      expect(showNotificationMock).toHaveBeenCalledWith(...errorNotification(STRINGS.EMPLOYEES_FETCH_FAILED, ''))
    );
    expect(logger.error).toHaveBeenCalled();
  });

  it('discards a response that a newer request has overtaken', async () => {
    const user = userEvent.setup();
    let resolveFirst!: (value: Awaited<ReturnType<typeof getEmployees>>) => void;
    vi.mocked(getEmployees)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve;
          })
      )
      .mockResolvedValueOnce({
        success: true,
        data: [employee('31', 'Newer')],
        meta: meta({ currentPage: 3, totalItems: 30, totalPages: 3 }),
      });
    renderDashboard(meta({ totalItems: 30, totalPages: 3, hasNextPage: true }));

    await user.click(screen.getByRole('button', { name: '2' }));
    await user.click(screen.getByRole('button', { name: '3' }));
    expect(await screen.findByText('Newer')).toBeInTheDocument();

    resolveFirst({ success: true, data: [employee('21', 'Stale')], meta: meta({ currentPage: 2, totalItems: 30 }) });

    await waitFor(() => expect(screen.getByText('Newer')).toBeInTheDocument());
    expect(screen.queryByText('Stale')).not.toBeInTheDocument();
  });

  describe('export', () => {
    it('opens the confirmation modal on "all" without downloading anything yet', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByRole('button', { name: STRINGS.EXPORT }));

      expect(screen.getByText(STRINGS.EXPORT_EMPLOYEES_CONFIRMATION)).toBeInTheDocument();
      expect(screen.getByText('scope:all')).toBeInTheDocument();
      expect(EmployeesClient.exportEmployees).not.toHaveBeenCalled();
    });

    it('closes without downloading when cancelled', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByRole('button', { name: STRINGS.EXPORT }));
      await user.click(screen.getByText('mock-cancel-export'));

      expect(screen.queryByText('mock-confirm-export')).not.toBeInTheDocument();
      expect(EmployeesClient.exportEmployees).not.toHaveBeenCalled();
    });

    it('exports everyone with only the sort, then confirms and closes', async () => {
      const user = userEvent.setup();
      vi.mocked(EmployeesClient.exportEmployees).mockResolvedValue(undefined);
      renderDashboard();

      await user.click(screen.getByRole('button', { name: STRINGS.EXPORT }));
      await user.click(screen.getByText('mock-confirm-export'));

      expect(EmployeesClient.exportEmployees).toHaveBeenCalledWith({
        scope: 'all',
        sortBy: DEFAULT_SORT_BY,
        sortOrder: DEFAULT_SORT_ORDER,
      });
      await waitFor(() => expect(screen.queryByText('mock-confirm-export')).not.toBeInTheDocument());
      expect(showNotificationMock).toHaveBeenCalledWith(
        STRINGS.EMPLOYEES_EXPORTED_SUCCESSFULLY,
        '',
        NOTIFICATION_TYPES.SUCCESS,
        5000,
        'top-right',
        false
      );
    });

    it('repeats the listing’s search and filters on a "filtered" export', async () => {
      const user = userEvent.setup();
      vi.mocked(getEmployees).mockResolvedValue({ success: true, data: employees, meta: meta() });
      vi.mocked(EmployeesClient.exportEmployees).mockResolvedValue(undefined);
      renderDashboard();

      await user.click(screen.getByLabelText('Design'));
      await user.click(screen.getByRole('button', { name: STRINGS.APPLY_FILTER, hidden: true }));
      await user.type(screen.getByPlaceholderText(STRINGS.SEARCH_EMPLOYEE), 'Dar');
      await waitFor(() => expect(getEmployees).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'Dar' })));

      await user.click(screen.getByRole('button', { name: STRINGS.EXPORT }));
      await user.click(screen.getByText('choose-filtered'));
      await user.click(screen.getByText('mock-confirm-export'));

      expect(EmployeesClient.exportEmployees).toHaveBeenCalledWith({
        scope: 'filtered',
        sortBy: DEFAULT_SORT_BY,
        sortOrder: DEFAULT_SORT_ORDER,
        search: 'Dar',
        filters: [{ key: 'department', values: ['Design'] }],
      });
    });

    it('shows the exporting state while the download is in flight', async () => {
      const user = userEvent.setup();
      let resolveExport!: () => void;
      vi.mocked(EmployeesClient.exportEmployees).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveExport = () => resolve(undefined);
          })
      );
      renderDashboard();

      await user.click(screen.getByRole('button', { name: STRINGS.EXPORT }));
      await user.click(screen.getByText('mock-confirm-export'));
      expect(await screen.findByText('exporting')).toBeInTheDocument();

      resolveExport();
      await waitFor(() => expect(screen.queryByText('mock-confirm-export')).not.toBeInTheDocument());
    });

    it('reports a failed export and keeps the modal open', async () => {
      const user = userEvent.setup();
      const error = new Error('failed') as Error & { details?: unknown };
      error.details = { message: 'Export unavailable', success: false };
      vi.mocked(EmployeesClient.exportEmployees).mockRejectedValue(error);
      renderDashboard();

      await user.click(screen.getByRole('button', { name: STRINGS.EXPORT }));
      await user.click(screen.getByText('mock-confirm-export'));

      await waitFor(() =>
        expect(showNotificationMock).toHaveBeenCalledWith(
          ...errorNotification(STRINGS.EMPLOYEES_EXPORT_FAILED, 'Export unavailable')
        )
      );
      expect(logger.error).toHaveBeenCalled();
      expect(screen.getByText('mock-confirm-export')).toBeInTheDocument();
    });
  });
});
