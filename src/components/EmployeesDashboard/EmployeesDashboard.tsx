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
import Button from '../Button';
import TableToolbar from '../TableToolbar';
import { CirclePlus } from 'lucide-react';
import styles from './EmployeesDashboard.module.scss';
import DataTable from '../DataTable';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { logger } from '@/src/lib/logger';
import { getEmployees } from '@/src/lib/actions/employees';
import { NOTIFICATION_TYPES, ROUTES, STRINGS } from '@/src/constants/strings';
import { useNotification } from '@/src/providers/NotificationProvider';
import { useDebounce } from '@/src/hooks/useDebounce';
import type { Employee, EmployeeColumn, EmployeeFilter, EmployeeListMeta } from '@/src/lib/types/employees';
import type { FilterOptions } from '@/src/lib/types/filters';
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
 * `name` and `status` are rendered with custom cells (avatar, badge) and are
 * always shown regardless of what the columns API returns; every other
 * column is driven entirely by the API response so the backend controls
 * which employee fields appear in the table.
 */
const FIXED_COLUMN_KEYS = new Set(['name', 'status']);

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
}

function buildEmployeeColumns(apiColumns: EmployeeColumn[], { onView }: EmployeeRowActions): ColumnDef<Employee>[] {
  const dynamicColumns: ColumnDef<Employee>[] = apiColumns
    .filter((column) => !FIXED_COLUMN_KEYS.has(column.accessorKey))
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
          <img
            src={row.original.avatar}
            alt={row.original.name}
            width={40}
            height={40}
            style={{
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />

          <span>{row.original.name}</span>
        </div>
      ),
    },

    ...dynamicColumns,

    {
      accessorKey: 'employmentStatus',
      header: 'Status',
      cell: ({ getValue }) => <span className={styles.statusBadge}>{getValue() as string}</span>,
    },

    {
      id: 'actions',
      header: 'Action',
      enableSorting: false,

      cell: ({ row }) => (
        <div className={styles.actions}>
          <Eye size={20} className={clsx(styles.actionIcon)} onClick={() => onView(row.original)} />

          <Pencil
            size={20}
            className={clsx(styles.actionIcon)}
            onClick={() => logger.info('Edit employee', { id: row.original.id })}
          />

          <Trash2
            size={20}
            className={clsx(styles.actionIcon)}
            onClick={() => logger.info('Delete employee', { id: row.original.id })}
          />
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
}

export default function EmployeesDashboard({
  initialColumns,
  initialEmployees,
  initialMeta,
  filterOptions,
}: EmployeesDashboardProps) {
  const { showNotification } = useNotification();
  const router = useRouter();
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

  const employeeColumns = useMemo(
    () => buildEmployeeColumns(initialColumns, { onView: handleViewEmployee }),
    [initialColumns, handleViewEmployee]
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
      <AppHeader title={STRINGS.ALL_EMPLOYEES} subtitle={STRINGS.ALL_EMPLOYEE_INFORMATION} />

      <div className={styles.content}>
        <TableToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder={STRINGS.SEARCH_EMPLOYEE}
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
        >
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
    </div>
  );
}
