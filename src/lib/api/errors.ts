/**
 * Base API Error
 *
 * All custom API errors should extend this class.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode: number, code?: string, details?: unknown) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture stack trace (Node.js)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * 400 Bad Request
 */
export class BadRequestError extends ApiError {
  constructor(message = 'Bad Request', code?: string, details?: unknown) {
    super(message, 400, code, details);
  }
}

/**
 * 401 Unauthorized
 */
export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized', code?: string, details?: unknown) {
    super(message, 401, code, details);
  }
}

/**
 * 403 Forbidden
 */
export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden', code?: string, details?: unknown) {
    super(message, 403, code, details);
  }
}

/**
 * 404 Not Found
 */
export class NotFoundError extends ApiError {
  constructor(message = 'Resource Not Found', code?: string, details?: unknown) {
    super(message, 404, code, details);
  }
}

/**
 * 409 Conflict
 */
export class ConflictError extends ApiError {
  constructor(message = 'Conflict', code?: string, details?: unknown) {
    super(message, 409, code, details);
  }
}

/**
 * 422 Validation Error
 */
export class ValidationError extends ApiError {
  constructor(message = 'Validation Failed', details?: unknown) {
    super(message, 422, 'VALIDATION_ERROR', details);
  }
}

/**
 * 429 Too Many Requests
 */
export class TooManyRequestsError extends ApiError {
  constructor(message = 'Too Many Requests', code?: string, details?: unknown) {
    super(message, 429, code, details);
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends ApiError {
  constructor(message = 'Internal Server Error', code?: string, details?: unknown) {
    super(message, 500, code, details);
  }
}

/**
 * Request Timeout
 */
export class RequestTimeoutError extends ApiError {
  constructor(message = 'Request Timeout', details?: unknown) {
    super(message, 408, 'REQUEST_TIMEOUT', details);
  }
}

/**
 * Network Error
 */
export class NetworkError extends ApiError {
  constructor(message = 'Network Error', details?: unknown) {
    super(message, 0, 'NETWORK_ERROR', details);
  }
}

/**
 * Unknown Error
 */
export class UnknownApiError extends ApiError {
  constructor(message = 'Unknown API Error', details?: unknown) {
    super(message, 500, 'UNKNOWN_ERROR', details);
  }
}
