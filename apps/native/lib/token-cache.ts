import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface TokenCache {
  getToken: (key: string) => Promise<string | undefined | null>;
  saveToken: (key: string, token: string) => Promise<void>;
  clearToken?: (key: string) => void;
}

const createTokenCache = (): TokenCache => {
  return {
    async getToken(key: string) {
      try {
        const item = await AsyncStorage.getItem(key);
        if (item) {
          console.log(`[TokenCache] ${key} was used 🔐`);
        } else {
          console.log('[TokenCache] No values stored under key: ' + key);
        }
        return item;
      } catch (error) {
        console.error('[TokenCache] AsyncStorage get item error: ', error);
        await AsyncStorage.removeItem(key);
        return null;
      }
    },
    async saveToken(key: string, value: string) {
      try {
        console.log(`[TokenCache] ⏳ Attempting to save token for key: ${key}, value length: ${value.length}`);
        await AsyncStorage.setItem(key, value);
        console.log(`[TokenCache] ✅ Successfully saved token for key: ${key}`);
      } catch (err) {
        console.error('[TokenCache] ❌ AsyncStorage save item error: ', err);
      }
    },
    async clearToken(key: string) {
      try {
        console.log(`[TokenCache] 🧹 Clearing token for key: ${key}`);
        await AsyncStorage.removeItem(key);
        console.log(`[TokenCache] ✅ Successfully cleared token for key: ${key}`);
      } catch (err) {
        console.error('[TokenCache] ❌ AsyncStorage delete item error: ', err);
      }
    },
  };
};

export const tokenCache =
  Platform.OS !== 'web' ? createTokenCache() : undefined;
