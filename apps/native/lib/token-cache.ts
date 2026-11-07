import * as SecureStore from 'expo-secure-store';
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
        const item = await SecureStore.getItemAsync(key);
        return item;
      } catch (error) {
        console.error('[TokenCache] SecureStore get item error: ', error);
        await SecureStore.deleteItemAsync(key).catch(() => {});
        return null;
      }
    },
    async saveToken(key: string, value: string) {
      try {
        await SecureStore.setItemAsync(key, value);
      } catch (err) {
        console.error('[TokenCache] SecureStore save item error: ', err);
      }
    },
    async clearToken(key: string) {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (err) {
        console.error('[TokenCache] SecureStore delete item error: ', err);
      }
    },
  };
};

export const tokenCache =
  Platform.OS !== 'web' ? createTokenCache() : undefined;
