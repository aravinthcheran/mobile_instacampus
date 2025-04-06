import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Modal, Image, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';

export function ProfileMenu() {
  const { user, logout } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleLogout = async () => {
    await logout();
    setMenuVisible(false);
    router.replace('/auth/login');
  };

  // Default profile image if none available
  const profileImage = user?.profilePic || 'https://via.placeholder.com/40';

  return (
    <>
      <TouchableOpacity onPress={toggleMenu} style={styles.profileButton}>
        {user?.profilePic ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.profilePlaceholder}>
            <ThemedText style={styles.profileInitial}>
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </ThemedText>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <ThemedView style={styles.menuContainer}>
            <TouchableOpacity 
              style={styles.userInfoSection}
              activeOpacity={1}
            >
              {user?.profilePic ? (
                <Image source={{ uri: profileImage }} style={styles.menuProfileImage} />
              ) : (
                <View style={styles.menuProfilePlaceholder}>
                  <ThemedText style={styles.menuProfileInitial}>
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </ThemedText>
                </View>
              )}
              
              <View style={styles.userInfo}>
                <ThemedText type="defaultSemiBold" style={styles.userName}>
                  {user?.name || 'User'}
                </ThemedText>
                <ThemedText style={styles.userEmail}>
                  {user?.email || 'user@example.com'}
                </ThemedText>
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={22} color="#e74c3c" />
              <ThemedText style={styles.logoutText}>Logout</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  profileButton: {
    marginRight: 15,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  profilePlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  profileInitial: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuContainer: {
    width: 250,
    marginTop: 60,
    marginRight: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  userInfoSection: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  menuProfileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  menuProfilePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  menuProfileInitial: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  logoutText: {
    marginLeft: 10,
    color: '#e74c3c',
    fontSize: 16,
  },
});
