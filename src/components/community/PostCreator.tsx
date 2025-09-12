import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  Camera, 
  Smile, 
  X, 
  Image as ImageIcon,
  Send,
  Loader2 
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createPost } from '@/lib/community';
import { toast } from 'sonner';

interface PostCreatorProps {
  onPostCreated?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  className?: string;
}

export const PostCreator: React.FC<PostCreatorProps> = ({
  onPostCreated,
  onCancel,
  placeholder = "What's on your mind?",
  className
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<Array<{ url: string; type: 'image' | 'video' }>>([]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Please write something before posting');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to create posts');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: postId, error } = await createPost(content);
      
      if (error) {
        toast.error(error);
        return;
      }

      if (postId) {
        // Reset form
        setContent('');
        setUploadedMedia([]);
        
        // Notify parent component
        onPostCreated?.();
        
        toast.success('Post created! 🎉');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const removeMedia = (index: number) => {
    setUploadedMedia(prev => prev.filter((_, i) => i !== index));
  };

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Please sign in to create posts
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20">
              {user.user_metadata?.display_name?.slice(0, 2)?.toUpperCase() || 
               user.email?.slice(0, 2)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium text-sm">
              {user.user_metadata?.display_name || user.email}
            </p>
            <p className="text-xs text-muted-foreground">
              Share something with the community
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Content Input */}
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[120px] resize-none border-0 px-0 text-base placeholder:text-muted-foreground/70 focus-visible:ring-0"
            maxLength={280}
            disabled={isSubmitting}
          />

          {/* Character Count */}
          <div className="flex justify-between items-center text-sm">
            <div className="text-muted-foreground">
              {content.length}/280
            </div>
            <div className="text-xs text-muted-foreground">
              Cmd/Ctrl + Enter to post
            </div>
          </div>

          {/* Media Preview */}
          {uploadedMedia.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {uploadedMedia.map((media, index) => (
                <div key={index} className="relative group">
                  <img
                    src={media.url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeMedia(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-foreground"
                disabled={isSubmitting}
              >
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline">Photo</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-foreground"
                disabled={isSubmitting}
              >
                <Smile className="h-4 w-4" />
                <span className="hidden sm:inline">Emoji</span>
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {onCancel && (
                <Button 
                  variant="ghost" 
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
              
              <Button 
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting}
                className="gap-2 min-w-[80px]"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};