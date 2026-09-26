/**
 * A reusable data table component that supports dynamic columns, sorting, filtering, pagination, and customizable row rendering.
 *
 * @example
 * ```tsx
 * import DataTable from '@src/components/DataTable'
 *
 * export default function DataTable() {
 *   return <DataTable label="Hello" />;
 * }
 * ```
 */
'use client';

import { memo, useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable,
  type Column,
} from '@tanstack/react-table';
import { columnAttributes } from './columnMeta';
import Dropdown from '../Dropdown';
import { Inbox } from 'lucide-react';
import Pagination from '../Pagination';
import { Text2 } from '../Typography/Typography';
import { STRINGS } from '@/src/constants/strings';
import styles from './DataTable.module.scss';

const PAGE_SIZE_OPTIONS = [
  { label: '10', value: '10' },
  { label: '20', value: '20' },
  { label: '50', value: '50' },
  { label: '100', value: '100' },
];

const SKELETON_ROW_COUNT = 10;
const SKELETON_BONE_WIDTHS = ['85%', '65%', '75%', '55%', '90%', '60%'];

/*
Takes the columns rather than a count so each placeholder cell carries its column's
priority and pin — otherwise the skeleton would lay out wider than the table it stands
in for, and jump as the real rows replace it.
*/
function SkeletonRow<TData>({ columns, rowIndex }: { columns: Column<TData, unknown>[]; rowIndex: number }) {
  return (
    <tr>
      {columns.map((column, columnIndex) => (
        <td key={column.id} {...columnAttributes(column.columnDef.meta)}>
          <div
            className={styles.bone}
            style={{ width: SKELETON_BONE_WIDTHS[(rowIndex + columnIndex) % SKELETON_BONE_WIDTHS.length] }}
          />
        </td>
      ))}
    </tr>
  );
}

/**
 * Define the props available for the DataTable component.
 */
interface DataTableProps<TData extends object> {
  data: TData[];
  columns: ColumnDef<TData>[];

  /**
   * When true, `data` is treated as a single already-fetched page (e.g. from
   * a server-paginated API) instead of the full dataset. Pagination state is
   * driven by `pagination`/`onPaginationChange`/`totalItems` instead of being
   * computed locally.
   */
  manualPagination?: boolean;

  /**
   * Controlled pagination state. Required when `manualPagination` is true.
   */
  pagination?: PaginationState;

  /**
   * Called with the next pagination state when the user changes page or page size.
   */
  onPaginationChange?: (pagination: PaginationState) => void;

  /**
   * Total row count across all pages. Used for the "Showing x to y of z" footer
   * and page count when `manualPagination` is true.
   */
  totalItems?: number;

  /**
   * Dims the table while a new page/search/sort is being fetched.
   */
  isLoading?: boolean;

  /**
   * Whether the rows are paged at all. `false` renders every row in the one
   * scrollable area and drops the footer — for a listing the backend answers
   * whole, where a pager would only be splitting up data the table already has.
   *
   * @default true
   */
  paginated?: boolean;

  /**
   * What an empty table says. Defaults to the generic "No data found" — worth
   * overriding where the table is one specific listing and can say what is
   * missing.
   */
  emptyMessage?: string;
}

function DataTable<TData extends object>({
  data,
  columns,
  manualPagination = false,
  pagination: controlledPagination,
  onPaginationChange,
  totalItems,
  isLoading = false,
  paginated = true,
  emptyMessage = STRINGS.NO_DATA_FOUND,
}: DataTableProps<TData>) {
  const [internalPagination, setInternalPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const pagination = manualPagination ? controlledPagination! : internalPagination;

  const handlePaginationChange: typeof onPaginationChange = (next) => {
    if (manualPagination) {
      onPaginationChange?.(next);
    } else {
      setInternalPagination(next);
    }
  };

  const table = useReactTable({
    data,
    columns,
    state: { pagination },
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater;
      handlePaginationChange(next);
    },
    getCoreRowModel: getCoreRowModel(),
    /*
    An unpaged table gets neither: without a pagination row model every row the
    table was handed comes through the core one, which is the whole point of it.
    */
    ...(!paginated
      ? {}
      : manualPagination
        ? { manualPagination: true, pageCount: Math.ceil((totalItems ?? 0) / (pagination.pageSize || 1)) }
        : { getPaginationRowModel: getPaginationRowModel() }),
  });

  const totalRows = manualPagination ? (totalItems ?? 0) : data.length;
  const { pageIndex, pageSize } = pagination;
  const rangeStart = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const rangeEnd = Math.min(rangeStart + pageSize - 1, totalRows);

  return (
    <div className={styles.wrapper}>
      <div className={styles.scrollArea}>
        <table className={styles.table}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} {...columnAttributes(header.column.columnDef.meta)}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {isLoading ? (
              Array.from({ length: SKELETON_ROW_COUNT }).map((_, rowIndex) => (
                <SkeletonRow key={rowIndex} columns={table.getVisibleLeafColumns()} rowIndex={rowIndex} />
              ))
            ) : totalRows === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.emptyCell}>
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                      <Inbox size={48} />
                    </div>
                    <Text2 className={styles.emptyText}>{emptyMessage}</Text2>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} {...columnAttributes(cell.column.columnDef.meta)}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {paginated && totalRows > 0 && (
        <div className={styles.footer}>
          <div className={styles.pageSizeControl}>
            <Text2 className={styles.footerLabel}>{STRINGS.SHOWING}</Text2>

            <div className={styles.pageSizeDropdown}>
              <Dropdown
                options={PAGE_SIZE_OPTIONS}
                value={String(pageSize)}
                onChange={(value) => table.setPageSize(Number(value))}
              />
            </div>
          </div>

          <Text2 className={styles.footerLabel}>
            {STRINGS.SHOWING} {rangeStart} to {rangeEnd} out of {totalRows} records
          </Text2>

          <Pagination
            currentPage={pageIndex + 1}
            totalPages={table.getPageCount()}
            onPageChange={(page) => table.setPageIndex(page - 1)}
          />
        </div>
      )}
    </div>
  );
}

export default memo(DataTable);
