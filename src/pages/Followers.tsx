"use client"

import { useState, useEffect } from "react";
import { ArrowLeft, UserPlus, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';

export default function FollowersPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setActiveTab, userProfiles, followedUsers, followUser, unfollowUser } = useAppStore();
  const [activeTab, setActiveTabLocal] = useState("followers");

  // Set initial tab from URL params and ensure profile tab is active
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'following') {
      setActiveTabLocal('following');
    } else {
      setActiveTabLocal('followers');
    }
    
    // Ensure profile tab is active in the bottom navigation
    setActiveTab('profile');
  }, [searchParams, setActiveTab]);

  // Get followers and following from store
  const followers = userProfiles.filter(profile => 
    followedUsers.includes(profile.id)
  );
  
  const following = userProfiles.filter(profile => 
    followedUsers.includes(profile.id)
  ).map(profile => ({
    ...profile,
    isFollowing: true
  }));

  // Add some mock followers who follow the current user
  const mockFollowers = [
    ...userProfiles.map(profile => ({
      ...profile,
      isFollowing: followedUsers.includes(profile.id),
      designCount: profile.totalDesigns
    }))
  ];

  const handleFollow = (userId: string) => {
    const isFollowing = followedUsers.includes(userId);
    if (isFollowing) {
      unfollowUser(userId);
    } else {
      followUser(userId);
    }
  };

  const handleUserClick = (userId: string) => {
    navigate(`/users/${userId}`);
  };

  const UserCard = ({ user }: { user: any }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleUserClick(user.id)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt={user.name} />
              ) : (
                <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white">
                  {user.name.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{user.name}</h3>
              <p className="text-xs text-muted-foreground">{user.username}</p>
              <div className="flex items-center gap-1 mt-1">
                <Users className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{user.designCount || user.totalDesigns} designs</span>
              </div>
            </div>
          </div>
          
          <Button
            variant={user.isFollowing ? "outline" : "default"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleFollow(user.id);
            }}
            className="text-xs"
          >
            {user.isFollowing ? "Following" : "Follow"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-6 px-4 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Connections</h1>
          <p className="text-sm text-muted-foreground">Manage your followers and following</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTabLocal} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="followers" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Followers ({mockFollowers.length})
          </TabsTrigger>
          <TabsTrigger value="following" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Following ({following.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="followers" className="space-y-3 mt-6">
          {mockFollowers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </TabsContent>

        <TabsContent value="following" className="space-y-3 mt-6">
          {following.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}