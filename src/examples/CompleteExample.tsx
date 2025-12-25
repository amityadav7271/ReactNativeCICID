import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  useGetCurrentUserQuery,
  useGetUsersQuery,
  useUpdateUserMutation,
  useCreateUserMutation,
} from '../services/userApi';
import {
  useOptimizedQuery,
  useOptimizedMutation,
} from '../hooks/useOptimizedQuery';
import {
  useApiError,
  useAppDispatch,
} from '../hooks/redux';
import {
  useNetworkStatus,
  getNetworkErrorMessage,
} from '../utils/networkUtils';
import {
  useRenderPerformance,
  useApiPerformance,
  PerformanceMonitor,
} from '../utils/performanceUtils';
import { userApi } from '../services/userApi';

const CompleteExample: React.FC = () => {
  const dispatch = useAppDispatch();
  const { handleError } = useApiError();
  const networkStatus = useNetworkStatus();
  const { trackApiCall } = useApiPerformance();
  
  // Monitor component render performance
  const { renderCount } = useRenderPerformance('CompleteExample');
  
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // 1. OPTIMIZED QUERY WITH MANUAL CONTROL
  const currentUserQuery = useOptimizedQuery(
    useGetCurrentUserQuery(undefined, {
      // Skip by default - only fetch when explicitly called
      skip: true,
    }),
    {
      // Remove polling to prevent automatic calls
      // pollingInterval: 60000,
      onError: (error) => {
        const message = getNetworkErrorMessage(error);
        Alert.alert('Error', message);
        handleError(error);
      },
      onSuccess: (user) => {
        console.log('✅ Current user loaded:', user.email);
      },
      clearOnUnmount: true,
    }
  );

  // 2. PAGINATED QUERY WITH MANUAL CONTROL
  const usersQuery = useOptimizedQuery(
    useGetUsersQuery(
      { page: 1, limit: 10 },
      {
        // Skip by default - only fetch when explicitly called
        skip: true,
      }
    ),
    {
      onError: handleError,
      clearOnUnmount: true,
    }
  );

  // 3. MUTATION WITH OPTIMISTIC UPDATES
  const [updateUserTrigger] = useUpdateUserMutation();
  const { mutate: updateUser } = useOptimizedMutation(
    (data: { firstName: string }) =>
      updateUserTrigger({
        id: currentUserQuery.data?.id || '',
        data,
      }),
    {
      onSuccess: (updatedUser) => {
        Alert.alert('Success', `Updated ${updatedUser.firstName}!`);
      },
      onError: (error) => {
        const message = getNetworkErrorMessage(error);
        Alert.alert('Update Failed', message);
      },
      optimisticUpdate: (variables) => {
        // Apply optimistic update to cache
        if (currentUserQuery.data?.id) {
          dispatch(
            userApi.util.updateQueryData(
              'getCurrentUser',
              undefined,
              (draft) => {
                if (draft) {
                  draft.firstName = variables.firstName;
                }
              }
            )
          );
        }
      },
      rollback: () => {
        // Rollback is handled automatically by RTK Query
        console.log('🔄 Rolling back optimistic update');
      },
    }
  );

  // 4. CREATE USER MUTATION
  const [createUserTrigger] = useCreateUserMutation();
  const { mutate: createUser } = useOptimizedMutation(
    (userData: any) => createUserTrigger(userData),
    {
      onSuccess: (newUser) => {
        Alert.alert('Success', `Created user ${newUser.firstName}!`);
        // Invalidate users list to refetch
        dispatch(userApi.util.invalidateTags([{ type: 'User', id: 'LIST' }]));
      },
      onError: (error) => {
        const message = getNetworkErrorMessage(error);
        Alert.alert('Creation Failed', message);
      },
    }
  );

  // 5. MANUAL CACHE MANAGEMENT EXAMPLES
  const handlePrefetchUser = useCallback((userId: string) => {
    // Prefetch user data for better UX
    dispatch(userApi.util.prefetch('getUserById', userId));
  }, [dispatch]);

  const handleInvalidateCache = useCallback(() => {
    // Invalidate all user cache
    dispatch(userApi.util.invalidateTags(['User']));
    Alert.alert('Cache Cleared', 'All user data will be refetched');
  }, [dispatch]);

  const handleManualCacheUpdate = useCallback(() => {
    if (currentUserQuery.data?.id) {
      // Manually update cache
      dispatch(
        userApi.util.updateQueryData(
          'getCurrentUser',
          undefined,
          (draft) => {
            if (draft) {
              draft.firstName = 'Updated Name';
            }
          }
        )
      );
    }
  }, [dispatch, currentUserQuery.data?.id]);

  // 6. PERFORMANCE MONITORING
  const handleApiPerformanceTest = useCallback(async () => {
    const apiTracker = trackApiCall('/users/me', 'GET');
    
    apiTracker.start();
    
    try {
      await currentUserQuery.refetch();
      const duration = apiTracker.end();
      
      Alert.alert(
        'Performance Test',
        `API call completed in ${duration}ms`
      );
    } catch (error) {
      apiTracker.end();
      Alert.alert('Performance Test Failed', 'API call failed');
    }
  }, [trackApiCall, currentUserQuery.refetch]);

  const handleShowPerformanceStats = useCallback(() => {
    const monitor = PerformanceMonitor.getInstance();
    const stats = monitor.getAllMetrics();
    
    console.log('📊 Performance Stats:', stats);
    Alert.alert(
      'Performance Stats',
      `Check console for detailed metrics. Render count: ${renderCount}`
    );
  }, [renderCount]);

  // 7. NETWORK STATUS MONITORING
  useEffect(() => {
    if (!networkStatus.isConnected) {
      Alert.alert(
        'No Internet Connection',
        'Some features may not work properly'
      );
    }
  }, [networkStatus.isConnected]);

  // 8. MANUAL API CALL FUNCTIONS
  const handleLoadCurrentUser = useCallback(() => {
    currentUserQuery.refetch();
  }, [currentUserQuery.refetch]);

  const handleLoadUsers = useCallback(() => {
    usersQuery.refetch();
  }, [usersQuery.refetch]);

  const handleUpdateName = useCallback(() => {
    Alert.prompt(
      'Update Name',
      'Enter new first name:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: (firstName) => {
            if (firstName?.trim()) {
              updateUser({ firstName: firstName.trim() });
            }
          },
        },
      ],
      'plain-text',
      currentUserQuery.data?.firstName
    );
  }, [updateUser, currentUserQuery.data?.firstName]);

  const handleCreateTestUser = useCallback(() => {
    const testUser = {
      firstName: 'Test',
      lastName: 'User',
      email: `test.user.${Date.now()}@example.com`,
    };
    
    createUser(testUser);
  }, [createUser]);

  const isLoading = currentUserQuery.isLoading || usersQuery.isLoading;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>RTK Query + Axios Demo</Text>
        <View style={styles.networkStatus}>
          <View
            style={[
              styles.networkIndicator,
              { backgroundColor: networkStatus.isConnected ? '#4CAF50' : '#F44336' }
            ]}
          />
          <Text style={styles.networkText}>
            {networkStatus.isConnected ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      {/* Current User Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current User</Text>
        {currentUserQuery.isLoading && !currentUserQuery.data ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : currentUserQuery.data ? (
          <View style={styles.userCard}>
            <Text style={styles.userName}>
              {currentUserQuery.data.firstName} {currentUserQuery.data.lastName}
            </Text>
            <Text style={styles.userEmail}>{currentUserQuery.data.email}</Text>
            {currentUserQuery.isFetching && (
              <ActivityIndicator size="small" color="#007AFF" />
            )}
          </View>
        ) : (
          <Text style={styles.errorText}>No user data available</Text>
        )}
      </View>

      {/* Users List Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Users List ({usersQuery.data?.total || 0})
        </Text>
        {usersQuery.isLoading ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : usersQuery.data?.data ? (
          <View>
            {usersQuery.data.data.slice(0, 3).map((user) => (
              <TouchableOpacity
                key={user.id}
                style={styles.userItem}
                onPress={() => {
                  setSelectedUserId(user.id);
                  handlePrefetchUser(user.id);
                }}
              >
                <Text style={styles.userItemName}>
                  {user.firstName} {user.lastName}
                </Text>
                <Text style={styles.userItemEmail}>{user.email}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.errorText}>No users available</Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manual API Calls</Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleLoadCurrentUser}
        >
          <Text style={styles.buttonText}>Load Current User</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleLoadUsers}
        >
          <Text style={styles.buttonText}>Load Users List</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleUpdateName}
          disabled={!currentUserQuery.data}
        >
          <Text style={styles.buttonText}>Update My Name</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleCreateTestUser}
        >
          <Text style={styles.buttonText}>Create Test User</Text>
        </TouchableOpacity>
      </View>

      {/* Cache Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cache Management</Text>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleInvalidateCache}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Clear Cache
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleManualCacheUpdate}
          disabled={!currentUserQuery.data}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Manual Cache Update
          </Text>
        </TouchableOpacity>
      </View>

      {/* Performance Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Monitoring</Text>
        
        <TouchableOpacity
          style={[styles.button, styles.performanceButton]}
          onPress={handleApiPerformanceTest}
        >
          <Text style={styles.buttonText}>Test API Performance</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.performanceButton]}
          onPress={handleShowPerformanceStats}
        >
          <Text style={styles.buttonText}>Show Performance Stats</Text>
        </TouchableOpacity>

        <Text style={styles.performanceText}>
          Component renders: {renderCount}
        </Text>
      </View>

      {/* Debug Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Debug Info</Text>
        <Text style={styles.debugText}>
          Network: {networkStatus.type} ({networkStatus.isConnected ? 'Connected' : 'Disconnected'})
        </Text>
        <Text style={styles.debugText}>
          Selected User ID: {selectedUserId || 'None'}
        </Text>
        <Text style={styles.debugText}>
          Cache Status: {currentUserQuery.data ? 'Loaded' : 'Empty'}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  networkStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  networkText: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  userCard: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  userItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  userItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  userItemEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
  performanceButton: {
    backgroundColor: '#FF9500',
  },
  performanceText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    fontStyle: 'italic',
  },
});

export default CompleteExample;