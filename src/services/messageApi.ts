import { apiRequest } from './apiClient';
import { Message, MessageThread, User } from '../types';

interface BackendParticipant {
  id: string;
  name: string;
  email: string;
  avatar: string;
  designation: string;
  companyName: string;
  location: string;
}

interface BackendThread {
  id: string;
  participant: BackendParticipant;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface BackendMessage {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  createdAt: string;
  deliveredAt: string | null;
  seenAt: string | null;
  receiptStatus: 'sent' | 'delivered' | 'seen';
  isMe: boolean;
}

interface MessagesResponse {
  items: BackendMessage[];
  pagination: { total: number; page: number; limit: number; pages: number; hasMore: boolean };
}

const formatTime = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { day: '2-digit', month: 'short' });
};

const participantToUser = (participant: BackendParticipant): User => ({
  id: participant.id,
  name: participant.name,
  designation: participant.designation,
  companyName: participant.companyName,
  industry: '',
  chapter: participant.location || 'Bengal Business Council',
  location: participant.location,
  gstNumber: '',
  isGstVerified: false,
  turnover: '',
  yearJoined: new Date().getFullYear(),
  avatar: participant.avatar,
  membershipTier: 'Executive Member',
  bio: '',
  contact: { email: participant.email, phone: '', website: '', officeAddress: '' },
  stats: { oneToOneCount: 0, referralsGiven: 0, referralsReceived: 0, businessValueInLakhs: 0 },
});

const adaptThread = (thread: BackendThread): MessageThread => ({
  id: thread.id,
  participant: participantToUser(thread.participant),
  lastMessage: thread.lastMessage,
  lastMessageAt: thread.lastMessageAt,
  lastMessageTime: formatTime(thread.lastMessageAt),
  unreadCount: thread.unreadCount,
});

const adaptMessage = (message: BackendMessage): Message => ({
  ...message,
  timestamp: formatTime(message.createdAt),
});

export async function fetchMessageThreadsRequest() {
  const threads = await apiRequest<BackendThread[]>('/messages/threads');
  return threads.map(adaptThread);
}

export function fetchMessageRealtimeTokenRequest() {
  return apiRequest<{ token: string; topic: string; expiresInSeconds: number }>(
    '/messages/realtime-token'
  );
}

export async function createMessageThreadRequest(participantId: string) {
  return adaptThread(await apiRequest<BackendThread>('/messages/threads', {
    method: 'POST',
    body: { participantId },
  }));
}

export async function fetchThreadMessagesRequest(threadId: string, page = 1, limit = 100) {
  const response = await apiRequest<MessagesResponse>(
    `/messages/threads/${threadId}?page=${page}&limit=${limit}`
  );
  return { ...response, items: response.items.map(adaptMessage) };
}

export async function sendThreadMessageRequest(threadId: string, text: string) {
  const message = await apiRequest<BackendMessage>(`/messages/threads/${threadId}`, {
    method: 'POST',
    body: { text },
  });
  return adaptMessage(message);
}

export function markThreadReadRequest(threadId: string) {
  return apiRequest<{ threadId: string; unreadCount: number }>(`/messages/threads/${threadId}/read`, {
    method: 'PATCH',
  });
}

export function markMessagesDeliveredRequest() {
  return apiRequest<{ deliveredCount: number; deliveredAt?: string }>('/messages/delivered', {
    method: 'PATCH',
  });
}
