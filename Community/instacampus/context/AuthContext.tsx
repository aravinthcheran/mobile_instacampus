import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { usePosts } from './PostContext';
import { storage } from '@/utils/storage';

// User type definition
type User = {
  name: string;
  email: string;
  profilePic?: string;
} | null;

// Auth context interface
interface AuthContextType {
  user: User;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User) => void;
  setToken: (token: string | null) => void;
  login: (userData: { name: string; email: string; profilePic?: string }, token: string) => Promise<void>;
  logout: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  setUser: () => {},
  setToken: () => {},
  login: async () => {},
  logout: () => {},
});

// Hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { loadPosts } = usePosts();

  // Load stored auth state on startup
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const storedToken = await storage.getItem('authToken');
        const storedUser = await storage.getItem('user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Load posts when user is already logged in
          await loadPosts();
        }
      } catch (error) {
        console.error('Failed to load authentication state', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  // Login function that also fetches posts
  const login = async (userData: { name: string; email: string; profilePic?: string }, authToken: string) => {
    try {
      setUser(userData);
      setToken(authToken);
      
      // Load posts after successful login
      await loadPosts();
      
      // Navigate to dashboard
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    }
  };

  // Persist user when it changes
  useEffect(() => {
    const saveUser = async () => {
      try {
        if (user) {
          await storage.setItem('user', JSON.stringify(user));
        } else {
          await storage.removeItem('user');
        }
      } catch (error) {
        console.error('Failed to save user', error);
      }
    };

    saveUser();
  }, [user]);

  // Persist token when it changes
  useEffect(() => {
    const saveToken = async () => {
      try {
        if (token) {
          await storage.setItem('authToken', token);
        } else {
          await storage.removeItem('authToken');
        }
      } catch (error) {
        console.error('Failed to save token', error);
      }
    };

    saveToken();
  }, [token]);

  // Logout function
  const logout = async () => {
    try {
      // Clear user data
      setUser(null);
      setToken(null);
      
      // Clear stored data
      await storage.removeItem('user');
      await storage.removeItem('authToken');
      
      // Optional: Clear any other user-related data
      await storage.removeItem('userSubscriptions');
      
      console.log('Logged out successfully');
      
      // Navigate to login page
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Logout Error', 'Failed to logout properly');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, setUser, setToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
