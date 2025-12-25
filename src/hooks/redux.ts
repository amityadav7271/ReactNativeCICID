import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Custom hook for handling API errors
export const useApiError = () => {
  return {
    handleError: (error: any) => {
      console.error('API Error:', error);
      
      // You can add global error handling logic here
      // For example, show toast notifications, log to crash analytics, etc.
      
      if (error?.status === 401) {
        // Handle unauthorized access
        console.log('Unauthorized access - redirecting to login');
      } else if (error?.status >= 500) {
        // Handle server errors
        console.log('Server error - please try again later');
      } else if (error?.status === 404) {
        // Handle not found
        console.log('Resource not found');
      } else {
        // Handle other errors
        console.log('An error occurred:', error?.data?.message || error?.message);
      }
    },
  };
};