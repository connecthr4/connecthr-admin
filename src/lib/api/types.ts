/**
 * ============================================================================
 * Generic API Types
 * ============================================================================
 */

/**
 * Supported HTTP methods.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

/**
 * Common query parameter values.
 */
export type QueryParam = string | number | boolean | null | undefined;

/**
 * Query parameters.
 */
export type QueryParams = Record<string, QueryParam | QueryParam[]>;

/**
 * ============================================================================
 * Request Types
 * ============================================================================
 */

/**
 * Generic API request options.
 */
export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  /**
   * Request body.
   */
  body?: RequestBody;

  /**
   * Query parameters.
   */
  query?: QueryParams;

  /**
   * Request timeout in milliseconds.
   */
  timeout?: number;
}

/**
 * Generic request body.
 */
export type RequestBody = object | unknown[] | FormData | Blob | string | null | undefined;

/**
 * ============================================================================
 * Response Types
 * ============================================================================
 */

/**
 * Generic API response wrapper.
 */
export interface ApiResponse<T> {
  success: boolean;

  message: string;

  data: T;

  timestamp?: string;
}

/**
 * Paginated API response.
 */
export interface PaginatedResponse<T> {
  success: boolean;

  message: string;

  data: T[];

  pagination: PaginationMetadata;
}

/**
 * Pagination metadata.
 */
export interface PaginationMetadata {
  page: number;

  limit: number;

  totalItems: number;

  totalPages: number;

  hasNextPage: boolean;

  hasPreviousPage: boolean;
}

/**
 * ============================================================================
 * Error Types
 * ============================================================================
 */

/**
 * Validation error.
 */
export interface ValidationErrorItem {
  field: string;

  message: string;
}

/**
 * Generic API error response.
 */
export interface ApiErrorResponse {
  statusCode: number;

  message: string;

  error?: string;

  code?: string;

  details?: unknown;

  timestamp?: string;

  path?: string;

  validationErrors?: ValidationErrorItem[];
}

/**
 * ============================================================================
 * Authentication Types
 * ============================================================================
 */

/**
 * JWT tokens.
 */
export interface AuthTokens {
  accessToken: string;

  refreshToken?: string;
}

/**
 * Refresh token response.
 */
export interface RefreshTokenResponse {
  success: boolean;

  message: string;

  data: {
    accessToken: string;
  };
}

/**
 * ============================================================================
 * Utility Types
 * ============================================================================
 */

/**
 * Nullable type.
 */
export type Nullable<T> = T | null;

/**
 * Optional type.
 */
export type Optional<T> = T | undefined;

/**
 * Identifier.
 */
export type Identifier = string;

/**
 * Generic dictionary.
 */
export type Dictionary<T = unknown> = Record<string, T>;
