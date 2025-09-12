import React, { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Search, 
  Plus,
  Send,
  Loader2,
  TrendingUp,
  Users,
  BookmarkCheck,
  Smile
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import {
  Post,
  Comment,
  createPost,
  getFeedPosts,
  getFollowingFeedPosts,
  getSavedPosts,
  togglePostLike,
  togglePostSave,
  createComment,
  getPostComments,
  formatTimeAgo,
  formatDisplayName,
  getAvatarUrl,
  formatReactionCounts,
  getMostPopularReaction,
  REACTION_TYPES,
  ReactionType
} from '@/lib/community';
import { BrandHeader } from '@/components/ui/brand-header';
import { EmptyStates } from '@/components/community/EmptyStates';
import { PostCreator } from '@/components/community/PostCreator';
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
  
  // State management
  const [activeTab, setActiveTab] = useState<'feed' | 'trending' | 'following' | 'saved'>('feed');
  const [posts, setPosts] = useState<ExtendedPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Record<string, ExtendedComment[]>>({});
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load posts when tab changes
  useEffect(() => {
    loadPosts();
  }, [activeTab]);

  const loadPosts = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      switch (activeTab) {
        case 'following':
          result = await getFollowingFeedPosts();
          break;
        case 'saved':
          result = await getSavedPosts();
          break;
        case 'trending':
        case 'feed':
        default:
          result = await getFeedPosts();
          break;
      }

      if (result.success) {
        const extendedPosts = result.posts.map(post => ({
          ...post,
          ...getMockExtendedFields()
        }));
        setPosts(extendedPosts);
      } else {
        setError(result.error || "Failed to load posts");
        toast.error(result.error || "Failed to load posts");
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      setError("Failed to load posts");
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const loadCommentsForPost = async (postId: string) => {
    if (comments[postId]) return; // Already loaded
    
    const { data, error } = await getPostComments(postId);
    if (!error && data) {
      setComments(prev => ({
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
      const { data: commentsData, error: commentsError } = await getPostComments(postId);
      if (!commentsError && commentsData) {
        setComments(prev => ({
          ...prev,
          [postId]: commentsData.map(comment => ({
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

      // Clear the comment input
      setNewComments(prev => ({ ...prev, [postId]: '' }));

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
    await loadPosts();
    setShowCreateModal(false);
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
      return post.likes_count > 0; // Lower threshold for demo
    }
    
    return true;
  });

  const PostCard = ({ post }: { post: ExtendedPost }) => {
    const [showComments, setShowComments] = useState(false);
    const postComments = comments[post.id] || [];

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

    return (
      <Card className="border border-border/10 rounded-3xl overflow-hidden bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 mb-4">
        {/* Post Header */}
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-11 h-11 ring-2 ring-border/20">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-semibold">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-foreground truncate">
                    {displayName}
                  </h4>
                  {post.username && (
                    <span className="text-muted-foreground text-sm">
                      @{post.username}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatTimeAgo(post.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="space-y-3">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>

            {/* Post Images */}
            {post.media_urls && post.media_urls.length > 0 && (
              <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden">
                {post.media_urls.slice(0, 4).map((url, index) => (
                  <div key={index} className="relative aspect-square">
                    <img 
                      src={url} 
                      alt="Post content" 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {index === 3 && post.media_urls!.length > 4 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold">
                        +{post.media_urls!.length - 4}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="px-4 py-2 border-t border-border/10">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              {post.likes_count > 0 && (
                <span>{post.likes_count} {post.likes_count === 1 ? 'like' : 'likes'}</span>
              )}
              {post.comments_count > 0 && (
                <span>{post.comments_count} {post.comments_count === 1 ? 'comment' : 'comments'}</span>
              )}
              {post.shares && post.shares > 0 && (
                <span>{post.shares} {post.shares === 1 ? 'share' : 'shares'}</span>
              )}
            </div>
            {formatReactionCounts(post.reactions_summary) && (
              <span>{formatReactionCounts(post.reactions_summary)}</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 py-3 border-t border-border/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-2 px-3 hover:bg-red-500/10 hover:text-red-500 transition-colors ${
                  post.is_liked_by_user ? 'text-red-500 bg-red-500/10' : ''
                }`}
              >
                <Heart className={`w-4 h-4 ${post.is_liked_by_user ? 'fill-current' : ''}`} />
                <span className="font-medium">{post.likes_count}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleComments}
                className="flex items-center gap-2 px-3 hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="font-medium">{post.comments_count}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleShare(post)}
                className="flex items-center gap-2 px-3 hover:bg-green-500/10 hover:text-green-500 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span className="font-medium">{post.shares || 0}</span>
              </Button>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="px-3 hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Smile className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSave(post.id)}
                className={`px-3 hover:bg-yellow-500/10 hover:text-yellow-500 transition-colors ${
                  post.isSaved ? 'text-yellow-500 bg-yellow-500/10' : ''
                }`}
              >
                {post.isSaved ? (
                  <BookmarkCheck className="w-4 h-4 fill-current" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="border-t border-border/10">
            <div className="p-4 space-y-4">
              {/* Add Comment */}
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary text-sm">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComments[post.id] || ''}
                    onChange={(e) => setNewComments(prev => ({ ...prev, [post.id]: e.target.value }))}
                    className="resize-none min-h-[60px] bg-muted/30 border-border/20 focus:border-primary/50"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleComment(post.id, newComments[post.id] || '')}
                    disabled={!newComments[post.id]?.trim()}
                    className="self-end"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {postComments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <Avatar className="w-7 h-7">
                      <AvatarImage src={getAvatarUrl(comment)} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary text-xs">
                        {formatDisplayName(comment).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="bg-muted/30 rounded-2xl px-3 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {formatDisplayName(comment)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md mx-auto text-center">
          <CardHeader>
            <h2 className="text-2xl font-bold">Join the Community</h2>
            <p className="text-muted-foreground">
              Sign in to share your designs and connect with other creators.
            </p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = '/auth/signin'}
              className="w-full"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <BrandHeader
        title="Community"
        subtitle="Connect with creators and share your designs"
        className="mb-8"
      >
        <Button
          onClick={() => setShowCreateModal(true)}
          className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Create Post
        </Button>
      </BrandHeader>

      <div className="container mx-auto px-6 pb-12">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search posts, users, or hashtags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-card/50 backdrop-blur-sm border-border/20 focus:border-primary/50 rounded-2xl"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-4 bg-card/30 backdrop-blur-sm rounded-2xl p-1">
              <TabsTrigger 
                value="feed" 
                className="flex items-center gap-2 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <span>Feed</span>
              </TabsTrigger>
              <TabsTrigger 
                value="trending" 
                className="flex items-center gap-2 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Trending</span>
              </TabsTrigger>
              <TabsTrigger 
                value="following" 
                className="flex items-center gap-2 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Users className="w-4 h-4" />
                <span>Following</span>
              </TabsTrigger>
              <TabsTrigger 
                value="saved" 
                className="flex items-center gap-2 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Bookmark className="w-4 h-4" />
                <span>Saved</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading posts...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <Button onClick={loadPosts} variant="outline">
                    Try Again
                  </Button>
                </div>
              ) : filteredPosts.length === 0 ? (
                <EmptyStates
                  type={activeTab}
                  onCreatePost={() => setShowCreateModal(true)}
                  onExplore={() => setActiveTab('feed')}
                />
              ) : (
                <div className="space-y-6">
                  {filteredPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <PostCreator
          onPostCreated={handleCreatePost}
        />
      )}

      {/* Mobile FAB */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Button
          onClick={() => setShowCreateModal(true)}
          size="lg"
          className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-xl"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};