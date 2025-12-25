import { useEffect, useRef, useMemo } from 'react';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

// Generic hook for optimized query handling with memory management
export const useOptimizedQuery = <T>(
  queryResult: {
    data?: T;
    error?: FetchBaseQueryError | SerializedError;
    isLoading: boolean;
    isFetching: boolean;
    isSuccess: boolean;
    isError: boolean;
    refetch: () => void;
  },
  options: {
    // Skip query if condition is met
    skip?: boolean;
    // Refetch interval in milliseconds
    pollingInterval?: number;
    // Custom error handler
    onError?: (error: FetchBaseQueryError | SerializedError) => void;
    // Custom success handler
    onSuccess?: (data: T) => void;
    // Memory optimization - clear data when component unmounts
    clearOnUnmount?: boolean;
  } = {}
) => {
  const {
    skip = false,
    pollingInterval,
    onError,
    onSuccess,
    clearOnUnmount = false,
  } = options;

  const intervalRef = useRef<NodeJS.Timeout>();
  const previousDataRef = useRef<T>();
  const mountedRef = useRef(true);

  // Handle polling
  useEffect(() => {
    if (pollingInterval && !skip && !queryResult.isLoading) {
      intervalRef.current = setInterval(() => {
        if (mountedRef.current) {
          queryResult.refetch();
        }
      }, pollingInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [pollingInterval, skip, queryResult.isLoading, queryResult.refetch]);

  // Handle success callback
  useEffect(() => {
    if (queryResult.isSuccess && queryResult.data && onSuccess) {
      // Only call onSuccess if data actually changed
      if (previousDataRef.current !== queryResult.data) {
        onSuccess(queryResult.data);
        previousDataRef.current = queryResult.data;
      }
    }
  }, [queryResult.isSuccess, queryResult.data, onSuccess]);

  // Handle error callback
  useEffect(() => {
    if (queryResult.isError && queryResult.error && onError) {
      onError(queryResult.error);
    }
  }, [queryResult.isError, queryResult.error, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (clearOnUnmount) {
        // Clear previous data reference to help with garbage collection
        previousDataRef.current = undefined;
      }
    };
  }, [clearOnUnmount]);

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(() => ({
    data: queryResult.data,
    error: queryResult.error,
    isLoading: queryResult.isLoading,
    isFetching: queryResult.isFetching,
    isSuccess: queryResult.isSuccess,
    isError: queryResult.isError,
    refetch: queryResult.refetch,
  }), [
    queryResult.data,
    queryResult.error,
    queryResult.isLoading,
    queryResult.isFetching,
    queryResult.isSuccess,
    queryResult.isError,
    queryResult.refetch,
  ]);
};

// Hook for handling mutations with optimistic updates and error recovery
export const useOptimizedMutation = <T, U>(
  mutationTrigger: (arg: U) => Promise<{ data?: T; error?: any }>,
  options: {
    onSuccess?: (data: T, variables: U) => void;
    onError?: (error: any, variables: U) => void;
    onSettled?: (data: T | undefined, error: any | undefined, variables: U) => void;
    // Optimistic update function
    optimisticUpdate?: (variables: U) => void;
    // Rollback function for failed optimistic updates
    rollback?: (variables: U) => void;
  } = {}
) => {
  const {
    onSuccess,
    onError,
    onSettled,
    optimisticUpdate,
    rollback,
  } = options;

  const executeMutation = async (variables: U) => {
    try {
      // Apply optimistic update if provided
      if (optimisticUpdate) {
        optimisticUpdate(variables);
      }

      const result = await mutationTrigger(variables);

      if (result.error) {
        // Rollback optimistic update on error
        if (rollback) {
          rollback(variables);
        }
        
        if (onError) {
          onError(result.error, variables);
        }
        
        if (onSettled) {
          onSettled(undefined, result.error, variables);
        }
        
        return { error: result.error };
      }

      if (onSuccess && result.data) {
        onSuccess(result.data, variables);
      }
      
      if (onSettled) {
        onSettled(result.data, undefined, variables);
      }

      return { data: result.data };
    } catch (error) {
      // Rollback optimistic update on error
      if (rollback) {
        rollback(variables);
      }
      
      if (onError) {
        onError(error, variables);
      }
      
      if (onSettled) {
        onSettled(undefined, error, variables);
      }
      
      return { error };
    }
  };

  return { mutate: executeMutation };
};