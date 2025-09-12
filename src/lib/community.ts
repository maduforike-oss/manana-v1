import { supabase } from '@/integrations/supabase/client';
import { handleAsyncError, getErrorMessage } from './errors';

// TypeScript interfaces for Community API v1
export interface PostProfile {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  likes_count: number;
  comments_count: number;
  is_liked_by_user: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

export interface CreatePostResult {
  data?: string; // post ID
  error?: string;
}

export interface CreateCommentResult {
  data?: string; // comment ID
  error?: string;
}

export interface ToggleLikeResult {
  data?: boolean; // true if liked, false if unliked
  error?: string;
}

export interface FeedPostsResult {
  data?: Post[];
  error?: string;
}

export interface PostCommentsResult {
  data?: Comment[];
  error?: string;
}

// Core Community API functions
export async function createPost(content: string): Promise<CreatePostResult> {
  if (!content.trim()) {
    return { error: 'Post content cannot be empty' };
  }

  try {
    const { data, error } = await supabase.rpc('create_post', {
      content_text: content.trim()
    });

    if (error) {
      return { error: getErrorMessage(error) };
    }

    return { data };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

export async function getFeedPosts(
  limit: number = 20,
  offset: number = 0
): Promise<FeedPostsResult> {
  try {
    const { data, error } = await supabase.rpc('get_feed_posts', {
      limit_count: limit,
      offset_count: offset
    });

    if (error) {
      return { error: getErrorMessage(error) };
    }

    return { data: data || [] };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

export async function togglePostLike(postId: string): Promise<ToggleLikeResult> {
  if (!postId) {
    return { error: 'Post ID is required' };
  }

  try {
    const { data, error } = await supabase.rpc('toggle_post_like', {
      post_id_param: postId
    });

    if (error) {
      return { error: getErrorMessage(error) };
    }

    return { data };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

export async function createComment(
  postId: string,
  content: string
): Promise<CreateCommentResult> {
  if (!postId || !content.trim()) {
    return { error: 'Post ID and comment content are required' };
  }

  try {
    const { data, error } = await supabase.rpc('create_comment', {
      post_id_param: postId,
      content_text: content.trim()
    });

    if (error) {
      return { error: getErrorMessage(error) };
    }

    return { data };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

export async function getPostComments(
  postId: string,
  limit: number = 50
): Promise<PostCommentsResult> {
  if (!postId) {
    return { error: 'Post ID is required' };
  }

  try {
    const { data, error } = await supabase.rpc('get_post_comments', {
      post_id_param: postId,
      limit_count: limit
    });

    if (error) {
      return { error: getErrorMessage(error) };
    }

    return { data: data || [] };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

// Utility functions
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s`;
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}m`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}h`;
  } else if (diffInSeconds < 604800) {
    return `${Math.floor(diffInSeconds / 86400)}d`;
  } else {
    return date.toLocaleDateString();
  }
}

export function formatDisplayName(profile: PostProfile): string {
  return profile.display_name || profile.username || 'Anonymous';
}

export function getAvatarUrl(profile: PostProfile): string {
  return profile.avatar_url || '/placeholder.svg';
}

// Auth helper for UI components
export function requireAuthAction(callback: () => void): () => void {
  return () => {
    // This will be handled by the UI component
    // Redirect to /auth/signin if not authenticated
    callback();
  };
}

// Real-time subscriptions (for future implementation)
export function subscribeToPostUpdates(
  postId: string,
  onUpdate: (payload: any) => void
) {
  const channel = supabase
    .channel(`post_${postId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'post_likes',
        filter: `post_id=eq.${postId}`
      },
      onUpdate
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `post_id=eq.${postId}`
      },
      onUpdate
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

export function subscribeToFeedUpdates(onUpdate: (payload: any) => void) {
  const channel = supabase
    .channel('feed_updates')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'posts'
      },
      onUpdate
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}