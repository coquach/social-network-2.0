'use client';

import { Component, ReactNode } from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component that catches errors in child components
 * and provides a fallback UI with retry functionality.
 */
class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for monitoring
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // In production, send to error monitoring service (e.g., Sentry)
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
      console.error('[ErrorBoundary] Production error:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      // Default fallback UI
      return (
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <div className="max-w-md w-full bg-destructive/10 border border-destructive/20 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <h2 className="text-lg font-semibold text-destructive">
                Đã có lỗi xảy ra
              </h2>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {this.state.error.message || 'Đã xảy ra lỗi không xác định'}
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error.stack && (
              <details className="mt-4">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                  Chi tiết lỗi (development only)
                </summary>
                <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-auto max-h-[200px]">
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <Button
              onClick={this.reset}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Thử lại
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * QueryErrorBoundary wraps React Query's QueryErrorResetBoundary
 * with our custom ErrorBoundary to handle query errors gracefully.
 * 
 * When used with React Query, errors in queries will be caught and
 * the reset function will also reset all queries in an error state.
 * 
 * @example
 * ```tsx
 * <QueryErrorBoundary>
 *   <MyComponent />
 * </QueryErrorBoundary>
 * ```
 * 
 * @example With custom fallback
 * ```tsx
 * <QueryErrorBoundary
 *   fallback={(error, reset) => (
 *     <div>
 *       <p>Error: {error.message}</p>
 *       <button onClick={reset}>Try again</button>
 *     </div>
 *   )}
 * >
 *   <MyComponent />
 * </QueryErrorBoundary>
 * ```
 */
export function QueryErrorBoundary({
  children,
  fallback,
  onError,
}: ErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundaryClass
          fallback={fallback}
          onError={(error, errorInfo) => {
            // Log error
            onError?.(error, errorInfo);
            
            // Reset queries on error
            reset();
          }}
        >
          {children}
        </ErrorBoundaryClass>
      )}
    </QueryErrorResetBoundary>
  );
}

/**
 * Standalone ErrorBoundary without React Query integration.
 * Use this for non-query related error handling.
 */
export { ErrorBoundaryClass as ErrorBoundary };
