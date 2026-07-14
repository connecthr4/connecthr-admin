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
  API_BASE_URL: getEnv('API_BASE_URL'),

  NODE_ENV: process.env.NODE_ENV ?? 'development',
} as const;
