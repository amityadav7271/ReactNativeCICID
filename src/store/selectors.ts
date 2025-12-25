import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './index';
import { userApi } from '../services/userApi';

// Memoized selectors to prevent unnecessary re-renders

// Select current user with memoization
export const selectCurrentUser = createSelector(
  (state: RootState) => userApi.endpoints.getCurrentUser.select()(state),
  (result) => result.data
);

// Select current user loading state
export const selectCurrentUserLoading = createSelector(
  (state: RootState) => userApi.endpoints.getCurrentUser.select()(state),
  (result) => result.isLoading
);

// Select current user error state
export const selectCurrentUserError = createSelector(
  (state: RootState) => userApi.endpoints.getCurrentUser.select()(state),
  (result) => result.error
);

// Factory function to create user selector by ID
export const makeSelectUserById = (userId: string) =>
  createSelector(
    (state: RootState) => userApi.endpoints.getUserById.select(userId)(state),
    (result) => result.data
  );

// Factory function to create user loading selector by ID
export const makeSelectUserLoadingById = (userId: string) =>
  createSelector(
    (state: RootState) => userApi.endpoints.getUserById.select(userId)(state),
    (result) => result.isLoading
  );

// Select users list with pagination info
export const selectUsersList = createSelector(
  (state: RootState) => userApi.endpoints.getUsers.select({})(state),
  (result) => ({
    users: result.data?.data || [],
    pagination: result.data ? {
      total: result.data.total,
      page: result.data.page,
      limit: result.data.limit,
      totalPages: result.data.totalPages,
    } : null,
    isLoading: result.isLoading,
    error: result.error,
  })
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