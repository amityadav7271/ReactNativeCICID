import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import Config from 'react-native-config';

// Types for retry configuration
interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition?: (error: AxiosError) => boolean;
}

// Default retry configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  retries: 3,
  retryDelay: 1000,
  retryCondition: (error: AxiosError) => {
    // Retry on network errors or 5xx server errors
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  },
};

// Exponential backoff delay calculation
const calculateRetryDelay = (retryNumber: number, baseDelay: number): number => {
  return Math.min(baseDelay * Math.pow(2, retryNumber), 30000); // Max 30 seconds
};

// Create the main Axios instance
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: Config.API_BASE_URL || 'https://api.example.com',
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Request interceptor for adding auth tokens and logging
  instance.interceptors.request.use(
    (config) => {
      // Add auth token if available (you can get this from AsyncStorage or Redux store)
      // const token = getAuthToken();
      // if (token) {
      //   config.headers.Authorization = `Bearer ${token}`;
      // }
      
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => {
      console.error('❌ Request Error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for handling responses and errors
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
      return response;
    },
    async (error: AxiosError) => {
      const config = error.config as AxiosRequestConfig & { _retry?: boolean; _retryCount?: number };
      
      console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.message);

      // Handle 401 unauthorized - redirect to login
      if (error.response?.status === 401) {
        // Handle token refresh or redirect to login
        // You can dispatch a logout action here
        console.log('🔒 Unauthorized - redirecting to login');
      }

      // Retry logic with exponential backoff
      const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...(config as any)?._retryConfig };
      
      if (
        config &&
        !config._retry &&
        (config._retryCount || 0) < retryConfig.retries &&
        retryConfig.retryCondition?.(error)
      ) {
        config._retry = true;
        config._retryCount = (config._retryCount || 0) + 1;
        
        const delay = calculateRetryDelay(config._retryCount - 1, retryConfig.retryDelay);
        
        console.log(`🔄 Retrying request (${config._retryCount}/${retryConfig.retries}) after ${delay}ms`);
        
        await new Promise(resolve => setTimeout(() => resolve(undefined), delay));
        
        config._retry = false;
        return instance(config);
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Create and export the configured Axios instance
export const axiosInstance = createAxiosInstance();

// Export types for use in other files
export type { RetryConfig };
export { DEFAULT_RETRY_CONFIG, calculateRetryDelay };