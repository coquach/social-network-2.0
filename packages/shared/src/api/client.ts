import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import type { CursorPageResponse } from '../types/common.types';

type LegacyCursorPageResponse<T> = {
  data: T[];
  nextCursor?: string | null;
  hasMore: boolean;
};

type CursorPageApiResponse<T> =
  | CursorPageResponse<T>
  | LegacyCursorPageResponse<T>;

const normalizeCursorPageResponse = <T>(
  response: CursorPageApiResponse<T>
): CursorPageResponse<T> => {
  if ('hasNextPage' in response) {
    return response;
  }

  return {
    data: response.data,
    nextCursor: response.nextCursor ?? null,
    hasNextPage: response.hasMore,
  };
};

/**
 * Configuration for initializing the API client
 */
export interface ApiConfig {
  baseURL: string;
  timeout?: number;
  getAuthToken?: () => Promise<string | null>;
}

/**
 * Platform-agnostic API client using Axios
 * Handles authentication, interceptors, and error handling
 */
export class ApiClient {
  private client: AxiosInstance;
  private getAuthToken?: () => Promise<string | null>;

  constructor(config: ApiConfig) {
    this.getAuthToken = config.getAuthToken;

    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '1',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors() {
    // Request interceptor - inject auth token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        if (this.getAuthToken) {
          const token = await this.getAuthToken();
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors globally
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const method = error.config?.method?.toUpperCase() ?? 'UNKNOWN';
        const requestUrl = error.config?.url ?? 'unknown-url';
        const status = error.response?.status;
        const responseData = error.response?.data;

        if (error.response?.status === 401) {
          // Token expired or invalid - platform will handle logout
          console.error(`[API] ${method} ${requestUrl} -> 401 Unauthorized`);
        }

        if (error.response?.status === 500) {
          console.error(`[API] ${method} ${requestUrl} -> 500 Server error`);
        }

        console.error('[API] Request failed', {
          method,
          url: requestUrl,
          status,
          responseData,
        });

        return Promise.reject(error);
      }
    );
  }

  /**
   * HTTP GET request
   */
  async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  /**
   * HTTP GET request for cursor-paginated responses.
   * Normalizes legacy `hasMore` payloads into `hasNextPage`.
   */
  async getCursorPage<T>(url: string, config?: any): Promise<CursorPageResponse<T>> {
    const response = await this.get<CursorPageApiResponse<T>>(url, config);
    return normalizeCursorPageResponse(response);
  }

  /**
   * HTTP POST request
   */
  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  /**
   * HTTP PUT request
   */
  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  /**
   * HTTP PATCH request
   */
  async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * HTTP DELETE request
   */
  async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  /**
   * Get the raw Axios instance for advanced usage
   */
  getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

// Singleton instance
let apiClientInstance: ApiClient | null = null;

/**
 * Initialize the API client with platform-specific configuration
 * Must be called once at app startup
 */
export const initializeApiClient = (config: ApiConfig): ApiClient => {
  apiClientInstance = new ApiClient(config);
  return apiClientInstance;
};

/**
 * Get the initialized API client instance
 * Throws error if not initialized
 */
export const getApiClient = (): ApiClient => {
  if (!apiClientInstance) {
    throw new Error(
      'API client not initialized. Call initializeApiClient() first.'
    );
  }
  return apiClientInstance;
};

/**
 * Check if API client is initialized
 */
export const isApiClientInitialized = (): boolean => {
  return apiClientInstance !== null;
};
