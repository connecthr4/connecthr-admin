'use client';

import { createContext, useContext, useState } from 'react';
import clsx from 'clsx';
import { Chevron, type CaptionLabelProps } from '@daypicker/react';
import styles from './DatePicker.module.scss';

export type CalendarView = 'days' | 'months' | 'years';

const YEARS_PER_PAGE = 12;

/*
Hardcoded rather than taken from Intl: 'en-GB' shortens September to "Sept",
and a locale-dependent label would hydrate as a mismatch.
*/
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Months since year 0, so two months compare as plain numbers. */
const monthIndex = (year: number, month: number) => year * 12 + month;

/**
 * Handler for the caption click, handed down through context because DayPicker
 * renders `CaptionLabel` itself and only passes it span props. `undefined`
 * leaves the caption as plain text (e.g. when navigation is disabled).
 */
export const CaptionClickContext = createContext<(() => void) | undefined>(undefined);

/**
 * Replaces DayPicker's caption ("March 2026") with a button that opens the month grid.
 * Kept at module level so DayPicker receives a stable component and does not remount the caption.
 */
export function CaptionLabel({ children, ...props }: CaptionLabelProps) {
  const onCaptionClick = useContext(CaptionClickContext);

  if (!onCaptionClick) return <span {...props}>{children}</span>;

  return (
    <span {...props}>
      <button type="button" className={styles.captionButton} onClick={onCaptionClick} title="Choose month and year">
        {children}
        <Chevron orientation="down" size={18} className="rdp-chevron" />
      </button>
    </span>
  );
}

interface MonthYearPanelProps {
  /** Which grid to show. */
  view: Exclude<CalendarView, 'days'>;

  /** The month the day calendar is on; its month and year are highlighted. */
  month: Date;

  /** Earliest navigable month. Anything before it is disabled. */
  startMonth?: Date;

  /** Latest navigable month. Anything after it is disabled. */
  endMonth?: Date;

  /** Switches between the month grid, the year grid and the day calendar. */
  onViewChange: (view: CalendarView) => void;

  /** Called with the first of the picked month. */
  onMonthChange: (month: Date) => void;
}

/**
 * The month (Jan–Dec) and year (12 per page) grids shown in place of the day calendar.
 * Paging here only browses: the calendar month changes once a month is picked.
 */
export default function MonthYearPanel({
  view,
  month,
  startMonth,
  endMonth,
  onViewChange,
  onMonthChange,
}: MonthYearPanelProps) {
  const startYear = startMonth?.getFullYear();
  const endYear = endMonth?.getFullYear();

  /*
  Pages are anchored on the first allowed year, so the default 2024–2035 bounds
  fit on one page. Unbounded, they fall on multiples of 12 (2016–2027).
  */
  const getPageStart = (year: number) => {
    const anchor = startYear ?? 0;

    return anchor + Math.floor((year - anchor) / YEARS_PER_PAGE) * YEARS_PER_PAGE;
  };

  const [browseYear, setBrowseYear] = useState(month.getFullYear());
  const [pageStart, setPageStart] = useState(() => getPageStart(month.getFullYear()));

  const isYearDisabled = (year: number) =>
    (startYear !== undefined && year < startYear) || (endYear !== undefined && year > endYear);

  const isMonthDisabled = (m: number) =>
    (startMonth && monthIndex(browseYear, m) < monthIndex(startMonth.getFullYear(), startMonth.getMonth())) ||
    (endMonth && monthIndex(browseYear, m) > monthIndex(endMonth.getFullYear(), endMonth.getMonth()));

  const openYears = () => {
    setPageStart(getPageStart(browseYear));
    onViewChange('years');
  };

  const pickYear = (year: number) => {
    setBrowseYear(year);
    onViewChange('months');
  };

  const pickMonth = (m: number) => {
    onMonthChange(new Date(browseYear, m));
    onViewChange('days');
  };

  const isMonths = view === 'months';
  const pageEnd = pageStart + YEARS_PER_PAGE - 1;

  const header = isMonths
    ? {
        title: (
          <button type="button" className={styles.captionButton} onClick={openYears} title="Choose year">
            {browseYear}
            <Chevron orientation="down" size={18} className="rdp-chevron" />
          </button>
        ),
        prevLabel: 'Previous year',
        nextLabel: 'Next year',
        prevDisabled: isYearDisabled(browseYear - 1),
        nextDisabled: isYearDisabled(browseYear + 1),
        onPrev: () => setBrowseYear((y) => y - 1),
        onNext: () => setBrowseYear((y) => y + 1),
      }
    : {
        title: (
          <span className={styles.panelTitle}>
            {pageStart} – {pageEnd}
          </span>
        ),
        prevLabel: 'Previous years',
        nextLabel: 'Next years',
        prevDisabled: startYear !== undefined && pageStart <= startYear,
        nextDisabled: endYear !== undefined && pageEnd >= endYear,
        onPrev: () => setPageStart((p) => p - YEARS_PER_PAGE),
        onNext: () => setPageStart((p) => p + YEARS_PER_PAGE),
      };

  const items = isMonths
    ? MONTH_LABELS.map((label, m) => ({
        key: label,
        label,
        selected: browseYear === month.getFullYear() && m === month.getMonth(),
        disabled: isMonthDisabled(m),
        onClick: () => pickMonth(m),
      }))
    : Array.from({ length: YEARS_PER_PAGE }, (_, i) => {
        const year = pageStart + i;

        return {
          key: year,
          label: year,
          selected: year === month.getFullYear(),
          disabled: isYearDisabled(year),
          onClick: () => pickYear(year),
        };
      });

  return (
    <div className={clsx('rdp-root', styles.dayPicker, styles.monthYearPanel)} data-testid="MonthYearPanel">
      <div className={styles.panelHeader}>
        <button
          type="button"
          className="rdp-button_previous"
          aria-label={header.prevLabel}
          disabled={header.prevDisabled}
          onClick={header.onPrev}
        >
          <Chevron orientation="left" className="rdp-chevron" disabled={header.prevDisabled} />
        </button>

        {header.title}

        <button
          type="button"
          className="rdp-button_next"
          aria-label={header.nextLabel}
          disabled={header.nextDisabled}
          onClick={header.onNext}
        >
          <Chevron orientation="right" className="rdp-chevron" disabled={header.nextDisabled} />
        </button>
      </div>

      <div className={styles.panelGrid} role="group" aria-label={isMonths ? 'Months' : 'Years'}>
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            className={clsx(styles.panelItem, item.selected && styles.panelItemSelected)}
            aria-pressed={item.selected}
            disabled={!!item.disabled}
            onClick={item.onClick}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
