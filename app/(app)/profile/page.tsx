"use client"

import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
  // Local state for the form fields
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicURL, setProfilePicURL] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");

  // Handle image upload and preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePic(file);
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePicURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Placeholder save handler – replace with your actual persistence logic
  const handleSave = () => {
    console.log({ profilePic, phone, location, bio });
    // TODO: Persist these values using your chosen backend (e.g., Supabase, API call, etc.)
  };

  return (
    <div className="flex justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="space-y-4 p-6">
          {/* Profile picture and upload */}
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="h-24 w-24">
              {profilePicURL ? (
                <AvatarImage src={profilePicURL} alt="Profile picture" />
              ) : (
                <AvatarFallback>UV</AvatarFallback>
              )}
            </Avatar>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full"
            />
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter your location"
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself"
                className="h-32"
              />
            </div>
          </div>

          {/* Save button */}
          <Button onClick={handleSave} className="w-full">
            Save Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}