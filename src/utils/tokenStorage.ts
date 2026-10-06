import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Small persistence layer for the auth JWT.
 *
 * Native uses the encrypted keychain / keystore via expo-secure-store.
 * Web falls back to localStorage (SecureStore is unavailable there).
 */

const TOKEN_KEY = 'curated_table_auth_token';

const isWeb = Platform.OS === 'web';

export const tokenStorage = {
  async get(): Promise<string | null> {
    try {
      if (isWeb) {
        return typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
      }
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async set(token: string): Promise<void> {
    try {
      if (isWeb) {
        if (typeof localStorage !== 'undefined') localStorage.setItem(TOKEN_KEY, token);
        return;
      }
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch {
      // Non-fatal: the user stays logged in for this session only.
    }
  },

  async clear(): Promise<void> {
    try {
      if (isWeb) {
        if (typeof localStorage !== 'undefined') localStorage.removeItem(TOKEN_KEY);
        return;
      }
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch {
      // ignore
    }
  },
};
