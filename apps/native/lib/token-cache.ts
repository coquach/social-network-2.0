import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export interface TokenCache {
  getToken: (key: string) => Promise<string | undefined | null>;
  saveToken: (key: string, token: string) => Promise<void>;
  clearToken?: (key: string) => void;
}

export const tokenCache: TokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`${key} was used 🔐 \n`);
      } else {
        console.log('No values stored under key: ' + key);
      }
      return item;
    } catch (error) {
      console.error('SecureStore get item error: ', error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

// Fallback for web if ever needed
export const webTokenCache: TokenCache = {
  async getToken(key: string) {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  async saveToken(key: string, value: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
};

export const defaultTokenCache = Platform.OS === 'web' ? webTokenCache : tokenCache;
