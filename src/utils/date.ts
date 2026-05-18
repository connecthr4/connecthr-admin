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
