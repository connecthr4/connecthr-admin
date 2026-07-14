import { env } from './env';

/**
 * API Configuration
 */

export const apiConfig = {
  baseUrl: env.API_BASE_URL,

  timeout: 30000,

  headers: {
    'Content-Type': 'application/json',
  },
} as const;
