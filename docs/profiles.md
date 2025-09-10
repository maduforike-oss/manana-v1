# Professional Profiles Implementation Plan

## Current State Audit

### Existing Code
- ✅ Basic `lib/profile.ts` with getMyProfile(), updateMyProfile()
- ✅ `lib/supabaseClient.ts` with client setup
- ✅ Supabase connected with `public.profiles` table (id, username, avatar_url, created_at)
- ✅ Mock UI components: ProfilePage, ProfileSettings, UserProfile, ProfileTags, SocialLinks
- ✅ Auth trigger `handle_new_user()` creates profile on signup
- ✅ RLS policies: authenticated users can read profiles, owners can update own

### Gaps Identified
- ❌ Extended profile fields (bio, location, social links, etc.)
- ❌ Profile metrics table for followers/following/design counts
- ❌ Storage bucket and upload helpers for avatars/covers
- ❌ Username uniqueness constraints and availability checking
- ❌ Public profile routes (/u/[username])
- ❌ Real Supabase integration (currently using mocks)
- ❌ Error handling and type safety
- ❌ RPC functions for complex queries

## Implementation Steps

### 1. Database Schema Extensions
- Extend `public.profiles` with nullable fields:
  - display_name, bio, location, website
  - social_instagram, social_twitter, cover_url
  - preferences jsonb
- Add unique constraint on username (case-insensitive)
- Create `public.profile_metrics` table
- Create RPC function for username availability

### 2. Storage Setup
- Create `design-assets` bucket for avatars/covers
- Upload helpers with proper path structure
- Storage policies for user access

### 3. Client Libraries
- Expand `lib/profile.ts` with upload functions
- Create `lib/usernames.ts` for sanitization
- Create `lib/errors.ts` for centralized error handling
- Add TypeScript types for extended schema

### 4. UI Integration
- Wire existing ProfilePage to real Supabase data
- Add /u/[username] public profiles
- Functional avatar/cover upload in settings
- Username availability checking with debounce
- Replace all mock data with real queries

### 5. Authentication Flow
- Ensure signed-out users get login prompts
- Proper auth state management
- Redirect handling for protected routes

## File Structure
```
lib/
├── profile.ts (extended)
├── usernames.ts (new)
├── errors.ts (new)
└── supabaseClient.ts (existing)

pages/
├── profile/index.tsx (wire to real data)
├── u/[username].tsx (new public view)
└── settings/profile.tsx (functional uploads)

sql/
└── profile_extensions.sql (idempotent migrations)
```

## Implementation Summary

### ✅ Completed Features
- **Database Schema**: Extended profiles table with all required fields
- **Profile Metrics**: Separate table for followers/following/design counts
- **Storage Integration**: Avatar and cover photo uploads via Supabase Storage
- **Username System**: Case-insensitive uniqueness with real-time availability checking
- **Client Libraries**: Enhanced profile.ts, usernames.ts, errors.ts with type safety
- **UI Components**: Fully functional profile pages with real Supabase integration
- **Authentication**: Complete auth flow with magic links and password signin
- **Privacy Controls**: Preference system for profile visibility
- **Public Profiles**: Accessible via /u/[username] with privacy respect

### 🔧 Key Files Created/Updated
- `lib/profile.ts` - Extended with uploads, metrics, validation
- `lib/usernames.ts` - Username sanitization and validation
- `lib/errors.ts` - Centralized error handling
- `app/(app)/profile/page.tsx` - Real Supabase-powered profile page
- `app/(app)/u/[username]/page.tsx` - Public profile viewing
- `app/(app)/profile/settings/page.tsx` - Functional settings with uploads
- `app/(app)/auth/page.tsx` - Complete authentication flow
- `sql/profile_extensions.sql` - Idempotent database migrations

### 🧪 Testing Instructions
1. **Go to /auth** - Sign up with email/password or use magic link
2. **Visit /profile** - View your profile (will redirect to /auth if not signed in)
3. **Click Settings** - Edit profile info, upload avatar/cover, change username
4. **Test username availability** - Try different usernames to see real-time validation
5. **Save changes** - All updates persist to Supabase
6. **Visit /u/[your-username]** - View your public profile
7. **Test privacy settings** - Toggle visibility options in settings

### 🔐 Security Features
- Row-Level Security policies for profiles and metrics
- Storage policies for user-specific avatar/cover uploads
- Case-insensitive username uniqueness constraints
- Privacy preferences respected in public views
- Proper auth validation on all operations