/**
 * Generic API Response
 */

export interface ApiResponse<T> {
  success: boolean;

  message: string;

  data: T;
}

/**
 * API Error
 */

export interface ApiError {
  statusCode: number;

  message: string;

  error?: string;

  details?: unknown;
}
