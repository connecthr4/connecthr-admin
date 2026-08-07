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
import { DayPicker, DateRange, Matcher } from '@daypicker/react';
import '@daypicker/react/style.css';
import { formatDisplayDate, parseLocalDate } from '@/src/utils/date';
import styles from './DatePicker.module.scss';

type DatePickerValue = Date | Date[] | DateRange | string | undefined;

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
   * Earliest date that can be navigated to or selected.
   */
  minDate?: Date;

  /**
   * Latest date that can be navigated to or selected.
   */
  maxDate?: Date;

  /**
   * Initial selected date when using single mode.
   */
  initialSelectedDate?: Date;

  /**
   * Initial selected dates when using multiple mode.
   */
  initialSelectedMultipleDates?: Date[];

  /**
   * Marks the field as required, showing a required indicator on the label.
   */
  required?: boolean;

  /**
   * Controlled value of the date picker. Accepts a Date, array of dates, a date range, or an ISO date string.
   */
  value?: DatePickerValue;

  /**
   * The error message to display when validation fails.
   * Typically shown below the input in a distinct color (e.g., red).
   */
  error?: string;
}

export default function DatePicker({
  displayMode = 'modal',
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
  const currentSelectedDate = useMemo(() => {
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? undefined : value;
    }

    if (typeof value === 'string' && value.trim()) {
      return parseLocalDate(value.trim());
    }

    return initialSelectedDate;
  }, [value, initialSelectedDate]);

  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(currentSelectedDate);

  /*
    minDate/maxDate only feed startMonth/endMonth, which caps how far the calendar can be
    navigated — the days either side of the bound inside a reachable month stay clickable.
    Turning them into matchers as well is what actually makes the bounds unselectable.
    Both { before } and { after } are exclusive, so minDate and maxDate remain valid picks.
  */
  const disabledDates = useMemo(() => {
    const matchers: Matcher[] = [];

    if (minDate) matchers.push({ before: minDate });

    if (maxDate) matchers.push({ after: maxDate });

    if (disabled?.length) matchers.push(...disabled);

    return matchers;
  }, [minDate, maxDate, disabled]);

  const [selectedMultiple, setSelectedMultiple] = useState<Date[] | undefined>(initialSelectedMultipleDates);

  const [range, setRange] = useState<DateRange | undefined>(initialRange);

  const handleSelect = (value: DatePickerValue) => {
    if (mode === 'single' && value instanceof Date) {
      const isoDate = formatDisplayDate(value);
      onChange?.(isoDate);
      setOpen(false);
      return;
    } else if (mode === 'range') {
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

    // Handle ISO string values from store/API
    if (typeof currentValue === 'string') {
      const date = parseLocalDate(currentValue);

      return date ? formatDisplayDate(date) : '';
    }

    if (currentValue instanceof Date) {
      return formatDisplayDate(currentValue);
    }

    if (Array.isArray(currentValue)) {
      return currentValue.map(formatDisplayDate).join(', ');
    }

    if (typeof currentValue === 'object' && currentValue !== null && 'from' in currentValue) {
      const from = currentValue.from ? formatDisplayDate(currentValue.from) : '';

      const to = currentValue.to ? formatDisplayDate(currentValue.to) : '';

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
      disabled: disabledDates,
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
        rightIcon={<Calendar size={24} className={styles.calendarIcon} />}
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
