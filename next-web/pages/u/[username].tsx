import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import { getProfileByUsername, getProfileMetrics, type Profile, type ProfileMetrics } from '../../lib/profile';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { User, MapPin, Globe, Calendar, Heart, Users, Palette } from 'lucide-react';

interface PublicProfilePageProps {
  profile: Profile | null;
  metrics: ProfileMetrics | null;
  username: string;
}

export default function PublicProfilePage({ profile, metrics, username }: PublicProfilePageProps) {
  const router = useRouter();

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center p-8">
            <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The user @{username} doesn't exist or hasn't set up their profile yet.
            </p>
            <Button onClick={() => router.push('/')} variant="outline">
              ← Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const joinDate = profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  }) : 'Recently';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => router.push('/')}>
              ← Back
            </Button>
          </div>

          {/* Profile Header */}
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={`${profile.display_name || profile.username}'s avatar`} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-16 h-16 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold">{profile.display_name || profile.username}</h1>
                    {profile.display_name && profile.username && (
                      <p className="text-lg text-muted-foreground">@{profile.username}</p>
                    )}
                  </div>

                  {profile.bio && (
                    <p className="text-base leading-relaxed">{profile.bio}</p>
                  )}

                  {/* Location & Website */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {profile.website && (
                      <div className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        <a 
                          href={profile.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-primary underline"
                        >
                          Portfolio
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {joinDate}</span>
                    </div>
                  </div>

                  {/* Social Links */}
                  {(profile.social_twitter || profile.social_instagram) && (
                    <div className="flex gap-2">
                      {profile.social_twitter && (
                        <Button variant="outline" size="sm" asChild>
                          <a 
                            href={`https://twitter.com/${profile.social_twitter}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            Twitter
                          </a>
                        </Button>
                      )}
                      {profile.social_instagram && (
                        <Button variant="outline" size="sm" asChild>
                          <a 
                            href={`https://instagram.com/${profile.social_instagram}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            Instagram
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Palette className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{metrics?.total_designs || 0}</p>
                <p className="text-sm text-muted-foreground">Designs</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-secondary mx-auto mb-2" />
                <p className="text-2xl font-bold">{metrics?.followers || 0}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{metrics?.following || 0}</p>
                <p className="text-sm text-muted-foreground">Following</p>
              </CardContent>
            </Card>
          </div>

          {/* Designs Section Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Designs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Palette className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No designs yet</h3>
                <p className="text-muted-foreground">
                  {profile.display_name || profile.username} hasn't shared any designs yet.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { username } = context.params!;
  
  try {
    const profile = await getProfileByUsername(username as string);
    
    if (!profile) {
      return {
        props: {
          profile: null,
          metrics: null,
          username
        }
      };
    }

    const metrics = await getProfileMetrics(profile.id);

    return {
      props: {
        profile,
        metrics,
        username
      }
    };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return {
      props: {
        profile: null,
        metrics: null,
        username
      }
    };
  }
};