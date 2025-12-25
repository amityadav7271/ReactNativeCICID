import { createApi, BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { AxiosRequestConfig, AxiosError } from 'axios';
import { axiosInstance } from './axiosConfig';

// Define the base query function using Axios
const axiosBaseQuery = (
  { baseUrl }: { baseUrl: string } = { baseUrl: '' }
): BaseQueryFn<
  {
    url: string;
    method?: AxiosRequestConfig['method'];
    data?: AxiosRequestConfig['data'];
    params?: AxiosRequestConfig['params'];
    headers?: AxiosRequestConfig['headers'];
  },
  unknown,
  unknown
> =>
async ({ url, method = 'GET', data, params, headers }) => {
  try {
    const result = await axiosInstance({
      url: baseUrl + url,
      method,
      data,
      params,
      headers,
    });
    
    return { data: result.data };
  } catch (axiosError) {
    const err = axiosError as AxiosError;
    return {
      error: {
        status: err.response?.status,
        data: err.response?.data || err.message,
        message: err.message,
      },
    };
  }
};

// Create the base API
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  // Define tag types for cache invalidation
  tagTypes: ['User', 'Profile', 'Settings'],
  // Keep unused data for 60 seconds
  keepUnusedDataFor: 60,
  // Disable automatic refetching - only refetch when explicitly called
  refetchOnMountOrArgChange: false,
  // Disable refetch on focus
  refetchOnFocus: false,
  // Disable refetch on reconnect
  refetchOnReconnect: false,
  endpoints: () => ({}),
});

// Export hooks for usage in functional components
export const {
  // These will be generated automatically when we add endpoints
} = baseApi;