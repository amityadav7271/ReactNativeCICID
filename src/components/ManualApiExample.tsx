import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  useGetCurrentUserQuery,
  useGetUsersQuery,
} from '../services/userApi';
import { useManualQuery, useLazyQuery } from '../hooks/useManualQuery';

const ManualApiExample: React.FC = () => {
  // Manual query - only runs when trigger() is called
  const currentUserQuery = useManualQuery(useGetCurrentUserQuery);

  // Lazy query - only runs when trigger(args) is called with arguments
  const usersQuery = useLazyQuery(useGetUsersQuery);

  const handleLoadCurrentUser = () => {
    console.log('🚀 Manually triggering current user query');
    currentUserQuery.trigger();
  };

  const handleLoadUsers = () => {
    console.log('🚀 Manually triggering users query');
    usersQuery.trigger({ page: 1, limit: 5 });
  };

  const handleLoadMoreUsers = () => {
    console.log('🚀 Loading more users');
    usersQuery.trigger({ page: 2, limit: 5 });
  };

  const handleReset = () => {
    currentUserQuery.reset();
    usersQuery.reset();
    Alert.alert('Reset', 'All queries have been reset');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manual API Control Demo</Text>
      <Text style={styles.subtitle}>
        APIs will only be called when you press the buttons below
      </Text>

      {/* Current User Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current User</Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleLoadCurrentUser}
          disabled={currentUserQuery.isLoading}
        >
          {currentUserQuery.isLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Load Current User</Text>
          )}
        </TouchableOpacity>

        {currentUserQuery.data && (
          <View style={styles.dataContainer}>
            <Text style={styles.dataText}>
              ✅ Loaded: {currentUserQuery.data.firstName} {currentUserQuery.data.lastName}
            </Text>
            <Text style={styles.dataText}>
              📧 {currentUserQuery.data.email}
            </Text>
          </View>
        )}

        {!!currentUserQuery.error && (
          <View style={styles.dataContainer}>
            <Text style={styles.errorText}>
              ❌ Error: API call failed
            </Text>
          </View>
        )}
      </View>

      {/* Users List Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Users List</Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSmall]}
            onPress={handleLoadUsers}
            disabled={usersQuery.isLoading}
          >
            {usersQuery.isLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Load Users</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSmall, styles.secondaryButton]}
            onPress={handleLoadMoreUsers}
            disabled={usersQuery.isLoading}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Load More
            </Text>
          </TouchableOpacity>
        </View>

        {usersQuery.data && (
          <View style={styles.dataContainer}>
            <Text style={styles.dataText}>
              ✅ Loaded {usersQuery.data.data?.length || 0} users
            </Text>
            {usersQuery.data.data?.slice(0, 3).map((user) => (
              <Text key={user.id} style={styles.userText}>
                👤 {user.firstName} {user.lastName}
              </Text>
            ))}
          </View>
        )}

        {!!usersQuery.error && (
          <View style={styles.dataContainer}>
            <Text style={styles.errorText}>
              ❌ Error: API call failed
            </Text>
          </View>
        )}
      </View>

      {/* Control Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Controls</Text>
        
        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={handleReset}
        >
          <Text style={styles.buttonText}>Reset All Queries</Text>
        </TouchableOpacity>

        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            Current User Triggered: {currentUserQuery.isTriggered ? '✅' : '❌'}
          </Text>
          <Text style={styles.statusText}>
            Users Query Triggered: {usersQuery.isTriggered ? '✅' : '❌'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  section: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    minHeight: 44,
  },
  buttonSmall: {
    flex: 1,
    marginHorizontal: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 8,
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
  resetButton: {
    backgroundColor: '#FF3B30',
  },
  dataContainer: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  dataText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  userText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 8,
    fontFamily: 'monospace',
  },
  statusContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});

export default ManualApiExample;