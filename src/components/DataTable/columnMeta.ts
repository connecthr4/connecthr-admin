/**
 * Responsive behaviour a column opts into through TanStack's `meta`, typed here so
 * every `ColumnDef` in the app is checked against it.
 *
 * @example
 * ```ts
 * { accessorKey: 'createdBy', header: 'Created by', meta: { priority: 3 } },
 * { id: 'actions', header: 'Actions', meta: { pin: 'end' } },
 * ```
 */

import type { RowData } from '@tanstack/react-table';

/**
 * How much a column matters when the table runs short of width. Driven by the
 * table's own width (a container query), not the viewport's — the same table is
 * narrower beside a docked sidebar than on a tablet without one.
 *
 * - `1` (default) — always shown; the columns that identify the row.
 * - `2` — hidden when the table is narrower than ~40rem.
 * - `3` — hidden when the table is narrower than ~60rem; detail a user can live without.
 */
export type ColumnPriority = 1 | 2 | 3;

/**
 * Keeps a column in view while the rest of the row scrolls sideways — `start` for the
 * column that names the row, `end` for row actions.
 */
export type ColumnPin = 'start' | 'end';

declare module '@tanstack/react-table' {
  // Type parameters must match TanStack's own declaration for the interfaces to merge.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    priority?: ColumnPriority;
    pin?: ColumnPin;
  }
}

/**
 * The attributes the stylesheet keys on. Omitted entirely for a column that sets
 * neither, so an unannotated table renders exactly as before.
 */
export function columnAttributes(meta: { priority?: ColumnPriority; pin?: ColumnPin } | undefined) {
  return {
    'data-priority': meta?.priority && meta.priority > 1 ? meta.priority : undefined,
    'data-pin': meta?.pin,
  };
}
