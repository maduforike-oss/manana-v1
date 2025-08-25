import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Design {
  id: string;
  name: string;
  garmentType: string;
  thumbnail: string;
  canvas: string; // JSON representation of canvas
  createdAt: Date;
  updatedAt: Date;
  creatorId?: string;
  likes: number;
  saves: number;
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  username: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: string;
  specialties: string[];
  plan: 'basic' | 'premium';
  designsThisMonth: number;
  maxDesigns: number;
  followers: number;
  following: number;
  totalDesigns: number;
  totalOrders: number;
  isFollowing?: boolean;
  socialLinks: Array<{
    platform: 'website' | 'instagram' | 'twitter' | 'linkedin';
    url: string;
  }>;
  featuredDesigns: Array<{
    id: string;
    name: string;
    thumbnail: string;
    garmentType: string;
    likes: number;
    views: number;
  }>;
}

export interface Post {
  id: string;
  userId: string;
  user: UserProfile;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
  createdAt: Date;
  trending?: boolean;
}

interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: string;
  specialties: string[];
  plan: 'basic' | 'premium';
  designsThisMonth: number;
  maxDesigns: number;
  followers: number;
  following: number;
  totalDesigns: number;
  totalOrders: number;
  socialLinks: Array<{
    platform: 'website' | 'instagram' | 'twitter' | 'linkedin';
    url: string;
  }>;
  featuredDesigns: Array<{
    id: string;
    name: string;
    thumbnail: string;
    garmentType: string;
    likes: number;
    views: number;
  }>;
}

interface AppState {
  // Auth & User
  user: User | null;
  isAuthenticated: boolean;
  
  // Navigation
  activeTab: 'market' | 'community' | 'studio' | 'orders' | 'profile';
  
  // Designs
  designs: Design[];
  currentDesign: Design | null;
  
  // Studio State
  selectedGarment: string | null;
  canvasState: any;
  
  // Social State
  userProfiles: UserProfile[];
  followedUsers: string[];
  likedDesigns: string[];
  savedDesigns: string[];
  likedPosts: string[];
  posts: Post[];
  
  setCurrentDesign: (design: Design | null) => void;
  // Actions
  setActiveTab: (tab: AppState['activeTab']) => void;
  setUser: (user: User | null) => void;
  createDesign: (garmentType: string) => boolean;
  saveDesign: (design: Partial<Design>) => void;
  loadDesign: (designId: string) => void;
  deleteDesign: (designId: string) => void;
  setSelectedGarment: (garment: string) => void;
  updateCanvasState: (state: any) => void;
  
  // Social Actions
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
  toggleLikeDesign: (designId: string) => void;
  toggleSaveDesign: (designId: string) => void;
  toggleLikePost: (postId: string) => void;
  getUserProfile: (userId: string) => UserProfile | null;
  createPost: (content: string, image?: string) => void;
  
  logout: () => void;
}

// Mock user profiles data
const mockUserProfiles: UserProfile[] = [
  {
    id: 'user_1',
    email: 'sarah@design.com',
    name: 'Sarah Design',
    username: '@sarahdesign',
    bio: 'Passionate about creating beautiful, sustainable fashion designs.',
    location: 'San Francisco, CA',
    website: 'sarahdesign.com',
    specialties: ['Minimalist', 'Sustainable', 'Print Design'],
    plan: 'premium',
    designsThisMonth: 12,
    maxDesigns: 100,
    followers: 1247,
    following: 189,
    totalDesigns: 42,
    totalOrders: 156,
    socialLinks: [
      { platform: 'instagram', url: 'https://instagram.com/sarahdesign' },
      { platform: 'website', url: 'https://sarahdesign.com' }
    ],
    featuredDesigns: [
      { id: 'design_1', name: 'Galaxy Hoodie', thumbnail: '', garmentType: 'hoodie', likes: 89, views: 342 },
      { id: 'design_2', name: 'Vintage Tee', thumbnail: '', garmentType: 't-shirt', likes: 67, views: 201 }
    ]
  },
  {
    id: 'user_2',
    email: 'mike@creative.com',
    name: 'Mike Creator',
    username: '@mikecreator',
    bio: 'Street art meets fashion. Creating bold, statement pieces.',
    location: 'New York, NY',
    specialties: ['Street Art', 'Bold Graphics', 'Urban Style'],
    plan: 'basic',
    designsThisMonth: 5,
    maxDesigns: 20,
    followers: 892,
    following: 245,
    totalDesigns: 38,
    totalOrders: 89,
    socialLinks: [
      { platform: 'instagram', url: 'https://instagram.com/mikecreator' }
    ],
    featuredDesigns: [
      { id: 'design_3', name: 'Urban Jacket', thumbnail: '', garmentType: 'jacket', likes: 124, views: 456 }
    ]
  },
  {
    id: 'user_3',
    email: 'emma@artist.com',
    name: 'Emma Artist',
    username: '@emmaartist',
    bio: 'Illustrator and designer focusing on nature-inspired artwork.',
    location: 'Portland, OR',
    specialties: ['Illustration', 'Nature', 'Hand-drawn'],
    plan: 'premium',
    designsThisMonth: 18,
    maxDesigns: 100,
    followers: 2103,
    following: 167,
    totalDesigns: 56,
    totalOrders: 234,
    socialLinks: [
      { platform: 'instagram', url: 'https://instagram.com/emmaartist' },
      { platform: 'website', url: 'https://emmaartist.com' }
    ],
    featuredDesigns: [
      { id: 'design_4', name: 'Forest Tee', thumbnail: '', garmentType: 't-shirt', likes: 156, views: 789 }
    ]
  }
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: {
        id: 'current_user',
        email: 'you@example.com',
        name: 'Your Name',
        username: '@yourname',
        bio: 'Designer and creator',
        specialties: ['Design', 'Creative'],
        plan: 'basic',
        designsThisMonth: 3,
        maxDesigns: 20,
        followers: 48,
        following: 23,
        totalDesigns: 8,
        totalOrders: 5,
        socialLinks: [],
        featuredDesigns: []
      },
      isAuthenticated: true,
      activeTab: 'studio',
      designs: [],
      currentDesign: null,
      selectedGarment: null,
      canvasState: null,
      
      // Social state
      userProfiles: mockUserProfiles,
      followedUsers: ['user_1', 'user_3'],
      likedDesigns: [],
      savedDesigns: [],
      likedPosts: [],
      posts: [],

      // Actions
      setCurrentDesign: (design) => set({ currentDesign: design }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      createDesign: (garmentType) => {
        const state = get();
        if (!state.user) return false;
        
        // Check design limits
        if (state.user.designsThisMonth >= state.user.maxDesigns) {
          return false;
        }
        
        const newDesign: Design = {
          id: `design_${Date.now()}`,
          name: `New ${garmentType} Design`,
          garmentType,
          thumbnail: '',
          canvas: '',
          createdAt: new Date(),
          updatedAt: new Date(),
          likes: 0,
          saves: 0,
        };
        
        set({
          designs: [...state.designs, newDesign],
          currentDesign: newDesign,
          selectedGarment: garmentType,
          user: {
            ...state.user,
            designsThisMonth: state.user.designsThisMonth + 1,
          },
        });
        
        return true;
      },
      
      saveDesign: (designData) => {
        const state = get();
        if (!state.currentDesign) return;
        
        const updatedDesign = {
          ...state.currentDesign,
          ...designData,
          updatedAt: new Date(),
        };
        
        set({
          currentDesign: updatedDesign,
          designs: state.designs.map(d => 
            d.id === updatedDesign.id ? updatedDesign : d
          ),
        });
      },
      
      loadDesign: (designId) => {
        const state = get();
        const design = state.designs.find(d => d.id === designId);
        if (design) {
          set({
            currentDesign: design,
            selectedGarment: design.garmentType,
            activeTab: 'studio',
          });
        }
      },
      
      deleteDesign: (designId) => {
        const state = get();
        set({
          designs: state.designs.filter(d => d.id !== designId),
          currentDesign: state.currentDesign?.id === designId ? null : state.currentDesign,
        });
      },
      
      setSelectedGarment: (garment) => set({ selectedGarment: garment }),
      
      updateCanvasState: (canvasState) => set({ canvasState }),
      
      // Social actions
      followUser: (userId) => {
        const state = get();
        if (!state.followedUsers.includes(userId)) {
          set({
            followedUsers: [...state.followedUsers, userId],
            userProfiles: state.userProfiles.map(profile => 
              profile.id === userId 
                ? { ...profile, followers: profile.followers + 1, isFollowing: true }
                : profile
            ),
            user: state.user ? { ...state.user, following: state.user.following + 1 } : null
          });
        }
      },
      
      unfollowUser: (userId) => {
        const state = get();
        if (state.followedUsers.includes(userId)) {
          set({
            followedUsers: state.followedUsers.filter(id => id !== userId),
            userProfiles: state.userProfiles.map(profile => 
              profile.id === userId 
                ? { ...profile, followers: profile.followers - 1, isFollowing: false }
                : profile
            ),
            user: state.user ? { ...state.user, following: state.user.following - 1 } : null
          });
        }
      },
      
      toggleLikeDesign: (designId) => {
        const state = get();
        const isLiked = state.likedDesigns.includes(designId);
        set({
          likedDesigns: isLiked 
            ? state.likedDesigns.filter(id => id !== designId)
            : [...state.likedDesigns, designId]
        });
      },
      
      toggleSaveDesign: (designId) => {
        const state = get();
        const isSaved = state.savedDesigns.includes(designId);
        set({
          savedDesigns: isSaved 
            ? state.savedDesigns.filter(id => id !== designId)
            : [...state.savedDesigns, designId]
        });
      },
      
      toggleLikePost: (postId) => {
        const state = get();
        const isLiked = state.likedPosts.includes(postId);
        set({
          likedPosts: isLiked 
            ? state.likedPosts.filter(id => id !== postId)
            : [...state.likedPosts, postId],
          posts: state.posts.map(post => 
            post.id === postId 
              ? { ...post, likes: isLiked ? post.likes - 1 : post.likes + 1, isLiked: !isLiked }
              : post
          )
        });
      },
      
      getUserProfile: (userId) => {
        const state = get();
        const profile = state.userProfiles.find(p => p.id === userId);
        if (profile) {
          return {
            ...profile,
            isFollowing: state.followedUsers.includes(userId)
          };
        }
        return null;
      },
      
      createPost: (content, image) => {
        const state = get();
        if (!state.user) return;
        
        const newPost: Post = {
          id: `post_${Date.now()}`,
          userId: state.user.id,
          user: state.user as UserProfile,
          content,
          image,
          likes: 0,
          comments: 0,
          shares: 0,
          isLiked: false,
          createdAt: new Date(),
          trending: false
        };
        
        set({
          posts: [newPost, ...state.posts]
        });
      },
      
      logout: () => set({ 
        user: null, 
        isAuthenticated: false, 
        designs: [], 
        currentDesign: null,
        followedUsers: [],
        likedDesigns: [],
        savedDesigns: [],
        likedPosts: [],
        posts: []
      }),
    }),
    {
      name: 'manana-app-store',
      partialize: (state) => ({
        user: state.user,
        designs: state.designs,
        activeTab: state.activeTab,
        followedUsers: state.followedUsers,
        likedDesigns: state.likedDesigns,
        savedDesigns: state.savedDesigns,
        likedPosts: state.likedPosts,
        posts: state.posts,
      }),
    }
  )
);