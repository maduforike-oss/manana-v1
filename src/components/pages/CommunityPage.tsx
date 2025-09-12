import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BrandHeader } from '@/components/ui/brand-header';
import { useAppStore } from '@/store/useAppStore';
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
  Activity,
  Send,
  UserPlus,
  Eye,
  TrendingUp,
  Filter,
  Flag,
  X,
  ChevronDown,
  Camera,
  Smile,
  User,
  Bell,
  Settings
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

interface Activity {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'share' | 'mention';
  userId: string;
  user: {
    name: string;
    username: string;
    avatar?: string;
  };
  targetId?: string;
  content?: string;
  createdAt: Date;
  read: boolean;
}

// Mock data for demonstration
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

const categories = [
  { name: 'Fashion', count: 234, trending: true, icon: '👕' },
  { name: 'Art', count: 187, trending: true, icon: '🎨' },
  { name: 'Nature', count: 156, trending: false, icon: '🌿' },
  { name: 'Abstract', count: 134, trending: false, icon: '🔮' },
  { name: 'Typography', count: 98, trending: false, icon: '✍️' }
];

export const CommunityPage = () => {
  const { user, setActiveTab } = useAppStore();
  const [activeTab, setActiveMainTab] = useState('following');
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [postComments, setPostComments] = useState<Record<string, Comment[]>>({});
  const [newPostContent, setNewPostContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [hasMore, setHasMore] = useState(true);

  // Initialize mock data
  useEffect(() => {
    setPosts(generateMockPosts());
    
    // Generate mock comments for each post
    const commentsData: Record<string, Comment[]> = {};
    generateMockPosts().forEach(post => {
      commentsData[post.id] = generateMockComments(post.id);
    });
    setPostComments(commentsData);

    // Mock activities
    setActivities([
      {
        id: 'activity-1',
        type: 'like',
        userId: 'user-1',
        user: { name: 'Sarah Design', username: '@sarahdesign', avatar: '' },
        targetId: 'post-1',
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        read: false
      },
      {
        id: 'activity-2',
        type: 'follow',
        userId: 'user-2',
        user: { name: 'Mike Creative', username: '@mikecreative', avatar: '' },
        createdAt: new Date(Date.now() - 60 * 60 * 1000),
        read: false
      },
      {
        id: 'activity-3',
        type: 'comment',
        userId: 'user-3',
        user: { name: 'Emma Artist', username: '@emmaartist', avatar: '' },
        targetId: 'post-2',
        content: 'Amazing work!',
        createdAt: new Date(Date.now() - 90 * 60 * 1000),
        read: true
      }
    ]);
  }, []);

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
    toast(post?.isLiked ? 'Unliked' : 'Liked!');
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

  const loadMorePosts = () => {
    if (!hasMore || loadingMore) return;
    
    setLoadingMore(true);
    // Simulate loading more posts
    setTimeout(() => {
      const morePosts = generateMockPosts().map(post => ({
        ...post,
        id: `${post.id}-more-${Date.now()}`,
        createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
      }));
      setPosts(prev => [...prev, ...morePosts]);
      setLoadingMore(false);
      
      // Simulate reaching end after a few loads
      if (posts.length > 15) {
        setHasMore(false);
        toast('You\'ve reached the end!');
      }
    }, 1000);
  };

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || loadingMore) {
        return;
      }
      loadMorePosts();
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore]);

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
    if (selectedCategory && post.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const PostCard = ({ post }: { post: SocialPost }) => {
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const comments = postComments[post.id] || [];

    return (
      <Card className="glass-effect border-border/20 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 animate-fade-in">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 ring-2 ring-primary/20 hover:ring-primary/40 transition-all cursor-pointer">
                <AvatarImage src={post.user.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 font-semibold">
                  {post.user.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground hover:text-primary cursor-pointer transition-colors">
                    {post.user.name}
                  </span>
                  {post.user.verified && (
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                      ✓
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">{post.user.followers.toLocaleString()} followers</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="hover:text-primary cursor-pointer transition-colors">{post.user.username}</span>
                  <span>•</span>
                  <span>{formatTimeAgo(post.createdAt)}</span>
                  {post.isPinned && (
                    <>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                        📌 Pinned
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted/50">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="text-foreground leading-relaxed text-[15px]">{post.content}</p>
            
            {post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.hashtags.map(tag => (
                  <Button
                    key={tag}
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-primary hover:bg-primary/10 transition-all duration-200 text-sm"
                    onClick={() => setSearchQuery(`#${tag}`)}
                  >
                    #{tag}
                  </Button>
                ))}
              </div>
            )}

            {post.images && (
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <img 
                  src={post.images[0]} 
                  alt="Post content"
                  className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Engagement Stats */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground border-t border-border/30 pt-3">
            <div className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer">
              <Eye className="w-4 h-4" />
              <span>{post.views.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>{post.likes} likes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>{post.comments} comments</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>{post.shares} shares</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(post.id)}
                className={cn(
                  "gap-2 transition-all duration-200 hover:scale-105",
                  post.isLiked ? "text-red-500 hover:text-red-600" : "hover:text-red-400"
                )}
              >
                <Heart className={cn("w-4 h-4 transition-all", post.isLiked && "fill-current scale-110")} />
                Like
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="gap-2 hover:text-blue-500 transition-all duration-200 hover:scale-105"
              >
                <MessageCircle className="w-4 h-4" />
                Comment
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleShare(post)}
                className="gap-2 hover:text-green-500 transition-all duration-200 hover:scale-105"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSave(post.id)}
              className={cn(
                "gap-2 transition-all duration-200 hover:scale-105",
                post.isSaved ? "text-primary" : "hover:text-primary"
              )}
            >
              <Bookmark className={cn("w-4 h-4 transition-all", post.isSaved && "fill-current")} />
            </Button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="space-y-4 border-t border-border/30 pt-4 animate-fade-in">
              {/* Add Comment */}
              <div className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-sm">
                    {user?.name?.slice(0, 2) || 'Y'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleComment(post.id, newComment);
                        setNewComment('');
                      }
                    }}
                    className="flex-1 border-border/30 focus:border-primary/50 transition-colors"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      handleComment(post.id, newComment);
                      setNewComment('');
                    }}
                    disabled={!newComment.trim()}
                    className="bg-gradient-to-r from-primary to-secondary text-white hover:from-primary-dark hover:to-secondary-dark"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {comments.map(comment => (
                  <div key={comment.id} className="flex gap-3 animate-fade-in">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.user.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-muted to-muted/50 text-sm">
                        {comment.user.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="bg-muted/50 rounded-2xl px-4 py-2 hover:bg-muted/70 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm hover:text-primary cursor-pointer transition-colors">
                            {comment.user.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed">{comment.content}</p>
                      </div>
                      <div className="flex items-center gap-4 px-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-xs hover:text-red-500 transition-colors"
                        >
                          <Heart className="w-3 h-3 mr-1" />
                          {comment.likes}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-xs hover:text-primary transition-colors"
                        >
                          Reply
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-xs hover:text-red-500 transition-colors"
                        >
                          <Flag className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <BrandHeader title="Community" subtitle="Connect with creators and discover amazing designs">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => toast('Notifications coming soon!')}
          >
            <Bell className="w-5 h-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center">
              3
            </div>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveTab('profile')}
          >
            <User className="w-5 h-5" />
          </Button>
        </div>
      </BrandHeader>
      
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Create Post Button */}
            <Button
              onClick={async () => {
                if (!(await mustBeAuthedOrRedirect())) return;
                setShowCreatePost(true);
              }}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white rounded-2xl py-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Post
            </Button>

            {/* Trending Hashtags */}
            <Card className="glass-effect border-border/20 rounded-2xl overflow-hidden">
              <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-secondary/5">
                <h3 className="font-semibold flex items-center gap-2">
                  <Hash className="w-4 h-4 text-primary" />
                  Trending Now
                </h3>
              </CardHeader>
              <CardContent className="space-y-2">
                {trendingHashtags.map(({ tag, posts, growth }) => (
                  <Button
                    key={tag}
                    variant="ghost"
                    className="w-full justify-between h-auto p-3 hover:bg-primary/5 transition-all duration-200 group"
                    onClick={() => setSearchQuery(`#${tag}`)}
                  >
                    <div className="text-left">
                      <div className="font-medium group-hover:text-primary transition-colors">#{tag}</div>
                      <div className="text-xs text-muted-foreground">{posts.toLocaleString()} posts</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-green-600">+{growth}%</span>
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Categories */}
            <Card className="glass-effect border-border/20 rounded-2xl overflow-hidden">
              <CardHeader className="pb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" />
                  Categories
                </h3>
              </CardHeader>
              <CardContent className="space-y-1">
                <Button
                  variant={selectedCategory === null ? "default" : "ghost"}
                  className="w-full justify-start rounded-xl transition-all duration-200"
                  onClick={() => setSelectedCategory(null)}
                >
                  🌟 All Categories
                </Button>
                {categories.map(({ name, count, trending, icon }) => (
                  <Button
                    key={name}
                    variant={selectedCategory === name ? "default" : "ghost"}
                    className="w-full justify-between rounded-xl transition-all duration-200 hover:scale-[1.02]"
                    onClick={() => setSelectedCategory(name)}
                  >
                    <span className="flex items-center gap-2">
                      <span>{icon}</span>
                      {name}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs">{count}</span>
                      {trending && <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">🔥</Badge>}
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search posts, hashtags, or users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-2xl border-border/30 focus:border-primary/50 transition-colors bg-card/50"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>

            {/* Feed Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveMainTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-card/50 rounded-2xl h-12">
                <TabsTrigger value="following" className="rounded-xl font-medium">Following</TabsTrigger>
                <TabsTrigger value="trending" className="rounded-xl font-medium">🔥 Trending</TabsTrigger>
                <TabsTrigger value="recent" className="rounded-xl font-medium">Recent</TabsTrigger>
                <TabsTrigger value="saved" className="rounded-xl font-medium">Saved</TabsTrigger>
              </TabsList>

              <TabsContent value="following" className="space-y-6 mt-6">
                {filteredPosts.length === 0 ? (
                  <Card className="glass-effect border-border/20 rounded-3xl p-16 text-center">
                    <Users className="w-20 h-20 mx-auto mb-6 text-muted-foreground opacity-50" />
                    <h3 className="text-2xl font-bold mb-3">Your feed is empty</h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
                      Follow some amazing creators to see their latest posts and designs here. 
                      Discover new inspiration every day!
                    </p>
                    <Button className="bg-gradient-to-r from-primary to-secondary text-white hover:from-primary-dark hover:to-secondary-dark shadow-lg">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Find People to Follow
                    </Button>
                  </Card>
                ) : (
                  <>
                    {filteredPosts.map(post => (
                      <PostCard key={post.id} post={post} />
                    ))}
                    
                    {/* Load More */}
                    {hasMore && (
                      <div className="text-center py-8">
                        <Button
                          variant="outline"
                          onClick={loadMorePosts}
                          disabled={loadingMore}
                          className="rounded-2xl px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                          {loadingMore ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                              Loading...
                            </div>
                          ) : (
                            <>
                              Load More Posts
                              <ChevronDown className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                    
                    {!hasMore && posts.length > 0 && (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">🎉 You've seen all the latest posts!</p>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="trending" className="space-y-6 mt-6">
                {filteredPosts
                  .sort((a, b) => (b.likes + b.shares + b.comments) - (a.likes + a.shares + a.comments))
                  .map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
              </TabsContent>

              <TabsContent value="recent" className="space-y-6 mt-6">
                {filteredPosts
                  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                  .map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
              </TabsContent>

              <TabsContent value="saved" className="space-y-6 mt-6">
                {filteredPosts.filter(post => post.isSaved).length === 0 ? (
                  <Card className="glass-effect border-border/20 rounded-3xl p-16 text-center">
                    <Bookmark className="w-20 h-20 mx-auto mb-6 text-muted-foreground opacity-50" />
                    <h3 className="text-2xl font-bold mb-3">No saved posts yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                      Save posts you love by clicking the bookmark icon. 
                      Build your personal collection of inspiration!
                    </p>
                  </Card>
                ) : (
                  filteredPosts
                    .filter(post => post.isSaved)
                    .map(post => (
                      <PostCard key={post.id} post={post} />
                    ))
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Activity Feed */}
            <Card className="glass-effect border-border/20 rounded-2xl overflow-hidden">
              <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                <h3 className="font-semibold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Activity
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {activities.filter(a => !a.read).length} new
                  </Badge>
                </h3>
              </CardHeader>
              <CardContent className="space-y-3 max-h-80 overflow-y-auto">
                {activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No recent activity
                  </p>
                ) : (
                  activities.map(activity => (
                    <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer group">
                      <Avatar className="w-8 h-8 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                        <AvatarImage src={activity.user.avatar} />
                        <AvatarFallback className="text-xs">{activity.user.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm">
                          <span className="font-medium group-hover:text-primary transition-colors">{activity.user.name}</span>
                          {activity.type === 'like' && ' liked your post'}
                          {activity.type === 'follow' && ' started following you'}
                          {activity.type === 'comment' && ' commented on your post'}
                          {activity.type === 'share' && ' shared your post'}
                          {activity.type === 'mention' && ' mentioned you'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatTimeAgo(activity.createdAt)}
                        </div>
                      </div>
                      {!activity.read && (
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Suggested Users */}
            <Card className="glass-effect border-border/20 rounded-2xl overflow-hidden">
              <CardHeader className="pb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-primary" />
                  Suggested for You
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Digital Artist', username: '@digitalart', followers: '12.5K', verified: true },
                  { name: 'Fashion Designer', username: '@fashionista', followers: '8.2K', verified: false },
                  { name: 'Creative Studio', username: '@creativestudio', followers: '15.7K', verified: true }
                ].map(suggestedUser => (
                  <div key={suggestedUser.username} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors group">
                    <Avatar className="w-10 h-10 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 font-semibold">
                        {suggestedUser.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <div className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                          {suggestedUser.name}
                        </div>
                        {suggestedUser.verified && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">✓</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{suggestedUser.followers} followers</div>
                    </div>
                    <Button size="sm" variant="outline" className="h-8 hover:bg-primary hover:text-white transition-colors">
                      Follow
                    </Button>
                  </div>
                ))}
                
                <Button variant="ghost" className="w-full text-sm text-primary hover:bg-primary/10 transition-colors">
                  See all suggestions →
                </Button>
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card className="glass-effect border-border/20 rounded-2xl overflow-hidden">
              <CardHeader className="pb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Community Stats
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl">
                    <div className="text-lg font-bold text-primary">2.1K</div>
                    <div className="text-xs text-muted-foreground">Active Creators</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                    <div className="text-lg font-bold text-green-600">12.8K</div>
                    <div className="text-xs text-muted-foreground">Posts Today</div>
                  </div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                  <div className="text-lg font-bold text-purple-600">156K</div>
                  <div className="text-xs text-muted-foreground">Total Designs Shared</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <Card className="w-full max-w-2xl glass-effect border-border/20 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/30">
              <h2 className="text-xl font-semibold">Create Post</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreatePost(false)}
                className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="flex gap-4">
                <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 font-semibold">
                    {user?.name?.slice(0, 2) || 'Y'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium text-lg">{user?.name || 'Your Name'}</div>
                  <div className="text-sm text-muted-foreground">{user?.username || '@yourname'}</div>
                </div>
              </div>
              
              <Textarea
                placeholder="What's on your mind? Share your latest design, process, or inspiration... Use #hashtags to reach more people!"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="min-h-40 resize-none border-border/30 focus:border-primary/50 bg-muted/30 rounded-2xl text-base leading-relaxed"
              />
              
              <div className="flex items-center justify-between pt-4 border-t border-border/30">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="gap-2 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                    <Camera className="w-4 h-4" />
                    Photo
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2 hover:bg-yellow-100 hover:text-yellow-600 transition-colors">
                    <Smile className="w-4 h-4" />
                    Emoji
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2 hover:bg-purple-100 hover:text-purple-600 transition-colors">
                    <Hash className="w-4 h-4" />
                    Tag
                  </Button>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowCreatePost(false)} className="hover:bg-muted/50 transition-colors">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreatePost}
                    disabled={!newPostContent.trim()}
                    className="bg-gradient-to-r from-primary to-secondary text-white hover:from-primary-dark hover:to-secondary-dark shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Share Post 🚀
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};