/**
 * ============================================================================
 * API Layer
 * ============================================================================
 *
 * Central export for the API infrastructure.
 *
 * Consumers should import from:
 *
 * import { apiClient, ApiError, API_ENDPOINTS } from '@/lib/api';
 *
 * instead of importing individual files.
 */

/**
 * HTTP Client
 */
export * from './client';

/**
 * API Endpoints
 */
export * from './endpoints';

/**
 * API Errors
 */
export * from './errors';

/**
 * Shared API Types
 */
export type * from './types';
