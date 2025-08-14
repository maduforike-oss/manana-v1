"use client"

import { useState } from "react";
import { ArrowLeft, UserPlus, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';

export default function FollowersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("followers");

  // Mock data for followers and following
  const mockFollowers = [
    { id: 1, name: "Sarah Design", username: "@sarahdesign", avatar: null, isFollowing: true, designCount: 42 },
    { id: 2, name: "Mike Creator", username: "@mikecreator", avatar: null, isFollowing: false, designCount: 38 },
    { id: 3, name: "Emma Artist", username: "@emmaartist", avatar: null, isFollowing: true, designCount: 56 },
    { id: 4, name: "David Style", username: "@davidstyle", avatar: null, isFollowing: true, designCount: 29 },
    { id: 5, name: "Lisa Fashion", username: "@lisafashion", avatar: null, isFollowing: false, designCount: 73 },
  ];

  const mockFollowing = [
    { id: 6, name: "John Designer", username: "@johndesigner", avatar: null, isFollowing: true, designCount: 91 },
    { id: 7, name: "Amy Creative", username: "@amycreative", avatar: null, isFollowing: true, designCount: 47 },
    { id: 8, name: "Tom Artist", username: "@tomartist", avatar: null, isFollowing: true, designCount: 62 },
    { id: 9, name: "Kate Style", username: "@katestyle", avatar: null, isFollowing: true, designCount: 35 },
  ];

  const handleFollow = (userId: number) => {
    console.log(`Toggle follow for user ${userId}`);
    // TODO: Implement follow/unfollow logic
  };

  const handleUserClick = (userId: number) => {
    console.log(`Navigate to user ${userId} profile`);
    // TODO: Navigate to user profile page
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
                <span className="text-xs text-muted-foreground">{user.designCount} designs</span>
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
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Connections</h1>
          <p className="text-sm text-muted-foreground">Manage your followers and following</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="followers" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Followers ({mockFollowers.length})
          </TabsTrigger>
          <TabsTrigger value="following" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Following ({mockFollowing.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="followers" className="space-y-3 mt-6">
          {mockFollowers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </TabsContent>

        <TabsContent value="following" className="space-y-3 mt-6">
          {mockFollowing.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}