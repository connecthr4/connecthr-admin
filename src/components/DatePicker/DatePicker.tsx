/**
 * A customizable date picker that integrates easily with forms and supports themes, disabled dates, and validation.
 *
 * @example
 * ```tsx
 * import DatePicker from '@src/components/DatePicker'
 *
 * export default function DatePicker() {
 *   return <DatePicker label="Hello" />;
 * }
 * ```
 */
'use client';

import { useMemo, useState } from 'react';
import { DayPicker, DateRange } from '@daypicker/react';
import '@daypicker/react/style.css';
import TextInput from '@/src/components/TextInput';
import styles from './DatePicker.module.scss';

type DatePickerValue = Date | Date[] | DateRange | undefined;

/**
 * Define the props available for the DatePicker component.
 */
interface DatePickerProps {
  /**
   * Label displayed above the date picker input.
   */
  label?: string;

  /**
   * Where to show the calendar popup:
   * - "inline" = below the text field
   * - "modal" = centered overlay
   */
  displayMode?: 'inline' | 'modal';

  /**
   * The mode prop determines the selection mode.
   * When the mode prop is set to "single", only one date can be selected at a time
   * Set the mode prop to "multiple" to enable the selection of multiple dates in DayPicker.
   * Set the mode prop to "range" to enable the selection of a continuous range of dates in DayPicker.
   */
  mode?: 'single' | 'multiple' | 'range';

  /**
   * Minimum number of selectable days in range mode.
   */
  min?: number;

  /**
   * Maximum number of selectable days in range mode.
   */
  max?: number;

  /**
   * Initial selected date range when using range mode.
   */
  initialRange?: DateRange;

  /**
   * Controls the position of the month navigation buttons.
   *
   * - `around` places navigation buttons on both sides.
   * - `after` places navigation buttons after the caption.
   *
   * @default 'around'
   */
  navLayout?: 'around' | 'after' | undefined;

  /**
   * disableNavigation?: boolean;
   *
   * @default false
   */
  disableNavigation?: boolean;

  /**
   * List of disabled dates that cannot be selected.
   */
  disabled?: Date[];

  /**
   * Additional custom class name applied to the input field.
   */
  inputClassName?: string;

  /**
   * Callback triggered whenever the selected date value changes.
   *
   * @param value value Selected date value based on the current mode.
   * @returns void
   */
  onChange?: (value: Date | Date[] | DateRange | undefined) => void;
}

export default function DatePicker({
  displayMode = 'inline',
  label,
  mode = 'single',
  initialRange,
  navLayout = 'around',
  disableNavigation = false,
  min,
  max,
  disabled,
  inputClassName,
  onChange,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState<Date>();
  const [selectedMultiple, setSelectedMultiple] = useState<Date[]>();
  const [range, setRange] = useState<DateRange | undefined>(initialRange);

  const handleSelect = (value: DatePickerValue) => {
    if (mode === 'range') setRange(value as DateRange);
    else if (mode === 'single') setSelected(value as Date);
    else if (mode === 'multiple') setSelectedMultiple(value as Date[]);

    onChange?.(value);
    setOpen(false);
  };

  // Helper to render DayPicker for all modes
  const renderPicker = () => {
    const props = {
      month,
      onMonthChange: setMonth,
      navLayout,
      disableNavigation,
      pagedNavigation: true,
      fixedWeeks: true,
      disabled,
      className: styles.dayPicker,
      onSelect: handleSelect,
    };

    if (mode === 'single')
      return (
        <DayPicker
          {...props}
          mode="single"
          captionLayout="dropdown"
          reverseYears
          reverseMonths
          startMonth={new Date(2024, 6)}
          endMonth={new Date(2025, 9)}
          selected={selected}
        />
      );
    if (mode === 'multiple') return <DayPicker {...props} mode="multiple" selected={selectedMultiple} />;
    return (
      <DayPicker
        {...props}
        mode="range"
        selected={range}
        min={min}
        max={max}
        captionLayout="dropdown"
        reverseYears
        reverseMonths
        startMonth={new Date(2024, 6)}
        endMonth={new Date(2025, 9)}
      />
    );
  };

  return (
    <div data-testid="DatePickerTest">
      <TextInput
        label={label}
        placeholder="Select date"
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={inputClassName}
        isCalendar
      />

      {open && (
        <div className={styles.datePickerWrapper}>
          <>
            {displayMode === 'inline' ? (
              <div className={styles.inlineContainer}>{renderPicker()}</div>
            ) : (
              <div className={styles.modalOverlay} onClick={() => setOpen(false)}>
                <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
                  {renderPicker()}
                </div>
              </div>
            )}
          </>
        </div>
      )}
    </div>
  );
}
