import { Platform } from 'react-native';

/**
 * Runtime configuration sourced from Expo public env vars.
 *
 * `EXPO_PUBLIC_*` values are statically inlined at build time, so they must be
 * referenced with plain dot notation (never destructured or index-accessed).
 * See https://docs.expo.dev/guides/environment-variables/
 */

// Fallback LAN IP for physical mobile devices and simulators on the same WiFi.
const DEFAULT_API_URL = 'http://192.168.0.100:5001/api';

const resolveApiBaseUrl = (): string => {
  // If running on web (desktop browser), use current host so it never breaks on Wi-Fi IP changes
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hostname) {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5001/api';
    }
    return `http://${hostname}:5001/api`;
  }

  return (process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/+$/, '');
};

export const API_BASE_URL = resolveApiBaseUrl();

export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://xeebyrarxmqxheugdeoh.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_J1-JwDpmp8KKtN59bO2mjw_S1VrlieG';
