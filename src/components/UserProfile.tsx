import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import {
  useGetCurrentUserQuery,
  useUpdateUserMutation,
  UpdateUserRequest,
} from '../services/userApi';
import { useOptimizedQuery, useOptimizedMutation } from '../hooks/useOptimizedQuery';
import { useApiError } from '../hooks/redux';

interface UserProfileProps {
  userId?: string;
  onUserUpdate?: (user: any) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId, onUserUpdate }) => {
  const { handleError } = useApiError();

  // Use optimized query with error handling and polling
  const userQuery = useOptimizedQuery(
    useGetCurrentUserQuery(undefined, {
      // Skip if userId is provided (we'd use getUserById instead)
      skip: !!userId,
      // Refetch every 5 minutes
      refetchOnMountOrArgChange: 300,
    }),
    {
      // Poll every 30 seconds for real-time updates
      pollingInterval: 30000,
      onError: handleError,
      onSuccess: (user) => {
        console.log('User profile loaded:', user.email);
        onUserUpdate?.(user);
      },
      // Clear data when component unmounts for memory efficiency
      clearOnUnmount: true,
    }
  );

  // Mutation with optimistic updates
  const [updateUserTrigger, updateUserResult] = useUpdateUserMutation();

  const { mutate: updateUser } = useOptimizedMutation(
    (data: UpdateUserRequest) => 
      updateUserTrigger({ id: userQuery.data?.id || '', data }),
    {
      onSuccess: (updatedUser) => {
        Alert.alert('Success', 'Profile updated successfully!');
        onUserUpdate?.(updatedUser);
      },
      onError: (error) => {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
        handleError(error);
      },
      // Optimistic update - immediately show changes in UI
      optimisticUpdate: (variables) => {
        console.log('Applying optimistic update:', variables);
      },
      // Rollback on error
      rollback: (variables) => {
        console.log('Rolling back optimistic update:', variables);
      },
    }
  );

  // Memoized handlers to prevent unnecessary re-renders
  const handleUpdateName = useCallback(() => {
    if (!userQuery.data) return;

    Alert.prompt(
      'Update Name',
      'Enter your new first name:',
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
      userQuery.data.firstName
    );
  }, [userQuery.data, updateUser]);

  const handleRefresh = useCallback(() => {
    userQuery.refetch();
  }, [userQuery.refetch]);

  // Memoized computed values
  const displayName = useMemo(() => {
    if (!userQuery.data) return '';
    return `${userQuery.data.firstName} ${userQuery.data.lastName}`;
  }, [userQuery.data?.firstName, userQuery.data?.lastName]);

  const isLoading = userQuery.isLoading || updateUserResult.isLoading;

  if (userQuery.isLoading && !userQuery.data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (userQuery.isError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load profile</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!userQuery.data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No user data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Profile</Text>
        {userQuery.isFetching && (
          <ActivityIndicator size="small" color="#007AFF" />
        )}
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userQuery.data.firstName.charAt(0)}
              {userQuery.data.lastName.charAt(0)}
            </Text>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{userQuery.data.email}</Text>
          <Text style={styles.date}>
            Member since: {new Date(userQuery.data.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleUpdateName}
            disabled={isLoading}
          >
            {updateUserResult.isLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Update Name</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleRefresh}
            disabled={isLoading}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Refresh
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileCard: {
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#999',
  },
  actionsContainer: {
    gap: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
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
});

export default UserProfile;