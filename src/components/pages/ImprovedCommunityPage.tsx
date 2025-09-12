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
import { supabase } from '@/integrations/supabase/client';

// Enhanced interfaces for social features
interface SocialPost {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    verified?: boolean;
    followers: number;
  };
  content: string;
  images?: string[];
  hashtags: string[];
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  views: number;
  isLiked?: boolean;
  isSaved?: boolean;
  isFollowing?: boolean;
  createdAt: Date;
  isPinned?: boolean;
  category?: string;
  location?: string;
}

interface Comment {
  id: string;
  postId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  content: string;
  likes: number;
  isLiked?: boolean;
  createdAt: Date;
  replies?: Comment[];
}

const generateMockPosts = (): SocialPost[] => [
  {
    id: 'post-1',
    userId: 'user-1',
    user: {
      id: 'user-1',
      name: 'Sarah Design',
      username: '@sarahdesign',
      avatar: '',
      verified: true,
      followers: 12547
    },
    content: 'Just dropped this minimalist t-shirt design! What do you think? 🎨 The inspiration came from urban architecture and clean lines. #minimalist #tshirt #design #urban',
    images: ['/api/placeholder/400/400'],
    hashtags: ['minimalist', 'tshirt', 'design', 'urban'],
    likes: 234,
    comments: 47,
    shares: 12,
    saves: 89,
    views: 2341,
    isLiked: false,
    isSaved: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isPinned: true,
    category: 'Fashion'
  },
  {
    id: 'post-2',
    userId: 'user-2',
    user: {
      id: 'user-2',
      name: 'Mike Creative',
      username: '@mikecreative',
      avatar: '',
      followers: 8932
    },
    content: 'Behind the scenes of my latest hoodie collection. The process is just as important as the result! Each design goes through 15+ iterations before I\'m satisfied. What\'s your creative process like? 💪',
    hashtags: ['hoodie', 'behindthescenes', 'process', 'creative'],
    likes: 156,
    comments: 23,
    shares: 8,
    saves: 45,
    views: 1876,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    category: 'Behind the Scenes'
  },
  {
    id: 'post-3',
    userId: 'user-3',
    user: {
      id: 'user-3',
      name: 'Emma Artist',
      username: '@emmaartist',
      avatar: '',
      verified: true,
      followers: 15698
    },
    content: 'Nature-inspired designs are my passion. This forest-themed collection took 3 months to perfect 🌲 Each piece tells a story about conservation and our connection to nature.',
    hashtags: ['nature', 'forest', 'collection', 'inspiration', 'sustainability'],
    likes: 342,
    comments: 67,
    shares: 24,
    saves: 127,
    views: 3542,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    category: 'Nature'
  }
];

const generateMockComments = (postId: string): Comment[] => [
  {
    id: 'comment-1',
    postId,
    userId: 'user-4',
    user: {
      id: 'user-4',
      name: 'Alex Fan',
      username: '@alexfan',
      avatar: ''
    },
    content: 'This is absolutely gorgeous! Love the minimalist approach 😍',
    likes: 12,
    isLiked: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    id: 'comment-2',
    postId,
    userId: 'user-5',
    user: {
      id: 'user-5',
      name: 'Jordan Designer',
      username: '@jordandesigner',
      avatar: ''
    },
    content: 'What software did you use for this? The lines are so clean!',
    likes: 8,
    isLiked: true,
    createdAt: new Date(Date.now() - 45 * 60 * 1000)
  }
];

const trendingHashtags = [
  { tag: 'minimalist', posts: 2341, growth: 12 },
  { tag: 'streetwear', posts: 1876, growth: 8 },
  { tag: 'vintage', posts: 1543, growth: 5 },
  { tag: 'sustainable', posts: 1234, growth: 15 },
  { tag: 'handmade', posts: 987, growth: 3 }
];

export const ImprovedCommunityPage = () => {
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [postComments, setPostComments] = useState<Record<string, Comment[]>>({});
  const [newPostContent, setNewPostContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const pullToRefreshRef = useRef<HTMLDivElement>(null);

  // Initialize mock data
  useEffect(() => {
    setPosts(generateMockPosts());
    
    const commentsData: Record<string, Comment[]> = {};
    generateMockPosts().forEach(post => {
      commentsData[post.id] = generateMockComments(post.id);
    });
    setPostComments(commentsData);
  }, []);

  // Infinite scroll
  const { loadMoreRef } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: loadMorePosts,
  });

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleLike = async (postId: string) => {
    if (!(await mustBeAuthedOrRedirect())) return;
    
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
    
    const post = posts.find(p => p.id === postId);
    // Add haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleSave = async (postId: string) => {
    if (!(await mustBeAuthedOrRedirect())) return;
    
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isSaved: !post.isSaved,
            saves: post.isSaved ? post.saves - 1 : post.saves + 1
          }
        : post
    ));
    
    const post = posts.find(p => p.id === postId);
    toast(post?.isSaved ? 'Unsaved' : 'Saved!');
  };

  const handleComment = async (postId: string, content: string) => {
    if (!(await mustBeAuthedOrRedirect())) return;
    if (!content.trim()) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      postId,
      userId: user?.id || 'current-user',
      user: {
        id: user?.id || 'current-user',
        name: user?.name || 'You',
        username: user?.username || '@you',
        avatar: user?.avatar
      },
      content,
      likes: 0,
      isLiked: false,
      createdAt: new Date()
    };

    setPostComments(prev => ({
      ...prev,
      [postId]: [newComment, ...(prev[postId] || [])]
    }));

    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, comments: post.comments + 1 }
        : post
    ));

    toast('Comment added!');
  };

  const handleShare = async (post: SocialPost) => {
    const shareUrl = `${window.location.origin}/community/post/${post.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out this design by ${post.user.name}`,
          text: post.content,
          url: shareUrl
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast('Link copied to clipboard!');
    }
    
    setPosts(prev => prev.map(p => 
      p.id === post.id ? { ...p, shares: p.shares + 1 } : p
    ));
  };

  const handleCreatePost = async () => {
    if (!(await mustBeAuthedOrRedirect())) return;
    if (!newPostContent.trim()) return;

    const hashtags = newPostContent.match(/#[\w]+/g)?.map(tag => tag.slice(1)) || [];
    
    const newPost: SocialPost = {
      id: `post-${Date.now()}`,
      userId: user?.id || 'current-user',
      user: {
        id: user?.id || 'current-user',
        name: user?.name || 'You',
        username: user?.username || '@you',
        avatar: user?.avatar,
        followers: 0
      },
      content: newPostContent,
      hashtags,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      views: 1,
      createdAt: new Date()
    };

    setPosts(prev => [newPost, ...prev]);
    setNewPostContent('');
    setShowCreatePost(false);
    toast('Post created! 🎉');
  };

  const mustBeAuthedOrRedirect = async (): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/auth';
      return false;
    }
    return true;
  };

  function loadMorePosts() {
    if (!hasMore || isLoading) return;
    
    setIsLoading(true);
    setTimeout(() => {
      const morePosts = generateMockPosts().map(post => ({
        ...post,
        id: `${post.id}-more-${Date.now()}`,
        createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
      }));
      setPosts(prev => [...prev, ...morePosts]);
      setIsLoading(false);
      
      if (posts.length > 15) {
        setHasMore(false);
        toast('You\'ve reached the end!');
      }
    }, 1000);
  }

  // Filter posts based on active tab and search
  const filteredPosts = posts.filter(post => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        post.content.toLowerCase().includes(query) ||
        post.hashtags.some(tag => tag.toLowerCase().includes(query)) ||
        post.user.name.toLowerCase().includes(query) ||
        post.user.username.toLowerCase().includes(query)
      );
    }
    
    switch (activeTab) {
      case 'trending':
        return post.likes > 200;
      case 'following':
        return post.isFollowing;
      case 'saved':
        return post.isSaved;
      default:
        return true;
    }
  });

  const PostCard = ({ post }: { post: SocialPost }) => {
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const comments = postComments[post.id] || [];

    return (
      <Card className="border border-border/10 rounded-3xl overflow-hidden bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 mb-4">
        {/* Post Header */}
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-11 h-11 ring-2 ring-border/20">
                <AvatarImage src={post.user.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 font-semibold">
                  {post.user.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground text-sm">
                    {post.user.name}
                  </span>
                  {post.user.verified && (
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 h-4 px-1">
                      ✓
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {post.user.username} • {formatTimeAgo(post.createdAt)}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Post Content */}
          <div className="space-y-3">
            <p className="text-sm leading-relaxed">{post.content}</p>
            
            {/* Post Image */}
            {post.images && post.images.length > 0 && (
              <div className="rounded-2xl overflow-hidden bg-muted/30">
                <img 
                  src={post.images[0]} 
                  alt="Post content"
                  className="w-full aspect-square object-cover"
                />
              </div>
            )}

            {/* Hashtags */}
            {post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {post.hashtags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                    #{tag}
                  </Badge>
                ))}
                {post.hashtags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{post.hashtags.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="px-4 py-2 border-t border-border/10">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{post.likes.toLocaleString()} likes</span>
            <div className="flex items-center gap-3">
              <span>{post.comments} comments</span>
              <span>{post.shares} shares</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 pt-2 border-t border-border/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(post.id)}
                className={cn(
                  "h-9 px-3 gap-2",
                  post.isLiked ? "text-red-500" : "text-muted-foreground"
                )}
              >
                <Heart className={cn("h-4 w-4", post.isLiked && "fill-current")} />
                <span className="text-sm">{post.likes}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="h-9 px-3 gap-2 text-muted-foreground"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">{post.comments}</span>
              </Button>
              
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
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-muted text-xs">
                    {user?.name?.slice(0, 2) || 'You'}
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
                      <AvatarImage src={comment.user.avatar} />
                      <AvatarFallback className="bg-muted text-xs">
                        {comment.user.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="bg-muted/50 rounded-xl px-3 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-xs">{comment.user.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-1 ml-3">
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground">
                          <Heart className="h-3 w-3 mr-1" />
                          {comment.likes}
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
                  {trendingHashtags.map(hashtag => (
                    <div key={hashtag.tag} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div>
                        <span className="font-medium">#{hashtag.tag}</span>
                        <p className="text-xs text-muted-foreground">{hashtag.posts.toLocaleString()} posts</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        +{hashtag.growth}%
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
        </Tabs>

        {/* Posts Feed */}
        <div className="space-y-0">
          {filteredPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* Infinite scroll trigger */}
        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
          {hasMore && isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
              Loading more posts...
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-background rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[80vh] sm:max-h-[70vh] overflow-hidden">
            <div className="p-6 border-b border-border/20">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Create Post</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowCreatePost(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-3">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20">
                    {user?.name?.slice(0, 2) || 'You'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="What's on your mind?"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="min-h-32 resize-none border-0 bg-transparent p-0 text-base focus-visible:ring-0"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border/20">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Camera className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim()}
                  className="rounded-full px-6"
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button - Mobile */}
      <Button
        onClick={() => setShowCreatePost(true)}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full shadow-lg lg:hidden z-40"
        size="sm"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};