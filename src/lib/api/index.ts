/**
 * ============================================================================
 * API Layer
 * ============================================================================
 *
 * Central export for the API infrastructure.
 *
 * Consumers should import from:
 *
 * import { ApiClient, ApiError, API_ENDPOINTS } from '@/lib/api';
 *
 * instead of importing individual files. Server-side callers should get an
 * instance via `getServerApiClient()` rather than constructing `ApiClient` directly.
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
