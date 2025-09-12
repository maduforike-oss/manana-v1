"use client"

import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Globe, Users, Heart, Bookmark, Grid, Calendar, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, useParams } from 'react-router-dom';
import { getProfileByUsername, getProfileMetrics, ExtendedProfile, ProfileMetrics } from '@/lib/profile';
import FollowButton from '@/components/profile/FollowButton';
import BackButton from '@/components/BackButton';
import { getErrorMessage } from '@/lib/errors';
import { useToast } from '@/hooks/use-toast';

export default function UserProfilePublic() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { username } = useParams();
  const [user, setUser] = useState<ExtendedProfile | null>(null);
  const [metrics, setMetrics] = useState<ProfileMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!username) {
        setError('No username provided');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const profile = await getProfileByUsername(username);
        if (!profile) {
          setError('User not found');
          setLoading(false);
          return;
        }

        // Check if profile is discoverable
        const preferences = profile.preferences as any || {};
        if (preferences.discoverable === false) {
          setError('This profile is not discoverable');
          setLoading(false);
          return;
        }

        setUser(profile);
        
        try {
          const profileMetrics = await getProfileMetrics(profile.id);
          setMetrics(profileMetrics);
        } catch (metricsError) {
          console.error('Error loading metrics:', metricsError);
          // Don't fail the whole page if metrics fail
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <BackButton fallback="/" />
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-32 mb-2"></div>
            <div className="h-4 bg-muted rounded w-24"></div>
          </div>
        </div>
        <div className="space-y-6">
          <Card className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-muted rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-6 bg-muted rounded w-1/3"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <BackButton fallback="/" />
          <h1 className="text-2xl font-bold">Profile Not Found</h1>
        </div>
        <Card className="p-6 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">User Not Available</h2>
              <p className="text-muted-foreground mb-4">
                {error || "The user you're looking for doesn't exist or hasn't set up their profile yet."}
              </p>
            </div>
            <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-primary to-secondary text-white">
              Back to Market
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const displayName = user.display_name || user.username || 'Anonymous User';
  const socialLinks = [
    ...(user.website ? [{ platform: 'Website', url: user.website }] : []),
    ...(user.social_instagram ? [{ platform: 'Instagram', url: `https://instagram.com/${user.social_instagram}` }] : []),
    ...(user.social_twitter ? [{ platform: 'Twitter', url: `https://twitter.com/${user.social_twitter}` }] : []),
  ];

  const mockDesigns = [
    { id: '1', name: 'Getting started...', thumbnail: '', garmentType: 'Create your first design', likes: 0, saves: 0 },
  ];

  // Check if we should show email and socials based on preferences
  const preferences = user.preferences as any || {};
  const showSocials = preferences.show_socials !== false; // Default to true
  const shouldShowSocialLinks = showSocials && socialLinks.length > 0;

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <BackButton fallback="/" />
        <div>
          <h1 className="text-2xl font-bold">{displayName}</h1>
          {user.username && <p className="text-sm text-muted-foreground">@{user.username}</p>}
        </div>
      </div>

      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          {/* Cover Photo */}
          {user.cover_url && (
            <div className="relative h-32 sm:h-40 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg mb-6 overflow-hidden">
              <img 
                src={user.cover_url} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src={user.avatar_url || undefined} alt={displayName} />
                <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white text-2xl">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <FollowButton targetUserId={user.id} />
            </div>

            <div className="flex-1">
              <div className="mb-4">
                <h2 className="text-2xl font-bold mb-2">{displayName}</h2>
                {user.bio && <p className="text-muted-foreground mb-3">{user.bio}</p>}
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  {user.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {user.location}
                    </div>
                  )}
                  {user.website && shouldShowSocialLinks && (
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      <a href={user.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                        Portfolio
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Member since {new Date(user.created_at).getFullYear()}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">Designer</Badge>
                  <Badge className="bg-gradient-to-r from-primary to-secondary text-white">
                    Basic Plan
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{metrics?.followers || 0}</div>
                    <div className="text-sm text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{metrics?.following || 0}</div>
                    <div className="text-sm text-muted-foreground">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{metrics?.total_designs || 0}</div>
                    <div className="text-sm text-muted-foreground">Designs</div>
                  </div>
                </div>
              </div>

              {shouldShowSocialLinks && (
                <div className="flex gap-2">
                  {socialLinks.map((link, index) => (
                    <Button key={index} variant="outline" size="sm" asChild>
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        {link.platform}
                      </a>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="designs" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="designs" className="flex items-center gap-2">
            <Grid className="w-4 h-4" />
            Designs ({metrics?.total_designs || 0})
          </TabsTrigger>
          <TabsTrigger value="liked" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Liked
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <Bookmark className="w-4 h-4" />
            Collections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="designs" className="mt-6">
          {(metrics?.total_designs || 0) > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockDesigns.map((design) => (
                <Card key={design.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-lg opacity-50" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1">{design.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2 capitalize">{design.garmentType}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {design.likes}
                      </div>
                      <div className="flex items-center gap-1">
                        <Bookmark className="w-4 h-4" />
                        {design.saves}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Grid className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No designs yet</h3>
              <p className="text-muted-foreground">{displayName} hasn't created any designs yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="liked" className="mt-6">
          <div className="text-center py-12">
            <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No liked designs yet</h3>
            <p className="text-muted-foreground">Designs this user has liked will appear here</p>
          </div>
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          <div className="text-center py-12">
            <Bookmark className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No collections yet</h3>
            <p className="text-muted-foreground">Saved design collections will appear here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}