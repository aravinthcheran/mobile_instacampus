import { Platform } from 'react-native';

/**
 * Cross-platform storage utility that falls back to localStorage for all platforms
 * until proper async storage is set up.
 */
class Storage {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      // For now, use in-memory storage for native platforms
      // This is temporary until AsyncStorage is properly set up
      return this.inMemoryStorage[key] || null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      // For now, use in-memory storage for native platforms
      this.inMemoryStorage[key] = value;
    }
  }

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      // For now, use in-memory storage for native platforms
      delete this.inMemoryStorage[key];
    }
  }

  // Temporary in-memory storage for native platforms
  // This will be lost when the app restarts
  private inMemoryStorage: Record<string, string> = {};
}

export const storage = new Storage();
