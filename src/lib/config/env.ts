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

// Only call getEnv for server-side variables
// Client-side NEXT_PUBLIC_ variables are injected at build time
export const env = {
  API_BASE_URL:
    typeof window === 'undefined' ? getEnv('NEXT_PUBLIC_API_BASE_URL') : process.env.NEXT_PUBLIC_API_BASE_URL || '',

  NODE_ENV: process.env.NODE_ENV ?? 'development',
} as const;
