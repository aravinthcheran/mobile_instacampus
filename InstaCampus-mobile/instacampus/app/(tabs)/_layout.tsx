import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { Platform, StyleSheet, View, TouchableOpacity, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';

// Inline ProfileMenu component to avoid creating a new file
function ProfileMenu() {
  const { user, logout } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMenuVisible(false);
  };

  return (
    <>
      <TouchableOpacity 
        onPress={() => setMenuVisible(true)} 
        style={styles.profileButton}
      >
        {user?.profilePic ? (
          <Image source={{ uri: user.profilePic }} style={styles.profileImage} />
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
            <View style={styles.userInfoSection}>
              {user?.profilePic ? (
                <Image source={{ uri: user.profilePic }} style={styles.menuProfileImage} />
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
            </View>

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

// App logo/title component
function AppLogo() {
  return (
    <View style={styles.logoContainer}>
      <ThemedText style={styles.logoText}>InstaCampus</ThemedText>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.tint,
        headerShown: true,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        // Remove the centered title
        headerTitle: () => null,
        // Add logo/app name to the left
        headerLeft: () => <AppLogo />,
        // Keep profile menu on the right
        headerRight: () => <ProfileMenu />,
        // Style header consistently across platforms
        headerStyle: {
          backgroundColor: '#ffffff',
          ...Platform.select({
            android: {
              elevation: 4,
            },
            ios: {
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 1,
              shadowOffset: { width: 0, height: 1 },
            },
            web: {
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }
          }),
        },
        // Add proper container padding
        headerLeftContainerStyle: {
          paddingLeft: 16,
        },
        headerRightContainerStyle: {
          paddingRight: 16,
        },
        tabBarStyle: {
          // Keep bottom tab bar styling consistent across platforms
          ...Platform.select({
            ios: {
              position: 'absolute',
            },
            android: {
              elevation: 8,
            },
            default: {},
          }),
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <Ionicons name="compass" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: 'Create',
          tabBarIcon: ({ color }) => <Ionicons name="add-circle" size={24} color={color} />,
          // Override any screen-specific settings that could hide the header
          headerShown: true,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 20,
    color: '#0a7ea4',
  },
  profileButton: {
    padding: 8,
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
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
});
