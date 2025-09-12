import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrandHeader } from '@/components/ui/brand-header';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAppStore } from '@/store/useAppStore';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { SearchAndFilters } from '@/components/community/SearchAndFilters';
import { PostDrafts } from '@/components/community/PostDrafts';
import { KeyboardShortcuts } from '@/components/community/KeyboardShortcuts';
import { PullToRefresh } from '@/components/community/PullToRefresh';
import { NotificationsBell } from '@/components/ui/NotificationsBell';
import { MentionHashtagParser } from '@/components/community/MentionHashtagParser';
import { ReportModal } from '@/components/community/ReportModal';
import { EmptyStates } from '@/components/community/EmptyStates';
import { PostCreator } from '@/components/community/PostCreator';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  Search,
  Plus,
  Users,
  Hash,
  Send,
  UserPlus,
  TrendingUp,
  Flag,
  X,
  ChevronDown,
  Camera,
  Smile,
  User,
  ArrowLeft,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import {
  getFeedPosts,
  getFollowingFeedPosts,
  getSavedPosts,
  createPost,
  togglePostLike,
  togglePostSave,
  createComment,
  getPostComments,
  formatTimeAgo,
  formatDisplayName,
  getAvatarUrl,
  extractHashtags,
  type Post,
  type Comment
} from '@/lib/community';
import { MediaUpload } from '@/components/studio/MediaUpload';
import { ReactionPicker } from '@/components/studio/ReactionPicker';

// Extended interfaces for additional UI features
interface ExtendedPost extends Post {
  hashtags?: string[];
  images?: string[];
  shares?: number;
  saves?: number;
  views?: number;
  isSaved?: boolean;
  isFollowing?: boolean;
  isPinned?: boolean;
  category?: string;
  location?: string;
}

interface ExtendedComment extends Comment {
  likes?: number;
  isLiked?: boolean;
  replies?: ExtendedComment[];
}

// Mock data for features not yet implemented in API v1
const getMockExtendedFields = () => ({
  hashtags: [],
  images: [],
  shares: 0,
  saves: 0,
  views: 1,
  isSaved: false,
  isFollowing: false,
  isPinned: false,
  category: 'General',
  location: undefined
});

const trendingHashtags = [
  { tag: 'minimalist', posts: 2341, growth: 12 },
  { tag: 'streetwear', posts: 1876, growth: 8 },
  { tag: 'vintage', posts: 1543, growth: 5 },
  { tag: 'sustainable', posts: 1234, growth: 15 },
  { tag: 'handmade', posts: 987, growth: 3 }
];

export const ImprovedCommunityPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState<ExtendedPost[]>([]);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [postComments, setPostComments] = useState<Record<string, ExtendedComment[]>>({});
  const [newPostContent, setNewPostContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [offset, setOffset] = useState(0);
  const [uploadedMedia, setUploadedMedia] = useState<Array<{ url: string; type: 'image' | 'video' }>>([]);
  const pullToRefreshRef = useRef<HTMLDivElement>(null);
  
  // Phase 3: Enhanced features state
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'trending' | 'popular'>('recent');
  const [trendingHashtagsData] = useState(['fashion', 'design', 'streetwear', 'sustainable', 'vintage']);
  const [focusedPostIndex, setFocusedPostIndex] = useState(0);

  // Real-time updates
  const { isConnected } = useRealtimeUpdates({
    onNewPost: (post) => {
      setPosts(prev => [post as ExtendedPost, ...prev]);
      toast.success('New post arrived!');
    },
    onPostUpdate: (postId, updates) => {
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, ...updates } : post
      ));
    },
    onNewComment: (comment) => {
      setPostComments(prev => ({
        ...prev,
        [comment.post_id]: [...(prev[comment.post_id] || []), comment as ExtendedComment]
      }));
    }
  });

  // Load posts based on active tab
  useEffect(() => {
    loadInitialPosts();
  }, [activeTab]);

  const loadInitialPosts = async () => {
    setIsLoading(true);
    setPosts([]);
    setOffset(0);
    
    let result;
    switch (activeTab) {
      case 'following':
        result = await getFollowingFeedPosts(20, 0);
        break;
      case 'saved':
        result = await getSavedPosts(20, 0);
        break;
      default:
        result = await getFeedPosts(20, 0);
    }
    
    const { data, error } = result;
    
    if (error) {
      toast.error(error);
      setIsLoading(false);
      return;
    }

    if (data) {
      const extendedPosts = data.map(post => ({
        ...post,
        ...getMockExtendedFields(),
        hashtags: extractHashtags(post.content),
        // Map v2 fields properly
        images: post.media_urls?.filter((_, i) => post.media_types?.[i] === 'image') || [],
        isSaved: post.is_saved_by_user
      }));
      setPosts(extendedPosts);
      setOffset(data.length);
      setHasMore(data.length === 20); // If we got fewer than requested, no more data
    }
    setIsLoading(false);
  };

  const extractHashtagsLocal = (content: string): string[] => {
    const hashtags = content.match(/#[\w]+/g)?.map(tag => tag.slice(1)) || [];
    return hashtags;
  };

  const loadMorePosts = async () => {
    if (!hasMore || isLoading) return;
    
    setIsLoading(true);
    
    let result;
    switch (activeTab) {
      case 'following':
        result = await getFollowingFeedPosts(20, offset);
        break;
      case 'saved':
        result = await getSavedPosts(20, offset);
        break;
      default:
        result = await getFeedPosts(20, offset);
    }
    
    const { data, error } = result;
    
    if (error) {
      toast.error(error);
      setIsLoading(false);
      return;
    }

    if (data) {
      if (data.length === 0) {
        setHasMore(false);
        if (posts.length > 0) {
          toast.success('You\'ve reached the end!');
        }
      } else {
        const extendedPosts = data.map(post => ({
          ...post,
          ...getMockExtendedFields(),
          hashtags: extractHashtagsLocal(post.content),
          // Map v2 fields properly with null checks
          images: (post.media_urls || []).filter((_, i) => (post.media_types || [])[i] === 'image'),
          isSaved: post.is_saved_by_user || false
        }));
        setPosts(prev => [...prev, ...extendedPosts]);
        setOffset(prev => prev + data.length); // Use actual data length, not hardcoded 20
      }
    }
    setIsLoading(false);
  };

  const loadCommentsForPost = async (postId: string) => {
    if (postComments[postId]) return; // Already loaded
    
    const { data, error } = await getPostComments(postId);
    if (!error && data) {
      setPostComments(prev => ({
        ...prev,
        [postId]: data.map(comment => ({
          ...comment,
          likes: 0,
          isLiked: false,
          replies: []
        }))
      }));
    }
  };

  // Infinite scroll
  const { loadMoreRef } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: loadMorePosts,
  });

  // Auth helper
  const mustBeAuthedOrRedirect = (): boolean => {
    if (!user) {
      window.location.href = '/auth/signin';
      return false;
    }
    return true;
  };

  const handleLike = async (postId: string) => {
    if (!mustBeAuthedOrRedirect()) return;
    
    // Optimistic update
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const newLikedState = !post.is_liked_by_user;
    const newLikesCount = newLikedState ? post.likes_count + 1 : post.likes_count - 1;

    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { 
            ...p, 
            is_liked_by_user: newLikedState,
            likes_count: newLikesCount
          }
        : p
    ));
    
    // Add haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Persist to backend
    const { error } = await togglePostLike(postId);
    if (error) {
      // Revert optimistic update on error
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              is_liked_by_user: post.is_liked_by_user,
              likes_count: post.likes_count
            }
          : p
      ));
      toast.error(error);
    }
  };

  const handleSave = async (postId: string) => {
    if (!mustBeAuthedOrRedirect()) return;
    
    // Optimistic update
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const newSavedState = !post.isSaved;
    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { 
            ...p, 
            isSaved: newSavedState,
            saves: newSavedState ? (p.saves || 0) + 1 : Math.max((p.saves || 0) - 1, 0)
          }
        : p
    ));

    // Persist to backend
    const { error } = await togglePostSave(postId);
    if (error) {
      // Revert optimistic update on error
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              isSaved: post.isSaved,
              saves: post.saves
            }
          : p
      ));
      toast.error(error);
    } else {
      toast.success(newSavedState ? 'Post saved!' : 'Post unsaved');
    }
  };

  const handleComment = async (postId: string, content: string) => {
    if (!mustBeAuthedOrRedirect()) return;
    if (!content.trim()) return;

    const { data: commentId, error } = await createComment(postId, content);
    
    if (error) {
      toast.error(error);
      return;
    }

    if (commentId) {
      // Refresh comments for this post
      const { data: comments, error: commentsError } = await getPostComments(postId);
      if (!commentsError && comments) {
        setPostComments(prev => ({
          ...prev,
          [postId]: comments.map(comment => ({
            ...comment,
            likes: 0,
            isLiked: false,
            replies: []
          }))
        }));
      }

      // Update post comment count
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, comments_count: post.comments_count + 1 }
          : post
      ));

      toast.success('Comment added!');
    }
  };

  const handleShare = async (post: ExtendedPost) => {
    const shareUrl = `${window.location.origin}/community/post/${post.id}`;
    const userName = formatDisplayName({
      username: post.username,
      display_name: post.display_name,
      avatar_url: post.avatar_url
    });
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out this post by ${userName}`,
          text: post.content,
          url: shareUrl
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    }
    
    setPosts(prev => prev.map(p => 
      p.id === post.id ? { ...p, shares: (p.shares || 0) + 1 } : p
    ));
  };

  const handleCreatePost = async () => {
    // Refresh the feed to show the new post
    await loadInitialPosts();
    setShowCreatePost(false);
  };

  // Filter posts based on search only - tabs handle server-side filtering
  const filteredPosts = posts.filter(post => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const displayName = formatDisplayName({
        username: post.username,
        display_name: post.display_name,
        avatar_url: post.avatar_url
      });
      return (
        post.content.toLowerCase().includes(query) ||
        (post.hashtags && post.hashtags.some(tag => tag.toLowerCase().includes(query))) ||
        displayName.toLowerCase().includes(query) ||
        (post.username && post.username.toLowerCase().includes(query))
      );
    }
    
    // For trending tab, apply client-side filter for popular posts
    if (activeTab === 'trending') {
      return post.likes_count > 5; // Lower threshold for demo
    }
    
    return true;
  });

  const PostCard = ({ post }: { post: ExtendedPost }) => {
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const comments = postComments[post.id] || [];

    const displayName = formatDisplayName({
      username: post.username,
      display_name: post.display_name,
      avatar_url: post.avatar_url
    });

    const avatarUrl = getAvatarUrl({
      username: post.username,
      display_name: post.display_name,
      avatar_url: post.avatar_url
    });

    const handleToggleComments = () => {
      if (!showComments) {
        loadCommentsForPost(post.id);
      }
      setShowComments(!showComments);
    };

    const handleReactionUpdate = (newReactions: Record<string, number>, newUserReaction: string | null) => {
      setPosts(prev => prev.map(p => 
        p.id === post.id 
          ? { 
              ...p, 
              reactions_summary: newReactions,
              user_reaction: newUserReaction
            }
          : p
      ));
    };

    return (
      <Card className="border border-border/10 rounded-3xl overflow-hidden bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 mb-4">
        {/* Post Header */}
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-11 h-11 ring-2 ring-border/20">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 font-semibold">
                  {displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground text-sm">
                    {displayName}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {post.username && `@${post.username}`} • {formatTimeAgo(post.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ReportModal
                targetType="post"
                targetId={post.id}
                triggerButton={
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
          </div>

          {/* Post Content */}
          <div className="mb-4">
            <MentionHashtagParser content={post.content} />
          </div>

          {/* Post Images */}
          {post.images && post.images.length > 0 && (
            <div className={cn(
              "grid gap-2 rounded-2xl overflow-hidden mb-4",
              post.images.length === 1 ? "grid-cols-1" : 
              post.images.length === 2 ? "grid-cols-2" : 
              "grid-cols-2"
            )}>
              {post.images.slice(0, 4).map((image, index) => (
                <div
                  key={index}
                  className={cn(
                    "relative aspect-square overflow-hidden",
                    post.images!.length === 3 && index === 0 ? "col-span-2" : ""
                  )}
                >
                  <img
                    src={image}
                    alt={`Post image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {post.images!.length > 4 && index === 3 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-medium">+{post.images!.length - 4}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Engagement Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-4">
              {post.likes_count > 0 && (
                <span>{post.likes_count} likes</span>
              )}
              {post.comments_count > 0 && (
                <span>{post.comments_count} comments</span>
              )}
              {(post.shares || 0) > 0 && (
                <span>{post.shares} shares</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {post.views && post.views > 1 && (
                <span>{post.views} views</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between border-t border-border/10 pt-3">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(post.id)}
                className={cn(
                  "h-9 px-3 gap-2",
                  post.is_liked_by_user ? "text-red-500 hover:text-red-600" : "text-muted-foreground"
                )}
              >
                <Heart className={cn("h-4 w-4", post.is_liked_by_user && "fill-current")} />
                <span className="text-sm">{post.likes_count}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleComments}
                className="h-9 px-3 gap-2 text-muted-foreground"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">{post.comments_count}</span>
              </Button>

              <ReactionPicker
                postId={post.id}
                reactions={post.reactions_summary}
                userReaction={post.user_reaction}
                onReactionUpdate={handleReactionUpdate}
              />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleShare(post)}
                className="h-9 px-3 gap-2 text-muted-foreground"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSave(post.id)}
              className={cn(
                "h-9 px-3",
                post.isSaved ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Bookmark className={cn("h-4 w-4", post.isSaved && "fill-current")} />
            </Button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-4 space-y-3 border-t border-border/10 pt-4">
              {/* Add Comment */}
              <div className="flex gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-muted text-xs">
                    You
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 h-9 text-sm border-border/30 rounded-xl"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newComment.trim()) {
                        handleComment(post.id, newComment);
                        setNewComment('');
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      if (newComment.trim()) {
                        handleComment(post.id, newComment);
                        setNewComment('');
                      }
                    }}
                    disabled={!newComment.trim()}
                    className="h-9 px-3"
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {comments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="w-7 h-7 flex-shrink-0">
                      <AvatarImage src={getAvatarUrl({
                        username: comment.username,
                        display_name: comment.display_name,
                        avatar_url: comment.avatar_url
                      })} />
                      <AvatarFallback className="bg-muted text-xs">
                        {formatDisplayName({
                          username: comment.username,
                          display_name: comment.display_name,
                          avatar_url: comment.avatar_url
                        }).slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="bg-muted/50 rounded-xl px-3 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-xs">
                            {formatDisplayName({
                              username: comment.username,
                              display_name: comment.display_name,
                              avatar_url: comment.avatar_url
                            })}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-1 ml-3">
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground">
                          <Heart className="h-3 w-3 mr-1" />
                          {comment.likes || 0}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground">
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Header */}
      <BrandHeader title="Community" className="border-b border-border/30 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden">
                <Filter className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Trending Hashtags</h3>
                <div className="space-y-2">
                  {trendingHashtagsData.map(hashtag => (
                    <div key={hashtag} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div>
                        <span className="font-medium">#{hashtag}</span>
                        <p className="text-xs text-muted-foreground">{Math.floor(Math.random() * 1000)} posts</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        +{Math.floor(Math.random() * 50)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <Button 
            onClick={() => setShowCreatePost(true)}
            size="sm"
            className="rounded-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Post
          </Button>
        </div>
      </BrandHeader>

      <div className="container mx-auto px-4 py-6 max-w-2xl lg:max-w-4xl">
        {/* Search Bar */}
        <div className="sticky top-20 z-40 bg-background/80 backdrop-blur-md py-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search posts, hashtags, or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-background/50 border-border/30 rounded-2xl"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4 h-11 bg-muted/30 backdrop-blur-sm rounded-2xl">
            <TabsTrigger value="feed" className="rounded-xl text-sm">Feed</TabsTrigger>
            <TabsTrigger value="trending" className="rounded-xl text-sm">
              <TrendingUp className="h-3 w-3 mr-2" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="following" className="rounded-xl text-sm">
              <Users className="h-3 w-3 mr-2" />
              Following
            </TabsTrigger>
            <TabsTrigger value="saved" className="rounded-xl text-sm">
              <Bookmark className="h-3 w-3 mr-2" />
              Saved
            </TabsTrigger>
          </TabsList>

          {/* Posts Feed or Empty States */}
          <TabsContent value="feed" className="space-y-0 mt-0">
            {filteredPosts.length > 0 ? (
              filteredPosts.map(post => <PostCard key={post.id} post={post} />)
            ) : !isLoading ? (
              <EmptyStates 
                type="feed" 
                onCreatePost={() => setShowCreatePost(true)}
                onExplore={() => setActiveTab('trending')}
              />
            ) : null}
          </TabsContent>

          <TabsContent value="trending" className="space-y-0 mt-0">
            {filteredPosts.length > 0 ? (
              filteredPosts.map(post => <PostCard key={post.id} post={post} />)
            ) : !isLoading ? (
              <EmptyStates 
                type="trending" 
                onCreatePost={() => setShowCreatePost(true)}
                onExplore={() => setActiveTab('feed')}
              />
            ) : null}
          </TabsContent>

          <TabsContent value="following" className="space-y-0 mt-0">
            {filteredPosts.length > 0 ? (
              filteredPosts.map(post => <PostCard key={post.id} post={post} />)
            ) : !isLoading ? (
              <EmptyStates 
                type="following" 
                onCreatePost={() => setShowCreatePost(true)}
                onExplore={() => setActiveTab('feed')}
              />
            ) : null}
          </TabsContent>

          <TabsContent value="saved" className="space-y-0 mt-0">
            {filteredPosts.length > 0 ? (
              filteredPosts.map(post => <PostCard key={post.id} post={post} />)
            ) : !isLoading ? (
              <EmptyStates 
                type="saved" 
                onCreatePost={() => setShowCreatePost(true)}
                onExplore={() => setActiveTab('feed')}
              />
            ) : null}
          </TabsContent>

          {/* Infinite scroll trigger */}
          <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
            {hasMore && isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                Loading more posts...
              </div>
            )}
            {!hasMore && filteredPosts.length > 0 && (
              <p className="text-muted-foreground text-sm">You've reached the end!</p>
            )}
          </div>
        </Tabs>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-background rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[80vh] sm:max-h-[70vh] overflow-hidden">
            <PostCreator
              onPostCreated={handleCreatePost}
              onCancel={() => setShowCreatePost(false)}
              className="border-0 shadow-none"
            />
          </div>
        </div>
      )}

      {/* Floating Action Button for Mobile */}
      <Button
        onClick={() => setShowCreatePost(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg sm:hidden z-40"
        size="lg"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};