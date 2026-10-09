import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { apiRequest } from './apiClient';

const STORED_PUSH_TOKEN_KEY = 'bbc_expo_push_token';

type NotificationsModule = typeof import('expo-notifications');
export type NotificationResponse = import('expo-notifications').NotificationResponse;

// Remote notifications are intentionally unavailable in Expo Go on Android.
// Avoid evaluating expo-notifications there because SDK 53+ throws during
// module initialization before the application can render.
const isExpoGo = Constants.appOwnership === 'expo';
let notificationsModule: NotificationsModule | null | undefined;

const getNotifications = (): NotificationsModule | null => {
  if (isExpoGo) return null;
  if (notificationsModule === undefined) {
    notificationsModule = require('expo-notifications') as NotificationsModule;
  }
  return notificationsModule;
};

// Realtime already updates an open app. Let Android display remote notifications
// when the app is backgrounded or closed, without duplicating them in foreground.
getNotifications()?.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: false,
    shouldShowList: false,
  }),
});

export async function registerAndroidPushNotifications() {
  if (Platform.OS !== 'android' || !Device.isDevice) return null;

  const Notifications = getNotifications();
  if (!Notifications) return null;

  await Notifications.setNotificationChannelAsync('messages', {
    name: 'Messages',
    description: 'New private messages from Bengal Business Council members',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 220, 120, 220],
    lightColor: '#D9272E',
    sound: 'default',
  });

  const existing = await Notifications.getPermissionsAsync();
  const permission = existing.status === 'granted'
    ? existing
    : await Notifications.requestPermissionsAsync();
  if (permission.status !== 'granted') return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) throw new Error('EAS project ID is missing from app configuration.');

  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  await apiRequest('/notifications/push-token', {
    method: 'POST',
    body: {
      token,
      platform: 'android',
      deviceName: Device.deviceName || Device.modelName || 'Android device',
    },
  });
  await SecureStore.setItemAsync(STORED_PUSH_TOKEN_KEY, token);
  return token;
}

export async function unregisterCurrentPushToken() {
  const token = await SecureStore.getItemAsync(STORED_PUSH_TOKEN_KEY);
  if (!token) return;
  try {
    await apiRequest('/notifications/push-token', {
      method: 'DELETE',
      body: { token },
    });
  } finally {
    await SecureStore.deleteItemAsync(STORED_PUSH_TOKEN_KEY);
  }
}

export function getMessageThreadIdFromNotification(
  response: NotificationResponse | null
) {
  const data = response?.notification.request.content.data;
  return data?.type === 'message' && typeof data.threadId === 'string'
    ? data.threadId
    : null;
}

export async function getLastNotificationResponse() {
  return getNotifications()?.getLastNotificationResponseAsync() ?? null;
}

export function addNotificationResponseListener(
  listener: (response: NotificationResponse) => void
) {
  return getNotifications()?.addNotificationResponseReceivedListener(listener) ?? null;
}

export async function clearLastNotificationResponse() {
  await getNotifications()?.clearLastNotificationResponseAsync();
}
