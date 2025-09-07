import { MessageCircle, Heart, Share2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';

export const CommunityPage = () => {
  const { toast } = useToast();
  const { posts, likedPosts, toggleLikePost, createPost, userProfiles } = useAppStore();
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
    <div className="h-full bg-background overflow-auto">
      <div className="container mx-auto py-6 px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">Community</h1>
          <p className="text-muted-foreground">Connect with designers and share your creativity</p>
        </div>

        {/* Create Post */}
        <Card className="p-4 mb-6">
          <div className="flex gap-3">
            <Avatar>
              <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white">
                You
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Share your latest design or ask for feedback..."
                className="w-full h-20 p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleCreatePost}
                  disabled={!postContent.trim()}
                  size="sm"
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-6">
          {mockPosts.map((post) => (
            <Card key={post.id} onClick={() => handlePostClick(post.id)} className="p-6 cursor-pointer hover:shadow-md transition-shadow">
              {/* Post Header */}
              <div className="flex items-center gap-3 mb-4">
                <Avatar>
                  {post.user?.avatar ? (
                    <img src={post.user.avatar} alt={post.user.name} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-r from-primary/20 to-secondary/20">
                      {post.user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{post.user?.name || 'Anonymous'}</h4>
                    {post.trending && (
                      <Badge className="bg-gradient-to-r from-primary to-secondary text-white">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{formatTimeAgo(post.createdAt)}</p>
                </div>
              </div>

              {/* Post Content */}
              <p className="mb-4">{post.content}</p>

              {/* Post Image */}
              {post.image && (
                <div className="mb-4 aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-primary to-secondary rounded-lg opacity-50" />
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => { e.stopPropagation(); handleLikePost(post.id); }}
                  className={`flex items-center gap-2 ${post.isLiked ? 'text-red-500' : ''}`}
                >
                  <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                  {post.likes}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => { e.stopPropagation(); handleCommentPost(post.id); }}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  {post.comments}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => { e.stopPropagation(); handleSharePost(post.id); }}
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg" onClick={handleLoadMore}>
            Load More Posts
          </Button>
        </div>
      </div>
    </div>
  );
};