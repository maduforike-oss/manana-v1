import { supabase } from '@/integrations/supabase/client';
import { handleAsyncError, getErrorMessage } from './errors';

// TypeScript interfaces for Community API v2
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
  // v2 fields
  media_urls: string[];
  media_types: string[];
  is_saved_by_user: boolean;
  reactions_summary: Record<string, number> | null;
  user_reaction: string | null;
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

export interface ToggleSaveResult {
  data?: boolean; // true if saved, false if unsaved
  error?: string;
}

export interface ToggleReactionResult {
  data?: boolean; // true if added, false if removed
  error?: string;
}

export interface UploadMediaResult {
  data?: string; // media URL
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

// Reaction types and emoji mappings
export const REACTION_TYPES = {
  like: '👍',
  love: '❤️',
  fire: '🔥',
  clap: '👏',
  laugh: '😂',
  wow: '😮',
  sad: '😢',
  angry: '😡'
} as const;

export type ReactionType = keyof typeof REACTION_TYPES;

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

    if (data) {
      // Transform the data to ensure proper typing
      const transformedData = data.map(post => ({
        ...post,
        reactions_summary: (post.reactions_summary as any) || {},
        media_urls: post.media_urls || [],
        media_types: post.media_types || []
      }));
      return { data: transformedData };
    }

    return { data: [] };
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

export async function togglePostSave(postId: string): Promise<ToggleSaveResult> {
  if (!postId) {
    return { error: 'Post ID is required' };
  }

  try {
    const { data, error } = await supabase.rpc('toggle_post_save', {
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

export async function togglePostReaction(
  postId: string, 
  reactionType: ReactionType
): Promise<ToggleReactionResult> {
  if (!postId || !reactionType) {
    return { error: 'Post ID and reaction type are required' };
  }

  try {
    const { data, error } = await supabase.rpc('toggle_post_reaction' as any, {
      post_id_param: postId,
      reaction_type_param: reactionType
    });

    if (error) {
      return { error: getErrorMessage(error) };
    }

    return { data: data as boolean };
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

export async function uploadPostMedia(
  file: File,
  postId?: string
): Promise<UploadMediaResult> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Authentication required' };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('post-media')
      .upload(fileName, file);

    if (uploadError) {
      return { error: getErrorMessage(uploadError) };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('post-media')
      .getPublicUrl(fileName);

    // If postId is provided, associate with post
    if (postId) {
      const mediaType = file.type.startsWith('image/') ? 'image' : 'video';
      const { error: mediaError } = await supabase.rpc('upload_post_media' as any, {
        post_id_param: postId,
        media_url_param: publicUrl,
        media_type_param: mediaType,
        file_size_param: file.size
      });

      if (mediaError) {
        // Clean up uploaded file if database operation fails
        await supabase.storage.from('post-media').remove([fileName]);
        return { error: getErrorMessage(mediaError) };
      }
    }

    return { data: publicUrl };
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

// Following feed posts
export const getFollowingFeedPosts = async (limit = 20, offset = 0): Promise<FeedPostsResult> => {
  try {
    const { data, error } = await supabase.rpc('get_following_feed_posts', {
      limit_count: limit,
      offset_count: offset
    });

    if (error) throw error;

    return {
      data: (data || []).map(post => ({
        ...post,
        reactions_summary: (post.reactions_summary as any) || {}
      }))
    };
  } catch (error) {
    console.error('Error fetching following feed posts:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch following feed posts'
    };
  }
};

// Saved posts
export const getSavedPosts = async (limit = 20, offset = 0): Promise<FeedPostsResult> => {
  try {
    const { data, error } = await supabase.rpc('get_saved_posts', {
      limit_count: limit,
      offset_count: offset
    });

    if (error) throw error;

    return {
      data: (data || []).map(post => ({
        ...post,
        reactions_summary: (post.reactions_summary as any) || {}
      }))
    };
  } catch (error) {
    console.error('Error fetching saved posts:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch saved posts'
    };
  }
};

// Utility function to extract hashtags
export const extractHashtags = (content: string): string[] => {
  const hashtags = content.match(/#[\w]+/g) || [];
  return hashtags.map(hashtag => hashtag.slice(1));
};

// Helper function to format reaction counts
export function formatReactionCounts(reactions: Record<string, number> | null): string {
  if (!reactions) return '';
  
  const total = Object.values(reactions).reduce((sum, count) => sum + count, 0);
  if (total === 0) return '';
  
  const topReactions = Object.entries(reactions)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([type]) => REACTION_TYPES[type as ReactionType])
    .join('');
    
  return total > 3 ? `${topReactions} +${total - 3}` : topReactions;
}

// Helper to get most popular reaction
export function getMostPopularReaction(reactions: Record<string, number> | null): ReactionType | null {
  if (!reactions) return null;
  
  const entries = Object.entries(reactions);
  if (entries.length === 0) return null;
  
  const [topReaction] = entries.sort(([,a], [,b]) => b - a);
  return topReaction[0] as ReactionType;
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
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'post_reactions',
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