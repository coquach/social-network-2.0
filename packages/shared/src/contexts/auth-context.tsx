/**
 * Auth Context for @repo/shared
 * 
 * Platform-agnostic auth context that provides user info to hooks.
 * 
 * Note: Token management is handled by API client interceptor (see initializeApiClient).
 * Hooks only need userId and isAuthenticated for UI logic and optimistic updates.
 */

import { createContext, useContext, ReactNode } from 'react';

export interface AuthContextValue {
  /**
   * Current user ID
   * Returns null if not authenticated
   */
  userId: string | null;
  
  /**
   * Whether the user is authenticated
   */
  isAuthenticated: boolean;
  
  /**
   * DEPRECATED: Use interceptor-based auth instead
   * This is kept for backward compatibility but should not be used in new code
   * The API client interceptor handles token injection automatically
   */
  getToken?: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
  value: AuthContextValue;
}

/**
 * Auth Provider component
 * Wrap your app with this to provide authentication context
 * 
 * @example
 * // Web (with Clerk + interceptor)
 * const { userId, isLoaded } = useAuth(); // Clerk
 * 
 * // In ApiClientProvider (separate):
 * initializeApiClient({ getAuthToken: () => clerk.getToken() });
 * 
 * // In This Provider:
 * <AuthProvider value={{ userId, isAuthenticated: isLoaded && !!userId }}>
 *   <App />
 * </AuthProvider>
 * 
 * // Mobile (with custom auth + interceptor)
 * const { userId } = useCustomAuth();
 * 
 * // In ApiClientProvider:
 * initializeApiClient({ getAuthToken: () => customAuth.getToken() });
 * 
 * // In This Provider:
 * <AuthProvider value={{ userId, isAuthenticated: !!userId }}>
 *   <App />
 * </AuthProvider>
 * </AuthProvider>
 */
export function AuthProvider({ children, value }: AuthProviderProps) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access authentication context
 * Must be used within an AuthProvider
 * 
 * @throws Error if used outside of AuthProvider
 * @returns Auth context with userId, isAuthenticated (and deprecated getToken)
 * 
 * @example
 * // In hooks (for optimistic updates)
 * const { userId } = useAuth();
 * 
 * // Create optimistic data with current user ID
 * const optimisticMessage = {
 *   id: `temp:${Date.now()}`,
 *   content,
 *   senderId: userId!, // Use userId from context
 *   createdAt: new Date().toISOString()
 * };
 * 
 * // In components (for UI logic)
 * const { isAuthenticated } = useAuth();
 * if (!isAuthenticated) return <LoginPrompt />;
 * 
 * // Note: Don't use getToken in hooks - interceptor handles auth automatically
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error(
      'useAuth must be used within an AuthProvider. ' +
      'Make sure to wrap your app with <AuthProvider> from @repo/shared.'
    );
  }
  
  return context;
}


/**
 * Hook to get current user ID
 * Convenience hook that returns just the userId
 */
export function useUserId() {
  const { userId } = useAuth();
  return userId;
}
