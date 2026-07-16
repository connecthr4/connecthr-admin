import { apiConfig } from '../config/api';
import { useAuthStore } from '@/src/store/auth';
import type { ApiRequestOptions, RequestBody } from './types';

import {
  ApiError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NetworkError,
  NotFoundError,
  RequestTimeoutError,
  TooManyRequestsError,
  UnauthorizedError,
  UnknownApiError,
  ValidationError,
} from './errors';

const ERROR_MAP = {
  400: BadRequestError,
  401: UnauthorizedError,
  403: ForbiddenError,
  404: NotFoundError,
  409: ConflictError,
  422: ValidationError,
  429: TooManyRequestsError,
} as const;

type ErrorStatus = keyof typeof ERROR_MAP;

export class ApiClient {
  private readonly baseUrl: string;

  private readonly timeout: number;

  private readonly defaultHeaders: HeadersInit;

  constructor() {
    this.baseUrl = apiConfig.baseUrl;
    this.timeout = apiConfig.timeout;
    this.defaultHeaders = apiConfig.headers;
  }

  /**
   * Builds request URL with query parameters.
   */
  private buildUrl(endpoint: string, query?: ApiRequestOptions['query']): string {
    if (!query) {
      return `${this.baseUrl}${endpoint}`;
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);

    Object.entries(query).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item !== null && item !== undefined) {
            url.searchParams.append(key, String(item));
          }
        });

        return;
      }

      url.searchParams.append(key, String(value));
    });

    return url.toString();
  }

  /**
   * Prepare request body.
   */
  private prepareBody(body?: RequestBody): BodyInit | undefined {
    if (body === undefined || body === null) {
      return undefined;
    }

    if (
      body instanceof FormData ||
      body instanceof Blob ||
      body instanceof URLSearchParams ||
      body instanceof ArrayBuffer ||
      typeof body === 'string'
    ) {
      return body;
    }

    return JSON.stringify(body);
  }

  /**
   * Build request headers.
   */
  private buildHeaders(headers?: HeadersInit, body?: RequestBody): HeadersInit {
    const finalHeaders = new Headers({
      ...this.defaultHeaders,
      ...headers,
    });

    /**
     * Browser automatically sets multipart boundary.
     */
    if (body instanceof FormData || body instanceof Blob) {
      finalHeaders.delete('Content-Type');
    }

    const accessToken = useAuthStore.getState().accessToken;

    if (accessToken && !finalHeaders.has('Authorization')) {
      finalHeaders.set('Authorization', `Bearer ${accessToken}`);
    }

    return finalHeaders;
  }

  /**
   * Generic request method
   */
  private async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const { query, timeout: requestTimeout, body, ...fetchOptions } = options;

    const controller = new AbortController();

    const timeout = requestTimeout ?? this.timeout;

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      const url = this.buildUrl(endpoint, query);

      const response = await fetch(url, {
        ...fetchOptions,

        signal: controller.signal,

        headers: this.buildHeaders(fetchOptions.headers, body),

        body: this.prepareBody(body),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw await this.createApiError(response);
      }

      /**
       * No Content
       */
      if (response.status === 204) {
        return undefined as T;
      }

      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        return (await response.json()) as T;
      }

      return (await response.text()) as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new RequestTimeoutError();
      }

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof TypeError) {
        throw new NetworkError(error.message);
      }

      throw new UnknownApiError(error instanceof Error ? error.message : 'Unexpected API error');
    }
  }

  /**
   * Maps HTTP response to custom API errors.
   */
  private async createApiError(response: Response): Promise<ApiError> {
    let payload: Record<string, unknown> = {};

    try {
      payload = await response.json();
    } catch {
      // Ignore JSON parsing errors
    }

    const message = (payload.message as string) ?? (payload.detail as string) ?? response.statusText;

    const code = payload.code as string | undefined;

    // Preserve the full payload when `details` is not provided so callers
    // can access fields like `success` that may be present at the top-level
    // of the API response (e.g. { success: false, message: '...' }).
    const details = payload.details ?? payload;

    const ErrorConstructor = ERROR_MAP[response.status as ErrorStatus] as
      | (new (message?: string, code?: string, details?: unknown) => ApiError)
      | undefined;

    if (ErrorConstructor) {
      if (response.status === 422) {
        return new ValidationError(message, details);
      }

      return new ErrorConstructor(message, code, details);
    }

    if (response.status >= 500) {
      return new InternalServerError(message, code, details);
    }

    return new UnknownApiError(message, details);
  }

  /**
   * GET
   */
  public get<T>(endpoint: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * POST
   */
  public post<T, B extends RequestBody = RequestBody>(
    endpoint: string,
    body?: B,
    options?: Omit<ApiRequestOptions, 'method' | 'body'>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body,
    });
  }

  /**
   * PUT
   */
  public put<T, B extends RequestBody = RequestBody>(
    endpoint: string,
    body?: B,
    options?: Omit<ApiRequestOptions, 'method' | 'body'>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body,
    });
  }

  /**
   * PATCH
   */
  public patch<T, B extends RequestBody = RequestBody>(
    endpoint: string,
    body?: B,
    options?: Omit<ApiRequestOptions, 'method' | 'body'>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body,
    });
  }

  /**
   * DELETE
   */
  public delete<T>(endpoint: string, options?: Omit<ApiRequestOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

/**
 * Singleton API Client
 */
export const apiClient = new ApiClient();
