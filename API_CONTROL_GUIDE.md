# 🎯 RTK Query API Control Guide

## Problem Solved ✅

**Issue**: APIs were being called automatically without user interaction due to RTK Query's default behavior.

**Solution**: Implemented manual API control system that only makes API calls when explicitly triggered.

## 🔧 Key Changes Made

### 1. **Disabled Automatic Refetching**
```typescript
// src/services/baseApi.ts
export const baseApi = createApi({
  // Disabled automatic behaviors
  refetchOnMountOrArgChange: false,
  refetchOnFocus: false,
  refetchOnReconnect: false,
  // ... other config
});
```

### 2. **Removed Automatic Listeners**
```typescript
// src/store/index.ts
// Commented out to prevent automatic API calls
// setupListeners(store.dispatch);
```

### 3. **Updated Selectors to Not Trigger Queries**
```typescript
// src/store/selectors.ts
// Changed from using RTK Query selectors that auto-trigger
// to reading directly from cache state
export const selectCurrentUser = createSelector(
  (state: RootState) => {
    const queryState = state.api.queries[`getCurrentUser(undefined)`];
    return queryState?.data;
  },
  (data) => data
);
```

### 4. **Created Manual Query Hooks**
```typescript
// src/hooks/useManualQuery.ts
export const useManualQuery = <T>(queryHook, args) => {
  const [shouldFetch, setShouldFetch] = useState(false);
  
  const queryResult = queryHook(args, {
    skip: !shouldFetch, // Only run when explicitly triggered
  });

  const trigger = useCallback(() => {
    setShouldFetch(true);
  }, []);

  return { ...queryResult, trigger };
};
```

### 5. **Updated Components to Use Skip**
```typescript
// All query components now use skip: true by default
const userQuery = useOptimizedQuery(
  useGetCurrentUserQuery(undefined, {
    skip: true, // Prevents automatic execution
  }),
  // ... options
);
```

## 🚀 How to Use Manual API Control

### Basic Manual Query
```typescript
import { useManualQuery } from '../hooks/useManualQuery';
import { useGetCurrentUserQuery } from '../services/userApi';

const MyComponent = () => {
  const userQuery = useManualQuery(useGetCurrentUserQuery);

  const handleLoadUser = () => {
    userQuery.trigger(); // Only now will the API be called
  };

  return (
    <TouchableOpacity onPress={handleLoadUser}>
      <Text>Load User Data</Text>
    </TouchableOpacity>
  );
};
```

### Lazy Query with Arguments
```typescript
import { useLazyQuery } from '../hooks/useManualQuery';
import { useGetUsersQuery } from '../services/userApi';

const MyComponent = () => {
  const usersQuery = useLazyQuery(useGetUsersQuery);

  const handleLoadUsers = () => {
    usersQuery.trigger({ page: 1, limit: 10 }); // Pass arguments
  };

  return (
    <TouchableOpacity onPress={handleLoadUsers}>
      <Text>Load Users</Text>
    </TouchableOpacity>
  );
};
```

### Manual Refetch
```typescript
const MyComponent = () => {
  const { data, isLoading, refetch } = useGetCurrentUserQuery(undefined, {
    skip: true, // Don't auto-fetch
  });

  const handleRefresh = () => {
    refetch(); // Manual refetch
  };

  return (
    <TouchableOpacity onPress={handleRefresh}>
      <Text>Refresh Data</Text>
    </TouchableOpacity>
  );
};
```

## 📱 Demo Component

The `ManualApiExample` component demonstrates:
- ✅ No automatic API calls on mount
- ✅ Manual triggering of queries
- ✅ Loading states and error handling
- ✅ Cache management
- ✅ Reset functionality

## 🎛️ Control Options

### 1. **Skip Query Execution**
```typescript
const query = useGetDataQuery(params, {
  skip: true, // Never execute automatically
});
```

### 2. **Conditional Execution**
```typescript
const [shouldLoad, setShouldLoad] = useState(false);
const query = useGetDataQuery(params, {
  skip: !shouldLoad, // Only execute when shouldLoad is true
});
```

### 3. **Manual Cache Management**
```typescript
import { useAppDispatch } from '../hooks/redux';
import { userApi } from '../services/userApi';

const dispatch = useAppDispatch();

// Prefetch data
dispatch(userApi.util.prefetch('getUserById', userId));

// Invalidate cache
dispatch(userApi.util.invalidateTags(['User']));

// Update cache manually
dispatch(
  userApi.util.updateQueryData('getCurrentUser', undefined, (draft) => {
    draft.firstName = 'Updated Name';
  })
);
```

## 🔍 Debugging API Calls

### Check if Query is Triggered
```typescript
const query = useManualQuery(useGetDataQuery);
console.log('Query triggered:', query.isTriggered);
```

### Monitor Cache State
```typescript
import { useAppSelector } from '../hooks/redux';

const cacheState = useAppSelector(state => state.api.queries);
console.log('Cache state:', cacheState);
```

### Track API Calls
```typescript
// Check axiosConfig.ts for request/response logging
// All API calls are logged with 🚀 and ✅/❌ indicators
```

## 🎯 Best Practices

### ✅ Do's
- Use `skip: true` for queries that shouldn't auto-execute
- Use manual trigger functions for user-initiated actions
- Implement loading states for better UX
- Use cache selectors to read existing data without triggering queries
- Reset queries when appropriate to clear cache

### ❌ Don'ts
- Don't use RTK Query selectors that auto-trigger queries
- Don't enable `refetchOnFocus` or `refetchOnReconnect` unless needed
- Don't use polling intervals unless specifically required
- Don't forget to handle loading and error states

## 🔄 Migration from Auto to Manual

1. **Add skip to existing queries**:
   ```typescript
   // Before
   const query = useGetDataQuery(params);
   
   // After
   const query = useGetDataQuery(params, { skip: true });
   ```

2. **Add manual trigger buttons**:
   ```typescript
   <TouchableOpacity onPress={() => query.refetch()}>
     <Text>Load Data</Text>
   </TouchableOpacity>
   ```

3. **Update selectors**:
   ```typescript
   // Before (auto-triggers query)
   const data = useAppSelector(selectCurrentUser);
   
   // After (reads from cache only)
   const data = useAppSelector(selectCurrentUser);
   ```

## 🎉 Result

✅ **No automatic API calls** - APIs only execute when explicitly triggered  
✅ **Better performance** - Reduced unnecessary network requests  
✅ **User control** - Users decide when to load data  
✅ **Memory efficient** - Proper cache management and cleanup  
✅ **Debugging friendly** - Clear logging and state tracking  

The implementation now gives you complete control over when and how API calls are made!