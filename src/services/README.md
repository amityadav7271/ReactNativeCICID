# RTK Query + Axios Implementation

This implementation provides a robust, memory-efficient API handling solution using Redux Toolkit Query (RTK Query) with Axios integration for React Native applications.

## 🚀 Features

### Memory-Efficient API Handling
- **Automatic caching** with configurable TTL (Time To Live)
- **Smart cache invalidation** using tags
- **Memory cleanup** on component unmount
- **Optimized re-renders** using memoized selectors
- **Background refetching** with configurable intervals

### Retry Mechanism
- **Exponential backoff** with configurable delays
- **Conditional retries** based on error types
- **Maximum retry limits** to prevent infinite loops
- **Network error detection** and automatic retry

### Axios Integration
- **Centralized configuration** with interceptors
- **Request/Response logging** for debugging
- **Authentication token handling**
- **Timeout management**
- **Error transformation** for consistent error handling

### Optimized State Updates
- **Memoized selectors** to prevent unnecessary re-renders
- **Optimistic updates** for better UX
- **Rollback mechanism** for failed optimistic updates
- **Selective data fetching** with skip conditions

### Error Handling
- **Centralized error handling** with custom hooks
- **User-friendly error messages**
- **Automatic error recovery**
- **Error logging and analytics integration**

## 📁 File Structure

```
src/
├── services/
│   ├── axiosConfig.ts      # Axios instance with interceptors and retry logic
│   ├── baseApi.ts          # RTK Query base API configuration
│   ├── userApi.ts          # User-specific API endpoints
│   └── README.md           # This file
├── store/
│   ├── index.ts            # Redux store configuration
│   └── selectors.ts        # Memoized selectors
├── hooks/
│   ├── redux.ts            # Typed Redux hooks
│   └── useOptimizedQuery.ts # Custom hooks for optimized queries
├── components/
│   ├── UserProfile.tsx     # User profile component example
│   └── UsersList.tsx       # Users list with pagination example
├── providers/
│   └── ReduxProvider.tsx   # Redux Provider wrapper
└── config/
    └── environment.ts      # Environment configuration
```

## 🔧 Configuration

### Environment Variables

Add these variables to your `.env` files:

```bash
# API Configuration
API_BASE_URL=https://api.example.com
API_TIMEOUT=15000

# Retry Configuration
MAX_RETRIES=3
RETRY_DELAY=1000

# Cache Configuration
CACHE_DURATION=300

# Development flags
ENABLE_LOGGING=true
ENABLE_REDUX_DEVTOOLS=true
```

### Axios Configuration

The Axios instance is configured with:
- Base URL from environment variables
- 15-second timeout
- JSON content type headers
- Request/Response interceptors
- Automatic retry with exponential backoff

### RTK Query Configuration

The base API is configured with:
- Axios as the base query function
- Tag-based cache invalidation
- 60-second unused data retention
- Automatic refetching on focus/reconnect
- 30-second refetch on mount or arg change

## 📖 Usage Examples

### Basic Query Usage

```typescript
import { useGetCurrentUserQuery } from '../services/userApi';

const UserProfile = () => {
  const { data: user, isLoading, error } = useGetCurrentUserQuery();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!user) return <NoDataMessage />;

  return <UserDetails user={user} />;
};
```

### Optimized Query with Custom Hook

```typescript
import { useOptimizedQuery } from '../hooks/useOptimizedQuery';
import { useGetCurrentUserQuery } from '../services/userApi';

const UserProfile = () => {
  const userQuery = useOptimizedQuery(
    useGetCurrentUserQuery(),
    {
      pollingInterval: 30000, // Poll every 30 seconds
      onError: (error) => console.error('User fetch error:', error),
      onSuccess: (user) => console.log('User loaded:', user.email),
      clearOnUnmount: true, // Clear data on unmount
    }
  );

  return <UserDetails query={userQuery} />;
};
```

### Mutation with Optimistic Updates

```typescript
import { useUpdateUserMutation } from '../services/userApi';
import { useOptimizedMutation } from '../hooks/useOptimizedMutation';

const EditUserForm = ({ userId }) => {
  const [updateUserTrigger] = useUpdateUserMutation();

  const { mutate: updateUser } = useOptimizedMutation(
    (data) => updateUserTrigger({ id: userId, data }),
    {
      onSuccess: (user) => Alert.alert('Success', 'User updated!'),
      onError: (error) => Alert.alert('Error', 'Update failed'),
      optimisticUpdate: (data) => {
        // Apply optimistic update to UI
      },
      rollback: (data) => {
        // Rollback optimistic update on error
      },
    }
  );

  const handleSubmit = (formData) => {
    updateUser(formData);
  };

  return <UserForm onSubmit={handleSubmit} />;
};
```

### Pagination with Infinite Scroll

```typescript
import { useGetUsersQuery } from '../services/userApi';

const UsersList = () => {
  const [page, setPage] = useState(1);
  
  const { data, isLoading, isFetching } = useGetUsersQuery({
    page,
    limit: 20,
  });

  const handleLoadMore = () => {
    if (data && page < data.totalPages) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <FlatList
      data={data?.data || []}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={isFetching ? <LoadingSpinner /> : null}
    />
  );
};
```

### Manual Cache Management

```typescript
import { userApi } from '../services/userApi';
import { useAppDispatch } from '../hooks/redux';

const UserManager = () => {
  const dispatch = useAppDispatch();

  // Prefetch user data
  const prefetchUser = (userId: string) => {
    dispatch(userApi.util.prefetch('getUserById', userId));
  };

  // Invalidate user cache
  const invalidateUser = (userId: string) => {
    dispatch(userApi.util.invalidateTags([{ type: 'User', id: userId }]));
  };

  // Update cache manually
  const updateUserCache = (userId: string, updates: Partial<User>) => {
    dispatch(
      userApi.util.updateQueryData('getUserById', userId, (draft) => {
        Object.assign(draft, updates);
      })
    );
  };

  return <UserManagementUI />;
};
```

## 🎯 Best Practices

### Memory Management
1. Use `clearOnUnmount: true` in `useOptimizedQuery` for components that fetch large datasets
2. Implement proper cleanup in `useEffect` hooks
3. Use memoized selectors to prevent unnecessary re-renders
4. Configure appropriate `keepUnusedDataFor` values based on data usage patterns

### Performance Optimization
1. Use `skip` parameter to prevent unnecessary API calls
2. Implement debounced search to reduce API requests
3. Use `getItemLayout` in FlatList for better scroll performance
4. Implement proper key extractors for list components

### Error Handling
1. Always provide fallback UI for error states
2. Use centralized error handling with custom hooks
3. Implement retry mechanisms for transient errors
4. Log errors for debugging and analytics

### Caching Strategy
1. Use appropriate cache tags for invalidation
2. Configure cache TTL based on data freshness requirements
3. Implement optimistic updates for better UX
4. Use background refetching for real-time data

## 🔍 Debugging

### Redux DevTools
Enable Redux DevTools in development to inspect:
- API call states and timing
- Cache contents and invalidation
- Action dispatching and state changes

### Logging
The implementation includes comprehensive logging:
- API request/response logging
- Error logging with context
- Cache invalidation logging
- Retry attempt logging

### Performance Monitoring
Monitor these metrics:
- API response times
- Cache hit/miss ratios
- Memory usage patterns
- Component re-render frequency

## 🚨 Common Issues and Solutions

### Memory Leaks
- **Issue**: Components not cleaning up subscriptions
- **Solution**: Use `clearOnUnmount: true` and proper cleanup in useEffect

### Excessive Re-renders
- **Issue**: Components re-rendering on every state change
- **Solution**: Use memoized selectors and React.memo for components

### Cache Invalidation
- **Issue**: Stale data after mutations
- **Solution**: Proper tag configuration and invalidation strategy

### Network Errors
- **Issue**: Failed requests not retrying
- **Solution**: Configure retry conditions and exponential backoff

## 📚 Additional Resources

- [RTK Query Documentation](https://redux-toolkit.js.org/rtk-query/overview)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [React Native Performance](https://reactnative.dev/docs/performance)
- [Redux Best Practices](https://redux.js.org/style-guide/style-guide)