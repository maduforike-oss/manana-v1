/**
 * Product image selection helpers for Marketplace.
 * Ensures consistent, null-safe choice without hardcoded mock fallbacks.
 */

export type ProductLike = {
  id: string;
  name?: string | null;
  title?: string | null;
  // Common image shapes we see in the app:
  image_url?: string | null;         // single image field
  images?: string[] | { url?: string | null }[] | null;  // array of URLs or objects with url
  media?: { url?: string | null }[] | null;  // alt media array
  // Optional Supabase Storage path; caller should have resolved to public URL already.
  storage_path?: string | null;
};

export function firstNonEmpty(...vals: (string | null | undefined)[]): string | null {
  for (const v of vals) {
    if (typeof v === 'string' && v.trim().length > 0) return v.trim();
  }
  return null;
}

/**
 * Returns the primary image URL or null if none present.
 * Does NOT return hardcoded mock paths. Caller should render a placeholder when null.
 */
export function getPrimaryImageUrl(p: ProductLike): string | null {
  let arrayUrl: string | null = null;
  
  if (Array.isArray(p.images) && p.images.length > 0) {
    const firstImage = p.images[0];
    if (typeof firstImage === 'string') {
      arrayUrl = firstImage;
    } else if (firstImage && typeof firstImage === 'object' && 'url' in firstImage) {
      arrayUrl = firstImage.url || null;
    }
  }

  const mediaUrl =
    Array.isArray(p.media) && p.media.length > 0 && p.media[0]?.url
      ? p.media[0]!.url!
      : null;

  const chosen = firstNonEmpty(
    p.image_url,
    arrayUrl,
    mediaUrl,
    p.storage_path
  );

  // Reject any legacy mock paths explicitly
  if (chosen && chosen.includes('/mockups/')) return null;
  return chosen;
}