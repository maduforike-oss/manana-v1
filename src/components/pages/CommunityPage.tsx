import { MessageCircle, Heart, Share2, TrendingUp, Users, User } from 'lucide-react';
import { BrandHeader } from '@/components/ui/brand-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

export const CommunityPage = () => {
  const { toast } = useToast();
  const { posts, likedPosts, toggleLikePost, createPost, userProfiles, setActiveTab } = useAppStore();
  const [postContent, setPostContent] = useState('');
  
  // Mock posts with user profiles
  const mockPosts = [
    {
      id: 'post_1',
      userId: 'user_1',
      user: userProfiles[0], // Sarah Design
      content: 'Just finished this amazing galaxy-themed hoodie design! What do you think?',
      image: true,
      likes: 45,
      comments: 12,
      shares: 3,
      isLiked: likedPosts.includes('post_1'),
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      trending: true,
    },
    {
      id: 'post_2', 
      userId: 'user_2',
      user: userProfiles[1], // Mike Creator
      content: 'Tips for creating vintage-style t-shirt designs? Looking for some inspiration!',
      image: false,
      likes: 23,
      comments: 8,
      shares: 1,
      isLiked: likedPosts.includes('post_2'),
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      trending: false,
    },
    {
      id: 'post_3',
      userId: 'user_3', 
      user: userProfiles[2], // Emma Artist
      content: 'My minimalist cap collection is now live in the market! Check it out 🧢',
      image: true,
      likes: 67,
      comments: 15,
      shares: 8,
      isLiked: likedPosts.includes('post_3'),
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      trending: true,
    },
    ...posts // Add user-created posts
  ];

  const handleCreatePost = () => {
    if (postContent.trim()) {
      createPost(postContent);
      setPostContent('');
      toast({ title: "Posted!", description: "Your post has been shared with the community" });
    }
  };

  const handleLikePost = (postId: string) => {
    toggleLikePost(postId);
    const isLiked = likedPosts.includes(postId);
    toast({ 
      title: isLiked ? "Unliked" : "Liked", 
      description: `Post ${isLiked ? 'unliked' : 'liked'}` 
    });
  };

  const handleCommentPost = (postId: string) => {
    toast({ title: "Comments", description: `Comments for post ${postId} will open here` });
  };

  const handleSharePost = (postId: string) => {
    navigator.clipboard.writeText(`Check out this design post: ${window.location.origin}/posts/${postId}`);
    toast({ title: "Shared", description: "Post link copied to clipboard" });
  };

  const handleLoadMore = () => {
    toast({ title: "Loading", description: "Loading more posts..." });
  };

  const handlePostClick = (postId: string) => {
    toast({ title: "Post Details", description: `Post ${postId} details will open here` });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="h-full bg-background overflow-auto modern-scroll">
      <BrandHeader 
        title="Community" 
        subtitle="Connect with fashion designers and creators"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setActiveTab('profile')}
          className="glass-effect border-border/20 min-h-[48px] min-w-[48px] rounded-2xl"
          aria-label="View profile"
        >
          <User className="w-5 h-5" />
        </Button>
      </BrandHeader>

      <div className="container mx-auto py-4 px-4 max-w-2xl">

        {/* Clean post creation */}
        <Card className="p-4 mb-6 animate-fade-in">
          <div className="flex gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gradient-to-r from-primary/20 to-secondary/20 text-xs">
                You
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Share your latest design or ask for feedback..."
                className="w-full h-16 p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200 text-sm"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleCreatePost}
                  disabled={!postContent.trim()}
                  size="sm"
                  className="h-8 px-4 text-xs"
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Clean posts feed */}
        <div className="space-y-4">
          {mockPosts.map((post, index) => (
            <Card key={post.id} onClick={() => handlePostClick(post.id)} className="p-4 cursor-pointer hover:shadow-md transition-all duration-200 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              {/* Post Header */}
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="w-8 h-8">
                  {post.user?.avatar ? (
                    <img src={post.user.avatar} alt={post.user.name} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-r from-primary/10 to-secondary/10 text-xs">
                      {post.user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{post.user?.name || 'Anonymous'}</h4>
                    {post.trending && (
                      <Badge className="bg-gradient-to-r from-primary to-secondary text-white text-xs px-2 py-0.5">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{formatTimeAgo(post.createdAt)}</p>
                </div>
              </div>

              {/* Post Content */}
              <p className="mb-3 text-sm">{post.content}</p>

              {/* Post Image */}
              {post.image && (
                <div className="mb-3 aspect-video bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg flex items-center justify-center content-frame">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg" />
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center gap-4 pt-3 border-t border-border/50">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => { e.stopPropagation(); handleLikePost(post.id); }}
                  className={cn(
                    "flex items-center gap-1.5 text-xs h-8 px-2 hover:-translate-y-0.5 transition-all duration-200",
                    post.isLiked ? 'text-red-500 feedback-bounce' : ''
                  )}
                >
                  <Heart className={cn("w-3 h-3", post.isLiked ? 'fill-current' : '')} />
                  {post.likes}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => { e.stopPropagation(); handleCommentPost(post.id); }}
                  className="flex items-center gap-1.5 text-xs h-8 px-2 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <MessageCircle className="w-3 h-3" />
                  {post.comments}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => { e.stopPropagation(); handleSharePost(post.id); }}
                  className="flex items-center gap-1.5 text-xs h-8 px-2 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Share2 className="w-3 h-3" />
                  Share
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-6">
          <Button variant="outline" onClick={handleLoadMore} className="hover:-translate-y-0.5 transition-all duration-200">
            Load More Posts
          </Button>
        </div>
      </div>
    </div>
  );
};