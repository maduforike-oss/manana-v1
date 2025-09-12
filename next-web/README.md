# Manana Next.js Web App

This is the Next.js migration of the Manana fashion design platform, running alongside the existing React app.

## Getting Started

### Prerequisites

- Node.js 18+ 
- The existing React app should remain running on the default port

### Installation

1. Navigate to the Next.js app directory:
```bash
cd next-web
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.local.example .env.local
```

4. Update `.env.local` with your actual values if needed.

### Development

Start the Next.js development server:

```bash
npm run dev:next
```

The app will be available at [http://localhost:3100](http://localhost:3100)

### Build & Deploy

```bash
npm run build:next
npm run start:next
```

## Environment Variables

Required environment variables in `.env.local`:

```env
# Supabase Configuration (required)
NEXT_PUBLIC_SUPABASE_URL=https://ajnbtevgzhkilokflntj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Development auto sign-in (optional)
NEXT_PUBLIC_DEV_EMAIL=your_dev_email@example.com
NEXT_PUBLIC_DEV_PASSWORD=your_dev_password
```

## Migrated Routes

### ✅ Completed
- **`/`** - Homepage with navigation to other routes
- **`/login`** - Unified authentication (email/password + magic links)
- **`/profile`** - Profile editing with Supabase integration (requires auth)
- **`/u/[username]`** - Public profile view (SSR)
- **`/market`** - Design marketplace (public access)

### 🚧 Planned
- `/studio` - Design studio (requires auth)
- `/orders` - Order management (requires auth) 
- `/checkout` - Checkout flow (requires auth)
- Additional marketplace features
- User dashboard

## Features

### Authentication
- Email/password and magic link sign-in
- Supabase Auth integration
- Protected routes with redirect
- Dev auto sign-in (development only)

### Profile Management
- Complete profile editing
- Real-time username validation
- Avatar/cover image uploads
- Profile metrics (designs, followers, etc.)

### Guest Mode
- Public routes: Market, public profiles, homepage
- Protected routes redirect to `/login?redirect=<original>`

### Design System
- Tailwind CSS with design tokens
- Radix UI components
- Consistent with existing brand colors
- Mobile-optimized layouts

## Project Structure

```
next-web/
├── components/
│   ├── ui/              # Reusable UI components
│   └── lib/             # Utilities
├── lib/
│   ├── supabaseClient.ts # Supabase configuration
│   ├── profile.ts       # Profile management
│   ├── usernames.ts     # Username validation
│   ├── withAuth.tsx     # Auth HOC
│   └── devAuth.ts       # Dev auto sign-in
├── pages/
│   ├── _app.tsx         # App wrapper
│   ├── _document.tsx    # HTML document
│   ├── index.tsx        # Homepage
│   ├── login.tsx        # Authentication
│   ├── profile/
│   │   └── index.tsx    # Profile editing
│   ├── u/
│   │   └── [username].tsx # Public profiles (SSR)
│   └── market/
│       └── index.tsx    # Marketplace
└── styles/
    └── globals.css      # Global styles + design tokens
```

## Supabase Integration

The app uses the same Supabase project as the main React app:

- **Tables**: `profiles`, `profile_metrics`, `follows`, `orders`
- **Storage**: `avatars`, `covers` buckets
- **Auth**: Email/password + magic links
- **RLS**: Enabled on all tables with appropriate policies

## Development Notes

### Component Reuse Strategy
Components are initially copied from the main app to avoid path/config complexity. Future optimization could use:
- Shared component library
- TypeScript path mapping
- Symlinks (with caution)

### State Management
- Uses Zustand for client state (matches main app)
- Server state via Supabase directly (no complex caching yet)
- Form state via React hooks

### Routing
- Pages Router (not App Router) for simpler migration
- File-based routing
- SSR for public profiles
- Client-side routing for authenticated pages

## Testing Checklist

### Authentication Flow
- [ ] Visit `/login` - shows login form
- [ ] Email/password sign-in works
- [ ] Magic link sign-in works  
- [ ] Redirect after sign-in works
- [ ] Dev auto sign-in works (development only)

### Profile Management
- [ ] Visit `/profile` - redirects to login if not authenticated
- [ ] Profile form loads current data
- [ ] Profile edits save to Supabase
- [ ] Username validation works (debounced)
- [ ] Avatar upload works
- [ ] Changes persist after page reload

### Public Profiles
- [ ] Visit `/u/validusername` - shows profile
- [ ] Visit `/u/invalidusername` - shows 404
- [ ] SSR works (view source shows profile data)

### Market
- [ ] Visit `/market` - shows design grid
- [ ] Search filters work
- [ ] View mode toggle works
- [ ] No authentication required

### Guest Mode
- [ ] Public routes accessible without auth
- [ ] Protected routes redirect to login
- [ ] Redirect parameters preserved

## Migration Status

This Next.js app demonstrates the core architecture and key routes. The React app continues to run unchanged. Future work includes:

1. **Additional Routes**: Studio, Orders, Checkout
2. **Enhanced Market**: Real Supabase data, advanced filtering
3. **Performance**: Image optimization, caching, lazy loading  
4. **Features**: Design uploads, payments, social features
5. **Optimization**: Shared components, better state management

## Known Gaps

- Market uses mock data (needs Supabase designs table)
- No order management yet
- Studio editing not implemented
- Limited error handling
- No advanced caching strategy
- Image uploads could use optimization

The foundation is solid for continuing the migration incrementally.