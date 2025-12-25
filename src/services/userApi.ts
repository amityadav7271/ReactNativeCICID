import { baseApi } from './baseApi';

// Types for user data
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Extend the base API with user endpoints
export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET: Fetch user by ID
    getUserById: builder.query<User, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'GET',
      }),
      // Provide tags for cache invalidation
      providesTags: (result, error, id) => [{ type: 'User', id }],
      // Transform response if needed
      transformResponse: (response: { user: User }) => response.user,
      // Keep this data for 5 minutes but don't auto-fetch
      keepUnusedDataFor: 300,
    }),

    // GET: Fetch current user profile
    getCurrentUser: builder.query<User, void>({
      query: () => ({
        url: '/users/me',
        method: 'GET',
      }),
      providesTags: ['User'],
      transformResponse: (response: { user: User }) => response.user,
      // Keep profile data for 10 minutes but don't auto-fetch
      keepUnusedDataFor: 600,
    }),

    // GET: Fetch users with pagination
    getUsers: builder.query<PaginatedResponse<User>, GetUsersParams>({
      query: (params = {}) => ({
        url: '/users',
        method: 'GET',
        params: {
          page: 1,
          limit: 10,
          ...params,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'User' as const, id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
      // Merge pages for infinite scroll
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          return newItems;
        }
        return {
          ...newItems,
          data: [...currentCache.data, ...newItems.data],
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },
    }),

    // POST: Update user profile
    updateUser: builder.mutation<User, { id: string; data: UpdateUserRequest }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        data,
      }),
      // Invalidate cache for updated user
      invalidatesTags: (result, error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
      transformResponse: (response: { user: User }) => response.user,
      // Optimistic update
      async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
        // Optimistically update the cache
        const patchResult = dispatch(
          userApi.util.updateQueryData('getUserById', id, (draft) => {
            Object.assign(draft, data);
          })
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert the optimistic update on error
          patchResult.undo();
        }
      },
    }),

    // POST: Create new user
    createUser: builder.mutation<User, Omit<User, 'id' | 'createdAt' | 'updatedAt'>>({
      query: (userData) => ({
        url: '/users',
        method: 'POST',
        data: userData,
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
      transformResponse: (response: { user: User }) => response.user,
    }),

    // DELETE: Delete user
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),

    // POST: Upload user avatar
    uploadAvatar: builder.mutation<{ avatarUrl: string }, { userId: string; file: FormData }>({
      query: ({ userId, file }) => ({
        url: `/users/${userId}/avatar`,
        method: 'POST',
        data: file,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      invalidatesTags: (result, error, { userId }) => [{ type: 'User', id: userId }],
    }),
  }),
  overrideExisting: false,
});

// Export hooks for usage in components
export const {
  useGetUserByIdQuery,
  useGetCurrentUserQuery,
  useGetUsersQuery,
  useUpdateUserMutation,
  useCreateUserMutation,
  useDeleteUserMutation,
  useUploadAvatarMutation,
  // Lazy query hooks for manual triggering
  useLazyGetUserByIdQuery,
  useLazyGetCurrentUserQuery,
  useLazyGetUsersQuery,
} = userApi;

// Export utility functions for manual cache management
export const {
  // Prefetch functions
  prefetch: prefetchUser,
  // Manual cache invalidation
  invalidateTags: invalidateUserTags,
  // Manual cache updates
  updateQueryData: updateUserQueryData,
} = userApi.util;