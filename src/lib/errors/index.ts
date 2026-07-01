/** Base class for application errors with stable codes for API responses. */
export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    options: {
      code: string;
      statusCode?: number;
      details?: Record<string, unknown>;
      cause?: unknown;
    },
  ) {
    super(message, { cause: options.cause });
    this.name = this.constructor.name;
    this.code = options.code;
    this.statusCode = options.statusCode ?? 500;
    this.details = options.details;
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, {
      code: "CONFIGURATION_ERROR",
      statusCode: 500,
      details,
    });
  }
}

export class CacheConnectionError extends AppError {
  constructor(message: string, cause?: unknown) {
    super(message, {
      code: "CACHE_CONNECTION_ERROR",
      statusCode: 503,
      cause,
    });
  }
}

export class CacheOperationError extends AppError {
  constructor(message: string, cause?: unknown) {
    super(message, {
      code: "CACHE_OPERATION_ERROR",
      statusCode: 500,
      cause,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, {
      code: "NOT_FOUND",
      statusCode: 404,
    });
  }
}

/** Serialize an AppError for JSON API responses. */
export function serializeAppError(error: AppError): {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
} {
  return {
    error: {
      code: error.code,
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    },
  };
}
