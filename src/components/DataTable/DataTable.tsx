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
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { Inbox } from 'lucide-react';
import Dropdown from '../Dropdown';
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

/**
 * Define the props available for the DataTable component.
 */
interface DataTableProps<TData extends object> {
  data: TData[];
  columns: ColumnDef<TData>[];
}

function DataTable<TData extends object>({ data, columns }: DataTableProps<TData>) {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const table = useReactTable({
    data,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const totalRows = data.length;
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
                  <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {totalRows === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.emptyCell}>
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                      <Inbox size={48} />
                    </div>
                    <Text2 className={styles.emptyText}>{STRINGS.NO_DATA_FOUND}</Text2>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalRows > 0 && (
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
