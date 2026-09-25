/**
 * A dashboard component for displaying, managing, and monitoring all employee records in a centralized view.
 *
 * @example
 * ```tsx
 * import EmployeesDashboard from '@src/components/EmployeesDashboard'
 *
 * export default function EmployeesDashboard() {
 *   return <EmployeesDashboard label="Hello" />;
 * }
 * ```
 */
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AppHeader from '../AppHeader';
import AppImage from '../AppImage';
import Button from '../Button';
import Drawer from '../Drawer';
import SeparationForm from '../SeparationForm';
import TableToolbar from '../TableToolbar';
import ExportConfirmationModal from '../ExportConfirmationModal';
import ExportScopeOptions, { type ExportScope } from '../ExportScopeOptions';
import { CirclePlus, Download } from 'lucide-react';
import styles from './EmployeesDashboard.module.scss';
import DataTable from '../DataTable';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { Eye, LogOut, Pencil } from 'lucide-react';
import clsx from 'clsx';
import { logger } from '@/src/lib/logger';
import { getEmployees } from '@/src/lib/actions/employees';
import { EmployeesClient } from '@/src/lib/api/employeesClient';
import { getApiErrorInfo } from '@/src/lib/api/helpers';
import { NOTIFICATION_TYPES, ROUTES, STRINGS } from '@/src/constants/strings';
import { toSeparationEmployee } from '@/src/lib/types/separation';
import { useNotification } from '@/src/providers/NotificationProvider';
import { useDebounce } from '@/src/hooks/useDebounce';
import type {
  Employee,
  EmployeeColumn,
  EmployeeFilter,
  EmployeeListMeta,
  ExportEmployeesRequest,
} from '@/src/lib/types/employees';
import type { FilterOptions } from '@/src/lib/types/filters';
import type { User } from '@/src/lib/types/auth';
import type { FilterSelection } from '../FilterPopover';
import { useRouter } from 'next/navigation';

export type { Employee };

/**
 * Newest first: an employee who was just added through the wizard is the one the user is
 * most likely looking for, and with server-side pagination they would otherwise land on
 * the last page. Exported so the server-rendered first page is ordered the same way — the
 * two would silently disagree if each kept its own default.
 */
export const DEFAULT_SORT_BY = 'createdAt';
export const DEFAULT_SORT_ORDER = 'desc' as const;

const EMPTY_SELECTION: FilterSelection = {};

/**
 * Turns the popover's selection into the request's `filters` array. Groups
 * the user emptied are dropped rather than sent as `values: []`, which the
 * backend would read as "match nothing".
 */
function toEmployeeFilters(selection: FilterSelection): EmployeeFilter[] {
  return Object.entries(selection)
    .filter(([, values]) => values.length > 0)
    .map(([key, values]) => ({ key, values }));
}

/**
 * The export scope the modal opens on. Exporting everything is the safer
 * default: it is what a user reaching for "Export" usually means, and it
 * cannot silently omit rows they forgot they had filtered out.
 */
const DEFAULT_EXPORT_SCOPE: ExportScope = 'all';

/**
 * Builds the export payload. On `filtered` it reuses the very same criteria
 * the list request was made with, so the file matches the rows on screen; on
 * `all` the criteria are left off entirely. The sort is sent either way, so
 * the file is ordered like the table rather than however the backend
 * happens to default.
 */
function toExportRequest(
  scope: ExportScope,
  criteria: { search: string; filters: EmployeeFilter[] }
): ExportEmployeesRequest {
  const request: ExportEmployeesRequest = {
    scope,
    sortBy: DEFAULT_SORT_BY,
    sortOrder: DEFAULT_SORT_ORDER,
  };

  if (scope === 'all') {
    return request;
  }

  return {
    ...request,
    ...(criteria.search ? { search: criteria.search } : {}),
    ...(criteria.filters.length > 0 ? { filters: criteria.filters } : {}),
  };
}

/**
 * Keys the API returns that are not turned into generic columns: `name` and
 * `status` are rendered with custom cells (avatar, badge) and always shown,
 * and `designation` is dropped from the table. Every other column is driven
 * entirely by the API response so the backend controls which employee fields
 * appear in the table.
 */
const EXCLUDED_COLUMN_KEYS = new Set(['name', 'status', 'designation']);

/**
 * A colour per employment status, so a row's state is readable at a glance instead of every
 * pill looking alike: green for someone currently employed, amber for a notice period still
 * running, red for someone who has left, and grey for an account switched off but still on
 * the books — the same reading `UsersDashboard` gives those colours.
 *
 * Keyed by status rather than typed as a union because the backend sends its own wording
 * ("On Notice") rather than a code, and the set of statuses is its to extend.
 */
const STATUS_CLASS: Record<string, string> = {
  ACTIVE: styles.statusActive,
  ON_NOTICE: styles.statusOnNotice,
  EXITED: styles.statusExited,
  INACTIVE: styles.statusInactive,
};

/**
 * Folds the backend's wording onto a `STATUS_CLASS` key, so "On Notice", "on notice" and
 * "ON_NOTICE" all reach the same colour and a change of casing upstream doesn't quietly
 * grey out a column.
 *
 * Coalesced first because no response is validated on the way in: a row that arrives without
 * a status should render a blank pill, not take the whole table down.
 */
const normalizeStatus = (status: string) =>
  (status ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');

/**
 * Whether the row still has employment to end, which is the one thing separation needs: an
 * employee already on notice has a separation in flight, and an exited or inactive record has
 * nothing left to file against.
 *
 * Read off the same normalised status as the pill, so the icon can never disagree with the
 * colour beside it.
 */
const isActiveEmployee = (status: string) => normalizeStatus(status) === 'ACTIVE';

/**
 * A status nobody has given a colour to keeps the primary-coloured pill the list has always
 * shown: still legible, and visibly "not one of the four" rather than looking like a mistake.
 *
 * Exported for the test — the mapping is the point of the badge, and it is worth asserting
 * without a table around it.
 */
export function getEmploymentStatusClass(status: string) {
  return STATUS_CLASS[normalizeStatus(status)] ?? styles.statusUnknown;
}

/**
 * `DataTable` is generic and wrapped in `memo()`, which TypeScript can't
 * instantiate per call site — cast once here so this file stays typed for `Employee`.
 */
const EmployeesTable = DataTable as unknown as (props: {
  data: Employee[];
  columns: ColumnDef<Employee>[];
  manualPagination?: boolean;
  pagination?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  totalItems?: number;
  isLoading?: boolean;
}) => React.JSX.Element;

/**
 * Row actions are handed in rather than closed over: the column definitions are built
 * outside the component, and `router` is only available inside it.
 */
interface EmployeeRowActions {
  onView: (employee: Employee) => void;

  /**
   * Fired when the pointer reaches the view action, before it is clicked — see
   * `handleViewEmployeeIntent`.
   */
  onViewIntent: (employee: Employee) => void;

  onEdit: (employee: Employee) => void;

  onSeparate: (employee: Employee) => void;
}

function buildEmployeeColumns(
  apiColumns: EmployeeColumn[],
  { onView, onViewIntent, onEdit, onSeparate }: EmployeeRowActions
): ColumnDef<Employee>[] {
  const dynamicColumns: ColumnDef<Employee>[] = apiColumns
    .filter((column) => !EXCLUDED_COLUMN_KEYS.has(column.accessorKey))
    .map((column) => ({
      accessorKey: column.accessorKey,
      header: column.header,
    }));

  return [
    {
      accessorKey: 'name',
      header: 'Employee Name',
      cell: ({ row }) => (
        <div className={styles.employeeCell}>
          <AppImage
            src={row.original.avatar}
            alt={row.original.name}
            width={40}
            height={40}
            className={styles.employeeAvatar}
          />

          <span>{row.original.name}</span>
        </div>
      ),
    },

    ...dynamicColumns,

    {
      accessorKey: 'employmentStatus',
      header: 'Status',

      cell: ({ row }) => {
        const status = row.original.employmentStatus;

        return <span className={clsx(styles.statusBadge, getEmploymentStatusClass(status))}>{status}</span>;
      },
    },

    {
      id: 'actions',
      header: 'Action',
      enableSorting: false,

      cell: ({ row }) => (
        <div className={styles.actions}>
          <Eye
            size={20}
            className={clsx(styles.actionIcon)}
            onClick={() => onView(row.original)}
            onMouseEnter={() => onViewIntent(row.original)}
          />
          <Pencil size={20} className={clsx(styles.actionIcon)} onClick={() => onEdit(row.original)} />

          {/*
            Left out rather than disabled for anyone who isn't active: a greyed icon on most of
            the list would read as something broken, where its absence reads as "not applicable
            to this row" — which the status pill in the cell before it already explains.
          */}
          {isActiveEmployee(row.original.employmentStatus) && (
            <LogOut
              size={20}
              className={clsx(styles.actionIcon, styles.separationIcon)}
              onClick={() => onSeparate(row.original)}
            />
          )}
        </div>
      ),
    },
  ];
}

/**
 * Define the props available for the EmployeesDashboard component.
 */
interface EmployeesDashboardProps {
  initialColumns: EmployeeColumn[];
  initialEmployees: Employee[];
  initialMeta: EmployeeListMeta;

  /**
   * Selectable filter values keyed by employee field, as returned by
   * `/filters/employee`. Drives the accordion sections in the filter popover.
   */
  filterOptions: FilterOptions;

  /**
   * The signed-in user, for the header chip. Passed from the server render so the name is
   * there in the first paint rather than after the auth store has hydrated.
   */
  currentUser: User | null;
}

export default function EmployeesDashboard({
  initialColumns,
  initialEmployees,
  initialMeta,
  filterOptions,
  currentUser,
}: EmployeesDashboardProps) {
  const { showNotification } = useNotification();
  const router = useRouter();

  /**
   * The row whose separation is being filed. Kept apart from the drawer's open state so the
   * panel still has an employee to render while it animates shut.
   */
  const [separationEmployee, setSeparationEmployee] = useState<Employee | null>(null);
  const [isSeparationDrawerOpen, setIsSeparationDrawerOpen] = useState(false);

  /**
   * `router` is referentially stable, so the column definitions are built once per
   * columns payload rather than on every render.
   */
  const handleViewEmployee = useCallback(
    (employee: Employee) => {
      router.push(`${ROUTES.EMPLOYEES}/${employee.id}`);
    },
    [router]
  );

  /**
   * The details route is dynamic, so it is never prefetched on its own — only its loading
   * boundary can be, and only when asked. Warming it on hover means the click lands on a
   * skeleton that is already in the browser, with just the record still streaming in.
   */
  const handleViewEmployeeIntent = useCallback(
    (employee: Employee) => {
      router.prefetch(`${ROUTES.EMPLOYEES}/${employee.id}`);
    },
    [router]
  );

  /**
   * The edit route fetches the record itself and renders the wizard already populated, so
   * the row action only has to navigate — nothing is fetched from the table.
   */
  const handleEditEmployee = useCallback(
    (employee: Employee) => {
      router.push(`${ROUTES.EMPLOYEES}/${employee.id}/edit`);
    },
    [router]
  );

  /**
   * The separation form opens over the list rather than on its own route: the row already
   * holds everything its summary names, so the drawer opens on the click with nothing to
   * fetch, and closing it leaves the user on the page and the page they were browsing.
   *
   * Only setters are used, so the callback is stable and the column definitions are not
   * rebuilt on every render.
   */
  const handleSeparateEmployee = useCallback((employee: Employee) => {
    setSeparationEmployee(employee);
    setIsSeparationDrawerOpen(true);
  }, []);

  /**
   * The employee is deliberately left in state: the drawer keeps its content mounted while
   * it slides shut, and clearing it here would empty the panel mid-animation. The next open
   * replaces it.
   */
  const handleCloseSeparationDrawer = useCallback(() => setIsSeparationDrawerOpen(false), []);

  /**
   * Narrowed once per employee rather than on every render, so the form is not handed a new
   * object each time the table around it re-renders.
   */
  const separationTarget = useMemo(
    () => (separationEmployee ? toSeparationEmployee(separationEmployee) : null),
    [separationEmployee]
  );

  const employeeColumns = useMemo(
    () =>
      buildEmployeeColumns(initialColumns, {
        onView: handleViewEmployee,
        onViewIntent: handleViewEmployeeIntent,
        onEdit: handleEditEmployee,
        onSeparate: handleSeparateEmployee,
      }),
    [initialColumns, handleViewEmployee, handleViewEmployeeIntent, handleEditEmployee, handleSeparateEmployee]
  );

  const [employees, setEmployees] = useState(initialEmployees);
  const [meta, setMeta] = useState(initialMeta);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: initialMeta.currentPage - 1,
    pageSize: initialMeta.pageSize,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [filterSelection, setFilterSelection] = useState<FilterSelection>(EMPTY_SELECTION);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportScope, setExportScope] = useState<ExportScope>(DEFAULT_EXPORT_SCOPE);
  const [isExporting, setIsExporting] = useState(false);

  const [appliedSearch, setAppliedSearch] = useState(debouncedSearch);
  const isFirstFetch = useRef(true);
  /**
   * Server Functions don't expose `fetch`'s `AbortController`/`signal`, so
   * stale responses (e.g. from rapid pagination or search edits) are
   * discarded by sequence number instead of being cancelled outright.
   */
  const latestRequestIdRef = useRef(0);

  /**
   * A new search query always restarts browsing at page 1. Adjusted during
   * render (React's recommended pattern for derived state) rather than in an
   * effect, so it doesn't trigger an extra render pass.
   */
  if (appliedSearch !== debouncedSearch) {
    setAppliedSearch(debouncedSearch);

    if (pagination.pageIndex !== 0) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }

  const employeeFilters = useMemo(() => toEmployeeFilters(filterSelection), [filterSelection]);

  /**
   * Applying filters narrows the result set, so the page the user was on may
   * no longer exist — go back to the first page along with the new criteria.
   */
  const handleFilterChange = (selection: FilterSelection) => {
    setFilterSelection(selection);
    setPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }));
  };

  /**
   * The scope resets on every open, so a one-off "filtered" export never
   * carries over into the next one the user reaches for.
   */
  const handleOpenExportModal = () => {
    setExportScope(DEFAULT_EXPORT_SCOPE);
    setIsExportModalOpen(true);
  };

  const handleExportEmployees = async () => {
    setIsExporting(true);

    try {
      await EmployeesClient.exportEmployees(
        toExportRequest(exportScope, { search: debouncedSearch, filters: employeeFilters })
      );
      setIsExportModalOpen(false);
      showNotification(
        STRINGS.EMPLOYEES_EXPORTED_SUCCESSFULLY,
        '',
        NOTIFICATION_TYPES.SUCCESS,
        5000,
        'top-right',
        false
      );
    } catch (error) {
      logger.error('Error occurred while exporting employees:', error);
      const { message } = getApiErrorInfo(error);
      showNotification(STRINGS.EMPLOYEES_EXPORT_FAILED, message, NOTIFICATION_TYPES.ERROR, 5000, 'top-right', false);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    // Initial page is already provided by the server-rendered page, so skip
    // the redundant fetch on mount.
    if (isFirstFetch.current) {
      isFirstFetch.current = false;
      return;
    }

    const requestId = ++latestRequestIdRef.current;

    setIsLoading(true);

    getEmployees({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(employeeFilters.length > 0 ? { filters: employeeFilters } : {}),
      sortBy: DEFAULT_SORT_BY,
      sortOrder: DEFAULT_SORT_ORDER,
    })
      .then((result) => {
        // A newer request has since been kicked off — ignore this stale response.
        if (latestRequestIdRef.current !== requestId) {
          return;
        }

        if (result.success) {
          setEmployees(result.data);
          setMeta(result.meta);
        } else {
          showNotification(
            STRINGS.EMPLOYEES_FETCH_FAILED,
            result.message,
            NOTIFICATION_TYPES.ERROR,
            5000,
            'top-right',
            false
          );
        }
      })
      .catch((error) => {
        if (latestRequestIdRef.current !== requestId) {
          return;
        }

        logger.error('Unexpected error fetching employees:', error);
        showNotification(STRINGS.EMPLOYEES_FETCH_FAILED, '', NOTIFICATION_TYPES.ERROR, 5000, 'top-right', false);
      })
      .finally(() => {
        if (latestRequestIdRef.current === requestId) {
          setIsLoading(false);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageIndex, pagination.pageSize, debouncedSearch, employeeFilters]);

  return (
    <div className={styles.container}>
      <AppHeader title={STRINGS.ALL_EMPLOYEES} subtitle={STRINGS.ALL_EMPLOYEE_INFORMATION} userDetails={currentUser} />

      <div className={styles.content}>
        <TableToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder={STRINGS.SEARCH_EMPLOYEE}
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
        >
          <Button variant="secondary" startIcon={Download} className={styles.button} onClick={handleOpenExportModal}>
            {STRINGS.EXPORT}
          </Button>

          <Button startIcon={CirclePlus} className={styles.button} onClick={() => router.push('/employees/new')}>
            {STRINGS.ADD_NEW_EMPLOYEE}
          </Button>
        </TableToolbar>

        <div className={styles.tableContainer}>
          <EmployeesTable
            data={employees}
            columns={employeeColumns}
            manualPagination
            pagination={pagination}
            onPaginationChange={setPagination}
            totalItems={meta.totalItems}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/*
        Rendered unconditionally so the panel can animate both ways; the drawer unmounts the
        form itself once it has closed, which is what gives the next employee a blank form.
      */}
      <Drawer
        isOpen={isSeparationDrawerOpen}
        onClose={handleCloseSeparationDrawer}
        title={STRINGS.INITIATE_SEPARATION}
        size="44rem"
      >
        {separationTarget && (
          <SeparationForm
            employee={separationTarget}
            onCancel={handleCloseSeparationDrawer}
            onSuccess={handleCloseSeparationDrawer}
          />
        )}
      </Drawer>

      {isExportModalOpen && (
        <ExportConfirmationModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          onConfirm={handleExportEmployees}
          description={STRINGS.EXPORT_EMPLOYEES_CONFIRMATION}
          isExporting={isExporting}
        >
          <ExportScopeOptions
            value={exportScope}
            onChange={setExportScope}
            allLabel={STRINGS.EXPORT_SCOPE_ALL_EMPLOYEES}
            disabled={isExporting}
          />
        </ExportConfirmationModal>
      )}
    </div>
  );
}
