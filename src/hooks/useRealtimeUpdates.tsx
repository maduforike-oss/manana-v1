import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Post, Comment } from '@/lib/community';

interface UseRealtimeUpdatesProps {
  onNewPost?: (post: Post) => void;
  onPostUpdate?: (postId: string, updates: Partial<Post>) => void;
  onNewComment?: (comment: Comment) => void;
  onPostDeleted?: (postId: string) => void;
}

export const useRealtimeUpdates = ({
  onNewPost,
  onPostUpdate,
  onNewComment,
  onPostDeleted
}: UseRealtimeUpdatesProps) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Subscribe to posts changes
    const postsChannel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          if (onNewPost) {
            // Fetch full post data with user profile
            onNewPost(payload.new as Post);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          if (onPostUpdate) {
            onPostUpdate(payload.new.id, payload.new as Partial<Post>);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          if (onPostDeleted) {
            onPostDeleted(payload.old.id);
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Subscribe to comments changes
    const commentsChannel = supabase
      .channel('comments-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments'
        },
        (payload) => {
          if (onNewComment) {
            onNewComment(payload.new as Comment);
          }
        }
      )
      .subscribe();

    // Subscribe to likes changes for real-time count updates
    const likesChannel = supabase
      .channel('likes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_likes'
        },
        (payload) => {
          if (onPostUpdate) {
            // Trigger post update to refresh like count
            const postId = (payload.new as any)?.post_id || (payload.old as any)?.post_id;
            if (postId) {
              onPostUpdate(postId, {});
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(likesChannel);
    };
  }, [onNewPost, onPostUpdate, onNewComment, onPostDeleted]);

  return { isConnected };
};