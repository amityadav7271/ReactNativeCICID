import { useState, useCallback } from 'react';

// Hook for manual query control
export const useManualQuery = <T>(
  queryHook: (args: any, options: any) => T,
  args: any = undefined
) => {
  const [shouldFetch, setShouldFetch] = useState(false);

  // Use the query hook with skip condition
  const queryResult = queryHook(args, {
    skip: !shouldFetch,
  });

  // Manual trigger function
  const trigger = useCallback(() => {
    setShouldFetch(true);
  }, []);

  // Reset function to stop future automatic refetches
  const reset = useCallback(() => {
    setShouldFetch(false);
  }, []);

  return {
    ...queryResult,
    trigger,
    reset,
    isTriggered: shouldFetch,
  };
};

// Hook for lazy queries that only run when explicitly called
export const useLazyQuery = <T>(
  queryHook: (args: any, options: any) => T
) => {
  const [queryArgs, setQueryArgs] = useState<any>(null);
  const [shouldFetch, setShouldFetch] = useState(false);

  // Use the query hook with skip condition
  const queryResult = queryHook(queryArgs, {
    skip: !shouldFetch || queryArgs === null,
  });

  // Trigger function that accepts arguments
  const trigger = useCallback((args: any) => {
    setQueryArgs(args);
    setShouldFetch(true);
  }, []);

  // Reset function
  const reset = useCallback(() => {
    setShouldFetch(false);
    setQueryArgs(null);
  }, []);

  return {
    ...queryResult,
    trigger,
    reset,
    isTriggered: shouldFetch,
  };
};