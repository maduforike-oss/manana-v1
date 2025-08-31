export type StyleKey =
  | "minimalist"
  | "vintage"
  | "modern"
  | "grunge"
  | "elegant"
  | "playful"
  | "streetwear"
  | "sporty"
  | "bohemian"
  | "art-deco"
  | "futuristic";

/**
 * Canonical style phrases that get injected into the AI prompt.
 * Keep these short, descriptive, and photography/visual-style focused.
 */
export const STYLE_PROMPTS: Record<StyleKey, string> = {
  minimalist:
    "clean, simple, neutral look with minimal patterns, soft studio lighting",
  vintage:
    "retro, slightly faded tones with classic details, subtle film feel",
  modern:
    "contemporary, crisp lines, balanced contrast, neutral studio setup",
  grunge:
    "distressed, textured, rough finish with muted tones and worn-in feel",
  elegant:
    "refined, high-end finish with gentle highlights and tasteful detailing",
  playful:
    "lively, upbeat tone with friendly contours and balanced saturation",
  streetwear:
    "urban, bold attitude with graphic-ready flat lighting and solid silhouette",
  sporty:
    "athletic, dynamic contours with performance fabric look and punchy contrast",
  bohemian:
    "natural, organic textures with relaxed drape and earthy tonal balance",
  "art-deco":
    "geometric, bold symmetry influence, crisp edges and polished finish",
  futuristic:
    "sleek, high-tech finish with clean specular highlights and minimal noise",
};

/**
 * Common synonyms → canonical StyleKey.
 * Extend this as your users invent new words.
 */
const STYLE_SYNONYMS: Record<string, StyleKey> = {
  // minimalist
  clean: "minimalist",
  simple: "minimalist",
  minimal: "minimalist",
  // vintage
  retro: "vintage",
  classic: "vintage",
  heritage: "vintage",
  // modern
  contemporary: "modern",
  current: "modern",
  // grunge
  distressed: "grunge",
  rugged: "grunge",
  raw: "grunge",
  // elegant
  luxury: "elegant",
  classy: "elegant",
  refined: "elegant",
  premium: "elegant",
  // playful
  fun: "playful",
  lively: "playful",
  // streetwear
  urban: "streetwear",
  hype: "streetwear",
  edgy: "streetwear",
  // sporty
  athletic: "sporty",
  performance: "sporty",
  // bohemian
  boho: "bohemian",
  organic: "bohemian",
  // art-deco
  artdeco: "art-deco",
  deco: "art-deco",
  // futuristic
  "hi-tech": "futuristic",
  hitech: "futuristic",
  "sci-fi": "futuristic",
  scifi: "futuristic",
};

/**
 * Normalize any free-text style into a safe StyleKey.
 * Defaults to "modern" if nothing matches.
 */
export function normalizeStyle(input?: string | null): StyleKey {
  if (!input) return "modern";
  const s = String(input).trim().toLowerCase();
  if ((Object.keys(STYLE_PROMPTS) as StyleKey[]).includes(s as StyleKey)) {
    return s as StyleKey;
  }
  // try synonyms
  const compact = s.replace(/\s+/g, "-");
  if (STYLE_SYNONYMS[s]) return STYLE_SYNONYMS[s];
  if (STYLE_SYNONYMS[compact]) return STYLE_SYNONYMS[compact];
  // fallback
  return "modern";
}