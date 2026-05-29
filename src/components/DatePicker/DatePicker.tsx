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
import { Calendar } from 'lucide-react';
import TextInput from '@/src/components/TextInput';
import { DayPicker, DateRange } from '@daypicker/react';
import '@daypicker/react/style.css';
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
  onChange?: (value: DatePickerValue) => void;

  /**
   *
   */
  minDate?: Date;

  /**
   *
   */
  maxDate?: Date;

  /**
   *
   */
  initialSelectedDate?: Date;

  /**
   *
   */
  initialSelectedMultipleDates?: Date[];

  /**
   *
   */
  required?: boolean;

  /**
   *
   */
  value?: DatePickerValue;

  /**
   * The error message to display when validation fails.
   * Typically shown below the input in a distinct color (e.g., red).
   */
  error?: string;
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
  minDate,
  maxDate,
  initialSelectedDate,
  initialSelectedMultipleDates,
  required,
  value,
  error,
  onChange,
}: DatePickerProps) {
  const currentSelectedDate = value instanceof Date ? value : initialSelectedDate;

  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(currentSelectedDate);

  const [selectedMultiple, setSelectedMultiple] = useState<Date[] | undefined>(initialSelectedMultipleDates);

  const [range, setRange] = useState<DateRange | undefined>(initialRange);

  const handleSelect = (value: DatePickerValue) => {
    if (mode === 'range') {
      setRange(value as DateRange);
    } else if (mode === 'multiple') {
      setSelectedMultiple(value as Date[]);
    }

    onChange?.(value);
    setOpen(false);
  };

  const formattedValue = useMemo(() => {
    const currentValue = value || currentSelectedDate;

    if (!currentValue) return '';

    if (currentValue instanceof Date) {
      return currentValue.toLocaleDateString();
    }

    if (Array.isArray(currentValue)) {
      return currentValue.map((date) => date.toLocaleDateString()).join(', ');
    }

    if ('from' in currentValue) {
      const from = currentValue.from?.toLocaleDateString() || '';
      const to = currentValue.to?.toLocaleDateString() || '';

      return `${from} - ${to}`;
    }

    return '';
  }, [value, currentSelectedDate]);

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

    if (mode === 'single') {
      return (
        <DayPicker
          {...props}
          mode="single"
          captionLayout="dropdown"
          reverseYears
          reverseMonths
          startMonth={minDate || new Date(2024, 0)}
          endMonth={maxDate || new Date(2035, 11)}
          selected={currentSelectedDate}
        />
      );
    }

    if (mode === 'multiple') {
      return <DayPicker {...props} mode="multiple" selected={selectedMultiple} />;
    }

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
        startMonth={minDate || new Date(2024, 0)}
        endMonth={maxDate || new Date(2035, 11)}
      />
    );
  };

  return (
    <div data-testid="DatePickerTest">
      <TextInput
        label={label}
        placeholder="Select date"
        value={formattedValue}
        required={required}
        error={error}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={inputClassName}
        readOnly
        rightIcon={<Calendar size={16} className={styles.calendarIcon} />}
      />

      {open && (
        <div className={styles.datePickerWrapper}>
          {displayMode === 'inline' ? (
            <div className={styles.inlineContainer}>{renderPicker()}</div>
          ) : (
            <div className={styles.modalOverlay} onClick={() => setOpen(false)}>
              <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
                {renderPicker()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
