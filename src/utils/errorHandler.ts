/**
 * Error Handling Utilities
 *
 * Centralized error handling for consistent user experience
 */

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Extract error message from various error types
 * @param error - Error object of unknown type
 * @param context - Optional context for debugging
 * @returns User-friendly error message
 */
export function getErrorMessage(error: unknown, context?: string): string {
  const prefix = context ? `${context}: ` : '';

  if (error instanceof AppError) {
    return `${prefix}${error.message}`;
  }

  if (error instanceof Error) {
    return `${prefix}${error.message}`;
  }

  if (typeof error === 'string') {
    return `${prefix}${error}`;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return `${prefix}${String(error.message)}`;
  }

  return `${prefix}An unexpected error occurred`;
}

/**
 * Log error to console with context
 * @param error - Error to log
 * @param context - Context string
 */
export function logError(error: unknown, context?: string): void {
  console.error(
    `[ERROR]${context ? ` ${context}` : ''}:`,
    error
  );

  if (error instanceof Error && error.stack) {
    console.error('Stack trace:', error.stack);
  }
}

/**
 * Handle async errors with try-catch wrapper
 * @param fn - Async function to wrap
 * @param context - Context for error logging
 * @returns Wrapped function that handles errors
 */
export function handleAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): (...args: Parameters<T>) => Promise<ReturnType<T> | null> {
  return async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error, context);
      return null;
    }
  };
}

/**
 * Validate required fields in an object
 * @param data - Object to validate
 * @param requiredFields - Array of required field names
 * @throws AppError if validation fails
 */
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): void {
  const missingFields = requiredFields.filter(field => !data[field]);

  if (missingFields.length > 0) {
    throw new AppError(
      `Missing required fields: ${missingFields.join(', ')}`,
      'VALIDATION_ERROR',
      400
    );
  }
}

/**
 * Handle localStorage quota exceeded error
 * @param key - localStorage key being set
 * @param data - Data being stored
 */
export function handleStorageQuotaError(key: string, data: any): void {
  console.error('localStorage quota exceeded for key:', key);
  console.warn('Attempting to free up space...');

  try {
    // Try to remove old activity logs or notifications
    const oldKeys = ['spendy_activitylog', 'spendy_notifications'];

    for (const oldKey of oldKeys) {
      if (oldKey !== key) {
        const oldData = localStorage.getItem(oldKey);
        if (oldData) {
          const parsed = JSON.parse(oldData);
          if (Array.isArray(parsed) && parsed.length > 100) {
            // Keep only recent 50 items
            const trimmed = parsed.slice(0, 50);
            localStorage.setItem(oldKey, JSON.stringify(trimmed));
            console.log(`Trimmed ${oldKey} from ${parsed.length} to 50 items`);
          }
        }
      }
    }

    // Try storing again
    localStorage.setItem(key, JSON.stringify(data));
    console.log('Successfully stored data after cleanup');

  } catch (retryError) {
    throw new AppError(
      'Storage quota exceeded. Please clear some data or use a different browser.',
      'STORAGE_QUOTA_EXCEEDED',
      507
    );
  }
}

/**
 * Safe localStorage getter with error handling
 * @param key - localStorage key
 * @param defaultValue - Default value if key doesn't exist
 * @returns Parsed data or default value
 */
export function safeGetLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;

    return JSON.parse(item) as T;
  } catch (error) {
    logError(error, `Reading localStorage key: ${key}`);
    return defaultValue;
  }
}

/**
 * Safe localStorage setter with error handling
 * @param key - localStorage key
 * @param data - Data to store
 * @returns True if successful, false otherwise
 */
export function safeSetLocalStorage(key: string, data: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      handleStorageQuotaError(key, data);
      return true;
    }

    logError(error, `Writing to localStorage key: ${key}`);
    return false;
  }
}

/**
 * Create a user-friendly error message based on error code
 * @param code - Error code
 * @returns User-friendly message
 */
export function getErrorMessageByCode(code: string): string {
  const errorMessages: Record<string, string> = {
    'VALIDATION_ERROR': 'Please check your input and try again.',
    'AUTH_ERROR': 'Authentication failed. Please log in again.',
    'NOT_FOUND': 'The requested item was not found.',
    'PERMISSION_DENIED': 'You do not have permission to perform this action.',
    'STORAGE_QUOTA_EXCEEDED': 'Storage limit reached. Please clear some data.',
    'NETWORK_ERROR': 'Network error. Please check your connection.',
    'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again.'
  };

  return errorMessages[code] || errorMessages['UNKNOWN_ERROR'];
}
