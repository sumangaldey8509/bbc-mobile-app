import { apiRequest } from './apiClient';
import { Post, PostComment } from '../types';

export interface FeedResponse {
  items: Post[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasMore: boolean;
  };
}

export interface CommentsResponse {
  items: PostComment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasMore: boolean;
  };
}

export interface CreatePostPayload {
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'none';
  documentAttachment?: {
    name: string;
    url: string;
    size: string;
    type: string;
  };
}

/**
 * Fetch feed posts with pagination and filters.
 */
export async function fetchFeedPosts(params?: {
  page?: number;
  limit?: number;
  tag?: string;
  search?: string;
}): Promise<FeedResponse> {
  const queryParts: string[] = [];
  if (params?.page) queryParts.push(`page=${params.page}`);
  if (params?.limit) queryParts.push(`limit=${params.limit}`);
  if (params?.tag && params.tag !== 'All') queryParts.push(`tag=${encodeURIComponent(params.tag)}`);
  if (params?.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);

  const qs = queryParts.length ? `?${queryParts.join('&')}` : '';
  return apiRequest<FeedResponse>(`/posts${qs}`, { method: 'GET' });
}

/**
 * Create a new post.
 */
export async function createPostRequest(payload: CreatePostPayload): Promise<Post> {
  return apiRequest<Post>('/posts', {
    method: 'POST',
    body: payload,
  });
}

/**
 * Update an existing post.
 */
export async function updatePostRequest(
  postId: string,
  payload: CreatePostPayload
): Promise<Post> {
  return apiRequest<Post>(`/posts/${postId}`, {
    method: 'PUT',
    body: payload,
  });
}

/**
 * Get a single post by ID.
 */
export async function getPostByIdRequest(postId: string): Promise<Post> {
  return apiRequest<Post>(`/posts/${postId}`, { method: 'GET' });
}

/**
 * Toggle like on a post.
 */
export async function toggleLikePostRequest(
  postId: string
): Promise<{ postId: string; isLiked: boolean; likesCount: number }> {
  return apiRequest<{ postId: string; isLiked: boolean; likesCount: number }>(
    `/posts/${postId}/like`,
    { method: 'POST' }
  );
}

/**
 * Fetch comments for a post.
 */
export async function fetchPostCommentsRequest(
  postId: string,
  page = 1,
  limit = 20
): Promise<CommentsResponse> {
  return apiRequest<CommentsResponse>(
    `/posts/${postId}/comments?page=${page}&limit=${limit}`,
    { method: 'GET' }
  );
}

/**
 * Add a comment to a post (or a reply).
 */
export async function addPostCommentRequest(
  postId: string,
  text: string,
  parentCommentId?: string | null
): Promise<PostComment> {
  return apiRequest<PostComment>(`/posts/${postId}/comments`, {
    method: 'POST',
    body: { text, parentCommentId: parentCommentId || undefined },
  });
}

/**
 * Update a comment on a post.
 */
export async function updatePostCommentRequest(
  postId: string,
  commentId: string,
  text: string
): Promise<PostComment> {
  return apiRequest<PostComment>(`/posts/${postId}/comments/${commentId}`, {
    method: 'PUT',
    body: { text },
  });
}

/**
 * Delete a comment from a post.
 */
export async function deletePostCommentRequest(
  postId: string,
  commentId: string
): Promise<{ success: boolean; deletedCommentId: string; commentsCount: number }> {
  return apiRequest<{ success: boolean; deletedCommentId: string; commentsCount: number }>(
    `/posts/${postId}/comments/${commentId}`,
    { method: 'DELETE' }
  );
}

/**
 * Delete a post.
 */
export async function deletePostRequest(
  postId: string
): Promise<{ success: boolean; deletedPostId: string }> {
  return apiRequest<{ success: boolean; deletedPostId: string }>(
    `/posts/${postId}`,
    { method: 'DELETE' }
  );
}

