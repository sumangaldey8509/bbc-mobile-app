import { supabase } from './supabaseClient';
import { Post, PostComment, AppNotification } from '../types';

export interface FeedRealtimeHandlers {
  onNewPost: (post: Post) => void;
  onUpdatePost?: (post: Post) => void;
  onDeletePost?: (payload: { id?: string; deletedPostId?: string }) => void;
  onPostLike?: (payload: { postId: string; likesCount: number; userId?: string; isLiked?: boolean }) => void;
  onNewComment?: (comment: PostComment) => void;
  onUpdateComment?: (comment: PostComment) => void;
  onDeleteComment?: (payload: { postId: string; commentId: string; deletedCommentId?: string; commentsCount?: number }) => void;
  onNewNotification?: (notification: AppNotification) => void;
}

/**
 * Subscribe to Supabase Realtime Broadcast events for the 'feed' channel.
 * Returns an unsubscribe teardown function.
 */
export function subscribeToFeedRealtime(handlers: FeedRealtimeHandlers): () => void {
  const channel = supabase.channel('feed', {
    config: { broadcast: { self: false, ack: false } },
  });

  channel
    .on('broadcast', { event: 'new_post' }, ({ payload }) => {
      console.log('[Supabase Realtime] Received "new_post" broadcast:', payload?.id || payload?._id);
      if (payload && (payload.id || payload._id)) {
        const post: Post = {
          ...payload,
          id: String(payload.id || payload._id),
          tag: payload.tag || 'General',
        };
        handlers.onNewPost(post);
      }
    })
    .on('broadcast', { event: 'update_post' }, ({ payload }) => {
      console.log('[Supabase Realtime] Received "update_post" broadcast:', payload?.id || payload?._id);
      if (payload && (payload.id || payload._id) && handlers.onUpdatePost) {
        const post: Post = {
          ...payload,
          id: String(payload.id || payload._id),
          tag: payload.tag || 'General',
        };
        handlers.onUpdatePost(post);
      }
    })
    .on('broadcast', { event: 'delete_post' }, ({ payload }) => {
      console.log('[Supabase Realtime] Received "delete_post" broadcast:', payload);
      if (payload && handlers.onDeletePost) {
        handlers.onDeletePost(payload);
      }
    })
    .on('broadcast', { event: 'post_like' }, ({ payload }) => {
      console.log('[Supabase Realtime] Received "post_like" broadcast:', payload);
      if (payload && payload.postId && handlers.onPostLike) {
        handlers.onPostLike(payload);
      }
    })
    .on('broadcast', { event: 'new_comment' }, ({ payload }) => {
      console.log('[Supabase Realtime] Received "new_comment" broadcast:', payload?.id || payload?._id);
      if (payload && (payload.id || payload._id) && handlers.onNewComment) {
        const comment: PostComment = {
          ...payload,
          id: String(payload.id || payload._id),
          postId: String(payload.postId),
          authorName: payload.authorName || 'Council Member',
          text: payload.text || '',
          createdAt: payload.createdAt || 'Just now',
          parentCommentId: payload.parentCommentId ? String(payload.parentCommentId) : null,
        };
        handlers.onNewComment(comment);
      }
    })
    .on('broadcast', { event: 'update_comment' }, ({ payload }) => {
      console.log('[Supabase Realtime] Received "update_comment" broadcast:', payload?.id || payload?._id);
      if (payload && (payload.id || payload._id) && handlers.onUpdateComment) {
        const comment: PostComment = {
          ...payload,
          id: String(payload.id || payload._id),
          postId: String(payload.postId),
          authorName: payload.authorName || 'Council Member',
          text: payload.text || '',
          createdAt: payload.createdAt || 'Just now',
          parentCommentId: payload.parentCommentId ? String(payload.parentCommentId) : null,
        };
        handlers.onUpdateComment(comment);
      }
    })
    .on('broadcast', { event: 'delete_comment' }, ({ payload }) => {
      console.log('[Supabase Realtime] Received "delete_comment" broadcast:', payload);
      if (payload && handlers.onDeleteComment) {
        handlers.onDeleteComment(payload);
      }
    })
    .on('broadcast', { event: 'new_notification' }, ({ payload }) => {
      console.log('[Supabase Realtime] Received "new_notification" broadcast:', payload);
      if (payload && (payload.id || payload._id) && handlers.onNewNotification) {
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
        handlers.onNewNotification(notif);
      }
    })
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log('[Supabase Realtime] Connected to feed channel.');
      } else {
        console.log(`[Supabase Realtime] Channel status: ${status}`, err || '');
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}


