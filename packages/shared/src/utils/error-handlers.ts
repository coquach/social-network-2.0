/**
 * Platform-agnostic error handling utilities
 * Provides consistent error extraction and categorization
 * 
 * Note: UI-specific features (like toast notifications) should be handled
 * by the platform (web/mobile) layer.
 */

/**
 * Extracts error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'An error occurred. Please try again.';
}

/**
 * Checks if error is a network/fetch error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('NetworkError') ||
      error.name === 'NetworkError'
    );
  }
  return false;
}

/**
 * Checks if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('Token') ||
      error.message.includes('auth') ||
      error.message.includes('unauthorized') ||
      error.message.includes('401')
    );
  }
  return false;
}

/**
 * Checks if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('validation') ||
      error.message.includes('invalid') ||
      error.message.includes('required') ||
      error.message.includes('400')
    );
  }
  return false;
}

/**
 * Checks if error is a not found error
 */
export function isNotFoundError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('not found') ||
      error.message.includes('404')
    );
  }
  return false;
}

/**
 * Checks if error is a server error
 */
export function isServerError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('500') ||
      error.message.includes('503') ||
      error.message.includes('server error')
    );
  }
  return false;
}

/**
 * Categorizes error type for better handling
 */
export type ErrorCategory = 
  | 'network'
  | 'auth'
  | 'validation'
  | 'notFound'
  | 'server'
  | 'unknown';

export function categorizeError(error: unknown): ErrorCategory {
  if (isNetworkError(error)) return 'network';
  if (isAuthError(error)) return 'auth';
  if (isValidationError(error)) return 'validation';
  if (isNotFoundError(error)) return 'notFound';
  if (isServerError(error)) return 'server';
  return 'unknown';
}

/**
 * Creates a standardized error object
 */
export interface StandardError {
  message: string;
  category: ErrorCategory;
  originalError: unknown;
}

export function createStandardError(error: unknown): StandardError {
  return {
    message: getErrorMessage(error),
    category: categorizeError(error),
    originalError: error,
  };
}
