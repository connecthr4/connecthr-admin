/**
 * The "Filter" trigger used on table toolbars. Wraps the filter `Button` in a
 * `Popover`; the panel is an accordion — one heading per filterable column —
 * built on native `<details>`/`<summary>` so only one section opens at a
 * time, with zero JS driving the expand/collapse.
 *
 * @example
 * ```tsx
 * import FilterPopover from '@src/components/FilterPopover';
 *
 * <FilterPopover
 *   filterOptions={[
 *     { id: 'status', label: 'Status', isMulti: true, options: [{ label: 'Permanent', value: 'PERMANENT' }] },
 *   ]}
 *   onFilterChange={(selection) => console.log(selection)}
 * />
 * ```
 */

'use client';

import { useId, useRef, useState } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import clsx from 'clsx';
import Button from '../Button';
import Checkbox from '../Checkbox';
import Popover from '../Popover';
import { Text3 } from '../Typography/Typography';
import styles from './FilterPopover.module.scss';
import { STRINGS } from '@/src/constants/strings';
import type { FilterGroup, FilterOptions } from '@/src/lib/types/filters';

/**
 * Selected option values, keyed by filter group id.
 */
export type FilterSelection = Record<string, string[]>;

const EMPTY_SELECTION: FilterSelection = {};

const EMPTY_OPTIONS: FilterOptions = [];

/**
 * Whether a selection would actually narrow the list — a group the user
 * emptied is left behind as `[]` rather than removed, so an "empty" selection
 * isn't necessarily an empty object.
 */
function hasSelectedValues(selection: FilterSelection) {
  return Object.values(selection).some((values) => values.length > 0);
}

/**
 * Define the props available for the FilterPopover component.
 */
interface FilterPopoverProps {
  /**
   * Filter groups as returned by `/filters/:module`. Each renders as its own
   * accordion section, so the filterable columns, their labels and their
   * options are all decided by the backend rather than hardcoded here.
   */
  filterOptions?: FilterOptions;

  /**
   * Called with the full selection when the "Apply Filter" button is
   * clicked. Checking/unchecking options only updates the draft shown in the
   * panel — nothing is reported until the user applies it.
   */
  onFilterChange?: (selection: FilterSelection) => void;

  /**
   * Additional class name applied to the popover panel.
   */
  className?: string;
}

export default function FilterPopover({
  filterOptions = EMPTY_OPTIONS,
  onFilterChange,
  className,
}: FilterPopoverProps) {
  const uid = useId();
  const panelId = `filter-popover-${uid}`;
  const accordionName = `filter-accordion-${uid}`;

  const [selection, setSelection] = useState<FilterSelection>(EMPTY_SELECTION);
  const [isOpen, setIsOpen] = useState(false);

  /**
   * What was last reported to the parent. Only "Clear" needs it, to tell
   * apart clearing a draft the user never applied (the list is already
   * unfiltered — nothing to report) from clearing filters that are in effect.
   */
  const appliedSelectionRef = useRef<FilterSelection>(EMPTY_SELECTION);

  const toggleOption = (group: FilterGroup, value: string, checked: boolean) => {
    setSelection((prev) => {
      if (!checked) {
        return { ...prev, [group.id]: (prev[group.id] ?? []).filter((selectedValue) => selectedValue !== value) };
      }

      // A single-select group swaps its value rather than accumulating one.
      const next = group.isMulti ? [...(prev[group.id] ?? []), value] : [value];

      return { ...prev, [group.id]: next };
    });
  };

  /**
   * Clearing unchecks every option *and* applies that, so the table goes back
   * to the unfiltered list without the user having to click "Apply Filter"
   * after it. The panel is left open so they can pick a new set right away.
   */
  const handleClear = () => {
    setSelection(EMPTY_SELECTION);

    // Nothing is filtering the list yet, so there is nothing to report.
    if (!hasSelectedValues(appliedSelectionRef.current)) {
      return;
    }

    appliedSelectionRef.current = EMPTY_SELECTION;
    onFilterChange?.(EMPTY_SELECTION);
  };

  const handleApply = () => {
    appliedSelectionRef.current = selection;
    onFilterChange?.(selection);
  };

  return (
    <Popover
      id={panelId}
      trigger={
        <Button
          startIcon={SlidersHorizontal}
          iconSize={18}
          variant="secondary"
          className={clsx(styles.filterButton, isOpen && styles.filterButtonOpen)}
          startIconColor="var(--color-black)"
          aria-expanded={isOpen}
        >
          {STRINGS.FILTER}
        </Button>
      }
      placement="bottom"
      align="start"
      className={clsx(styles.panel, className)}
      onOpenChange={setIsOpen}
    >
      <div className={styles.groups}>
        {filterOptions.map((group, index) => (
          /* The first section starts expanded so the panel never opens empty. */
          <details key={group.id} name={accordionName} open={index === 0} className={styles.group}>
            <summary className={styles.groupHeader}>
              <Text3 as="span">{group.label}</Text3>
              <ChevronDown size={16} className={styles.chevron} />
            </summary>

            <div className={styles.groupOptions}>
              {group.options.map((option) => (
                <Checkbox
                  key={option.value}
                  className={styles.option}
                  name={`${accordionName}-${group.id}-${option.value}`}
                  label={option.label}
                  checked={(selection[group.id] ?? []).includes(option.value)}
                  onChange={(checked) => toggleOption(group, option.value, checked)}
                />
              ))}
            </div>
          </details>
        ))}
      </div>

      <div className={styles.footer}>
        <Button variant="secondary" className={styles.clearButton} onClick={handleClear}>
          {STRINGS.CLEAR}
        </Button>

        <Button
          variant="primary"
          className={styles.applyButton}
          popoverTarget={panelId}
          popoverTargetAction="hide"
          onClick={handleApply}
        >
          {STRINGS.APPLY_FILTER}
        </Button>
      </div>
    </Popover>
  );
}
