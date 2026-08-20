/**
 * Environment configuration
 *
 * Centralized access to all environment variables.
 * This avoids reading process.env throughout the application.
 */

function getEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  /**
   * A getter rather than a plain property so the missing-variable throw fires
   * when something actually reads the URL, not when this module is imported.
   * `isDevelopment` below is pulled in by the browser logger, which is bundled
   * into most client components — eager validation would let an unset API URL
   * blank the page instead of failing in the one place that needs it.
   *
   * `NEXT_PUBLIC_` values are inlined at build time, so on the client this
   * reads a literal and never reaches `getEnv`.
   */
  get API_BASE_URL(): string {
    return typeof window === 'undefined'
      ? getEnv('NEXT_PUBLIC_API_BASE_URL')
      : (process.env.NEXT_PUBLIC_API_BASE_URL ?? '');
  },

  NODE_ENV: process.env.NODE_ENV ?? 'development',
} as const;

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
