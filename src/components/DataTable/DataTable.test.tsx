import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import DataTable from './DataTable';
import styles from './DataTable.module.scss';
import { STRINGS } from '@/src/constants/strings';

import type { ColumnDef, PaginationState } from '@tanstack/react-table';

interface Person {
  id: number;
  name: string;
  role: string;
}

const columns: ColumnDef<Person>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'role', header: 'Role' },
];

/** `count` rows that differ only by index, for the paging cases. */
function people(count: number): Person[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `Person ${index + 1}`,
    role: 'Engineer',
  }));
}

/*
`DataTable` is generic and wrapped in `memo()`, which TypeScript can't
instantiate per call site — the same cast the app's own callers use.
*/
const PeopleTable = DataTable as unknown as (props: {
  data: Person[];
  columns: ColumnDef<Person>[];
  manualPagination?: boolean;
  pagination?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  totalItems?: number;
  isLoading?: boolean;
}) => React.JSX.Element;

/** The names the table body currently shows, top to bottom. */
const visibleNames = () =>
  within(screen.getByRole('table'))
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell')[0].textContent);

describe('DataTable', () => {
  it('renders the column headers', () => {
    render(<PeopleTable data={people(2)} columns={columns} />);

    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Role' })).toBeInTheDocument();
  });

  it('renders a row per record with its cell values', () => {
    render(<PeopleTable data={people(2)} columns={columns} />);

    expect(visibleNames()).toEqual(['Person 1', 'Person 2']);
    expect(screen.getAllByText('Engineer')).toHaveLength(2);
  });

  it('shows the empty state and no footer when there are no records', () => {
    render(<PeopleTable data={[]} columns={columns} />);

    expect(screen.getByText(STRINGS.NO_DATA_FOUND)).toBeInTheDocument();
    expect(screen.queryByText(/out of/)).not.toBeInTheDocument();
  });

  it('shows skeleton rows instead of data while loading', () => {
    const { container } = render(<PeopleTable data={people(2)} columns={columns} isLoading />);

    expect(container.querySelectorAll(`.${styles.bone}`)).toHaveLength(10 * columns.length);
    expect(screen.queryByText('Person 1')).not.toBeInTheDocument();
  });

  describe('client-side pagination', () => {
    it('shows the first ten records and the record range', () => {
      render(<PeopleTable data={people(25)} columns={columns} />);

      expect(visibleNames()).toHaveLength(10);
      expect(visibleNames()[0]).toBe('Person 1');
      expect(screen.getByText(`${STRINGS.SHOWING} 1 to 10 out of 25 records`)).toBeInTheDocument();
    });

    it('turns the page when a page number is clicked', async () => {
      const user = userEvent.setup();
      render(<PeopleTable data={people(25)} columns={columns} />);

      await user.click(screen.getByRole('button', { name: '3' }));

      expect(visibleNames()).toEqual(['Person 21', 'Person 22', 'Person 23', 'Person 24', 'Person 25']);
      expect(screen.getByText(`${STRINGS.SHOWING} 21 to 25 out of 25 records`)).toBeInTheDocument();
    });

    it('changes the page size from the footer dropdown', async () => {
      const user = userEvent.setup();
      render(<PeopleTable data={people(25)} columns={columns} />);

      await user.click(screen.getByRole('button', { expanded: false }));
      await user.click(screen.getByRole('button', { name: '20', expanded: undefined }));

      expect(visibleNames()).toHaveLength(20);
      expect(screen.getByText(`${STRINGS.SHOWING} 1 to 20 out of 25 records`)).toBeInTheDocument();
    });
  });

  describe('manual (server-side) pagination', () => {
    it('reads the range and page count from totalItems rather than the rows given', () => {
      render(
        <PeopleTable
          data={people(10)}
          columns={columns}
          manualPagination
          pagination={{ pageIndex: 1, pageSize: 10 }}
          onPaginationChange={vi.fn()}
          totalItems={42}
        />
      );

      expect(screen.getByText(`${STRINGS.SHOWING} 11 to 20 out of 42 records`)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '6' })).not.toBeInTheDocument();
    });

    it('renders every row it is given without slicing', () => {
      render(
        <PeopleTable
          data={people(10)}
          columns={columns}
          manualPagination
          pagination={{ pageIndex: 3, pageSize: 10 }}
          onPaginationChange={vi.fn()}
          totalItems={42}
        />
      );

      expect(visibleNames()).toHaveLength(10);
    });

    it('reports page changes to the parent instead of paging itself', async () => {
      const user = userEvent.setup();
      const onPaginationChange = vi.fn();
      render(
        <PeopleTable
          data={people(10)}
          columns={columns}
          manualPagination
          pagination={{ pageIndex: 0, pageSize: 10 }}
          onPaginationChange={onPaginationChange}
          totalItems={42}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Next page' }));

      expect(onPaginationChange).toHaveBeenCalledWith({ pageIndex: 1, pageSize: 10 });
      /* Still on the parent's page — nothing moved locally. */
      expect(visibleNames()[0]).toBe('Person 1');
    });

    it('reports a page size change to the parent', async () => {
      const user = userEvent.setup();
      const onPaginationChange = vi.fn();
      render(
        <PeopleTable
          data={people(10)}
          columns={columns}
          manualPagination
          pagination={{ pageIndex: 2, pageSize: 10 }}
          onPaginationChange={onPaginationChange}
          totalItems={42}
        />
      );

      await user.click(screen.getByRole('button', { expanded: false }));
      await user.click(screen.getByRole('button', { name: '50', expanded: undefined }));

      expect(onPaginationChange).toHaveBeenCalledWith(expect.objectContaining({ pageSize: 50 }));
    });

    it('shows the empty state when totalItems is zero even if stale rows were given', () => {
      render(
        <PeopleTable
          data={[]}
          columns={columns}
          manualPagination
          pagination={{ pageIndex: 0, pageSize: 10 }}
          onPaginationChange={vi.fn()}
          totalItems={0}
        />
      );

      expect(screen.getByText(STRINGS.NO_DATA_FOUND)).toBeInTheDocument();
    });
  });
});
