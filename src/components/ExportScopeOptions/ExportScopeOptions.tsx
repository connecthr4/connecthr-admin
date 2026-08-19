/**
 * A radio group letting the user choose whether an export covers every record
 * or only the rows the table is currently showing.
 *
 * Written against the generic `all` / `filtered` scope rather than any one
 * module, so every filterable table can drop it into
 * {@link ExportConfirmationModal} as-is.
 *
 * @example
 * ```tsx
 * import ExportScopeOptions from '@src/components/ExportScopeOptions'
 *
 * <ExportConfirmationModal {...props}>
 *   <ExportScopeOptions value={scope} onChange={setScope} disabled={isExporting} />
 * </ExportConfirmationModal>
 * ```
 */

'use client';

import { Text4 } from '../Typography';
import { STRINGS } from '@/src/constants/strings';
import styles from './ExportScopeOptions.module.scss';

/**
 * `all` ignores the table's criteria; `filtered` mirrors what is on screen.
 */
export type ExportScope = 'all' | 'filtered';

/**
 * Define the props available for the ExportScopeOptions component.
 */
interface ExportScopeOptionsProps {
  value: ExportScope;

  onChange: (scope: ExportScope) => void;

  /**
   * Label for the "everything" choice.
   *
   * @default STRINGS.EXPORT_SCOPE_ALL
   */
  allLabel?: string;

  /**
   * Label for the "what the table is showing" choice.
   *
   * @default STRINGS.EXPORT_SCOPE_FILTERED
   */
  filteredLabel?: string;

  /**
   * Locks the choice while the download runs.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * Groups the radios on the page. Only needs overriding if two of these
   * render at once.
   *
   * @default 'export-scope'
   */
  name?: string;
}

export default function ExportScopeOptions({
  value,
  onChange,
  allLabel = STRINGS.EXPORT_SCOPE_ALL,
  filteredLabel = STRINGS.EXPORT_SCOPE_FILTERED,
  disabled = false,
  name = 'export-scope',
}: ExportScopeOptionsProps) {
  const options: { scope: ExportScope; label: string }[] = [
    { scope: 'all', label: allLabel },
    { scope: 'filtered', label: filteredLabel },
  ];

  return (
    <div className={styles.group} role="radiogroup" aria-label={STRINGS.EXPORT_SCOPE_LABEL}>
      {options.map((option) => (
        <label key={option.scope} className={styles.option}>
          <input
            type="radio"
            name={name}
            value={option.scope}
            checked={value === option.scope}
            disabled={disabled}
            onChange={() => onChange(option.scope)}
            className={styles.radio}
          />

          <Text4>{option.label}</Text4>
        </label>
      ))}
    </div>
  );
}
