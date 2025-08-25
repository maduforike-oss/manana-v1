import { MessageCircle, Heart, Share2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export const CommunityPage = () => {
  const { toast } = useToast();
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  
  const mockPosts = [
    {
      id: 1,
      user: 'Sarah Design',
      avatar: 'SD',
      time: '2 hours ago',
      content: 'Just finished this amazing galaxy-themed hoodie design! What do you think?',
      image: true,
      likes: 45,
      comments: 12,
      trending: true,
    },
    {
      id: 2,
      user: 'Mike Creative',
      avatar: 'MC',
      time: '4 hours ago',
      content: 'Tips for creating vintage-style t-shirt designs? Looking for some inspiration!',
      image: false,
      likes: 23,
      comments: 8,
      trending: false,
    },
    {
      id: 3,
      user: 'Anna Studio',
      avatar: 'AS',
      time: '6 hours ago',
      content: 'My minimalist cap collection is now live in the market! Check it out 🧢',
      image: true,
      likes: 67,
      comments: 15,
      trending: true,
    },
  ];

  const handleCreatePost = () => {
    toast({ title: "Create Post", description: "Post creation dialog will open here" });
  };

  const handleLikePost = (postId: number) => {
    setLikedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
    toast({ 
      title: likedPosts.includes(postId) ? "Unliked" : "Liked", 
      description: `Post ${likedPosts.includes(postId) ? 'unliked' : 'liked'}` 
    });
  };

  const handleCommentPost = (postId: number) => {
    toast({ title: "Comments", description: `Comments for post ${postId} will open here` });
  };

  const handleSharePost = (postId: number) => {
    toast({ title: "Shared", description: "Post shared to clipboard" });
  };

  const handleLoadMore = () => {
    toast({ title: "Loading", description: "Loading more posts..." });
  };

  const handlePostClick = (postId: number) => {
    toast({ title: "Post Details", description: `Post ${postId} details will open here` });
  };

  return (
    <div className="h-full bg-background overflow-auto">
      <div className="container mx-auto py-6 px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Community</h1>
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
            <div className="flex-1">
              <Button 
                variant="outline" 
                onClick={handleCreatePost}
                className="w-full justify-start text-muted-foreground h-12"
              >
                Share your latest design or ask for feedback...
              </Button>
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
                  <AvatarFallback className="bg-gradient-to-r from-primary/20 to-secondary/20">
                    {post.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{post.user}</h4>
                    {post.trending && (
                      <Badge className="bg-gradient-to-r from-primary to-secondary text-white">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{post.time}</p>
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
                  className={`flex items-center gap-2 ${likedPosts.includes(post.id) ? 'text-red-500' : ''}`}
                >
                  <Heart className={`w-4 h-4 ${likedPosts.includes(post.id) ? 'fill-current' : ''}`} />
                  {post.likes + (likedPosts.includes(post.id) ? 1 : 0)}
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