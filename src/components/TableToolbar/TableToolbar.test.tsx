import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import TableToolbar from './TableToolbar';
import { STRINGS } from '@/src/constants/strings';

import type { FilterOptions } from '@/src/lib/types/filters';

const filterOptions: FilterOptions = [
  {
    id: 'department',
    label: 'Department',
    isMulti: true,
    options: [
      { label: 'Design', value: 'Design' },
      { label: 'Development', value: 'Development' },
    ],
  },
];

describe('TableToolbar', () => {
  it('renders the search box with the default placeholder', () => {
    render(<TableToolbar />);

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('uses a custom search placeholder when one is given', () => {
    render(<TableToolbar searchPlaceholder={STRINGS.SEARCH_EMPLOYEE} />);

    expect(screen.getByPlaceholderText(STRINGS.SEARCH_EMPLOYEE)).toBeInTheDocument();
  });

  it('shows the controlled search value and reports typing through onSearchChange', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    render(<TableToolbar searchValue="Ja" onSearchChange={onSearchChange} />);

    const input = screen.getByPlaceholderText('Search...');
    expect(input).toHaveValue('Ja');

    await user.type(input, 'n');

    expect(onSearchChange).toHaveBeenCalledWith('Jan');
  });

  it('renders the filter trigger by default', () => {
    render(<TableToolbar filterOptions={filterOptions} />);

    expect(screen.getByRole('button', { name: STRINGS.FILTER })).toBeInTheDocument();
  });

  it('hides the filter trigger when showFilter is false', () => {
    render(<TableToolbar filterOptions={filterOptions} showFilter={false} />);

    expect(screen.queryByRole('button', { name: STRINGS.FILTER })).not.toBeInTheDocument();
  });

  it('hands the filter options and change handler to the filter panel', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    render(<TableToolbar filterOptions={filterOptions} onFilterChange={onFilterChange} />);

    /* The panel is a native popover, which jsdom never shows — hence `hidden`. */
    await user.click(screen.getByLabelText('Design'));
    await user.click(screen.getByRole('button', { name: STRINGS.APPLY_FILTER, hidden: true }));

    expect(onFilterChange).toHaveBeenCalledWith({ department: ['Design'] });
  });

  it('renders any actions passed as children on the right-hand side', () => {
    render(
      <TableToolbar>
        <button type="button">Export</button>
      </TableToolbar>
    );

    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
  });
});
