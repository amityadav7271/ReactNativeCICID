import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import UsersList from '../components/UsersList';
import UserProfile from '../components/UserProfile';
import { User } from '../services/userApi';
import { SafeAreaView } from 'react-native-safe-area-context';

const UsersScreen: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  const handleUserSelect = useCallback((user: User) => {
    setSelectedUser(user);
    setShowProfile(true);
  }, []);

  const handleCloseProfile = useCallback(() => {
    setShowProfile(false);
    setSelectedUser(null);
  }, []);

  const handleUserUpdate = useCallback((updatedUser: User) => {
    console.log('User updated:', updatedUser);
    // You can add additional logic here, like showing a toast
  }, []);

  const showCurrentUserProfile = useCallback(() => {
    setSelectedUser(null); // This will show current user profile
    setShowProfile(true);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Users</Text>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={showCurrentUserProfile}
        >
          <Text style={styles.profileButtonText}>My Profile</Text>
        </TouchableOpacity>
      </View>

      <UsersList
        onUserSelect={handleUserSelect}
        searchable={true}
        refreshable={true}
      />

      <Modal
        visible={showProfile}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseProfile}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCloseProfile}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedUser ? 'User Profile' : 'My Profile'}
            </Text>
            <View style={styles.placeholder} />
          </View>

          <UserProfile
            userId={selectedUser?.id}
            onUserUpdate={handleUserUpdate}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  profileButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 50, // Same width as close button for centering
  },
});

export default UsersScreen;