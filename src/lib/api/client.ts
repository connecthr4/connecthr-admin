import { unstable_rethrow } from 'next/navigation';
import { apiConfig } from '../config/api';
import { API_ENDPOINTS } from './endpoints';
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

/**
 * Supplies the Authorization header and performs token refresh. Implemented
 * per execution context (e.g. server, backed by cookies) since each has a
 * different way of authenticating a refresh call.
 */
export interface ApiAuthAdapter {
  getAuthHeaderValue(): Promise<string | null>;
  refresh(): Promise<string>;
}

export class ApiClient {
  private readonly baseUrl: string;

  private readonly timeout: number;

  private readonly defaultHeaders: HeadersInit;

  private readonly authAdapter: ApiAuthAdapter;

  /**
   * Shares a single in-flight refresh call across concurrent 401s.
   */
  private refreshPromise: Promise<string> | null = null;

  constructor(authAdapter: ApiAuthAdapter) {
    this.baseUrl = apiConfig.baseUrl;
    this.timeout = apiConfig.timeout;
    this.defaultHeaders = apiConfig.headers;
    this.authAdapter = authAdapter;
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
  private async buildHeaders(headers?: HeadersInit, body?: RequestBody): Promise<HeadersInit> {
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

    const authHeader = await this.authAdapter.getAuthHeaderValue();

    if (authHeader && !finalHeaders.has('Authorization')) {
      finalHeaders.set('Authorization', authHeader);
    }

    return finalHeaders;
  }

  /**
   * Generic request method
   */
  private async request<T>(endpoint: string, options: ApiRequestOptions = {}, isRetry = false): Promise<T> {
    const { query, timeout: requestTimeout, body, ...fetchOptions } = options;

    const controller = new AbortController();

    const timeout = requestTimeout ?? this.timeout;

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      const url = this.buildUrl(endpoint, query);

      const headers = await this.buildHeaders(fetchOptions.headers, body);

      const response = await fetch(url, {
        ...fetchOptions,

        signal: controller.signal,

        headers,

        body: this.prepareBody(body),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await this.createApiError(response);

        const canRetryWithRefresh =
          error instanceof UnauthorizedError &&
          !isRetry &&
          endpoint !== API_ENDPOINTS.AUTH.REFRESH &&
          endpoint !== API_ENDPOINTS.AUTH.LOGIN;

        if (canRetryWithRefresh) {
          try {
            await this.refreshAccessToken();

            return await this.request<T>(endpoint, options, true);
          } catch {
            throw error;
          }
        }

        throw error;
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

      /*
      Next signals some of its own control flow by throwing — `redirect()`,
      `notFound()`, and a request-time API like `cookies()` reached while a
      route is being prerendered. Those are not API failures, and wrapping one
      in `UnknownApiError` below would strand it: the redirect never happens,
      or the route silently prerenders with no session instead of bailing out
      to dynamic rendering. Hand them straight back to the framework.
      */
      unstable_rethrow(error);

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
   * Refreshes the access token via the auth adapter.
   * Concurrent 401s share a single in-flight refresh call.
   */
  private async refreshAccessToken(): Promise<string> {
    if (!this.refreshPromise) {
      this.refreshPromise = this.authAdapter.refresh().finally(() => {
        this.refreshPromise = null;
      });
    }

    return this.refreshPromise;
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
