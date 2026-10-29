import { apiRequest } from './apiClient';

export type ConnectionStatusType = 'none' | 'pending_outgoing' | 'pending_incoming' | 'accepted';

export interface ConnectionStatusItem {
  status: ConnectionStatusType;
  connectionId?: string;
}

export type ConnectionStatusesMap = Record<string, ConnectionStatusItem>;

export interface ConnectionRecord {
  _id: string;
  requester: string;
  recipient: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AcceptedConnectionItem {
  connectionId: string;
  connectedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    name: string;
    email: string;
    phone?: string;
    designation: string;
    companyName: string;
    avatar: string;
    city: string;
    state: string;
  };
}

/**
 * Send a connection request to a target member.
 */
export async function sendConnectionRequest(targetUserId: string, note?: string): Promise<ConnectionRecord> {
  return apiRequest<ConnectionRecord>(`/connections/request/${targetUserId}`, {
    method: 'POST',
    body: { note },
  });
}

/**
 * Accept a connection request.
 */
export async function acceptConnectionRequest(params: { connectionId?: string; senderId?: string }): Promise<ConnectionRecord> {
  return apiRequest<ConnectionRecord>('/connections/accept', {
    method: 'POST',
    body: params,
  });
}

/**
 * Reject / Ignore a connection request.
 */
export async function rejectConnectionRequest(params: { connectionId?: string; senderId?: string }): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>('/connections/reject', {
    method: 'POST',
    body: params,
  });
}

/**
 * Cancel an outgoing connection request.
 */
export async function cancelConnectionRequest(params: { connectionId?: string; targetUserId?: string }): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>('/connections/cancel', {
    method: 'POST',
    body: params,
  });
}

/**
 * Remove / Disconnect an established connection with a member.
 */
export async function removeConnection(params: { targetUserId?: string; connectionId?: string }): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>('/connections/remove', {
    method: 'POST',
    body: params,
  });
}

/**
 * Fetch map of connection statuses against all members for the authenticated user.
 */
export async function fetchConnectionStatuses(): Promise<ConnectionStatusesMap> {
  const data = await apiRequest<ConnectionStatusesMap>('/connections/statuses', {
    method: 'GET',
  });
  return data || {};
}

/**
 * Fetch all accepted connections for the authenticated user.
 */
export async function fetchMyConnections(): Promise<AcceptedConnectionItem[]> {
  const data = await apiRequest<AcceptedConnectionItem[]>('/connections', {
    method: 'GET',
  });
  return Array.isArray(data) ? data : [];
}

