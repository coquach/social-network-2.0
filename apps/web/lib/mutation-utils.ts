import { toast } from 'sonner';

/**
 * Error handling utility for React Query mutations
 * Provides consistent error logging and user feedback
 */

export interface MutationErrorOptions {
  /** Custom error message to show to user. If not provided, extracts from error object */
  userMessage?: string;
  /** Whether to log error to console (default: true) */
  logError?: boolean;
  /** Custom action to perform on error */
  onError?: (error: unknown) => void;
}

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
  
  return 'Đã có lỗi xảy ra. Vui lòng thử lại.';
}

/**
 * Standard mutation error handler
 * Logs errors and shows user-friendly toast messages
 * 
 * @example
 * ```tsx
 * useMutation({
 *   mutationFn: createPost,
 *   onError: handleMutationError({ 
 *     userMessage: 'Không thể tạo bài viết'
 *   })
 * })
 * ```
 */
export function handleMutationError(options: MutationErrorOptions = {}) {
  const { 
    userMessage, 
    logError = true, 
    onError: customOnError 
  } = options;

  return (error: unknown) => {
    // Log error for debugging
    if (logError) {
      console.error('[Mutation Error]:', error);
    }

    // Show user-friendly error message
    const message = userMessage || getErrorMessage(error);
    toast.error(message);

    // Execute custom error handler if provided
    if (customOnError) {
      customOnError(error);
    }
  };
}

/**
 * Creates a mutation success handler with toast
 * 
 * @example
 * ```tsx
 * useMutation({
 *   mutationFn: deletePost,
 *   onSuccess: handleMutationSuccess('Xóa bài viết thành công')
 * })
 * ```
 */
export function handleMutationSuccess<TData = unknown>(
  message: string,
  onSuccess?: (data: TData) => void
) {
  return (data: TData) => {
    toast.success(message);
    if (onSuccess) {
      onSuccess(data);
    }
  };
}

/**
 * Query error handler that provides retry mechanism
 */
export interface QueryErrorOptions {
  /** Error message to show */
  message?: string;
  /** Whether to show error toast (default: true) */
  showToast?: boolean;
  /** Whether to log error (default: true in development) */
  logError?: boolean;
}

export function handleQueryError(options: QueryErrorOptions = {}) {
  const {
    message,
    showToast = true,
    logError = process.env.NODE_ENV === 'development'
  } = options;

  return (error: Error) => {
    if (logError) {
      console.error('[Query Error]:', error);
    }

    if (showToast) {
      const errorMessage = message || getErrorMessage(error);
      toast.error(errorMessage);
    }
  };
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
      error.message.includes('Unauthorized') ||
      error.message.includes('401')
    );
  }
  return false;
}
