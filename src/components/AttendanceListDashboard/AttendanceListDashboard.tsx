/**
 * The read-only view of a day's attendance and overtime records: the head
 * count the day stands at, and the records behind it.
 *
 * The records table is still to come — the screen holds the header and the
 * summary cards it will keep.
 *
 * @example
 * ```tsx
 * import AttendanceListDashboard from '@src/components/AttendanceListDashboard'
 *
 * export default function Page() {
 *   return <AttendanceListDashboard currentUser={currentUser} />;
 * }
 * ```
 */

import clsx from 'clsx';
import AppHeader from '../AppHeader';
import { Heading2, Text1, Text2 } from '../Typography';
import { STRINGS } from '@/src/constants/strings';
import { EMPTY_ATTENDANCE_SUMMARY } from '@/src/lib/types/attendance';
import styles from './AttendanceListDashboard.module.scss';

import type { User } from '@/src/lib/types/auth';
import type { AttendanceSummary } from '@/src/lib/types/attendance';

/**
 * Define the props available for the AttendanceListDashboard component.
 */
interface AttendanceListDashboardProps {
  /** The signed-in user, for the header's profile menu. */
  currentUser?: User | null;

  /**
   * The day's head count. Defaults to no counts at all, which is what the
   * screen shows until the attendance endpoints exist to answer with real
   * ones — each card renders "--" rather than a `0` that would claim nobody
   * is present.
   */
  summary?: AttendanceSummary;
}

/**
 * Which tone a card's label and count are painted in. Named after what the
 * count means rather than the colour, so the palette can move without every
 * card being renamed.
 */
type SummaryTone = 'neutral' | 'success' | 'danger' | 'warning' | 'info';

interface SummaryCard {
  key: keyof AttendanceSummary;
  label: string;
  tone: SummaryTone;
}

/**
 * The cards, in the order they are laid out. A list rather than five copies of
 * the same markup — the only thing that differs between them is the count they
 * read and the tone they read it in.
 */
const SUMMARY_CARDS: SummaryCard[] = [
  { key: 'totalEmployees', label: STRINGS.TOTAL_EMPLOYEES, tone: 'neutral' },
  { key: 'present', label: STRINGS.PRESENT, tone: 'success' },
  { key: 'absent', label: STRINGS.ABSENT, tone: 'danger' },
  { key: 'halfDay', label: STRINGS.HALF_DAY, tone: 'warning' },
  { key: 'onLeave', label: STRINGS.ON_LEAVE, tone: 'info' },
];

const TONE_STYLES: Record<SummaryTone, string> = {
  neutral: styles.neutral,
  success: styles.success,
  danger: styles.danger,
  warning: styles.warning,
  info: styles.info,
};

export default function AttendanceListDashboard({
  currentUser,
  summary = EMPTY_ATTENDANCE_SUMMARY,
}: AttendanceListDashboardProps) {
  return (
    <div className={styles.container}>
      <AppHeader
        title={STRINGS.ATTENDANCE_LIST}
        subtitle={STRINGS.ATTENDANCE_LIST_SUBTITLE}
        userDetails={currentUser}
      />

      <div className={styles.content}>
        <div className={styles.summaryGrid}>
          {SUMMARY_CARDS.map(({ key, label, tone }) => (
            <div key={key} className={clsx(styles.summaryCard, TONE_STYLES[tone])}>
              <Text2 className={styles.summaryLabel}>{label}</Text2>

              <Heading2 className={styles.summaryValue}>{summary[key] ?? STRINGS.NOT_AVAILABLE}</Heading2>
            </div>
          ))}
        </div>

        {/* Stands in for the records table. */}
        <div className={styles.placeholder}>
          <Text1 className={styles.placeholderText}>{STRINGS.ATTENDANCE_COMING_SOON}</Text1>
        </div>
      </div>
    </div>
  );
}
