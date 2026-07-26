/**
 * Returns a greeting message based on the current time of day.
 *
 * Morning   : Before 12 PM
 * Afternoon : Between 12 PM and 6 PM
 * Evening   : After 6 PM
 *
 * @returns {string} A greeting message such as
 * "Good Morning", "Good Afternoon", or "Good Evening"
 */

export const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Good Morning';
  }

  if (hour < 18) {
    return 'Good Afternoon';
  }

  return 'Good Evening';
};

export const formatDisplayDate = (date?: Date) => {
  if (!date || Number.isNaN(date.getTime())) {
    return '';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${year}-${month}-${day}`;
};

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parses a "YYYY-MM-DD" string as a local calendar date, not UTC midnight —
 * `new Date("YYYY-MM-DD")` is spec'd to parse as UTC, which rolls the date
 * back or forward a day once read through local getters, depending on the
 * viewer's timezone offset.
 */
export const parseLocalDate = (value: string): Date | undefined => {
  if (DATE_ONLY_PATTERN.test(value)) {
    const [year, month, day] = value.split('-').map(Number);

    return new Date(year, month - 1, day);
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
};
