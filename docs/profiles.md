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

## Testing Checklist
- [ ] Profile creation on signup
- [ ] Profile editing and saving
- [ ] Avatar/cover upload functionality
- [ ] Username uniqueness validation
- [ ] Public profile viewing
- [ ] Privacy settings respect
- [ ] Error handling for all operations
- [ ] TypeScript compilation