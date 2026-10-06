import { apiRequest } from './apiClient';
import { AppNotification } from '../types';

export interface NotificationsResponse {
  items: AppNotification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasMore: boolean;
  };
  unreadCount: number;
}

/**
 * Fetch notifications for the current authenticated user.
 */
export async function fetchNotifications(params?: {
  page?: number;
  limit?: number;
}): Promise<NotificationsResponse> {
  const queryParts: string[] = [];
  if (params?.page) queryParts.push(`page=${params.page}`);
  if (params?.limit) queryParts.push(`limit=${params.limit}`);

  const qs = queryParts.length ? `?${queryParts.join('&')}` : '';
  return apiRequest<NotificationsResponse>(`/notifications${qs}`, { method: 'GET' });
}

/**
 * Mark a single notification as read.
 */
export async function markNotificationReadRequest(
  notificationId: string
): Promise<{ id: string; read: boolean }> {
  return apiRequest<{ id: string; read: boolean }>(`/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
}

/**
 * Mark all notifications as read.
 */
export async function markAllNotificationsReadRequest(): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>('/notifications/read-all', {
    method: 'PATCH',
  });
}

/**
 * Clear all notifications for the current user.
 */
export async function clearAllNotificationsRequest(): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>('/notifications', {
    method: 'DELETE',
  });
}
