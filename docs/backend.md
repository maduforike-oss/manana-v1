# Backend System Documentation

## Overview

This document outlines the comprehensive backend system for the Mañana marketplace, including database schema, API helpers, and service integrations.

## Database Schema

### Core Catalog Tables

#### categories
- **Purpose**: Product categorization and navigation
- **Key Fields**: id, name, slug, parent_id (for hierarchical categories)
- **RLS**: Public read access for catalog browsing

#### products
- **Purpose**: Main product catalog
- **Key Fields**: id, name, slug, description, base_price, category_id, status
- **Status Values**: 'active', 'draft', 'archived'
- **RLS**: Public read access for active products

#### product_variants
- **Purpose**: Product size/color/price variations
- **Key Fields**: id, product_id, sku, price, size, color, stock_quantity
- **RLS**: Public read access for inventory checking

#### product_images
- **Purpose**: Product photography and media
- **Key Fields**: id, product_id, variant_id, url, display_order, alt_text
- **Storage**: URLs point to Supabase storage bucket 'design-assets'
- **RLS**: Public read access for catalog display

### Social & User Experience

#### product_reviews
- **Purpose**: Customer feedback and ratings
- **Key Fields**: id, product_id, user_id, rating (1-5), review_text, verified_purchase
- **RLS**: Public read, authenticated write, owner update/delete

#### wishlists
- **Purpose**: User product favorites
- **Key Fields**: id, user_id, product_id
- **RLS**: Owner-only access (user can only see/modify their wishlist)

#### recently_viewed
- **Purpose**: Browse history tracking
- **Key Fields**: id, user_id, session_id, product_id, viewed_at
- **RLS**: Owner or session-based access

### Inventory & Operations

#### inventory_movements
- **Purpose**: Stock level change tracking
- **Key Fields**: id, variant_id, movement_type, quantity, reason
- **Movement Types**: 'add', 'remove', 'order', 'cancel', 'adjust'
- **RLS**: Read-only for users (admin write access needed)

#### pricing_history
- **Purpose**: Price change auditing
- **Key Fields**: id, variant_id, old_price, new_price, effective_from
- **RLS**: Public read access for price history display

#### stock_alerts
- **Purpose**: Low inventory notifications
- **Key Fields**: id, variant_id, threshold, notification_sent
- **RLS**: Read-only for users

### Analytics

#### product_analytics
- **Purpose**: Product performance metrics
- **Key Fields**: id, product_id, views, clicks, conversions, day
- **Unique Constraint**: (product_id, day) for daily aggregation
- **RLS**: Public read access

#### search_analytics
- **Purpose**: Search query analysis
- **Key Fields**: id, query, results_count, user_id
- **RLS**: User can view their searches or anonymous data

## API Helper Methods

### Products API (`src/lib/api/products.ts`)

```typescript
// Core product operations
listProducts(params?: ProductListParams): Promise<Product[]>
getProduct(identifier: string): Promise<ProductWithDetails | null>
listVariants(productId: string): Promise<ProductVariant[]>
listCategories(): Promise<Category[]>
searchProducts(query: string, filters?: object): Promise<SearchResult>
```

### Inventory API (`src/lib/api/inventory.ts`)

```typescript
// Stock management
getStock(variantId: string): Promise<StockLevel | null>
recordMovement(variantId: string, movement: MovementData): Promise<InventoryMovement>
checkStockAvailability(variantId: string, quantity: number): Promise<boolean>
getLowStockAlerts(): Promise<StockAlert[]>
```

### Reviews API (`src/lib/api/reviews.ts`)

```typescript
// Review system
listReviews(productId: string, limit?: number): Promise<ProductReview[]>
addReview(productId: string, reviewData: CreateReviewParams): Promise<ProductReview>
getReviewSummary(productId: string): Promise<ReviewSummary>
markReviewHelpful(reviewId: string): Promise<void>
```

### Wishlist API (`src/lib/api/wishlist.ts`)

```typescript
// User favorites
isWished(productId: string): Promise<boolean>
add(productId: string): Promise<WishlistItem>
remove(productId: string): Promise<void>
listMine(limit?: number): Promise<WishlistItem[]>
toggle(productId: string): Promise<boolean>
```

### Analytics API (`src/lib/api/analytics.ts`)

```typescript
// Usage tracking
trackProductView(productId: string): Promise<void>
trackProductClick(productId: string): Promise<void>
trackSearch(query: string, resultsCount: number): Promise<void>
getProductAnalytics(productId: string): Promise<ProductAnalytics[]>
getTrendingProducts(limit?: number): Promise<TrendingProduct[]>
```

## Service Integrations (Stubs)

### Stripe Payments (`src/lib/payments/stripe.ts`)

**Current Status**: Stub implementation with test data

**Key Functions**:
- `beginCheckout(params: CheckoutParams)`: Creates fake checkout session
- `getCheckoutSession(sessionId: string)`: Returns stub session data
- `processWebhookEvent(event: any)`: Logs webhook events

**TODO**: 
- Implement actual Stripe integration via edge function
- Add webhook signature validation
- Handle real payment processing

### Shipping Rates (`src/lib/shipping/rates.ts`)

**Current Status**: Zone-based flat rate calculation

**Key Functions**:
- `calculateShippingRates(address: ShippingAddress)`: Returns zone-based rates
- `validateShippingAddress(address: ShippingAddress)`: Basic validation
- `trackPackage(trackingNumber: string)`: Returns fake tracking data

**Shipping Zones**:
- **Domestic (US)**: $5.99 standard, $12.99 expedited, $24.99 overnight
- **International**: $19.99 standard, $39.99 express

**TODO**:
- Integrate with FedEx, UPS, USPS APIs
- Real-time rate calculation
- Dimensional weight pricing
- Address validation service

### Email Notifications (`src/lib/email/notify.ts`)

**Current Status**: Console logging with HTML template generation

**Key Functions**:
- `sendOrderConfirmation(data: OrderData)`: Order receipt email
- `sendShippingNotification(data: ShippingData)`: Tracking info email
- `sendPasswordReset(email: string, resetUrl: string)`: Auth emails
- `sendWelcomeEmail(email: string, name?: string)`: Onboarding

**TODO**:
- Integrate with Resend/Postmark/SendGrid
- Email template management system
- Delivery tracking and bounce handling

## Row Level Security (RLS) Policies

### Public Access Tables
- `categories`, `products`, `product_variants`, `product_images`: Full public read
- `product_reviews`: Public read, authenticated write
- `product_analytics`, `pricing_history`: Public read

### User-Scoped Tables
- `wishlists`: Owner-only access via `auth.uid() = user_id`
- `recently_viewed`: Owner or session-based access
- `search_analytics`: User can view own searches

### Admin-Restricted Tables
- `inventory_movements`: Read-only for users, admin write
- `stock_alerts`: Read-only for users

## Storage Configuration

### Bucket: 'design-assets'
- **Purpose**: Product images and design files
- **Access**: Public read for product catalog display
- **Usage**: `product_images.url` should reference files in this bucket

## Demo Data Seeding

The migration includes sample data:
- 4 categories (T-Shirts, Hoodies, Accessories, Bottoms)
- 5 products with variants and images
- Proper relationships and stock levels

## Development Checklist

### Testing Products API
```bash
# List products
curl /api/products

# Get specific product
curl /api/products/classic-t-shirt

# Search products
curl /api/products/search?q=shirt&category=t-shirts
```

### Testing Wishlist (Authenticated)
```bash
# Add to wishlist
POST /api/wishlist { "product_id": "..." }

# Check if wishlisted
GET /api/wishlist/check/product-id

# List user wishlist
GET /api/wishlist
```

### Testing Reviews
```bash
# Add review (authenticated)
POST /api/reviews { "product_id": "...", "rating": 5, "comment": "Great!" }

# Get product reviews
GET /api/reviews/product-id

# Get review summary
GET /api/reviews/product-id/summary
```

### Testing Analytics
```bash
# Track product view
POST /api/analytics/view { "product_id": "..." }

# Track search
POST /api/analytics/search { "query": "shirt", "results_count": 25 }

# Get trending products
GET /api/analytics/trending
```

## Security Considerations

1. **RLS Enforcement**: All tables have appropriate policies
2. **Input Validation**: API helpers include error handling
3. **Rate Limiting**: TODO - implement for analytics endpoints
4. **Data Sanitization**: TODO - add input sanitization
5. **Authentication**: Uses Supabase auth.uid() for user identification

## Performance Optimizations

1. **Indexes**: Added on frequently queried columns
2. **Pagination**: Implemented in list functions
3. **Caching**: TODO - add Redis for frequently accessed data
4. **Image Optimization**: TODO - implement image resizing

## Monitoring & Observability

**Current**: Console logging in stub implementations
**TODO**: 
- Structured logging with correlation IDs
- Error tracking (Sentry integration)
- Performance monitoring
- Business metrics dashboard

## Migration Strategy

1. **Database**: Idempotent migrations ensure safe re-runs
2. **API Compatibility**: Maintain backwards compatibility
3. **Feature Flags**: TODO - implement for gradual rollouts
4. **Testing**: TODO - add comprehensive test suite

## Support & Maintenance

- **Documentation**: This file + inline code comments
- **Error Handling**: All API helpers include try/catch with logging
- **Versioning**: TODO - API versioning strategy
- **Backup**: Supabase automatic backups enabled