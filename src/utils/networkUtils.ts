import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

// Network status interface
export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
  details: any;
}

// Custom hook for network status monitoring
export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: null,
    type: 'unknown',
    details: null,
  });

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        details: state.details,
      });
    });

    // Get initial network state
    NetInfo.fetch().then(state => {
      setNetworkStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        details: state.details,
      });
    });

    return () => unsubscribe();
  }, []);

  return networkStatus;
};

// Utility function to check if network error should trigger retry
export const shouldRetryOnNetworkError = (error: any): boolean => {
  // Network-related error codes that should trigger retry
  const retryableNetworkCodes = [
    'NETWORK_ERROR',
    'TIMEOUT',
    'CONNECTION_ERROR',
    'ECONNABORTED',
    'ENOTFOUND',
    'ECONNRESET',
    'ECONNREFUSED',
  ];

  if (error?.code && retryableNetworkCodes.includes(error.code)) {
    return true;
  }

  if (error?.message) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('connection') ||
      message.includes('internet')
    );
  }

  return false;
};

// Utility function to get user-friendly network error message
export const getNetworkErrorMessage = (error: any): string => {
  if (!error) return 'An unknown error occurred';

  // Check for specific network error types
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
    return 'Please check your internet connection and try again';
  }

  if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
    return 'Request timed out. Please try again';
  }

  if (error.code === 'ENOTFOUND' || error.message?.includes('ENOTFOUND')) {
    return 'Unable to connect to server. Please try again later';
  }

  if (error.status === 0 || error.status === undefined) {
    return 'No internet connection. Please check your network settings';
  }

  // HTTP status code based messages
  if (error.status >= 500) {
    return 'Server error. Please try again later';
  }

  if (error.status === 404) {
    return 'The requested resource was not found';
  }

  if (error.status === 401) {
    return 'Authentication required. Please log in again';
  }

  if (error.status === 403) {
    return 'You do not have permission to access this resource';
  }

  if (error.status >= 400) {
    return error.data?.message || 'Bad request. Please check your input';
  }

  return error.message || 'An unexpected error occurred';
};