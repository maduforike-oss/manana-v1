"use client"

import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Globe, Users, Heart, Bookmark, Grid, Calendar, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { UserProfile as UserProfileType } from '@/store/useAppStore';

export default function UserProfile() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { getUserProfile, followUser, unfollowUser, followedUsers } = useAppStore();
  const [user, setUser] = useState<UserProfileType | null>(null);

  useEffect(() => {
    if (userId) {
      const profile = getUserProfile(userId);
      setUser(profile);
    }
  }, [userId, getUserProfile, followedUsers]);

  if (!user) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">User Not Found</h1>
        </div>
      </div>
    );
  }

  const isFollowing = user.isFollowing;

  const handleFollowToggle = () => {
    if (isFollowing) {
      unfollowUser(user.id);
    } else {
      followUser(user.id);
    }
  };

  const mockDesigns = [
    { id: '1', name: 'Galaxy Hoodie', thumbnail: '', garmentType: 'hoodie', likes: 89, saves: 34 },
    { id: '2', name: 'Vintage Tee', thumbnail: '', garmentType: 't-shirt', likes: 67, saves: 23 },
    { id: '3', name: 'Urban Jacket', thumbnail: '', garmentType: 'jacket', likes: 124, saves: 56 },
    { id: '4', name: 'Minimalist Cap', thumbnail: '', garmentType: 'cap', likes: 45, saves: 18 },
  ];

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-sm text-muted-foreground">{user.username}</p>
        </div>
      </div>

      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="w-24 h-24 mb-4">
                {user.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.name} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white text-2xl">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <Button 
                onClick={handleFollowToggle}
                variant={isFollowing ? "outline" : "default"}
                className="w-full md:w-auto"
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            </div>

            <div className="flex-1">
              <div className="mb-4">
                <h2 className="text-2xl font-bold mb-2">{user.name}</h2>
                <p className="text-muted-foreground mb-3">{user.bio}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  {user.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {user.location}
                    </div>
                  )}
                  {user.website && (
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      <a href={`https://${user.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                        {user.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Designer since 2023
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {user.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary">{specialty}</Badge>
                  ))}
                  <Badge className="bg-gradient-to-r from-primary to-secondary text-white">
                    {user.plan === 'premium' ? 'Premium' : 'Basic'} Plan
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{user.followers}</div>
                    <div className="text-sm text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{user.following}</div>
                    <div className="text-sm text-muted-foreground">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{user.totalDesigns}</div>
                    <div className="text-sm text-muted-foreground">Designs</div>
                  </div>
                </div>
              </div>

              {user.socialLinks.length > 0 && (
                <div className="flex gap-2">
                  {user.socialLinks.map((link, index) => (
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
            Designs ({user.totalDesigns})
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