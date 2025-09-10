import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Globe, Users, Package, Crown } from 'lucide-react';
import { getProfileByUsername, getProfileMetrics } from '@/lib/profile';
import { SocialLinks } from '@/components/SocialLinks';

interface UserProfilePageProps {
  params: {
    username: string;
  };
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  // Remove @ from username if present
  const username = params.username.startsWith('@') ? params.username.slice(1) : params.username;
  
  try {
    const profile = await getProfileByUsername(username);
    
    if (!profile) {
      notFound();
    }

    const metrics = await getProfileMetrics(profile.id);

    // Check privacy preferences
    const preferences = profile.preferences || {};
    const showEmail = preferences.show_email !== false;
    const showSocials = preferences.show_socials !== false;
    const discoverable = preferences.discoverable !== false;

    if (!discoverable) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">
              {profile.display_name || profile.username || 'User Profile'}
            </h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Cover Photo */}
          <div className="relative h-48 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-lg mb-6">
            {profile.cover_url && (
              <img 
                src={profile.cover_url} 
                alt="Cover" 
                className="w-full h-full object-cover rounded-t-lg"
              />
            )}
          </div>

          {/* Profile Header */}
          <Card className="p-6 -mt-6 relative z-10">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar */}
              <Avatar className="w-24 h-24 border-4 border-background">
                {profile.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt={profile.display_name || profile.username || 'User'} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white text-xl font-bold">
                    {(profile.display_name || profile.username || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {profile.display_name || profile.username || 'Unnamed User'}
                    </h2>
                    {profile.username && (
                      <p className="text-muted-foreground">@{profile.username}</p>
                    )}
                    {profile.bio && (
                      <p className="text-sm mt-2 max-w-md">{profile.bio}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                      {profile.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {profile.location}
                        </div>
                      )}
                      {profile.website && (
                        <div className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          <a 
                            href={profile.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-primary"
                          >
                            Website
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Social Links */}
                    {showSocials && (
                      <div className="mt-3">
                        <SocialLinks 
                          links={[
                            profile.website && { platform: 'website' as const, url: profile.website },
                            profile.social_instagram && { platform: 'instagram' as const, url: `https://instagram.com/${profile.social_instagram}` },
                            profile.social_twitter && { platform: 'twitter' as const, url: `https://twitter.com/${profile.social_twitter}` },
                          ].filter(Boolean) as Array<{ platform: 'website' | 'instagram' | 'twitter' | 'linkedin'; url: string }>}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Badge className="bg-gradient-to-r from-primary to-secondary text-white">
                      <Crown className="w-3 h-3 mr-1" />
                      Designer
                    </Badge>
                    
                    <Button variant="outline" size="sm">
                      Follow
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
              <div className="text-center">
                <p className="text-2xl font-bold">{metrics?.total_designs || 0}</p>
                <p className="text-sm text-muted-foreground">Designs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{metrics?.followers || 0}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{metrics?.following || 0}</p>
                <p className="text-sm text-muted-foreground">Following</p>
              </div>
            </div>
          </Card>

          {/* Designs Section */}
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Recent Designs
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Placeholder for designs - would be populated from designs table */}
              <div className="text-center text-muted-foreground py-8">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No designs yet</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading profile:', error);
    notFound();
  }
}