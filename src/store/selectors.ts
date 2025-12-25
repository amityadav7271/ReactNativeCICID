import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './index';
import { userApi } from '../services/userApi';

// Memoized selectors to prevent unnecessary re-renders
// NOTE: These selectors will only return data if the query has been executed

// Select current user with memoization (only if query was executed)
export const selectCurrentUser = createSelector(
  (state: RootState) => {
    const queryState = state.api.queries[`getCurrentUser(undefined)`];
    return queryState?.data;
  },
  (data) => data
);

// Select current user loading state
export const selectCurrentUserLoading = createSelector(
  (state: RootState) => {
    const queryState = state.api.queries[`getCurrentUser(undefined)`];
    return queryState?.status === 'pending';
  },
  (isLoading) => isLoading
);

// Select current user error state
export const selectCurrentUserError = createSelector(
  (state: RootState) => {
    const queryState = state.api.queries[`getCurrentUser(undefined)`];
    return queryState?.error;
  },
  (error) => error
);

// Factory function to create user selector by ID (only if query was executed)
export const makeSelectUserById = (userId: string) =>
  createSelector(
    (state: RootState) => {
      const queryState = state.api.queries[`getUserById("${userId}")`];
      return queryState?.data;
    },
    (data) => data
  );

// Factory function to create user loading selector by ID
export const makeSelectUserLoadingById = (userId: string) =>
  createSelector(
    (state: RootState) => {
      const queryState = state.api.queries[`getUserById("${userId}")`];
      return queryState?.status === 'pending';
    },
    (isLoading) => isLoading
  );

// Select users list with pagination info (only if query was executed)
export const selectUsersList = createSelector(
  (state: RootState) => {
    const queryState = state.api.queries[`getUsers({})`];
    const data = queryState?.data;
    return {
      users: data?.data || [],
      pagination: data ? {
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
      } : null,
      isLoading: queryState?.status === 'pending',
      error: queryState?.error,
    };
  },
  (usersList) => usersList
);

// Select only user names for dropdown/picker components
export const selectUserNames = createSelector(
  selectUsersList,
  (usersList) => 
    usersList.users.map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
    }))
);

// Select users count
export const selectUsersCount = createSelector(
  selectUsersList,
  (usersList) => usersList.pagination?.total || 0
);

// Check if any user mutation is in progress
export const selectIsUserMutating = createSelector(
  (state: RootState) => state.api.mutations,
  (mutations) => {
    return Object.values(mutations).some(
      (mutation) => 
        mutation?.status === 'pending' && 
        (mutation.endpointName?.includes('User') || mutation.endpointName?.includes('user'))
    );
  }
);