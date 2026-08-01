import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import FilterPopover from './FilterPopover';
import type { FilterOptions } from '@/src/lib/types/filters';

/**
 * jsdom's UA stylesheet gives `[popover]` elements `display: none` until
 * they're actually shown (jsdom doesn't implement showPopover()/toggle, so
 * they never are here) — role queries for content inside the panel need
 * `hidden: true` or they'd be treated as accessibility-hidden.
 */

/**
 * Mirrors a real `/filters/employee` response — note `status` labels differ
 * from their values, which is what the selection assertions below rely on.
 */
const FILTER_OPTIONS: FilterOptions = [
  {
    id: 'department',
    label: 'Department',
    isMulti: true,
    options: [
      { label: 'Business Analysis', value: 'Business Analysis' },
      { label: 'Design', value: 'Design' },
      { label: 'Development', value: 'Development' },
    ],
  },
  {
    id: 'status',
    label: 'Status',
    isMulti: true,
    options: [
      { label: 'Permanent', value: 'PERMANENT' },
      { label: 'Contract', value: 'CONTRACT' },
      { label: 'Probation', value: 'PROBATION' },
    ],
  },
];

describe('FilterPopover', () => {
  it('renders a Filter trigger button linked to the popover panel', () => {
    render(<FilterPopover filterOptions={FILTER_OPTIONS} />);

    const trigger = screen.getByRole('button', { name: 'Filter' });
    const panel = document.querySelector('[popover]') as HTMLElement;

    expect(trigger).toHaveAttribute('popovertarget', panel.id);
    expect(trigger).toHaveAttribute('popovertargetaction', 'toggle');
  });

  it('renders one accordion section per group, labelled by the API', () => {
    render(<FilterPopover filterOptions={FILTER_OPTIONS} />);

    expect(screen.getByText('Department')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders the options belonging to each group', () => {
    render(<FilterPopover filterOptions={FILTER_OPTIONS} />);

    expect(screen.getByLabelText('Business Analysis')).toBeInTheDocument();
    expect(screen.getByLabelText('Design')).toBeInTheDocument();
    expect(screen.getByLabelText('Development')).toBeInTheDocument();
    expect(screen.getByLabelText('Permanent')).toBeInTheDocument();
    expect(screen.getByLabelText('Probation')).toBeInTheDocument();
  });

  it('renders a section for any group the backend sends, not a fixed list', () => {
    render(
      <FilterPopover
        filterOptions={[
          { id: 'location', label: 'Location', isMulti: true, options: [{ label: 'Chennai', value: 'CHENNAI' }] },
        ]}
      />
    );

    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByLabelText('Chennai')).toBeInTheDocument();
  });

  it('renders no sections when there are no filter groups', () => {
    render(<FilterPopover filterOptions={[]} />);

    expect(document.querySelectorAll('details')).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Apply Filter', hidden: true })).toBeInTheDocument();
  });

  it('starts with the first section expanded and the rest collapsed', () => {
    render(<FilterPopover filterOptions={FILTER_OPTIONS} />);

    const departmentSection = screen.getByText('Department').closest('details') as HTMLDetailsElement;
    const statusSection = screen.getByText('Status').closest('details') as HTMLDetailsElement;

    expect(departmentSection.open).toBe(true);
    expect(statusSection.open).toBe(false);
  });

  it('groups all sections under the same accordion name so only one stays open', () => {
    render(<FilterPopover filterOptions={FILTER_OPTIONS} />);

    const departmentSection = screen.getByText('Department').closest('details') as HTMLDetailsElement;
    const statusSection = screen.getByText('Status').closest('details') as HTMLDetailsElement;

    expect(departmentSection.name).toBe(statusSection.name);
    expect(departmentSection.name).not.toBe('');
  });

  it('does not call onFilterChange while checking options — only a draft is kept', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(<FilterPopover filterOptions={FILTER_OPTIONS} onFilterChange={onFilterChange} />);

    await user.click(screen.getByLabelText('Design'));
    await user.click(screen.getByLabelText('Permanent'));

    expect(onFilterChange).not.toHaveBeenCalled();
  });

  it('calls onFilterChange with option values, not labels, when Apply Filter is clicked', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(<FilterPopover filterOptions={FILTER_OPTIONS} onFilterChange={onFilterChange} />);

    await user.click(screen.getByLabelText('Design'));
    await user.click(screen.getByLabelText('Permanent'));
    await user.click(screen.getByRole('button', { name: 'Apply Filter', hidden: true }));

    expect(onFilterChange).toHaveBeenCalledWith({
      department: ['Design'],
      status: ['PERMANENT'],
    });
  });

  it('accumulates values within a group when isMulti is true', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(<FilterPopover filterOptions={FILTER_OPTIONS} onFilterChange={onFilterChange} />);

    await user.click(screen.getByLabelText('Permanent'));
    await user.click(screen.getByLabelText('Contract'));
    await user.click(screen.getByRole('button', { name: 'Apply Filter', hidden: true }));

    expect(onFilterChange).toHaveBeenCalledWith({ status: ['PERMANENT', 'CONTRACT'] });
  });

  it('replaces the previous value within a group when isMulti is false', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(
      <FilterPopover filterOptions={[{ ...FILTER_OPTIONS[1], isMulti: false }]} onFilterChange={onFilterChange} />
    );

    await user.click(screen.getByLabelText('Permanent'));
    await user.click(screen.getByLabelText('Contract'));

    expect(screen.getByLabelText('Permanent')).not.toBeChecked();
    expect(screen.getByLabelText('Contract')).toBeChecked();

    await user.click(screen.getByRole('button', { name: 'Apply Filter', hidden: true }));

    expect(onFilterChange).toHaveBeenCalledWith({ status: ['CONTRACT'] });
  });

  it('links the Apply Filter button to close the popover natively', () => {
    render(<FilterPopover filterOptions={FILTER_OPTIONS} />);

    const panel = document.querySelector('[popover]') as HTMLElement;
    const applyButton = screen.getByRole('button', { name: 'Apply Filter', hidden: true });

    expect(applyButton).toHaveAttribute('popovertarget', panel.id);
    expect(applyButton).toHaveAttribute('popovertargetaction', 'hide');
  });

  it('unchecks every option when Clear is clicked', async () => {
    const user = userEvent.setup();

    render(<FilterPopover filterOptions={FILTER_OPTIONS} />);

    const design = screen.getByLabelText('Design');

    await user.click(design);
    expect(design).toBeChecked();

    await user.click(screen.getByRole('button', { name: 'Clear', hidden: true }));

    expect(design).not.toBeChecked();
  });

  it('does not call onFilterChange when Clear is clicked', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(<FilterPopover filterOptions={FILTER_OPTIONS} onFilterChange={onFilterChange} />);

    await user.click(screen.getByLabelText('Design'));
    await user.click(screen.getByRole('button', { name: 'Clear', hidden: true }));

    expect(onFilterChange).not.toHaveBeenCalled();
  });

  it('applies an empty selection after clearing and then applying', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(<FilterPopover filterOptions={FILTER_OPTIONS} onFilterChange={onFilterChange} />);

    await user.click(screen.getByLabelText('Design'));
    await user.click(screen.getByRole('button', { name: 'Clear', hidden: true }));
    await user.click(screen.getByRole('button', { name: 'Apply Filter', hidden: true }));

    expect(onFilterChange).toHaveBeenCalledWith({});
  });

  it('merges a custom className into the panel', () => {
    render(<FilterPopover filterOptions={FILTER_OPTIONS} className="custom-panel" />);

    const panel = document.querySelector('[popover]') as HTMLElement;

    expect(panel).toHaveClass('custom-panel');
  });
});
