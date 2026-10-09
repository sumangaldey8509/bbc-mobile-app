import { supabase } from './supabaseClient';
import { Post, PostComment, AppNotification, Message } from '../types';

export interface NewMessagePayload {
  threadId: string;
  senderId: string;
  recipientId: string | null;
  participants: string[];
  message: Message;
  lastMessage: string;
  lastMessageAt: string;
}

export interface MessageReadPayload {
  threadId: string;
  readerId: string;
  participants: string[];
  seenAt: string;
}

export interface MessagesDeliveredPayload {
  recipientId: string;
  deliveredAt: string;
}

export interface FeedRealtimeHandlers {
  onNewPost?: (post: Post) => void;
  onUpdatePost?: (post: Post) => void;
  onDeletePost?: (payload: { id?: string; deletedPostId?: string }) => void;
  onPostLike?: (payload: { postId: string; likesCount: number; userId?: string; isLiked?: boolean }) => void;
  onNewComment?: (comment: PostComment) => void;
  onUpdateComment?: (comment: PostComment) => void;
  onDeleteComment?: (payload: { postId: string; commentId: string; deletedCommentId?: string; commentsCount?: number }) => void;
  onNewNotification?: (notification: AppNotification) => void;
  onNewMessage?: (payload: NewMessagePayload) => void;
  onMessageRead?: (payload: MessageReadPayload) => void;
  onMessagesDelivered?: (payload: MessagesDeliveredPayload) => void;
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

const activeListeners = new Set<FeedRealtimeHandlers>();
let globalFeedChannel: ReturnType<typeof supabase.channel> | null = null;

function ensureFeedChannel() {
  if (globalFeedChannel) return globalFeedChannel;

  globalFeedChannel = supabase.channel('feed', {
    config: { broadcast: { self: false, ack: false } },
  });

  globalFeedChannel
    .on('broadcast', { event: 'new_post' }, ({ payload }) => {
      console.log('[Supabase Realtime] Received "new_post" broadcast:', payload?.id || payload?._id);
      if (payload && (payload.id || payload._id)) {
        const post: Post = {
          ...payload,
          id: String(payload.id || payload._id),
          tag: payload.tag || 'General',
        };
        activeListeners.forEach((h) => h.onNewPost?.(post));
      }
    })
    .on('broadcast', { event: 'update_post' }, ({ payload }) => {
      console.log('[Supabase Realtime] Received "update_post" broadcast:', payload?.id || payload?._id);
      if (payload && (payload.id || payload._id)) {
        const post: Post = {
          ...payload,
          id: String(payload.id || payload._id),
          tag: payload.tag || 'General',
        };
        activeListeners.forEach((h) => h.onUpdatePost?.(post));
      }
    })
    .on('broadcast', { event: 'delete_post' }, ({ payload }) => {
      console.log('[Supabase Realtime] Received "delete_post" broadcast:', payload);
      if (payload) {
        activeListeners.forEach((h) => h.onDeletePost?.(payload));
      }
    })
    .on('broadcast', { event: 'post_like' }, ({ payload }) => {
      console.log('[Supabase Realtime] Received "post_like" broadcast:', payload);
      if (payload && payload.postId) {
        activeListeners.forEach((h) => h.onPostLike?.(payload));
      }
    })
    .on('broadcast', { event: 'new_comment' }, ({ payload }) => {
      console.log('[Supabase Realtime] Received "new_comment" broadcast:', payload?.id || payload?._id);
      if (payload && (payload.id || payload._id)) {
        const comment: PostComment = {
          ...payload,
          id: String(payload.id || payload._id),
          postId: String(payload.postId),
          authorName: payload.authorName || 'Council Member',
          text: payload.text || '',
          createdAt: payload.createdAt || 'Just now',
          parentCommentId: payload.parentCommentId ? String(payload.parentCommentId) : null,
        };
        activeListeners.forEach((h) => h.onNewComment?.(comment));
      }
    })
    .on('broadcast', { event: 'update_comment' }, ({ payload }) => {
      console.log('[Supabase Realtime] Received "update_comment" broadcast:', payload?.id || payload?._id);
      if (payload && (payload.id || payload._id)) {
        const comment: PostComment = {
          ...payload,
          id: String(payload.id || payload._id),
          postId: String(payload.postId),
          authorName: payload.authorName || 'Council Member',
          text: payload.text || '',
          createdAt: payload.createdAt || 'Just now',
          parentCommentId: payload.parentCommentId ? String(payload.parentCommentId) : null,
        };
        activeListeners.forEach((h) => h.onUpdateComment?.(comment));
      }
    })
    .on('broadcast', { event: 'delete_comment' }, ({ payload }) => {
      console.log('[Supabase Realtime] Received "delete_comment" broadcast:', payload);
      if (payload) {
        activeListeners.forEach((h) => h.onDeleteComment?.(payload));
      }
    })
    .on('broadcast', { event: 'new_notification' }, ({ payload }) => {
      console.log('[Supabase Realtime] Received "new_notification" broadcast:', payload);
      if (payload && (payload.id || payload._id)) {
        const notif: AppNotification = {
          ...payload,
          id: String(payload.id || payload._id),
          recipientId: String(payload.recipientId),
          senderId: String(payload.senderId),
          senderName: payload.senderName || 'BBC Member',
          senderAvatar: payload.senderAvatar || '',
          senderCompany: payload.senderCompany,
          title: payload.title || 'Notification',
          message: payload.message || '',
          type: payload.type || 'general',
          timestamp: payload.timestamp || 'Just now',
          read: Boolean(payload.read),
          postId: payload.postId ? String(payload.postId) : undefined,
          commentId: payload.commentId ? String(payload.commentId) : undefined,
        };
        activeListeners.forEach((h) => h.onNewNotification?.(notif));
      }
    })
    .on('broadcast', { event: 'new_message' }, ({ payload }) => {
      console.log('[Supabase Realtime] Received "new_message" broadcast:', payload?.threadId, payload?.message?.id);
      if (payload && payload.threadId && payload.message) {
        const rawMsg = payload.message;
        const msg: Message = {
          id: String(rawMsg.id || rawMsg._id),
          threadId: String(payload.threadId),
          senderId: String(rawMsg.senderId || rawMsg.sender),
          text: rawMsg.text || '',
          timestamp: formatTime(rawMsg.createdAt) || 'Just now',
          createdAt: rawMsg.createdAt,
          deliveredAt: rawMsg.deliveredAt || null,
          seenAt: rawMsg.seenAt || null,
          receiptStatus: rawMsg.seenAt ? 'seen' : rawMsg.deliveredAt ? 'delivered' : 'sent',
          isMe: false,
        };
        const messagePayload: NewMessagePayload = {
          threadId: String(payload.threadId),
          senderId: String(payload.senderId),
          recipientId: payload.recipientId ? String(payload.recipientId) : null,
          participants: (payload.participants || []).map(String),
          message: msg,
          lastMessage: payload.lastMessage || rawMsg.text || '',
          lastMessageAt: payload.lastMessageAt || rawMsg.createdAt || new Date().toISOString(),
        };
        activeListeners.forEach((h) => h.onNewMessage?.(messagePayload));
      }
    })
    .on('broadcast', { event: 'message_read' }, ({ payload }) => {
      console.log('[Supabase Realtime] Received "message_read" broadcast:', payload?.threadId, payload?.readerId);
      if (payload && payload.threadId) {
        const readPayload: MessageReadPayload = {
          threadId: String(payload.threadId),
          readerId: String(payload.readerId),
          participants: (payload.participants || []).map(String),
          seenAt: payload.seenAt || new Date().toISOString(),
        };
        activeListeners.forEach((h) => h.onMessageRead?.(readPayload));
      }
    })
    .on('broadcast', { event: 'messages_delivered' }, ({ payload }) => {
      console.log('[Supabase Realtime] Received "messages_delivered" broadcast:', payload?.recipientId);
      if (payload && payload.recipientId) {
        const deliveredPayload: MessagesDeliveredPayload = {
          recipientId: String(payload.recipientId),
          deliveredAt: payload.deliveredAt || new Date().toISOString(),
        };
        activeListeners.forEach((h) => h.onMessagesDelivered?.(deliveredPayload));
      }
    })
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log('[Supabase Realtime] Connected to feed broadcast channel.');
      } else {
        console.log(`[Supabase Realtime] Channel status: ${status}`, err || '');
      }
    });

  return globalFeedChannel;
}

/**
 * Subscribe to Supabase Realtime Broadcast events for the feed & messaging.
 * Returns an unsubscribe teardown function.
 */
export function subscribeToFeedRealtime(handlers: FeedRealtimeHandlers): () => void {
  activeListeners.add(handlers);
  ensureFeedChannel();

  return () => {
    activeListeners.delete(handlers);
  };
}

/** Legacy placeholder for private message realtime. Kept for backwards compatibility. */
export async function subscribeToPrivateMessageRealtime(
  _token: string,
  _topic: string,
  _onChanged: () => void
): Promise<() => void> {
  return () => {};
}
