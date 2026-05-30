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

import { memo } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import styles from './DataTable.module.scss';

/**
 * Define the props available for the DataTable component.
 */
interface DataTableProps<TData extends object> {
  data: TData[];
  columns: ColumnDef<TData>[];
}

function DataTable<TData extends object>({ data, columns }: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <div className={styles.wrapper}>
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
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default memo(DataTable);
